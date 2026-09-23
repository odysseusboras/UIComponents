import {
  Component, ElementRef, HostBinding, NgZone, OnDestroy,
  effect, inject, input, numberAttribute, signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiTranslatePipe, trackPointerDrag, uiStorage } from '@borassoft/ui-components';

/**
 * Generic show/hide + drag-resizable side panel for a shell layout. Consumers
 * project the nav body and the main content via named slots:
 *
 * ```html
 * <ui-shared-side-panel storageKey="admin-shell">
 *   <div slot="nav">…sidenav head + nav list…</div>
 *   <div slot="content"><router-outlet /></div>
 * </ui-shared-side-panel>
 * ```
 *
 * Behaviour:
 *  - **Show / hide.** A toggle button collapses the panel to a slim rail.
 *    A second toggle at the rail edge expands it back to the saved width.
 *  - **Drag-resize.** Grab the vertical handle on the right edge of the
 *    expanded panel and drag to set the width. Width is clamped to
 *    `[minWidth, maxWidth]`.
 *  - **Persistence.** Both the collapsed flag and the current width are
 *    written to `localStorage` under `ui.sidePanel.<storageKey>` so each
 *    shell remembers its own layout independently across sessions.
 *
 * The rail sticks below the host's header: set `--header-h` (or `--ui-sticky-top`).
 * While dragging, `body` carries the `ui-resizing` class so the host can force
 * the column-resize cursor globally.
 */
@Component({
  selector: 'ui-shared-side-panel',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule, UiTranslatePipe],
  templateUrl: './ui-shared-side-panel.component.html',
  styleUrl: './ui-shared-side-panel.component.scss',
})
export class UiSharedSidePanelComponent implements OnDestroy {
  /** Unique storage key — e.g. "admin-shell". Required. */
  storageKey = input.required<string>();

  /** Default expanded width (px) when nothing is in localStorage. */
  defaultWidth = input(248, { transform: numberAttribute });

  /** Minimum drag width (px). Anything below clamps up. */
  minWidth = input(200, { transform: numberAttribute });

  /** Maximum drag width (px). Anything above clamps down. */
  maxWidth = input(480, { transform: numberAttribute });

  /** Width of the slim "collapsed" rail that hosts the expand toggle. */
  protected readonly railWidth = 36;

  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private zone = inject(NgZone);

  protected width = signal<number>(248);
  protected collapsed = signal<boolean>(false);

  /** True while the user is dragging the resize handle. */
  protected dragging = signal<boolean>(false);
  private stopDrag: (() => void) | null = null;

  constructor() {
    effect(() => {
      const state = this.readState(this.storageKey());
      if (state) {
        this.collapsed.set(state.collapsed);
        this.width.set(this.clamp(state.width));
      } else {
        this.width.set(this.clamp(this.defaultWidth()));
      }
    });

    effect(() => {
      const key = this.storageKey();
      if (!key) return;
      uiStorage.setJson(this.storageKeyFor(key), { collapsed: this.collapsed(), width: this.width() });
    });
  }

  ngOnDestroy(): void {
    this.stopDrag?.();
  }

  toggleCollapsed(): void {
    this.collapsed.update(v => !v);
  }

  /** Pointerdown on the resize handle — start tracking width. */
  startDrag(ev: PointerEvent): void {
    if (this.collapsed()) return;
    ev.preventDefault();
    this.dragging.set(true);
    const left = this.host.nativeElement.getBoundingClientRect().left;
    this.stopDrag = trackPointerDrag(
      this.zone,
      e => this.width.set(this.clamp(e.clientX - left)),
      () => { this.dragging.set(false); this.stopDrag = null; },
    );
  }

  private clamp(w: number): number {
    return Math.max(this.minWidth(), Math.min(this.maxWidth(), Math.round(w)));
  }

  private storageKeyFor(key: string): string {
    return `ui.sidePanel.${key}`;
  }

  private readState(key: string): { collapsed: boolean; width: number } | null {
    const saved = uiStorage.getJson(this.storageKeyFor(key)) as { collapsed?: unknown; width?: unknown } | null;
    const width = Number(saved?.width);
    return saved && Number.isFinite(width) ? { collapsed: !!saved.collapsed, width } : null;
  }

  @HostBinding('style.--side-panel-width.px')
  get widthVar() {
    return this.collapsed() ? this.railWidth : this.width();
  }
}
