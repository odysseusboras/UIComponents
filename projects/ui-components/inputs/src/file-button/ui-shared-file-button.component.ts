import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UiTranslatePipe } from '@borassoft/ui-components';

/**
 * The one file input: a button that opens the native picker and emits the
 * chosen file(s). The hidden `<input type="file">` is reset after each pick so
 * choosing the same file twice still emits.
 *
 *   <ui-shared-file-button labelKey="logo.upload" icon="upload" accept="image/*" (filesSelected)="upload($event[0])" />
 */
@Component({
  selector: 'ui-shared-file-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, UiTranslatePipe],
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
  variant = input<'flat' | 'stroked'>('flat');
  color = input<'primary' | 'accent' | 'warn' | undefined>('primary');
  filesSelected = output<File[]>();

  protected onChange(el: HTMLInputElement): void {
    const files = Array.from(el.files ?? []);
    el.value = '';
    if (files.length) this.filesSelected.emit(files);
  }
}
