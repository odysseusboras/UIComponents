import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The application's top bar: sticky, one row, three slots.
 *
 * ```html
 * <ui-shared-app-header>
 *   <a slot="brand" routerLink="/" class="ui-shared-app-header__brand">…mark + wordmark…</a>
 *   <nav slot="nav">…primary links…</nav>
 *   <div slot="actions">…language, theme, user menu…</div>
 * </ui-shared-app-header>
 * ```
 * Height is `--header-h` (also the side panel's sticky offset). Helper classes for the slots'
 * content live in the theme: `__brand`, `__mark`, `__wordmark`, `__sep`, `__user`, `__user-name`, `__user-role`.
 */
@Component({
  selector: 'ui-shared-app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-shared-app-header.component.html',
  styleUrl: './ui-shared-app-header.component.scss',
  host: { class: 'ui-shared-app-header', role: 'banner' },
})
export class UiSharedAppHeaderComponent {}
