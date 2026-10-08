import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { normalizeFamily } from '../assets/js/domain/family-schema.js';
import { BRANN_SOURCE_COUNTER_PATCHES } from '../assets/js/data/brann-source-counter-patches.js';

const own = new Set(['haus-wemyss','haus-dubglais','haus-airdmhor','haus-cerneige']);
export const brannFamilyFingerprint = family => createHash('sha256').update(JSON.stringify(normalizeFamily(family))).digest('hex');
export const isBrannAffected = id => own.has(id) || Boolean(BRANN_SOURCE_COUNTER_PATCHES[id]);
export function fingerprintBeforeBrann(family) {
  if (!isBrannAffected(family.document.id)) return brannFamilyFingerprint(family);
  const snapshot = JSON.parse(fs.readFileSync(new URL('../scripts/brann-source-import/baseline-fingerprints.json',import.meta.url),'utf8'));
  return snapshot.families[family.document.id];
}

export function brannCounterpartFingerprint(family, patch) {
  const copy = structuredClone(normalizeFamily(family));
  const clean = entity => {
    for (const key of Object.keys(entity.extensions || {})) {
      if (key.startsWith('registryManaged') || key === 'sourceRevision' || key === 'brannSourceCounterInventory') delete entity.extensions[key];
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
  copy.houses = copy.houses.filter(h=>!addedHouses.has(h.id));
  return createHash('sha256').update(JSON.stringify(copy)).digest('hex');
}
