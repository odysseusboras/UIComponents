import { ChangeDetectionStrategy, Component, booleanAttribute, effect, input, signal } from '@angular/core';
import { UiTranslatePipe, storeChoice, storedChoice } from '@borassoft/ui-components';
import { UiSharedIconComponent } from '@borassoft/ui-components/display';

/**
 * Section label of <ui-shared-nav-list>. Two shapes:
 *  - plain label above sibling items: `<ui-shared-nav-group labelKey="…" />`
 *  - collapsible section with its items inside: `<ui-shared-nav-group labelKey="…" collapsible storageKey="admin.lists">…items…</ui-shared-nav-group>`
 * The open/closed state is remembered per `storageKey` (`ui.choice.navGroup.<key>`).
 */
@Component({
  selector: 'ui-shared-nav-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiTranslatePipe, UiSharedIconComponent],
  templateUrl: './ui-shared-nav-group.component.html',
  styleUrl: './ui-shared-nav-group.component.scss',
  host: { class: 'ui-shared-nav-group', '[class.ui-shared-nav-group--collapsible]': 'collapsible()', '[class.ui-shared-nav-group--open]': 'collapsible() && open()' },
})
export class UiSharedNavGroupComponent {
  labelKey = input.required<string>();
  icon = input<string>('');
  collapsible = input(false, { transform: booleanAttribute });
  /** Remembers open/closed under this key; without it the group starts open every time. */
  storageKey = input<string>('');
  open = signal(true);

  constructor() {
    effect(() => {
      const key = this.storageKey();
      if (!key) return;
      const saved = storedChoice<boolean>(`navGroup.${key}`, [true, false]);
      if (saved !== null) this.open.set(saved);
    });
  }

  toggle(): void {
    this.open.update(v => !v);
    if (this.storageKey()) storeChoice(`navGroup.${this.storageKey()}`, this.open());
  }
}
