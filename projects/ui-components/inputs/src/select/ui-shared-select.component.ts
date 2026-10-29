import { Component, DestroyRef, DoCheck, ElementRef, Input, OnChanges, OnInit, ViewChild, booleanAttribute, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ClauseBuilder, GridFilterState, SelectOption, UI_TRANSLATE, UiOptionTextPipe, UiTranslatePipe,
  firstError, foldText, odataLiteral, optionText, provideGridFilter, storeChoice, storedChoice,
} from '@borassoft/ui-components';

/**
 * The one dropdown. The control holds the option VALUE.
 *
 *  - strict (default): a list with a search box on top, like <ui-shared-multi-select>: typing narrows the options
 *    (label or value, ignoring case and accents), arrows / Enter / click pick one. `nullable` adds an explicit "none".
 *  - `freeText`: an editable field instead; typing filters the options the same way, and any typed text is a value
 *    too (codes, numbers the list may not have).
 *
 * `disableWhenEmpty` disables the control while there are no options (cascade
 * children); it re-enables only when the control's group is enabled.
 *
 * Inside `<ui-shared-grid>` with `field` (or `[clauseBuilder]`) it is a grid filter;
 * `storageKey` remembers the choice in the browser (the options must be known on init).
 *
 *   <ui-shared-select [control]="form.controls.country" labelKey="form.country" [options]="countries" nullable />
 *   <ui-shared-select [control]="form.controls.mark" labelKey="form.mark" [options]="marks" freeText inputMode="numeric" />
 *   <ui-shared-select labelKey="users.role" [options]="roles" field="Role" />
 */
@Component({
  selector: 'ui-shared-select',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatSelectModule, MatIconModule, MatTooltipModule,
    UiTranslatePipe, UiOptionTextPipe,
  ],
  templateUrl: './ui-shared-select.component.html',
  styleUrl: './ui-shared-select.component.scss',
  providers: [provideGridFilter(() => UiSharedSelectComponent)],
  host: { '[class.ui-shared-filter]': 'filter.isFilter()', '[class.ui-shared-select--inactive]': 'currentInactive' },
})
export class UiSharedSelectComponent<T = string> implements OnChanges, OnInit, DoCheck {
  /** Optional when used as a grid filter. */
  @Input() set control(c: FormControl) {
    this._control = c;
    this.syncText();
  }
  get control(): FormControl { return this._control; }
  @Input({ required: true }) labelKey = '';
  @Input() set options(value: SelectOption<T>[]) {
    this.allOptions.set(value ?? []);
    this.syncText();
  }
  get options(): SelectOption<T>[] { return this.allOptions(); }
  /** Accept typed text that matches no option. */
  @Input({ transform: booleanAttribute }) freeText = false;
  @Input({ transform: booleanAttribute }) nullable = false;
  @Input() nullLabelKey = 'common.none';
  @Input() hintKey?: string;
  /** Already translated hint text — for hints built at runtime. */
  @Input() hintText?: string;
  @Input() emptyHintKey?: string;
  @Input({ transform: booleanAttribute }) disableWhenEmpty = false;
  /** Mobile keyboard hint (`numeric` for digit-only codes); it does not validate the value. */
  @Input() inputMode: 'text' | 'numeric' = 'text';
  /** Grid filter: OData field compared with `eq` against the option value. */
  @Input() field?: string;
  /** Grid filter: custom clause for the value (overrides `field`). */
  @Input() clauseBuilder?: ClauseBuilder<T>;
  /** Grid filter: value selected on load and restored by Clear. */
  @Input() initial: T | null = null;
  /** Remember the choice in the browser under this key. */
  @Input() storageKey?: string;

  /** What the input shows; the bound control only ever receives values. */
  protected text = new FormControl('', { nonNullable: true });
  protected readonly firstError = firstError;
  /** Errors belong to the bound control, not to the text the user is typing. */
  protected readonly errorMatcher: ErrorStateMatcher = { isErrorState: () => !!firstError(this.control) };

  private translate = inject(UI_TRANSLATE);
  private destroyRef = inject(DestroyRef);
  private allOptions = signal<SelectOption<T>[]>([]);
  protected query = signal('');
  private typing = false;
  /** The control value the input text was last derived from. */
  private shownValue: unknown;
  private _control: FormControl = new FormControl(null);

  readonly filter: GridFilterState<T> = new GridFilterState<T>(() => this.control, () => this.clauseBuilder ?? this.optionEq(), () => this.initial);

  protected filtered = computed(() => {
    // Inactive (soft-deleted) options are only offered when they are the current value.
    const all = this.allOptions().filter(o => !o.inactive || o.value === this.control.value);
    return this.query().trim() ? all.filter(o => !this.filteredOut(o)) : all;
  });

  // ---- strict mode: the list with its search box
  @ViewChild('search') private search?: ElementRef<HTMLInputElement>;
  @ViewChild(MatSelect) private select?: MatSelect;
  /** Active options, plus the current one when it is inactive. Filtered-out options stay in the list, hidden: mat-select
   *  forgets a selection whose option leaves the DOM. */
  protected get offered(): SelectOption<T>[] {
    return this.allOptions().filter(o => !o.inactive || o.value === this.control.value);
  }
  protected get current(): SelectOption<T> | undefined {
    return this.allOptions().find(o => o.value === this.control.value);
  }
  protected filteredOut(o: SelectOption<T> | null): boolean {
    const q = foldText(this.query().trim());
    if (!q) return false;
    const text = o ? this.label(o) : this.translate(this.nullLabelKey);
    return !foldText(text).includes(q) && !(o && foldText(String(o.value)).includes(q));
  }
  protected onQuery(text: string): void {
    this.query.set(text);
    // The first match becomes the active option: arrows and Enter go on from there.
    setTimeout(() => this.select?._keyManager?.setFirstItemActive());
  }
  protected onOpened(open: boolean): void {
    if (!open) { this.query.set(''); return; }
    // Filtered-out options are disabled; the arrows skip them.
    this.select?._keyManager?.skipPredicate(o => o.disabled);
    // Start at the top with the search box focused (Material would scroll the picked option under the sticky box).
    setTimeout(() => {
      const panel = this.select?.panel?.nativeElement;
      if (panel) panel.scrollTop = 0;
      this.search?.nativeElement.focus();
    });
  }
  /** The panel's own keys still work from the box (arrows, Enter to pick, Escape, Tab); the rest is text, not type-ahead. */
  protected onSearchKey(event: KeyboardEvent): void {
    if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'].includes(event.key)) event.stopPropagation();
  }

  /** The current value points to a soft-deleted record: the field shows it struck through with a marker. */
  protected get currentInactive(): boolean {
    const v = this.control.value;
    return v != null && v !== '' && !!this.allOptions().find(o => o.value === v)?.inactive;
  }

  protected get required(): boolean { return this.control.hasValidator(Validators.required); }

  /**
   * Callers often change the control with `{ emitEvent: false }` (a loading
   * lock, a mirrored selection), which raises no event — so the input follows
   * the control's value and disabled state on every check instead.
   */
  ngDoCheck(): void {
    if (this.control.value !== this.shownValue) this.syncText();
    this.syncDisabled();
  }

  ngOnInit(): void {
    this.filter.init();
    const key = this.storageKey;
    if (!key) return;
    const saved = storedChoice(key, this.options.map(o => o.value));
    if (saved !== null) this.filter.restore(saved);
    this.control.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => storeChoice(key, v));
  }

  ngOnChanges(): void {
    if (!this.disableWhenEmpty) return;
    const empty = this.options.length === 0;
    if (empty && this.control.enabled) {
      this.control.disable({ emitEvent: false });
    } else if (!empty && this.control.disabled && !this.control.parent?.disabled) {
      // A parent-level lock (a read-only section) disables whole groups;
      // options arriving later must not undo it per control.
      this.control.enable({ emitEvent: false });
    }
    this.syncDisabled();
  }

  /**
   * Material's trigger writes EVERY value the input shows through this: the
   * picked option value (→ its label) and the text we set (a label already).
   */
  protected displayWith = (value: unknown): string => {
    const o = this.allOptions().find(x => x.value === value);
    return o ? this.label(o) : value === null || value === undefined ? '' : String(value);
  };

  protected onInput(event: Event): void {
    const typed = (event.target as HTMLInputElement).value;
    this.query.set(typed);
    const key = foldText(typed.trim());
    const match = key
      ? this.allOptions().find(o => foldText(this.label(o)) === key || foldText(String(o.value)) === key)
      : undefined;
    const next = !key ? '' : match ? match.value : this.freeText ? (typed as T) : undefined;
    if (next === undefined) return;
    this.typing = true;
    // Dirty FIRST: setValue emits valueChanges synchronously, and subscribers
    // tell a user pick from a programmatic patch by that flag.
    this.control.markAsDirty();
    this.control.setValue(next);
    this.typing = false;
  }

  protected onPick(event: MatAutocompleteSelectedEvent): void {
    this.control.markAsDirty();
    this.control.setValue(event.option.value);
    this.query.set('');
    this.syncText();
  }

  protected onFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  /**
   * Clicking an option blurs the input BEFORE the click lands. Clearing the
   * filter here would re-render the full list under the pointer and pick
   * whatever option now sits there, so while the panel is open the filter
   * stays until the panel closes (`resetQuery`).
   */
  protected onBlur(trigger: MatAutocompleteTrigger): void {
    this.control.markAsTouched();
    if (!trigger.panelOpen) this.resetQuery();
  }

  protected resetQuery(): void {
    this.query.set('');
    this.syncText();
  }

  protected toggle(trigger: MatAutocompleteTrigger, input: HTMLInputElement): void {
    if (this.text.disabled) return;
    if (trigger.panelOpen) {
      trigger.closePanel();
    } else {
      input.focus();
      trigger.openPanel();
    }
  }

  private syncText(): void {
    if (this.typing) return;
    this.shownValue = this.control.value;
    const t = this.textOf(this.shownValue);
    if (t !== this.text.value) this.text.setValue(t, { emitEvent: false });
  }

  private syncDisabled(): void {
    const disabled = this.control.disabled;
    if (disabled === this.text.disabled) return;
    if (disabled) this.text.disable({ emitEvent: false });
    else this.text.enable({ emitEvent: false });
  }

  /** The option's label; free text as typed; nothing for a value the options don't (yet) hold. */
  private textOf(value: unknown): string {
    if (value === null || value === undefined || value === '') return '';
    const o = this.allOptions().find(x => x.value === value);
    return o ? this.label(o) : this.freeText ? String(value) : '';
  }

  private label(o: SelectOption<T>): string { return optionText(o, this.translate); }

  private optionEq(): ClauseBuilder<T> | null {
    const field = this.field;
    if (!field) return null;
    return v => (this.allOptions().some(o => o.value === v) ? `${field} eq ${odataLiteral(v)}` : null);
  }
}
