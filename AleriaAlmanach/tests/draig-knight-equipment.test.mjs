import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { collectCombatTriggerRules } from '../modules/combat/combat-trigger-rules.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';

const CASES = Object.freeze([
  { file: 'gawain-draig.json', slug: 'gawain-draig' },
  { file: 'gildas-gafyr.json', slug: 'gildas-gafyr' }
]);

async function loadCharacter(file) {
  const url = new URL(`../../Charakter%20Archiv%20Exporte/${file}`, import.meta.url);
  return JSON.parse(await readFile(url, 'utf8')).character;
}

class FixedSkillDice {
  async rollSkill({ modifier }) {
    return { id: 'draig-ring-roll', natural: 10, dice: [10], keptDice: [10], total: 10 + modifier };
  }
}

for (const definition of CASES) {
  test(`${definition.slug} besitzt das vollständige Draig-Ritterset mit Bildern und Regelverknüpfung`, async () => {
    const character = await loadCharacter(definition.file);
    const items = character.inventory.items;
    const sword = items.find(item => /Draig-Ritterschwert/.test(item.name));
    const armor = items.find(item => /Draig-Jungritter-Plattenrüstung/.test(item.name));
    const dagger = items.find(item => item.name === 'Draig-Dolch');
    const ring = items.find(item => item.id === `${definition.slug}-draig-knight-signet-item`);

    assert.equal(sword.image, 'https://i.imgur.com/38Na5EY.png');
    assert.equal(sword.value.totalCopper, 5000);
    assert.equal(sword.infoRows.find(row => row.label === 'Wert')?.value, '5 Goldtaler');
    assert.equal(armor.image, 'https://i.imgur.com/7siJPXG.png');
    assert.equal(dagger.image, 'https://i.imgur.com/caR593j.png');
    assert.equal(ring.image, 'https://i.imgur.com/mwP2vjq.png');
    assert.equal(ring.equipped, true);

    const profile = resolveCombatProfile(character, { segmentKind: 'combataction' });
    assert.equal(profile.weapon.image, sword.image);
    assert.equal(profile.armor.image, armor.image);
    const ringRule = collectCombatTriggerRules(profile)
      .find(rule => rule.id === `${definition.slug}-draig-knight-signet-persuasion`);
    assert.deepEqual(ringRule?.skillIds, ['persuasion']);
    assert.equal(ringRule?.effects.skillModifier, 1);

    const resolution = await new SkillResolutionService(new FixedSkillDice()).resolve({
      actor: { id: profile.characterId, name: profile.name },
      settings: { skillId: 'persuasion', difficulty: 10 }
    }, { actorProfile: profile });
    const ringApplication = resolution.ruleApplications.find(rule => rule.ruleId === ringRule.id);
    assert.equal(ringApplication?.effects.skillModifier, 1);
  });
}
