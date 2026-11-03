import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UiTranslatePipe } from '@borassoft/ui-components';
import { UiSharedSpinnerComponent } from '@borassoft/ui-components/feedback';

/**
 * The one file input: a button that opens the native picker and emits the
 * chosen file(s). The hidden `<input type="file">` is reset after each pick so
 * choosing the same file twice still emits.
 *
 * Like ui-shared-button, `loading` shows a spinner and `loadingKey` (when set) and disables it.
 *
 *   <ui-shared-file-button labelKey="logo.upload" icon="upload" accept="image/*" (filesSelected)="upload($event[0])" />
 *   <ui-shared-file-button labelKey="import.upload" accept=".xlsx" [loading]="uploading()" loadingKey="import.running" (filesSelected)="upload($event[0])" />
 */
@Component({
  selector: 'ui-shared-file-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, UiTranslatePipe, UiSharedSpinnerComponent],
  templateUrl: './ui-shared-file-button.component.html',
  styleUrl: './ui-shared-file-button.component.scss',
})
export class UiSharedFileButtonComponent {
  labelKey = input.required<string>();
  icon = input<string>('upload');
  /** Native `accept` filter, e.g. `image/*` or `.pdf,.xml`. */
  accept = input<string>('');
  multiple = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  /** Shows a spinner and, when set, `loadingKey` instead of the label; the button is disabled meanwhile. */
  loading = input(false, { transform: booleanAttribute });
  loadingKey = input<string>('');
  variant = input<'flat' | 'stroked'>('flat');
  color = input<'primary' | 'accent' | 'warn' | undefined>('primary');
  filesSelected = output<File[]>();

  protected get label(): string { return this.loading() && this.loadingKey() ? this.loadingKey() : this.labelKey(); }

  protected onChange(el: HTMLInputElement): void {
    const files = Array.from(el.files ?? []);
    el.value = '';
    if (files.length) this.filesSelected.emit(files);
  }
}
