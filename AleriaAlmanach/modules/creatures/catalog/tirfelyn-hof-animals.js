import { HOF_ANIMALS } from '../../../../shared/tirfelyn-hof/hof-animals.mjs';
import { createHouseholdCompanion } from './household-companion-profiles.js';

export const TIRFELYN_HOF_ANIMALS = HOF_ANIMALS.map(animal => {
  // Reuse the standard dog profile. These are collectively held farm residents,
  // not personal inventory possessions of an invented owner character.
  const { itemOrigin, ...source } = createHouseholdCompanion({
    profile: 'dog', slug: animal.key, ownerSlug: 'tirfelyn-hof', ownerId: '', ownerName: 'Familie Tirfelyn',
    name: animal.name, species: animal.species, level: animal.level, portrait: animal.portrait,
    location: 'Gwynthor', house: 'Familie Tirfelyn', habitat: 'Tirfelyn-Hof · Bannkreis Gwynthor',
    description: animal.bio, bonds: `Hoftier der Familie Tirfelyn. Betreuung: ${animal.caretaker}.`,
    abilities: [[animal.role, animal.key === 'bryn' ? 'Meldet unbekannte Schritte und ungewöhnliche Bewegungen. Kein automatischer Kampfbonus.' : 'Arbeitet nach vertrauten Zeichen ruhig an der Herde. Keine automatische Kontrolle fremder Tiere.']]
  });
  return { ...source, id: animal.id, itemOrigin: null,
    biography: { ...source.biography, facts: [
      { label: 'Alter', value: `${animal.age} Jahre` }, { label: 'Geschlecht', value: animal.gender },
      { label: 'Aufgabe', value: animal.role }, { label: 'Besitz', value: 'Familie Tirfelyn' }, { label: 'Betreuung', value: animal.caretaker }
    ] } };
});
