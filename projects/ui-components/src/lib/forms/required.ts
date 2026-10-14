import { Signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, Validators } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';

/**
 * Whether the control is required, as a signal that follows the control's validators: a caller that adds or removes
 * `Validators.required` later (and calls `updateValueAndValidity`) flips the field's marker at once.
 * Call it in a field initialiser or constructor (injection context).
 */
export function requiredSignal(ctrl: Signal<AbstractControl>): Signal<boolean> {
  const status = toSignal(toObservable(ctrl).pipe(switchMap(c => c.statusChanges.pipe(startWith(c.status)))), { initialValue: null });
  return computed(() => { status(); return ctrl().hasValidator(Validators.required); });
}
