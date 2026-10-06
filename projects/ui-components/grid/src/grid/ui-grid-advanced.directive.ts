import { Directive, contentChildren } from '@angular/core';
import { UI_GRID_FILTER } from '@borassoft/ui-components';

/**
 * The «advanced search» of a grid: the filters inside it stay out of the filter panel until the user opens them
 * with the panel's toggle. They keep filtering while hidden (the toggle shows how many are applied).
 *
 *   <ui-shared-grid …>
 *     <ui-shared-text-input labelKey="x.name" [fields]="['Name']" />
 *     <div uiGridAdvanced>
 *       <ui-shared-multi-select labelKey="x.region" [options]="regions" field="RegionId" />
 *     </div>
 *   </ui-shared-grid>
 */
@Directive({ selector: '[uiGridAdvanced]', standalone: true, host: { style: 'display: contents' } })
export class UiGridAdvancedDirective {
  readonly filters = contentChildren(UI_GRID_FILTER);
}
