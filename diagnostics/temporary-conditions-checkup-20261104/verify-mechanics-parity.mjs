import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = resolve(root, 'AleriaAlmanach/modules');
const generated = resolve(root, 'firebase/functions/src/generated');
const files = await readdir(generated, { recursive: true, withFileTypes: true });
const mismatches = [];
let checked = 0;
for (const file of files) {
  if (!file.isFile()) continue;
  const target = resolve(file.parentPath, file.name);
  const key = relative(generated, target).replaceAll('\\', '/');
  const [original, copy] = await Promise.all([readFile(resolve(source, key)), readFile(target)]);
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  checked++;
  if (hash(original) !== hash(copy)) mismatches.push(key);
}
const result = { checked, mismatches, passed: mismatches.length === 0 };
await writeFile(new URL('./mechanics-parity.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
if (!result.passed) process.exitCode = 1;
