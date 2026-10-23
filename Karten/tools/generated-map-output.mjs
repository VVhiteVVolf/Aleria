import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

export const stateHash = state => createHash('sha256').update(JSON.stringify(state)).digest('hex');

export async function writeGeneratedMap(root, relativePath, data, { check = false } = {}) {
  const target = new URL(relativePath, root);
  const text = JSON.stringify(data, null, 2) + '\n';
  let current = null;
  try { current = await fs.readFile(target, 'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (check) {
    if (current !== text) throw new Error(relativePath + ' ist gegenüber den Quellen verändert.');
    return;
  }
  if (current) {
    const previous = JSON.parse(current);
    if (previous.generatedStateHash !== stateHash(previous.state)) {
      throw new Error(relativePath + ' wurde bereits bearbeitet und wird nicht überschrieben.');
    }
  }
  await fs.mkdir(new URL('./', target), { recursive: true });
  await fs.writeFile(target, text, 'utf8');
}

export async function updateGeneratedMapRegistry(root, name, entries, { check = false } = {}) {
  if (!/^[A-Z_]+$/.test(name)) throw new Error('Ungültiger Registerblock.');
  const target = new URL('karten.registry.js', root);
  const current = await fs.readFile(target, 'utf8');
  const block = `    // BEGIN ${name}_GENERATED\n` + entries.map(entry =>
    JSON.stringify(entry, null, 2).split('\n').map(line => '    ' + line).join('\n') + ',').join('\n')
    + `\n    // END ${name}_GENERATED\n`;
  const marker = new RegExp(`    // BEGIN ${name}_GENERATED\\r?\\n[\\s\\S]*?    // END ${name}_GENERATED\\r?\\n`);
  const next = marker.test(current) ? current.replace(marker, block)
    : current.replace(/  const MAPS = \[\r?\n/, '  const MAPS = [\n' + block);
  if (!next.includes(`// BEGIN ${name}_GENERATED`)) throw new Error('Kartenregister nicht erkannt.');
  if (check) {
    if (current !== next) throw new Error(name + ': Registereinträge sind veraltet.');
  } else await fs.writeFile(target, next, 'utf8');
}
