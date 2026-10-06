import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UiTranslatePipe } from '@borassoft/ui-components';
import { UiSharedButtonComponent } from '@borassoft/ui-components/buttons';

/** One wizard step. `link` makes the step header a router link (the host routes between steps). */
export interface WizardStep {
  key: string;
  labelKey: string;
  link?: any[] | string;
}

/**
 * A multi-step form frame: a numbered step strip on top, the current step's content in the
 * middle, Back / Next (or Finish) on the bottom. The host owns the state: it says which step is
 * active, which steps are done and whether Next is allowed; it navigates on `back` / `next`
 * (or through each step's `link`). Extra footer buttons ("Save draft") go in `[slot=actions]`.
 *
 *   <ui-shared-wizard [steps]="steps" [active]="step()" [done]="done()" [canNext]="form.valid"
 *                     finishKey="activity.submit" (back)="go(-1)" (next)="go(+1)" (finish)="submit()">
 *     <router-outlet />
 *     <ui-shared-button slot="actions" labelKey="activity.saveDraft" (click)="saveDraft()" />
 *   </ui-shared-wizard>
 */
@Component({
  selector: 'ui-shared-wizard',
  standalone: true,
  imports: [RouterLink, MatIconModule, UiTranslatePipe, UiSharedButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="ui-shared-wizard__steps" [attr.aria-label]="'wizard.steps' | uiTranslate">
      @for (s of steps(); track s.key; let i = $index) {
        <li class="ui-shared-wizard__step"
            [class.ui-shared-wizard__step--active]="i === activeIndex()"
            [class.ui-shared-wizard__step--done]="done().includes(s.key)"
            [attr.aria-current]="i === activeIndex() ? 'step' : null">
          @if (s.link && (done().includes(s.key) || i < activeIndex())) {
            <a class="ui-shared-wizard__step-inner" [routerLink]="s.link">
              <span class="ui-shared-wizard__n"><mat-icon>check</mat-icon><span>{{ i + 1 }}</span></span>
              <span class="ui-shared-wizard__label">{{ s.labelKey | uiTranslate }}</span>
            </a>
          } @else {
            <span class="ui-shared-wizard__step-inner">
              <span class="ui-shared-wizard__n"><mat-icon>check</mat-icon><span>{{ i + 1 }}</span></span>
              <span class="ui-shared-wizard__label">{{ s.labelKey | uiTranslate }}</span>
            </span>
          }
        </li>
      }
    </ol>

    <div class="ui-shared-wizard__body"><ng-content /></div>

    <div class="ui-shared-wizard__footer">
      <div class="ui-shared-wizard__footer-start">
        @if (activeIndex() > 0) {
          <ui-shared-button icon="arrow_back" [labelKey]="backKey()" (click)="back.emit()" />
        }
      </div>
      <div class="ui-shared-wizard__footer-end">
        <ng-content select="[slot=actions]" />
        @if (isLast()) {
          <ui-shared-button variant="primary" icon="check" [labelKey]="finishKey()" [disabled]="!canFinish()" [loading]="busy()" (click)="finish.emit()" />
        } @else {
          <ui-shared-button variant="primary" iconEnd="arrow_forward" [labelKey]="nextKey()" [disabled]="!canNext()" (click)="next.emit()" />
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }
    .ui-shared-wizard__steps { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; counter-reset: step; }
    .ui-shared-wizard__step { flex: 1 1 0; min-width: 0; display: flex; }
    .ui-shared-wizard__step-inner { flex: 1; display: flex; align-items: center; gap: 0.6rem; min-width: 0; text-decoration: none; color: inherit; }
    .ui-shared-wizard__n { flex: 0 0 auto; display: grid; place-items: center; }
    .ui-shared-wizard__n > * { grid-area: 1 / 1; }
    .ui-shared-wizard__n mat-icon { display: none; }
    .ui-shared-wizard__step--done .ui-shared-wizard__n mat-icon { display: block; }
    .ui-shared-wizard__step--done .ui-shared-wizard__n > span { display: none; }
    .ui-shared-wizard__label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ui-shared-wizard__footer { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
    .ui-shared-wizard__footer-end { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end; }
  `,
})
export class UiSharedWizardComponent {
  steps = input.required<WizardStep[]>();
  /** Key of the active step. */
  active = input.required<string>();
  /** Keys of the steps already completed (clickable in the strip). */
  done = input<string[]>([]);
  canNext = input(true, { transform: booleanAttribute });
  canFinish = input(true, { transform: booleanAttribute });
  busy = input(false, { transform: booleanAttribute });
  backKey = input('wizard.back');
  nextKey = input('wizard.next');
  finishKey = input('wizard.finish');

  back = output<void>();
  next = output<void>();
  finish = output<void>();

  readonly activeIndex = computed(() => Math.max(0, this.steps().findIndex(s => s.key === this.active())));
  readonly isLast = computed(() => this.activeIndex() === this.steps().length - 1);
}
