import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DRACHENTANZ_FORM_IDS as F } from '../modules/combat-styles/drachentanz/drachentanz-ids.js';
import { DRACHENTANZ_COMBAT_STYLE as style } from '../modules/combat-styles/drachentanz/drachentanz-registry.js';
import { getCenyrClassProgression } from '../modules/classes/cenyr/cenyr-class-progression.js';
import { getCenyrLevelUpTrainingChoices, selectCenyrTrainingOption } from '../modules/classes/cenyr/cenyr-class-training.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

test('Aufsteigender Drache follows its actual parent in the catalog and every eligible class page', async () => {
  assert.equal(style.forms.find(form => form.id === F.aufsteigender).parentPathId, F.fliegender);
  assert.equal(style.forms.findIndex(form => form.id === F.aufsteigender), style.forms.findIndex(form => form.id === F.fliegender) + 1);
  for (const classId of ['teulu', 'helwyr', 'arthwyr']) {
    const plan = getCenyrClassProgression(classId, 20, { selectedPathIds: [F.fliegender] });
    const forms = plan.styles.flatMap(style => style.forms);
    const child = forms.find(form => form.id === F.aufsteigender);
    assert.equal(child.requiredPathId, F.fliegender, classId);
    assert.equal(child.requiredPathName, 'Tanz des fliegenden Drachens');
    assert.equal(forms.indexOf(child), forms.findIndex(form => form.id === F.fliegender) + 1, classId);
    const html = await readFile(new URL(`../../Klassenordner/Cenyr/${classId}/index.html`, import.meta.url), 'utf8');
    const displayed = [...html.matchAll(/data-training-form="([^"]+)"/g)].map(match => match[1]);
    assert.equal(displayed.indexOf(F.aufsteigender), displayed.indexOf(F.fliegender) + 1, classId);
    assert(html.includes(`data-parent-path="${F.fliegender}"`));
    assert(html.includes('Unterform von: Tanz des fliegenden Drachens'));
  }
});

test('Ausgeglichener Drache never unlocks the ascending subform; Fliegender Drache does', () => {
  for (const classId of ['teulu', 'helwyr', 'arthwyr']) {
    const base = sanitizeCharacterCombatProfile({ templateSelections: { classId }, progression: { level: 20 } });
    for (const parent of [F.ausgeglichener, F.fliegender]) {
      const selection = selectCenyrTrainingOption(base, { kind: 'path', selectionId: parent, selectedAtLevel: 9 });
      assert(selection.ok);
      const choices = getCenyrLevelUpTrainingChoices(selection.profile, 20).find(group => group.kind === 'path');
      assert.equal(choices.options.some(option => option.id === F.aufsteigender), parent === F.fliegender, classId);
      const child = selectCenyrTrainingOption(selection.profile, { kind: 'path', selectionId: F.aufsteigender, selectedAtLevel: 20 });
      assert.equal(child.ok, parent === F.fliegender, classId);
    }
  }
});
