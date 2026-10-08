import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { normalizeFamily } from '../assets/js/domain/family-schema.js';
import { DAMH_SOURCE_COUNTER_PATCHES } from '../assets/js/data/damh-source-counter-patches.js';

import { fingerprintBeforeBrann } from './brann-invariants.js';

const own = new Set(['haus-eoghainn','haus-agnew','haus-dianaomh','haus-dobhar','haus-forsyth','haus-elid','haus-oglivy']);
export const damhFamilyFingerprint = family => createHash('sha256').update(JSON.stringify(normalizeFamily(family))).digest('hex');
export const isDamhAffected = id => own.has(id) || Boolean(DAMH_SOURCE_COUNTER_PATCHES[id]);
export function fingerprintBeforeDamh(family) {
  if (!isDamhAffected(family.document.id)) return fingerprintBeforeBrann(family);
  const snapshot = JSON.parse(fs.readFileSync(new URL('../scripts/damh-source-import/baseline-fingerprints.json',import.meta.url),'utf8'));
  return snapshot.families[family.document.id];
}

export function damhCounterpartFingerprint(family, patch) {
  const copy = structuredClone(normalizeFamily(family));
  const clean = entity => {
    for (const key of Object.keys(entity.extensions || {})) {
      if (key.startsWith('registryManaged') || key === 'sourceRevision' || key === 'damhSourceCounterInventory') delete entity.extensions[key];
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
