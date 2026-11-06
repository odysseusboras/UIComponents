// Builds the tools/check-grid-*.ts runtime checks against dist/ and runs them (server-side render, no browser).
import { build } from 'esbuild';
import { mkdirSync, symlinkSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const link = resolve('node_modules/@borassoft/ui-components');
if (!existsSync(link)) {
  mkdirSync(resolve('node_modules/@borassoft'), { recursive: true });
  symlinkSync(resolve('dist/ui-components'), link, 'junction');
}
for (const name of ['check-grid-filters', 'check-grid-persistence']) {
  const outfile = resolve(`out-tsc/${name}.mjs`);
  await build({
    entryPoints: [`tools/${name}.ts`], outfile, bundle: true, platform: 'node', format: 'esm',
    packages: 'external', tsconfig: 'tsconfig.json', logLevel: 'error',
  });
  await import('file://' + outfile);
}
