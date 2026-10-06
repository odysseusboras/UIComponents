import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, booleanAttribute, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { SelectOption } from '@borassoft/ui-components';
import { UiSharedSelectComponent } from '../select/ui-shared-select.component';

/**
 * Year dropdown: the current year ± `range` (default 5). The control holds a number.
 * A stored year outside that window (an old record) is still listed, so the field never shows empty.
 * Typing filters like every ui-shared-select ("202" → 2020…2029); required is read from the control.
 *
 *   <ui-shared-year-select [control]="form.controls.year" labelKey="form.year" />
 *   <ui-shared-year-select [control]="form.controls.year" labelKey="form.year" [range]="10" nullable />
 */
@Component({
  selector: 'ui-shared-year-select',
  standalone: true,
  imports: [UiSharedSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ui-shared-select [control]="control()" [labelKey]="labelKey()" [options]="years()" [nullable]="nullable()" [hintKey]="hintKey()" inputMode="numeric" />`,
  host: { class: 'ui-shared-year-select' },
})
export class UiSharedYearSelectComponent implements OnInit {
  control = input.required<FormControl<number | null>>();
  labelKey = input.required<string>();
  /** Years offered before and after the current one. */
  range = input(5, { transform: numberAttribute });
  nullable = input(false, { transform: booleanAttribute });
  hintKey = input<string | undefined>(undefined);

  private destroyRef = inject(DestroyRef);
  private readonly current = new Date().getFullYear();
  /** The control's value, followed so a year loaded later (patchValue) is added to the list. */
  private value = signal<number | null>(null);

  readonly years = computed<SelectOption<number>[]>(() => {
    const r = this.range();
    const list: number[] = [];
    for (let y = this.current - r; y <= this.current + r; y++) list.push(y);
    const v = Number(this.value());
    if (v && !list.includes(v)) { list.push(v); list.sort((a, b) => a - b); }
    return list.map(y => ({ value: y, label: String(y) }));
  });

  ngOnInit(): void {
    const c = this.control();
    this.value.set(c.value);
    c.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => this.value.set(v));
  }
}
