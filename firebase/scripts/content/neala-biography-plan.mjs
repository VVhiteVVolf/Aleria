import assert from 'node:assert/strict';
import { createHouseholdCompanion } from '../../../AleriaAlmanach/modules/creatures/catalog/household-companion-profiles.js';
import { sanitizeCreature } from '../../../AleriaAlmanach/modules/creatures/creature-model.js';
import { attachCreatureToInventory } from '../../../AleriaAlmanach/modules/creatures/creature-companion-link.js';
import { sanitizeCharacterBiographyForFirestore, stampFreshRevisions } from '../../../AleriaAlmanach/modules/characters/character-save-guard.js';

export const NEALA_CHARACTER_ID = 'person--haus-wylan--neala-wylan';
const CONNECTION_PORTRAITS = {
  'Arawn Wylan': 'haus-wylan/arawn-wylan',
  'Mervyne Wylan': 'haus-wylan/mervyne-wylan',
  'Liam Wylan': 'haus-wylan/liam-wylan',
  '† Majella Wylan †': 'haus-wylan/majella-wylan',
  'Bedivere Wylan': 'haus-pysgod/bedivere-wylan',
  'Branwen Draig (geb. Gwefrydd)': 'haus-draig/branwen-gwefrydd',
  'Gwendolyn Draig': 'haus-draig/gwendolyn-aderyn'
};
const WORD_REPAIRS = ['Erfah-rung', 'In-teressen', 'Gesand-ten', 'Ausarbei-tung', 'Geleitverein-barungen', 'makel-los',
  'Verhandlungs-führung', 'ritterli-che', 'entsen-det', 'Ritter-stand', 'gewöhn-lich', 'Be-merkungen', 'be-reits',
  'Fä-higkeiten', 'Untergebe-ner', 'wie-derum', 'Herold-samt', 'Persönlich-keiten', 'ver-steht', 'notwen-dig'];
function cleanText(value) {
  let text = String(value || '');
  for (const word of WORD_REPAIRS) text = text.replaceAll(word, word.replace('-', ''));
  return text.replaceAll('beherrschtt', 'beherrscht').replace(/(?<!<br>)<br>(?!<br>)/gi, ' ');
}

export function planNealaBiography(character, assets, now = new Date().toISOString()) {
  assert.equal(character.id, NEALA_CHARACTER_ID);
  const biography = structuredClone(character.biography);
  const bio = biography.biography;
  assert.equal(bio.abilities.length, 6, 'Die aktuellen Eigenschaften müssen vor der Übernahme geprüft werden.');
  bio.biographyTitle = 'Lady Neala Wyrm, geborene Wylan';
  for (const key of ['biographyText', 'historyText']) bio[key] = cleanText(bio[key]);
  for (const key of ['works', 'trivia']) bio[key] = bio[key].map(cleanText);
  bio.extraSections = bio.extraSections.map(section => ({ ...section, title: cleanText(section.title), text: cleanText(section.text) }));
  const icons = ['traitDuty', 'traitPride', 'traitCharm', 'traitPatience', 'traitKindness', 'traitPerfection'];
  bio.abilities = bio.abilities.map((ability, index) => ({ ...ability, title: cleanText(ability.title), detail: cleanText(ability.detail), icon: assets[icons[index]].url }));
  bio.connections = bio.connections.map(connection => {
    if (connection.type === 'heading') return { ...connection, title: connection.title === 'Neue Gruppe' ? 'Freundschaft am Hof' : connection.title };
    if (connection.name === 'Flöckchen') return { ...connection, image: assets.floeckchen.url, detail: 'Ceffyl · Nealas persönliches Reitpferd.' };
    const portrait = CONNECTION_PORTRAITS[connection.name];
    return { ...connection, ...(portrait ? { image: `/Stammbäume/assets/images/portraits/${portrait}.jpg` } : {}),
      detail: cleanText(connection.detail).replace(/^:\s*/, '').replace(/\s*-\s*$/, '') };
  });
  const teacher = bio.connections.findIndex(connection => connection.name === 'Generis Wylan');
  if (teacher >= 0 && !bio.connections.some(connection => connection.type === 'heading' && connection.title === 'Ritterliche Ausbildung')) {
    bio.connections.splice(teacher, 0, { type: 'heading', title: 'Ritterliche Ausbildung', detail: '' });
  }
  bio.portrait = biography.biography.portrait || character.portrait;
  bio.portraitStages = [assets.armor.url, assets.age20.url, assets.age14.url, assets.child.url];
  bio.portraitCaptions = ['Neala Wylan · 1740.', 'In Wylan-Rüstung mit Speer und Flöckchen · 1740.',
    'Mit 20 Jahren · 1713.', 'Mit 14 Jahren · 1707.', 'Mit 8 Jahren · 1701.'];
  bio.documentsTitle = 'Eigentum & Begleitung';
  if (!bio.documents.some(document => document.title === 'Flöckchen')) bio.documents.push({
    title: 'Flöckchen', icon: assets.floeckchen.url, text: 'Ceffyl · Nealas persönliches Reitpferd.', link: '/Bestiarium/tiere/pferde/ceffyl/index.html'
  });
  biography.stats = biography.stats.map(row => ({ ...row,
    value: row.label === 'Vollständiger Name' ? 'Neala Wyrm, geborene Wylan' : row.value.replaceAll('Gesandschaftsmeisterin', 'Gesandtschaftsmeisterin') }));
  const source = createHouseholdCompanion({ profile: 'horse', slug: 'floeckchen', name: 'Flöckchen', ownerSlug: 'neala', ownerId: character.id,
    ownerName: character.name, species: 'Ceffyl-Pferd', level: 3, location: 'Celtigerns Wacht', house: 'Haus Wyrm', habitat: 'Burg Wyrm, Gwynthor, Celtigerns Wacht',
    portrait: assets.floeckchen.url, description: 'Flöckchen ist Nealas persönliches Ceffyl-Reitpferd. Ein kräftiger Brauner mit schwarzer Mähne und schwarzem Schweif, heller Blesse und vier weißen Fesseln. Das braune Sattelzeug hat goldfarbene Beschläge und ein Kreuzmedaillon. Alter und Geschlecht sind noch nicht festgelegt.' });
  const creature = sanitizeCreature({ ...source, bestiaryReference: { id: 'tiere/pferde/ceffyl' },
    biography: { ...source.biography, appearance: 'Braunes Fell, schwarze Mähne und schwarzer Schweif, weiße Blesse und vier weiße Fesseln mit dunklen Hufen. Brauner Ledersattel und Zaum mit goldfarbenen Beschlägen und Kreuzmedaillon.',
      facts: [...source.biography.facts, { label: 'Rasse', value: 'Ceffyl' }, { label: 'Besitzerin', value: character.name }],
      connections: [{ type: 'connection', name: character.name, image: character.portrait, detail: 'Besitzerin und Reiterin.' }] }, createdAt: now, updatedAt: now });
  const inventory = attachCreatureToInventory(character, creature, now);
  const revision = Math.max(Date.parse(now), Number(character.biography?.revision || 0) + 1, Number(character.inventory?.revision || 0) + 1);
  const patch = sanitizeCharacterBiographyForFirestore(stampFreshRevisions({ biography, inventory, updatedAt: now }, ['biography', 'inventory'], revision));
  return { id: character.id, patch, creatures: [creature] };
}
