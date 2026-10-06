import { Injectable, signal } from '@angular/core';

/**
 * Tracks in-flight work for `<ui-shared-loading-overlay>`. The host calls
 * start()/stop() around every request (e.g. from an HTTP interceptor); the
 * overlay reads `visible`.
 *
 * `pending` is immediate (the overlay blocks clicks from the first request);
 * `visible` is debounced: it only turns on if work stays pending past a short
 * grace period (so fast calls don't flash the spinner), and both turn off the
 * moment the last call settles.
 */
@Injectable({ providedIn: 'root' })
export class UiLoadingService {
  private active = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private static readonly GRACE_MS = 250;

  /** True while a request has been pending longer than the grace period. */
  readonly visible = signal(false);
  /** True from the first start() to the last stop(): the overlay blocks input at once, before anything is drawn. */
  readonly pending = signal(false);

  start(): void {
    this.active++;
    this.pending.set(true);
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
      this.pending.set(false);
    }
  }
}
