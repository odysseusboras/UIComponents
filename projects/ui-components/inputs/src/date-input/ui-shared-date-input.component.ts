import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule, SubscriptSizing } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ClauseBuilder, GridFilterState, UiTranslatePipe, firstError, provideGridFilter } from '@borassoft/ui-components';

/**
 * The one date picker. Day-first typing/display comes from `provideUiDates()` in the app config.
 *
 * Inside `<ui-shared-grid>` with `[clauseBuilder]` it is a grid filter; the builder gets the picked day as an
 * OData date literal (`2026-10-06`):
 *
 *   <ui-shared-date-input labelKey="orders.from" [clauseBuilder]="from" />     from = (d: string) => `OrderDate ge ${d}`
 */
@Component({
  selector: 'ui-shared-date-input',
  standalone: true,
  // Default change detection: a parent's markAllAsTouched() changes no input, and the
  // mat-error below must still appear (same as select / password-field).
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, UiTranslatePipe],
  templateUrl: './ui-shared-date-input.component.html',
  styleUrl: './ui-shared-date-input.component.scss',
  providers: [provideGridFilter(() => UiSharedDateInputComponent)],
  host: { '[class.ui-shared-filter]': 'filter.isFilter()' },
})
export class UiSharedDateInputComponent {
  /** Optional when used as a grid filter. */
  control = input<FormControl<any> | null>(null);
  labelKey = input.required<string>();
  hintKey = input<string>('');
  hintText = input<string>('');
  min = input<Date | null>(null);
  max = input<Date | null>(null);
  subscriptSizing = input<SubscriptSizing>('dynamic');
  /** Grid filter: clause for the picked day, given as `YYYY-MM-DD`. */
  clauseBuilder = input<ClauseBuilder<string> | null>(null);

  private own = new FormControl<Date | null>(null);
  protected ctrl = computed(() => this.control() ?? this.own);
  // A remembered view hands the day back as the JSON text of the Date, hence `Date | string`.
  readonly filter = new GridFilterState<Date | string>(() => this.ctrl(), () => {
    const build = this.clauseBuilder();
    return build && (v => { const day = isoDay(v); return day ? build(day) : null; });
  }, () => null, v => isoDay(v as Date | string) !== null);

  protected readonly firstError = firstError;
  protected required = computed(() => this.ctrl().hasValidator(Validators.required));
}

/** The local calendar day of a date as `YYYY-MM-DD`; null when it is not a date. */
function isoDay(value: Date | string): string | null {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
