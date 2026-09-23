import { Component, DestroyRef, computed, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectOption, UiTranslatePipe } from '@borassoft/ui-components';
import { UiSharedSelectComponent } from '@borassoft/ui-components/inputs';

/**
 * Kendo-style pager: first / prev / page numbers (with ellipsis) / next /
 * last, plus a page-size dropdown and a "showing N–M of T" summary.
 *
 * Inputs are reactive (signals); navigation triggers <c>pageChange</c> /
 * <c>pageSizeChange</c> outputs — the parent (CoreGrid) owns the source of
 * truth and re-renders as the bound signals update.
 *
 * Page numbers are 1-based (matches OData $skip semantics and reads
 * naturally in the UI).
 */
@Component({
  selector: 'ui-shared-pager',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, MatIconModule, UiSharedSelectComponent,
    UiTranslatePipe,
  ],
  templateUrl: './ui-shared-pager.component.html',
  styleUrl: './ui-shared-pager.component.scss',
})
export class UiSharedPagerComponent {
  /** Current page (1-based). */
  page = input.required<number>();
  /** Rows per page. */
  pageSize = input.required<number>();
  /** Total rows in the unfiltered dataset (reported by the server). */
  total = input.required<number>();

  /** Page-size options. Defaults to a common spread. */
  pageSizeOptions = input<number[]>([10, 20, 50, 100]);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  /** Total number of pages (at least 1, so the pager always renders). */
  protected totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize()))
  );

  /** 1-based start index of the visible window for the summary line. */
  protected from = computed(() => this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1);
  /** 1-based end index of the visible window for the summary line. */
  protected to = computed(() => Math.min(this.total(), this.page() * this.pageSize()));

  /**
   * The page-number buttons to render between Prev and Next.
   * `null` represents an ellipsis gap. Algorithm:
   *   - Always show first + last
   *   - Show current ± 1
   *   - Insert "…" wherever gaps appear
   */
  protected visiblePages = computed<(number | null)[]>(() => {
    const current = this.page();
    const last = this.totalPages();
    if (last <= 7) {
      // Small set: show everything.
      return Array.from({ length: last }, (_, i) => i + 1);
    }

    const set = new Set<number>([1, last, current, current - 1, current + 1]);
    const pages = [...set].filter(p => p >= 1 && p <= last).sort((a, b) => a - b);

    const out: (number | null)[] = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) out.push(null); // ellipsis
      out.push(pages[i]);
    }
    return out;
  });

  goTo(p: number): void {
    const clamped = Math.min(Math.max(1, p), this.totalPages());
    if (clamped !== this.page()) this.pageChange.emit(clamped);
  }

  /** The page-size dropdown is the shared select, so it matches every other dropdown. */
  protected sizeControl = new FormControl<number | null>(null);
  protected sizeOptions = computed<SelectOption<number>[]>(() =>
    this.pageSizeOptions().map(n => ({ value: n, label: String(n) })));

  constructor() {
    effect(() => this.sizeControl.setValue(this.pageSize(), { emitEvent: false }));
    this.sizeControl.valueChanges
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(size => {
        if (size !== null && size !== this.pageSize()) this.pageSizeChange.emit(size);
      });
  }

  protected canPrev = computed(() => this.page() > 1);
  protected canNext = computed(() => this.page() < this.totalPages());
}
