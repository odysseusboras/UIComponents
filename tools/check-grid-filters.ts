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
import { UiSharedGridComponent, UiSharedGridColumnComponent, SOFT_DELETE_STATUS_OPTIONS, softDeleteClauseBuilder, PageQuery } from '@borassoft/ui-components/grid';
import { UiSharedTextInputComponent, UiSharedSelectComponent, UiSharedSegmentedComponent } from '@borassoft/ui-components/inputs';

const queries: PageQuery[] = [];
const results: string[] = [];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UiSharedGridComponent, UiSharedGridColumnComponent, UiSharedTextInputComponent, UiSharedSelectComponent, UiSharedSegmentedComponent],
  template: `
    <ui-shared-grid [source]="source">
      <ui-shared-segmented [options]="status" initial="active" [clauseBuilder]="statusClause" />
      <ui-shared-text-input labelKey="x.name" [fields]="['Name','Email']" />
      <ui-shared-select labelKey="x.country" [options]="countries" field="Country" />
      <ui-shared-grid-column key="name" labelKey="x.name"><ng-template #cell let-r>{{ r.name }}</ng-template></ui-shared-grid-column>
    </ui-shared-grid>
    <ui-shared-text-input labelKey="plain" />`,
})
class App {
  source = { get: (q: PageQuery) => { queries.push(q); return of({ items: [{ name: 'a' }], total: 1 }); } };
  status = SOFT_DELETE_STATUS_OPTIONS;
  statusClause = softDeleteClauseBuilder;
  countries = [{ value: 'GR', label: 'Greece' }, { value: 'CY', label: 'Cyprus' }, { value: 'e059e15f-816b-4bdf-a90c-40c03cc217eb', label: 'Guid land' }];
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
];

const html = await renderApplication(
  (context: any) => (bootstrapApplication as any)(App, { providers: [provideNoopAnimations(), provideServerRendering()] }, context),
  { document: '<app-root></app-root>' },
);
assert.deepEqual(results, expected);
// The toggles must belong to the group (a lone toggle renders aria-pressed): one radio group, one checked.
const segmented = html.slice(html.indexOf('<ui-shared-segmented'), html.indexOf('</ui-shared-segmented>'));
assert.ok(segmented.includes('role="radiogroup"') && !segmented.includes('aria-pressed'), 'segmented: toggles joined the group');
assert.equal(segmented.match(/mat-button-toggle-checked/g)?.length, 1, 'segmented: one checked toggle');
console.log('grid filters ok');
