import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { SelectOption, UiOptionTextPipe, UiTranslatePipe } from '@borassoft/ui-components';

/** The one radio group for forms. Options are `SelectOption`s (label or labelKey), like ui-shared-select. */
@Component({
  selector: 'ui-shared-radio-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatRadioModule, UiTranslatePipe, UiOptionTextPipe],
  templateUrl: './ui-shared-radio-group.component.html',
  styleUrl: './ui-shared-radio-group.component.scss',
})
export class UiSharedRadioGroupComponent {
  control = input.required<FormControl<any>>();
  options = input.required<SelectOption[]>();
  labelKey = input<string>('');
  direction = input<'row' | 'column'>('row');
}
