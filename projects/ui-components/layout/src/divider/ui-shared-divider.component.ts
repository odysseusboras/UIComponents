import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/** Hairline rule between sections or menu groups; `vertical` for toolbars. */
@Component({
  selector: 'ui-shared-divider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-shared-divider.component.html',
  styleUrl: './ui-shared-divider.component.scss',
  host: { class: 'ui-shared-divider', role: 'separator', '[class.ui-shared-divider--vertical]': 'vertical()' },
})
export class UiSharedDividerComponent {
  vertical = input(false, { transform: booleanAttribute });
}
