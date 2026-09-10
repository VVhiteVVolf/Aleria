import test from 'node:test';
import assert from 'node:assert/strict';
import { getCombatFormPresentation } from '../modules/combat-styles/combat-form-presentation.js';
import { getBalanceCatalog } from './support/technique-balance-catalog.mjs';
import { getActionGroups, renderActionOptions } from '../modules/combat/ui/combat-action-card.js';
import { renderActionPicker } from '../modules/combat/ui/combat-action-picker.js';

test('alle 596 Katalogtechniken verwenden stabile Formschlüssel und dieselben Namen unabhängig von gespeicherten Alttexten', () => {
  const entries = getBalanceCatalog();
  const before = structuredClone(entries);
  const labels = new Map();
  for (const entry of entries) {
    const form = getCombatFormPresentation(entry);
    assert.ok(form?.label && form.key.includes(entry.combatStyleFormId), entry.id);
    const previous = labels.get(form.key);
    if (previous) assert.equal(form.label, previous, entry.id);
    labels.set(form.key, form.label);
    assert.deepEqual(getCombatFormPresentation({ ...entry, trainingForm: 'Überholte Bezeichnung' }), form);
  }
  assert.equal(entries.length, 596);
  assert.equal(labels.size, 36);
  assert.deepEqual(entries, before, 'Anzeige verändert keine Regeln oder gespeicherten Texte');
});

test('alte und neue Jungdrachen-Techniken erscheinen in beiden Auswahlansichten genau einmal unter einer Form', () => {
  const techniques = getBalanceCatalog().filter(entry => entry.combatStyleFormId === 'drachentanz-form-i-jungdrache'
    && entry.cenyrTraining?.allowedClassIds?.includes('teulu'));
  assert.equal(techniques.length, 10);
  const actor = { techniques, actions: techniques.map(entry => ({ id: `technique:${entry.id}`, sourceId: entry.id, kind: 'technique', name: entry.name })) };
  const groups = getActionGroups(actor);
  assert.equal(groups.size, 1);
  assert.equal([...groups.values()][0].length, 10);
  assert.equal((renderActionOptions(actor).match(/<optgroup /g) || []).length, 1);
  const picker = renderActionPicker(actor);
  assert.equal((picker.match(/data-combat-action-group>/g) || []).length, 1);
  for (const action of actor.actions) assert.equal(picker.split(`data-combat-action-option="${action.id}"`).length - 1, 1);
});

test('unterschiedliche eigene Formen werden trotz gleicher Beschriftung nicht anhand ihres Namens zusammengeführt', () => {
  const techniques = ['form-a', 'form-b'].map(id => ({ id, name: id, combatStyleId: 'custom', combatStyleFormId: id, trainingForm: 'Eigene Form' }));
  const actor = { techniques, actions: techniques.map(entry => ({ id: entry.id, sourceId: entry.id, kind: 'technique' })) };
  assert.equal(getActionGroups(actor).size, 2);
  assert.equal(getCombatFormPresentation(techniques[0]).label, 'Eigene Form');
});

test('Freitextformen und nicht zugeordnete Einträge bleiben nutzbar; fremde Stil-IDs werden nicht umgedeutet', () => {
  assert.equal(getCombatFormPresentation({}), null);
  assert.equal(getCombatFormPresentation({ trainingForm: 'Meine Ausbildung' }).label, 'Meine Ausbildung');
  assert.equal(getCombatFormPresentation({ combatStyleFormName: 'Rapierunterricht' }).label, 'Rapierunterricht');
  assert.equal(getCombatFormPresentation({ combatStyleId: 'eigener-stil', combatStyleFormId: 'drachentanz-form-i-jungdrache', trainingForm: 'Eigene Variante' }).label, 'Eigene Variante');
});
