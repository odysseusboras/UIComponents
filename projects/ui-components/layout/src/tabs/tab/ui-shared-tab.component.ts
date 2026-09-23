import { ChangeDetectionStrategy, Component, TemplateRef, input, viewChild } from '@angular/core';

/**
 * One tab of <ui-shared-tabs>. Its content renders lazily, only while selected.
 * Label: `labelKey` (translated) or `label` (raw text).
 */
@Component({
  selector: 'ui-shared-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-shared-tab.component.html',
  styleUrl: './ui-shared-tab.component.scss',
})
export class UiSharedTabComponent {
  labelKey = input<string>('');
  label = input<string>('');
  content = viewChild.required<TemplateRef<unknown>>('content');
}
