import { Component, booleanAttribute, computed, inject, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UiTranslatePipe, UI_TRANSLATE } from '@borassoft/ui-components';
import { UiSharedBreadcrumbComponent } from '../breadcrumb/ui-shared-breadcrumb.component';

/**
 * Standard page header — title (h1) + optional lede line + optional back link.
 *
 * Two ways to provide content:
 *   - translation KEYS (preferred for static labels) via `titleKey` / `ledeKey`
 *   - literal STRINGS (for dynamic content like an entity name) via `titleText` / `ledeText`
 *
 * Translation keys win when both are set:
 *
 *   <ui-shared-page-header titleKey="admin.companies.title" ledeKey="admin.companies.lede" />
 *
 *   <ui-shared-page-header [titleText]="company.friendlyName"
 *                   [ledeText]="company.country + ' · VAT: ' + company.vat"
 *                   [backLink]="['..']" backKey="admin.companies.title" />
 *
 * The breadcrumb trail (`provideUiBreadcrumbs`) renders above the title on every page; the
 * current page's crumb is this title, and the back link is dropped while a trail shows. Set
 * `breadcrumb="false"` to leave it out.
 *
 * Detail pages set `backLink` (a routerLink value) to render a small
 * "← Back" link above the title; set `(back)` instead (with no `backLink`)
 * for an imperative handler. Project content into `[slot=actions]` for
 * page-level actions.
 */
@Component({
  selector: 'ui-shared-page-header',
  standalone: true,
  imports: [RouterLink, MatIconModule, UiTranslatePipe, UiSharedBreadcrumbComponent],
  templateUrl: './ui-shared-page-header.component.html',
  styleUrl: './ui-shared-page-header.component.scss',
})
export class UiSharedPageHeaderComponent {
  /** Translation key for the page title. Wins over titleText. */
  titleKey = input<string>('');

  /** Literal title text (e.g. an entity name). Used only when titleKey is empty. */
  titleText = input<string>('');

  /** Translation key for the lede paragraph. Wins over ledeText. */
  ledeKey = input<string>('');

  /** Literal lede text. Used only when ledeKey is empty. */
  ledeText = input<string>('');

  /** routerLink target for the back link. `null` + a `(back)` listener renders a button instead. */
  backLink = input<string | any[] | null>(null);

  /** Translation key for the back link label. */
  backKey = input<string>('common.back');

  /** Force the back control on (as a button) even without a `backLink`. */
  showBack = input(false, { transform: booleanAttribute });

  /** Whether the [slot=actions] projection should be rendered. */
  showActions = input(true, { transform: booleanAttribute });

  /** Emitted when the back BUTTON (no `backLink`) is clicked. */
  back = output<void>();

  /** Render the breadcrumb trail above the title (when the app registered a tree). */
  breadcrumb = input(true, { transform: booleanAttribute });

  private translate = inject(UI_TRANSLATE);
  private trail = viewChild(UiSharedBreadcrumbComponent);
  /** The back link is the trail's job once a trail renders; it stays for pages outside the tree. */
  protected hasBack = computed(() => !this.trail()?.visible() && (this.backLink() !== null || this.showBack()));
  protected titleLabel = computed(() => this.titleKey() ? this.translate(this.titleKey()) : this.titleText());
}
