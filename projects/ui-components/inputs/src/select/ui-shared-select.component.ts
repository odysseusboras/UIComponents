import { Component, DestroyRef, DoCheck, Input, OnChanges, OnInit, booleanAttribute, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  ClauseBuilder, GridFilterState, SelectOption, UI_TRANSLATE, UiOptionTextPipe, UiTranslatePipe,
  firstError, odataLiteral, optionText, provideGridFilter, storeChoice, storedChoice,
} from '@borassoft/ui-components';

/**
 * The one dropdown. Every dropdown is editable: typing filters the options
 * (label or value, case-insensitive), arrows / Enter / click pick one, and the
 * input shows the picked option's label. The control holds the option VALUE.
 *
 *  - strict (default): only option values reach the control; text that matches
 *    no option is put back to the current choice when the field is left.
 *    Clearing the text sets `''` (use `nullable` to also offer an explicit "none").
 *  - `freeText`: any typed text is a value too (codes, numbers the list may not have).
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
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatIconModule,
    UiTranslatePipe, UiOptionTextPipe,
  ],
  templateUrl: './ui-shared-select.component.html',
  styleUrl: './ui-shared-select.component.scss',
  providers: [provideGridFilter(() => UiSharedSelectComponent)],
  host: { '[class.ui-shared-filter]': 'filter.isFilter()' },
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
  private query = signal('');
  private typing = false;
  /** The control value the input text was last derived from. */
  private shownValue: unknown;
  private _control: FormControl = new FormControl(null);

  readonly filter: GridFilterState<T> = new GridFilterState<T>(() => this.control, () => this.clauseBuilder ?? this.optionEq(), () => this.initial);

  protected filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.allOptions();
    if (!q) return all;
    return all.filter(o => this.label(o).toLowerCase().includes(q) || String(o.value).toLowerCase().includes(q));
  });

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
    const key = typed.trim().toLowerCase();
    const match = key
      ? this.allOptions().find(o => this.label(o).toLowerCase() === key || String(o.value).toLowerCase() === key)
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

  protected onBlur(): void {
    this.control.markAsTouched();
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
