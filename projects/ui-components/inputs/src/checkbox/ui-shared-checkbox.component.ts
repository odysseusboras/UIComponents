import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgTemplateOutlet } from '@angular/common';
import { UiTranslatePipe } from '@borassoft/ui-components';

/**
 * The one checkbox. Two modes:
 *  - form mode: `[control]` is a boolean FormControl;
 *  - selection mode (no control): `[checked]` / `[disabled]` in, `(changed)` out —
 *    for table row / select-all toggles that live in component state, not a form.
 * Label is a translation key or projected content.
 */
@Component({
  selector: 'ui-shared-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, ReactiveFormsModule, MatCheckboxModule, MatTooltipModule, UiTranslatePipe],
  templateUrl: './ui-shared-checkbox.component.html',
  styleUrl: './ui-shared-checkbox.component.scss',
})
export class UiSharedCheckboxComponent {
  control = input<FormControl<boolean> | null>(null);
  labelKey = input<string>('');
  ariaLabelKey = input<string>('');
  /** Hover hint on the whole checkbox. */
  tooltipKey = input<string>('');
  checked = input(false, { transform: booleanAttribute });
  indeterminate = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  changed = output<boolean>();
}
