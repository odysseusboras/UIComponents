# @borassoft/ui-components

Shared Angular Material UI for Borassoft apps. Every component is prefixed `ui-shared-` (selectors) / `UiShared` (classes); services, tokens and the pipe keep `Ui` / `UI_`; app-specific components keep `app-`. Extracted from EINV; consumed by EINV and ATLAS (CHARIS_TOURISM). MIT. Peer deps: Angular 19.2+ (common, core, forms, router, platform-browser) and RxJS; Angular Material/CDK and `qrcode-generator` come with the package.

## Entry points

Import from the entry point that owns the symbol — each is its own bundle file, so an app only downloads what a route actually uses (a single flat entry pulled the whole library into the initial bundle):

| Import from | Contains |
|---|---|
| `@borassoft/ui-components` | i18n tokens + `uiTranslate`, `firstError`, `SelectOption`, the grid-filter contract (`UI_GRID_FILTER`, `GridFilterState`, `odataString`, `andClauses`), `uiStorage`, `trackPointerDrag`, `UiThemeService`, `provideUiDates` (day-first datepicker adapter) |
| `@borassoft/ui-components/grid` | grid, column, filters, pager, OData helpers |
| `@borassoft/ui-components/inputs` | every form input |
| `@borassoft/ui-components/buttons` | button, icon button, button group, menu, menu item |
| `@borassoft/ui-components/layout` | page header, collapsible panel, side drawer, side panel, tabs, nav list, divider |
| `@borassoft/ui-components/feedback` | confirm dialog/service, loading overlay/service, notifications, spinner, progress bar |
| `@borassoft/ui-components/display` | status chip (+ tones), stat tile, display date, QR code, icon |

## What's in it

| Area | Selector / class | Notes |
|---|---|---|
| Grid | `<ui-shared-grid>` `UiSharedGridComponent` (`selectable` + `#bulkActions`, `[preselect]`, master-detail via `<ng-template #detail let-row>` - a leading arrow opens the template under the row), `<ui-shared-grid-column>` `UiSharedGridColumnComponent`, `<ui-shared-pager>` `UiSharedPagerComponent` | OData grid: filters (the inputs below, see *Inputs are also the grid filters*), sorting, paging, row actions, bulk selection, persisted column layout. `OdataSource`, `fetchOdataPage`, `SOFT_DELETE_STATUS_OPTIONS`, `softDeleteClauseBuilder`. |
| Inputs | `<ui-shared-select>` `UiSharedSelectComponent` (the one dropdown: type to filter, `freeText` optional), `<ui-shared-text-input>`, `<ui-shared-textarea-input>`, `<ui-shared-date-input>`, `<ui-shared-password-field>`, `<ui-shared-checkbox>`, `<ui-shared-toggle>`, `<ui-shared-radio-group>`, `<ui-shared-segmented>` `UiSharedSegmentedComponent`, `<ui-shared-color-swatches>` (`[control]`, `[presets]` default `UI_COLOR_PRESETS`, `optional` adds a "none" swatch), `<ui-shared-file-button>` `UiSharedFileButtonComponent`, `<ui-shared-html-editor>` `UiSharedHtmlEditorComponent` | Options are `SelectOption` (`{ value, label }` or `{ value, labelKey }`). `firstError(control)` → `form.errors.<validator>`. Text input, select and segmented double as grid filters. |
| Buttons | `<ui-shared-button>` `UiSharedButtonComponent`, `<ui-shared-icon-button>` `UiSharedIconButtonComponent`, `<ui-shared-button-group>` `UiSharedButtonGroupComponent`, `<ui-shared-menu>` `UiSharedMenuComponent`, `<ui-shared-menu-item>` `UiSharedMenuItemComponent`, `<ui-shared-button-content>` (the shared icon + label + trailing icon inside button, menu item and nav item) | The only buttons an app renders. Menus are keyboard-navigable (arrows / Home / End). Menu: project the trigger into `[slot=trigger]`, the rows after it; `align` start / end, `flush`, `wide`, `(opened)`. `variant` primary / secondary / accent / danger / danger-filled / text, `size` sm / md / lg, `icon` / `iconEnd`, `labelKey` or `label`, `loading` + `loadingKey`, `routerLink` (renders an anchor), `block`. Icon button: `icon`, `tooltipKey` (= aria-label), `tone` default / danger / accent / warning, `size` sm (32px) / md (40px). Button group: `align` end / start / between / center, `divided` (form footer rule), `stack`. Menu item: `icon`, `labelKey`, `danger`, `disabled`, listen to `(click)`. |
| Primitives | `<ui-shared-icon>` (`name`, `size` sm / md / lg, `tone`, `badge`; resize from an app rule with `--ui-icon-size`), `<ui-shared-spinner>` (`size` px), `<ui-shared-progress-bar>` (`value` or indeterminate), `<ui-shared-divider>` (`vertical`) | The Material icon / spinner / progress / divider, wrapped so apps never import `@angular/material`. |
| Calendar | `<ui-shared-calendar>` `UiSharedCalendarComponent` (`@borassoft/ui-components/calendar`: `[source]="(from, to) => Observable<UiCalendarEvent[]>"`, `[actions]` hover buttons, `[month]` / `(monthChange)`, `(dateClick)`, `(eventClick)`, `(eventAction)`, `reload()`) | Month grid of all-day events on FullCalendar (a library dependency); the look is in the theme, locale follows `UI_LOCALE`. |
| Layout | `<ui-shared-page-header>` `UiSharedPageHeaderComponent` (renders the breadcrumb trail above the title), `<ui-shared-breadcrumb>` + `provideUiBreadcrumbs(tree)` (`UiBreadcrumbNode`: `path`, `labelKey` / `label(params)`, `redirect`, `children`; a node without a label shows the page title), `<ui-shared-collapsible-panel>` `UiSharedCollapsiblePanelComponent`, `<ui-shared-side-drawer>` `UiSharedSideDrawerComponent`, `<ui-shared-side-panel>` `UiSharedSidePanelComponent`, `<ui-shared-tabs>` + `<ui-shared-tab>` (`labelKey` / `label`, lazy content, `[selected]` / `(selectedChange)`; give every tab a `link` and the strip becomes a router nav bar over the page's `<router-outlet>`), `<ui-shared-nav-list>` + `<ui-shared-nav-item>` (`link`, `icon`, `labelKey`, `exact`) + `<ui-shared-nav-group>` | Page title/lede/back, collapsible card (state in `ui.collapsible.<key>`), right slide-in drawer (re-parents itself to `<body>`), resizable left shell nav (state in `ui.sidePanel.<key>`). |
| Feedback | `<ui-shared-confirm-dialog>` + `UiConfirmService` (`ConfirmDialogData`), `<ui-shared-loading-overlay>` + `UiLoadingService`, `UiNotificationService` | Yes/No dialog emitting only on Yes; loading overlay with a 250 ms grace period (`start()/stop()/visible`); snackbar wrapper (`success/info/warn/error`). |
| Display | `<ui-shared-status-chip>` `UiSharedStatusChipComponent` (`StatusTone`, `activeTone()`), `<ui-shared-stat-tile>` `UiSharedStatTileComponent`, `<ui-shared-display-date>` `UiSharedDisplayDateComponent`, `<ui-shared-qr-code>` `UiSharedQrCodeComponent` | Status pill, KPI tile, the one date format, QR code SVG. |
| Theme | `UiThemeService` (`UiTheme`), `UI_THEME_STORAGE_KEY` | Light/dark on `<html data-theme>`, persisted under `ui.theme` by default. |
| i18n | `UI_TRANSLATE`, `UI_DEFAULT_TEXTS`, `UiTranslatePipe` (`uiTranslate`), `UI_REFRESH`, `UI_LOCALE`, `UI_DATE_FORMAT` | |

## Styling: structure in the components, the look in one theme

Every component has its own `.html` and `.scss`. The component SCSS holds **structure only** (display, flex/grid, position, overflow, cursor) and starts from the same `host()` mixin (`src/lib/styles/_host.scss`), so all components share identical defaults: `box-sizing: border-box; min-width: 0; max-width: 100%`, plus their display. Nothing visual goes there — no colour, border, spacing or type.

The **look** (colours, borders, radius, spacing, type, hover, motion) is one global stylesheet the app includes once, at the top of its `styles.scss`:

```scss
@use '@borassoft/ui-components/styles/theme';
```

Its selectors are global and namespaced (`.ui-shared-grid__th`, `.ui-shared-pager__page`, `.ui-shared-status-chip--ok`, …), so the app overrides any of them with plain CSS after the `@use` — no `::ng-deep`, no `!important`. Values come from `--ui-*` tokens (`src/lib/styles/_tokens.scss`) that fall back to the app's own tokens:

```
--ui-line: var(--surface-line, #e2e5ea)   --ui-surface: var(--surface-card, #fff)   --ui-text: var(--text-strong, #111827)
--ui-accent: var(--brand-from, #2563eb)   --ui-radius: var(--r-md, 10px)            --ui-success / --ui-warning / --ui-danger / --ui-info (+ -soft)
```

So an app themes the library by defining its tokens (`--surface-line`, `--brand-from`, …), by setting `--ui-*` on an element (`ui-shared-grid { --ui-cell-pad-y: 0.5rem; }`), or by overriding a theme rule. A few structural knobs are variables too: `--ui-filter-width` (260px), `--ui-z-drawer`, `--ui-z-overlay`, `--ui-sticky-top`, `--ui-viewport-h`. Every thin border is `--ui-hairline` and every focus ring `--ui-focus-width`, so an app that zooms its root can snap both to whole pixels in one place.

The theme file is ordered like the entry points — buttons, display, feedback, grid, inputs, layout — then the app-wide Material rules and the keyframes; a new component's look goes in its entry's section, and its element name in `$components` (so a subtree can be re-themed).

- **App-wide Material behaviour** is in the theme too, so every app looks and behaves the same: form-field focus outline (`--ui-focus-width`), no line through a floating label, errors only after the user leaves a field and in one colour (outline, label, icon, message — hover and focus included), hint/error spacing, dropdown panels, dialogs, menus, tooltips, buttons, tab bodies that don't scroll on their own, and the `UiNotificationService` toasts (`ui-shared-toast--success|info|warn|error`).
- **`body.ui-resizing`** is set while a grid column or the side panel is drag-resized.

## Remembering choices in the browser

`uiStorage` (get / set / remove / getJson / setJson) is the only way the library touches `localStorage` and never throws. On top of it:

- `storedChoice(key, allowed)` / `storeChoice(key, value)` — a remembered choice, ignored when it is no longer allowed;
- `storageKey` on `<ui-shared-segmented>` and `<ui-shared-select>` saves the choice and restores it on load (applied immediately when the input is a grid filter);
- the grid (`storageKey`: column widths, column order, and the current view — applied filters, page and page size), the collapsible panel, the side panel and `UiThemeService` persist their own state.

## Build a package

```bash
npm install          # once
# bump "version" in projects/ui-components/package.json
npm run pack         # -> packages/borassoft-ui-components-<version>.tgz
```

Always bump the version before you pack: npm stores the tarball's hash in each consumer's lock file, so rebuilding the same version breaks `npm install` with EINTEGRITY.

## Use it in an app

The package owns Angular Material and the CDK (they are its `dependencies`, not peers): an app installs the tarball only and never lists `@angular/material` / `@angular/cdk` itself. In `styles.scss`:

```scss
@use '@borassoft/ui-components/styles/material' as ui-material;   // Material base theme (palettes chosen here)
@use '@borassoft/ui-components/styles/theme';                       // the ui-shared look
html { @include ui-material.theme(); }                              // optional: $typography, $density, $primary, $tertiary
```

and in `app.config.ts` add `provideUiDates()` for the day-first datepicker. The Material Icons font link stays in `index.html`. An app template never contains a `mat-*` element or directive - every Material feature is a `ui-shared-*` component.


Copy the tarball into the app's own `packages/` folder (next to its `package.json`) and commit it, so the app builds without this repo.

```jsonc
// <app>/package.json
"@borassoft/ui-components": "file:packages/borassoft-ui-components-4.4.0.tgz"
```

```ts
// app.config.ts — every provider is optional
{ provide: UI_TRANSLATE, useFactory: () => { const i18n = inject(I18nService); return (k: string) => i18n.t(k); } },
{ provide: UI_REFRESH,   useFactory: () => inject(GridRefreshService).signals$ },
{ provide: UI_LOCALE,    useFactory: () => { const i18n = inject(I18nService); return () => i18n.locale(); } },
{ provide: UI_DATE_FORMAT, useValue: 'dd/MM/yyyy, HH:mm' },
{ provide: UI_THEME_STORAGE_KEY, useValue: 'aade.theme' },
```

- Without `UI_TRANSLATE` the components use English defaults (`UI_DEFAULT_TEXTS`: `core.grid.*`, `pager.*`, `common.*`, `sidePanel.*`, `htmlEditor.*`, `form.password.*`, `form.errors.*` — including the datepicker's `matDatepickerParse` / `Min` / `Max`). Add those keys to the app's dictionary for other languages. The translator should read the app's locale signal so the impure `uiTranslate` pipe re-renders on language change.
- Without `UI_REFRESH` no push-based grid reloads happen.
- `UI_LOCALE` is a *function* returning the locale (default `() => 'en-US'`) so `<ui-shared-display-date>` re-evaluates when the host's locale signal changes; `UI_DATE_FORMAT` is the single Angular date format it renders (default `dd/MM/yyyy, HH:mm`).
- `UI_THEME_STORAGE_KEY` (default `ui.theme`) lets a host keep the key it already stored the theme under.

```html
<ui-shared-grid [source]="source" storageKey="users" initialSortField="Name" (rowClick)="open($event)">
  <ui-shared-text-input labelKey="users.search" [fields]="['Name','Email']" />
  <ui-shared-select labelKey="users.country" [options]="countries" field="Country" />
  <ui-shared-segmented [options]="statusOptions" initial="active" [clauseBuilder]="statusClause" />
  <ui-shared-grid-column key="name" labelKey="users.name" sortField="Name">
    <ng-template #cell let-u>{{ u.name }}</ng-template>
  </ui-shared-grid-column>
  <ng-template #actions let-u><ui-shared-menu-item icon="open_in_new" labelKey="common.open" (click)="open(u)" /></ng-template>
</ui-shared-grid>

<ui-shared-select [control]="form.controls.country" labelKey="form.country" [options]="countries" nullable />
<ui-shared-select [control]="form.controls.mark" labelKey="form.mark" [options]="marks" freeText inputMode="numeric" />
<ui-shared-password-field [control]="form.controls.password" labelKey="auth.password" autocomplete="current-password" />

// app.config.ts - the breadcrumb tree mirrors the routes; the header renders the trail above every title
provideUiBreadcrumbs([
  { path: 'admin', labelKey: 'nav.admin', redirect: 'companies', children: [
    { path: 'companies', labelKey: 'admin.companies.title', children: [{ path: ':id' }] },
  ] },
]),

<ui-shared-page-header titleKey="admin.companies.title" ledeKey="admin.companies.lede">
  <ui-shared-button slot="actions" variant="primary" icon="add" labelKey="admin.companies.add" (click)="create()" />
</ui-shared-page-header>

<ui-shared-side-drawer [open]="!!editing()" titleKey="admin.companies.edit" (close)="editing.set(null)">
  …form…
  <ui-shared-button slot="actions" labelKey="common.cancel" (click)="editing.set(null)" />
  <ui-shared-button slot="actions" variant="primary" labelKey="common.save" [loading]="saving()" (click)="save()" />
</ui-shared-side-drawer>

<ui-shared-status-chip [tone]="activeTone(row.isDeleted)" icon="check_circle">Active</ui-shared-status-chip>
<ui-shared-display-date [value]="row.dateCreated" />
```

```ts
inject(UiConfirmService).confirm({ titleKey: 'x.delete', messageKey: 'x.deleteConfirm' }).subscribe(() => …);
inject(UiNotificationService).success('Saved');
```

### Dropdowns

`<ui-shared-select>` is the only dropdown, and every dropdown is editable: typing filters the options (label or value), arrows / Enter / click pick one, the ▾ icon opens the list. The control holds the option value.

- Strict by default: text that matches no option is put back to the current choice on blur; clearing the text sets `''`. `nullable` adds an explicit "none" option.
- `freeText`: typed text that matches no option becomes the value (codes, numbers the list may not have).
- Filter values are written as OData literals: numbers and GUIDs bare (`TypeId eq e059…`), text quoted (`odataLiteral`).

### Inputs are also the grid filters

There are no separate filter components. `<ui-shared-text-input>`, `<ui-shared-select>` and `<ui-shared-segmented>` are form inputs on their own; projected into `<ui-shared-grid>` with a filter setting they become its filters:

| Input | Filter setting | Clause |
|---|---|---|
| text-input | `[fields]` | `contains(tolower(F), 'text')` on any field |
| select | `field`, `initial` | `F eq value` — only for an option's value (a typed label counts) |
| segmented | `field` (`all` = none), `initial` (defaults to the first option) | `F eq 'value'` |

Any of them takes `[clauseBuilder]` for a custom clause. `[control]` is optional in filter mode. Typing only changes the pending value; the grid's Search (or Enter in any filter) applies all filters in one fetch, Clear restores the initial values. The contract is `UiGridFilter` / `UI_GRID_FILTER` / `GridFilterState` in the primary entry, so another input can join by providing it.

`firstError(control)` returns `form.errors.<validatorKey>` for the first error of a touched/dirty control — built-in and custom validators alike.

The grid's backend must be a real OData controller (`value` + `@odata.count`).

## Layout

Every entry point has the same shape: `<entry>/public-api.ts` + `<entry>/src/<component>/ui-shared-<component>.component.{ts,html,scss}`. A component that only exists inside another one lives in its parent's folder (`button/button-content/`, `menu/menu-item/`, `tabs/tab/`, `nav-list/nav-item/`); plain helpers sit in the folder of what they serve (`odata/soft-delete.ts`, `forms/dates.ts`).

```
projects/ui-components/
  src/                         primary entry (@borassoft/ui-components)
    public-api.ts
    lib/i18n.ts                UI_TRANSLATE, UI_REFRESH, UI_LOCALE, UI_DATE_FORMAT, UI_DEFAULT_TEXTS, uiTranslate
    lib/storage.ts             uiStorage, storedChoice / storeChoice — localStorage that never throws
    lib/pointer-drag.ts        trackPointerDrag — shared column / panel resize tracking
    lib/forms/                 firstError, SelectOption (+ uiOptionText pipe), dates (provideUiDates, UiDateAdapter)
    lib/filters/grid-filter.ts UiGridFilter contract, GridFilterState, odataString, andClauses, eqClause
    lib/theme/                 UiThemeService
    lib/styles/_host.scss      host() / form-field() — the structure every component starts from
    lib/styles/_tokens.scss    the --ui-* token map (the only place a raw colour is written)
    lib/styles/_theme.scss     the default look (published as @borassoft/ui-components/styles/theme)
    lib/styles/_material.scss  the Material base theme (published as @borassoft/ui-components/styles/material)
  buttons/src/                 button/ (+ button-content/), icon-button/, button-group/, menu/ (+ menu-item/)
  display/src/                 icon/, status-chip/ (+ status-tones), stat-tile/, display-date/, qr-code/
  feedback/src/                confirm-dialog/ (+ confirm.service), loading-overlay/ (+ loading.service),
                               notification/, spinner/, progress-bar/
  grid/src/                    grid/, grid-column/, pager/, odata/ (odata-source, odata-fetch, soft-delete)
  calendar/src/                calendar/
  inputs/src/                  color-swatches/, select/, text-input/, textarea-input/, date-input/, password-field/,
                               checkbox/, toggle/, radio-group/, segmented/, file-button/, html-editor/
  layout/src/                  breadcrumb/ (+ ui-breadcrumbs.ts: provideUiBreadcrumbs, resolveUiBreadcrumbs), page-header/, collapsible-panel/, side-drawer/, side-panel/, divider/,
                               tabs/ (+ tab/), nav-list/ (+ nav-item/, nav-group/)
tools/check-grid-filters.ts    runtime check of the grid filters (`npm run check`)
tools/migrate-to-ui-shared.py  3.x → 4.x consumer migration
packages/                      built tarballs that consumers reference
```

## Migrating an app from 3.x to 4.0

4.0 renames every component to the `ui-shared-` prefix (`<ui-grid>` → `<ui-shared-grid>`, `UiGridComponent` → `UiSharedGridComponent`) and merges the `{ value, label }` option types into `SelectOption` (primary entry; `ComboOption`, `SegmentedOption`, `CoreGridSelectOption`, `CoreGridRadioOption` are gone). The grid filter components are gone: use `<ui-shared-text-input [fields]>`, `<ui-shared-select field>` and `<ui-shared-segmented>` (same attributes). `<ui-combo-input>` / `<ui-shared-autocomplete>` are `<ui-shared-select freeText>`; `<ui-shared-select>` no longer has `multiple`. `StatTone` is `StatusTone | ''`, the resize body class is `ui-resizing`, the components' internal CSS classes are `ui-shared-*` blocks, and the look moved to `@borassoft/ui-components/styles/theme` — add the `@use` to the app's `styles.scss`. Services, tokens and the `uiTranslate` pipe keep their names.

```bash
python tools/migrate-to-ui-shared.py <app>/src   # selectors, classes, filters, option types, imports
```
