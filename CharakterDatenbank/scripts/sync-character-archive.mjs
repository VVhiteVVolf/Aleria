import { access, mkdir, readFile, readdir, rmdir, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCharacterDatabase,
  CHARACTER_DATABASE_SCHEMA_VERSION,
  markCharacterDatabaseOverlay
} from '../lib/character-database-model.mjs';
import {
  buildFamilyPersonViewUrl,
  createFamilyCandidates
} from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const databaseRoot = resolve(scriptDirectory, '..');
const workspaceRoot = resolve(databaseRoot, '..');
const archiveRoot = resolve(workspaceRoot, 'Charakter Archiv Exporte');
const checkOnly = process.argv.includes('--check');

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : '';
}

function portablePath(value) {
  return value.split(sep).join('/');
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function latestArchivePath() {
  const explicit = argumentValue('--source');
  if (explicit) return resolve(workspaceRoot, explicit);
  const entries = await readdir(archiveRoot, { withFileTypes: true });
  const candidates = await Promise.all(entries
    .filter(entry => entry.isFile() && /^aleria-charakterarchiv-.*\.json$/i.test(entry.name))
    .map(async entry => {
      const path = resolve(archiveRoot, entry.name);
      return { path, modifiedAt: (await stat(path)).mtimeMs };
    }));
  candidates.sort((first, second) => second.modifiedAt - first.modifiedAt);
  if (!candidates[0]) throw new Error(`Kein Charakterarchiv in ${archiveRoot} gefunden.`);
  return candidates[0].path;
}

async function readCharacterExportOverlays(sourcePath) {
  const entries = await readdir(archiveRoot, { withFileTypes: true });
  const overlays = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.toLocaleLowerCase('de').endsWith('.json')) continue;
    const path = resolve(archiveRoot, entry.name);
    if (path === sourcePath) continue;
    try {
      const exported = JSON.parse(await readFile(path, 'utf8'));
      if (exported?.type !== 'aleria-character' || !exported.character || typeof exported.character !== 'object') continue;
      overlays.push({
        path,
        exportedAt: String(exported.exportedAt || exported.character.updatedAt || ''),
        character: markCharacterDatabaseOverlay(exported.character)
      });
    } catch {
      // Other JSON documents in the export directory are not character overlays.
    }
  }
  return overlays.sort((first, second) => first.path.localeCompare(second.path, 'de'));
}

function latestExportTimestamp(values = []) {
  return values
    .map(value => String(value || ''))
    .filter(value => Number.isFinite(Date.parse(value)))
    .sort((first, second) => Date.parse(second) - Date.parse(first))[0] || '';
}

function buildFamilyCandidates() {
  return FAMILY_REGISTRY.flatMap(record => createFamilyCandidates(record).map(candidate => ({
    ...candidate,
    url: buildFamilyPersonViewUrl(candidate)
  })));
}

function registryEntry(item) {
  const record = item.record;
  return {
    recordId: record.recordId,
    name: record.identity.name,
    aliases: record.identity.aliases,
    worldPersonId: record.identity.worldPersonId,
    firestoreDocumentId: record.links.firestore.documentId,
    firestoreDocumentIds: record.links.firestore.documentIds,
    primary: record.classification.primary,
    familyStatus: record.classification.familyStatus,
    path: item.path,
    contentHash: record.sync.contentHash
  };
}

async function writeGeneratedFile(path, content) {
  if (checkOnly) {
    try {
      const current = await readFile(path, 'utf8');
      if (current !== content) throw new Error(`Nicht aktuell: ${portablePath(relative(workspaceRoot, path))}`);
      return;
    } catch (error) {
      if (error?.code === 'ENOENT') throw new Error(`Fehlt: ${portablePath(relative(workspaceRoot, path))}`);
      throw error;
    }
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, 'utf8');
}

async function readPreviousRecords() {
  try {
    const registry = JSON.parse(await readFile(resolve(databaseRoot, 'registry.json'), 'utf8'));
    const records = await Promise.all((registry.records || []).map(async entry => {
      try {
        const record = JSON.parse(await readFile(resolve(databaseRoot, entry.path), 'utf8'));
        return [record.recordId, record];
      } catch {
        return null;
      }
    }));
    return new Map(records.filter(Boolean));
  } catch {
    return new Map();
  }
}

async function listCharacterRecordFiles(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(entry => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return listCharacterRecordFiles(path);
      return entry.isFile() && entry.name === 'character.json' ? [path] : [];
    }));
    return nested.flat();
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

function assertInsideRecords(path, recordsRoot) {
  const pathFromRoot = relative(recordsRoot, path);
  if (!pathFromRoot || isAbsolute(pathFromRoot) || pathFromRoot.startsWith(`..${sep}`) || pathFromRoot === '..') {
    throw new Error(`Unsicherer Datensatzpfad: ${path}`);
  }
}

async function removeEmptyParents(startDirectory, recordsRoot) {
  let current = startDirectory;
  while (current !== recordsRoot) {
    assertInsideRecords(current, recordsRoot);
    try {
      await rmdir(current);
    } catch (error) {
      if (error?.code === 'ENOTEMPTY' || error?.code === 'EEXIST') return;
      if (error?.code !== 'ENOENT') throw error;
    }
    current = dirname(current);
  }
}

async function pruneStaleGeneratedRecords(expectedRelativePaths) {
  const recordsRoot = resolve(databaseRoot, 'records');
  const expected = new Set(expectedRelativePaths.map(path => resolve(databaseRoot, path)));
  const existing = await listCharacterRecordFiles(recordsRoot);
  const stale = [];
  for (const path of existing) {
    if (expected.has(path)) continue;
    assertInsideRecords(path, recordsRoot);
    try {
      const record = JSON.parse(await readFile(path, 'utf8'));
      if (record?.schema !== 'aleria.character-record') continue;
    } catch {
      continue;
    }
    stale.push(path);
  }
  if (checkOnly && stale.length) {
    throw new Error(`${stale.length} veraltete Figurenakten vorhanden: ${portablePath(relative(workspaceRoot, stale[0]))}`);
  }
  for (const path of stale) {
    await unlink(path);
    await removeEmptyParents(dirname(path), recordsRoot);
  }
  return stale.length;
}

async function main() {
  const sourcePath = await latestArchivePath();
  await access(sourcePath);
  const baseArchive = JSON.parse(await readFile(sourcePath, 'utf8'));
  if (baseArchive?.type !== 'aleria-character-archive' || !Array.isArray(baseArchive.characters)) {
    throw new Error('Die Quelldatei ist kein gültiges Aleria-Charakterarchiv.');
  }

  const overlays = await readCharacterExportOverlays(sourcePath);
  const archive = {
    ...baseArchive,
    exportedAt: latestExportTimestamp([baseArchive.exportedAt, ...overlays.map(item => item.exportedAt)]) || baseArchive.exportedAt,
    characters: [...baseArchive.characters, ...overlays.map(item => item.character)]
  };
  const sourceArchive = portablePath(relative(workspaceRoot, sourcePath));
  const sourceOverlays = overlays.map(item => portablePath(relative(workspaceRoot, item.path)));
  const previousRecords = await readPreviousRecords();
  const database = buildCharacterDatabase(archive, buildFamilyCandidates(), { sourcePath: sourceArchive });
  database.records.forEach(item => {
    const previousLocal = previousRecords.get(item.record.recordId)?.local;
    if (previousLocal && typeof previousLocal === 'object') item.record.local = previousLocal;
  });
  const registry = {
    schema: 'aleria.character-registry',
    schemaVersion: CHARACTER_DATABASE_SCHEMA_VERSION,
    sourceArchive,
    sourceOverlays,
    sourceExportedAt: archive.exportedAt || '',
    count: database.records.length,
    records: database.records.map(registryEntry)
  };
  const snapshot = {
    schema: 'aleria.character-snapshot',
    schemaVersion: CHARACTER_DATABASE_SCHEMA_VERSION,
    sourceArchive,
    sourceOverlays,
    sourceExportedAt: archive.exportedAt || '',
    characters: database.records.map(item => item.snapshotCharacter),
    charTabs: archive.charTabs || null
  };

  await Promise.all(database.records.map(item => writeGeneratedFile(
    resolve(databaseRoot, item.path),
    json(item.record)
  )));
  await Promise.all([
    writeGeneratedFile(resolve(databaseRoot, 'registry.json'), json(registry)),
    writeGeneratedFile(resolve(databaseRoot, 'generated', 'characters.snapshot.json'), json(snapshot)),
    writeGeneratedFile(resolve(databaseRoot, 'generated', 'sync-report.json'), json(database.report))
  ]);
  const pruned = await pruneStaleGeneratedRecords(database.records.map(item => item.path));

  const mode = checkOnly ? 'CHECK' : 'SYNC';
  console.log(`${mode}: ${database.records.length} Figuren aus ${sourceArchive}`);
  if (sourceOverlays.length) console.log(`Figuren-Overlays: ${sourceOverlays.join(', ')}`);
  if (pruned) console.log(`Bereinigt: ${pruned} veraltete, vom Generator verwaltete Figurenakten.`);
  console.log(JSON.stringify(database.report.summary, null, 2));
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
