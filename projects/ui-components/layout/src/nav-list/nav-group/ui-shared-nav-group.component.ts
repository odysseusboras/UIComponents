import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UiTranslatePipe } from '@borassoft/ui-components';

/** Small uppercase label that opens a section of <ui-shared-nav-list>. */
@Component({
  selector: 'ui-shared-nav-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiTranslatePipe],
  templateUrl: './ui-shared-nav-group.component.html',
  styleUrl: './ui-shared-nav-group.component.scss',
  host: { class: 'ui-shared-nav-group' },
})
export class UiSharedNavGroupComponent {
  labelKey = input.required<string>();
}
