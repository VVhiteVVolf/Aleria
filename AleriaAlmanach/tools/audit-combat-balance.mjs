import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { listCombatTechniqueCatalog } from '../modules/combat-styles/combat-technique-catalog.js';
import { listSpellCatalogEntries, createCatalogSpell } from '../modules/spell-catalog/spell-catalog.js';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { getCombatActionEconomy, getAuraFocusMaximum, getSpellManaCost } from '../modules/combat/combat-resource-progression.js';
import { resolveTechniqueDamageFormula } from '../modules/combat/combat-technique-damage.js';
import { damageMetrics, techniqueBalanceRow, profileEntryBalanceRow } from '../modules/combat-balance/combat-balance-metrics.js';
import { getAutofilledCenyrCombatProfile } from '../modules/classes/cenyr/cenyr-combat-profile-autofill.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

const pool = listCombatTechniqueCatalog(), techniques = pool.map(technique => techniqueBalanceRow(technique));
assert.equal(new Set(pool.map(t => t.id)).size, pool.length, 'Doppelte Katalogkennung');
let damageSamples = 0;
for (const technique of pool) {
  const economy = { ...getCombatActionEconomy(technique.minimumLevel), 'aura-focus': getAuraFocusMaximum(technique.minimumLevel) };
  const costTotals = new Map();
  for (const cost of technique.costs) { assert.ok(cost.amount > 0); costTotals.set(cost.resourceId, (costTotals.get(cost.resourceId) || 0) + cost.amount); }
  for (const [resourceId, amount] of costTotals) assert.ok(amount <= economy[resourceId], `${technique.name}: unerreichbare Kosten`);
  const save = technique.secondarySave;
  if (save?.enabled) assert.ok(save.fixedDc != null || save.useWeaponAttribute, `${technique.name}: alte Kontroll-SG`);
  for (const damageFormula of ['1d4', '1d6', '1d8', '1d10', '1d12', '2d6']) {
    let last = 0;
    for (let level = technique.minimumLevel; level <= 20; level++) {
      const formula = resolveTechniqueDamageFormula(technique, { damageFormula }, { progression: { level } });
      const metric = damageMetrics(formula); damageSamples++;
      if (!metric) continue;
      assert.ok(metric.average >= last, `${technique.name}: sinkender Ausbildungsschaden`); last = metric.average;
      assert.ok(metric.critical.minimum >= metric.maximum, `${technique.name}: Krit unter normalem Maximum`);
      assert.equal(metric.critical.maximum, Math.max(0, 2 * metric.diceMaximum + metric.fixedBonus), `${technique.name}: feste Boni beim Krit verdoppelt`);
    }
  }
}
const spells = [];
for (const [catalog, revision, archived] of [['elemente', 2, false], ['restitution', 1, false], ['elemente', 1, true]]) {
  for (const entry of listSpellCatalogEntries({ catalog, revision })) for (const form of [entry, ...(entry.forms || [])]) {
    const spell = createCatalogSpell(entry.id, { revision, level: form.level });
    assert.ok(spell, `${entry.name}: fehlende Gradform`);
    assert.equal(spell.manaCost, getSpellManaCost(form.level), `${entry.name}: falsche Manakosten`);
    assert.equal(spell.costs.find(cost => cost.resourceId === 'mana-focus')?.amount, spell.manaCost);
    spells.push({ id: entry.id, name: entry.name, catalog, revision, archived, grade: form.level,
      role: entry.role, resolution: spell.resolutionType,
      costs: spell.costs.map(({ resourceId, amount }) => ({ resourceId, amount })),
      damage: spell.effects.filter(effect => effect.type === 'damage').map(effect => damageMetrics(effect.formula)),
      concentration: !!spell.concentration, duration: spell.duration });
  }
}
const { characters } = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const creatures = getBuiltinCreatureTemplates(), storedProfiles = [...characters, ...creatures].filter(owner => owner.combatProfile);
const storedEntryCount = storedProfiles.reduce((sum, owner) => sum + ['weapons', 'techniques', 'abilities'].reduce((n, key) => n + (owner.combatProfile[key]?.length || 0), 0) + (owner.combatProfile.magic?.spells?.length || 0), 0);
const profiles = storedProfiles.map(owner => ({ ...owner, combatProfile: sanitizeCharacterCombatProfile(getAutofilledCenyrCombatProfile(owner.combatProfile)) }));
const profileEntries = profiles.flatMap(owner => ['weapons', 'techniques', 'abilities'].flatMap(kind => (owner.combatProfile[kind] || []).map(entry => profileEntryBalanceRow(owner, kind, entry)))
  .concat((owner.combatProfile.magic?.spells || []).map(entry => profileEntryBalanceRow(owner, 'spells', entry))));
const report = { schemaVersion: 1, release: '2026-10-15', referenceWeapon: '1d8',
  note: 'Vollständiger lokaler Katalogcheck. Kein Live-Abgleich. Alte Zaubereditionen und gespeicherte Kampfauswertungen bleiben unverändert. Erzählmerkmale sind gesondert markiert; Zahlen allein beweisen keine perfekte Spielbalance.',
  coverage: { techniques: techniques.length, currentCatalogSpells: new Set(spells.filter(s => !s.archived).map(s => s.id)).size,
    archivedCatalogSpells: new Set(spells.filter(s => s.archived).map(s => s.id)).size, spellGradeForms: spells.length,
    characters: characters.length, creatureTemplates: creatures.length, profiles: profiles.length, storedEntries: storedEntryCount, resolvedProfileEntries: profileEntries.length, damageSamples },
  techniques, spells, profileEntries,
  manualReview: profileEntries.filter(entry => entry.adjudication === 'narrative-or-passive-trait').map(({ owner, kind, id, name }) => ({ owner, kind, id, name })) };
if (process.argv.includes('--write')) {
  const directory = new URL('../docs/combat/balance-2026-10-15/', import.meta.url); await mkdir(directory, { recursive: true });
  await writeFile(new URL('audit.json', directory), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ ...report.coverage, manualTraits: report.manualReview.length, checks: 'passed' }));
