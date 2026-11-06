// Runtime check: a grid with a storageKey puts the user's view (filters, sort, paging) back after a reload.
import assert from 'node:assert/strict';
import 'zone.js/node';
import '@angular/compiler';
import { Component, ViewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication, provideServerRendering } from '@angular/platform-server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { UiSharedGridComponent, UiSharedGridColumnComponent, PageQuery } from '@borassoft/ui-components/grid';
import { UiSharedTextInputComponent, UiSharedSelectComponent, UiSharedSegmentedComponent } from '@borassoft/ui-components/inputs';
import { provideUiDates } from '@borassoft/ui-components';

const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
};

let queries: PageQuery[] = [];
let results: string[] = [];
let step: (app: App) => void = () => {};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UiSharedGridComponent, UiSharedGridColumnComponent, UiSharedTextInputComponent, UiSharedSelectComponent, UiSharedSegmentedComponent],
  template: `
    <ui-shared-grid [source]="source" storageKey="docs" initialSortField="DateCreated" initialSortDir="desc">
      <ui-shared-select labelKey="x.type" [options]="types" field="TypeId" />
      <ui-shared-text-input labelKey="x.vat" [fields]="['Vat']" />
      <ui-shared-segmented [options]="status" initial="all" [clauseBuilder]="statusClause" />
      <ui-shared-grid-column key="name" labelKey="x.name" sortField="Name"><ng-template #cell let-r>{{ r.name }}</ng-template></ui-shared-grid-column>
    </ui-shared-grid>`,
})
class App {
  source = { get: (q: PageQuery) => { queries.push(q); return of({ items: [{ name: 'a' }], total: 100 }); } };
  types: { value: string; label: string }[] = [];
  status = [{ value: 'all', label: 'All' }, { value: 'Saved', label: 'Saved' }];
  statusClause = (v: string) => (v === 'all' ? null : `Status eq '${v}'`);
  @ViewChild(UiSharedGridComponent) grid!: any;
  @ViewChild(UiSharedTextInputComponent) text!: any;
  @ViewChild(UiSharedSelectComponent) select!: any;
  @ViewChild(UiSharedSegmentedComponent) seg!: any;
  ngAfterViewInit() {
    // Options of a code list arrive after the first render, as they do from an HTTP call.
    setTimeout(() => {
      this.types = [{ value: 'T1', label: 'Invoice' }, { value: 'T2', label: 'Receipt' }];
      setTimeout(() => step(this));
    });
  }
}

const render = () => renderApplication(
  (context: any) => (bootstrapApplication as any)(App, { providers: [provideNoopAnimations(), provideServerRendering(), provideUiDates()] }, context),
  { document: '<app-root></app-root>' },
);

// 1st visit: filter, sort by name, go to page 3.
step = app => {
  const g = app.grid;
  results.push('first=' + queries[0]?.sortField + ' ' + queries[0]?.sortDir);
  app.select.control.setValue('T2');
  app.text.ctrl().setValue('123');
  app.seg.own.setValue('Saved');
  g.onSearch();
  g.onHeaderClick(g.columns()[0]);
  g.page.set(3); g.fetch();
};
await render();
assert.deepEqual(results, ['first=DateCreated desc']);

// 2nd visit (reload): the same view comes back, already filtered and sorted in the first request.
queries = []; results = [];
step = app => {
  const q = queries[0];
  results.push(`filter=${q?.filter}`, `sort=${q?.sortField} ${q?.sortDir}`, `page=${q?.page}`,
    `select=${app.select.current?.label}`, `text=${app.text.ctrl().value}`, `seg=${app.seg.own.value}`, `requests=${queries.length}`);
};
await render();
assert.deepEqual(results, [
  "filter=(TypeId eq 'T2') and (contains(tolower(Vat), '123')) and (Status eq 'Saved')",
  'sort=Name asc', 'page=3', 'select=Receipt', 'text=123', 'seg=Saved', 'requests=1',
]);
// A template that gained a filter is a different view: its values AND its remembered clause are dropped.
const saved = JSON.parse(store.get('app.coreGrid.docs.view')!);
store.set('app.coreGrid.docs.view', JSON.stringify({ ...saved, filters: [...saved.filters, 'extra'] }));
queries = []; results = [];
step = () => results.push(`changed=${queries[0]?.filter}`, `sortKept=${queries[0]?.sortField}`);
await render();
assert.deepEqual(results, ['changed=undefined', 'sortKept=Name']);

// Sort cleared by the user stays cleared (the initial sort is only for a grid with no view yet).
store.set('app.coreGrid.docs.view', JSON.stringify({ ...saved, sortField: null, sortDir: null }));
queries = []; results = [];
step = () => results.push(`cleared=${queries[0]?.sortField ?? 'none'}`);
await render();
assert.deepEqual(results, ['cleared=none']);
console.log('grid persistence ok');
