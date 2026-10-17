import assert from 'node:assert/strict';
import { getRegisteredFamily } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyCandidates, buildImportedCharacter } from '../../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { sanitizeCharacterBiographyForFirestore, stampFreshRevisions } from '../../../AleriaAlmanach/modules/characters/character-save-guard.js';
import { buildFreyaFamilyContext, FREYA_CHARACTER_ID, FREYA_WORLD_ID } from './freya-family-context.mjs';
import { FREYA_PROSE, FREYA_TRAITS } from './freya-biography-content.mjs';

export { FREYA_CHARACTER_ID };
export const FREYA_ACADEMY_LINK = '/Fraktionen/index.html#fraktion-skaldenakademie-klangheim';
export const FREYA_BIOGRAPHY_FIELDS = ['biography', 'identity', 'genealogy', 'updatedAt'];
const GROUP_ORDER = ['Fenrir – Bester Freund & Love Interest', 'Eltern', 'Geschwister', 'Großeltern',
  'Familie Skald – Tanten und Onkel', 'Familie Eisenjungfer – Tanten und Onkel',
  'Cousinen und Cousins – Skald und verbundene Clans', 'Cousinen und Cousins – Eisenjungfer', 'Fenrirs Familie'];
const GROUP_TITLES = {
  'Fenrir – Bester Freund & Love Interest': 'Fenrir · Love Interest',
  'Familie Skald – Tanten und Onkel': 'Tanten & Onkel · Skald',
  'Familie Eisenjungfer – Tanten und Onkel': 'Tanten & Onkel · Eisenjungfer',
  'Cousinen und Cousins – Skald und verbundene Clans': 'Cousins · Skald',
  'Cousinen und Cousins – Eisenjungfer': 'Cousins · Eisenjungfer'
};

export function planFreyaBiography(character, assets, now = new Date().toISOString()) {
  assert.equal(character.id, FREYA_CHARACTER_ID);
  assert(!character.identity?.worldPersonId || character.identity.worldPersonId === FREYA_WORLD_ID, 'Abweichende Stammbaumidentität.');
  const context = buildFreyaFamilyContext();
  const connections = GROUP_ORDER.flatMap(group => [
    { type: 'heading', title: GROUP_TITLES[group] || group, detail: '' },
    ...context.connections.filter(person => person.group === group).map(person => ({ type: 'connection',
      name: person.name, detail: person.detail, image: person.image, imageFormat: person.imageFormat }))
  ]);
  connections.push({ type: 'heading', title: 'Ausbildung', detail: '' },
    { type: 'connection', name: 'Skaldenakademie von Klangheim', image: assets.academy.url, imageFormat: 'square',
      detail: 'Ausbildung zur Skaldin in Musik und Magie bei verschiedenen Dozenten und Lehrmeistern.' },
    { type: 'heading', title: 'Tierische Begleitung', detail: '' },
    { type: 'connection', name: 'Eldfaxi', image: assets.eldfaxi.url, imageFormat: 'portrait',
      detail: 'Fröhliche Hest-Mix-Stute; seit mehr als sechs Jahren Freyas Reisegefährtin und gelegentliche Duettpartnerin.' });
  const biography = { schema: 'aleria.biography-module', schemaVersion: 1,
    stats: Object.entries({ 'Vollständiger Name': 'Freya Skald', Clan: 'Clan Skald', 'Geboren / Alter': '1720 · 20 Jahre (1740)',
      Herkunft: 'Klangheim, Skaldenheim · Roriksheim, Aldrimar', Berufung: 'Skaldin, Künstlerin und Magiekundige',
      Vater: 'Ragnar Skald', Mutter: 'Lagertha Eisenjungfer', Ausbildung: 'Skaldenakademie von Klangheim',
      Lieblingsinstrument: 'Laute', Reisegefährtin: 'Eldfaxi · Hest-Mix-Stute', 'Besondere Bindung': 'Fenrir Varulv · bester Freund und Love Interest' })
      .map(([label, value]) => ({ label, value })),
    quote: '', quoteBy: '', biography: { ...structuredClone(FREYA_PROSE),
      portrait: assets.standard.url, portraitFit: 'contain',
      portraitStages: [assets.armor.url, assets.age15.url, assets.child.url, ''],
      portraitCaptions: ['Freya Skald · 1740.', 'Als Schildmaid mit Eldfaxi · 1740.', 'Als junge Bardin mit 15 Jahren · 1735.',
        'Freya mit 6 und Fenrir mit 8 Jahren · 1726.', ''],
      sideWidth: 100, connectionPortraitHeight: 68, connectionTextOffset: 0,
      abilities: FREYA_TRAITS.map(({ icon, ...trait }) => ({ ...trait, icon: assets[`trait${icon}`].url })), connections,
      documents: [
        { title: 'Skaldenakademie von Klangheim', icon: assets.academy.url, text: 'Institut für skaldische Musik und Magie; Freyas Ausbildungsstätte.', link: FREYA_ACADEMY_LINK },
        ...['haus-skald', 'haus-eisenjungfer', 'haus-varulv'].map(id => {
          const record = getRegisteredFamily(id);
          return { title: record.title, icon: '/Stammbäume/' + record.family.document.emblem,
            text: id === 'haus-skald' ? 'Väterliche Familie und Freyas Stammbaumeintrag.' : id === 'haus-eisenjungfer' ? 'Mütterliche Familie um Lagertha und Hervor.' : 'Fenrirs Familie und die Verbindung über Antje Skald.',
            link: `/Stammbäume/Stammbaum.html?family=${id}&mode=view${id === 'haus-skald' ? '&person=freya-skald' : ''}` };
        })
      ]
    } };
  const candidate = createFamilyCandidates(getRegisteredFamily('haus-skald')).find(person => person.worldPersonId === FREYA_WORLD_ID);
  assert(candidate, 'Freyas Stammbaumeintrag fehlt.');
  const { identity, genealogy } = buildImportedCharacter(candidate, character, now);
  const revision = Math.max(Date.parse(now), Number(character.biography?.revision || 0) + 1);
  const patch = sanitizeCharacterBiographyForFirestore(stampFreshRevisions({ biography, identity, genealogy, updatedAt: now }, ['biography'], revision));
  return { id: character.id, patch, creatures: [] };
}
