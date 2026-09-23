import { Pipe, PipeTransform, inject } from '@angular/core';
import { UI_TRANSLATE } from '../i18n';

/**
 * One choice for every option-based input (select, radio group,
 * segmented). Give an already translated `label`, or a `labelKey` resolved
 * through UI_TRANSLATE.
 */
export interface SelectOption<T = string> {
  value: T;
  label?: string;
  labelKey?: string;
}

/** The text an option shows. */
export function optionText(o: SelectOption<unknown>, translate: (key: string) => string): string {
  return o.labelKey ? translate(o.labelKey) : o.label ?? String(o.value ?? '');
}

/** `{{ option | uiOptionText }}` — impure so labels follow a locale change, like `uiTranslate`. */
@Pipe({ name: 'uiOptionText', standalone: true, pure: false })
export class UiOptionTextPipe implements PipeTransform {
  private translate = inject(UI_TRANSLATE);
  transform(option: SelectOption<unknown>): string {
    return optionText(option, this.translate);
  }
}
