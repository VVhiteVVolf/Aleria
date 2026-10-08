import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function createPortraitBindings(directory) {
const config = JSON.parse(fs.readFileSync(path.join(directory, 'import.json'), 'utf8'));
const dataDirectory = path.resolve(directory, '../../assets/js/data');
const reuse = JSON.parse(fs.readFileSync(path.join(directory, 'portrait-reuse.json'), 'utf8'));
const bindings = {};
const remaining = new Set(Object.keys(reuse));
// Preserve verified module ownership across later imports. Re-selecting the
// first matching aggregate can otherwise make older and newer imports cyclic.
const bindingFile = path.join(directory, 'portrait-bindings.json');
const previous = fs.existsSync(bindingFile) ? JSON.parse(fs.readFileSync(bindingFile, 'utf8')) : {};
for (const [id, binding] of Object.entries(previous)) {
  if (!remaining.has(id) || binding.path !== reuse[id]) continue;
  const module = await import(pathToFileURL(path.join(dataDirectory, binding.module)));
  if (module[binding.exportName]?.[binding.key] !== reuse[id]) throw new Error(`Changed portrait ownership: ${id}`);
  bindings[id] = binding;
  remaining.delete(id);
}
// Existing leaf modules may belong to a newly populated family. The emitter
// retains their reused bindings alongside the new downloads.
for (const file of fs.readdirSync(dataDirectory).filter(file => file.endsWith('-portraits.js') && !file.startsWith(config.slug + '-'))) {
  if (!remaining.size) break;
  const module = await import(pathToFileURL(path.join(dataDirectory, file)));
  for (const [exportName, mapping] of Object.entries(module)) {
    if (!exportName.endsWith('_PORTRAITS') || typeof mapping !== 'object') continue;
    for (const id of remaining) {
      const key = Object.keys(mapping).find(key => mapping[key] === reuse[id]);
      if (key) {
        bindings[id] = { module: file, exportName, key, path: reuse[id] };
        remaining.delete(id);
      }
    }
  }
}
if (remaining.size) throw new Error(`Portrait mapping missing for ${[...remaining].join(', ')}`);
fs.writeFileSync(path.join(directory, 'portrait-bindings.json'), JSON.stringify(bindings, null, 2) + '\n');
console.log(`Located ${Object.keys(bindings).length} existing portrait bindings.`);

}
