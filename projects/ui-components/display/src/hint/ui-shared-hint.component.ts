import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UI_TRANSLATE, UiTranslatePipe } from '@borassoft/ui-components';

export type UiHintTone = 'muted' | 'danger' | 'warning';

/**
 * The one explanation: an "i" icon with the text.
 *  - `iconOnly`: just the icon, the text as its hover tooltip - the form inputs put it at the end of the
 *    field (`matSuffix`) and the checkbox / toggle / radio group / segmented after their label;
 *  - otherwise the icon and the text on one line, cut with an ellipsis when it is longer than its box
 *    and shown whole on hover (`clamp`, the default for a lede); an error (`tone="danger"`) wraps instead.
 *
 *   <ui-shared-hint textKey="settings.logo.hint" />
 *   <ui-shared-hint iconOnly [text]="hint" />
 */
@Component({
  selector: 'ui-shared-hint',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatTooltipModule, UiTranslatePipe],
  templateUrl: './ui-shared-hint.component.html',
  styleUrl: './ui-shared-hint.component.scss',
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-label]': 'iconOnly() ? resolved() : null',
    '(click)': 'onClick($event)',
  },
})
export class UiSharedHintComponent {
  private translate = inject(UI_TRANSLATE);

  textKey = input<string>('');
  text = input<string>('');
  tone = input<UiHintTone>('muted');
  iconOnly = input(false, { transform: booleanAttribute });
  /** One line with an ellipsis, the whole text on hover (off for an error, which must stay readable). */
  clamp = input(true, { transform: booleanAttribute });

  protected resolved = computed(() => this.textKey() ? this.translate(this.textKey()) : this.text());
  protected icon = computed(() => (this.tone() === 'muted' ? 'info' : 'error'));
  protected clamped = computed(() => this.clamp() && this.tone() === 'muted');
  protected hostClass = computed(() =>
    `ui-shared-hint ui-shared-hint--${this.tone()}${this.iconOnly() ? ' ui-shared-hint--icon' : ''}${this.clamped() ? ' ui-shared-hint--clamp' : ''}`);

  /** Inside a checkbox / toggle label a click would flip the control: the icon is for reading only. */
  protected onClick(e: Event): void {
    if (this.iconOnly()) { e.preventDefault(); e.stopPropagation(); }
  }
}
