import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { getCenyrClassProgression } from '../modules/classes/cenyr/cenyr-class-progression.js';
import { resolveTechniqueDamageFormula } from '../modules/combat/combat-technique-damage.js';

const referenceWeapon = { damageFormula: '1d10' };
const classes = ['cantref', 'uchelwyr'].map(classId => {
  const entries = getCenyrClassProgression(classId, 20).attackCatalog.map(technique => {
    const counter = technique.effects?.map(e => e.condition?.counterAttack).find(c => c?.enabled);
    const damage = resolveTechniqueDamageFormula(technique, referenceWeapon, { progression: { level: technique.minimumLevel } });
    const counterDamage = counter ? counter.damageModel
      ? resolveTechniqueDamageFormula({ damageModel: counter.damageModel }, referenceWeapon, { progression: { level: technique.minimumLevel } }) : '1d10' : '';
    const save = technique.secondarySave?.enabled ? technique.secondarySave : counter?.secondarySave;
    const role = counter ? 'prepared-counter' : damage ? 'weapon-attack' : 'guard-or-preparation';
    if (save?.enabled) assert.ok(save.fixedDc != null || save.useWeaponAttribute, `${technique.name}: Waffenattribut fehlt`);
    assert.ok(technique.costs.length, `${technique.name}: Kosten fehlen`);
    if (role === 'guard-or-preparation') assert.ok(technique.effects.every(e => e.target === 'self'), `${technique.name}: schadenslose gegnerische Wirkung prüfen`);
    return { id: technique.id, name: technique.name, level: technique.minimumLevel, role,
      costs: technique.costs.map(c => ({ resourceId: c.resourceId, amount: c.amount })),
      referenceDamage: damage, referenceCounterDamage: counterDamage,
      levelTwentyDamage: resolveTechniqueDamageFormula(technique, referenceWeapon, { progression: { level: 20 } }),
      ...(save?.enabled ? { savingThrow: { attribute: save.attributeKey, base: save.dcBase, weaponAttribute: !!save.useWeaponAttribute, fixed: save.fixedDc ?? null } } : {}) };
  });
  return { classId, count: entries.length, roles: Object.fromEntries(['weapon-attack','prepared-counter','guard-or-preparation']
    .map(role => [role, entries.filter(e => e.role === role).length])), entries };
});
const report = { schemaVersion: 1, release: '2026-10-15', referenceWeapon: '1d10',
  note: 'Würfelformeln ohne feste Attribut-, Waffen- oder Klassenboni; normaler Treffer vor Rüstung. Persönliche Techniken gehören nicht zum Klassenkatalog.', classes };
if (process.argv.includes('--write')) await writeFile(new URL('../docs/combat/MARTIAL_CONTROL_AUDIT.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(classes.map(({ classId, count, roles }) => ({ classId, count, roles }))));
