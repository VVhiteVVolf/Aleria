import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { ADMINISTRATION_ROLE_BRIEFS, administrationRoleBrief } from '../modules/administration/administration-role-briefs.mjs';
import { dutyIcon, OFFICE_DUTY_ICONS } from '../modules/administration/office-duty-icons.mjs';
import { withVassals } from '../modules/administration/administration-model.mjs';
import vassals from '../modules/administration/data/celtigerns-vassals.generated.mjs';

test('Jedes ausgearbeitete Grafschaftsamt besitzt eigene Erläuterungen und drei bis fünf Kernaufgaben', async () => {
  for (const [areaId, catalog] of Object.entries(ADMINISTRATION_ROLE_BRIEFS)) {
    const { default: source } = await import(`../modules/administration/data/celtigerns-${areaId}.mjs`);
    for (const group of source.groups.filter(group => group.kind !== 'vassals')) {
      for (const role of group.roles) {
        assert.ok(catalog[role.id], `${areaId}/${role.id}: eigene Beschreibung fehlt`);
        const details = administrationRoleBrief({ role, group, area: source });
        assert.ok(details.practice.length > 180, `${areaId}/${role.id}`);
        assert.ok(details.duties.length >= 3 && details.duties.length <= 5);
        assert.equal(new Set(details.duties.map(duty => duty.text)).size, details.duties.length);
        for (const duty of details.duties) assert.ok(OFFICE_DUTY_ICONS[duty.icon]);
      }
    }
  }
});

test('Alle Vasallen erhalten fachlich passende Aufgaben ohne Änderung ihrer Besetzung oder Quellen', async () => {
  for (const areaId of Object.keys(ADMINISTRATION_ROLE_BRIEFS)) {
    const { default: source } = await import(`../modules/administration/data/celtigerns-${areaId}.mjs`);
    const area = withVassals(source, vassals);
    const group = area.groups.find(group => group.kind === 'vassals');
    for (const role of group.roles) {
      const original = structuredClone(role);
      const details = administrationRoleBrief({ role, group, area });
      assert.ok(details.duties.length >= 3);
      assert.match(details.practice, /örtlich|örtliche|örtlichen|eigene|eigenen|Herrschaft/);
      assert.deepEqual(role, original);
    }
  }
});

test('Alle verwendeten CK-Aufgabenicons sind vorhandene lokale Dateien', async () => {
  for (const key of Object.keys(OFFICE_DUTY_ICONS)) await access(new URL(`../..${dutyIcon(key)}`, import.meta.url));
  assert.throws(() => dutyIcon('not-a-known-icon'), /Unknown/);
});
