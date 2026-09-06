import { getBuiltinCreatureTemplates } from '../creatures/creature-catalog.js?v=20260906-character-vitality-v1';
import { resolveCombatProfile } from './combat-profile-resolver.js?v=20260906-character-vitality-v1';
import { CombatResolutionService } from './combat-resolution-service.js?v=20260906-character-vitality-v1';
import { getResolutionHitPointState, overlayCombatHitPointState } from './combat-state-model.js?v=20260906-character-vitality-v1';
import { parseDamageFormula } from './rules/combat-mvp-rules.js?v=20260905-party-combat-v1';

const TEAM_EEL = 'Schwarzer Zitteraal';
const TEAM_DRAIG = 'Draig';

const INSTANCE_DEFINITIONS = Object.freeze([
  ['catalog-schwarzer-zitteraal-raubritter', TEAM_EEL],
  ['catalog-draig-lehensritter', TEAM_DRAIG],
  ['catalog-schwarzer-zitteraal-schuetze', TEAM_EEL],
  ['catalog-draig-schuetze', TEAM_DRAIG],
  ['catalog-schwarzer-zitteraal-pluenderer', TEAM_EEL],
  ['catalog-draig-waffenknecht', TEAM_DRAIG]
]);

class DeterministicBrandhofDice {
  constructor(turn) {
    this.turn = turn;
  }

  async rollAttack({ modifier, rollMode }) {
    const first = [14, 16, 12, 18, 11, 15, 13, 17, 20, 9][this.turn % 10];
    const second = [8, 10, 15, 7, 13, 11, 16, 12, 6, 14][this.turn % 10];
    const dice = rollMode === 'normal' ? [first] : [first, second];
    const natural = rollMode === 'advantage' ? Math.max(...dice) : (rollMode === 'disadvantage' ? Math.min(...dice) : first);
    return { id: `brandhof-attack-${this.turn}`, natural, dice, keptDice: [natural], total: natural + Number(modifier || 0), visualMode: 'test' };
  }

  async rollDamage({ damageFormula, bonus, critical }) {
    const parsed = parseDamageFormula(damageFormula);
    const count = parsed.diceCount * (critical ? 2 : 1);
    const keptDice = Array.from({ length: count }, (_, index) => Math.max(1, parsed.sides - ((this.turn + index) % 3)));
    const modifier = parsed.fixedModifier + Number(bonus || 0);
    return {
      id: `brandhof-damage-${this.turn}`,
      notation: `${count}d${parsed.sides}${modifier ? `${modifier > 0 ? '+' : ''}${modifier}` : ''}`,
      keptDice,
      modifier,
      total: Math.max(0, keptDice.reduce((sum, value) => sum + value, 0) + modifier),
      visualMode: 'test'
    };
  }
}

function createInstances() {
  const templates = new Map(getBuiltinCreatureTemplates().map(template => [template.id, template]));
  return INSTANCE_DEFINITIONS.map(([sourceId, combatTeam], index) => {
    const template = templates.get(sourceId);
    if (!template) throw new Error(`Brandhof-Profil fehlt: ${sourceId}`);
    return {
      ...structuredClone(template),
      id: `brandhof-live:${sourceId}:${index + 1}`,
      sourceCreatureId: sourceId,
      entityType: 'creature',
      combatTeam,
      name: `${template.name} I.`
    };
  });
}

function isAlive(actor, states) {
  const profile = overlayCombatHitPointState(resolveCombatProfile(actor), states.get(actor.id) || null);
  return Number(profile.currentHitPoints) > 0;
}

function dialogueFor(actor, turn) {
  if (turn % 4 !== 0) return null;
  const text = actor.combatTeam === TEAM_DRAIG
    ? 'Haltet die Linie am ausgebrannten Hof! Keiner lässt den Nebenmann allein!'
    : 'Vorwärts, ihr Aale! Der Rauch gehört uns!';
  return { kind: 'speech', commentKind: 'speech', text, actorId: actor.id, charName: actor.name };
}

export async function runBrandhofCombatSimulation({ maximumTurns = 180 } = {}) {
  const actors = createInstances();
  const states = new Map();
  const comments = [];
  let turn = 0;

  while (turn < maximumTurns) {
    const livingTeams = new Set(actors.filter(actor => isAlive(actor, states)).map(actor => actor.combatTeam));
    if (livingTeams.size < 2) break;
    const actor = actors[turn % actors.length];
    turn += 1;
    if (!isAlive(actor, states)) continue;
    const target = actors.find(candidate => candidate.combatTeam !== actor.combatTeam && isAlive(candidate, states));
    if (!target) break;

    const actorProfile = overlayCombatHitPointState(resolveCombatProfile(actor), states.get(actor.id) || null);
    const targetProfile = overlayCombatHitPointState(resolveCombatProfile(target), states.get(target.id) || null);
    const description = `${actor.name} nutzt die Deckung des Brandhofs und setzt mit ${actorProfile.weapon.name} gegen ${target.name} nach.`;
    const resolution = await new CombatResolutionService(new DeterministicBrandhofDice(turn)).resolveAttack({
      actor: actorProfile,
      target: targetProfile,
      description,
      rollMode: 'normal'
    }, { relationship: 'enemy', distanceMeters: /bogen/i.test(actorProfile.weapon.name) ? 18 : 1.5 });
    resolution.serverValidated = true;
    const next = getResolutionHitPointState(resolution);
    if (next) states.set(target.id, { ...(states.get(target.id) || {}), ...next });
    const segments = [dialogueFor(actor, turn), {
      kind: 'combataction',
      commentKind: 'combataction',
      text: description,
      actorId: actor.id,
      charName: actor.name,
      combatResolution: resolution
    }].filter(Boolean);
    comments.push({
      id: `brandhof-live-comment-${comments.length + 1}`,
      entryId: 'test-brandhof-live-simulation',
      charName: actor.name,
      commentSegments: segments,
      text: segments.map(segment => segment.text).join('\n\n'),
      orderKey: comments.length + 1,
      serverValidatedMechanics: true
    });
  }

  const survivors = actors.filter(actor => isAlive(actor, states));
  return {
    actors,
    comments,
    states,
    turns: turn,
    finished: new Set(survivors.map(actor => actor.combatTeam)).size === 1,
    winningTeam: survivors[0]?.combatTeam || '',
    survivors
  };
}
