import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COASTAL_EVENT_PAGES } from '../modules/coastal-history/coastal-events.mjs';
import { renderCoastalEvent } from '../modules/coastal-history/coastal-event-render.mjs';
import { PIRATES } from '../../shared/coastal-history/pirates.mjs';
import { renderPirateProfile, renderPiracyIndex } from '../../Piraterie/modules/pirate-render.mjs';
import { piracyModuleScript } from '../../Piraterie/modules/piracy-module-build.mjs';
import { coastalSource } from '../../shared/coastal-history/coastal-sources.mjs';
import { renderCoastalEdition } from '../../shared/coastal-history/edition-render.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const check = process.argv.includes('--check');
let changed = 0;
async function output(file, text) {
  const target = resolve(root, file);
  const old = await readFile(target, 'utf8').catch(error => { if (error.code === 'ENOENT') return ''; throw error; });
  if (old === text) return;
  changed++;
  if (check) { process.stderr.write(`Nicht aktuell: ${file}\n`); return; }
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, text, 'utf8');
}
for (const event of COASTAL_EVENT_PAGES) await output(event.file, renderCoastalEvent(event));
for (const entry of PIRATES) {
  await output(entry.profileHref, renderPirateProfile(entry));
  await output(entry.factionHref, renderPirateProfile(entry, { faction: true }));
}
await output('Piraterie/index.html', renderPiracyIndex());
await output('AleriaAlmanach/modules/piracy/piracy-entries.js', piracyModuleScript());
await output('shared/coastal-history/redaktion.html', renderCoastalEdition());

// Existing faction records retain their source coordinates and stable IDs.
const factionFile = 'Fraktionen/data/dunkle-gilden.json';
const faction = JSON.parse(await readFile(resolve(root, factionFile), 'utf8'));
faction.groups = faction.groups.filter(group => group.id !== 'piraten-gefolge' && !group.id.startsWith('piraten-banden-'));
for (const parentId of ['klauen-des-leviathan', 'schwarzblut-marodeure', 'sirenenzahn']) {
  faction.groups.push({ id: `piraten-banden-${parentId}`, title: `Banden der ${PIRATES.find(entry => entry.id === parentId).name}`, parentId });
}
for (const entry of PIRATES) {
  const old = faction.entries.find(item => item.id === entry.id);
  const source = coastalSource(entry.sourceId);
  const patch = { name: entry.name, groupId: entry.parentId ? `piraten-banden-${entry.parentId}` : 'piraten', parentId: entry.parentId || 'loge-der-daemmerung', href: entry.factionHref.replace('Fraktionen/', ''), symbol: `../${entry.symbol}`, summary: entry.summary };
  if (old) Object.assign(old, patch);
  else faction.entries.push({ id: entry.id, kind: 'Piratenbande', ...patch, source: { document: `../Archiv/Quellen/kuestenchroniken-2026-10-24/${source.file}`, name: entry.name, kind: 'coastal-pirate-source', row: null, column: null, image: source.images[0] || '' } });
}
await output(factionFile, JSON.stringify(faction, null, 2) + '\n');
if (check && changed) process.exitCode = 1;
process.stdout.write(`Küstenchroniken: 9 Ereignisse, 21 Bandenakten, 21 Fraktionsseiten, 23 Almanach-Module; ${changed} ${check ? 'Abweichungen' : 'Dateien aktualisiert'}.\n`);
