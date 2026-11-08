import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

/** Explicit evidence is verified before any snapshot file can be written. */
export async function verifyIdentityCorrectionSources(corrections, readSource) {
  const verified = new Map();
  for (const correction of corrections) {
    assert(['worldPersonId', 'houseId'].includes(correction.field), 'Nur dokumentierte Identitätsfelder sind zulässig.');
    const file = correction.sourcePath;
    assert(typeof file === 'string' && file.startsWith('Stammbäume/assets/data/source-inventories/')
      && !file.includes('\\') && !file.includes(':') && file.split('/').every(part => part && part !== '.' && part !== '..'), 'Unsicherer Identitätsbeleg.');
    assert(/^[a-f0-9]{64}$/.test(correction.sourceSha256 || ''), 'Quellhash fehlt.');
    if (!verified.has(file)) verified.set(file, createHash('sha256').update(await readSource(file)).digest('hex'));
    assert.equal(verified.get(file), correction.sourceSha256, 'Identitätsbeleg wurde verändert.');
  }
  return verified;
}

function linkedMarriage(family, personId, linkId, counterpartFamilyId) {
  const matches = family.partnerships.filter(partnership => partnership.type === 'marriage'
    && partnership.participantIds.includes(personId)
    && partnership.extensions?.crossFamilyRelationship?.linkId === linkId
    && partnership.extensions.crossFamilyRelationship.counterpartFamilyId === counterpartFamilyId);
  assert.equal(matches.length, 1, 'Eindeutige beidseitige Eheverbindung fehlt.');
  assert.equal(matches[0].participantIds.length, 2);
  return matches[0];
}

/** A documented same-person correction is distinct from ordinary life-date edits. */
export function assertReviewedSnapshotIdentityCorrection({ familyId, previous, current, field, corrections, records, verifiedSourceHashes }) {
  assert(['worldPersonId', 'houseId'].includes(field));
  const matches = corrections.filter(item => item.familyId === familyId && item.personId === previous.id && item.field === field
    && item.worldPersonId === previous.worldPersonId && item.from === previous[field] && item.to === current[field]);
  assert.equal(matches.length, 1, `Nicht freigegebene Personenänderung: ${familyId}/${previous.id}/${field}`);
  const correction = matches[0];
  assert(correction.reason?.trim() && correction.marriageLinkId && correction.partnerWorldPersonId, 'Identitätsbegründung fehlt.');
  assert.equal(verifiedSourceHashes.get(correction.sourcePath), correction.sourceSha256, 'Ungeprüfter Identitätsbeleg.');
  assert(current.extensions?.legacyWorldPersonIds?.includes(previous.worldPersonId), 'Bisherige Weltkennung muss erhalten bleiben.');
  for (const key of ['id', 'birth', 'death', 'sex']) assert.equal(current[key], previous[key], `Identitätskorrektur verändert ${key}.`);
  assert.equal(current.birth, correction.birth); assert.equal(current.sex, correction.sex);
  const family = records.find(row => row.family.document.id === familyId)?.family;
  const counterpartFamily = records.find(row => row.family.document.id === correction.counterpartFamilyId)?.family;
  assert(family && counterpartFamily, 'Die Gegenakte fehlt im Veröffentlichungsbatch.');
  const counterpart = counterpartFamily.persons.find(person => person.id === correction.counterpartPersonId);
  assert(counterpart && counterpart.worldPersonId === current.worldPersonId, 'Kanonische Gegenperson fehlt.');
  assert.equal(counterpart.birth, current.birth); assert.equal(counterpart.sex, current.sex);
  if (field === 'houseId') assert.equal(current.houseId, counterpart.houseId, 'Abweichende Hauszugehörigkeit.');
  const marriage = linkedMarriage(family, current.id, correction.marriageLinkId, correction.counterpartFamilyId);
  const otherMarriage = linkedMarriage(counterpartFamily, counterpart.id, correction.marriageLinkId, familyId);
  const partner = family.persons.find(person => person.id === marriage.participantIds.find(id => id !== current.id));
  const otherPartner = counterpartFamily.persons.find(person => person.id === otherMarriage.participantIds.find(id => id !== counterpart.id));
  assert(partner && otherPartner && partner.worldPersonId === correction.partnerWorldPersonId
    && otherPartner.worldPersonId === partner.worldPersonId, 'Die Ehepartner stimmen nicht überein.');
  assert.equal(marriage.status, otherMarriage.status);
  return correction;
}
