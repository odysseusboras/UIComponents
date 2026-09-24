import { UiEmptyDirective } from './ui-empty.directive';
import {
  AfterContentInit, Component, DestroyRef, NgZone, OnInit, TemplateRef, booleanAttribute,
  computed, contentChild, contentChildren, effect, inject, input, output, signal, untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UI_GRID_FILTER, UI_REFRESH, UiTranslatePipe, andClauses, trackPointerDrag, uiStorage } from '@borassoft/ui-components';
import { OdataSource, PageQuery, SortDirection } from '../odata/odata-source';
import { UiSharedPagerComponent } from '../pager/ui-shared-pager.component';
import { UiSharedGridColumnComponent } from '../grid-column/ui-shared-grid-column.component';

/**
 * Reusable table view. Columns are declared by projecting
 * <ui-shared-grid-column> children.
 *
 * USER STATE PERSISTED IN LOCALSTORAGE (when [storageKey] is set):
 *   - column WIDTH  per column key (px), set by dragging the right edge
 *     of each header.
 *   - column ORDER, set by dragging a header onto another.
 *   - the current VIEW: applied filter values, page and page size, so a reload
 *     (or coming back to the page) lands on what the user was looking at.
 * All three are restored on init so a logged-in user gets their layout and
 * their view back across sessions. State lives at:
 *     app.coreGrid.<storageKey>.widths   ->  { [key]: number }
 *     app.coreGrid.<storageKey>.order    ->  string[]   (column keys)
 *     app.coreGrid.<storageKey>.view     ->  { page, pageSize, filters: unknown[] }
 *     app.coreGrid.<storageKey>.settings ->  { hidden: string[], pagerTop: boolean }
 *   (hidden columns + "pager above the table", picked in the header gear menu).
 *
 * Sort: clicking a sortable header label cycles none -> asc -> desc -> none.
 * Sort or page-size changes reset to page 1.
 */
@Component({
  selector: 'ui-shared-grid',
  standalone: true,
  imports: [
    UiEmptyDirective,
    CommonModule,
    MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, MatCheckboxModule,
    MatSlideToggleModule, MatDividerModule, MatProgressSpinnerModule, UiTranslatePipe, UiSharedPagerComponent,
  ],
  templateUrl: './ui-shared-grid.component.html',
  styleUrl: './ui-shared-grid.component.scss',
})
export class UiSharedGridComponent<T> implements OnInit, AfterContentInit {
  source = input.required<OdataSource<T>>();
  emptyKey = input<string>('core.grid.empty');
  initialPageSize = input<number>(20);
  pageSizeOptions = input<number[]>([10, 20, 50, 100]);

  /** Default sort applied on first load. Matches an OData PascalCase field name. */
  initialSortField = input<string | undefined>(undefined);
  /** Default sort direction. Defaults to 'asc' when initialSortField is set. */
  initialSortDir = input<SortDirection>('asc');

  /**
   * Optional storage key — when set, the grid persists per-column widths and
   * order to localStorage so the user's layout is restored across sessions.
   * Pick something unique-per-grid like "admin-companies" / "tenant-contracted".
   */
  storageKey = input<string | undefined>(undefined);

  /**
   * When true, the grid renders a leading checkbox column (header = select-all
   * on the current page, per-row = select that row) and a bulk-action bar above
   * the table. Project a <ng-template #bulkActions let-rows> to fill the bar;
   * `rows` is the array of currently-selected rows. Selection is per-page and
   * clears on every fetch (page / filter / sort change or refresh()).
   */
  selectable = input(false, { transform: booleanAttribute });
  /**
   * Rows a fetched page starts with ticked (only with `selectable`): every row the predicate
   * accepts is selected as soon as the page arrives. `[preselect]="r => r.status === 'Valid'"`.
   */
  preselect = input<((row: T) => boolean) | null>(null);

  /**
   * When set, the grid reloads its CURRENT page (filters/sort/paging untouched)
   * every time a SignalR `gridRefresh` signal with a matching key arrives — e.g.
   * "Invoices" so the documents grid updates when a background submit completes.
   */
  refreshKey = input<string | undefined>(undefined);

  /** Min / max column width in px when the user drags the resize handle. */
  protected readonly minColWidth = 60;
  protected readonly maxColWidth = 800;

  protected columns = contentChildren(UiSharedGridColumnComponent);

  /** Projected inputs acting as filters (ui-shared-text-input / -select / -segmented). */
  private filters = contentChildren(UI_GRID_FILTER);
  protected hasFilters = computed(() => this.filters().length > 0);
  /** Any filter currently applied — shows the Clear button. */
  protected hasActiveFilters = computed(() => this.filters().some(f => f.isApplied()));

  protected actionsTemplate = contentChild('actions', { read: TemplateRef });
  protected bulkActionsTemplate = contentChild('bulkActions', { read: TemplateRef });
  /**
   * Master-detail: project `<ng-template #detail let-row>` and every row gets a leading
   * expand arrow that opens the template under it (one row's detail at a time per click,
   * several may stay open). Expansion clears on every fetch.
   */
  protected detailTemplate = contentChild('detail', { read: TemplateRef });
  protected expanded = signal<Set<T>>(new Set());
  protected isExpanded(row: T): boolean { return this.expanded().has(row); }
  protected toggleExpanded(row: T): void {
    this.expanded.update(s => { const n = new Set(s); n.has(row) ? n.delete(row) : n.add(row); return n; });
  }
  /** Columns a detail row spans: arrow + checkbox + visible + actions. */
  protected detailSpan = computed(() => 1 + (this.selectable() ? 1 : 0) + this.visibleColumns().length + 1);

  /** Rows are clickable (→ {@link rowClick}) only when the grid declares a per-row
   *  action menu (open/edit). Clicks on the checkbox or actions cell don't count. */
  protected interactive = computed(() => !!this.actionsTemplate());

  /** Emitted when an interactive row is clicked — wire it to open the detail
   *  page / side panel for that row. */
  rowClick = output<T>();

  /** Enter on the focused ROW opens it; Enter inside a cell control (checkbox, ⋮ menu) must not. */
  protected onRowKeyEnter(ev: Event, row: T): void {
    if (this.interactive() && ev.target === ev.currentTarget) this.rowClick.emit(row);
  }

  protected rows = signal<T[]>([]);
  protected total = signal(0);
  protected loading = signal(false);
  /** False until the first fetch resolves — the only time the spinner replaces the table. */
  protected loaded = signal(false);

  protected selected = signal<T[]>([]);

  protected page = signal(1);
  protected pageSize = signal(20);

  protected sortField = signal<string | null>(null);
  protected sortDir = signal<SortDirection | null>(null);

  protected widths = signal<Record<string, number>>({});
  protected order  = signal<string[] | null>(null);
  /** Column keys the user hid from the settings menu. */
  protected hidden = signal<string[]>([]);
  /** Pager rendered above the table (as well as below) so paging needs no scroll. */
  protected pagerTop = signal(false);

  /** Rendered columns: the user's order minus the hidden ones (the last visible column can't be hidden). */
  protected visibleColumns = computed<UiSharedGridColumnComponent[]>(() => {
    const hidden = new Set(this.hidden());
    const shown = this.orderedColumns().filter(c => !hidden.has(c.key()));
    return shown.length ? shown : this.orderedColumns().slice(0, 1);
  });

  protected isHidden(col: UiSharedGridColumnComponent): boolean { return this.hidden().includes(col.key()); }

  protected toggleColumn(col: UiSharedGridColumnComponent, visible: boolean): void {
    const key = col.key();
    this.hidden.update(h => visible ? h.filter(k => k !== key) : (h.includes(key) ? h : [...h, key]));
    this.persistSettings();
  }

  protected setPagerTop(on: boolean): void {
    this.pagerTop.set(on);
    this.persistSettings();
  }

  /** Columns in the (possibly user-reordered) order to render. */
  protected orderedColumns = computed<UiSharedGridColumnComponent[]>(() => {
    const cols = this.columns();
    const ord = this.order();
    if (!ord || ord.length === 0) return [...cols];
    const byKey = new Map(cols.map(c => [c.key(), c]));
    const fromStored = ord.map(k => byKey.get(k)).filter((c): c is UiSharedGridColumnComponent => !!c);
    // Append any column that exists today but wasn't in the stored order
    // (newly-added columns appear at the end so persisted order doesn't hide them).
    const seen = new Set(fromStored.map(c => c.key()));
    const tail = cols.filter(c => !seen.has(c.key()));
    return [...fromStored, ...tail];
  });

  private zone = inject(NgZone);
  private stopResize: (() => void) | null = null;
  private refreshSignals = inject(UI_REFRESH);

  /** Every fetch goes through here so a newer request cancels the in-flight one
   *  (switchMap) — a slow earlier page can never overwrite a later one. */
  private queries$ = new Subject<PageQuery>();

  constructor() {
    this.queries$.pipe(
      switchMap(q => this.source().get(q).pipe(catchError(() => of(null)))),
      takeUntilDestroyed(),
    ).subscribe(res => {
      if (res) {
        // The page emptied under us (rows deleted on the last page): jump to the new last page.
        const lastPage = Math.max(1, Math.ceil(res.total / this.pageSize()));
        if (!res.items.length && this.page() > lastPage) {
          this.page.set(lastPage);
          this.fetch();
          return;
        }
        this.rows.set(res.items);
        this.expanded.set(new Set());
        const pre = this.preselect();
        if (pre && this.selectable()) this.selected.set(res.items.filter(pre));
        this.total.set(res.total);
      }
      this.loading.set(false);
      this.loaded.set(true);
    });

    // Re-fetch whenever the [source] input ref changes. Pages that need to
    // force a reload after a mutation (e.g. tenant contracted-companies bumps
    // a refreshTick signal so its `source` computed returns a fresh
    // OdataSource instance) rely on this. The first effect run is consumed
    // during initial wiring — ngAfterContentInit owns the very first fetch.
    // Only source() may be tracked: page/sort/filter reads inside fetch() must
    // not become dependencies, or every paging change would reset to page 1.
    let initialSourceConsumed = false;
    effect(() => {
      this.source();
      untracked(() => {
        if (!initialSourceConsumed) {
          initialSourceConsumed = true;
          return;
        }
        this.fetchFirstPage();
      });
    });

    // Reload (data only — filters/sort/paging kept) when a matching gridRefresh
    // SignalR signal arrives (e.g. after a background invoice submit completes).
    this.refreshSignals.pipe(takeUntilDestroyed()).subscribe(s => {
      if (s.grid === this.refreshKey()) this.refresh();
    });

    inject(DestroyRef).onDestroy(() => this.stopResize?.());
  }

  ngOnInit(): void {
    this.pageSize.set(this.initialPageSize());
    if (this.initialSortField()) {
      this.sortField.set(this.initialSortField()!);
      this.sortDir.set(this.initialSortDir());
    }
  }

  ngAfterContentInit(): void {
    // Restore persisted layout (after columns are available) and the view
    // (after the projected filters are available).
    this.restoreLayout();
    this.restoreView();

    this.fetch();
  }

  refresh(): void { this.fetch(); }

  // ---- Row selection (per-page; cleared on every fetch) -------------------

  protected anySelected = computed(() => this.selected().length > 0);

  protected allOnPageSelected = computed(() => {
    const rows = this.rows();
    const sel = this.selected();
    return rows.length > 0 && rows.every(r => sel.includes(r));
  });

  protected isSelected(row: T): boolean { return this.selected().includes(row); }

  protected toggleRow(row: T, checked: boolean): void {
    this.selected.update(s => checked ? [...s, row] : s.filter(r => r !== row));
  }

  protected toggleAll(checked: boolean): void {
    this.selected.set(checked ? [...this.rows()] : []);
  }

  /** Public so consumers can drop the selection after a bulk action. */
  clearSelection(): void { this.selected.set([]); }

  reset(): void { this.fetchFirstPage(); }

  protected onPage(p: number): void {
    this.page.set(p);
    this.fetch();
  }

  protected onPageSize(size: number): void {
    this.pageSize.set(size);
    this.fetchFirstPage();
  }

  protected onHeaderClick(col: UiSharedGridColumnComponent): void {
    const field = col.sortField();
    if (!field) return;

    if (this.sortField() !== field) {
      this.sortField.set(field);
      this.sortDir.set('asc');
    } else if (this.sortDir() === 'asc') {
      this.sortDir.set('desc');
    } else if (this.sortDir() === 'desc') {
      this.sortField.set(null);
      this.sortDir.set(null);
    } else {
      this.sortDir.set('asc');
    }
    this.fetchFirstPage();
  }

  protected sortIconFor(col: UiSharedGridColumnComponent): string {
    if (!col.sortable) return '';
    if (this.sortField() !== col.sortField()) return 'unfold_more';
    return this.sortDir() === 'desc' ? 'arrow_downward' : 'arrow_upward';
  }

  protected ariaSortFor(col: UiSharedGridColumnComponent): string | null {
    if (!col.sortable) return null;
    if (this.sortField() !== col.sortField()) return 'none';
    return this.sortDir() === 'desc' ? 'descending' : 'ascending';
  }

  protected onSearch(): void {
    for (const f of this.filters()) f.applyPending();
    this.fetchFirstPage();
  }

  protected onClearFilters(): void {
    for (const f of this.filters()) f.clearAll();
    this.fetchFirstPage();
  }

  protected widthFor(col: UiSharedGridColumnComponent): string | null {
    const w = this.widths()[col.key()];
    return w ? `${w}px` : null;
  }

  /** Pointer down on a column's resize handle. */
  protected startResize(ev: PointerEvent, col: UiSharedGridColumnComponent, thEl: HTMLElement): void {
    ev.preventDefault();
    ev.stopPropagation();
    const startX = ev.clientX;
    const startW = thEl.getBoundingClientRect().width;
    const key = col.key();
    this.stopResize = trackPointerDrag(
      this.zone,
      e => this.setWidth(key, this.clampWidth(startW + (e.clientX - startX))),
      () => { this.stopResize = null; this.persistLayout(); },
    );
  }

  private setWidth(key: string, w: number): void {
    this.widths.update(prev => ({ ...prev, [key]: w }));
  }

  private clampWidth(w: number): number {
    return Math.max(this.minColWidth, Math.min(this.maxColWidth, Math.round(w)));
  }

  protected onDragStart(ev: DragEvent, col: UiSharedGridColumnComponent): void {
    if (!ev.dataTransfer) return;
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/plain', col.key());
  }

  protected onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
  }

  protected onDrop(ev: DragEvent, target: UiSharedGridColumnComponent): void {
    ev.preventDefault();
    const fromKey = ev.dataTransfer?.getData('text/plain');
    const toKey   = target.key();
    if (!fromKey || fromKey === toKey) return;

    // Build the current order list, move fromKey to where toKey is.
    const current = this.orderedColumns().map(c => c.key());
    const fi = current.indexOf(fromKey);
    const ti = current.indexOf(toKey);
    if (fi < 0 || ti < 0) return;
    const next = [...current];
    next.splice(fi, 1);
    next.splice(ti, 0, fromKey);
    this.order.set(next);
    this.persistLayout();
  }

  private settingsKey(k: string): string { return `app.coreGrid.${k}.settings`; }
  private widthsKey(k: string): string { return `app.coreGrid.${k}.widths`; }
  private orderKey(k: string): string  { return `app.coreGrid.${k}.order`; }
  private viewKey(k: string): string   { return `app.coreGrid.${k}.view`; }

  /** The view the user is looking at — written on every fetch, with the clause that fetch used. */
  private persistView(clause: string | undefined): void {
    const k = this.storageKey();
    if (!k) return;
    uiStorage.setJson(this.viewKey(k), {
      page: this.page(),
      pageSize: this.pageSize(),
      filters: this.filters().map(f => f.value()),
      // The CLAUSE as well as the values: a filter whose options load async (a
      // select over an OData lookup) answers `null` until they arrive, so
      // replaying values alone would send the first request unfiltered and need
      // a second one to correct it — see `restoredClause`.
      clause: clause ?? null,
    });
  }

  /**
   * Puts the remembered filters + paging back before the first fetch. Filters
   * are matched BY POSITION, so a template that has since gained or lost one is
   * treated as a different view and its values are dropped rather than landing
   * on the wrong input. A page past the end self-heals: the fetch falls back to
   * the last page.
   */
  private restoreView(): void {
    const k = this.storageKey();
    if (!k) return;
    const view = uiStorage.getJson(this.viewKey(k)) as
      { page?: unknown; pageSize?: unknown; filters?: unknown; clause?: unknown } | null;
    if (!view || typeof view !== 'object') return;

    const filters = this.filters();
    if (Array.isArray(view.filters) && view.filters.length === filters.length) {
      filters.forEach((f, i) => {
        const value = (view.filters as unknown[])[i];
        if (value !== null && value !== undefined && value !== '') f.restore(value);
      });
    }

    if (typeof view.pageSize === 'number' && this.pageSizeOptions().includes(view.pageSize)) {
      this.pageSize.set(view.pageSize);
    }
    if (typeof view.page === 'number' && Number.isInteger(view.page) && view.page >= 1) {
      this.page.set(view.page);
    }
    if (typeof view.clause === 'string' && view.clause) this.restoredClause = view.clause;
  }

  /**
   * The remembered OData clause, used for the FIRST fetch only. A restored
   * filter cannot always build its own clause yet — a select compares the value
   * against its options, which may still be loading — so without this the grid
   * would load unfiltered and then correct itself with a second request. Cleared
   * once used; every later fetch reads the live filters.
   */
  private restoredClause: string | null = null;

  private persistSettings(): void {
    const k = this.storageKey();
    if (!k) return;
    uiStorage.setJson(this.settingsKey(k), { hidden: this.hidden(), pagerTop: this.pagerTop() });
  }

  private restoreLayout(): void {
    const k = this.storageKey();
    if (!k) return;
    const settings = uiStorage.getJson(this.settingsKey(k)) as { hidden?: unknown; pagerTop?: unknown } | null;
    if (settings && typeof settings === 'object') {
      if (Array.isArray(settings.hidden) && settings.hidden.every(x => typeof x === 'string')) this.hidden.set(settings.hidden);
      if (typeof settings.pagerTop === 'boolean') this.pagerTop.set(settings.pagerTop);
    }
    const widths = uiStorage.getJson(this.widthsKey(k));
    if (widths && typeof widths === 'object') {
      const clean: Record<string, number> = {};
      for (const [key, val] of Object.entries(widths)) {
        const n = Number(val);
        if (Number.isFinite(n)) clean[key] = this.clampWidth(n);
      }
      this.widths.set(clean);
    }
    const order = uiStorage.getJson(this.orderKey(k));
    if (Array.isArray(order) && order.every(x => typeof x === 'string')) this.order.set(order);
  }

  private persistLayout(): void {
    const k = this.storageKey();
    if (!k) return;
    uiStorage.setJson(this.widthsKey(k), this.widths());
    const ord = this.order();
    if (ord?.length) uiStorage.setJson(this.orderKey(k), ord);
  }

  /**
   * Settings menu -> "Reset to default". Wipes any user-driven column
   * customisation (widths from drag-resize + order from drag-reorder) AND the
   * persisted localStorage entries, so the grid renders with its declared
   * columns at their default widths.
   */
  protected resetLayout(): void {
    this.widths.set({});
    this.order.set(null);
    this.hidden.set([]);
    this.pagerTop.set(false);
    const k = this.storageKey();
    if (k) {
      uiStorage.remove(this.widthsKey(k));
      uiStorage.remove(this.orderKey(k));
      uiStorage.remove(this.viewKey(k));
      uiStorage.remove(this.settingsKey(k));
    }
  }

  /** True when the user has any persisted/in-memory layout customisation. */
  protected hasLayoutChanges = computed<boolean>(() => {
    const w = this.widths();
    const o = this.order();
    return Object.keys(w).length > 0 || (o !== null && o.length > 0) || this.hidden().length > 0 || this.pagerTop();
  });

  private fetchFirstPage(): void {
    this.page.set(1);
    this.fetch();
  }

  private fetch(): void {
    // The remembered clause wins for the FIRST fetch after a restore, then the
    // live filters take over — one request, already filtered.
    const filter = this.restoredClause ?? andClauses(this.filters().map(f => f.clause()));
    this.restoredClause = null;

    this.persistView(filter);
    this.loading.set(true);
    this.selected.set([]);
    this.queries$.next({
      page: this.page(),
      pageSize: this.pageSize(),
      sortField: this.sortField() ?? undefined,
      sortDir: this.sortDir() ?? undefined,
      filter,
    });
  }
}
