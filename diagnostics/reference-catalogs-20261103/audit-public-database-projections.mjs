// Read-only equivalent of the public database generator's current input plan.
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { buildCharacterDatabase } from '../../CharakterDatenbank/lib/character-database-model.mjs';
import { readCharacterExportOverlays } from '../../CharakterDatenbank/lib/character-export-sources.mjs';
import { mergeCharacterExportAssignments } from '../../CharakterDatenbank/lib/character-export-assignments.mjs';
import { createFamilyCandidates, buildFamilyPersonViewUrl } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = fileURLToPath(new URL('../../', import.meta.url)), databaseRoot = resolve(root, 'CharakterDatenbank'), archiveRoot = resolve(root, 'Charakter Archiv Exporte');
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const registry = await read(resolve(databaseRoot, 'registry.json')), snapshot = await read(resolve(databaseRoot, 'generated/characters.snapshot.json'));
const sources = await Promise.all((await readdir(archiveRoot, { withFileTypes: true })).filter(entry => entry.isFile() && /^aleria-charakterarchiv-.*\.json$/i.test(entry.name)).map(async entry => {
  const path = resolve(archiveRoot, entry.name); return { path, modified: (await stat(path)).mtimeMs };
}));
sources.sort((a, b) => b.modified - a.modified);
const sourcePath = sources[0].path, base = await read(sourcePath);
const overlays = await readCharacterExportOverlays({ workspaceRoot: root, archiveRoot, sourcePath,
  registeredSources: [...(registry.sourceOverlays || []), ...(snapshot.sourceOverlays || [])] });
const exportedAt = [base.exportedAt, ...overlays.map(item => item.exportedAt)].filter(value => Number.isFinite(Date.parse(value))).sort().at(-1) || base.exportedAt;
const archive = { ...base, exportedAt, charTabs: mergeCharacterExportAssignments(base.charTabs, overlays), characters: [...base.characters, ...overlays.map(item => item.character)] };
const candidates = FAMILY_REGISTRY.flatMap(family => createFamilyCandidates(family).map(candidate => ({ ...candidate, url: buildFamilyPersonViewUrl(candidate) })));
const database = buildCharacterDatabase(archive, candidates, { sourcePath: relative(root, sourcePath).replaceAll('\\', '/') });
const existing = new Map(await Promise.all(registry.records.map(async row => [row.recordId, { path: row.path, record: await read(resolve(databaseRoot, row.path)) }])));
const pathChanges = [], contentChanges = [], unchanged = [];
for (const item of database.records) {
  const before = existing.get(item.record.recordId);
  if (before?.record.local) item.record.local = before.record.local;
  const linkage = new Set(['identity', 'genealogy', 'taxonomyPath']);
  const changedProtectedFields = before ? [...new Set([...Object.keys(before.record.character), ...Object.keys(item.record.character)])].filter(key => !linkage.has(key) && !isDeepStrictEqual(before.record.character[key], item.record.character[key])) : [];
  if (!before || before.path !== item.path) pathChanges.push({ recordId: item.record.recordId, from: before?.path || '', to: item.path, changedProtectedFields });
  else if (!isDeepStrictEqual(before.record, JSON.parse(JSON.stringify(item.record)))) contentChanges.push({ recordId: item.record.recordId, path: item.path, changedProtectedFields,
    changedTopLevelFields: [...new Set([...Object.keys(before.record), ...Object.keys(item.record)])].filter(key => !isDeepStrictEqual(before.record[key], JSON.parse(JSON.stringify(item.record))[key])),
    changedSyncFields: [...new Set([...Object.keys(before.record.sync), ...Object.keys(item.record.sync)])].filter(key => !isDeepStrictEqual(before.record.sync[key], item.record.sync[key])) });
  else unchanged.push(item.record.recordId);
}
const result = { currentRecords: registry.records.length, expectedRecords: database.records.length,
  unchangedRecords: unchanged.length, pathChanges, contentChanges,
  removedIds: registry.records.filter(row => !database.records.some(item => item.record.recordId === row.recordId)).map(row => row.recordId) };
await writeFile(new URL('./public-database-projection-audit.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ currentRecords: result.currentRecords, expectedRecords: result.expectedRecords, unchangedRecords: result.unchangedRecords,
  pathChangeCount: pathChanges.length, contentChangeCount: contentChanges.length, removedCount: result.removedIds.length,
  protectedFieldChangeCount: [...pathChanges, ...contentChanges].filter(row => row.changedProtectedFields.length).length,
  contentChangeFields: [...new Set(contentChanges.flatMap(row => row.changedTopLevelFields))],
  syncChangeFields: [...new Set(contentChanges.flatMap(row => row.changedSyncFields))], firstPathChanges: pathChanges.slice(0, 2) }, null, 2));
