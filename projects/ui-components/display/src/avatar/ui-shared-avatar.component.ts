import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Initials disc for a person: `<ui-shared-avatar [name]="user.name" />`. Up to two initials, from the first two words. */
@Component({
  selector: 'ui-shared-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-shared-avatar.component.html',
  styleUrl: './ui-shared-avatar.component.scss',
  host: { class: 'ui-shared-avatar', '[class.ui-shared-avatar--lg]': 'size() === "lg"', 'aria-hidden': 'true' },
})
export class UiSharedAvatarComponent {
  name = input.required<string>();
  size = input<'md' | 'lg'>('md');
  initials = computed(() => this.name().trim().split(/\s+/).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase());
}
