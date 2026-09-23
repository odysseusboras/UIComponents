import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { UiTranslatePipe } from '@borassoft/ui-components';
import { UiSharedIconComponent } from '@borassoft/ui-components/display';
import { UiSharedSpinnerComponent } from '@borassoft/ui-components/feedback';

/**
 * The inside of every clickable row: leading icon (or spinner while loading),
 * label, trailing icon. Shared by button, menu item and nav item so they line
 * up identically. With no `labelKey` / `label` the projected content is the label.
 */
@Component({
  selector: 'ui-shared-button-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiTranslatePipe, UiSharedIconComponent, UiSharedSpinnerComponent],
  templateUrl: './ui-shared-button-content.component.html',
  styleUrl: './ui-shared-button-content.component.scss',
  host: { class: 'ui-shared-button-content' },
})
export class UiSharedButtonContentComponent {
  icon = input<string>('');
  iconEnd = input<string>('');
  labelKey = input<string>('');
  label = input<string>('');
  loading = input(false, { transform: booleanAttribute });
  loadingKey = input<string>('');
}
