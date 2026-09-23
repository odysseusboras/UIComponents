import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UiTranslatePipe } from '@borassoft/ui-components';

/**
 * Inputs for the shared confirm dialog. Pass translation keys (preferred)
 * or literal strings via the *Text fallbacks. The buttons are always
 * "No" / "Yes" so the title + message must make the action unambiguous.
 */
export interface ConfirmDialogData {
  titleKey?: string;
  titleText?: string;
  messageKey?: string;
  messageText?: string;
  confirmKey?: string;
  cancelKey?: string;
  /** Drives only the icon ("warn" = warning, "primary" = question); the Yes button is always primary. */
  variant?: 'warn' | 'primary';
}

/**
 * Generic Yes / No dialog. Never open it directly — go through
 * `UiConfirmService.confirm(data)` so every confirmation looks and behaves
 * identically.
 */
@Component({
  selector: 'ui-shared-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, UiTranslatePipe],
  templateUrl: './ui-shared-confirm-dialog.component.html',
  styleUrl: './ui-shared-confirm-dialog.component.scss',
})
export class UiSharedConfirmDialogComponent {
  protected ref = inject<MatDialogRef<UiSharedConfirmDialogComponent, boolean>>(MatDialogRef);
  protected data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  protected get confirmKey() { return this.data.confirmKey ?? 'common.yes'; }
  protected get cancelKey()  { return this.data.cancelKey  ?? 'common.no'; }
  protected get variant()    { return this.data.variant    ?? 'warn'; }

  confirm(): void { this.ref.close(true); }
  cancel(): void  { this.ref.close(false); }
}
