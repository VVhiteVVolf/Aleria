import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { loadBuiltinCharacterArchiveSnapshot } from '../../AleriaAlmanach/modules/character-archive/character-archive-catalog.js';
import { loadPublicCharacterLibrarySources } from '../../AleriaAlmanach/tools/character-library/public-character-library-source.mjs';
import { extractCurrentCharacterArchiveEntries, reconcileCharacterArchiveClassTraining } from '../../AleriaAlmanach/modules/character-archive/character-archive-class-training.js';
import { mergeCharacterArchiveEntries, normalizeArchiveSearchText, projectItemRegisterArchiveEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-model.js';
import { classifyCharacterArchiveEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-classification.js';
import { coalesceRegisterArchiveEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-register-projection.js';
import { coalesceWeaponReferenceArchiveEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-weapon-reference-projection.js';
import { projectCharacterArchiveViewEntries, groupCharacterArchiveViewFamilies } from '../../AleriaAlmanach/modules/character-archive/character-archive-view-projection.js';
import { getCharacterArchiveEntrySignature } from '../../AleriaAlmanach/modules/character-archive/character-archive-entry-equivalence.js';
import { reconcileCharacterArchiveLibraryEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-library-revision.js';
import { STANDARD_ITEMS } from '../../AleriaAlmanach/modules/item-register/item-register-standard.js';
import { buildModuleOffers } from '../../AleriaAlmanach/modules/item-register/item-register-module-catalog.js';
import { buildOwnedItems } from '../../AleriaAlmanach/modules/item-register/item-register-model.js';
import { readEconomyModuleSources } from '../../AleriaAlmanach/modules/economy-calculator/economy-source-venues.mjs';
import { getBuiltinCreatureTemplates } from '../../AleriaAlmanach/modules/creatures/creature-catalog.js';

const root = new URL('../../', import.meta.url);
const previousFetch = globalThis.fetch;
globalThis.fetch = async url => ({ ok: true, json: async () => JSON.parse(await readFile(url, 'utf8')) });
const snapshot = await loadBuiltinCharacterArchiveSnapshot();
globalThis.fetch = previousFetch;
const publicSources = await loadPublicCharacterLibrarySources();
assert.equal(publicSources.length, 14);
const characters = publicSources.map(source => source.character);
const database = JSON.parse(await readFile(new URL('CharakterDatenbank/generated/characters.snapshot.json', root), 'utf8'));
const owners = new Map(database.characters.map(character => [character.id, character]));
characters.forEach(character => owners.set(character.id, character));
const offers = buildModuleOffers((await readEconomyModuleSources()).flatMap(section => section.entries), STANDARD_ITEMS);
const owned = buildOwnedItems([...owners.values()], [...STANDARD_ITEMS, ...offers], getBuiltinCreatureTemplates());
const register = projectItemRegisterArchiveEntries([...STANDARD_ITEMS, ...offers, ...owned]);
const live = characters.flatMap(character => extractCurrentCharacterArchiveEntries(character, 'character'));
const inputs = [...snapshot.entries, ...live, ...register];

function project(entries) {
  const classified = classifyCharacterArchiveEntries(reconcileCharacterArchiveClassTraining(entries));
  const semantic = mergeCharacterArchiveEntries(classified);
  const registers = coalesceRegisterArchiveEntries(semantic);
  const weapons = coalesceWeaponReferenceArchiveEntries(registers);
  const view = projectCharacterArchiveViewEntries(weapons);
  return { classified, semantic, registers, weapons, view, families: groupCharacterArchiveViewFamilies(view) };
}

const countKinds = entries => Object.fromEntries([...new Set(entries.map(entry => entry.kind))].sort()
  .map(kind => [kind, entries.filter(entry => entry.kind === kind).length]));
const signature = entry => getCharacterArchiveEntrySignature(entry);
const signatures = entries => entries.map(signature).sort();
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const summary = result => ({ classified: result.classified.length, semantic: result.semantic.length,
  registerProjection: result.registers.length, weaponProjection: result.weapons.length,
  viewEntries: result.view.length, visibleFamilies: result.families.length,
  multipleVariantFamilies: result.families.filter(family => family.length > 1).length,
  kindCounts: countKinds(result.view), semanticDigest: digest(signatures(result.view)) });

function originalRegisterRows(entries) {
  const rows = [], seen = new Set();
  function visit(entry) {
    if (!entry || seen.has(entry)) return;
    seen.add(entry);
    if (entry.kind?.startsWith('register-')) rows.push(entry);
    if (entry.registerEntry) visit(entry.registerEntry);
    for (const variant of entry.registerVariants || []) visit(variant);
  }
  entries.forEach(visit);
  return rows;
}

function sourceCoverage(result) {
  const actual = originalRegisterRows(result.view);
  const byId = new Map();
  for (const row of actual) {
    if (!byId.has(row.data.id)) byId.set(row.data.id, []);
    byId.get(row.data.id).push(row);
  }
  const inputIds = [...new Set(register.map(row => row.data.id))].sort();
  const missing = inputIds.filter(id => !byId.has(id));
  const ownedRows = register.filter(row => row.data.section === 'owned');
  const changedOwned = ownedRows.filter(row => !(byId.get(row.data.id) || [])
    .some(actualRow => isDeepStrictEqual(actualRow.data, row.data))).map(row => row.data.id);
  const lostOwnedSources = ownedRows.filter(row => !(byId.get(row.data.id) || []).some(actualRow =>
    row.sources.every(source => actualRow.sources.some(actualSource => isDeepStrictEqual(actualSource, source)))))
    .map(row => row.data.id);
  return { originalRegisterIds: inputIds.length, retainedRegisterIds: inputIds.length - missing.length,
    registerIdDigest: digest(inputIds), missing, originalOwnedRows: ownedRows.length,
    originalOwnerIds: new Set(ownedRows.map(row => row.data.ownerCharacterId)).size,
    changedOwned, lostOwnedSources };
}

function oldCopy(entry, index, generation) {
  const copy = structuredClone(entry);
  const uuid = `00000000-0000-4000-${generation === 'stamped' ? '8000' : '9000'}-${String(index).padStart(12, '0')}`;
  copy.id = uuid;
  copy.builtin = false;
  copy.archivedFromProfile = true;
  copy.createdAt = '2026-09-01T10:00:00Z';
  copy.updatedAt = '2026-10-15T10:00:00Z';
  copy.iconAssignmentVersion = 0;
  copy.iconOverride = '';
  if (['ability', 'technique', 'trait', 'attack', 'spell'].includes(copy.kind)) {
    copy.data.id = uuid;
    if (generation === 'unlinked') {
      delete copy.data.catalogAbilityId;
      delete copy.data.sourceAbilityId;
      delete copy.data.catalogTechniqueId;
      delete copy.data.developmentTraitId;
    }
  }
  return copy;
}

const fresh = project(inputs);
const oldCopies = inputs.flatMap((entry, index) => [oldCopy(entry, index, 'stamped'), oldCopy(entry, index, 'unlinked')]);
const reconciledCache = reconcileCharacterArchiveLibraryEntries(mergeCharacterArchiveEntries(oldCopies), snapshot);
const cached = project([...inputs, ...reconciledCache]);
const freshAgain = project(inputs), cachedAgain = project([...inputs, ...reconciledCache]);
const freshSignatures = new Set(signatures(fresh.view));
const addedByCache = cached.view.filter(entry => !freshSignatures.has(signature(entry)));
const brief = entry => ({ kind: entry.kind, name: entry.name, dataId: entry.data.id,
  variant: entry.archiveVariantLabel, owner: entry.data.ownerCharacterName || entry.data.sourceCharacter || '',
  form: entry.data.combatStyleFormId, level: entry.data.level || entry.data.minimumLevel,
  damage: entry.data.damageFormula || entry.data.rollFormula,
  costs: entry.data.costs?.map(cost => [cost.resourceId, cost.amount]) });
const sameNameFamilies = cached.families.filter(family => family.length > 1).map(family => ({
  kind: family[0].kind, name: family[0].name, members: family.length,
  distinctSignatures: new Set(family.map(signature)).size, entries: family.map(brief)
}));
const exactDuplicates = sameNameFamilies.filter(family => family.distinctSignatures < family.members);
const coverageFresh = sourceCoverage(fresh), coverageCached = sourceCoverage(cached);
const report = { type: 'public-character-archive-projection-audit', generatedAt: new Date().toISOString(),
  scope: { libraryCharacters: characters.length, publicRegisterOwnerCharacters: owners.size,
    builtinEntries: snapshot.entries.length, liveEntries: live.length,
    standards: STANDARD_ITEMS.length, offers: offers.length, owned: owned.length,
    registerEntries: register.length, simulatedOldCopies: oldCopies.length },
  fresh: summary(fresh), cached: summary(cached),
  cacheSemanticEqual: isDeepStrictEqual(signatures(fresh.view), signatures(cached.view)),
  cacheAddedVariants: addedByCache.map(brief),
  repeatedFreshReadEqual: isDeepStrictEqual(fresh.view, freshAgain.view),
  repeatedCachedReadEqual: isDeepStrictEqual(cached.view, cachedAgain.view),
  registerProjectionIdempotent: isDeepStrictEqual(coalesceRegisterArchiveEntries(fresh.registers), fresh.registers),
  weaponProjectionIdempotent: isDeepStrictEqual(coalesceWeaponReferenceArchiveEntries(fresh.weapons), fresh.weapons),
  coverageFresh, coverageCached, exactDuplicates, sameNameFamilies,
  expectedStorageBoundary: 'Presentation rows are never replayed as raw persistence input; repeated reads project the same unchanged source rows.' };
await writeFile(new URL('public-projection-audit.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ scope: report.scope, fresh: report.fresh, cached: report.cached,
  cacheSemanticEqual: report.cacheSemanticEqual, cacheAddedVariants: report.cacheAddedVariants,
  repeatedFreshReadEqual: report.repeatedFreshReadEqual, repeatedCachedReadEqual: report.repeatedCachedReadEqual,
  registerProjectionIdempotent: report.registerProjectionIdempotent,
  weaponProjectionIdempotent: report.weaponProjectionIdempotent,
  coverageFresh, coverageCached, exactDuplicateFamilies: exactDuplicates.length,
  sameNameVariantFamilies: sameNameFamilies.length,
  report: 'diagnostics/archive-dedupe-20261103/public-projection-audit.json' }, null, 2));
if (!report.cacheSemanticEqual || !report.repeatedFreshReadEqual || !report.repeatedCachedReadEqual
  || !report.registerProjectionIdempotent || !report.weaponProjectionIdempotent || exactDuplicates.length
  || [coverageFresh, coverageCached].some(coverage => coverage.missing.length || coverage.changedOwned.length || coverage.lostOwnedSources.length)) process.exitCode = 1;
