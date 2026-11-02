import { readFile, readdir, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { markCharacterDatabaseOverlay } from './character-database-model.mjs';

function assertArchivePath(root, path) {
  const fromRoot = relative(root, path);
  if (!fromRoot || isAbsolute(fromRoot) || fromRoot === '..' || fromRoot.startsWith(`..${sep}`) || !path.toLowerCase().endsWith('.json')) {
    throw Error(`Ungültige öffentliche Charakterquelle: ${path}`);
  }
}

// Discover only top-level exports. Nested files are read only when an existing
// public database projection already names them, never by recursive discovery.
export async function readCharacterExportOverlays({ workspaceRoot, archiveRoot, sourcePath, registeredSources = [] }) {
  const root = resolve(archiveRoot), canonicalRoot = await realpath(root);
  const candidates = new Map();
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) candidates.set(resolve(root, entry.name), false);
  }
  for (const source of registeredSources) {
    if (typeof source !== 'string' || !source || isAbsolute(source)) throw Error('Registrierte Charakterquellen benötigen einen öffentlichen relativen Archivpfad.');
    const path = resolve(workspaceRoot, source);
    assertArchivePath(root, path);
    candidates.set(path, true);
  }
  const overlays = [];
  for (const [path, registered] of candidates) {
    if (path === resolve(sourcePath)) continue;
    try {
      // Also reject a registered symlink/junction escaping the public archive.
      assertArchivePath(canonicalRoot, await realpath(path));
      const exported = JSON.parse(await readFile(path, 'utf8'));
      if (exported?.type !== 'aleria-character' || !exported.character || typeof exported.character !== 'object' || Array.isArray(exported.character)) {
        if (registered) throw Error('Kein gültiger aleria-character-Export.');
        continue;
      }
      overlays.push({ path, assignedTab: exported.assignedTab,
        exportedAt: String(exported.exportedAt || exported.character.updatedAt || ''),
        character: markCharacterDatabaseOverlay(exported.character, {
          replaceExportedFields: exported.mergeStrategy === 'replace-exported-fields',
          mergeCombatTechniques: exported.mergeStrategy === 'merge-combat-techniques',
          replaceCombatTraits: exported.mergeStrategy === 'replace-combat-traits',
          removeTraitAbilityIds: exported.traitReview?.removeAbilityIds || [],
          removeTraitConditionIds: exported.traitReview?.removeConditionIds || []
        }) });
    } catch (error) {
      if (registered) throw Error(`Registrierte öffentliche Charakterquelle kann nicht gelesen werden: ${path}: ${error.message}`, { cause: error });
      // Unrelated top-level JSON documents have never been character sources.
    }
  }
  return overlays.sort((first, second) => first.path.localeCompare(second.path, 'de'));
}
