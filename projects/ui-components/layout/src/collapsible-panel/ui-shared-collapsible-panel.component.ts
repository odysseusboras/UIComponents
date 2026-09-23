import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiTranslatePipe, uiStorage } from '@borassoft/ui-components';

/**
 * A card panel whose body can be collapsed to its header. The state is
 * remembered per `storageKey` in localStorage (`ui.collapsible.<storageKey>`),
 * so a user who hides a stats block keeps it hidden across visits.
 *
 *   <ui-shared-collapsible-panel titleKey="stats.title" storageKey="stats">…</ui-shared-collapsible-panel>
 */
@Component({
  selector: 'ui-shared-collapsible-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, UiTranslatePipe],
  templateUrl: './ui-shared-collapsible-panel.component.html',
  styleUrl: './ui-shared-collapsible-panel.component.scss',
})
export class UiSharedCollapsiblePanelComponent {
  titleKey = input.required<string>();
  ledeKey = input<string>('');
  storageKey = input.required<string>();

  private toggled = signal<boolean | null>(null);
  protected collapsed = computed(() => this.toggled() ?? this.read());

  protected toggle(): void {
    const next = !this.collapsed();
    this.toggled.set(next);
    uiStorage.set(this.key(), next ? '1' : '0');
  }

  private key(): string { return `ui.collapsible.${this.storageKey()}`; }

  private read(): boolean { return uiStorage.get(this.key()) === '1'; }
}
