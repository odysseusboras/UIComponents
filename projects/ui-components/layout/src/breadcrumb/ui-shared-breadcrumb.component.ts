import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { UiTranslatePipe } from '@borassoft/ui-components';
import { UI_BREADCRUMBS, UiBreadcrumbLabels, resolveUiBreadcrumbs } from './ui-breadcrumbs';

/**
 * Breadcrumb trail for the current URL, from the tree the app registers with
 * `provideUiBreadcrumbs`. Renders nothing with fewer than two crumbs. The last crumb is the
 * current page: its node label, or `currentLabel` (the page title) when the node has none.
 * `<ui-shared-page-header>` renders it above the title, so pages need not place it themselves.
 */
@Component({
  selector: 'ui-shared-breadcrumb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiTranslatePipe],
  templateUrl: './ui-shared-breadcrumb.component.html',
  styleUrl: './ui-shared-breadcrumb.component.scss',
})
export class UiSharedBreadcrumbComponent {
  /** Label of the current page when its node has none (the page title). */
  currentLabel = input<string>('');

  private router = inject(Router);
  private tree = inject(UI_BREADCRUMBS);
  private labels = inject(UiBreadcrumbLabels);
  private url = toSignal(this.router.events.pipe(
    filter(e => e instanceof NavigationEnd), map(() => this.router.url), startWith(this.router.url)));

  protected crumbs = computed(() => resolveUiBreadcrumbs(this.tree, this.url() ?? '', this.labels.labels()));
  /** Whether a trail renders (two crumbs or more); the page header reads it. */
  readonly visible = computed(() => this.crumbs().length > 1);
}
