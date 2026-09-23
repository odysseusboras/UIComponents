import { AbstractControl } from '@angular/forms';

/**
 * The translation key of the first error on a touched/dirty control, as
 * `form.errors.<validatorKey>` — the built-in validators and any custom one
 * (`{ vatNumber: true }` → `form.errors.vatNumber`). Pair with `uiTranslate`
 * (or the host's own pipe): `@if (firstError(ctrl); as key) { <mat-error>{{ key | uiTranslate }}</mat-error> }`
 */
export function firstError(control: AbstractControl | null): string | null {
  if (!control || !control.errors || !(control.touched || control.dirty)) return null;
  const key = Object.keys(control.errors)[0];
  return key ? `form.errors.${key}` : null;
}
