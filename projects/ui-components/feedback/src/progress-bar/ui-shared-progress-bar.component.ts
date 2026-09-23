import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

/** Thin loading bar: indeterminate by default, determinate when `value` (0-100) is set. */
@Component({
  selector: 'ui-shared-progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressBarModule],
  templateUrl: './ui-shared-progress-bar.component.html',
  styleUrl: './ui-shared-progress-bar.component.scss',
})
export class UiSharedProgressBarComponent {
  value = input<number | null, unknown>(null, { transform: v => (v == null || v === '' ? null : numberAttribute(v)) });
}
