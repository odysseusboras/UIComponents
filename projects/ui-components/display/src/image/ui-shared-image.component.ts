import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';

/**
 * An image shown as it is (a logo, a brand mark, a preview): scaled to fit `height` x `maxWidth`
 * with its aspect ratio kept, no frame, padding or background of its own. `fullWidth` fills its
 * container's width instead, `height` then being the most it may grow. Without a `src`, or when it
 * fails to load, it shows `fallback` (or nothing).
 *
 *   <ui-shared-image [src]="logoUrl" [fallback]="company.name" [height]="32" />
 */
@Component({
  selector: 'ui-shared-image',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-shared-image.component.html',
  styleUrl: './ui-shared-image.component.scss',
  host: {
    class: 'ui-shared-image',
    '[class.ui-shared-image--full]': 'fullWidth()',
    '[style.--ui-image-height.px]': 'height()',
    '[style.--ui-image-max-width.px]': 'maxWidth() ?? height() * 4',
  },
})
export class UiSharedImageComponent {
  src = input<string | null | undefined>(null);
  alt = input('');
  /** Text shown instead of a missing or broken image; empty shows nothing. */
  fallback = input<string | null | undefined>(null);
  height = input(40);
  /** Defaults to four times the height. */
  maxWidth = input<number | null>(null);
  /** Fill the container's width (aspect ratio kept, at most `height` tall). */
  fullWidth = input(false);

  /** Reset whenever the source changes, so a new image gets its own chance to load. */
  private failed = linkedSignal({ source: this.src, computation: () => false });
  protected shown = computed(() => this.failed() ? null : this.src() || null);

  protected onError(): void {
    this.failed.set(true);
  }
}
