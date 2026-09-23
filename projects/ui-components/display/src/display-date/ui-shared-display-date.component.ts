import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UI_DATE_FORMAT, UI_LOCALE } from '@borassoft/ui-components';

/** Kept only for call-site compatibility — it no longer changes the output. */
export type DisplayDateMode = 'datetime' | 'date';

/**
 * Single source of truth for rendering ANY date.
 *
 *   <ui-shared-display-date [value]="row.dateCreated" />
 *   <ui-shared-display-date [value]="row.dateCreated" empty="never" />
 *
 * ONE format app-wide, from `UI_DATE_FORMAT` (default `dd/MM/yyyy, HH:mm`),
 * rendered in the locale `UI_LOCALE` returns. The `mode` input is accepted
 * but IGNORED so existing `mode="date"` call sites keep working. Because the
 * locale is read inside a computed, a host whose `UI_LOCALE` reads a signal
 * gets a re-render on language change.
 */
@Component({
  selector: 'ui-shared-display-date',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-shared-display-date.component.html',
  styleUrl: './ui-shared-display-date.component.scss',
})
export class UiSharedDisplayDateComponent {
  /** The date to render. Accepts ISO-8601 strings (the wire format), Date, number, null, undefined. */
  value = input<Date | string | number | null | undefined>(null);

  /** Accepted but IGNORED — there is one format (date + time). Kept so existing call sites don't break. */
  mode = input<DisplayDateMode>('datetime');

  /** What to render when the value is null/empty. Defaults to an em-dash. */
  empty = input<string>('—');

  private locale = inject(UI_LOCALE);
  private format = inject(UI_DATE_FORMAT);

  /** NULL when the value can't be rendered — the template branches to the [empty] rendering. */
  protected formatted = computed<string | null>(() => {
    const v = this.value();
    if (v === null || v === undefined || v === '') return null;
    // DatePipe throws on text it can't parse; a bad value shows as empty, not a broken page.
    try { return new DatePipe(this.locale()).transform(v, this.format); } catch { return null; }
  });
}
