// Runtime check: inputs projected into <ui-shared-grid> act as filters (pending vs applied, Search, Clear).
// Run with `npm run check`.
import assert from 'node:assert/strict';
import 'zone.js/node';
import '@angular/compiler';
import { Component, ViewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication, provideServerRendering } from '@angular/platform-server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { UiSharedGridComponent, UiSharedGridColumnComponent, UiGridAdvancedDirective, SOFT_DELETE_STATUS_OPTIONS, softDeleteClauseBuilder, PageQuery } from '@borassoft/ui-components/grid';
import { UiSharedTextInputComponent, UiSharedSelectComponent, UiSharedSegmentedComponent, UiSharedMultiSelectComponent, UiSharedDateInputComponent } from '@borassoft/ui-components/inputs';
import { provideUiDates } from '@borassoft/ui-components';

const queries: PageQuery[] = [];
const wideQueries: PageQuery[] = [];
const results: string[] = [];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UiSharedGridComponent, UiSharedGridColumnComponent, UiGridAdvancedDirective, UiSharedTextInputComponent, UiSharedSelectComponent, UiSharedSegmentedComponent, UiSharedMultiSelectComponent, UiSharedDateInputComponent],
  template: `
    <ui-shared-grid [source]="source">
      <ui-shared-segmented [options]="status" initial="active" [clauseBuilder]="statusClause" />
      <ui-shared-text-input labelKey="x.name" [fields]="['Name','Email']" />
      <ui-shared-select labelKey="x.country" [options]="countries" field="Country" />
      <ui-shared-grid-column key="name" labelKey="x.name"><ng-template #cell let-r>{{ r.name }}</ng-template></ui-shared-grid-column>
    </ui-shared-grid>
    <ui-shared-text-input labelKey="plain" />
    <ui-shared-grid #wide [source]="wideSource">
      <ui-shared-multi-select labelKey="x.country" [options]="countries" field="Country" />
      <div uiGridAdvanced>
        <ui-shared-date-input labelKey="x.from" [clauseBuilder]="from" />
      </div>
      <ui-shared-grid-column key="name" labelKey="x.name"><ng-template #cell let-r>{{ r.name }}</ng-template></ui-shared-grid-column>
    </ui-shared-grid>`,
})
class App {
  source = { get: (q: PageQuery) => { queries.push(q); return of({ items: [{ name: 'a' }], total: 1 }); } };
  status = SOFT_DELETE_STATUS_OPTIONS;
  statusClause = softDeleteClauseBuilder;
  countries = [{ value: 'GR', label: 'Greece' }, { value: 'CY', label: 'Cyprus' }, { value: 'e059e15f-816b-4bdf-a90c-40c03cc217eb', label: 'Guid land' }];
  wideSource = { get: (q: PageQuery) => { wideQueries.push(q); return of({ items: [{ name: 'a' }], total: 1 }); } };
  from = (day: string) => `Created ge ${day}`;
  @ViewChild('wide') wide!: any;
  @ViewChild(UiSharedMultiSelectComponent) multi!: any;
  @ViewChild(UiSharedDateInputComponent) date!: any;
  @ViewChild(UiSharedGridComponent) grid!: any;
  @ViewChild(UiSharedTextInputComponent) text!: any;
  @ViewChild(UiSharedSelectComponent) auto!: any;
  @ViewChild(UiSharedSegmentedComponent) seg!: any;
  ngAfterViewInit() {
    setTimeout(() => {
      const g: any = this.grid;
      results.push('initial=' + queries.at(-1)?.filter);
      (this.text as any).ctrl().setValue("O'Neil");
      const type = (text: string) => { this.auto.onInput({ target: { value: text } }); this.auto.onBlur(); };
      type('cyprus');                                   // typed label, no pick
      // The trigger shows everything through displayWith: an option value AND the label we write.
      results.push('display=' + this.auto.displayWith('CY') + '|' + this.auto.displayWith('Cyprus') + '|' + this.auto.displayWith(null));
      (this.seg as any).own.setValue('all');
      results.push('pendingOnly=' + queries.at(-1)?.filter);
      g.onSearch();
      results.push('search=' + queries.at(-1)?.filter + ' active=' + g.hasActiveFilters());
      type('Nowhere');                                  // no such option: the pick stays
      g.onSearch();
      results.push('noMatch=' + queries.at(-1)?.filter + ' text=' + this.auto.text.value);
      type('guid land');
      g.onSearch();
      results.push('guid=' + queries.at(-1)?.filter);
      g.onClearFilters();
      // Silent control changes ({ emitEvent: false }) must still reach the input.
      const silent = (this.auto as any);
      silent.control.disable({ emitEvent: false });
      silent.ngDoCheck();
      const lockedWhileDisabled = silent.text.disabled;
      silent.control.enable({ emitEvent: false });
      silent.control.setValue('GR', { emitEvent: false });
      silent.ngDoCheck();
      results.push('silent=' + lockedWhileDisabled + '|' + silent.text.disabled + '|' + silent.text.value);
      silent.control.setValue('', { emitEvent: false });
      results.push('clear=' + queries.at(-1)?.filter + ' active=' + g.hasActiveFilters() + ' seg=' + (this.seg as any).own.value + ' filters=' + g.filters().length);
      // Multi-select (any of the picked values) + a date inside the advanced group, which filters while closed.
      const w: any = this.wide;
      this.multi.filter.restore('GR');                  // a remembered value of another shape is ignored
      results.push('badRestore=' + JSON.stringify(this.multi.own.value));
      this.multi.own.setValue(['GR', 'CY']);
      this.date.own.setValue(new Date(2026, 9, 6));
      w.onSearch();
      results.push('multi=' + wideQueries.at(-1)?.filter + ' advanced=' + w.hasAdvanced() + '|' + w.advancedOpen() + '|' + w.advancedApplied() + ' filters=' + w.filters().length);
      this.date.filter.restore(JSON.parse(JSON.stringify(new Date(2026, 0, 31))));   // as a remembered view hands it back
      results.push('dateRestore=' + this.date.filter.clause());
      w.onClearFilters();
      results.push('multiClear=' + wideQueries.at(-1)?.filter + ' advanced=' + w.advancedApplied());
    });
  }
}

const expected = [
  'initial=IsDeleted eq false',
  'display=Cyprus|Cyprus|',
  'pendingOnly=IsDeleted eq false',
  "search=(contains(tolower(Name), 'o''neil') or contains(tolower(Email), 'o''neil')) and (Country eq 'CY') active=true",
  "noMatch=(contains(tolower(Name), 'o''neil') or contains(tolower(Email), 'o''neil')) and (Country eq 'CY') text=Cyprus",
  "guid=(contains(tolower(Name), 'o''neil') or contains(tolower(Email), 'o''neil')) and (Country eq e059e15f-816b-4bdf-a90c-40c03cc217eb)",
  'silent=true|false|Greece',
  'clear=IsDeleted eq false active=false seg=active filters=3',
  'badRestore=[]',
  "multi=(Country eq 'GR' or Country eq 'CY') and (Created ge 2026-10-06) advanced=true|false|1 filters=2",
  'dateRestore=Created ge 2026-01-31',
  'multiClear=undefined advanced=0',
];

const html = await renderApplication(
  (context: any) => (bootstrapApplication as any)(App, { providers: [provideNoopAnimations(), provideServerRendering(), provideUiDates()] }, context),
  { document: '<app-root></app-root>' },
);
assert.deepEqual(results, expected);
// The toggles must belong to the group (a lone toggle renders aria-pressed): one radio group, one checked.
const segmented = html.slice(html.indexOf('<ui-shared-segmented'), html.indexOf('</ui-shared-segmented>'));
assert.ok(segmented.includes('role="radiogroup"') && !segmented.includes('aria-pressed'), 'segmented: toggles joined the group');
assert.equal(segmented.match(/mat-button-toggle-checked/g)?.length, 1, 'segmented: one checked toggle');
console.log('grid filters ok');
