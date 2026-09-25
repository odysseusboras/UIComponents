import { Injectable, InjectionToken, Provider, signal } from '@angular/core';
import { Params } from '@angular/router';

/**
 * One node of the app's breadcrumb tree. `path` is one URL segment (static, or `:param`);
 * a node without a label shows the page title of the page that renders there.
 *
 *   provideUiBreadcrumbs([
 *     { path: 'admin', labelKey: 'admin.title', children: [
 *       { path: 'companies', labelKey: 'admin.companies.title', children: [{ path: ':id' }] },
 *     ] },
 *   ])
 */
export interface UiBreadcrumbNode {
  path: string;
  labelKey?: string;
  /** Dynamic label from the matched params (e.g. the VAT segment). */
  label?: (params: Params) => string;
  /** Where the crumb links to when it is not the current page; defaults to its own URL. */
  redirect?: string;
  children?: UiBreadcrumbNode[];
}

export interface UiBreadcrumb { labelKey?: string; label?: string; url: string; last: boolean }

export const UI_BREADCRUMBS = new InjectionToken<UiBreadcrumbNode[]>('UI_BREADCRUMBS', { providedIn: 'root', factory: () => [] });

export function provideUiBreadcrumbs(nodes: UiBreadcrumbNode[]): Provider {
  return { provide: UI_BREADCRUMBS, useValue: nodes };
}

/**
 * Labels for `:param` crumbs that only the page knows (a company's name for its id): the page
 * registers `set(paramValue, label)` once it has loaded the record, the trail picks it up.
 */
@Injectable({ providedIn: 'root' })
export class UiBreadcrumbLabels {
  readonly labels = signal<ReadonlyMap<string, string>>(new Map());
  set(value: string, label: string): void {
    this.labels.update(m => { const n = new Map(m); n.set(value, label); return n; });
  }
}

/** Walks the URL through the tree: static paths win over `:param` ones; stops at the first segment nothing matches. */
export function resolveUiBreadcrumbs(nodes: UiBreadcrumbNode[], url: string, labels?: ReadonlyMap<string, string>): UiBreadcrumb[] {
  const segments = url.split(/[?#]/)[0].split('/').filter(Boolean).map(decodeURIComponent);
  const crumbs: UiBreadcrumb[] = [];
  const params: Params = {};
  let level = nodes;
  let path = '';
  for (const seg of segments) {
    const node = level.find(n => n.path === seg) ?? level.find(n => n.path.startsWith(':'));
    if (!node) break;
    if (node.path.startsWith(':')) params[node.path.slice(1)] = seg;
    path += '/' + encodeURIComponent(seg);
    const label = node.label?.(params) ?? (node.path.startsWith(':') ? labels?.get(seg) : undefined);
    crumbs.push({ labelKey: node.labelKey, label, url: node.redirect ? `${path}/${node.redirect}` : path, last: false });
    level = node.children ?? [];
  }
  // A parent that redirects to the page we are on is that page: keep the child, drop the twin.
  const unique = crumbs.filter((c, i) => crumbs[i + 1]?.url !== c.url);
  if (unique.length) unique[unique.length - 1].last = true;
  return unique;
}
