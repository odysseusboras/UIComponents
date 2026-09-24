import { ChangeDetectionStrategy, Component, NgZone, effect, inject, input, output, viewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventContentArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import elLocale from '@fullcalendar/core/locales/el';
import { UI_LOCALE, UI_TRANSLATE } from '@borassoft/ui-components';

/** One all-day entry of the month grid. `data` comes back on every click / action. */
export interface UiCalendarEvent<T = unknown> {
  id: string;
  /** yyyy-MM-dd */
  date: string;
  title: string;
  color?: string;
  data: T;
}

/** A hover button on every event (edit, delete …): `key` is what `eventAction` reports. */
export interface UiCalendarAction { key: string; icon: string; labelKey: string }

/**
 * Month grid of all-day events, fed lazily per visible range like the grid is fed per page:
 * `source(from, to)` answers the events of `[from, to)` (ISO dates). The shown month is
 * reported through `monthChange` (yyyy-MM); `dateClick` gives the clicked day, `eventClick`
 * the clicked event's data, `eventAction` the hover button pressed on an event.
 *
 *   <ui-shared-calendar [source]="load" [actions]="[{ key: 'edit', icon: 'edit', labelKey: 'common.edit' }]"
 *       (monthChange)="month.set($event)" (dateClick)="add($event)" (eventClick)="open($event)" (eventAction)="run($event)" />
 */
@Component({
  selector: 'ui-shared-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FullCalendarModule],
  templateUrl: './ui-shared-calendar.component.html',
  styleUrl: './ui-shared-calendar.component.scss',
})
export class UiSharedCalendarComponent<T = unknown> {
  source = input.required<(from: string, to: string) => Observable<UiCalendarEvent<T>[]>>();
  actions = input<UiCalendarAction[]>([]);
  /** yyyy-MM to open on; the calendar otherwise starts on the current month. */
  month = input<string | null>(null);
  /** Rows per day before "+n more" (FullCalendar `dayMaxEvents`). */
  maxPerDay = input(4);

  monthChange = output<string>();
  dateClick = output<string>();
  eventClick = output<T>();
  eventAction = output<{ action: string; data: T }>();

  private zone = inject(NgZone);
  private locale = inject(UI_LOCALE);
  private translate = inject(UI_TRANSLATE);
  private calendar = viewChild(FullCalendarComponent);
  private shown = '';

  protected options: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    firstDay: 1,
    height: 'auto',
    fixedWeekCount: false,
    headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
    events: (info, success, failure) => {
      this.source()(info.startStr.slice(0, 10), info.endStr.slice(0, 10))
        .subscribe({
          next: rows => success(rows.map(e => ({
            id: e.id, title: e.title, date: e.date, allDay: true,
            backgroundColor: e.color, borderColor: e.color, textColor: '#ffffff', extendedProps: { data: e.data },
          }))),
          error: err => failure(err),
        });
    },
    datesSet: info => {
      const d = info.view.currentStart;
      const month = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}`;
      if (month === this.shown) return;
      this.shown = month;
      this.zone.run(() => this.monthChange.emit(month));
    },
    dateClick: (arg: DateClickArg) => this.zone.run(() => this.dateClick.emit(arg.dateStr.slice(0, 10))),
    eventClick: arg => this.zone.run(() => this.eventClick.emit(arg.event.extendedProps['data'] as T)),
    eventContent: arg => this.render(arg),
  };

  constructor() {
    effect(() => {
      const api = this.calendar()?.getApi();
      if (!api) return;
      api.setOption('locale', this.locale() === 'el' ? elLocale : 'en');
      api.setOption('dayMaxEvents', this.maxPerDay());
      const month = this.month();
      if (month && month !== this.shown) api.gotoDate(`${month}-01`);
    });
  }

  /** Re-asks `source` for the visible range (after a save or delete). */
  reload(): void { this.calendar()?.getApi()?.refetchEvents(); }

  /** FullCalendar sizes against a visible container - call when the host becomes visible again. */
  resize(): void { this.calendar()?.getApi()?.updateSize(); }

  /** FullCalendar builds event bodies as raw DOM outside Angular: the hover buttons hop back into the zone. */
  private render(arg: EventContentArg): { domNodes: HTMLElement[] } {
    const data = arg.event.extendedProps['data'] as T;
    const wrap = document.createElement('div');
    wrap.className = 'ui-shared-calendar__event';
    const title = document.createElement('span');
    title.className = 'ui-shared-calendar__event-title';
    title.textContent = arg.event.title;
    title.title = arg.event.title;
    wrap.appendChild(title);
    const actions = this.actions();
    if (actions.length) {
      const bar = document.createElement('span');
      bar.className = 'ui-shared-calendar__event-actions';
      for (const a of actions) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ui-shared-calendar__event-btn';
        btn.title = this.translate(a.labelKey);
        btn.setAttribute('aria-label', btn.title);
        const icon = document.createElement('span');
        icon.className = 'material-icons';
        icon.textContent = a.icon;
        btn.appendChild(icon);
        btn.addEventListener('click', e => {
          e.stopPropagation();
          this.zone.run(() => this.eventAction.emit({ action: a.key, data }));
        });
        bar.appendChild(btn);
      }
      wrap.appendChild(bar);
    }
    return { domNodes: [wrap] };
  }
}
