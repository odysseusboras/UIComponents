import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, filter } from 'rxjs';
import { ConfirmDialogData, UiSharedConfirmDialogComponent } from './ui-shared-confirm-dialog.component';

/**
 * The ONE way to ask the user "Yes / No" before an action. Every confirmation
 * opens the same dialog with the same size and focus behaviour; the returned
 * stream emits only on explicit confirm, so callers subscribe to the "yes"
 * branch and never check the result.
 */
@Injectable({ providedIn: 'root' })
export class UiConfirmService {
  private dialog = inject(MatDialog);

  confirm(data: ConfirmDialogData): Observable<true> {
    return this.dialog
      .open<UiSharedConfirmDialogComponent, ConfirmDialogData, boolean>(UiSharedConfirmDialogComponent, {
        data,
        width: '440px',
        maxWidth: '92vw',
        autoFocus: 'dialog',
        restoreFocus: true,
      })
      .afterClosed()
      .pipe(filter((ok): ok is true => ok === true));
  }
}
