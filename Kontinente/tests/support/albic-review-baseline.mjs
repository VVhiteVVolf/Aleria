import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { REVIEWED_CHARACTER_TRAITS } from '../../../AleriaAlmanach/modules/character-trait-review/reviewed-character-traits.js';
import { hasExactReviewedBiographyTraitCards } from '../../../AleriaAlmanach/modules/character-trait-review/character-trait-review-model.js';
import acceptedMetadata from './accepted-realm-metadata-review-20261029.json' with { type: 'json' };
import balchderPeople from './balchder-person-review-20261029.json' with { type: 'json' };
import gawainPublic from './gawain-public-person-review-20261101.json' with { type: 'json' };
import brevanorRank from './brevanor-rank-review-20261030.json' with { type: 'json' };
import gwynthorCourt from './gwynthor-court-family-review-20261030.json' with { type: 'json' };
import gwynthorTroetzli from './gwynthor-troetzli-family-review-20261031.json' with { type: 'json' };
import gwynthorArgall from './gwynthor-argall-family-review-20261105.json' with { type: 'json' };
import kingdomMetadata from './kingdom-metadata-review-20261101.json' with { type: 'json' };
import traitCards from './character-trait-card-review-20261102.json' with { type: 'json' };
import gwyllachAges from './gwyllach-age-review-20261102.json' with { type: 'json' };
import currentMetadata from './current-family-metadata-review-20261102.json' with { type: 'json' };
import patrickBiographies from './patrick-biography-person-review-20261103.json' with { type: 'json' };
import houseBiographyOwnership from './house-biography-ownership-review-20261103.json' with { type: 'json' };
import sonnenkuesteAllegiance from './sonnenkueste-knight-allegiance-review-20261103.json' with { type: 'json' };
import { applyFamilyMetadataReview } from './apply-family-metadata-review.mjs';
import { projectReviewedTailoringSource } from './tailoring-family-baseline-projection.mjs';
import { getRegisteredSourceMetadataProvenance } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { projectReviewedHouseCorrections } from './reviewed-house-correction-projection.mjs';

export const reviewHash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function protectedAlbicFamilies(records) {
  return records.map(record => {
    let copy = structuredClone(record);
    // Migration versions remain source-owned. Admit only the exact metadata
    // produced by the canonical wrapper pipeline, then retain the explicit
    // pre-existing versions for the historical content proof.
    const provenance = getRegisteredSourceMetadataProvenance(record.id);
    if (provenance.fields.length) applyFamilyMetadataReview(copy, { familyId: record.id, ...provenance });
    copy = projectReviewedTailoringSource(copy);
    // Restore only the exact source7 portrait/view correction to its reviewed
    // source6 predecessor before the existing source6-to4 metadata proof.
    if (record.id === gwynthorArgall.layoutRevisionCorrection.familyId) {
      applyFamilyMetadataReview(copy, gwynthorArgall.layoutRevisionCorrection);
    }
    // The saved-record boundary changed only these exact Argall metadata leaves.
    // Restore their reviewed revision-4 values before the unchanged complete
    // Argall content fingerprint below; never omit person or relationship data.
    if (record.id === gwynthorArgall.metadataRevisionCorrection.familyId) {
      applyFamilyMetadataReview(copy, gwynthorArgall.metadataRevisionCorrection);
    }
    projectReviewedHouseCorrections(copy);
    const ownershipReview = houseBiographyOwnership.reviews.find(review => review.familyId === record.id);
    if (ownershipReview) applyFamilyMetadataReview(copy, ownershipReview);
    const allegianceReview = sonnenkuesteAllegiance.reviews.find(review => review.familyId === record.id);
    if (allegianceReview) applyFamilyMetadataReview(copy, allegianceReview);
    // Three approved biography identities changed presentation metadata only.
    // Validate their exact new fields before the older proof sees predecessor
    // values. Person/world IDs, all family edges and unrelated fields stay hashed.
    const patrickReview = patrickBiographies.reviews.find(review => review.familyId === record.id);
    if (patrickReview) {
      assert.equal(copy.family.persons.length, patrickReview.personCount, `${record.id}/approved-biography-person-count`);
      applyFamilyMetadataReview(copy, patrickReview);
      const addition = patrickReview.houseAddition;
      if (addition) {
        assert.equal(copy.family.houses.length, addition.afterCount, `${record.id}/approved-hamnett-house-count`);
        assert.deepEqual(copy.family.houses[addition.index], addition.house, `${record.id}/approved-hamnett-house`);
        copy.family.houses.splice(addition.index, 1);
      }
    }
    const metadata = currentMetadata.reviews.find(review => review.familyId === record.id);
    if (metadata) applyFamilyMetadataReview(copy, metadata);
    // Validate the narrowly approved trait-card and age edits, then restore
    // their predecessor values for the older territorial proof. No identity,
    // portrait, genealogy or unrelated prose is omitted from that proof.
    for (const review of traitCards.cards.filter(review => review.familyId === record.id)) {
      const body = copy.family.persons.find(person => person.id === review.personId)?.extensions?.biographyModule?.biography;
      assert(body, `${record.id}/${review.personId}/trait-cards`);
      const current = { abilitiesTitle: body.abilitiesTitle, abilities: body.abilities };
      if (!isDeepStrictEqual(current, review.after)) {
        // A catalog revision may replace complete approved cards. Tie both
        // versions to the same exact reviewed assignment before projecting.
        const assignments = REVIEWED_CHARACTER_TRAITS.filter(assignment =>
          hasExactReviewedBiographyTraitCards(review.after.abilities, assignment.id)
          && hasExactReviewedBiographyTraitCards(current.abilities, assignment.id));
        assert.equal(assignments.length, 1, `${record.id}/${review.personId}/trait-cards`);
        current.abilities = review.after.abilities;
      }
      assert.deepEqual(current, review.after, `${record.id}/${review.personId}/trait-cards`);
      Object.assign(body, structuredClone(review.before));
    }
    if (record.id === gwyllachAges.familyId) {
      for (const review of gwyllachAges.people) {
        const person = copy.family.persons.find(person => person.id === review.id);
        const current = Object.fromEntries(['birth', 'notes', 'extensions'].filter(key => Object.hasOwn(person, key)).map(key => [key, person[key]]));
        assert.deepEqual(current, review.after, `${record.id}/${review.id}/approved-age`);
        for (const key of ['birth', 'notes', 'extensions']) {
          if (Object.hasOwn(review.before, key)) person[key] = structuredClone(review.before[key]);
          else delete person[key];
        }
      }
      for (const [key, value] of Object.entries(gwyllachAges.extensionsAfter)) {
        // The shared wrappers can advance their source counter independently;
        // it is already excluded from this historical proof below.
        if (key === 'sourceRevision') continue;
        assert.deepEqual(copy.family.extensions[key], value, `${record.id}/${key}/approved-age`);
        if (Object.hasOwn(gwyllachAges.extensionsBefore, key)) copy.family.extensions[key] = structuredClone(gwyllachAges.extensionsBefore[key]);
        else delete copy.family.extensions[key];
      }
    }
    // Validate the exact approved biography/job metadata before projecting it
    // back. All identity, portrait, life-date and relationship fields stay hashed.
    for (const personReview of [balchderPeople, gawainPublic]) {
      for (const [personId, review] of Object.entries(personReview.families[record.id] || {})) {
        const person = copy.family.persons.find(person => person.id === personId);
        assert.equal(reviewHash({ title: person.title, notes: person.notes, extensions: person.extensions }), review.afterSha256, `${record.id}/${personId}`);
        Object.assign(person, structuredClone(review.before));
      }
    }
    delete copy.folderPath; delete copy.hierarchy;
    const omitLocation = profile => {
      if (!profile) return;
      for (const field of ['seat', 'barony', 'county', 'kingdom', 'folderPath', 'folderIcons', 'regionEmblems']) delete profile[field];
    };
    copy.houseProfile = { ...copy.houseProfile };
    copy.family.document.houseProfile = { ...copy.family.document.houseProfile };
    const kingdomReview = kingdomMetadata.families[record.id];
    if (kingdomReview) {
      for (const profile of [copy.houseProfile, copy.family.document.houseProfile]) {
        for (const [field, value] of Object.entries(kingdomReview.profileAfter)) assert.equal(profile[field], value, `${record.id}/${field}`);
        Object.assign(profile, kingdomReview.profileBefore);
      }
      for (const [field, value] of Object.entries(kingdomReview.extensionsAfter)) {
        assert.deepEqual(copy.family.extensions[field], value, `${record.id}/${field}`);
        delete copy.family.extensions[field];
      }
      Object.assign(copy.family.extensions, structuredClone(kingdomReview.extensionsBefore));
    }
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
    const locationFollowup = gwynthorTroetzli.locationFollowupReview;
    if (record.id === locationFollowup.familyId) {
      assert.deepEqual(copy.family.extensions.registryManagedHouseProfileFieldRevisions,
        locationFollowup.managedFieldRevisions, `${record.id}/approved-location-revisions`);
      delete copy.family.extensions.registryManagedHouseProfileFieldRevisions;
    }
    // Approved Gwynthor stories add relatives to existing families. Check each
    // complete current record before restoring its exact published predecessor
    // for the older territorial review; never rebase the historical hash.
    const familyReview = gwynthorCourt.families[record.id] || gwynthorTroetzli.families[record.id] || gwynthorArgall.families[record.id];
    if (familyReview) {
      assert.equal(reviewHash(copy), familyReview.afterSha256, `${record.id}/approved-gwynthor-family`);
      return structuredClone(familyReview.before);
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
