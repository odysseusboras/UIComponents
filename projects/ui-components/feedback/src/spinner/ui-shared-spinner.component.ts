import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/** Indeterminate spinner for inline loading states; `size` in px (default 24). */
@Component({
  selector: 'ui-shared-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule],
  templateUrl: './ui-shared-spinner.component.html',
  styleUrl: './ui-shared-spinner.component.scss',
})
export class UiSharedSpinnerComponent {
  size = input(24, { transform: numberAttribute });
}
