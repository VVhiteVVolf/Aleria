import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeCharacterArchiveEntry as entry, mergeCharacterArchiveEntries as merge, createCharacterArchiveProfileItem } from '../modules/character-archive/character-archive-model.js';
import { loadBuiltinCharacterArchiveEntries } from '../modules/character-archive/character-archive-catalog.js';
import { createArchiveMountEntry, classifyCharacterArchiveEntries } from '../modules/character-archive/character-archive-classification.js';
import { ARCHIVE_PAGE_MOUNTS } from '../modules/character-archive/character-archive-page-data.js';
import { getCharacterArchiveAttackGroups } from '../modules/character-archive/character-archive-attack-groups.js';
import { getCharacterArchiveEntryIconPresentation, getCharacterSheetEntryIconPresentation } from '../modules/character-archive/character-archive-icons.js';
import { isArchiveWeapon } from '../modules/character-archive/character-archive-weapon-groups.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { getSirenentanzBasicTechniques } from '../modules/combat-styles/sirenentanz/sirenentanz-basic-techniques.js';
import { getSirenentanzExpertTechniques } from '../modules/combat-styles/sirenentanz/sirenentanz-expert-techniques.js';
import { loadPublicCharacterLibrarySources } from '../tools/character-library/public-character-library-source.mjs';
import { REVIEWED_CHARACTER_TRAITS } from '../modules/character-trait-review/reviewed-character-traits.js';

const fetchBefore = globalThis.fetch;
globalThis.fetch = async url => ({ ok: true, json: async () => JSON.parse(await readFile(url, 'utf8')) });
const catalog = await loadBuiltinCharacterArchiveEntries();
globalThis.fetch = fetchBefore;

test('canonical form and technique identities never collapse different entries with the same label', () => {
  const a = entry({ kind: 'technique', name: 'Gleiche Technik', data: { id: 'combat-style-drachentanz-first', combatStyleFormId: 'first' } });
  const b = entry({ kind: 'technique', name: a.name, data: { id: 'combat-style-drachentanz-second', combatStyleFormId: 'second' } });
  const copy = entry({ kind: 'technique', name: 'Alter Name', data: { id: 'copied-instance', catalogTechniqueId: a.data.id } });
  assert.notEqual(a.id, b.id);
  assert.equal(merge(a, b, copy).length, 2);
  assert.equal(merge(a, b, copy).find(value => value.key === a.key).data.combatStyleFormId, 'first');
  assert.equal(merge(['one', 'two'].map(id => entry({ kind: 'combat-style', name: 'Grundform', data: { id } }))).length, 2);
});

test('breed identity is stable before register loading, while offers and owned horses remain independent', () => {
  const horse = STANDARD_ITEMS.find(item => item.mountId === 'afol');
  const mount = createArchiveMountEntry(ARCHIVE_PAGE_MOUNTS.find(item => item.id === horse.mountId));
  const standard = entry({ kind: 'register-pferde', name: horse.title, data: horse, builtin: true });
  const offer = entry({ kind: standard.kind, name: horse.title, data: { ...horse, id: 'offer:afol', section: 'offer' } });
  const owned = entry({ kind: standard.kind, name: horse.title, data: { ...horse, id: 'owned:horse', section: 'owned' } });
  const before = structuredClone([mount, standard, offer, owned]);
  const actual = merge(classifyCharacterArchiveEntries([mount, standard, offer, owned]));
  assert.equal(actual.length, 3);
  assert.equal(mount.key, standard.key);
  assert.equal(actual.find(value => value.data.id === owned.data.id).data.section, 'owned');
  assert.deepEqual([mount, standard, offer, owned], before);
  assert.equal(catalog.filter(value => value.kind === 'register-pferde' && value.name === 'Afol').length, 1);
});

test('weapon standards remain separate from class and personal weapons of the same name', () => {
  const personal = entry({ kind: 'attack', name: 'Säbel', data: { id: 'personal', weaponType: 'sword', damageBonus: 2 } });
  const standard = entry({ kind: 'attack', name: 'Säbel', data: { archiveStandardWeaponId: 'standard:sabre', weaponType: 'sword' } });
  assert.equal(merge(personal, standard).length, 2);
  assert.equal(isArchiveWeapon({ ...standard, name: 'Klauen' }), true);
  assert.equal(isArchiveWeapon({ kind: 'attack', name: 'Klauen', data: { weaponType: 'natural' } }), false);
  assert.ok(catalog.every(value => value.id.length <= 180), 'Firebase archive ID limit');
});

test('all confirmed Vennyr purchase techniques appear under the correct class and form', () => {
  const techniques = catalog.filter(value => value.kind === 'technique');
  const ids = new Set(techniques.map(value => value.data.id));
  for (const classId of ['morwyr', 'rhyfelwyr', 'ceidwyn', 'rhiddwyr', 'milwr']) {
    const expected = [...getSirenentanzBasicTechniques(classId), ...getSirenentanzExpertTechniques(classId)];
    assert.ok(expected.every(value => ids.has(value.id)), classId);
    const sample = techniques.find(value => value.data.id === expected.at(-1).id);
    const groups = getCharacterArchiveAttackGroups([sample], catalog);
    assert.equal(groups.length, 1, classId);
    assert.ok(groups[0].name.toLowerCase().startsWith(classId), classId);
    assert.equal(groups[0].children[0].name, 'Wyrmtanz');
  }
});

test('ancestry aliases use canonical culture art and skill aliases use the actual skill icon', () => {
  const ancestry = classifyCharacterArchiveEntries([entry({ kind: 'ancestry', name: 'Cenyri', data: { id: 'old-cenyri' } })])[0];
  assert.equal(ancestry.data.id, 'cenyr');
  assert.ok(getCharacterArchiveEntryIconPresentation(ancestry).source);
  assert.match(getCharacterArchiveEntryIconPresentation({ kind: 'skill', name: 'Überzeugen' }).source, /persuasion-v1\.webp$/);
  assert.equal(getCharacterArchiveEntryIconPresentation({ kind: 'skill', name: 'Überzeugen', iconOverride: '/mine.png' }).source, '/mine.png');
  const skills = merge(classifyCharacterArchiveEntries(['Überreden', 'Überzeugen'].map(name => entry({ kind: 'skill', name, data: { name } }))));
  assert.equal(skills.length, 1);
  assert.equal(skills[0].name, 'Überzeugen');
});

test('the public library reads only confirmed current records and never touches an unknown private record', async () => {
  const records = new Map(REVIEWED_CHARACTER_TRAITS.map((assignment, index) => [`records/public/${index}/character.json`, {
    character: { id: assignment.id, name: assignment.name, combatProfile: { progression: { level: 1, development: { mode: 'purchase' } }, templateSelections: { classId: 'teulu' }, abilities: [], techniques: [], quirks: [] } }
  }]));
  const snapshot = { characters: [...REVIEWED_CHARACTER_TRAITS.map((assignment, index) => ({ id: assignment.id, localRecord: { path: `records/public/${index}/character.json` } })),
    { id: 'private-unlisted', localRecord: { path: 'records/private/character.json' } }] };
  const before = structuredClone([...records.values()]);
  const reads = [];
  const sources = await loadPublicCharacterLibrarySources({ root: new URL('file:///C:/fixture/'), readJson: async url => {
    const path = decodeURI(url.pathname);
    if (path.endsWith('characters.snapshot.json')) return snapshot;
    const key = path.split('/CharakterDatenbank/')[1];
    reads.push(key);
    assert.ok(records.has(key), 'Unlisted record must not be loaded');
    return records.get(key);
  } });
  assert.equal(sources.length, 14);
  assert.equal(reads.length, 14);
  assert.deepEqual([...records.values()], before);
});

test('generated library contains current public abilities, preserving Gafyr identity and retired Gawain corrections', async () => {
  const library = JSON.parse(await readFile(new URL('../data/spell-attack-library.json', import.meta.url), 'utf8'));
  assert.equal(library.sourceRecords.length, 14);
  assert.ok(library.allTechniques.some(value => value.sourceCharacter === 'Nudd Saethwyr'));
  assert.ok(!library.allTechniques.some(value => value.id === 'gawain-muttersoehnchen'));
  const signet = library.allTechniques.find(value => value.id === 'gildas-gafyr-draig-knight-signet');
  assert.match(`${signet.description} ${signet.requirements}`, /Gafyr/);
  assert.doesNotMatch(`${signet.name} ${signet.description} ${signet.requirements}`, /Draig/);
  assert.ok([...library.allTechniques, ...library.allSpells].every(value => !/^(?:file:|[A-Za-z]:[\\/])/.test(String(value.icon || ''))));
});

test('personal abilities retain stable identity and their actual owner through archive and sheet copies', () => {
  const freya = { id: 'ksJQe8Ai4KbRE9jOAvb7', name: 'Freya Skald' };
  const gawain = { id: 'q1QtSIug74FzzwUAqWrs', name: 'Gawain Draig' };
  const original = catalog.find(value => value.kind === 'ability' && value.data.id === 'freya-arkaner-schrei');
  assert.ok(original);
  assert.equal(original.data.sourceCharacterId, freya.id);
  assert.match(original.icon, /^\/AleriaAlmanach\/public\/assets\/ability-icons\/freya-arkaner-schrei\.png$/);
  const copied = createCharacterArchiveProfileItem(original);
  assert.notEqual(copied.id, original.data.id);
  assert.equal(copied.catalogAbilityId, original.data.id);
  assert.equal(copied.icon, original.icon);
  assert.ok(!copied.sourceCharacterId);
  assert.equal(entry({ kind: 'ability', data: copied }).key, original.key);
  const foreign = entry({ kind: 'ability', name: original.name, data: { id: 'someone-elses-cry', icon: '/foreign.png' },
    sources: [{ kind: 'character-library', id: 'teulu', name: gawain.name }] });
  assert.equal(merge(original, foreign).length, 2, 'Equal labels never merge different personal abilities');
  assert.equal(getCharacterSheetEntryIconPresentation('ability', original.data, [foreign], freya).source, original.icon);
  const sameIdForeignOwner = { ...original, sources: [{ kind: 'character-library', id: 'teulu', name: gawain.name }],
    data: { ...original.data, sourceCharacter: gawain.name, sourceCharacterId: gawain.id }, icon: '/foreign.png' };
  assert.equal(getCharacterSheetEntryIconPresentation('ability', original.data, [sameIdForeignOwner], freya).source, original.icon);
  assert.equal(getCharacterSheetEntryIconPresentation('ability', { ...original.data, icon: '/custom.png' }, [], freya).source, '/custom.png');
  const shared = name => entry({ kind: 'ability', name, data: { id: 'martial-durchschnaufen' } });
  assert.equal(merge(shared('Durchschnaufen'), shared('Alter Name')).length, 1);
});
