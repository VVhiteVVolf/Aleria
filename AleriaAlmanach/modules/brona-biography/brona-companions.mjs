import { createHouseholdCompanion } from '../creatures/catalog/household-companion-profiles.js';
import { createCreatureDraft, sanitizeCreature } from '../creatures/creature-model.js';

export const BRONA_COMPANION_OWNER_ID = 'XTL39e7WjIwUtoT9Gxml';

const HORSE_REVIEW = 'Die Spielwerte sind das technische Pferdegrundprofil auf Stufe 1 und müssen geprüft werden; sie sind keine Angaben der Biografiequelle.';
const RAM_REVIEW = 'Die Spielwerte sind ausschließlich technische Mindestwerte des Kreaturenmodells und müssen geprüft werden; für Brocken sind keine individuellen Kampfwerte überliefert. Der vom Modell verlangte Angriffseintrag bleibt als leerer Entwurf ohne Namen und Schadensformel erhalten; es ist kein Tierangriff ausgearbeitet.';

function sourceConnection(source, name) {
  const connections = source.biographyModule?.biography?.connections;
  const matches = Array.isArray(connections) ? connections.filter(row => row.type !== 'heading' && row.name === name) : [];
  if (matches.length !== 1 || !/^https:\/\/i\.imgur\.com\/[A-Za-z0-9]+\.(?:png|jpe?g)$/.test(matches[0].image || '')) {
    throw new Error(`Die belegte Tierverbindung fehlt oder ist mehrdeutig: ${name}`);
  }
  return matches[0];
}

function ownerBiography(character, role) {
  return {
    facts: [{ label: 'Rolle', value: role }, { label: 'Besitzerin', value: character.name }],
    connections: [{ type: 'connection', name: character.name, image: character.portrait || '', detail: 'Besitzerin und vertraute Begleiterin.' }],
  };
}

// A pure source projection. The caller reads existing creatures and persists each
// new creature together with attachCreatureToInventory's result in one transaction.
// No breed, age, sex, training or personal equipment is inferred from the images.
export function createBronaCompanions(character, source, now) {
  if (character?.id !== BRONA_COMPANION_OWNER_ID || source?.personId !== BRONA_COMPANION_OWNER_ID) {
    throw new Error('Die Tierbesitzerzuordnung widerspricht Bronas belegter Personen-ID.');
  }
  if (!character.name || !Number.isFinite(Date.parse(now))) throw new Error('Besitzername oder gültiger Planzeitpunkt fehlt.');
  const honigwind = sourceConnection(source, 'Honigwind');
  const brocken = sourceConnection(source, 'Brocken');
  const trivia = source.biographyModule.biography.trivia;
  if (!Array.isArray(trivia) || !trivia.some(text => /Sturmbock namens Brocken/.test(text))
    || !trivia.some(text => /Brocken.*störrisch/.test(text) && /Brona.*loyal/.test(text))) {
    throw new Error('Art und Bindung des Sturmbocks sind in der Biografiequelle nicht belegt.');
  }

  const horseDescription = 'Honigwind ist Bronas Pferd. Rasse, Alter, Geschlecht und besondere Ausbildung sind nicht festgelegt.';
  const horse = createHouseholdCompanion({ profile: 'horse', level: 1, ownerSlug: 'brona', slug: 'honigwind',
    ownerId: character.id, ownerName: character.name, name: 'Honigwind', species: 'Pferd',
    portrait: honigwind.image, location: 'Gwynthor', house: 'Haus Draig', habitat: 'Gwynthor · Celtigerns Wacht',
    description: horseDescription });
  const ramDescription = 'Brocken ist Bronas morgornischer Sturmbock. Er ist ausgesprochen störrisch und lässt sich von Fremden nur schwer führen. Brona gegenüber ist er außerordentlich loyal. Alter und besondere Ausbildung sind nicht festgelegt.';
  const ramOwner = ownerBiography(character, 'Reittier');
  const ramDraft = createCreatureDraft({ id: 'companion-brona-brocken', name: 'Brocken', type: 'Tier', species: 'Sturmbock',
    size: 'Groß', portrait: brocken.image, portraitCaption: `Brocken · ${character.name}`,
    classification: { genus: 'Widder', location: 'Gwynthor', house: 'Haus Draig' }, habitat: 'Gwynthor · Celtigerns Wacht',
    bestiaryReference: { id: 'tiere/besondere/sturmbock' },
    itemOrigin: { instanceId: 'brona-brocken', inventoryItemId: 'brona-brocken', templateId: 'standard:rossmarkt:vieh-sturmbock',
      ownerCharacterId: character.id, ownerCharacterName: character.name, disposition: 'owned' },
    biography: { ...ramOwner, summary: ramDescription,
      personality: 'Ausgesprochen störrisch und für Fremde schwer zu führen; Brona gegenüber außerordentlich loyal.',
      bonds: 'Persönlicher Sturmbock von Brona Eisenherz.',
      facts: [...ramOwner.facts, { label: 'Herkunft', value: 'Morgorn' }] },
    loot: { currency: '', notes: 'Persönlicher Begleiter; kein festgelegter Handelswert.', items: [] },
    notes: `${ramDescription}\n\n${RAM_REVIEW}`, needsStatReview: true, createdAt: now, updatedAt: now });
  // The common sanitizer requires its default row. An empty attack draft is a
  // supported state; unlike equipped:false alone it yields no resolver action.
  // Keep the row identity so future reads do not recreate an authored attack.
  const ram = sanitizeCreature({ ...ramDraft, combatProfile: { ...ramDraft.combatProfile,
    weapons: ramDraft.combatProfile.weapons.map(weapon => ({ ...weapon, name: '', damageFormula: '', equipped: false })) } });

  return [sanitizeCreature({ ...horse, needsStatReview: true, bestiaryReference: null,
    biography: { ...horse.biography, ...ownerBiography(character, 'Reittier'),
      personality: '', bonds: 'Persönliches Pferd von Brona Eisenherz.' },
    notes: `${horseDescription}\n\n${HORSE_REVIEW}`, createdAt: now, updatedAt: now }), ram];
}
