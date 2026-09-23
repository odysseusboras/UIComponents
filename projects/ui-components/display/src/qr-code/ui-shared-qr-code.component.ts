import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import qrcode from 'qrcode-generator';

/**
 * Renders a string (e.g. a verification URL) as an actual QR code. Pure
 * client-side, zero network: qrcode-generator builds a scalable SVG that fills
 * the host box (size it from the parent).
 */
@Component({
  selector: 'ui-shared-qr-code',
  standalone: true,
  templateUrl: './ui-shared-qr-code.component.html',
  styleUrl: './ui-shared-qr-code.component.scss',
})
export class UiSharedQrCodeComponent {
  /** The payload to encode. */
  value = input.required<string>();

  private sanitizer = inject(DomSanitizer);

  protected svg = computed<SafeHtml | ''>(() => {
    const v = this.value();
    if (!v) return '';
    const qr = qrcode(0, 'M');
    qr.addData(v);
    qr.make();
    return this.sanitizer.bypassSecurityTrustHtml(qr.createSvgTag({ scalable: true, margin: 0 }));
  });
}
