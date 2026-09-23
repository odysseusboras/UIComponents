import { Component, ElementRef, HostListener, OnDestroy, OnInit, booleanAttribute, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UiTranslatePipe } from '@borassoft/ui-components';

/**
 * Generic slide-in side drawer — the replacement for edit/detail popup dialogs.
 * Distinct from <ui-shared-side-panel>, which is the collapsible LEFT shell nav.
 * Project the body as default content and the footer buttons into
 * <code>[slot=actions]</code> (right-aligned). Controlled by the parent via
 * <code>[open]</code> + <code>(close)</code>; closes on backdrop click or Escape.
 *
 * The host element is re-parented to <body> on init so its fixed-position overlay
 * is viewport-relative — otherwise a transformed/stacking-context ancestor (the
 * Material sidenav content) traps it BELOW the sticky app header and hides the
 * drawer's own header. Keep this; removing it re-introduces that bug everywhere.
 *
 * Typical use from a grid's row-click (`<ui-shared-grid (rowClick)>`):
 *
 *   <ui-shared-side-drawer [open]="!!editing()" titleKey="admin.companies.edit"
 *                   (close)="editing.set(null)">
 *     <!-- per-case edit form here -->
 *     <button slot="actions" mat-stroked-button (click)="editing.set(null)">{{ 'common.cancel' | uiTranslate }}</button>
 *     <button slot="actions" mat-flat-button color="primary" (click)="save()">{{ 'common.save' | uiTranslate }}</button>
 *   </ui-shared-side-drawer>
 */
@Component({
  selector: 'ui-shared-side-drawer',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, UiTranslatePipe],
  templateUrl: './ui-shared-side-drawer.component.html',
  styleUrl: './ui-shared-side-drawer.component.scss',
})
export class UiSharedSideDrawerComponent implements OnInit, OnDestroy {
  open = input(false, { transform: booleanAttribute });
  titleKey = input('');
  /** Explicit drawer width on wide screens (overrides `size`); goes full-width on narrow ones via CSS. */
  width = input<string | null>(null);
  /** md = standard edit form (default); lg = wide forms / multi-column detail. */
  size = input<'md' | 'lg'>('md');

  protected widthVar = computed(() =>
    this.width() ?? (this.size() === 'lg' ? 'clamp(640px, 52vw, 760px)' : 'clamp(480px, 38vw, 560px)'));

  close = output<void>();

  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  ngOnInit(): void {
    document.body.appendChild(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.host.nativeElement.remove();
  }

  /** An overlay opened from inside the drawer (menu, select, dialog) that handled Escape itself keeps the drawer open. */
  @HostListener('document:keydown.escape', ['$event'])
  protected onEscape(event: KeyboardEvent): void {
    if (this.open() && !event.defaultPrevented) this.close.emit();
  }
}
