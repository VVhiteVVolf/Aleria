import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildUrgrenOverview, buildMadruachProfile, addUrgrenToBearOverview } from '../modules/urgren/urgren-catalog.mjs';
import { formatGlannadeorLament, renderGlannadeorLament } from '../../shared/urgren/glannadeor-publications.mjs';

const check = process.argv.includes('--check');
const base = new URL('../tiere/raubtiere/baeren/', import.meta.url);
const parent = addUrgrenToBearOverview(JSON.parse(await readFile(new URL('uebersicht.json', base), 'utf8')));
const json = value => JSON.stringify(value, null, 2) + '\n';
const outputs = [
  ['uebersicht.json', json(parent)], ['urgren/uebersicht.json', json(buildUrgrenOverview())],
  ['madruach/profil.json', json(buildMadruachProfile())], ['urgren/klagelied.html', renderGlannadeorLament()],
  ['urgren/unter-eichen-unter-stein.txt', formatGlannadeorLament()]
];
for (const [path, content] of outputs) {
  const target = new URL(path, base);
  if (check) {
    if ((await readFile(target, 'utf8')).replace(/\r\n/g, '\n') !== content) throw new Error('Veraltete Urgren-Projektion: ' + path);
  } else {
    await mkdir(new URL('.', target), { recursive: true });
    await writeFile(target, content, 'utf8');
  }
}
console.log((check ? 'Checked' : 'Built') + ': Urgren, Madrúach, Bärenregister und Klagelied.');
