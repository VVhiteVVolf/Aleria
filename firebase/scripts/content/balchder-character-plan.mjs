import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { createFamilyCandidates } from '../../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { findBestCharacterMatch } from '../../../AleriaAlmanach/modules/character-genealogy/person-identity.js';
import { planFamilyCharacterGroup } from '../../../AleriaAlmanach/modules/character-genealogy/character-group-import-plan.mjs';
import { sanitizeCharacterBiographyForFirestore, stampFreshRevisions } from '../../../AleriaAlmanach/modules/characters/character-save-guard.js';

export const BALCHDER_PROFILE_IDS = Object.freeze(['kamber-balchder', 'blodwen-balchder', 'rice-balchder']);
export const BALCHDER_PROFILE_FIELDS = Object.freeze(['biography', 'title', 'role', 'bio', 'genealogy', 'updatedAt']);
const withoutRevision = ({ revision, ...value }) => value;

// The family importer owns identities and group membership; this publication
// adds only the three reviewed biographies and their assigned office metadata.
export function planBalchderCharacters({ records, exports, existingCharacters = [], config = {}, now = new Date().toISOString() }) {
  const candidates = records.flatMap(createFamilyCandidates);
  const bindings = new Map();
  const members = BALCHDER_PROFILE_IDS.map(slug => {
    const primaryCandidate = candidates.find(c => c.familyId === 'haus-balchder' && c.personId === slug);
    assert(primaryCandidate, `Stammbaumeintrag fehlt: ${slug}`);
    const matches = existingCharacters.map(p => findBestCharacterMatch(primaryCandidate, [p])).filter(Boolean);
    assert(!matches.some(m => m.kind === 'conflict'), `Identitätskonflikt: ${slug}`);
    assert(matches.length <= 1, `Doppelte Online-Akte: ${slug}`);
    if (matches[0]) bindings.set(slug, matches[0].character);
    return { key: slug, subgroup: 'Gwynthor - Haus Balchder', primaryCandidate,
      candidates: candidates.filter(c => c.worldPersonId === primaryCandidate.worldPersonId), profile: {} };
  });
  const matched = members.flatMap(member => {
    const prior = bindings.get(member.key);
    return prior ? [{ ...prior, identity: { ...prior.identity, worldPersonId: member.primaryCandidate.worldPersonId } }] : [];
  });
  const plan = planFamilyCharacterGroup({ members, existingCharacters: matched, config, group: 'Gwynthor', now });
  const owner = bindings.get('kamber-balchder');
  for (const entry of plan.entries) {
    const source = exports.find(e => e.character.id === members.find(m => m.key === entry.key).primaryCandidate.worldPersonId)?.character;
    assert(source?.biography, `Geprüfte Biografie fehlt: ${entry.key}`);
    const prior = bindings.get(entry.key);
    const biography = structuredClone(source.biography);
    biography.biography.portrait = prior?.portrait || source.portrait;
    const sameBiography = prior?.biography && isDeepStrictEqual(withoutRevision(prior.biography), withoutRevision(biography));
    assert(!prior?.biography?.biography?.biographyText?.trim() || sameBiography,
      `Biografie wurde inzwischen online ausgearbeitet: ${entry.key}`);
    const desired = {
      ...(!sameBiography ? stampFreshRevisions({ biography }, ['biography'], Math.max(Date.parse(now), Number(prior?.biography?.revision || 0) + 1)) : {}),
      ...Object.fromEntries(['title', 'role', 'bio'].filter(key => !isDeepStrictEqual(prior?.[key], source[key])).map(key => [key, source[key]]))
    };
    if (entry.create) {
      entry.data = sanitizeCharacterBiographyForFirestore({ ...entry.data, ...desired,
        ...(owner?.ownerUid ? { ownerUid: owner.ownerUid } : {}), ...(owner?.createdBy ? { createdBy: owner.createdBy } : {}) });
      delete entry.data.inventory;
    } else {
      const patch = { ...entry.patch, ...desired };
      entry.patch = Object.keys(patch).length ? sanitizeCharacterBiographyForFirestore({ ...patch, updatedAt: now }) : null;
      assert(Object.keys(entry.patch || {}).every(key => BALCHDER_PROFILE_FIELDS.includes(key)));
    }
  }
  return plan;
}
