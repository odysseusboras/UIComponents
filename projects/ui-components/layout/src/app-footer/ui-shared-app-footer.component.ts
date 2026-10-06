import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Slim application footer: `[slot=start]` (copyright / owner), `[slot=links]` (terms, privacy, …),
 * `[slot=end]` (version). Wraps on narrow screens.
 */
@Component({
  selector: 'ui-shared-app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-shared-app-footer.component.html',
  styleUrl: './ui-shared-app-footer.component.scss',
  host: { class: 'ui-shared-app-footer', role: 'contentinfo' },
})
export class UiSharedAppFooterComponent {}
