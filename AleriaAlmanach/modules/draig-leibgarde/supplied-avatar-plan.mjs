import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import '../image-library/image-library-model.js';
import { selectCharacterImageLibraryWrite } from '../characters/character-save-guard.js';
import { decodeFirestoreFields, encodeFirestoreValuePreservingTypes } from '../../../firebase/scripts/backup/firestore-value-codec.mjs';

const library = globalThis.AleriaCharacterImageSets;

export const SUPPLIED_GUARD_AVATAR_PEOPLE = Object.freeze([
  Object.freeze({ id: 'XVeiNvgFfsmtomLuIjcA', name: 'Hywel Craigddu', slug: 'hywel-craigddu', numbers: Object.freeze([1, 2, 3, 5]) }),
  Object.freeze({ id: 'ExQDi0xrpkmXAXUL1Ukh', name: 'Llywelyn Coeddu', slug: 'llywelyn-coeddu', numbers: Object.freeze([1, 2, 3, 4, 5]) }),
  Object.freeze({ id: 'HWUuhs0eUIaWLQ5IwdE2', name: 'Mathon Curiad', slug: 'mathon-curiad', numbers: Object.freeze([1]) })
]);

export const SUPPLIED_GUARD_AVATAR_PATCH_FIELDS = Object.freeze([
  'portrait', 'emotes', 'emotesOverride', 'imageSetSchemaVersion', 'imageSets',
  'imageSetsOverride', 'activeImageSetId', 'biography', 'updatedAt'
]);

function imageUrl(value) {
  const normalized = library.normalizeImageUrl(value);
  assert(normalized && normalized === value, 'Gültiger unveränderter Bildlink erforderlich.');
  return normalized;
}

export function assertSuppliedGuardAvatarSource(source) {
  const person = SUPPLIED_GUARD_AVATAR_PEOPLE.find(person => person.id === source?.id);
  assert(person && source.name === person.name && source.slug === person.slug, 'Falsche bestehende Gardeidentität.');
  assert.deepEqual(source.sets?.map(set => set.catalogNumber), [...person.numbers], 'Gelieferte Setnummern verändert.');
  const hashes = new Set(), urls = new Set();
  for (const set of source.sets) {
    assert.equal(set.id, set.catalogNumber === 1 ? 'standard' : `set-${String(set.catalogNumber).padStart(2, '0')}`);
    assert.equal(set.workshopSetId, `set-${String(set.catalogNumber).padStart(2, '0')}`);
    assert(set.name && set.name === library.normalizeText(set.name), 'Vollständiger Settitel erforderlich.');
    assert.equal(set.outputs?.length, 9, 'Jedes gelieferte Set benötigt neun Avatare.');
    set.outputs.forEach((avatar, index) => {
      assert.equal(avatar.index, index + 1, 'Panelreihenfolge verändert.');
      assert(avatar.label && avatar.label === library.normalizeText(avatar.label, 20), 'Kurzes unverändertes Emotelabel erforderlich.');
      assert(/^[a-f0-9]{64}$/.test(avatar.sha256) && !hashes.has(avatar.sha256), 'Eindeutiger Quellenhash erforderlich.');
      assert(avatar.localPath?.startsWith(`AleriaAlmanach/AvatarWerkstatt/Charaktere/Einzelcharaktere/${person.name}/Output/`)
        && !avatar.localPath.includes('..'), 'Falscher Werkstattbereich.');
      hashes.add(avatar.sha256);
      const url = imageUrl(avatar.url);
      assert(!urls.has(url), 'Doppelter Avatarlink.');
      urls.add(url);
    });
  }
  if (source.portrait) imageUrl(source.portrait);
  return person;
}

function sameMedia(first, second) {
  return first.portrait === second.portrait && isDeepStrictEqual(first.emotes, second.emotes);
}

function retainPreviousSet(sets, source, id, name, now) {
  const prior = sets.find(set => set.id === id);
  if (prior) {
    assert(sameMedia(prior, source), 'Vorhandene historische Avatare weichen ab und werden erhalten.');
    return;
  }
  sets.push({ ...structuredClone(source), id, name,
    createdAt: source.createdAt || now, updatedAt: source.updatedAt || source.createdAt || now });
}

function updateBiographyPortrait(character, portrait) {
  const biography = structuredClone(character.biography);
  if (!biography?.biography || !Object.hasOwn(biography.biography, 'portrait')) return undefined;
  // The biography can contain portraits of relatives. Only its dedicated main
  // portrait field is owned by this media update; all prose stays untouched.
  const current = biography.biography.portrait;
  if (current !== portrait) {
    const previousOwnPortraits = new Set([character.portrait, library.get(character, 'standard').portrait].filter(Boolean));
    assert(previousOwnPortraits.has(current), 'Abweichendes Hauptbioporträt wird ohne eindeutige Zuordnung erhalten.');
    biography.biography.portrait = portrait;
  }
  return isDeepStrictEqual(biography, character.biography) ? undefined : biography;
}

/** Pure plan: the caller supplies freshly read profiles and verified media URLs. */
export function buildSuppliedGuardAvatarPatch(character, source, now) {
  const person = assertSuppliedGuardAvatarSource(source);
  assert.equal(character.id, person.id, 'Falsches Zieldokument.');
  assert.equal(character.name, person.name, 'Falsche Zielperson.');
  assert(Number.isFinite(Date.parse(now)), 'Fester gültiger Änderungszeitpunkt erforderlich.');
  const existingSets = structuredClone(Array.isArray(character.imageSets) ? character.imageSets : []);
  const normalized = library.normalize(character);
  assert.equal(normalized.length, existingSets.length + (existingSets.some(set => set.id === 'standard') ? 0 : 1),
    'Vorhandene Bildsets würden durch die UI abgeschnitten.');
  const ids = new Set();
  for (const set of existingSets) {
    assert(set.id && !ids.has(set.id) && library.normalizeId(set.id) === set.id, 'Vorhandene Setkennung ist mehrdeutig.');
    ids.add(set.id);
  }
  const previousStandard = existingSets.find(set => set.id === 'standard') || library.get(character, 'standard');
  const portrait = source.portrait || previousStandard.portrait || character.portrait || null;
  if (portrait) imageUrl(portrait);
  const standardSource = source.sets.find(set => set.catalogNumber === 1);
  const standardEmotes = standardSource.outputs.map(avatar => ({ img: avatar.url, label: avatar.label }));
  const desiredMedia = { portrait, emotes: standardEmotes };
  const nextSets = existingSets.filter(set => set.id !== 'standard');
  // Never discard the 17/18 previously saved avatars or their old portrait.
  if (!sameMedia(previousStandard, desiredMedia) && (previousStandard.emotes?.length || previousStandard.portrait !== portrait)) {
    retainPreviousSet(nextSets, previousStandard, 'draig-garde-bisher-standard', 'Bisherige Avatare', now);
  }
  const legacy = { portrait: character.portrait || null, emotes: structuredClone(character.emotes || []) };
  if (legacy.emotes.length && !sameMedia(legacy, previousStandard) && !sameMedia(legacy, desiredMedia)) {
    retainPreviousSet(nextSets, legacy, 'draig-garde-bisher-legacy', 'Bisherige Einzelavatare', now);
  }
  const standard = { ...structuredClone(previousStandard), id: 'standard', name: 'Standard', ...desiredMedia,
    createdAt: previousStandard.createdAt || now,
    updatedAt: sameMedia(previousStandard, desiredMedia) ? (previousStandard.updatedAt || previousStandard.createdAt || now) : now };
  nextSets.unshift(standard);
  for (const setSource of source.sets.filter(set => set.catalogNumber !== 1)) {
    const media = { portrait, emotes: setSource.outputs.map(avatar => ({ img: avatar.url, label: avatar.label })) };
    const existing = nextSets.find(set => set.id === setSource.id);
    if (existing) {
      assert(existing.name === setSource.name && sameMedia(existing, media), `Vorhandenes Set ${setSource.id} kollidiert und wird erhalten.`);
      continue;
    }
    nextSets.push({ id: setSource.id, name: setSource.name, ...media, createdAt: now, updatedAt: now });
  }
  assert(nextSets.length <= library.limit, 'Nicht genügend Platz für die gelieferten Bildsets.');
  const candidate = selectCharacterImageLibraryWrite({ portrait, emotes: standardEmotes, emotesOverride: true,
    imageSetSchemaVersion: library.schemaVersion, imageSets: nextSets, imageSetsOverride: true, activeImageSetId: 'standard' });
  const biography = updateBiographyPortrait(character, portrait);
  if (biography) candidate.biography = biography;
  const patch = Object.fromEntries(Object.entries(candidate).filter(([key, value]) => !isDeepStrictEqual(character[key], value)));
  if (Object.keys(patch).length) patch.updatedAt = now;
  assert(Object.keys(patch).every(key => SUPPLIED_GUARD_AVATAR_PATCH_FIELDS.includes(key)), 'Unbegrenzter Medienpatch.');
  for (const prior of existingSets.filter(set => set.id !== 'standard')) {
    assert.deepEqual(nextSets.find(set => set.id === prior.id), prior, 'Unbeteiligtes Bildset verändert.');
  }
  return patch;
}

export function buildSuppliedGuardAvatarWrite(raw, character, source, now) {
  assert(raw?.updateTime && raw.name?.endsWith(`/characters/${source.id}`), 'Frisches Zieldokument mit CAS-Version fehlt.');
  const patch = buildSuppliedGuardAvatarPatch(character, source, now);
  return { patch, write: Object.keys(patch).length ? { update: { name: raw.name, fields: encodeSuppliedAvatarFields(raw, patch) },
    updateMask: { fieldPaths: Object.keys(patch) }, currentDocument: { updateTime: raw.updateTime } } : null };
}

export function encodeSuppliedAvatarFields(raw, patch) {
  const fields = Object.fromEntries(Object.entries(patch).map(([key, value]) =>
    [key, encodeFirestoreValuePreservingTypes(raw.fields?.[key], value)]));
  if (patch.imageSets) {
    const prior = raw.fields?.imageSets?.arrayValue?.values || [];
    const byId = new Map(prior.map(value => [decodeFirestoreFields(value.mapValue?.fields || {}).id, value]));
    fields.imageSets = { arrayValue: { values: patch.imageSets.map(set => {
      const original = byId.get(set.id) || (set.id === 'draig-garde-bisher-standard' ? byId.get('standard') : undefined);
      return encodeFirestoreValuePreservingTypes(original, set);
    }) } };
  }
  return fields;
}

export function assertSuppliedGuardAvatarReadBack(before, after, patch) {
  assert(Object.keys(patch).every(key => SUPPLIED_GUARD_AVATAR_PATCH_FIELDS.includes(key)));
  assert.equal(after?.name, before.name);
  const keys = [...new Set([...Object.keys(before.fields), ...Object.keys(patch)])].sort();
  const expectedFields = encodeSuppliedAvatarFields(before, patch);
  assert.deepEqual(Object.keys(after.fields || {}).sort(), keys, 'Profilfeldbestand verändert.');
  for (const key of keys) {
    if (Object.hasOwn(patch, key)) {
      assert.deepEqual(decodeFirestoreFields({ [key]: after.fields[key] })[key], patch[key], `Medienpatch verändert: ${key}`);
      assert.deepEqual(after.fields[key], expectedFields[key], `REST-Typ im Medienpatch verändert: ${key}`);
    }
    else assert.deepEqual(after.fields[key], before.fields[key], `Unbeteiligtes Profilfeld verändert: ${key}`);
  }
  return true;
}
