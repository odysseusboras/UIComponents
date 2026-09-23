import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiSharedButtonContentComponent } from '@borassoft/ui-components/buttons';

/** One routed entry of <ui-shared-nav-list>: icon + label, highlighted while its route is active. */
@Component({
  selector: 'ui-shared-nav-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, UiSharedButtonContentComponent],
  templateUrl: './ui-shared-nav-item.component.html',
  styleUrl: './ui-shared-nav-item.component.scss',
})
export class UiSharedNavItemComponent {
  link = input.required<string | any[]>();
  icon = input<string>('');
  labelKey = input.required<string>();
  /** Highlight only on an exact route match (for the index route). */
  exact = input(false, { transform: booleanAttribute });
}
