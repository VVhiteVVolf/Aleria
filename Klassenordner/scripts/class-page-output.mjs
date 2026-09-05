import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

export async function writeClassPageOutput(root, path, content, check) {
  const target = new URL(path, root);
  if (check) assert.equal((await readFile(target, 'utf8')).replace(/\r\n/g, '\n'), content.replace(/\r\n/g, '\n'), `${path} ist veraltet. npm run build:classes ausführen.`);
  else await writeFile(target, content, 'utf8');
}
