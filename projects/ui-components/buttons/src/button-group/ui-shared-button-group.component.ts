import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/**
 * The action row: wraps buttons with a uniform gap, wraps on narrow screens.
 * `align` end (default: form actions), start (inline toolbars), between (back + actions),
 * center (empty states). `divided` adds the top rule + spacing of a form footer.
 *
 *   <ui-shared-button-group divided>
 *     <ui-shared-button variant="secondary" labelKey="common.cancel" (click)="close()" />
 *     <ui-shared-button variant="primary" labelKey="common.save" (click)="save()" />
 *   </ui-shared-button-group>
 */
@Component({
  selector: 'ui-shared-button-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-shared-button-group.component.html',
  styleUrl: './ui-shared-button-group.component.scss',
  host: {
    class: 'ui-shared-button-group',
    '[class.ui-shared-button-group--divided]': 'divided()',
    '[class.ui-shared-button-group--stack]': 'stack()',
    '[attr.data-align]': 'align()',
  },
})
export class UiSharedButtonGroupComponent {
  align = input<'end' | 'start' | 'between' | 'center'>('end');
  divided = input(false, { transform: booleanAttribute });
  /** Vertical list of full-width buttons (auth cards). */
  stack = input(false, { transform: booleanAttribute });
}
