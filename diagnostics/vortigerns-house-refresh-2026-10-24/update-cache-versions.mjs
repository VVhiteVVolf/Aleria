// Prepare coherent local cache keys for the next explicitly authorized publication.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const filesIn = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
  ? filesIn(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const files = [
  ...filesIn('Stammbäume/assets/js').filter(file => file.endsWith('.js') && path.basename(file) !== 'house-biographies.registry.js'),
  'Stammbäume/Stammbaum.html', 'Familien Häuser und Clans/haus.html',
  'Familien Häuser und Clans/kleinehaeuser.html', 'Gallerien/krieger/index.html', 'Gallerien/krieger/warrior-gallery.mjs'
];
for (const file of files) {
  const before = readFileSync(file, 'utf8');
  const after = before.replaceAll('20261024-housebio-v1', '20261024-vortigerns-v1');
  if (after !== before) writeFileSync(file, after);
}
