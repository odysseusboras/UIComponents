import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UiSharedButtonContentComponent } from '../../button/button-content/ui-shared-button-content.component';

/**
 * One entry of <ui-shared-menu> (row actions, user menu). `danger` paints it red.
 * Listen to `(click)` on the host; a disabled item never emits. With neither
 * `labelKey` nor `label`, projected content is the row (rich notification rows).
 *
 *   <mat-menu #rowMenu="matMenu">
 *     <ui-shared-menu-item icon="edit" labelKey="common.edit" (click)="edit(r)" />
 *     <ui-shared-menu-item icon="delete" labelKey="common.delete" danger (click)="remove(r)" />
 *   </mat-menu>
 */
@Component({
  selector: 'ui-shared-menu-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, MatMenuModule, UiSharedButtonContentComponent],
  templateUrl: './ui-shared-menu-item.component.html',
  styleUrl: './ui-shared-menu-item.component.scss',
})
export class UiSharedMenuItemComponent {
  icon = input<string>('');
  labelKey = input<string>('');
  label = input<string>('');
  danger = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  /** Navigates instead of emitting; renders an anchor. */
  link = input<string | any[] | null>(null);
}
