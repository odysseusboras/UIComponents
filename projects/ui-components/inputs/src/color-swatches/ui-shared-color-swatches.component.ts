import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UiTranslatePipe } from '@borassoft/ui-components';

/** The default swatch palette; the first entry is the natural default for a new record. */
export const UI_COLOR_PRESETS = [
  '#0369a1', '#0d9488', '#b45309', '#15803d',
  '#b91c1c', '#7c3aed', '#0c4a6e', '#db2777',
];

/**
 * A row of colour swatches bound to a string control (`#rrggbb`). With `optional` a
 * leading "none" swatch clears the value - the record then inherits its parent's colour.
 *
 *   <ui-shared-color-swatches [control]="form.controls.color" optional />
 */
@Component({
  selector: 'ui-shared-color-swatches',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiTranslatePipe],
  templateUrl: './ui-shared-color-swatches.component.html',
  styleUrl: './ui-shared-color-swatches.component.scss',
})
export class UiSharedColorSwatchesComponent {
  control = input.required<FormControl<string> | FormControl<string | null>>();
  presets = input<string[]>(UI_COLOR_PRESETS);
  optional = input(false, { transform: booleanAttribute });
  /** Translation key of the "none" swatch's label. */
  noneKey = input('core.color.none');

  protected pick(hex: string | null): void { (this.control() as FormControl<string | null>).setValue(hex); }
}
