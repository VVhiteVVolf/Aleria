import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(projectRoot, 'vendor/scene-dice');
const diceBoxOutput = resolve(outputRoot, 'dice-box.esm.js');
const parserOutput = resolve(outputRoot, 'dice-parser-interface.esm.js');

await mkdir(outputRoot, { recursive: true });

const shared = {
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'info'
};

await Promise.all([
  build({
    ...shared,
    stdin: {
      contents: "export { default } from '@3d-dice/dice-box';",
      resolveDir: projectRoot,
      sourcefile: 'dice-box-browser-entry.js'
    },
    outfile: diceBoxOutput,
    banner: { js: '/*! @3d-dice/dice-box 1.1.4 | MIT and BabylonJS | Apache-2.0 | see ../../THIRD_PARTY_NOTICES.md */' }
  }),
  build({
    ...shared,
    stdin: {
      contents: "export { default } from '@3d-dice/dice-parser-interface';",
      resolveDir: projectRoot,
      sourcefile: 'dice-parser-browser-entry.js'
    },
    outfile: parserOutput,
    banner: { js: '/*! @3d-dice/dice-parser-interface 0.2.1 | MIT | see ../../THIRD_PARTY_NOTICES.md */' }
  })
]);

await Promise.all([diceBoxOutput, parserOutput].map(async outputFile => {
  const source = await readFile(outputFile, 'utf8');
  await writeFile(outputFile, source.replace(/[ \t]+$/gm, ''), 'utf8');
}));

console.log(`Browser-Bundles erzeugt: ${outputRoot}`);
