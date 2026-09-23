import { Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiTranslatePipe, firstError } from '@borassoft/ui-components';

/**
 * The single password / secret-credential input used app-wide: masked by
 * default, with a trailing eye toggle that reveals the value until toggled
 * back. Takes the FormControl directly via [control] so the wrapped
 * mat-form-field surfaces validation errors through the shared firstError
 * helper without a CVA indirection.
 */
@Component({
  selector: 'ui-shared-password-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTooltipModule,
    UiTranslatePipe,
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
  subscriptSizing = input<'fixed' | 'dynamic'>('fixed');

  protected revealed = signal(false);
  protected firstError = firstError;
  protected required = computed(() => this.control().hasValidator(Validators.required));

  protected toggle(): void {
    this.revealed.update(v => !v);
  }
}
