import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule, SubscriptSizing } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UiTranslatePipe, firstError } from '@borassoft/ui-components';

/** The one date picker. Day-first typing/display comes from `provideUiDates()` in the app config. */
@Component({
  selector: 'ui-shared-date-input',
  standalone: true,
  // Default change detection: a parent's markAllAsTouched() changes no input, and the
  // mat-error below must still appear (same as select / password-field).
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, UiTranslatePipe],
  templateUrl: './ui-shared-date-input.component.html',
  styleUrl: './ui-shared-date-input.component.scss',
})
export class UiSharedDateInputComponent {
  control = input.required<FormControl<any>>();
  labelKey = input.required<string>();
  hintKey = input<string>('');
  hintText = input<string>('');
  min = input<Date | null>(null);
  max = input<Date | null>(null);
  subscriptSizing = input<SubscriptSizing>('dynamic');

  protected readonly firstError = firstError;
  protected required = computed(() => this.control().hasValidator(Validators.required));
}
