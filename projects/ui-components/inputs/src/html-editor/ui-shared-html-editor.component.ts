import {
  Component, ElementRef, Injector, ViewChild, afterNextRender, computed, forwardRef, inject, input, numberAttribute, signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiTranslatePipe } from '@borassoft/ui-components';

/**
 * Tiny HTML editor with a Source / Preview toggle.
 *
 *   - SOURCE  : textarea holding the raw HTML markup.
 *   - PREVIEW : the same markup rendered via `bypassSecurityTrustHtml` — meant
 *               for trusted (admin-authored) content only.
 *
 * Implements `ControlValueAccessor` so it slots straight into a reactive form
 * (`formControlName="bodyEn"`). The current mode is component-local; the
 * bound form value is always the raw HTML string.
 *
 *   <ui-shared-html-editor formControlName="bodyEn" rows="16" />
 */
@Component({
  selector: 'ui-shared-html-editor',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, UiTranslatePipe],
  templateUrl: './ui-shared-html-editor.component.html',
  styleUrl: './ui-shared-html-editor.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UiSharedHtmlEditorComponent),
    multi: true,
  }],
})
export class UiSharedHtmlEditorComponent implements ControlValueAccessor {
  /** Visible row count for the source textarea. */
  rows = input(16, { transform: numberAttribute });

  /** Optional placeholder shown in the source textarea when empty. */
  placeholder = input<string>('');

  private sanitizer = inject(DomSanitizer);
  private injector = inject(Injector);
  @ViewChild('ta') private ta?: ElementRef<HTMLTextAreaElement>;

  protected value = signal<string>('');
  protected disabled = signal<boolean>(false);
  protected mode = signal<'source' | 'preview'>('source');

  protected previewHtml = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.value() || ''));

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: string | null): void {
    this.value.set(v ?? '');
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  protected onInput(ev: Event): void {
    const next = (ev.target as HTMLTextAreaElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void { this.onTouched(); }

  protected showSource(): void {
    this.mode.set('source');
    // The textarea only exists again after the next render.
    afterNextRender(() => this.ta?.nativeElement.focus(), { injector: this.injector });
  }
  protected showPreview(): void { this.mode.set('preview'); }
}
