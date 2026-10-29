import { Signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, Validators } from '@angular/forms';
import { map, startWith, switchMap } from 'rxjs';

/**
 * Whether the control is required, as a signal that follows the control's validators: a caller that adds or removes
 * `Validators.required` later (and calls `updateValueAndValidity`) flips the field's marker at once.
 * Call it in a field initialiser or constructor (injection context).
 */
export function requiredSignal(ctrl: Signal<AbstractControl>): Signal<boolean> {
  // A fresh object on every validation pass, not the status itself: adding or removing a validator usually leaves the status
  // as it was (VALID -> VALID, or INVALID for another reason), and a signal that did not change would keep the old answer.
  const pass = toSignal(toObservable(ctrl).pipe(switchMap(c => c.statusChanges.pipe(startWith(null))), map(() => ({}))), { initialValue: {} });
  return computed(() => { pass(); return ctrl().hasValidator(Validators.required); });
}
