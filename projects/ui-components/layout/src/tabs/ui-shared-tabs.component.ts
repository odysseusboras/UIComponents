import { ChangeDetectionStrategy, Component, computed, contentChildren, input, numberAttribute, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { UiTranslatePipe } from '@borassoft/ui-components';
import { UiSharedTabComponent } from './tab/ui-shared-tab.component';

/**
 * The one tab strip: flat labels, no animation, content rendered only for the
 * selected tab. `selected` / `(selectedChange)` for two-way state (query params).
 *
 *   <ui-shared-tabs [selected]="tab()" (selectedChange)="tab.set($event)">
 *     <ui-shared-tab labelKey="tenant.sales.tabs.sales"> ... </ui-shared-tab>
 *     <ui-shared-tab [label]="monthLabel()"> ... </ui-shared-tab>
 *   </ui-shared-tabs>
 *
 * Routed tabs: give every tab a `link` and put the page's <router-outlet> after the strip -
 * the strip is then a nav bar (each tab a URL, active by the router), the tabs carry no content.
 *
 *   <ui-shared-tabs>
 *     <ui-shared-tab link="info" labelKey="admin.companies.tabs.info" />
 *     <ui-shared-tab link="users" labelKey="admin.companies.tabs.users" />
 *   </ui-shared-tabs>
 *   <router-outlet />
 */
@Component({
  selector: 'ui-shared-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MatTabsModule, RouterLink, RouterLinkActive, UiTranslatePipe],
  templateUrl: './ui-shared-tabs.component.html',
  styleUrl: './ui-shared-tabs.component.scss',
})
export class UiSharedTabsComponent {
  selected = input(0, { transform: numberAttribute });
  selectedChange = output<number>();
  protected tabs = contentChildren(UiSharedTabComponent);
  protected routed = computed(() => this.tabs().some(t => t.link() !== null));
}
