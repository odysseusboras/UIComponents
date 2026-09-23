import { ChangeDetectionStrategy, Component, contentChildren, input, numberAttribute, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { UiTranslatePipe } from '@borassoft/ui-components';
import { UiSharedTabComponent } from './tab/ui-shared-tab.component';

/**
 * The one tab strip: flat labels, no animation, content rendered only for the
 * selected tab. `selected` / `(selectedChange)` for two-way state (query params).
 *
 *   <ui-shared-tabs [selected]="tab()" (selectedChange)="tab.set($event)">
 *     <ui-shared-tab labelKey="sales.tabs.overview"> ... </ui-shared-tab>
 *     <ui-shared-tab [label]="monthLabel()"> ... </ui-shared-tab>
 *   </ui-shared-tabs>
 */
@Component({
  selector: 'ui-shared-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MatTabsModule, UiTranslatePipe],
  templateUrl: './ui-shared-tabs.component.html',
  styleUrl: './ui-shared-tabs.component.scss',
})
export class UiSharedTabsComponent {
  selected = input(0, { transform: numberAttribute });
  selectedChange = output<number>();
  protected tabs = contentChildren(UiSharedTabComponent);
}
