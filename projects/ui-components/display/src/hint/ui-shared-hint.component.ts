import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UiTranslatePipe } from '@borassoft/ui-components';

export type UiHintTone = 'muted' | 'danger' | 'warning';

/**
 * The one explanation line: a small leading icon and muted text. Used under every form field
 * (hint and error), under a checkbox / toggle / segmented control, and on its own wherever a
 * section or a group of fields needs a sentence of help.
 *
 *   <ui-shared-hint textKey="settings.logo.hint" />
 *   <ui-shared-hint tone="danger" [text]="message" />
 */
@Component({
  selector: 'ui-shared-hint',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, UiTranslatePipe],
  templateUrl: './ui-shared-hint.component.html',
  styleUrl: './ui-shared-hint.component.scss',
  host: { '[class]': 'hostClass()' },
})
export class UiSharedHintComponent {
  textKey = input<string>('');
  text = input<string>('');
  tone = input<UiHintTone>('muted');

  protected icon = computed(() => (this.tone() === 'muted' ? 'info' : 'error'));
  protected hostClass = computed(() => `ui-shared-hint ui-shared-hint--${this.tone()}`);
}
