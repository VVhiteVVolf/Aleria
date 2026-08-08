import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';

const exportUrl = new URL('../../Charakter%20Archiv%20Exporte/duncan-gafyr.json', import.meta.url);

async function loadDuncan() {
  const exported = JSON.parse(await readFile(exportUrl, 'utf8'));
  return exported.character;
}

test('Duncan ist als Stufe-20-Endgame-Schwertmeister vollständig aufgebaut', async () => {
  const duncan = await loadDuncan();
  const profile = resolveCombatProfile(duncan);
  const resources = new Map(profile.resources.map(resource => [resource.id, resource.maximum]));

  assert.equal(profile.progression.level, 20);
  assert.equal(profile.progression.specialLevels, 0);
  assert.equal(profile.maximumHitPoints, 204);
  assert.deepEqual(
    ['action', 'bonus-action', 'reaction', 'special-action'].map(id => resources.get(id)),
    [3, 2, 3, 4]
  );
  assert.equal(resources.get('aura-focus'), 4);
  assert.equal(profile.weapons.find(weapon => weapon.equipped)?.id, 'duncan-gafyr-master-sword');
});

test('Form I enthält genau eine reine Schadentechnik je Stufe eins bis sechs samt Flächenangriff', async () => {
  const { combatProfile } = await loadDuncan();
  const techniques = combatProfile.techniques;

  assert.deepEqual(techniques.map(technique => technique.minimumLevel), [1, 2, 3, 4, 5, 6]);
  assert.equal(techniques.every(technique => technique.trainingForm.includes('Tanz des Jungdrachens')), true);
  assert.equal(techniques.every(technique => technique.damageFormula && !technique.secondarySave.enabled && !technique.followUpAttack.enabled), true);
  assert.equal(techniques.some(technique => technique.effects.some(effect => effect.type === 'damage' && effect.target === 'selected')), true);
});

test('alle sieben Drachentanz-Formen sind gemeistert, nur Form I besitzt Techniken', async () => {
  const { combatProfile } = await loadDuncan();
  const forms = combatProfile.abilities.filter(ability => ability.id.startsWith('duncan-drachentanz-form-'));

  assert.equal(forms.length, 7);
  assert.equal(forms.every(form => form.activationType === 'passive' && form.combatUsable === false), true);
  assert.deepEqual(forms.map(form => form.id), Array.from({ length: 7 }, (_, index) => `duncan-drachentanz-form-${index + 1}`));
});

test('Duncans fünf persönliche Aura-Angriffe werden ausschließlich mit Aura bezahlt', async () => {
  const { combatProfile } = await loadDuncan();
  const attacks = combatProfile.abilities.filter(ability => ability.id.startsWith('duncan-aura-attack-'));

  assert.equal(attacks.length, 5);
  attacks.forEach(attack => {
    assert.equal(attack.combatUsable, true);
    assert.equal(attack.usesMaximum, 0);
    assert.equal(attack.costs.length, 1);
    assert.equal(attack.costs[0].resourceId, 'aura-focus');
    assert.equal(attack.auraBypass.allowed, false);
  });
});

test('die latente Waffenmeister-Präsenz bufft Verbündete, schwächt Gegner und vergibt Start-TP', async () => {
  const { combatProfile } = await loadDuncan();
  const latent = combatProfile.aura.latentPresence;
  const active = combatProfile.aura.activeForm;

  assert.equal(combatProfile.aura.enabled, true);
  assert.equal(latent.allyMechanics.attack, 2);
  assert.equal(latent.allyMechanics.damage, 2);
  assert.equal(latent.allyMechanics.combatStartTemporaryHitPoints, 12);
  assert.equal(latent.enemyMechanics.attack, -2);
  assert.equal(latent.enemyMechanics.damage, -2);
  assert.equal(active.target, 'Selbst');
  assert.equal(active.allyMechanics.attack, 0);
  assert.equal(active.enemyMechanics.attack, 0);
});
