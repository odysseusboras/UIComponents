import { InjectionToken, Provider, Type, inject, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * What `<ui-shared-grid>` needs from a projected filter. The option/text inputs
 * provide it under `UI_GRID_FILTER`, so the same component is a form input on its
 * own and a grid filter once it has a `field` / `fields` / `clauseBuilder`.
 */
export interface UiGridFilter {
  /** OData clause for the applied value; null when it filters nothing. */
  clause(): string | null;
  isApplied(): boolean;
  /** Search: what the user typed or picked becomes the applied value. */
  applyPending(): void;
  /** Clear: back to the initial value. */
  clearAll(): void;
  /** The applied value, for a grid that remembers its view across reloads. */
  value(): unknown;
  /** Puts a remembered value back in place as both pending and applied. */
  restore(value: unknown): void;
}

export const UI_GRID_FILTER = new InjectionToken<UiGridFilter>('UI_GRID_FILTER');

/** Registers a component's `filter` state under `UI_GRID_FILTER` so the grid finds it. */
export function provideGridFilter(component: () => Type<{ filter: UiGridFilter }>): Provider {
  return { provide: UI_GRID_FILTER, useFactory: () => inject(component()).filter };
}

export type ClauseBuilder<T> = (value: T) => string | null;

/** An OData string literal: `O'Brien` → `'O''Brien'`. */
export function odataString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** ANDs the non-empty clauses (each parenthesised when there is more than one); undefined when none. */
export function andClauses(clauses: readonly (string | null | undefined)[]): string | undefined {
  const parts = clauses.filter((c): c is string => !!c?.trim());
  if (parts.length <= 1) return parts[0];
  return parts.map(c => `(${c})`).join(' and ');
}

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * OData v4 literal for a filter value: numbers, booleans and GUIDs are written
 * bare (`Id eq 5`, `TypeId eq e059…`), everything else as a quoted string. A
 * string column holding GUID-shaped text needs its own `clauseBuilder`.
 */
export function odataLiteral(value: unknown): string {
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  const s = String(value);
  return GUID.test(s) ? s : odataString(s);
}

/** `field eq <literal>`; null without a field. */
export function eqClause<T>(field: string | undefined | null): ClauseBuilder<T> | null {
  return field ? v => `${field} eq ${odataLiteral(v)}` : null;
}

const blank = (v: unknown) => v === null || v === undefined || (typeof v === 'string' && !v.trim());

/**
 * Pending vs applied value of an input used as a grid filter: the control holds
 * what the user typed/picked, the grid filters by the applied value, which only
 * moves on Search / Clear. Without a clause builder the input is not a filter
 * and every method is a no-op.
 */
export class GridFilterState<T> implements UiGridFilter {
  /** `undefined` = still at the initial value. */
  private applied = signal<T | null | undefined>(undefined);

  constructor(
    private control: () => AbstractControl,
    private builder: () => ClauseBuilder<T> | null,
    private initial: () => T | null = () => null,
  ) {}

  isFilter(): boolean { return !!this.builder(); }

  /** Seeds the control with the initial value (e.g. the "active" pill). Call from ngOnInit. */
  init(): void {
    const i = this.initial();
    if (this.isFilter() && i !== null && blank(this.control().value)) this.control().setValue(i);
  }

  /** Puts a remembered value in place as both pending and applied (no Search needed). */
  restore(value: T): void {
    this.control().setValue(value);
    if (this.isFilter()) this.applied.set(value);
  }

  clause(): string | null {
    const build = this.builder();
    const v = this.value();
    return build && !blank(v) ? build(v as T) : null;
  }

  isApplied(): boolean { return this.isFilter() && this.value() !== this.initial(); }

  applyPending(): void {
    if (!this.isFilter()) return;
    const v = this.control().value;
    this.applied.set(blank(v) ? null : typeof v === 'string' ? v.trim() as T : v);
  }

  clearAll(): void {
    if (!this.isFilter()) return;
    this.control().setValue(this.initial());
    this.applied.set(undefined);
  }

  /** The value the grid filters by: what Search applied, else the initial one. */
  value(): T | null {
    const a = this.applied();
    return a === undefined ? this.initial() : a;
  }
}
