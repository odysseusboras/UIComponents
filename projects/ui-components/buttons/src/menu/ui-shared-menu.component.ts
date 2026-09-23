import { ChangeDetectionStrategy, Component, booleanAttribute, input, output, viewChild } from '@angular/core';
import { MatMenu, MatMenuModule } from '@angular/material/menu';

/**
 * Dropdown menu: the trigger is whatever you project into `[slot=trigger]`
 * (a ui-shared-button / icon-button), the rest is the panel content
 * (<ui-shared-menu-item>, <ui-shared-divider>, or custom rows).
 * Arrow / Home / End keys move between the rows, Escape closes.
 *
 *   <ui-shared-menu align="end" (opened)="reload()">
 *     <ui-shared-icon-button slot="trigger" icon="more_vert" tooltipKey="core.grid.rowActions" />
 *     <ui-shared-menu-item icon="edit" labelKey="common.edit" (click)="edit()" />
 *   </ui-shared-menu>
 */
@Component({
  selector: 'ui-shared-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatMenuModule],
  templateUrl: './ui-shared-menu.component.html',
  styleUrl: './ui-shared-menu.component.scss',
})
export class UiSharedMenuComponent {
  /** Which edge of the trigger the panel aligns to. */
  align = input<'start' | 'end'>('start');
  /** Extra class on the overlay panel (for app-level width / layout rules). */
  panelClass = input<string>('');
  /** No inner padding (rows carry their own). */
  flush = input(false, { transform: booleanAttribute });
  /** Wide panel capped to the viewport, scrolls inside (notification feeds). */
  wide = input(false, { transform: booleanAttribute });
  opened = output<void>();
  closed = output<void>();

  private panel = viewChild.required(MatMenu);

  protected get panelClasses(): string {
    return ['ui-shared-menu__panel', this.flush() ? 'ui-shared-menu__panel--flush' : '', this.wide() ? 'ui-shared-menu__panel--wide' : '', this.panelClass()]
      .filter(Boolean).join(' ');
  }

  protected onOpened(): void {
    this.opened.emit();
    // The rows are projected, so Material's own key manager never sees them: focus the first one ourselves.
    setTimeout(() => this.items()[0]?.focus());
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.items();
    if (!items.length) return;
    const step = { ArrowDown: 1, ArrowUp: -1, Home: -Infinity, End: Infinity }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next = step === -Infinity ? 0 : step === Infinity ? items.length - 1
      : current < 0 ? (step > 0 ? 0 : items.length - 1) : (current + step + items.length) % items.length;
    items[next].focus();
  }

  private items(): HTMLElement[] {
    const el = document.getElementById(this.panel().panelId);
    return el ? Array.from(el.querySelectorAll<HTMLElement>('.mat-mdc-menu-item:not([disabled])')) : [];
  }
}
