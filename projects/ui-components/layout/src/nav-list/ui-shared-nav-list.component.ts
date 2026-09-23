import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Vertical shell navigation: a column of <ui-shared-nav-item> and <ui-shared-nav-group> labels. */
@Component({
  selector: 'ui-shared-nav-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-shared-nav-list.component.html',
  styleUrl: './ui-shared-nav-list.component.scss',
  host: { class: 'ui-shared-nav-list', role: 'navigation' },
})
export class UiSharedNavListComponent {}
