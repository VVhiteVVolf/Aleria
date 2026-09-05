import { sceneDiceService } from '../scene-dice/dice-service.js?v=20260802-dice-audio-v2';
import { buildAttackNotation, buildDamageNotation } from './rules/combat-mvp-rules.js?v=20260905-party-combat-v1';

export class CombatDiceAdapter {
  constructor(service = sceneDiceService) {
    this.service = service;
  }

  async rollAttack({ modifier = 0, rollMode = 'normal', actorName = '', targetName = '', container = null } = {}) {
    const notation = buildAttackNotation(modifier, rollMode);
    return this.service.roll(notation, container, {
      roller: actorName,
      purpose: `Angriff gegen ${targetName}`,
      rollType: 'attack'
    });
  }

  async rollDamage({ damageFormula, bonus = 0, critical = false, actorName = '', targetName = '', container = null } = {}) {
    const notation = buildDamageNotation(damageFormula, bonus, critical);
    return this.service.roll(notation, container, {
      roller: actorName,
      purpose: `Schaden gegen ${targetName}`,
      rollType: 'general'
    });
  }

  async rollSavingThrow({ modifier = 0, rollMode = 'normal', actorName = '', targetName = '', container = null } = {}) {
    const notation = buildAttackNotation(modifier, rollMode);
    return this.service.roll(notation, container, {
      roller: targetName,
      purpose: `Rettungswurf gegen ${actorName}`,
      rollType: 'saving-throw'
    });
  }

  async rollWardDeflection({ actorName = '', targetName = '', container = null } = {}) {
    return this.service.roll('1d20', container, {
      roller: targetName,
      purpose: `Ablenkungswurf gegen ${actorName}`,
      rollType: 'general'
    });
  }
}
