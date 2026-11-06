import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import '../image-library/image-library-model.js';
import { selectCharacterImageLibraryWrite } from '../characters/character-save-guard.js';
import { MARKET_CHARACTERS } from './characters.mjs';
import { encodeFirestoreFields, decodeFirestoreFields } from '../../../firebase/scripts/backup/firestore-value-codec.mjs';

export const MARKET_AVATAR_SET_ID = 'handeln-set-01';
export const MARKET_AVATAR_SET_NAME = 'Feilschen & Handeln';
export const MARKET_AVATAR_LABELS = Object.freeze(['Kundschaft locken', 'Anpreisen', 'Skeptisch', 'Zu wenig!', 'Preis abwägen', 'Fester Preis', 'Letzter Nachlass', 'Einlenken', 'Geschäftsabschluss']);
export const MARKET_AVATAR_PATCH_FIELDS = Object.freeze(['imageSetSchemaVersion', 'imageSets', 'imageSetsOverride', 'updatedAt']);
const library = globalThis.AleriaCharacterImageSets;

export function assertMarketAvatarManifest(manifest, { published = false } = {}) {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.setId, MARKET_AVATAR_SET_ID);
  assert.equal(manifest.setName, MARKET_AVATAR_SET_NAME);
  assert(Number.isFinite(Date.parse(manifest.authoredAt)), 'Festes Erstellungsdatum fehlt.');
  assert.equal(manifest.characters?.length, 3);
  const files = new Set(), hashes = new Set(), urls = new Set();
  for (const person of MARKET_CHARACTERS) {
    const source = manifest.characters.find(item => item.id === person.id);
    assert(source && source.slug === person.slug && source.name === person.name, `Avataridentität fehlt: ${person.name}`);
    assert.equal(source.avatars?.length, 9);
    source.avatars.forEach((avatar, index) => {
      assert.equal(avatar.index, index + 1, 'Panelreihenfolge muss 1–9 sein.');
      assert.equal(avatar.label, MARKET_AVATAR_LABELS[index], 'Panelbeschriftung weicht vom Auftrag ab.');
      assert(avatar.label && avatar.label === library.normalizeText(avatar.label, 20), 'Emotelabel fehlt oder überschreitet 20 Zeichen.');
      assert(/^[a-f0-9]{64}$/.test(avatar.sha256) && !hashes.has(avatar.sha256), 'Avatarbytes fehlen oder sind doppelt.');
      hashes.add(avatar.sha256);
      assert(typeof avatar.localPath === 'string' && avatar.localPath.startsWith(`AleriaAlmanach/AvatarWerkstatt/Charaktere/Einzelcharaktere/${person.name}/Output/`)
        && !avatar.localPath.includes('..') && !files.has(avatar.localPath), 'Eigener Werkstatt-Output erwartet.');
      files.add(avatar.localPath);
      if (published) {
        assert(avatar.url?.startsWith('https://') && avatar.url === library.normalizeImageUrl(avatar.url) && !urls.has(avatar.url), 'Öffentlicher Avatarlink fehlt oder ist doppelt.');
        urls.add(avatar.url);
      }
    });
  }
  return manifest;
}

export function buildMarketAvatarPatch(character, source, manifest, now) {
  assertMarketAvatarManifest(manifest, { published: true });
  const person = MARKET_CHARACTERS.find(person => person.id === character.id);
  assert(person && character.name === person.name && source.id === person.id, 'Falsche Zielperson.');
  assert(Number.isFinite(Date.parse(now)), 'Ungültiger Änderungszeitpunkt.');
  const rawSets = structuredClone(Array.isArray(character.imageSets) ? character.imageSets : []);
  const existing = rawSets.find(set => set.id === manifest.setId);
  const normalized = library.normalize(character);
  assert.equal(normalized.length, rawSets.length + (rawSets.some(set => set.id === 'standard') ? 0 : 1), 'Bildsets wurden durch das bestehende Modell abgeschnitten.');
  for (const raw of rawSets.filter(set => set.id !== manifest.setId)) {
    assert(library.normalizeId(raw.id || raw.name) !== manifest.setId
      && library.normalizeText(raw.name).toLocaleLowerCase('de') !== manifest.setName.toLocaleLowerCase('de'), 'Vorhandenes Avatarset kollidiert nach UI-Normalisierung.');
  }
  const standard = library.get(character, 'standard');
  const emotes = source.avatars.map(avatar => ({ img: avatar.url, label: avatar.label }));
  const set = library.normalizeRecord({ id: manifest.setId, name: manifest.setName, portrait: standard.portrait,
    emotes, createdAt: manifest.authoredAt, updatedAt: manifest.authoredAt }, 1, new Set());
  assert.deepEqual(set.emotes, emotes, 'Avatarreihenfolge oder Labels wurden normalisiert.');
  if (existing) { assert.deepEqual(existing, set, 'Vorhandenes gleichnamiges Avatarset weicht ab.'); return {}; }
  if (!rawSets.some(set => set.id === 'standard')) rawSets.unshift(standard);
  assert(rawSets.length < library.limit, 'Kein Platz für ein weiteres Bildset.');
  const candidate = selectCharacterImageLibraryWrite({ imageSetSchemaVersion: library.schemaVersion,
    imageSets: [...rawSets, set], imageSetsOverride: true, updatedAt: now });
  const patch = Object.fromEntries(Object.entries(candidate).filter(([key, value]) => !isDeepStrictEqual(character[key], value)));
  assert(Object.keys(patch).every(key => MARKET_AVATAR_PATCH_FIELDS.includes(key)));
  return patch;
}

export function buildMarketAvatarWrite(raw, character, source, manifest, now) {
  assert(raw?.updateTime && raw.name?.endsWith(`/characters/${source.id}`), 'Frisches Zieldokument mit CAS-Version fehlt.');
  const patch = buildMarketAvatarPatch(character, source, manifest, now);
  return { patch, write: Object.keys(patch).length ? { update: { name: raw.name, fields: encodeFirestoreFields(patch) },
    updateMask: { fieldPaths: Object.keys(patch) }, currentDocument: { updateTime: raw.updateTime } } : null };
}

export function assertMarketAvatarReadBack(before, after, patch) {
  assert(Object.keys(patch).every(key => MARKET_AVATAR_PATCH_FIELDS.includes(key)));
  assert.equal(after?.name, before.name);
  const expectedKeys = [...new Set([...Object.keys(before.fields), ...Object.keys(patch)])].sort();
  assert.deepEqual(Object.keys(after.fields || {}).sort(), expectedKeys, 'Feldschlüssel des Profils verändert.');
  for (const key of expectedKeys) {
    if (Object.hasOwn(patch, key)) {
      assert.deepEqual(decodeFirestoreFields({ [key]: after.fields[key] })[key], patch[key], `Avatarpatch verändert: ${key}`);
    } else assert.deepEqual(after.fields[key], before.fields[key], `Unbeteiligte Profildaten verändert: ${key}`);
  }
  return true;
}
