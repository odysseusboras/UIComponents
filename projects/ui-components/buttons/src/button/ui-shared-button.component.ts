import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiTranslatePipe } from '@borassoft/ui-components';
import { UiSharedButtonContentComponent } from './button-content/ui-shared-button-content.component';

export type UiButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'danger-filled' | 'text';
export type UiButtonSize = 'sm' | 'md' | 'lg';

/**
 * The one text button. Every look is a `variant`, every height a `size`;
 * the styles live in the library theme (`.ui-shared-button`).
 *
 *   primary        filled accent (save, create, submit)
 *   secondary      outlined neutral (cancel, export, secondary actions)
 *   accent         outlined accent (open, sync)
 *   danger         outlined red (delete, deactivate)
 *   danger-filled  filled red (destructive primary)
 *   text           borderless (reset, whole month)
 *
 * Renders an `<a>` when `routerLink` is set, a spinner + `loadingKey` while
 * `loading`. With neither `labelKey` nor `label`, projected content is the label
 * (avatar + name, custom chrome). Put it in `[slot=trigger]` of <ui-shared-menu>
 * to open a menu.
 *
 *   <ui-shared-button variant="primary" icon="add" labelKey="products.add" (click)="openCreate()" />
 *   <ui-shared-button type="submit" [loading]="saving()" loadingKey="common.saving" labelKey="common.save" [disabled]="form.invalid" />
 *   <ui-shared-button variant="secondary" size="lg" labelKey="home.cta.signIn" routerLink="/auth/login" />
 */
@Component({
  selector: 'ui-shared-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, MatTooltipModule, UiTranslatePipe, UiSharedButtonContentComponent],
  templateUrl: './ui-shared-button.component.html',
  styleUrl: './ui-shared-button.component.scss',
  host: { '[class.ui-shared-button--block]': 'block()' },
})
export class UiSharedButtonComponent {
  variant = input<UiButtonVariant>('secondary');
  size = input<UiButtonSize>('md');
  /** Translation key of the label; `label` is the raw-text alternative. */
  labelKey = input<string>('');
  label = input<string>('');
  /** Material icon before the label; `iconEnd` puts it after. */
  icon = input<string>('');
  iconEnd = input<string>('');
  type = input<'button' | 'submit'>('button');
  disabled = input(false, { transform: booleanAttribute });
  /** Shows a spinner and, when set, `loadingKey` instead of the label; the button is disabled meanwhile. */
  loading = input(false, { transform: booleanAttribute });
  loadingKey = input<string>('');
  tooltipKey = input<string>('');
  /** Renders an anchor instead of a button. */
  routerLink = input<string | any[] | null>(null);
  queryParams = input<Record<string, unknown> | null>(null);
  /** Full-width (auth forms). */
  block = input(false, { transform: booleanAttribute });

  protected get classes(): string {
    return `ui-shared-button ui-shared-button--${this.variant()} ui-shared-button--${this.size()}`;
  }
  protected get isDisabled(): boolean { return this.disabled() || this.loading(); }
}
