import { Directive, ElementRef, afterRender, inject, signal } from '@angular/core';

/**
 * Tells whether the host rendered any element at all. Lets a template hide a
 * control whose projected content ended up empty (a row-actions menu with no
 * items for that row) without knowing what the content decides.
 *
 *   <div hidden uiEmpty #probe="uiEmpty"><ng-container [ngTemplateOutlet]="actions" /></div>
 *   @if (!probe.empty()) { ...trigger... }
 */
@Directive({ selector: '[uiEmpty]', standalone: true, exportAs: 'uiEmpty' })
export class UiEmptyDirective {
  readonly empty = signal(true);
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterRender({ read: () => this.empty.set(this.el.nativeElement.childElementCount === 0) });
  }
}
