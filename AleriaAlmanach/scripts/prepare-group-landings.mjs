import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { migrateGroupLandingEntry } from '../modules/landing/group-landing-migration.js';
import { collectGroupRoster } from '../modules/landing/group-landing-roster.js';

// Prepare reviewable import packages only. This script has no remote write path.
const [sourcePath, destination, ...localPackages] = process.argv.slice(2);
if (!sourcePath || !destination) throw new Error('Usage: node scripts/prepare-group-landings.mjs <module-records.json> <output-directory> [newer-local-packages.json ...]');
const records = JSON.parse(await readFile(resolve(sourcePath), 'utf8'));
const overrides = new Map();
for (const path of localPackages) {
  const payload = JSON.parse(await readFile(resolve(path), 'utf8'));
  if (!payload.module?.entry?.id) throw new Error(`Invalid module package: ${path}`);
  overrides.set(payload.module.entry.id, { ...payload.module, sourcePath: path });
}
const output = resolve(destination);
await mkdir(output, { recursive: true });
const manifest = [];
for (const record of records.filter(record => record.data?.section?.tab === 'Gruppen')) {
  const source = overrides.get(record.id) || { section: record.data.section, entry: record.data.entry || JSON.parse(record.data.entryJson) };
  const entry = migrateGroupLandingEntry(source.entry, { tab: 'Gruppen' });
  const index = entry.pages.findIndex(page => page.landing?.group);
  const filename = `${entry.id}-gruppenuebersicht.json`;
  const payload = { type: 'aleria-module-package', version: 1, exportedAt: new Date().toISOString(),
    sourceNote: `Gruppenübersicht direkt nach der Hierarchie. Bestehende Seiten, Porträts und historische Kommentar-IDs erhalten. Nur lokal vorbereitet.${source.sourcePath ? ` Neuerer lokaler Entwurf übernommen: ${source.sourcePath}` : ''}`,
    module: { type: 'aleria-module', version: 1, section: source.section, entry } };
  await writeFile(join(output, filename), JSON.stringify(payload, null, 2) + '\n');
  manifest.push({ id: entry.id, title: entry.title, file: filename, pageIndex: index,
    members: collectGroupRoster(entry).length, selected: entry.pages[index].landing.group.members.filter(member => member.assignment === 'active').length,
    sourceUpdateTime: record.updateTime, localSource: source.sourcePath || null });
}
await writeFile(join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest));
