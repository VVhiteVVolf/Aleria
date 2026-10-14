import assert from 'node:assert/strict';
import { readFile, writeFile, access } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { getActionGroups } from '../modules/combat/ui/combat-action-card.js';
import { getActionWeaponSections } from '../modules/combat/ui/combat-action-taxonomy.js';

// Accept a read-only exported online inventory, or use the local archive snapshot.
const input = process.argv[2] ? pathToFileURL(process.argv[2]) : new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url);
const data = JSON.parse(await readFile(input, 'utf8'));
const characters = (Array.isArray(data) ? data : data.characters).filter(c => Number(c.combatProfile?.progression?.level) > 2 && !/duncan/i.test(c.name || c.id));
const report = [];
for (const character of characters) {
  const actor = resolveCombatProfile(character, { includeAiSnapshot: false }), groups = getActionGroups(actor), choices = [...groups.values()].flat();
  assert.equal(choices.length, actor.actions.filter(a => a.kind !== 'equipment-switch').length, character.name);
  assert.equal(new Set(choices.map(c => c.action.id)).size, choices.length, character.name);
  assert.ok([...groups.keys()].filter(key => key === 'personal-techniques').length <= 1);
  for (const choice of choices) {
    assert.ok(choice.weaponCategory.title && choice.weaponCategory.id, character.name);
    await access(new URL(`../public/assets/combat-arsenal-icons/${choice.weaponCategory.icon}.webp`, import.meta.url));
  }
  report.push({ id: character.id, name: character.name, level: actor.progression.level, actions: choices.length,
    groups: [...groups.values()].map(rows => ({ label: rows[0].group, count: rows.length,
      weapons: getActionWeaponSections(rows).map(section => ({ id: section.weapon.id, label: section.weapon.label, count: section.choices.length })) })) });
}
const result = { version: 1, auditedAt: new Date().toISOString(), exclusion: 'Sir Duncan', characters: report, totalActions: report.reduce((sum,c) => sum+c.actions,0) };
if (process.argv[3]) await writeFile(process.argv[3], JSON.stringify(result, null, 2)+'\n');
console.log(JSON.stringify({ characters: report.length, actions: result.totalActions, names: report.map(c=>c.name), success:true }));
