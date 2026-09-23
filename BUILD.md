# Build ui-components

1. Bump `"version"` in `projects\ui-components\package.json`.
2. Check and pack (from this folder):

```powershell
npm install
npm run check
npm run pack
```

Output: `packages\borassoft-ui-components-<version>.tgz`

## Use the new version in an app

```powershell
copy D:\WORK\OBO\UIComponents\packages\borassoft-ui-components-<version>.tgz <app-folder>\packages\
cd <app-folder>
npm install .\packages\borassoft-ui-components-<version>.tgz
npx tsc -p tsconfig.app.json --noEmit
npx ng build --configuration development
```

The app's global stylesheet includes the default look once, at the top:

```scss
@use "@borassoft/ui-components/styles/theme";
```
