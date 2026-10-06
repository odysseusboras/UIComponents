import { Injectable, NgZone, inject, signal } from '@angular/core';

/**
 * Window scroll position as signals. `pastHeader` is true once the app header (`--header-h`,
 * 56px when unset) has scrolled out of view, so a shell can show the brand in its side-panel
 * head instead of the header (ATLAS / EINV shells).
 */
@Injectable({ providedIn: 'root' })
export class UiScrollService {
  readonly y = signal(0);
  readonly pastHeader = signal(false);

  constructor() {
    if (typeof window === 'undefined') return;
    const zone = inject(NgZone);
    const read = () => {
      const y = window.scrollY;
      const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 56;
      const past = y > h;
      if (y !== this.y()) this.y.set(y);
      if (past !== this.pastHeader()) this.pastHeader.set(past);
    };
    zone.runOutsideAngular(() => window.addEventListener('scroll', () => zone.run(read), { passive: true }));
    read();
  }
}
