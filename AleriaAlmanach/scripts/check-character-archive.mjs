import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  createCharacterArchiveProfileItem,
  extractCharacterArchiveEntries,
  extractItemRegisterArchiveEntries,
  mergeCharacterArchiveEntries,
  normalizeCharacterArchiveEntry
} from '../modules/character-archive/character-archive-model.js';
import {
  getCharacterArchiveEntryIconPresentation,
  getCharacterSheetEntryIconPresentation
} from '../modules/character-archive/character-archive-icons.js';
import { getCharacterArchiveAttackGroups } from '../modules/character-archive/character-archive-attack-groups.js';
import {
  getClassPageIconAliases,
  getClassPageIconEntries,
  getClassPageIconSource
} from '../modules/classes/class-icon-registry.js';
import { CHARACTER_CLASS_TEMPLATES } from '../modules/combat/character-creation-templates.js';
import { getCombatEntryIconPresentation } from '../modules/combat/combat-entry-icons.js';

const source = {
  id: 'test-figure',
  name: 'Testfigur',
  origin: 'Celtigerns Wacht',
  combatProfile: {
    identity: { ancestry: 'Cenyr', archetype: 'Teulu', background: 'Ritter' },
    weapons: [{ id: 'sword', name: 'Drachenzahn', damageFormula: '1d10', damageType: 'Hieb' }],
    techniques: [{ id: 'bite', name: 'Biss des Drachen', trainingForm: 'Drachentanz', description: 'Ein präziser Hieb.' }],
    quirks: [{ id: 'brave', name: 'Tapfer', type: 'trait', description: 'Weicht selten zurück.' }],
    conditions: [{ id: 'blessed', name: 'Gesegnet', duration: 'Eine Szene' }],
    abilities: [{ id: 'command', name: 'Befehlsruf', description: 'Sammelt Verbündete.' }],
    skills: [{ id: 'religion', name: 'Religion', attributeKey: 'intelligence' }],
    magic: { spells: [{ id: 'light', name: 'Licht', level: 0, description: 'Erzeugt Licht.' }] }
  }
};

const extracted = extractCharacterArchiveEntries(source);
const extractedKinds = new Set(extracted.map(entry => entry.kind));
for (const expected of ['spell', 'trait', 'ability', 'technique', 'attack', 'condition', 'skill', 'combat-style', 'class', 'ancestry', 'background', 'origin']) {
  assert(extractedKinds.has(expected), `Archivbereich fehlt: ${expected}`);
}
const extractedTechnique = extracted.find(entry => entry.kind === 'technique');
const attackGroups = getCharacterArchiveAttackGroups([extractedTechnique], extracted);
assert.equal(attackGroups[0].type, 'combat-form', 'Eine Attacke mit trainingForm muss unter ihrer Kampfform stehen.');
assert.equal(attackGroups[0].name, 'Drachentanz');

const liveSpell = extracted.find(entry => entry.kind === 'spell');
const builtinSpell = normalizeCharacterArchiveEntry({
  id: 'builtin--spell--licht',
  kind: 'spell',
  name: 'Licht',
  builtin: true,
  sources: [{ kind: 'system', id: 'magic', name: 'Aleria-Regelvorlagen' }]
});
const builtinWithUsage = mergeCharacterArchiveEntries(builtinSpell, liveSpell)[0];
assert.equal(builtinWithUsage.builtin, true, 'Die bloße Verwendung einer Regelvorlage darf sie nicht als eigene Anpassung markieren.');
assert.equal(builtinWithUsage.sources.length, 2, 'Vorlagen- und Figurenquelle müssen gemeinsam erhalten bleiben.');
const editedSpell = normalizeCharacterArchiveEntry({
  ...liveSpell,
  id: 'spell--licht',
  iconOverride: '../IconOrdner/Magie/Kerzenlicht.PNG',
  updatedAt: '2026-08-09T00:00:00.000Z',
  builtin: false
});
const mergedSpell = mergeCharacterArchiveEntries(liveSpell, editedSpell)[0];
assert.equal(mergedSpell.icon, '../IconOrdner/Magie/Kerzenlicht.PNG');
assert.equal(mergedSpell.sources.length, 1, 'Quellen dürfen beim Zusammenführen nicht dupliziert werden.');

const copiedSpell = createCharacterArchiveProfileItem(mergedSpell, 'magic.spells');
assert.equal(copiedSpell.name, 'Licht');
assert.notEqual(copiedSpell.id, liveSpell.data.id, 'Übernommene Archiveinträge brauchen eine neue Instanz-ID.');

const conditionData = { name: 'Brennend', description: 'Feuerschaden über Zeit.' };
const sheetConditionIcon = getCombatEntryIconPresentation('condition', conditionData);
const archiveConditionIcon = getCharacterArchiveEntryIconPresentation({ kind: 'condition', data: conditionData });
assert.equal(archiveConditionIcon.source, sheetConditionIcon.source, 'Archiv und Charakterbogen müssen für Zustände dasselbe Icon auflösen.');
assert.equal(archiveConditionIcon.fallbackSource, sheetConditionIcon.fallbackSource);

const customSpellIcon = '../IconOrdner/Zauber Icons/Oblivion Style/OB-icon-Light.png';
const sheetCustomSpellIcon = getCombatEntryIconPresentation('spell', { ...liveSpell.data, icon: customSpellIcon });
const archiveCustomSpellIcon = getCharacterArchiveEntryIconPresentation({ ...liveSpell, iconOverride: customSpellIcon, icon: customSpellIcon });
assert.equal(archiveCustomSpellIcon.source, sheetCustomSpellIcon.source, 'Manuelle Archivicons müssen unverändert im Charakterbogen ankommen.');
const linkedCustomSpellIcon = getCharacterSheetEntryIconPresentation(
  'spell',
  { ...liveSpell.data, icon: '' },
  [{ ...liveSpell, iconOverride: customSpellIcon, icon: customSpellIcon }]
);
assert.equal(linkedCustomSpellIcon.source, customSpellIcon, 'Der Charakterbogen muss das aktuelle Icon des verknüpften Archiveintrags verwenden.');
assert.equal(linkedCustomSpellIcon.linked, true);

const classIconEntries = getClassPageIconEntries();
assert.equal(classIconEntries.length, CHARACTER_CLASS_TEMPLATES.length, 'Jede verwendete Charakterklasse braucht ein Icon aus der Klassenseite.');
CHARACTER_CLASS_TEMPLATES.forEach(template => {
  assert.match(getClassPageIconSource(template.id), /^https:\/\/i\.imgur\.com\//, `Klassenicon fehlt: ${template.label}`);
});
getClassPageIconAliases().forEach(alias => {
  assert.match(alias.source, /^https:\/\/i\.imgur\.com\//, `Legacy-Klassenicon fehlt: ${alias.id}`);
});

globalThis.itemDbBuildIndex = () => [
  { canonicalKey: 'pferde:testross', title: 'Testross', category: 'pferde', categoryLabel: 'Pferde', type: 'Reitpferd', description: 'Ein Test-Pferd.', price: '500', currency: 'Taler', image: '', tags: ['Pferd'] },
  { canonicalKey: 'waffen:testschwert', title: 'Testschwert', category: 'waffen', categoryLabel: 'Waffen', type: 'Schwert', description: '', price: '10', currency: 'Gold', image: '', tags: [] },
  { canonicalKey: 'ruestungen:testharnisch', title: 'Testharnisch', category: 'ruestungen', categoryLabel: 'Rüstungen', type: '', description: '', price: '', currency: '', image: '', tags: [] }
];
const registerEntries = extractItemRegisterArchiveEntries();
assert.equal(registerEntries.length, 2, 'Nur die verknuepften Registerkategorien duerfen als Archivbereiche erscheinen.');
assert(registerEntries.some(entry => entry.kind === 'register-pferde' && entry.name === 'Testross'), 'Pferde-Registereintraege muessen im Archiv landen.');
assert(registerEntries.some(entry => entry.kind === 'register-waffen' && entry.name === 'Testschwert'), 'Waffen-Registereintraege muessen im Archiv landen.');
assert(!registerEntries.some(entry => entry.name === 'Testharnisch'), 'Nicht angeforderte Registerkategorien (z.B. Ruestungen) duerfen nicht auftauchen.');
delete globalThis.itemDbBuildIndex;
assert.deepEqual(extractItemRegisterArchiveEntries(), [], 'Ohne geladenes Item-Register darf die Extraktion nicht werfen.');

const [html, sidebar, rules, css, classPage, itemDbNormalizer] = await Promise.all([
  readFile(new URL('../AleriaAlmanach.html', import.meta.url), 'utf8'),
  readFile(new URL('../modules/sidebar/sidebar-registers.js', import.meta.url), 'utf8'),
  readFile(new URL('../../firebase/firestore.rules', import.meta.url), 'utf8'),
  readFile(new URL('../styles/character-archive.css', import.meta.url), 'utf8'),
  readFile(new URL('../../Klassenordner/Klassenseite.html', import.meta.url), 'utf8'),
  readFile(new URL('../modules/item-database/item-db-normalizer.js', import.meta.url), 'utf8')
]);
assert.match(html, /character-archive-ui\.js/);
assert.match(html, /character-archive\.css/);
assert.match(sidebar, /Charakterbogen Archiv/);
assert.match(sidebar, /Platzhalter\.png/);
assert.match(rules, /character_archive_entries/);
assert.match(css, /\.character-archive-grid/);
assert.match(css, /\.character-archive-attack-group/);
classIconEntries.forEach(entry => assert(classPage.includes(entry.source), `Iconquelle fehlt auf der Klassenseite: ${entry.pageName}`));
['pferde', 'vieh', 'alchemie', 'speisen', 'arkanes', 'waffen'].forEach(categoryId => {
  assert.match(itemDbNormalizer, new RegExp(`id:\\s*'${categoryId}'`), `Inventar-Register-Kategorie fehlt oder wurde umbenannt: ${categoryId}`);
});

console.log(`Charakterbogen-Archiv OK: ${extracted.length} Datenarten, ${registerEntries.length} Register-Testeintraege, Attackengruppen, Sidebar, Styles und Firestore-Anbindung vorhanden.`);
