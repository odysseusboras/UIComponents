import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatusTone } from '../status-chip/status-tones';

/**
 * The one KPI tile (overview stats, summaries): icon + label + value, optional
 * tinted tone, optional link. Project extra lines as content; they render
 * under the value in the muted sub style.
 *
 *   <ui-shared-stat-tile icon="trending_up" [label]="'dashboard.income' | uiTranslate"
 *                 [value]="(d.income.totalGross | number:'1.2-2') + ' €'" [link]="documentsLink()">
 *     {{ 'dashboard.net' | uiTranslate }} {{ d.income.totalNet | number:'1.2-2' }}
 *   </ui-shared-stat-tile>
 */
@Component({
  selector: 'ui-shared-stat-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './ui-shared-stat-tile.component.html',
  styleUrl: './ui-shared-stat-tile.component.scss',
})
export class UiSharedStatTileComponent {
  icon = input.required<string>();
  /** Already translated. */
  label = input.required<string>();
  /** Already formatted; ignored while `loading`, shows an em dash when empty. */
  value = input<string | number | null | undefined>(null);
  loading = input(false, { transform: booleanAttribute });
  /** Tints the icon and the value. */
  tone = input<StatusTone | ''>('');
  link = input<any[] | null>(null);
  queryParams = input<Record<string, unknown> | null>(null);
}
