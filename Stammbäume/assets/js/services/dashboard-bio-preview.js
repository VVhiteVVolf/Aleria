import { getPersonBiographyModule } from '../modules/person-biography/person-biography-model.js';

const EXCERPT_MAX_LENGTH = 160;

function truncate(text, maxLength) {
  const trimmed = String(text || '').trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function excerptFrom(biographyModule) {
  const text = biographyModule.biography.biographyText || biographyModule.quote || '';
  return truncate(text, EXCERPT_MAX_LENGTH);
}

// Sammelt eine Vorschau für jede Person, die bereits eine ausgearbeitete Biografie
// besitzt (Freitext oder Zitat) — Personen ohne Biografie oder mit rein technisch
// angelegtem, aber leerem Modul werden übersprungen.
export function collectBiographyPreviews(records) {
  const previews = [];
  (Array.isArray(records) ? records : []).forEach(record => {
    const family = record?.family;
    if (!family) return;
    family.persons.forEach(person => {
      const biographyModule = getPersonBiographyModule(person);
      if (!biographyModule) return;
      const excerpt = excerptFrom(biographyModule);
      if (!excerpt) return;
      previews.push({
        id: `${record.id}::${person.id}`,
        personId: person.id,
        personName: person.name,
        portrait: person.portrait,
        sex: person.sex,
        portraitPlaceholder: person.portraitPlaceholder,
        houseId: record.id,
        houseTitle: record.title || family.document.title,
        excerpt,
        quote: biographyModule.quote,
        quoteBy: biographyModule.quoteBy
      });
    });
  });
  return previews;
}

export function pickBiographySample(records, { count = 2, randomFn = Math.random } = {}) {
  const pool = collectBiographyPreviews(records);
  const working = [...pool];
  const sample = [];
  while (working.length && sample.length < count) {
    const index = Math.floor(randomFn() * working.length);
    sample.push(working.splice(Math.max(0, Math.min(index, working.length - 1)), 1)[0]);
  }
  return sample;
}
