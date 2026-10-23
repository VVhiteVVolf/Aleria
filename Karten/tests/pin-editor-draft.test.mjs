import assert from 'node:assert/strict';

await import('../assets/js/pins/pin-editor-draft.js');

const original = {
  id: 'pin-1',
  title: 'Alter Name',
  table: [{ k: 'Typ', v: 'Stadt' }],
  residentFamilyIds: ['haus-tlawd'],
};
const session = globalThis.KartoPinDraft.create(original);

session.draft().title = 'Neuer Name';
session.draft().table[0].v = 'Hafenstadt';
session.draft().residentFamilyIds.push('haus-penrudd');
assert.deepEqual(original.residentFamilyIds, ['haus-tlawd'], 'Die neue Familienauswahl bleibt bis zur Übernahme im Entwurf.');
assert.equal(original.title, 'Alter Name', 'Der echte Pin darf während der Eingabe nicht verändert werden.');
assert.equal(original.table[0].v, 'Stadt', 'Verschachtelte Daten müssen ebenfalls isoliert bleiben.');
assert.equal(session.isDirty(), true, 'Geänderte Entwürfe müssen als offen markiert werden.');

session.commitInto(original);
assert.equal(original.title, 'Neuer Name');
assert.equal(original.table[0].v, 'Hafenstadt');
assert.deepEqual(original.residentFamilyIds, ['haus-tlawd', 'haus-penrudd']);
assert.equal(session.isDirty(), false, 'Nach dem Übernehmen darf kein offener Entwurf verbleiben.');
session.draft().residentFamilyIds = [];
session.reset();
assert.deepEqual(session.draft().residentFamilyIds, ['haus-tlawd', 'haus-penrudd'], 'Verwerfen stellt feste Familienzuordnungen wieder her.');

const fresh = globalThis.KartoPinDraft.create({ id: 'pin-2', title: 'Neuer Ort' }, { isNew: true });
assert.equal(fresh.isNew(), true);

console.log('Pin-Entwurf: Isolation, Übernahme und Neuanlage geprüft.');
