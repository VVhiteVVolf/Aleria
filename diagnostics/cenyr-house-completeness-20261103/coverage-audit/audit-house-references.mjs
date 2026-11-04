import fs from 'node:fs';
import vm from 'node:vm';
import { resolveCanonicalFamilyId } from '../../../Stammbäume/assets/js/modules/family-registry/family-id-aliases.js';
import { FAMILY_REGISTRY_FOLDERS } from '../../../Stammbäume/assets/js/data/family-registry-folders.js';
import { createFolderPathFromHouseProfile } from '../../../Stammbäume/assets/js/domain/house-profile.js';
import { project, merged, projectById, publicById, hidden, deniedIds, deniedNames, key, nameKey, records } from './audit-cenyr-coverage.mjs';

const root = new URL('../../../', import.meta.url), feature = new URL('Familien Häuser und Clans/', root);
const output = new URL('./', import.meta.url), scopeIds = new Set(records.map(record => record.stableId));
const write = (name, value) => {
  const temporary = new URL(`${name}.tmp`, output), target = new URL(name, output);
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n'); fs.renameSync(temporary, target);
};
const canonicalCandidates = raw => {
  const normalized = key(raw);
  return [...new Set([normalized, normalized.replace(/^house-/, 'haus-'), normalized.replace(/^(?:clan|sept)-/, 'haus-')].map(resolveCanonicalFamilyId))];
};
const publicByName = new Map();
const explicitLinkedTargets = new Map();
for (const record of project) for (const branch of record.family?.cadetBranches || []) {
  const target = resolveCanonicalFamilyId(branch.targetFamilyId);
  if (!branch.houseId || !publicById.has(target)) continue;
  const internalId = key(branch.houseId);
  if (!explicitLinkedTargets.has(internalId)) explicitLinkedTargets.set(internalId, new Set());
  explicitLinkedTargets.get(internalId).add(target);
}
for (const record of merged) for (const value of [record.id, record.title]) {
  const normalized = nameKey(value);
  if (!publicByName.has(normalized)) publicByName.set(normalized, new Set());
  publicByName.get(normalized).add(resolveCanonicalFamilyId(record.id));
}
const unregistered = new Map(), externalReferences = new Map(), locationConflicts = new Map();
const reviewedExternalTerritoryReferences = [];
let inspectedGraphHouses = 0, ignoredUnidentifiedReferences = 0, excludedProtectedReferences = 0;
const recordReference = ({ rawId = '', title = '', emblem = '', sourceType, source, folderPath = null, isFamilyCard = false }) => {
  const candidates = canonicalCandidates(rawId);
  if (candidates.some(id => deniedIds.has(id)) || deniedNames.has(nameKey(title))) { excludedProtectedReferences++; return; }
  if (/unbekannt|unknown|unbenannt|nicht bekannt|\?/.test(`${rawId} ${title}`.toLowerCase()) || !String(title || rawId).trim()) {
    ignoredUnidentifiedReferences++; return;
  }
  let resolved = candidates.find(id => publicById.has(id));
  const linkedTargets = [...(explicitLinkedTargets.get(key(rawId)) || [])];
  if (!resolved && linkedTargets.length === 1) resolved = linkedTargets[0];
  const nameMatches = [...(publicByName.get(nameKey(title)) || [])];
  if (!resolved && nameMatches.length === 1) resolved = nameMatches[0];
  const evidence = { sourceType, source, ...(folderPath ? { folderPath } : {}), ...(isFamilyCard ? { isFamilyCard: true } : {}) };
  if (resolved) {
    if (!scopeIds.has(resolved)) {
      const entry = externalReferences.get(resolved) || { id: resolved, title: publicById.get(resolved).title, folderPath: publicById.get(resolved).folderPath, sources: [] };
      entry.sources.push(evidence); externalReferences.set(resolved, entry);
      if (folderPath?.[0] === 'Cenyr' && isFamilyCard) locationConflicts.set(`${resolved}|${source}`, { id: resolved, canonicalFolderPath: publicById.get(resolved).folderPath, reference: evidence });
    }
    return;
  }
  // This is an explicitly reviewed geographical exception, not a guess from
  // service allegiance: the current island text places Oilean in Leitheach's
  // southern half. A future canonical record would have resolved above first.
  if (nameKey(title) === 'salach' && source.includes('/Insel Camruisge/')) {
    reviewedExternalTerritoryReferences.push({ title, seat: 'Oilean', kingdom: 'Leitheach', region: 'Tír na Sleagh',
      evidence, geographySource: 'Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Insel Camruisge/insel.data.js:173',
      decision: 'Do not invent a Cenyr record from the joint-island overview.' });
    return;
  }
  const candidateId = candidates.find(id => id.startsWith('haus-')) || candidates[0] || `name:${nameKey(title)}`;
  const dedupKey = rawId ? candidateId : nameKey(title);
  const entry = unregistered.get(dedupKey) || {
    candidateId, title: title || rawId, rawIds: [], emblem: /fleischsammler|\/private\//i.test(emblem) ? '' : emblem,
    classification: folderPath && isFamilyCard ? 'hierarchy-backed-family-reference' : 'unplaced-internal-house-reference',
    ...(nameMatches.length > 1 ? { ambiguousExistingIds: nameMatches } : {}), sources: [],
  };
  if (rawId && !entry.rawIds.includes(rawId)) entry.rawIds.push(rawId);
  if (folderPath && isFamilyCard) entry.classification = 'hierarchy-backed-family-reference';
  entry.sources.push(evidence); unregistered.set(dedupKey, entry);
};

// Only public Cenyr family records are inspected, and only house-level fields
// leave memory. No persons, marriages, parentages or secret identities are copied.
for (const record of records) {
  const family = projectById.get(record.stableId)?.family;
  for (const house of family?.houses || []) {
    inspectedGraphHouses++;
    recordReference({ rawId: house.id, title: house.name, emblem: house.emblem, sourceType: 'current-family-internal-house', source: record.stableId });
  }
  for (const branch of family?.cadetBranches || []) recordReference({ rawId: branch.targetFamilyId || branch.houseId,
    title: branch.name, emblem: branch.emblem, sourceType: 'current-family-linked-house', source: record.stableId });
}

const pageContext = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), pageContext);
for (const page of pageContext.window.HAEUSER_REGISTRY) {
  const path = (page.hierarchy || []).map(entry => entry.name), start = path.indexOf('Cenyr');
  if (start < 0) continue;
  recordReference({ rawId: page.id, title: page.name, sourceType: 'house-page-registry', source: page.data,
    folderPath: path.slice(start, -1), isFamilyCard: true });
}

const territoryContext = { window: {} };
for (const file of ['kontinente.registry.js', 'assets/js/herrschaft-data.js']) vm.runInNewContext(fs.readFileSync(new URL(`Kontinente/${file}`, root), 'utf8'), territoryContext);
const territoryEntries = territoryContext.window.KONTINENTE_REGISTRY.filter(entry => /Königreich Cenyr\//.test(decodeURIComponent(entry.page)));
const territoryErrors = [], oldTerritoryData = globalThis.ALERIA_HERRSCHAFT_DATA;
let territoryCards = 0;
try {
  globalThis.ALERIA_HERRSCHAFT_DATA = territoryContext.window.ALERIA_HERRSCHAFT_DATA;
  for (const entry of territoryEntries) {
    let data;
    try {
      const source = new URL(`Kontinente/${entry.data}`, root);
      if (source.pathname.endsWith('.mjs')) data = (await import(source.href)).default;
      else {
        const context = { window: { ...territoryContext.window } };
        vm.runInNewContext(fs.readFileSync(source, 'utf8'), context, { timeout: 1000 });
        data = context.window.KONTINENTE_DATA;
      }
      for (const section of data?.view?.familySections || []) for (const house of section.cards || []) {
        territoryCards++;
        recordReference({ rawId: house.id || house.familyId, title: house.name, emblem: house.imageSrc,
          sourceType: 'current-territory-family-card', source: `Kontinente/${entry.data}`,
          folderPath: ['Cenyr', data.meta?.id || entry.id], isFamilyCard: true });
      }
    } catch { territoryErrors.push({ source: `Kontinente/${entry.data}`, reason: 'shared-runtime-or-module-shape-needs-review' }); }
  }
} finally {
  if (oldTerritoryData === undefined) delete globalThis.ALERIA_HERRSCHAFT_DATA;
  else globalThis.ALERIA_HERRSCHAFT_DATA = oldTerritoryData;
}

const indexedPublishedIds = new Set(merged.map(record => resolveCanonicalFamilyId(record.publishedFamilyId || record.id)));
const snapshotOrphans = [], snapshotDirectory = new URL('Stammbäume/assets/data/published-families/', root);
for (const file of fs.readdirSync(snapshotDirectory)) {
  if (!file.endsWith('.json') || file === 'registry.json') continue;
  const candidate = resolveCanonicalFamilyId(file.slice(0, -5));
  if (deniedIds.has(candidate) || indexedPublishedIds.has(candidate)) continue;
  const snapshot = JSON.parse(fs.readFileSync(new URL(file, snapshotDirectory), 'utf8'));
  const document = snapshot.family?.document;
  if (!document || hidden({ id: document.id, title: document.title, family: snapshot.family })) continue;
  const folderPath = createFolderPathFromHouseProfile(document.houseProfile);
  if (folderPath[0] !== 'Cenyr') continue;
  const metadata = { id: resolveCanonicalFamilyId(document.id), title: document.title, folderPath,
    source: `Stammbäume/assets/data/published-families/${file}` };
  snapshotOrphans.push(metadata);
  recordReference({ rawId: document.id, title: document.title, emblem: document.emblem,
    sourceType: 'unindexed-published-snapshot', source: metadata.source, folderPath, isFamilyCard: true });
}
for (const folder of FAMILY_REGISTRY_FOLDERS.filter(folder => folder.path?.[0] === 'Cenyr')) {
  for (const house of folder.plannedHouses || []) recordReference({ rawId: house.id || '', title: house.name || String(house),
    sourceType: 'planned-hierarchy-reference', source: JSON.stringify(folder.path), folderPath: folder.path, isFamilyCard: false });
}
const unresolved = [...unregistered.values()].sort((a, b) => a.title.localeCompare(b.title, 'de'));
const summary = { reviewedAt: new Date().toISOString(), publicCenyrFamilies: records.length,
  inspectedGraphHouseRecords: inspectedGraphHouses, inspectedTerritoryDataModules: territoryEntries.length,
  parsedTerritoryFamilyCards: territoryCards, unresolvedNamedReferences: unresolved.length,
  hierarchyBackedUnregistered: unresolved.filter(entry => entry.classification === 'hierarchy-backed-family-reference').length,
  registeredExternalHouses: externalReferences.size, registeredLocationConflicts: locationConflicts.size,
  reviewedExternalTerritoryReferences: reviewedExternalTerritoryReferences.length,
  ignoredUnidentifiedReferences, excludedProtectedReferences, unindexedCenyrSnapshots: snapshotOrphans.length,
  territoryEvaluationErrors: territoryErrors.length };
write('internal-house-references.json', { summary, unresolved, registeredExternalReferences: [...externalReferences.values()],
  registeredLocationConflicts: [...locationConflicts.values()], reviewedExternalTerritoryReferences,
  unindexedCenyrSnapshots: snapshotOrphans, territoryEvaluationErrors: territoryErrors });
console.log(JSON.stringify(summary));
