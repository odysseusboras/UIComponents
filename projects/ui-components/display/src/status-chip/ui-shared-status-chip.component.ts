import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StatusTone } from './status-tones';

/**
 * The one status/state pill, so every grid, detail page and drawer renders
 * state identically.
 *
 *   <ui-shared-status-chip [tone]="activeTone(row.isDeleted)" icon="check_circle">
 *     {{ 'documents.status.submitted' | uiTranslate }}
 *   </ui-shared-status-chip>
 *
 *   <ui-shared-status-chip tone="bad" dot size="lg" [tooltip]="row.errorMessage">…</ui-shared-status-chip>
 */
@Component({
  selector: 'ui-shared-status-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './ui-shared-status-chip.component.html',
  styleUrl: './ui-shared-status-chip.component.scss',
})
export class UiSharedStatusChipComponent {
  tone = input<StatusTone>('muted');
  /** Optional leading Material icon name. */
  icon = input<string>('');
  /** Leading state dot instead of an icon. */
  dot = input(false, { transform: booleanAttribute });
  size = input<'sm' | 'lg'>('sm');
  /** Tooltip text (already translated). Adds `cursor: help`. */
  tooltip = input<string>('');
  /** Transparent fill with a tinted border. */
  outline = input(false, { transform: booleanAttribute });
}
