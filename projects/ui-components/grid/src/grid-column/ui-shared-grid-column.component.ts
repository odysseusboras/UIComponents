import { Component, TemplateRef, contentChild, input } from '@angular/core';

/**
 * Column descriptor projected as a child of <ui-shared-grid>. Carries:
 *   - <c>key</c>: short identifier (used by ngFor + as a debug aid).
 *   - <c>labelKey</c>: translation key for the table header cell.
 *   - <c>sortField</c>: OData PascalCase field name for <c>$orderby</c>.
 *                       Omit to make the column non-sortable.
 *   - <c>align</c>: optional cell alignment hint (default left).
 *   - A single projected <c>#cell</c> ng-template that receives the row
 *     via <c>let-row</c> and renders the cell body.
 *
 * Example:
 * <pre>
 *   &lt;ui-shared-grid-column key="email"
 *                          labelKey="users.email"
 *                          sortField="Email"&gt;
 *     &lt;ng-template #cell let-u&gt;{{ u.email }}&lt;/ng-template&gt;
 *   &lt;/ui-shared-grid-column&gt;
 * </pre>
 */
@Component({
  selector: 'ui-shared-grid-column',
  standalone: true,
  templateUrl: './ui-shared-grid-column.component.html',
  styleUrl: './ui-shared-grid-column.component.scss',
})
export class UiSharedGridColumnComponent {
  key = input.required<string>();
  labelKey = input.required<string>();
  sortField = input<string | undefined>(undefined);
  align = input<'left' | 'right' | 'center'>('left');

  /** Body cell template. Required — receives the row via <c>$implicit</c>. */
  cell = contentChild.required<TemplateRef<{ $implicit: unknown }>>('cell');

  /** Whether this column participates in sorting (has a sortField). */
  get sortable(): boolean { return !!this.sortField(); }
}
