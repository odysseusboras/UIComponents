import { Component, booleanAttribute, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule, SubscriptSizing } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  ClauseBuilder, GridFilterState, UiTranslatePipe, firstError, odataString, provideGridFilter,
} from '@borassoft/ui-components';

export type TextInputType = 'text' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'time' | 'date';

/**
 * The one single-line input: text, email, number, tel, url. Takes the
 * FormControl directly; the label / hint / errors are translation keys
 * resolved through UI_TRANSLATE. Project `[suffix]` / `[prefix]` content for
 * icons, buttons or unit text.
 *
 * Inside `<ui-shared-grid>` with `[fields]` it is a free-text grid filter
 * (`contains` on any of the fields; Enter runs the grid's Search):
 *
 *   <ui-shared-text-input labelKey="users.search" [fields]="['Name','Email']" />
 *
 *   <ui-shared-text-input [control]="form.controls.name" labelKey="form.name" maxlength="200" />
 *   <ui-shared-text-input [control]="form.controls.amount" labelKey="form.amount" type="number" min="0" step="0.01">
 *     <span suffix>€</span>
 *   </ui-shared-text-input>
 */
@Component({
  selector: 'ui-shared-text-input',
  standalone: true,
  // Default change detection: a parent's markAllAsTouched() changes no input, and the
  // mat-error below must still appear (same as select / password-field).
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, UiTranslatePipe],
  templateUrl: './ui-shared-text-input.component.html',
  styleUrl: './ui-shared-text-input.component.scss',
  providers: [provideGridFilter(() => UiSharedTextInputComponent)],
  host: { '[class.ui-shared-filter]': 'filter.isFilter()' },
})
export class UiSharedTextInputComponent {
  /** Optional when used as a grid filter. */
  control = input<FormControl<any> | null>(null);
  labelKey = input.required<string>();
  type = input<TextInputType>('text');
  hintKey = input<string>('');
  /** Already translated hint text — for hints built at runtime. */
  hintText = input<string>('');
  placeholderKey = input<string>('');
  maxlength = input<number | string | null>(null);
  min = input<number | string | null>(null);
  max = input<number | string | null>(null);
  step = input<number | string | null>(null);
  inputMode = input<string>('');
  autocomplete = input<string>('');
  readonly = input(false, { transform: booleanAttribute });
  subscriptSizing = input<SubscriptSizing>('dynamic');

  /** Grid filter: OData fields matched with `contains`. */
  fields = input<string[]>([]);
  /** Grid filter: custom clause for the typed text (overrides `fields`). */
  clauseBuilder = input<ClauseBuilder<string> | null>(null);

  private own = new FormControl<string | null>(null);
  protected ctrl = computed(() => this.control() ?? this.own);
  readonly filter = new GridFilterState<string>(() => this.ctrl(), () => this.clauseBuilder() ?? this.containsAny());

  protected readonly firstError = firstError;
  protected required = computed(() => this.ctrl().hasValidator(Validators.required));

  private containsAny(): ClauseBuilder<string> | null {
    const fields = this.fields();
    if (!fields.length) return null;
    return v => fields.map(f => `contains(tolower(${f}), ${odataString(v.toLowerCase())})`).join(' or ');
  }
}
