import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

export type UiButtonGroupStack = boolean | 'narrow';

/**
 * The action row: wraps buttons with a uniform gap, wraps on narrow screens.
 * `align` end (default: form actions), start (inline toolbars), between (back + actions),
 * center (empty states). `divided` adds the top rule + spacing of a form footer.
 * `stack` lists the buttons vertically; `stack="narrow"` only while the group itself is narrower
 * than the theme's breakpoint (640px): a row in a wide column, a stack in a side bar or on a phone.
 * The narrow group measures its own width, so it must sit where its parent gives it one (a block, not a
 * shrink-to-fit flex item).
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
    '[class.ui-shared-button-group--stack]': 'stack() === true',
    '[class.ui-shared-button-group--stack-narrow]': "stack() === 'narrow'",
    '[attr.data-align]': 'align()',
  },
})
export class UiSharedButtonGroupComponent {
  align = input<'end' | 'start' | 'between' | 'center'>('end');
  divided = input(false, { transform: booleanAttribute });
  /** Vertical list of full-width buttons (auth cards); `'narrow'` stacks only below the theme's breakpoint. */
  stack = input<UiButtonGroupStack, UiButtonGroupStack | ''>(false, {
    transform: v => (v === 'narrow' ? v : booleanAttribute(v)),
  });
}
