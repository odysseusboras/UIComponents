import { ChangeDetectionStrategy, Component, OnInit, booleanAttribute, computed, effect, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  ClauseBuilder, GridFilterState, SelectOption, UiOptionTextPipe, UiTranslatePipe,
  eqClause, provideGridFilter, storeChoice, storedChoice,
} from '@borassoft/ui-components';

/**
 * The one segmented control (single-choice button toggle row). Three uses:
 *  - view state: `[value]` in, `(valueChange)` out;
 *  - form: `[control]`;
 *  - grid filter inside `<ui-shared-grid>`: `field` or `[clauseBuilder]`, plus
 *    `initial` (selected on load, restored by Clear; defaults to the first
 *    option). With `field`, the value `all` filters nothing.
 *
 * `storageKey` remembers the choice in the browser and restores it on load
 * (emitting `valueChange`, and applying it when used as a filter). The options
 * must be known on init for the restore to happen.
 *
 *   <ui-shared-segmented [options]="years" [value]="year()" (valueChange)="year.set($event)" storageKey="home.year" />
 *   <ui-shared-segmented [options]="statusOptions" initial="active" [clauseBuilder]="softDeleteClauseBuilder" />
 */
@Component({
  selector: 'ui-shared-segmented',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatButtonToggleModule, UiTranslatePipe, UiOptionTextPipe],
  templateUrl: './ui-shared-segmented.component.html',
  styleUrl: './ui-shared-segmented.component.scss',
  providers: [provideGridFilter(() => UiSharedSegmentedComponent)],
  host: { '[class.ui-shared-filter]': 'filter.isFilter()' },
})
export class UiSharedSegmentedComponent<T = string> implements OnInit {
  options = input.required<SelectOption<T>[]>();
  value = input<T | null>(null);
  disabled = input(false, { transform: booleanAttribute });
  ariaLabelKey = input<string>('');
  valueChange = output<T>();
  control = input<FormControl<T | null> | null>(null);
  /** Remember the choice in the browser under this key. */
  storageKey = input<string>('');
  /** Grid filter: OData field compared with `eq` (`all` = no filter). */
  field = input<string | null>(null);
  /** Grid filter: custom clause for the picked value (overrides `field`). */
  clauseBuilder = input<ClauseBuilder<T> | null>(null);
  /** Grid filter: value selected on load and restored by Clear; defaults to the first option. */
  initial = input<T | null>(null);

  private own = new FormControl<T | null>(null);
  /** The group always binds a control: the caller's, or an internal one (view state / filter). */
  protected ctrl = computed<FormControl<T | null>>(() => this.control() ?? this.own);
  readonly filter: GridFilterState<T> = new GridFilterState<T>(
    () => this.ctrl(),
    () => this.clauseBuilder() ?? this.fieldEq(),
    () => this.initial() ?? this.options()[0]?.value ?? null,
  );

  constructor() {
    // View-state mode: [value] and [disabled] drive the internal control.
    effect(() => {
      const v = this.value();
      if (!this.control() && !this.filter.isFilter()) this.own.setValue(v, { emitEvent: false });
    });
    effect(() => (this.disabled() ? this.own.disable({ emitEvent: false }) : this.own.enable({ emitEvent: false })));
  }

  ngOnInit(): void {
    this.filter.init();
    const key = this.storageKey();
    const saved = key ? storedChoice(key, this.options().map(o => o.value)) : null;
    if (saved !== null && saved !== this.ctrl().value) {
      this.filter.restore(saved);
      this.valueChange.emit(saved);
    }
  }

  protected onChange(value: T): void {
    if (this.storageKey()) storeChoice(this.storageKey(), value);
    this.valueChange.emit(value);
  }

  private fieldEq(): ClauseBuilder<T> | null {
    const eq = eqClause<T>(this.field());
    return eq && (v => (v === 'all' ? null : eq(v)));
  }
}
