// Read-only evidence collection. Product sources are never changed.
import { writeFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { ALERIA_CURRENT_YEAR } from '../../Stammbäume/assets/js/config/chronology.js';

const root = new URL('./', import.meta.url);
const allowed = value => !['private', 'hidden', 'restricted', 'secret'].includes(String(value || '').toLowerCase());
const publicEntity = entity => allowed(entity.visibility) && allowed(entity.extensions?.visibility)
  && !entity.hidden && !entity.private && !entity.extensions?.hidden && !entity.extensions?.private;
const realms = ['Cenyr', 'Aldrimar', 'Leitheach'];
const memberships = record => realms.filter(realm => record.folderPath?.[0] === realm
  || record.family?.document?.houseProfile?.kingdom === realm
  || (record.additionalPlacements || []).some(placement => placement.folderPath?.[0] === realm
    || placement.houseProfile?.kingdom === realm));
const records = FAMILY_REGISTRY.filter(record => record.status === 'active' && record.listing === 'listed'
  && publicEntity(record) && memberships(record).length);
const scope = records.map(record => ({ id: record.id, title: record.title, realms: memberships(record),
  folderPath: record.folderPath, profile: record.family.document.houseProfile,
  additionalPlacements: record.additionalPlacements || [] }));
const dump = (file, value) => writeFile(new URL(file, root), JSON.stringify(value, null, 2) + '\n', 'utf8');
await dump('public-scope.json', { schema: 'aleria.public-house-lore-scope', currentYear: ALERIA_CURRENT_YEAR,
  readOnly: true, includesPrivateDossiers: false, records: scope });
for (const realm of realms) await dump(`${realm.toLowerCase()}-public-ids.json`,
  scope.filter(record => record.realms.includes(realm)).map(record => record.id));

const exactYear = value => /^\d{1,4}$/.test(String(value || '').trim()) ? Number(value) : null;
const known = value => value && !['unknown', 'unspecified', '????', '?'].includes(String(value).toLowerCase());
const shared = new Map();
const localCandidates = [];
const count = { records: records.length, persons: 0, excludedPeopleOnlyInNonPublicConnections: 0, publicParentages: 0, publicPartnerships: 0,
  excludedNonPublicParentages: 0, excludedNonPublicPartnerships: 0 };
const compact = (record, person) => ({ familyId: record.id, familyTitle: record.title, realms: memberships(record),
  personId: person.id, worldPersonId: person.worldPersonId, name: person.name, birth: person.birth,
  death: person.death, status: person.status, sex: person.sex, title: person.title });

for (const record of records) {
  const publicConnections = new Set();
  const nonPublicConnections = new Set();
  for (const connection of [...(record.family.parentages || []), ...(record.family.partnerships || [])]) {
    const references = [connection.childId, ...(connection.parentIds || []), ...(connection.participantIds || [])].filter(Boolean);
    const target = publicEntity(connection) ? publicConnections : nonPublicConnections;
    for (const id of references) target.add(id);
  }
  const people = (record.family.persons || []).filter(person => {
    if (!publicEntity(person)) return false;
    if (nonPublicConnections.has(person.id) && !publicConnections.has(person.id)) {
      count.excludedPeopleOnlyInNonPublicConnections++;
      return false;
    }
    return true;
  });
  const byId = new Map(people.map(person => [person.id, person]));
  count.persons += people.length;
  for (const person of people) {
    const brief = compact(record, person);
    if (person.worldPersonId) {
      if (!shared.has(person.worldPersonId)) shared.set(person.worldPersonId, []);
      shared.get(person.worldPersonId).push(brief);
    }
    const birth = exactYear(person.birth), death = exactYear(person.death);
    if (birth !== null && death !== null && death < birth) localCandidates.push({ kind: 'death-before-birth', ...brief });
    if (death !== null && ['alive', 'living'].includes(person.status)) localCandidates.push({ kind: 'living-with-death-year', ...brief });
    if (birth !== null && birth > ALERIA_CURRENT_YEAR) localCandidates.push({ kind: 'birth-after-world-present', ...brief });
  }
  for (const parentage of record.family.parentages || []) {
    if (!publicEntity(parentage)) { count.excludedNonPublicParentages++; continue; }
    count.publicParentages++;
    if (parentage.type !== 'biological' || parentage.certainty === 'uncertain' || parentage.certainty === 'disputed') continue;
    const child = byId.get(parentage.childId);
    const childBirth = exactYear(child?.birth);
    if (!child || childBirth === null) continue;
    for (const parentId of parentage.parentIds || []) {
      const parent = byId.get(parentId), parentBirth = exactYear(parent?.birth), parentDeath = exactYear(parent?.death);
      if (!parent) continue;
      const issue = parentBirth !== null && parentBirth >= childBirth ? 'parent-born-after-child'
        : parentDeath !== null && parentDeath < childBirth - 1 ? 'child-born-after-parent-death'
          : parentBirth !== null && childBirth - parentBirth < 12 ? 'parent-age-under-12' : null;
      if (issue) localCandidates.push({ kind: issue, familyId: record.id, familyTitle: record.title,
        parentageId: parentage.id, parent: compact(record, parent), child: compact(record, child),
        yearGap: parentBirth === null ? null : childBirth - parentBirth,
        requiresNarrativeReview: true });
    }
  }
  for (const partnership of record.family.partnerships || []) {
    if (!publicEntity(partnership)) { count.excludedNonPublicPartnerships++; continue; }
    count.publicPartnerships++;
    const start = exactYear(partnership.start), end = exactYear(partnership.end);
    if (start !== null && end !== null && end < start) localCandidates.push({ kind: 'partnership-end-before-start',
      familyId: record.id, partnershipId: partnership.id, start, end, requiresNarrativeReview: true });
    if (start !== null) for (const participantId of partnership.participantIds || []) {
      const participant = byId.get(participantId);
      if (!participant) continue;
      const birth = exactYear(participant.birth), death = exactYear(participant.death);
      const issue = birth !== null && start < birth ? 'partnership-start-before-birth'
        : death !== null && start > death ? 'partnership-start-after-death' : null;
      if (issue) localCandidates.push({ kind: issue, familyId: record.id, partnershipId: partnership.id,
        type: partnership.type, start, participant: compact(record, participant), requiresNarrativeReview: true });
    }
  }
}

const identityCandidates = [];
let sharedIdentityGroups = 0;
for (const [worldPersonId, entries] of shared) {
  if (new Set(entries.map(entry => entry.familyId)).size < 2) continue;
  sharedIdentityGroups++;
  const fields = {};
  for (const field of ['birth', 'death', 'status', 'sex']) {
    const values = [...new Set(entries.map(entry => entry[field]).filter(known))];
    if (values.length > 1) fields[field] = values;
  }
  if (Object.keys(fields).length) identityCandidates.push({ worldPersonId, fields, entries,
    requiresIdentityAndNarrativeReview: true });
}
await dump('chronology-candidates.json', { schema: 'aleria.public-house-chronology-candidates',
  reviewedAt: new Date().toISOString(), currentYear: ALERIA_CURRENT_YEAR, status: 'unreviewed-candidates',
  note: 'Automated candidates are not accepted lore contradictions. Public graph only; exact numeric years; shared IDs need identity verification.',
  count, sharedIdentityGroups, identityCandidates, localCandidates });
console.log(JSON.stringify({ realmCounts: Object.fromEntries(realms.map(realm => [realm,
  scope.filter(record => record.realms.includes(realm)).length])), count, sharedIdentityGroups,
  identityCandidates: identityCandidates.length, localCandidates: localCandidates.length }, null, 2));
