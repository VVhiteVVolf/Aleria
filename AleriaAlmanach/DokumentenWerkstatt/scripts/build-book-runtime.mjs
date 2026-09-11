// The downloaded HTML uses the exact Bestiarium implementation, bundled for offline use.
import { build } from 'esbuild';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const target = new URL('../assets/book-reader.bundle.js', import.meta.url);
const result = await build({
  entryPoints: [fileURLToPath(new URL('../../../Bestiarium/modules/book-reader/book-reader.mjs', import.meta.url))],
  bundle: true, write: false, format: 'iife', minify: true, legalComments: 'inline', target: ['es2022'],
  banner: { js: '// Generated from Bestiarium/modules/book-reader. Run scripts/build-book-runtime.mjs to refresh.\n' }
});
const content = result.outputFiles[0].text;
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== content) throw new Error('Buch-Export veraltet: build-book-runtime.mjs ausführen.');
  console.log('Book export matches the Bestiarium source.');
} else {
  await mkdir(new URL('../assets/', import.meta.url), { recursive: true });
  await writeFile(target, content); console.log('Built the shared Bestiarium book runtime for standalone exports.');
}
