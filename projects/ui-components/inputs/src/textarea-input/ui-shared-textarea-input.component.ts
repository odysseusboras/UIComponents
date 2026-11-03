import { Component, booleanAttribute, input, numberAttribute } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, SubscriptSizing } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UiTranslatePipe, firstError, requiredSignal } from '@borassoft/ui-components';

/** The one multi-line input. Same contract as ui-shared-text-input, plus `rows`. */
@Component({
  selector: 'ui-shared-textarea-input',
  standalone: true,
  // Default change detection: a parent's markAllAsTouched() changes no input, and the
  // mat-error below must still appear (same as select / password-field).
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, UiTranslatePipe],
  templateUrl: './ui-shared-textarea-input.component.html',
  styleUrl: './ui-shared-textarea-input.component.scss',
})
export class UiSharedTextareaInputComponent {
  control = input.required<FormControl<any>>();
  labelKey = input.required<string>();
  rows = input(3, { transform: numberAttribute });
  hintKey = input<string>('');
  hintText = input<string>('');
  maxlength = input<number | string | null>(null);
  readonly = input(false, { transform: booleanAttribute });
  subscriptSizing = input<SubscriptSizing>('dynamic');

  protected readonly firstError = firstError;
  protected required = requiredSignal(this.control);
}
