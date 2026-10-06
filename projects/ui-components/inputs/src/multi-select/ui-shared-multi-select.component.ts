import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule, SubscriptSizing } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import {
  ClauseBuilder, GridFilterState, SelectOption, UI_TRANSLATE, UiOptionTextPipe, UiTranslatePipe, anyOfClause, firstError, optionText, provideGridFilter,
} from '@borassoft/ui-components';

/** A list this long gets a search box on top of its panel. */
const SEARCH_FROM = 8;
/** Case- and accent-insensitive form for matching: «γαλλια» finds «Γαλλία». */
const fold = (s: string): string => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/ς/g, 'σ');

/**
 * The one multi-value dropdown: the control holds an array of option VALUES. Inactive
 * (soft-deleted) options are offered only while they are selected, struck through with a marker,
 * exactly like <ui-shared-select> (D-55 of ATLAS). A list of 8 options or more has a search box on top: typing
 * narrows the options (label, ignoring case and accents), the picks made so far stay.
 *
 * Inside `<ui-shared-grid>` with `field` (or `[clauseBuilder]`) it is a grid filter: rows matching ANY of the
 * picked values.
 *
 *   <ui-shared-multi-select [control]="form.controls.regionIds" labelKey="activity.regions" [options]="regions()" />
 *   <ui-shared-multi-select labelKey="users.role" [options]="roles" field="Role" />
 */
@Component({
  selector: 'ui-shared-multi-select',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, UiTranslatePipe, UiOptionTextPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-shared-multi-select.component.html',
  styleUrl: './ui-shared-multi-select.component.scss',
  providers: [provideGridFilter(() => UiSharedMultiSelectComponent)],
  host: { '[class.ui-shared-filter]': 'filter.isFilter()' },
})
export class UiSharedMultiSelectComponent<T = string> {
  /** Optional when used as a grid filter. */
  control = input<FormControl<T[]> | null>(null);
  labelKey = input.required<string>();
  options = input.required<SelectOption<T>[]>();
  hintKey = input<string>('');
  hintText = input<string>('');
  subscriptSizing = input<SubscriptSizing>('dynamic');
  /** Grid filter: OData field compared with `eq` against each picked value (any of them). */
  field = input<string | null>(null);
  /** Grid filter: custom clause for the picked values (overrides `field`). */
  clauseBuilder = input<ClauseBuilder<T[]> | null>(null);

  private own = new FormControl<T[]>([], { nonNullable: true });
  protected ctrl = computed<FormControl<T[]>>(() => this.control() ?? this.own);
  readonly filter = new GridFilterState<T[]>(() => this.ctrl(), () => this.clauseBuilder() ?? anyOfClause<T>(this.field()), () => null, Array.isArray);

  protected readonly firstError = firstError;
  protected required = computed(() => this.ctrl().hasValidator(Validators.required));

  private translate = inject(UI_TRANSLATE);
  private search = viewChild<ElementRef<HTMLInputElement>>('search');
  private select = viewChild(MatSelect);
  protected query = signal('');
  protected get searchable(): boolean { return this.options().length >= SEARCH_FROM; }
  protected filteredOut(o: SelectOption<T>): boolean {
    const q = fold(this.query().trim());
    return !!q && !fold(optionText(o, this.translate)).includes(q);
  }
  protected onQuery(text: string): void {
    this.query.set(text);
    // Once the list has narrowed, the first match is the active option: arrows and Enter go on from there
    // (the option that was active may be hidden now, and the key manager does not wrap around to an earlier one).
    setTimeout(() => this.select()?._keyManager?.setFirstItemActive());
  }
  protected onOpened(open: boolean): void {
    if (!open) { this.query.set(''); return; }
    // Material walks over disabled options while the panel is open; here "disabled" means filtered out, so skip them.
    this.select()?._keyManager?.skipPredicate(o => o.disabled);
    this.focusSearch();
  }
  /** Typing goes to the search box: on open, and again after a pick (a click moves the focus to the panel). */
  protected focusSearch(): void { this.search()?.nativeElement.focus(); }
  /** The panel's own keys still work from the box (arrows, Enter to tick, Escape, Tab); the rest is text, not type-ahead. */
  protected onSearchKey(event: KeyboardEvent): void {
    if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'].includes(event.key)) event.stopPropagation();
  }
  /** Active options, plus the inactive ones that are currently selected. */
  // Getters, not computed: the control's value is not a signal, and the select's own events drive change detection.
  protected get offered() {
    const selected = this.ctrl().value ?? [];
    return this.options().filter(o => !o.inactive || selected.includes(o.value));
  }
  /** The selected options, in option order, for the trigger text. */
  protected get selected() {
    const v = this.ctrl().value ?? [];
    return this.options().filter(o => v.includes(o.value));
  }
  protected get hasInactive() {
    const selected = this.ctrl().value ?? [];
    return this.options().some(o => o.inactive && selected.includes(o.value));
  }
}
