import { InjectionToken, Pipe, PipeTransform, inject } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';

/** English fallback for every key the library renders; used when the app provides no translator. */
export const UI_DEFAULT_TEXTS: Readonly<Record<string, string>> = {
  'core.grid.loading': 'Loading…',
  'core.color.none': 'No own colour',
  'core.grid.empty': 'No items to display.',
  'core.grid.rowActions': 'Row actions',
  'core.grid.settings': 'Grid settings',
  'core.grid.resetLayout': 'Reset to default',
  'core.grid.pagerTop': 'Pagination above the table',
  'core.grid.columns': 'Columns',
  'core.grid.selected': 'selected',
  'core.grid.clearSelection': 'Clear',
  'core.grid.filter.search': 'Search',
  'core.grid.filter.clear': 'Clear',
  'common.filter.active': 'Active',
  'common.filter.deleted': 'Deleted',
  'common.filter.all': 'All',
  'pager.first': 'First page',
  'pager.prev': 'Previous page',
  'pager.next': 'Next page',
  'pager.last': 'Last page',
  'pager.pageSize': 'Per page',
  'pager.of': 'of',
  'pager.label': 'Pagination',
  'common.none': '—',
  'common.back': 'Back',
  'common.close': 'Close',
  'common.expand': 'Expand',
  'common.collapse': 'Collapse',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.ok': 'OK',
  'common.loading': 'Loading…',
  'sidePanel.show': 'Show side panel',
  'sidePanel.hide': 'Hide side panel',
  'sidePanel.resize': 'Resize side panel',
  'htmlEditor.source': 'Source',
  'htmlEditor.preview': 'Preview',
  'form.password.show': 'Show password',
  'form.password.hide': 'Hide password',
  'form.errors.required': 'This field is required.',
  'form.errors.email': 'Enter a valid email address.',
  'form.errors.minlength': 'Too short.',
  'form.errors.maxlength': 'Too long.',
  'form.errors.pattern': 'Invalid format.',
  'form.errors.min': 'Value is too small.',
  'form.errors.max': 'Value is too large.',
  'form.errors.matDatepickerParse': 'Enter a valid date.',
  'form.errors.matDatepickerMin': 'Date is too early.',
  'form.errors.matDatepickerMax': 'Date is too late.',
};

/**
 * Key -> text resolver. Apps plug their own i18n in:
 * `{ provide: UI_TRANSLATE, useFactory: () => { const i = inject(I18nService); return (k: string) => i.t(k); } }`
 * If the resolver reads a signal (active locale), labels update on locale change (the pipe is impure).
 */
export const UI_TRANSLATE = new InjectionToken<(key: string) => string>('UI_TRANSLATE', {
  providedIn: 'root',
  factory: () => (key: string) => UI_DEFAULT_TEXTS[key] ?? key,
});

export interface UiRefreshSignal {
  /** Matched against each grid's [refreshKey]. */
  grid: string;
}

/** Stream of "reload grid X" signals (e.g. from SignalR). Defaults to none. */
export const UI_REFRESH = new InjectionToken<Observable<UiRefreshSignal>>('UI_REFRESH', {
  providedIn: 'root',
  factory: () => EMPTY,
});

/**
 * Active locale for date formatting (`<ui-shared-display-date>`). A host returns its
 * locale signal's value so the display re-evaluates on language change:
 * `{ provide: UI_LOCALE, useFactory: () => { const i = inject(I18nService); return () => i.locale(); } }`
 */
export const UI_LOCALE = new InjectionToken<() => string>('UI_LOCALE', {
  providedIn: 'root',
  factory: () => () => 'en-US',
});

/** The one Angular date format `<ui-shared-display-date>` renders with. */
export const UI_DATE_FORMAT = new InjectionToken<string>('UI_DATE_FORMAT', {
  providedIn: 'root',
  factory: () => 'dd/MM/yyyy, HH:mm',
});

@Pipe({ name: 'uiTranslate', standalone: true, pure: false })
export class UiTranslatePipe implements PipeTransform {
  private translate = inject(UI_TRANSLATE);
  transform(key: string): string {
    return this.translate(key);
  }
}
