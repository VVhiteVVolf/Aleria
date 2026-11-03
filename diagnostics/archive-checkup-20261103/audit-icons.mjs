import { mkdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadBuiltinCharacterArchiveEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-catalog.js';
import { extractCharacterArchiveEntries, mergeCharacterArchiveEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-model.js';
import { getCharacterArchiveEntryIconPresentation } from '../../AleriaAlmanach/modules/character-archive/character-archive-icons.js';
import { getArchiveTraitIconSource } from '../../AleriaAlmanach/modules/character-archive/character-archive-trait-icons.js';
import { getArchiveAbilityIconSource } from '../../AleriaAlmanach/modules/character-archive/character-archive-ability-icons.js';
import { loadPublicCharacterLibrarySources } from '../../AleriaAlmanach/tools/character-library/public-character-library-source.mjs';

const root = new URL('../../', import.meta.url);
globalThis.fetch = async () => ({ ok: true, json: async () => ({ byClass: {} }) });
const builtin = await loadBuiltinCharacterArchiveEntries();
const records = (await loadPublicCharacterLibrarySources()).map(source => ({ file: source.sourceRecord, ...source.character }));
const live = records.flatMap(record => extractCharacterArchiveEntries(record));
const entries = mergeCharacterArchiveEntries(builtin, live);
const missing = [], existing = [];
for (const entry of entries.filter(entry => ['trait', 'ability'].includes(entry.kind))) {
  const explicit = entry.iconOverride || entry.icon || entry.data?.icon || '';
  const presentation = getCharacterArchiveEntryIconPresentation(entry);
  const exactFallback = entry.kind === 'trait' ? getArchiveTraitIconSource(entry) : getArchiveAbilityIconSource(entry);
  let pathExists = true;
  if (presentation.source.startsWith('file:')) {
    try { await access(fileURLToPath(presentation.source)); } catch { pathExists = false; }
  }
  if (/^\/AleriaAlmanach\//.test(presentation.source)) {
    try { await access(new URL(presentation.source.slice(1), root)); } catch { pathExists = false; }
  }
  const owners = entry.sources.filter(source => source.kind === 'character').map(source => {
    const record = records.find(record => record.id === source.id);
    return { id: source.id, name: source.name,
      portrait: record?.portrait || record?.imageSets?.find(set => set.id === record.activeImageSetId)?.portrait || record?.imageSets?.[0]?.portrait || '' };
  });
  const item = { id: entry.id, key: entry.key, kind: entry.kind, name: entry.name,
    description: entry.description, explicit, resolved: presentation.source, exactFallback: exactFallback || '',
    owners, dataId: entry.data?.id || '' };
  ((!explicit && !exactFallback) || !pathExists ? missing : existing).push(item);
}
await mkdir(new URL('.', import.meta.url), { recursive: true });
await writeFile(new URL('icon-audit.json', import.meta.url), JSON.stringify({
  sourceFiles: records.map(record => record.file), counts: { entries: entries.length, missing: missing.length,
    missingTraits: missing.filter(entry => entry.kind === 'trait').length, missingAbilities: missing.filter(entry => entry.kind === 'ability').length }, missing, existing
}, null, 2));
console.log(JSON.stringify({ sourceFiles: records.map(record => record.file), missing: missing.map(entry => ({
  name: entry.name, kind: entry.kind, owners: entry.owners.map(owner => owner.name), dataId: entry.dataId, description: entry.description.slice(0, 170)
})) }, null, 2));
