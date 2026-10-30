import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import acceptedMetadata from './accepted-realm-metadata-review-20261029.json' with { type: 'json' };
import balchderPeople from './balchder-person-review-20261029.json' with { type: 'json' };
import brevanorRank from './brevanor-rank-review-20261030.json' with { type: 'json' };
import gwynthorCourt from './gwynthor-court-family-review-20261030.json' with { type: 'json' };

export const reviewHash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function protectedAlbicFamilies(records) {
  return records.map(record => {
    const copy = structuredClone(record);
    // Validate the exact approved biography/job metadata before projecting it
    // back. All identity, portrait, life-date and relationship fields stay hashed.
    for (const [personId, review] of Object.entries(balchderPeople.families[record.id] || {})) {
      const person = copy.family.persons.find(person => person.id === personId);
      assert.equal(reviewHash({ title: person.title, notes: person.notes, extensions: person.extensions }), review.afterSha256, `${record.id}/${personId}`);
      Object.assign(person, structuredClone(review.before));
    }
    delete copy.folderPath; delete copy.hierarchy;
    const omitLocation = profile => {
      if (!profile) return;
      for (const field of ['seat', 'barony', 'county', 'kingdom', 'folderPath', 'folderIcons', 'regionEmblems']) delete profile[field];
    };
    copy.houseProfile = { ...copy.houseProfile };
    copy.family.document.houseProfile = { ...copy.family.document.houseProfile };
    // Project only the exact approved Bielle rank and its matching prose.
    // Identities, relationships and every other family field stay hashed.
    if (record.id === brevanorRank.house.id) {
      const approved = brevanorRank.house;
      for (const profile of [copy.houseProfile, copy.family.document.houseProfile]) {
        assert.equal(profile.rankId, approved.rankId.after, `${record.id}/rankId`);
        profile.rankId = approved.rankId.before;
      }
      assert.equal(copy.family.document.description, approved.description.after, `${record.id}/description`);
      copy.family.document.description = approved.description.before;
      assert.equal(copy.family.extensions.rankSource, approved.rankSource, `${record.id}/rankSource`);
      delete copy.family.extensions.rankSource;
    }
    if (record.id === brevanorRank.person.familyId) {
      const person = copy.family.persons.find(person => person.id === brevanorRank.person.id);
      assert.equal(person?.notes, brevanorRank.person.notes.after, `${record.id}/${brevanorRank.person.id}/notes`);
      person.notes = brevanorRank.person.notes.before;
    }
    omitLocation(copy.houseProfile);
    omitLocation(copy.family.document.houseProfile);
    // Project only explicitly approved scalar changes back to the historical
    // snapshot. Validate their exact new values first; never omit genealogy.
    const accepted = acceptedMetadata.families[record.id];
    if (accepted) {
      for (const profile of [copy.houseProfile, copy.family.document.houseProfile]) {
        for (const [field, value] of Object.entries(accepted.after)) assert.equal(profile[field], value, `${record.id}/${field}`);
        Object.assign(profile, accepted.before);
      }
      delete copy.family.extensions.acceptedRealmPlacement;
      delete copy.family.extensions.registryManagedHouseProfileFieldRevisions;
    }
    copy.additionalPlacements = (copy.additionalPlacements || []).map(placement => {
      const projected = { ...placement, houseProfile: { ...placement.houseProfile } };
      delete projected.folderPath;
      omitLocation(projected.houseProfile);
      return projected;
    });
    // Biography defaults and their migration versions belong to the biography
    // feature. They can change while every person and relationship stays intact.
    for (const field of ['albicTerritorialReview', 'registryManagedHouseProfileFields', 'registryManagedRecordFields',
      'houseBiographyModule', 'registryManagedEntitySourceRevision', 'sourceRevision']) delete copy.family.extensions[field];
    // The court story deliberately adds relatives and changes the two approved
    // families. Check their complete current records before restoring the exact
    // published records for the older territorial review; never rebase its hash.
    const courtReview = gwynthorCourt.families[record.id];
    if (courtReview) {
      assert.equal(reviewHash(copy), courtReview.afterSha256, `${record.id}/gwynthor-court`);
      return structuredClone(courtReview.before);
    }
    return copy;
  });
}

export function protectedAlbicMap(state) {
  return { pins: state.pins.map(pin => ({ id: pin.id, title: pin.title, x: pin.x, y: pin.y,
    cat: pin.cat, templateId: pin.templateId, pinMarker: pin.pinMarker, text: pin.text,
    sourceId: pin.sourceRef?.markerId || pin.sourceRef?.settlementId,
    residentFamilyIds: pin.residentFamilyIds })),
    geometry: state.regions.map(region => ({ id: region.id, kind: region.kind, paths: region.paths,
      source: region.source, parentId: region.parentId, dominionId: region.dominionId,
      familyId: region.familyId })), mapImages: state.mapImages };
}
