import { EUDDOGWY, LLEUWEN, ULRICH, ORVAR, FORMLING_PEOPLE } from './formlingssache-people.mjs';

const timestamp = '2026-10-31T00:00:00Z';
const escape = value => value.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const affiliations = new Map([[EUDDOGWY.id, 'Alerische Kirche'], [ULRICH.id, 'Richter des Reinen Blutes'],
  [LLEUWEN.id, 'Gwynthorer Theater'], [ORVAR.id, 'Gwynthorer Theater']]);

export function buildFormlingCharacterExports() {
  return FORMLING_PEOPLE.map(person => {
    const imageSets = (person.appearances || [{ id: 'standard', name: 'Standard', portrait: person.portrait }])
      .map(image => ({ ...image, emotes: [] }));
    const stats = [['Name', person.name], ['Alter', person.age ? `${person.age} Jahre` : 'Wirkt etwa 28 · tatsächliches Alter unbekannt'],
      ['Herkunft', person.origin], ['Tätigkeit', person.role]];
    if (person === EUDDOGWY) stats.push(['Priesterlicher Rang', 'Kurator']);
    if (person === LLEUWEN) stats.push(['Art', 'Formling · Inferniider']);
    const biographyText = person.bio.split('\n\n').map(text => `<p>${escape(text)}</p>`).join('')
      + (person.bestiaryReference ? `<p><a href="${person.bestiaryReference.url}">Artprofil: Formling &amp; Formwandler</a></p>` : '');
    return { type: 'aleria-character', version: 1, exportedAt: timestamp, assignedTab: 'Gwynthor',
      character: { id: person.id, worldPersonId: person.worldPersonId, name: person.name,
        title: person.role, role: person.role, sex: person.sex, race: person.race, birth: person.birth,
        origin: person.origin, currentLocation: person.currentLocation || 'Gwynthor',
        fraktion: affiliations.get(person.id), portrait: person.portrait, bio: person.bio,
        ...(person.bestiaryReference ? { bestiaryReference: person.bestiaryReference } : {}),
        status: 'Lebend', archived: false, createdAt: timestamp, updatedAt: timestamp,
        imageSets, activeImageSetId: person === LLEUWEN ? 'gewahrsam' : 'standard', imageSetSchemaVersion: 1,
        biography: { schema: 'aleria.biography-module', schemaVersion: 1,
          stats: stats.map(([label, value]) => ({ label, value })), quote: '', quoteBy: '',
          biography: { portrait: person.portrait, portraitFit: 'cover', crestImage: '',
            biographyTitle: person.name, biographyText, abilitiesTitle: 'Auftreten', abilities: [],
            worksTitle: 'Tätigkeit', works: [], backgroundTitle: 'Weitere Angaben', backgroundText: '',
            portraitStages: [], portraitCaptions: [] } } } };
  });
}
