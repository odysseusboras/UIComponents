import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiTranslatePipe } from '@borassoft/ui-components';

/**
 * A stored reference to a lookup / organisation row, marked when that row has since been
 * soft-deleted: the label is struck through and a small "inactive" mark follows it. Use it in
 * grids and read-only views wherever old data may point to a value that is no longer offered.
 *
 *   <ui-shared-inactive-value [label]="a.regionName" [inactive]="a.regionIsDeleted" />
 */
@Component({
  selector: 'ui-shared-inactive-value',
  standalone: true,
  imports: [MatTooltipModule, UiTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (inactive()) {
      <s class="ui-shared-inactive-value__label">{{ label() }}</s>
      <span class="ui-shared-inactive-mark" [matTooltip]="'common.inactiveHint' | uiTranslate">{{ 'common.inactive' | uiTranslate }}</span>
    } @else {
      <span class="ui-shared-inactive-value__label">{{ label() }}</span>
    }
  `,
  // The label shrinks with an ellipsis; the mark never does, so a narrow grid column still shows it whole.
  styles: `:host { display: flex; align-items: center; gap: 0.4rem; min-width: 0; max-width: 100%; } .ui-shared-inactive-value__label { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .ui-shared-inactive-mark { flex: 0 0 auto; }`,
})
export class UiSharedInactiveValueComponent {
  label = input<string | null | undefined>('');
  inactive = input(false, { transform: booleanAttribute });
}
