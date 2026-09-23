import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { UI_TRANSLATE } from '@borassoft/ui-components';

/**
 * Single entry point for transient user feedback. Wraps {@link MatSnackBar}
 * so callers don't need to know about durations, panel classes or positioning.
 *
 * Defaults (all top-center): success / info 3s, warn 5s, error 6s.
 *
 * Snackbar panels render in the CDK overlay, outside any component scope, so
 * their colours come from the global theme (`ui-shared-toast--success|info|warn|error`).
 */
@Injectable({ providedIn: 'root' })
export class UiNotificationService {
  private snack = inject(MatSnackBar);
  private translate = inject(UI_TRANSLATE);

  success(message: string, opts?: Partial<MatSnackBarConfig>): void {
    this.show(message, { duration: 3000, panelClass: ['ui-shared-toast', 'ui-shared-toast--success'], ...opts });
  }

  info(message: string, opts?: Partial<MatSnackBarConfig>): void {
    this.show(message, { duration: 3000, panelClass: ['ui-shared-toast', 'ui-shared-toast--info'], ...opts });
  }

  warn(message: string, opts?: Partial<MatSnackBarConfig>): void {
    this.show(message, { duration: 5000, panelClass: ['ui-shared-toast', 'ui-shared-toast--warn'], ...opts });
  }

  error(message: string, opts?: Partial<MatSnackBarConfig>): void {
    this.show(message, { duration: 6000, panelClass: ['ui-shared-toast', 'ui-shared-toast--error'], ...opts });
  }

  private show(message: string, config: MatSnackBarConfig): void {
    this.snack.open(message, this.translate('common.ok'), {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      ...config,
    });
  }
}
