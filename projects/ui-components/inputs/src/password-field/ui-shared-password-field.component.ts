import { Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiTranslatePipe, firstError, passwordStrength, requiredSignal } from '@borassoft/ui-components';
import { UiSharedHintComponent } from '@borassoft/ui-components/display';

/**
 * The single password / secret-credential input used app-wide: masked by
 * default, with a trailing eye toggle that reveals the value until toggled
 * back. Takes the FormControl directly via [control] so the wrapped
 * mat-form-field surfaces validation errors through the shared firstError
 * helper without a CVA indirection. `strength` adds a weak / medium / strong
 * meter under the field (for a field where the user picks a new password).
 */
@Component({
  selector: 'ui-shared-password-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTooltipModule,
    UiTranslatePipe, UiSharedHintComponent
  ],
  templateUrl: './ui-shared-password-field.component.html',
  styleUrl: './ui-shared-password-field.component.scss',
})
export class UiSharedPasswordFieldComponent {
  control = input.required<FormControl<string>>();
  labelKey = input.required<string>();
  autocomplete = input<string>('off');
  hintKey = input<string>('');
  maxlength = input<number | null>(null);
  subscriptSizing = input<'fixed' | 'dynamic'>('dynamic');
  strength = input(false);

  protected revealed = signal(false);
  protected firstError = firstError;
  protected strengthOf = passwordStrength;
  protected required = requiredSignal(this.control);

  protected toggle(): void {
    this.revealed.update(v => !v);
  }
}
