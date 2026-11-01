// Diagnostic plan only: writes this directory's reports, never database files.
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readCharacterExportOverlays } from '../../CharakterDatenbank/lib/character-export-sources.mjs';
import { buildCharacterDatabase } from '../../CharakterDatenbank/lib/character-database-model.mjs';
import { mergeCharacterExportAssignments } from '../../CharakterDatenbank/lib/character-export-assignments.mjs';
import { buildFamilyPersonViewUrl, createFamilyCandidates } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const archiveRoot = resolve(root, 'Charakter Archiv Exporte'), databaseRoot = resolve(root, 'CharakterDatenbank');
const { FAMILY_REGISTRY } = await import(pathToFileURL(resolve(root, `Stammb${String.fromCharCode(228)}ume/assets/js/data/families.registry.js`)));
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const registry = await read(resolve(databaseRoot, 'registry.json')), snapshot = await read(resolve(databaseRoot, 'generated/characters.snapshot.json'));
const archives = await Promise.all((await readdir(archiveRoot, { withFileTypes: true }))
  .filter(row => row.isFile() && /^aleria-charakterarchiv-.*\.json$/i.test(row.name))
  .map(async row => ({ path: resolve(archiveRoot, row.name), mtime: (await stat(resolve(archiveRoot, row.name))).mtimeMs })));
archives.sort((a, b) => b.mtime - a.mtime);
const sourcePath = archives[0].path, base = await read(sourcePath);
const overlays = await readCharacterExportOverlays({ workspaceRoot: root, archiveRoot, sourcePath,
  registeredSources: [...(registry.sourceOverlays || []), ...(snapshot.sourceOverlays || [])] });
const exportedAt = [base.exportedAt, ...overlays.map(row => row.exportedAt)].filter(v => Number.isFinite(Date.parse(v))).sort((a, b) => Date.parse(b) - Date.parse(a))[0];
const archive = { ...base, exportedAt, charTabs: mergeCharacterExportAssignments(base.charTabs, overlays), characters: [...base.characters, ...overlays.map(row => row.character)] };
const candidates = FAMILY_REGISTRY.flatMap(row => createFamilyCandidates(row).map(person => ({ ...person, url: buildFamilyPersonViewUrl(person) })));
const plan = buildCharacterDatabase(archive, candidates, { sourcePath: relative(root, sourcePath).split(sep).join('/') });
const oldById = new Map(registry.records.map(row => [row.firestoreDocumentId, row]));
const newIds = new Set(plan.records.map(row => row.record.character.id));
const report = { sourcePath: relative(root, sourcePath).split(sep).join('/'), oldCount: registry.count, count: plan.records.length, overlayCount: overlays.length,
  removedIds: [...oldById.keys()].filter(id => !newIds.has(id)), addedIds: [...newIds].filter(id => !oldById.has(id)),
  classificationMoves: plan.records.flatMap(row => {
    const old = oldById.get(row.record.character.id);
    return old && old.path !== row.path ? [{ id: row.record.character.id, name: row.record.character.name, from: old.path, to: row.path }] : [];
  }) };
await writeFile(new URL('gawain-retained-source-plan.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
await writeFile(new URL('planned-gameplay-retained-sources.json', import.meta.url), JSON.stringify(plan.records.map(row => ({ id: row.record.character.id,
  inventory: row.record.character.inventory, combatProfile: row.record.character.combatProfile })), null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
