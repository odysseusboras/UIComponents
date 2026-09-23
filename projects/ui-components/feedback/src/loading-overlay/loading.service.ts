import { Injectable, signal } from '@angular/core';

/**
 * Tracks in-flight work for `<ui-shared-loading-overlay>`. The host calls
 * start()/stop() around every request (e.g. from an HTTP interceptor); the
 * overlay reads `visible`.
 *
 * `visible` is debounced: it only turns on if work stays pending past a short
 * grace period (so fast calls don't flash the overlay), and turns off the
 * moment the last call settles.
 */
@Injectable({ providedIn: 'root' })
export class UiLoadingService {
  private active = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private static readonly GRACE_MS = 250;

  /** True while a request has been pending longer than the grace period. */
  readonly visible = signal(false);

  start(): void {
    this.active++;
    if (this.active === 1 && this.timer === null) {
      this.timer = setTimeout(() => {
        this.timer = null;
        if (this.active > 0) this.visible.set(true);
      }, UiLoadingService.GRACE_MS);
    }
  }

  stop(): void {
    this.active = Math.max(0, this.active - 1);
    if (this.active === 0) {
      if (this.timer !== null) { clearTimeout(this.timer); this.timer = null; }
      this.visible.set(false);
    }
  }
}
