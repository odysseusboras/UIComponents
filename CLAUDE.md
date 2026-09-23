# @borassoft/ui-components

Shared, generic Angular Material UI (`ui-shared-*` selectors, `UiShared*Component` classes; services/tokens/pipe keep `Ui*` / `UI_*`): the OData grid, every form input, layout (page header, collapsible panel, side drawer, resizable side panel), feedback (confirm, loading, toasts), display (status chip, stat tile, date, QR) and the theme service. See README for the full list. MIT. Peer deps: Angular 19.2+ and RxJS; Material/CDK and qrcode-generator ship with the package.

## Non-negotiable rules

1. **Consumers use the packed tarball, never this source.** Each app commits `packages/borassoft-ui-components-<version>.tgz` and points `package.json` at it (`"@borassoft/ui-components": "file:packages/…"`). Nothing in an app may import from a relative copy of the grid; there is none.
2. **Every change here ships as a new version.** Bump `version` in `projects/ui-components/package.json` BEFORE `npm run pack`. Re-packing the same version breaks every consumer's `npm install` (lock-file EINTEGRITY on the tarball hash).
3. **A change is not done until every consuming app builds with it.** After packing: copy the tarball into each app's `packages/`, update its `package.json`, `npm install`, `npx tsc -p tsconfig.app.json --noEmit`, `npx ng build --configuration development`. Keep the old tarball until the consumer's lock file references the new one, then delete it.
4. **Everything stays app-agnostic.** No app services, no app translation keys hard-wired: labels come through `UI_TRANSLATE` (defaults in `UI_DEFAULT_TEXTS`), push reloads through `UI_REFRESH`, form errors through `firstError()` → `form.errors.<validator>`.
5. **Component SCSS is structure only; the look lives in the theme.** Every component has its own `.html` and `.scss` (no inline template/styles). Its SCSS starts with `@include ui.host(<display>)` (or `ui.form-field`) from `src/lib/styles/_host.scss` and adds only display / flex / grid / position / overflow / cursor. Colours, borders, radius, spacing, type, hover and motion go in `src/lib/styles/_theme.scss` as global `ui-shared-*` BEM selectors using `--ui-*` tokens (`_tokens.scss` is the only place a raw colour is written; thin borders are `var(--ui-hairline)`, focus rings `var(--ui-focus-width)`). The theme is sectioned by entry point (buttons, display, feedback, grid, inputs, layout, then app-wide Material, then keyframes): a new component's look goes in its entry's section and its element name in `$components`. The theme also carries the app-wide Material behaviour every app shares (form-field focus/notch/required/error styles, dropdown panels, dialogs, menus, tooltips, snackbar toasts, tab bodies, buttons) — app-specific classes stay in the app. No `::ng-deep`; `!important` only in the theme, where Material's own rules would otherwise win. Apps include the theme once (`@use '@borassoft/ui-components/styles/theme'`) and override it with plain CSS.
6. **Public surface = the entry points' `public-api.ts` files** (`src/` for the primary entry, `grid/`, `inputs/`, `buttons/`, `layout/`, `feedback/`, `display/`). Folder = component: `<entry>/src/<component>/`; a component that only exists inside another one (a tab of the tabs, a menu item of the menu, the nav item of the nav list, the shared button content) lives in a subfolder of its parent: `tabs/tab/`, `menu/menu-item/`, `nav-list/nav-item/`, `button/button-content/`. Anything an app imports must be exported from one of them; code inside a secondary entry imports shared bits from `'@borassoft/ui-components'`, never by relative path across entries. A new component goes in the entry that matches its kind; anything exported is a contract — renaming or removing it is a breaking change (bump the major).
7. **No noise comments, no dead files** — same house rules as the consumers: comments explain *why*, dead code is deleted, not stubbed.
8. **Generic only.** Nothing domain-specific (invoices, VAT, tenants…) and nothing hard-coded: if a component only makes sense in one app, it stays in that app as `app-*`.
9. **Reuse before adding.** Option lists are `SelectOption`; persisted UI state goes through `uiStorage` / `storedChoice` / `storeChoice` (or a component's `storageKey`), never raw `localStorage`; drag-resize through `trackPointerDrag`; OData literals/clauses through `odataString` / `andClauses` / `eqClause`; form-field inputs use `ui.form-field` from `_host.scss`. Grid filters are NOT separate components: an input becomes a filter by providing `UI_GRID_FILTER` (`provideGridFilter` + `GridFilterState`), never by copying it into `grid/`. `npm run check` must pass.

10. **Every component file trio is mandatory: `.ts` + `.html` + `.scss`, always `templateUrl` / `styleUrl`.** No `template:` or `styles:` inline, not even for a one-liner (`<ng-content />` goes in its own `.html`). A component without its `.html` is a review failure.
11. **Before building anything, run `/ponytail` then `/graphify`.** `/ponytail`: the laziest working design - one component, the fewest inputs that cover every consumer, no speculative options. `/graphify`: map what already exists (entry points, theme selectors, tokens, i18n keys, the consumers' templates) and reuse or extend it instead of adding a parallel thing. Only then write code; a change that skipped this is redone.
12. **Apps never touch `@angular/material` directly.** Every Material feature an app needs (buttons, icons, tabs, menus, spinners, progress bars, dividers, badges, tooltips, nav lists…) is wrapped here as a `ui-shared-*` component with its look in `_theme.scss`; an app that still imports `@angular/material/*` is a gap in this library, not an app-side workaround.

13. **Navigation chrome is declarative, app-side data.** The breadcrumb trail comes from the tree an app registers with `provideUiBreadcrumbs` (`layout/src/breadcrumb/ui-breadcrumbs.ts`) and is rendered by `<ui-shared-page-header>` on every page; a page never places `<ui-shared-breadcrumb>` itself and the library never knows an app's routes. New navigation aids (a section switcher, a "next / previous" pair …) follow the same shape: data from the app through a `provideUi*` token, rendering in the one shared place.

## Layout

Each entry: `<entry>/public-api.ts` + `<entry>/src/<component>/ui-shared-<component>.component.{ts,html,scss}`. A new component follows the same shape.

```
projects/ui-components/
  src/lib/                          primary entry: i18n.ts, storage.ts (uiStorage, storedChoice), pointer-drag.ts, forms/ (firstError, SelectOption, uiOptionText, dates → provideUiDates), filters/grid-filter.ts (UI_GRID_FILTER, GridFilterState, odataString, andClauses), theme/ (UiThemeService), styles/ (_host, _tokens, _theme, _material)
  buttons/src/                      button (+ button-content), icon-button, button-group, menu (+ menu-item)
  display/src/                      icon, status-chip (+ tones), stat-tile, display-date, qr-code
  feedback/src/                     confirm-dialog (+ service), loading-overlay (+ service), notification/, spinner, progress-bar
  grid/src/                         grid/, grid-column/, pager/, odata/ (source, fetch, soft-delete)
  inputs/src/                       select (the one dropdown, type-to-filter), text-input, textarea-input, date-input, password-field, checkbox, toggle, radio-group, segmented, file-button, html-editor
  layout/src/                       page-header, collapsible-panel, side-drawer, side-panel, divider, tabs (+ tab), nav-list (+ nav-item, nav-group)
tools/check-grid-filters.ts         runtime check of inputs-as-grid-filters (npm run check)
packages/                           built tarballs (committed)
dist/                               ng-packagr output (ignored)
```

## Build

```powershell
cd D:\WORK\OBO\UIComponents
npm install
# bump projects\ui-components\package.json "version"
npm run pack      # -> packages\borassoft-ui-components-<version>.tgz
```

## Conventions

- Templates use `@if / @for` control flow; every label goes through `uiTranslate` (never a host pipe).
- Every grid backed by a real OData controller (`value` + `@odata.count`); `fetchOdataPage` is the only fetch helper.
- Grid layout AND view state in localStorage under `app.coreGrid.<storageKey>.*` (key kept for existing users); only when `[storageKey]` is set: `.widths`, `.order`, and `.view` (applied filter values + page + page size, so a reload lands on the same view). Filters in `.view` are matched by position — a grid that gained or lost one drops the remembered values rather than restoring them onto the wrong input.
- A grid with an open/edit row action binds `(rowClick)` to it (consumer rule).
