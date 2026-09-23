import { Component, inject } from '@angular/core';
import { UiTranslatePipe } from '@borassoft/ui-components';
import { UiLoadingService } from './loading.service';

/**
 * App-wide loading overlay shown while `UiLoadingService` reports pending work.
 * A slim progress bar slides across the top and a small floating card holds an
 * animated ring; pointer input is blocked so the user can't fire conflicting
 * actions until the request settles. Mount it once, in the root component.
 */
@Component({
  selector: 'ui-shared-loading-overlay',
  standalone: true,
  imports: [UiTranslatePipe],
  templateUrl: './ui-shared-loading-overlay.component.html',
  styleUrl: './ui-shared-loading-overlay.component.scss',
})
export class UiSharedLoadingOverlayComponent {
  protected loading = inject(UiLoadingService);
}
