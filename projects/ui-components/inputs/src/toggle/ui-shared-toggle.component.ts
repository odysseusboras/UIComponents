import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UiTranslatePipe, requiredSignal } from '@borassoft/ui-components';
import { UiSharedHintComponent } from '@borassoft/ui-components/display';

/** The one on/off switch: a boolean FormControl with a translated label (or projected content). */
@Component({
  selector: 'ui-shared-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatSlideToggleModule, UiTranslatePipe, UiSharedHintComponent],
  templateUrl: './ui-shared-toggle.component.html',
  styleUrl: './ui-shared-toggle.component.scss',
})
export class UiSharedToggleComponent {
  control = input.required<FormControl<boolean>>();
  labelKey = input<string>('');
  /** A sentence of help under the control. */
  hintKey = input<string>('');

  protected required = requiredSignal(this.control);
}
