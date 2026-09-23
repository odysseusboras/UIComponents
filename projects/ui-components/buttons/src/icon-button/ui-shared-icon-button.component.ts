import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiTranslatePipe } from '@borassoft/ui-components';
import { UiSharedIconComponent } from '@borassoft/ui-components/display';

export type UiIconButtonTone = 'default' | 'danger' | 'accent' | 'warning';

/**
 * Square icon-only button; `tooltipKey` doubles as the accessible name.
 * `size="sm"` (32px) is the inline row action (remove line, open row);
 * `size="md"` (40px) the toolbar one. `tone="danger"` turns red on hover,
 * `tone="accent"` is always accent (favourite on).
 *
 *   <ui-shared-icon-button icon="delete" tone="danger" tooltipKey="common.delete" (click)="remove(i)" />
 *   <ui-shared-icon-button slot="trigger" icon="more_vert" tooltipKey="core.grid.rowActions" />  (inside <ui-shared-menu>)
 */
@Component({
  selector: 'ui-shared-icon-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTooltipModule, UiTranslatePipe, UiSharedIconComponent],
  templateUrl: './ui-shared-icon-button.component.html',
  styleUrl: './ui-shared-icon-button.component.scss',
})
export class UiSharedIconButtonComponent {
  icon = input.required<string>();
  tooltipKey = input.required<string>();
  tone = input<UiIconButtonTone>('default');
  size = input<'sm' | 'md'>('sm');
  type = input<'button' | 'submit'>('button');
  disabled = input(false, { transform: booleanAttribute });
  /** Count bubble on the icon (notifications); hidden when null / 0. */
  badge = input<number | string | null | undefined>(null);

  protected get classes(): string {
    return `ui-shared-icon-button ui-shared-icon-button--${this.size()} ui-shared-icon-button--${this.tone()}`;
  }
}
