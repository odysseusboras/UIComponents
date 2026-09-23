import { Injectable, Provider } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MatDateFormats, NativeDateAdapter } from '@angular/material/core';

/** Sentinel format the adapter recognises as "the text-input format". */
export const UI_DATE_INPUT_FORMAT = 'dd/MM/yyyy';

/**
 * Datepicker formats: every date INPUT renders and parses as dd/MM/yyyy
 * (day-first, matching <ui-shared-display-date>), the calendar popup keeps
 * the native month/year labels.
 */
export const UI_DATE_FORMATS: MatDateFormats = {
  ...MAT_NATIVE_DATE_FORMATS,
  parse: { dateInput: UI_DATE_INPUT_FORMAT },
  display: { ...MAT_NATIVE_DATE_FORMATS.display, dateInput: UI_DATE_INPUT_FORMAT },
};

/**
 * NativeDateAdapter with a fixed day-first text format. The stock adapter goes
 * through the browser's Intl locale (US builds show M/D/YYYY and parse "05/07"
 * as May 7); this pins dd/MM/yyyy for typing AND display, whatever the locale.
 */
@Injectable()
export class UiDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: unknown): string {
    if (displayFormat === UI_DATE_INPUT_FORMAT) {
      const dd = `${date.getDate()}`.padStart(2, '0');
      const mm = `${date.getMonth() + 1}`.padStart(2, '0');
      return `${dd}/${mm}/${date.getFullYear()}`;
    }
    return super.format(date, displayFormat as Intl.DateTimeFormatOptions);
  }

  override parse(value: unknown): Date | null {
    if (typeof value === 'string') {
      const text = value.trim();
      if (!text) return null;
      const m = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
      if (!m) return this.invalid();
      const day = +m[1];
      const month = +m[2] - 1;
      const year = +m[3] < 100 ? 2000 + +m[3] : +m[3];
      const parsed = new Date(year, month, day);
      // Reject rollovers like 31/02 -> 03/03: the parts must survive intact.
      return parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === day
        ? parsed
        : this.invalid();
    }
    return super.parse(value);
  }
}

/** Wires the day-first date adapter + formats into the app (`providers: [provideUiDates()]`). */
export function provideUiDates(): Provider[] {
  return [
    { provide: DateAdapter, useClass: UiDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: UI_DATE_FORMATS },
  ];
}
