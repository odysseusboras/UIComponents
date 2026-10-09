import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
import { UiTranslatePipe } from '@borassoft/ui-components';
import { UiSharedIconComponent } from '../icon/ui-shared-icon.component';

/**
 * Image carousel: the images crossfade one after the other; arrows and a dot per image pick one by hand.
 * Projected content sits on top of the images (a hero's title and buttons) and the host styles
 * any veil it wants between the two through `--ui-carousel-veil`.
 *
 *   <ui-shared-carousel [images]="['/images/home-1.jpg', '/images/home-2.jpg']" [interval]="7000">
 *     <h1>…</h1>
 *   </ui-shared-carousel>
 */
@Component({
  selector: 'ui-shared-carousel',
  standalone: true,
  imports: [UiTranslatePipe, UiSharedIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-shared-carousel.component.html',
  styleUrl: './ui-shared-carousel.component.scss',
})
export class UiSharedCarouselComponent {
  images = input.required<string[]>();
  /** Milliseconds between two images; 0 = no auto-play. */
  interval = input(7000);
  readonly current = signal(0);
  step(by: number): void { this.current.update(i => (i + by + this.images().length) % this.images().length); }

  constructor() {
    // Restarts when the images or the interval change; the cleanup also runs on destroy.
    effect(onCleanup => {
      const n = this.images().length;
      const ms = this.interval();
      if (ms <= 0 || n < 2) return;
      const timer = setInterval(() => this.current.update(i => (i + 1) % n), ms);
      onCleanup(() => clearInterval(timer));
    });
  }
}
