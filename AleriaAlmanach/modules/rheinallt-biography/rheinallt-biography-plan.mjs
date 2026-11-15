import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { RHEINALLT_BIOGRAPHY, RHEINALLT_CHARACTER_ID, RHEINALLT_IMAGE_URLS } from './rheinallt-biography.js';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';
import { createHouseholdCompanion } from '../creatures/catalog/household-companion-profiles.js';
import { sanitizeCreature } from '../creatures/creature-model.js';
import { attachCreatureToInventory } from '../creatures/creature-companion-link.js';

const PETS = Object.freeze([
  { slug: 'cadarn', name: 'Cadarn', species: 'Ceffyl-Pferd', profile: 'horse', bestiaryId: 'tiere/pferde/ceffyl',
    description: 'Cadarn ist Rheinallt Gafyrs persönliches Ceffyl. Alter, Geschlecht und besondere Ausbildung sind nicht festgelegt.',
    appearance: 'Helles graues Fell, weiße Mähne und weißer Schweif. Schwarze Schabracke mit goldfarbenen Ziegenmotiven und braunes Sattelzeug mit goldfarbenen Beschlägen.' },
  { slug: 'cawg', name: 'Cawg', species: 'Hund', profile: 'dog',
    description: 'Cawg ist Rheinallt Gafyrs Hund. Rasse, Alter, Geschlecht und besondere Ausbildung sind nicht festgelegt.',
    appearance: 'Schwarz-braun-weißes Fell, aufgerichtete Ohren und buschiger Schweif. Braunes Ledergeschirr mit goldfarbenen Beschlägen und schwarzem Brustschild mit goldenem Ziegenmotiv.' }
]);

function createCompanion(spec, owner, now) {
  const portrait = `/AleriaAlmanach/assets/rheinallt-biography/${spec.slug}-v1.jpeg`;
  const source = createHouseholdCompanion({ ...spec, ownerSlug: 'rheinallt', ownerId: owner.id, ownerName: owner.name,
    level: 1, location: 'Gwynthor', house: 'Haus Gafyr', habitat: 'Castell Gafyr, Gwynthor', portrait });
  return sanitizeCreature({ ...source, needsStatReview: true,
    ...(spec.bestiaryId ? { bestiaryReference: { id: spec.bestiaryId } } : {}),
    createdAt: now, updatedAt: now, biography: { ...source.biography, appearance: spec.appearance,
      facts: [...source.biography.facts, { label: 'Besitzer', value: owner.name },
        { label: 'Rasse', value: spec.bestiaryId ? 'Ceffyl' : 'Nicht festgelegt' }],
      connections: [{ type: 'connection', name: owner.name, image: owner.portrait || '', detail: 'Belegter Besitzer.' }] } });
}

// Pure editorial planning. Live resources and already stored creature sheets are
// never regenerated. Namesakes with another owner are independent individuals.
export function planRheinalltBiography(character, existingCreatures = [], now = new Date().toISOString()) {
  assert.equal(character.id, RHEINALLT_CHARACTER_ID);
  assert.equal(character.identity?.worldPersonId || character.genealogy?.worldPersonId, RHEINALLT_CHARACTER_ID);
  assert(Number.isFinite(Date.parse(now)));
  const patch = {}, creatures = [];
  const biography = sanitizeCharacterBiographyForFirestore({ biography: structuredClone(RHEINALLT_BIOGRAPHY) }).biography;
  const oldBiography = structuredClone(character.biography || {});
  delete oldBiography.revision;
  if (!isDeepStrictEqual(biography, oldBiography)) {
    patch.biography = { ...biography, revision: Math.max(Date.parse(now), (Number(character.biography?.revision) || 0) + 1) };
  }
  for (const [field, value] of Object.entries({ title: 'Sir', role: 'Marschall des Hauses Gafyr',
    origin: 'Gwynthor', currentLocation: 'Castell Gafyr, Gwynthor' })) {
    if (!character[field]) patch[field] = value;
  }
  const localize = emotes => (emotes || []).map(emote => ({ ...emote, img: RHEINALLT_IMAGE_URLS[emote.img] || emote.img }));
  for (const [field, value] of Object.entries({
    emotes: localize(character.emotes),
    imageSets: (character.imageSets || []).map(set => ({ ...set, emotes: localize(set.emotes) }))
  })) if (!isDeepStrictEqual(value, character[field])) patch[field] = value;

  let inventory = structuredClone(character.inventory || {});
  for (const spec of PETS) {
    const creatureId = `companion-rheinallt-${spec.slug}`;
    const matches = existingCreatures.filter(creature => creature.id === creatureId
      || creature.name === spec.name && creature.itemOrigin?.ownerCharacterId === character.id);
    assert(matches.length <= 1, `Mehrdeutige eigene Tierakte: ${spec.name}`);
    const creature = matches[0] || createCompanion(spec, character, now);
    assert.equal(creature.id, creatureId, 'Eine bestehende eigene Tieridentität benötigt einen gezielten Abgleich.');
    assert.equal(creature.itemOrigin?.ownerCharacterId, character.id, 'Falscher Tierbesitzer.');
    if (!matches.length) creatures.push(creature);
    inventory = attachCreatureToInventory({ ...character, inventory }, creature, now);
  }
  if (!isDeepStrictEqual(inventory, character.inventory)) {
    patch.inventory = { ...inventory, revision: Math.max(Date.parse(now), (Number(character.inventory?.revision) || 0) + 1) };
  }
  if (Object.keys(patch).length) patch.updatedAt = now;
  return { id: character.id, patch, creatures };
}
