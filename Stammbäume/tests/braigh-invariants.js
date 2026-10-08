import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { normalizeFamily } from '../assets/js/domain/family-schema.js';
import { BRAIGH_SOURCE_COUNTER_PATCHES } from '../assets/js/data/braigh-source-counter-patches.js';
import { fingerprintBeforeFaerna } from './faerna-invariants.js';

const own = new Set(['haus-culloch','haus-borthwick','haus-erskine','haus-grannd']);
export const braighFamilyFingerprint = family => createHash('sha256').update(JSON.stringify(normalizeFamily(family))).digest('hex');
export const isBraighAffected = id => own.has(id) || Boolean(BRAIGH_SOURCE_COUNTER_PATCHES[id]);
export function fingerprintBeforeBraigh(family) {
  if (!isBraighAffected(family.document.id)) return fingerprintBeforeFaerna(family);
  const snapshot = JSON.parse(fs.readFileSync(new URL('../scripts/braigh-source-import/baseline-fingerprints.json',import.meta.url),'utf8'));
  return snapshot.families[family.document.id];
}

export function braighCounterpartFingerprint(family, patch) {
  const copy = structuredClone(normalizeFamily(family));
  const clean = entity => {
    for (const key of Object.keys(entity.extensions || {})) {
      if (key.startsWith('registryManaged') || key === 'sourceRevision' || key === 'braighSourceCounterInventory') delete entity.extensions[key];
    }
    if (entity.extensions && !Object.keys(entity.extensions).length) delete entity.extensions;
  };
  clean(copy);
  for (const collection of ['persons','partnerships','parentages','houses','cadetBranches','timeJumps']) {
    for (const entity of copy[collection]) {
      clean(entity);
      for (const field of Object.keys(patch.collections[collection]?.[entity.id] || {})) delete entity[field];
    }
  }
  const addedHouses = new Set((patch.additionalHouses || []).map(h=>h.id));
  const addedBranches = new Set((patch.wardLinks || []).map(w=>'ward-away-'+w.personId));
  copy.houses = copy.houses.filter(h=>!addedHouses.has(h.id));
  copy.cadetBranches = copy.cadetBranches.filter(b=>!addedBranches.has(b.id));
  return createHash('sha256').update(JSON.stringify(copy)).digest('hex');
}
