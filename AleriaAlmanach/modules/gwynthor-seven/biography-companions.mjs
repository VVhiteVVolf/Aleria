import { createHouseholdCompanion } from '../creatures/catalog/household-companion-profiles.js';
import { sanitizeCreature } from '../creatures/creature-model.js';
import { BIOGRAPHY_ART_ROOT } from './biography-content.mjs';

const COMPANIONS = Object.freeze({
  'person--haus-wyrm--rianna-wyrm': [
    { profile: 'cat', slug: 'sir-fressbert', ownerSlug: 'rianna', name: 'Sir Fressbert', species: 'Cenyric-Kater',
      image: 'sir-fressbert.png', bestiaryId: 'tiere/vieh/haustiere/katzen/cenyric', sex: 'Kater',
      description: 'Rianna Wyrms Kater Sir Fressbert verbringt die meiste Zeit faul zu Hause. Seine Bildgestaltung zeigt einen gut genährten, rotgetigerten Cenyric mit hellem Fang und heller Brust auf einem goldgelben Kissen. Alter und besondere Ausbildung sind nicht festgelegt.' },
    { profile: 'horse', slug: 'goldloeckchen', ownerSlug: 'rianna', name: 'Goldlöckchen', species: 'Goldmähne',
      image: 'goldloeckchen.png', bestiaryId: 'tiere/pferde/goldmaehne', sex: 'Stute',
      description: 'Goldlöckchen ist Rianna Wyrms Goldmähnen-Stute. Rhydian Wyrm besorgte sie für seine Tochter. Edles weißes Fell und eine voluminöse, lockige goldene Mähne prägen ihre Erscheinung; die Sattelung trägt Schwarz und Gold sowie den schwarzen Drachen des Hauses Wyrm. Ihr Alter ist nicht festgelegt.' }
  ],
  'person--haus-gafyr--lefraye-gafyr': [
    { profile: 'songbird', slug: 'agravaine', ownerSlug: 'lefraye', name: 'Agravaine', species: 'Mwyalchen-Drossel',
      image: 'agravaine-vain.png', bestiaryId: 'tiere/flugwesen/mwyalchen-drossel', sex: '',
      description: 'Agravaine, kurz Vain, ist Lefraye Gafyrs Mwyalchen-Drossel. Benannt ist der Singvogel nach Agravaine, dem Gründervater des Hauses Mwyalchen. Die Bildgestaltung greift dessen schwarzes Vogelmotiv auf. Alter und Geschlecht sind nicht festgelegt; Vain ist kein abgerichteter Greifvogel.' },
    { profile: 'horse', slug: 'thalena', ownerSlug: 'lefraye', name: 'Thalena', species: 'Farnschritt',
      image: 'thalena.png', bestiaryId: 'tiere/pferde/zuchtbuch/farnschritt', sex: 'Stute',
      description: 'Thalena ist Lefraye Gafyrs Stute aus Tirashan und Rhyfel. Diese benannte Kreuzung heißt Farnschritt. Ihr Name erinnert an Thalena, die Gründermutter des Hauses Mwyalchen. Die Bildgestaltung zeigt eine kräftige, geländegängige dunkelbraune Stute mit schwarzer Mähne, schwarzem Schweif und kleinem weißem Stirnstern; ihr Sattelzeug trägt die Farben und das Ziegenpaar des Hauses Gafyr. Ihr Alter ist nicht festgelegt.' }
  ]
});

export function createGwynthorBiographyCompanions(character, now) {
  const house = character.id === 'person--haus-wyrm--rianna-wyrm' ? 'Haus Wyrm' : 'Haus Gafyr';
  return (COMPANIONS[character.id] || []).map(spec => {
    const source = createHouseholdCompanion({ ...spec, level: 1, ownerId: character.id, ownerName: character.name,
      location: 'Gwynthor', house, habitat: `${house}, Gwynthor, Celtigerns Wacht`,
      portrait: BIOGRAPHY_ART_ROOT + spec.image });
    const creature = sanitizeCreature({ ...source, bestiaryReference: { id: spec.bestiaryId },
      biography: { ...source.biography, facts: [...source.biography.facts,
        { label: 'Besitzerin', value: character.name }, ...(spec.sex ? [{ label: 'Geschlecht', value: spec.sex }] : [])],
        connections: [{ type: 'connection', name: character.name, image: character.portrait, detail: 'Besitzerin und vertraute Begleiterin.' }] },
      createdAt: now, updatedAt: now });
    if (!creature.bestiaryReference) throw new Error(`Bestiarium-Verweis fehlt: ${spec.name}`);
    return creature;
  });
}
