# @borassoft/ui-components

Shared Angular Material UI for Borassoft apps. Every component is prefixed `ui-shared-` (selectors) / `UiShared` (classes); services, tokens and the pipe keep `Ui` / `UI_`; app-specific components keep `app-`. MIT. Peer deps: Angular 19.2+ (common, core, forms, router, platform-browser) and RxJS; Angular Material/CDK and `qrcode-generator` come with the package.

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

## Component reference

Every label input ending in `Key` is a translation key resolved through `UI_TRANSLATE`; its plain twin (`label`, `titleText`, `hintText`…) takes already-translated text. Boolean inputs accept the bare attribute (`disabled`, `nullable`, `block`). Inputs marked **required** must be set.

### Buttons — `@borassoft/ui-components/buttons`

**`<ui-shared-button>`** — the one text button (renders a `<button>`, or an `<a>` with `routerLink`).
- `variant`: `primary` (filled accent) · `secondary` (default, outlined neutral) · `accent` · `danger` · `danger-filled` · `text`
- `size`: `sm` · `md` (default) · `lg`; `block` stretches it to full width
- `labelKey` / `label` (with neither, projected content is the label), `icon`, `iconEnd`
- `type`: `button` (default) · `submit`; `disabled`; `tooltipKey`
- `loading` shows a spinner (and `loadingKey` instead of the label) and disables the button
- `routerLink`, `queryParams`: render an anchor; a disabled anchor is `aria-disabled` and out of the tab order
- Listen to `(click)` on the element.

```html
<ui-shared-button variant="primary" icon="add" labelKey="products.add" (click)="create()" />
<ui-shared-button type="submit" variant="primary" labelKey="common.save" [loading]="saving()" loadingKey="common.saving" [disabled]="form.invalid" />
<ui-shared-button variant="secondary" size="lg" labelKey="home.signIn" routerLink="/auth/login" block />
```

**`<ui-shared-icon-button>`** — square icon-only button; `tooltipKey` is also its accessible name.
- `icon` **required**, `tooltipKey` **required**
- `tone`: `default` · `danger` (red on hover) · `accent` (always accent) · `warning`
- `size`: `sm` (32px, default, row actions) · `md` (40px, toolbars); `type`, `disabled`; `badge` (count bubble, hidden for null / 0)

```html
<ui-shared-icon-button icon="delete" tone="danger" tooltipKey="common.delete" (click)="remove(i)" />
```

**`<ui-shared-button-group>`** — the action row: uniform gap, wraps on narrow screens.
- `align`: `end` (default, form actions) · `start` · `between` · `center`; `divided` adds the form-footer rule above; `stack` = vertical full-width buttons

```html
<ui-shared-button-group divided>
  <ui-shared-button labelKey="common.cancel" (click)="close()" />
  <ui-shared-button variant="primary" labelKey="common.save" (click)="save()" />
</ui-shared-button-group>
```

**`<ui-shared-menu>`** + **`<ui-shared-menu-item>`** — dropdown menu. The trigger is whatever you project with `slot="trigger"`; the rest is the panel. Arrow / Home / End move between rows, Escape closes.
- menu: `align` `start` (default) · `end`; `flush` (no inner padding); `wide` (up to 420px, scrolls inside); `panelClass`; `(opened)`, `(closed)`
- menu item: `icon`, `labelKey` / `label` (or projected content), `danger`, `disabled` (never emits, never navigates), `link` (navigates, renders an anchor); listen to `(click)`

```html
<ui-shared-menu align="end">
  <ui-shared-icon-button slot="trigger" icon="more_vert" tooltipKey="core.grid.rowActions" />
  <ui-shared-menu-item icon="edit" labelKey="common.edit" (click)="edit()" />
  <ui-shared-divider />
  <ui-shared-menu-item icon="delete" labelKey="common.delete" danger (click)="remove()" />
</ui-shared-menu>
```

**`<ui-shared-button-content>`** — the icon + label + trailing icon inside button, menu item and nav item (`icon`, `iconEnd`, `labelKey`, `label`, `loading`, `loadingKey`). Only needed for custom clickable rows.

### Display — `@borassoft/ui-components/display`

**`<ui-shared-icon>`** — a Material Symbols icon.
- `name` **required**; `size` `sm` 18px · `md` 24px (default) · `lg` 32px (or any size through `--ui-icon-size`)
- `tone`: `inherit` (default) · `muted` · `accent` · `danger` · `success` · `warning` · `info`; `badge` (count, hidden for null / '' / 0)

```html
<ui-shared-icon name="notifications" [badge]="unread()" />
```

**`<ui-shared-status-chip>`** — the one status pill; projected content is its text.
- `tone`: `ok` · `warn` · `bad` · `info` · `muted` (default) — `activeTone(isDeleted)` maps a soft-delete flag to `ok` / `bad`
- `icon` or `dot`; `size` `sm` (default) · `lg`; `outline`; `tooltip` (translated text, adds a help cursor)

```html
<ui-shared-status-chip [tone]="activeTone(row.isDeleted)" dot>{{ 'status.active' | uiTranslate }}</ui-shared-status-chip>
```

**`<ui-shared-stat-tile>`** — KPI tile: icon + label + value, optional link. Projected content renders under the value.
- `icon` **required**, `label` **required** (translated); `value` (formatted; `—` when empty); `loading`
- `tone` (`StatusTone`, tints icon and value); `link` + `queryParams` make the tile a link with a chevron

```html
<ui-shared-stat-tile icon="trending_up" [label]="'dashboard.income' | uiTranslate" [value]="income() | number:'1.2-2'" [link]="['/documents']" />
```

**`<ui-shared-display-date>`** — renders ANY date in the one app format (`UI_DATE_FORMAT`, default `dd/MM/yyyy, HH:mm`) and locale (`UI_LOCALE`).
- `value` (ISO string, `Date`, number, null); `empty` (text for no value, default `—`; an unreadable value shows it too). `mode` is accepted but ignored.

**`<ui-shared-qr-code>`** — `value` **required**: the text to encode, drawn as an SVG that fills the host (size it from outside).

### Feedback — `@borassoft/ui-components/feedback`

**`UiConfirmService`** + `<ui-shared-confirm-dialog>` — the one Yes / No question. `confirm(data)` returns a stream that emits only on Yes.
- `ConfirmDialogData`: `titleKey` / `titleText`, `messageKey` / `messageText`, `confirmKey` (default `common.yes`), `cancelKey` (default `common.no`), `variant` `warn` (default) · `primary` (icon only)

```ts
inject(UiConfirmService).confirm({ titleKey: 'x.delete', messageKey: 'x.deleteConfirm' }).subscribe(() => this.delete());
```

**`UiNotificationService`** — toasts: `success(msg)`, `info(msg)` (3s), `warn(msg)` (5s), `error(msg)` (6s); each takes optional `MatSnackBarConfig` overrides. The action label is `common.ok`.

**`UiLoadingService`** + `<ui-shared-loading-overlay>` — mount the overlay once in the root component; call `start()` / `stop()` around work (e.g. from an HTTP interceptor). It shows only after 250 ms of pending work (`visible` signal) and blocks input meanwhile.

**`<ui-shared-spinner>`** — indeterminate spinner, `size` in px (default 24).
**`<ui-shared-progress-bar>`** — thin bar; indeterminate, or determinate with `value` 0–100.

### Grid — `@borassoft/ui-components/grid`

**`<ui-shared-grid>`** — OData grid: filters, sorting, paging, row actions, bulk selection, persisted layout.
- `source` **required**: an `OdataSource<T>` (`get(query) → Observable<{ items, total }>`), usually built on `fetchOdataPage`
- `initialSortField` + `initialSortDir` (`asc` default); `initialPageSize` (20), `pageSizeOptions` ([10, 20, 50, 100]); `emptyKey`
- `storageKey`: remember column widths, order, hidden columns, pager position and the current view (filters, page, page size)
- `selectable`: checkbox column + bulk bar (`#bulkActions let-rows` template); `preselect`: rows ticked when a page arrives
- `refreshKey`: reload the current page when `UI_REFRESH` emits `{ grid: refreshKey }`
- `(rowClick)`: emitted for a row click / Enter — only when the grid has a `#actions` template
- Methods: `refresh()` (same page), `reset()` (page 1), `clearSelection()`
- Content: `<ui-shared-grid-column>`s, filter inputs (see *Inputs are also the grid filters*), `<ng-template #actions let-row>` (row menu items; a row whose template renders nothing gets no ⋮), `<ng-template #bulkActions let-rows>`, `[slot=empty-actions]` (buttons in the empty state)

**`<ui-shared-grid-column>`** — `key` **required**, `labelKey` **required**, `sortField` (OData field; omit for unsortable), `align` `left` · `right` · `center`; body cell = `<ng-template #cell let-row>`.

```html
<ui-shared-grid [source]="source" storageKey="users" initialSortField="Name" (rowClick)="open($event)">
  <ui-shared-text-input labelKey="users.search" [fields]="['Name','Email']" />
  <ui-shared-segmented [options]="statusOptions" initial="active" [clauseBuilder]="softDeleteClauseBuilder" />
  <ui-shared-grid-column key="name" labelKey="users.name" sortField="Name">
    <ng-template #cell let-u>{{ u.name }}</ng-template>
  </ui-shared-grid-column>
  <ng-template #actions let-u><ui-shared-menu-item icon="edit" labelKey="common.edit" (click)="open(u)" /></ng-template>
</ui-shared-grid>
```

```ts
source: OdataSource<UserRow> = { get: q => fetchOdataPage(this.http, '/odata/Users', q, { defaultSort: 'Name' }, toRow) };
```

**`<ui-shared-pager>`** — used by the grid; standalone: `page`, `pageSize`, `total` (all **required**), `pageSizeOptions`, `(pageChange)`, `(pageSizeChange)`.

Helpers: `fetchOdataPage(http, url, query, { filter, expand, defaultSort }, toView)`, `SOFT_DELETE_STATUS_OPTIONS` + `softDeleteClauseBuilder` (Active / Deleted / All on `IsDeleted`), `UiEmptyDirective` (`uiEmpty`: tells whether projected content rendered anything).

### Inputs — `@borassoft/ui-components/inputs`

All form-field inputs take the `FormControl` directly as `[control]`, show a required marker when the control has `Validators.required`, and show `firstError(control)` as a translated `mat-error` once the field is touched or dirty. `subscriptSizing` (`dynamic` / `fixed`) sets whether space is reserved for the hint / error line.

**`<ui-shared-select>`** — the one dropdown (see *Dropdowns*). `control` (optional as a grid filter), `labelKey` **required**, `options` (`SelectOption[]`), `freeText`, `nullable` + `nullLabelKey`, `hintKey` / `hintText`, `emptyHintKey`, `disableWhenEmpty`, `inputMode` (`text` / `numeric`), `storageKey`; as a filter: `field`, `clauseBuilder`, `initial`. Project `[suffix]` content next to the arrow.

**`<ui-shared-text-input>`** — single-line input. `control` (optional as a filter), `labelKey` **required**, `type` (`text` · `email` · `number` · `tel` · `url` · `search` · `time` · `date`), `hintKey` / `hintText`, `placeholderKey`, `maxlength`, `min`, `max`, `step`, `inputMode`, `autocomplete`, `readonly`; as a filter: `fields`, `clauseBuilder`. Project `[prefix]` / `[suffix]` (icons, units).

```html
<ui-shared-text-input [control]="form.controls.amount" labelKey="form.amount" type="number" min="0" step="0.01"><span suffix>€</span></ui-shared-text-input>
```

**`<ui-shared-textarea-input>`** — multi-line: `control` **required**, `labelKey` **required**, `rows` (3), `hintKey` / `hintText`, `maxlength`, `readonly`.

**`<ui-shared-date-input>`** — date picker: `control` **required**, `labelKey` **required**, `min`, `max`, `hintKey` / `hintText`. Add `provideUiDates()` to the app config for day-first `dd/MM/yyyy` typing and display.

**`<ui-shared-password-field>`** — masked input with a show / hide eye: `control` **required**, `labelKey` **required**, `autocomplete` (`off`; use `current-password` / `new-password`), `hintKey`, `maxlength`.

**`<ui-shared-checkbox>`** — form mode: `[control]` (boolean); selection mode (no control): `checked`, `indeterminate`, `disabled`, `(changed)`. Label: `labelKey` or projected content; `ariaLabelKey` for a label-less box; `tooltipKey`.

**`<ui-shared-toggle>`** — on / off switch: `control` **required** (boolean), `labelKey` or projected content.

**`<ui-shared-radio-group>`** — `control` **required**, `options` **required** (`SelectOption[]`), `labelKey`, `direction` `row` (default) · `column`.

**`<ui-shared-segmented>`** — single-choice button row. View state: `value` + `(valueChange)`; form: `control`; filter: `field` (`all` = no filter) or `clauseBuilder`, plus `initial` (defaults to the first option). Also `options` **required**, `disabled`, `ariaLabelKey`, `storageKey` (remember the pick).

```html
<ui-shared-segmented [options]="years" [value]="year()" (valueChange)="year.set($event)" storageKey="home.year" />
```

**`<ui-shared-file-button>`** — opens the native file picker: `labelKey` **required**, `icon` (`upload`), `accept`, `multiple`, `disabled`, `variant` `flat` · `stroked`, `color`; `(filesSelected)` emits `File[]` (picking the same file twice emits twice).

**`<ui-shared-html-editor>`** — Source / Preview editor for trusted HTML; a form control (`formControlName` / `[formControl]`), `rows` (16), `placeholder`.

### Layout — `@borassoft/ui-components/layout`

**`<ui-shared-page-header>`** — the page title block: breadcrumb trail, back link, `h1`, lede, actions.
- `titleKey` / `titleText`, `ledeKey` / `ledeText` (keys win)
- `backLink` (routerLink target) or `showBack` + `(back)` for an imperative back button; `backKey` (`common.back`). The back link is hidden while a breadcrumb trail shows.
- `breadcrumb` (default on): render the trail from `provideUiBreadcrumbs`; `showActions` (default on) + `slot="actions"` content

```html
<ui-shared-page-header titleKey="admin.companies.title" ledeKey="admin.companies.lede">
  <ui-shared-button slot="actions" variant="primary" icon="add" labelKey="admin.companies.add" (click)="create()" />
</ui-shared-page-header>
```

**Breadcrumbs** — `provideUiBreadcrumbs(tree)` registers the app's tree once; `<ui-shared-page-header>` renders the trail above every title (pages never place `<ui-shared-breadcrumb>` themselves). A `UiBreadcrumbNode` is `{ path, labelKey?, label?(params), redirect?, children? }`: `path` is one URL segment, static or `:param` (static wins); a node without a label shows the page title; `redirect` is where a parent crumb links (and a parent redirecting to the current page is dropped). The trail stops at the first unknown segment and hides with fewer than two crumbs. `resolveUiBreadcrumbs(tree, url)` is the pure resolver.

```ts
provideUiBreadcrumbs([
  { path: 'admin', labelKey: 'nav.admin', redirect: 'companies', children: [
    { path: 'companies', labelKey: 'admin.companies.title', children: [{ path: ':id' }] },
  ] },
]),
```

**`<ui-shared-collapsible-panel>`** — card whose body collapses to its header; `titleKey` **required**, `storageKey` **required** (state in `ui.collapsible.<key>`), `ledeKey`.

**`<ui-shared-side-drawer>`** — right slide-in panel for edit / detail forms. `[open]` + `(close)` (backdrop click or Escape — unless an overlay inside it handled Escape), `titleKey`, `size` `md` · `lg` or an explicit `width`; body = content, footer = `slot="actions"`. Re-parents itself to `<body>` so no ancestor can trap it.

```html
<ui-shared-side-drawer [open]="!!editing()" titleKey="admin.companies.edit" (close)="editing.set(null)">
  …form…
  <ui-shared-button slot="actions" labelKey="common.cancel" (click)="editing.set(null)" />
  <ui-shared-button slot="actions" variant="primary" labelKey="common.save" (click)="save()" />
</ui-shared-side-drawer>
```

**`<ui-shared-side-panel>`** — the left shell column: collapsible to a rail, drag-resizable, state in `ui.sidePanel.<key>`. `storageKey` **required**, `defaultWidth` (248), `minWidth` (200), `maxWidth` (480); content in `slot="nav"` and `slot="content"`. It sticks below the app header (`--header-h` / `--ui-sticky-top`).

**`<ui-shared-tabs>`** + **`<ui-shared-tab>`** — flat tab strip, content rendered only for the selected tab. Tabs: `selected` + `(selectedChange)`; tab: `labelKey` / `label`.

**`<ui-shared-nav-list>`** + **`<ui-shared-nav-item>`** + **`<ui-shared-nav-group>`** — shell navigation. Item: `link` **required**, `labelKey` **required**, `icon`, `exact` (highlight on exact match only); group: `labelKey` **required** (small uppercase section label).

**`<ui-shared-divider>`** — hairline rule; `vertical` for toolbars.

### Primary entry — `@borassoft/ui-components`

- **i18n**: `UI_TRANSLATE` (key → text), `UI_DEFAULT_TEXTS` (English fallbacks), `uiTranslate` pipe, `UI_LOCALE`, `UI_DATE_FORMAT`, `UI_REFRESH` (grid reload signals)
- **forms**: `firstError(control)` → `form.errors.<validator>`; `SelectOption<T>` (`{ value, label }` or `{ value, labelKey }`) + `uiOptionText` pipe / `optionText()`; `provideUiDates()` / `UiDateAdapter` / `UI_DATE_FORMATS`
- **grid-filter contract**: `UI_GRID_FILTER`, `UiGridFilter`, `GridFilterState`, `provideGridFilter`, `ClauseBuilder`, `odataString`, `odataLiteral`, `eqClause`, `andClauses`
- **storage**: `uiStorage` (get / set / remove / getJson / setJson, never throws), `storedChoice` / `storeChoice`
- **theme**: `UiThemeService` (`theme`, `isDark`, `toggle()`, `set()`), `UI_THEME_STORAGE_KEY`
- `trackPointerDrag(zone, onMove, onEnd)` — the drag-resize helper behind grid columns and the side panel

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
"@borassoft/ui-components": "file:packages/borassoft-ui-components-1.0.0.tgz"
```

```ts
// app.config.ts — every provider is optional
{ provide: UI_TRANSLATE, useFactory: () => { const i18n = inject(I18nService); return (k: string) => i18n.t(k); } },
{ provide: UI_REFRESH,   useFactory: () => inject(GridRefreshService).signals$ },
{ provide: UI_LOCALE,    useFactory: () => { const i18n = inject(I18nService); return () => i18n.locale(); } },
{ provide: UI_DATE_FORMAT, useValue: 'dd/MM/yyyy, HH:mm' },
{ provide: UI_THEME_STORAGE_KEY, useValue: 'myapp.theme' },
provideUiDates(),
provideUiBreadcrumbs([...]),   // see Breadcrumbs
```

- Without `UI_TRANSLATE` the components use English defaults (`UI_DEFAULT_TEXTS`: `core.grid.*`, `pager.*`, `breadcrumb.*`, `common.*`, `sidePanel.*`, `htmlEditor.*`, `form.password.*`, `form.errors.*` — including the datepicker's `matDatepickerParse` / `Min` / `Max`). Add those keys to the app's dictionary for other languages. The translator should read the app's locale signal so the impure `uiTranslate` pipe re-renders on language change.
- Without `UI_REFRESH` no push-based grid reloads happen.
- `UI_LOCALE` is a *function* returning the locale (default `() => 'en-US'`) so `<ui-shared-display-date>` re-evaluates when the host's locale signal changes; `UI_DATE_FORMAT` is the single Angular date format it renders (default `dd/MM/yyyy, HH:mm`).
- `UI_THEME_STORAGE_KEY` (default `ui.theme`) lets a host keep the key it already stored the theme under.

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
  inputs/src/                  select/, text-input/, textarea-input/, date-input/, password-field/,
                               checkbox/, toggle/, radio-group/, segmented/, file-button/, html-editor/
  layout/src/                  breadcrumb/ (+ ui-breadcrumbs.ts: provideUiBreadcrumbs, resolveUiBreadcrumbs), page-header/, collapsible-panel/, side-drawer/, side-panel/, divider/,
                               tabs/ (+ tab/), nav-list/ (+ nav-item/, nav-group/)
tools/check-grid-filters.ts    runtime check of the grid filters (`npm run check`)
packages/                      built tarballs that consumers reference
```
