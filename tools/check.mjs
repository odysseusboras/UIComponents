// Builds tools/check-grid-filters.ts against dist/ and runs it (server-side render, no browser).
import { build } from 'esbuild';
import { mkdirSync, symlinkSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const link = resolve('node_modules/@borassoft/ui-components');
if (!existsSync(link)) {
  mkdirSync(resolve('node_modules/@borassoft'), { recursive: true });
  symlinkSync(resolve('dist/ui-components'), link, 'junction');
}
const outfile = resolve('out-tsc/check-grid-filters.mjs');
await build({
  entryPoints: ['tools/check-grid-filters.ts'], outfile, bundle: true, platform: 'node', format: 'esm',
  packages: 'external', tsconfig: 'tsconfig.json', logLevel: 'error',
});
await import('file://' + outfile);
