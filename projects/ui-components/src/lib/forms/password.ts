import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export type PasswordStrength = 'weak' | 'medium' | 'strong';

/**
 * strong = 12+ characters with a lowercase letter, an uppercase letter, a digit and a symbol (anything else);
 * medium = 8+ characters with three of those four; weak otherwise. Letters are any script (Greek too).
 */
export function passwordStrength(value: string): PasswordStrength {
  const classes = [/\p{Ll}/u, /\p{Lu}/u, /\p{Nd}/u, /[^\p{L}\p{Nd}]/u].filter(re => re.test(value)).length;
  const length = [...value].length;
  if (length >= 12 && classes === 4) return 'strong';
  if (length >= 8 && classes >= 3) return 'medium';
  return 'weak';
}

/** `{ passwordWeak: true }` unless the value is strong; an empty value is left to `Validators.required`. */
export const strongPassword: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  !control.value || passwordStrength(control.value) === 'strong' ? null : { passwordWeak: true };

/**
 * Group validator: `{ passwordMismatch: true }` on the group AND on control `b` (so its field shows the error)
 * while the two values differ. Only that error is ever added or removed on `b`.
 */
export function matchingFields(a: string, b: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const first = group.get(a);
    const second = group.get(b);
    if (!first || !second) return null;
    const mismatch = !!second.value && first.value !== second.value;
    const { passwordMismatch, ...others } = second.errors ?? {};
    if (mismatch && !passwordMismatch) second.setErrors({ ...others, passwordMismatch: true });
    if (!mismatch && passwordMismatch) second.setErrors(Object.keys(others).length ? others : null);
    return mismatch ? { passwordMismatch: true } : null;
  };
}
