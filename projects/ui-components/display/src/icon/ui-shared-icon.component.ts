import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';

export type UiIconSize = 'sm' | 'md' | 'lg';
export type UiIconTone = 'inherit' | 'muted' | 'accent' | 'danger' | 'success' | 'warning' | 'info';

/**
 * A Material Symbols icon by name. `size` sm 18px / md 24px / lg 32px,
 * `tone` colours it, `badge` shows a count (hidden when empty or 0).
 *
 *   <ui-shared-icon name="receipt_long" />
 *   <ui-shared-icon name="notifications" [badge]="unread()" />
 */
@Component({
  selector: 'ui-shared-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatBadgeModule],
  templateUrl: './ui-shared-icon.component.html',
  styleUrl: './ui-shared-icon.component.scss',
  host: { '[class]': 'hostClass()' },
})
export class UiSharedIconComponent {
  name = input.required<string>();
  size = input<UiIconSize>('md');
  tone = input<UiIconTone>('inherit');
  badge = input<number | string | null | undefined>(null);

  protected hostClass = computed(() => `ui-shared-icon ui-shared-icon--${this.size()} ui-shared-icon--${this.tone()}`);
  protected badgeHidden = computed(() => { const b = this.badge(); return b == null || b === '' || b === 0; });
}
