import assert from 'node:assert/strict';
import { createCombatParty } from './combat-party-context.mjs';
import { CheckupDice } from './combat-test-actions.mjs';
import { active, encounter, threadId } from './combat-test-context.mjs';
import { getActionPaymentCosts, resetCommentScopedResources } from '../../../../AleriaAlmanach/modules/combat/combat-action-economy.js';
import { parseDamageFormula } from '../../../../AleriaAlmanach/modules/combat/rules/combat-mvp-rules.js';

export const PARTY_SCENARIOS = [
  { id: 'magier-und-ritter', title: 'Rhiannon + Gawain gegen Gildas + Plünderer', actors: [
    { key: 'gawain', slug: 'gawain-draig', team: 'Draig' }, { key: 'rhiannon', slug: 'rhiannon-draig', team: 'Draig' },
    { key: 'gildas', slug: 'gildas-gafyr', team: 'Gafyr' }, { key: 'pluenderer', creature: 'catalog-schwarzer-zitteraal-pluenderer', team: 'Gafyr' }
  ] },
  { id: 'fernkampf-und-begleiter', title: 'Guinevere + Gawain + Tanor gegen Gildas + Schütze + Plünderer', actors: [
    { key: 'gawain', slug: 'gawain-draig', team: 'Draig' }, { key: 'guinevere', slug: 'guinevere-neidr', team: 'Draig' },
    { key: 'tanor', creature: 'companion-tanor', team: 'Draig' }, { key: 'gildas', slug: 'gildas-gafyr', team: 'Gafyr' },
    { key: 'schuetze', creature: 'catalog-schwarzer-zitteraal-schuetze', team: 'Gafyr' },
    { key: 'pluenderer', creature: 'catalog-schwarzer-zitteraal-pluenderer', team: 'Gafyr' }
  ] },
  { id: 'berserker-und-skalde', title: 'Fenrir + Freya gegen Raubritter + zwei Plünderer', actors: [
    { key: 'fenrir', slug: 'fenrir-varulv', team: 'Nord' }, { key: 'freya', slug: 'freya-skald', team: 'Nord' },
    { key: 'ritter', creature: 'catalog-schwarzer-zitteraal-raubritter', team: 'Gegner' },
    { key: 'pluenderer1', creature: 'catalog-schwarzer-zitteraal-pluenderer', team: 'Gegner' },
    { key: 'pluenderer2', creature: 'catalog-schwarzer-zitteraal-pluenderer', team: 'Gegner' }
  ] },
  { id: 'meister-gegen-gruppe', title: 'Duncan (20) gegen zwei Raubritter + zwei Schützen', actors: [
    { key: 'duncan', slug: 'duncan-gafyr', team: 'Gafyr' },
    { key: 'ritter1', creature: 'catalog-schwarzer-zitteraal-raubritter', team: 'Gegner' },
    { key: 'ritter2', creature: 'catalog-schwarzer-zitteraal-raubritter', team: 'Gegner' },
    { key: 'schuetze1', creature: 'catalog-schwarzer-zitteraal-schuetze', team: 'Gegner' },
    { key: 'schuetze2', creature: 'catalog-schwarzer-zitteraal-schuetze', team: 'Gegner' }
  ] }
];

function hasDamage(action) {
  return ['weapon', 'technique'].includes(action.kind) || (action.effects || []).some(effect => effect.type === 'damage' && effect.target !== 'self');
}

function expectedDamage(action, targets) {
  const formula = action.formula || action.effects?.find(effect => effect.type === 'damage' && effect.target !== 'self')?.formula;
  if (!formula) return 0;
  const parsed = parseDamageFormula(formula);
  const damage = (parsed.terms || [parsed]).reduce((sum, term) => sum + term.diceCount * (term.sides + 1) / 2, parsed.fixedModifier + Number(action.damageModifier || 0));
  return damage * Math.min(targets, maximumTargets(action));
}

function maximumTargets(action) {
  return Math.max(1, Number(action.maximumTargets) || ((action.effects || []).some(effect => ['selected', 'enemies', 'all'].includes(effect.target)) ? 20 : 1));
}

function chooseAction(profile, key, round, selected, enemies, resources) {
  const options = profile.actions.filter(action => action.compatible !== false && !selected.has(action.id)
    && getActionPaymentCosts(action, 'standard', profile).every(cost => (resources.find(resource => resource.id === cost.resourceId)?.current || 0) >= cost.amount));
  const opener = round === 1 ? { rhiannon: 'spell:rhiannon-magierruestung', fenrir: 'ability:fenrir-berserkergang', freya: 'ability:freya-arkaner-schrei' }[key] : '';
  if (opener && options.some(action => action.id === opener)) return options.find(action => action.id === opener);
  if (key === 'rhiannon' && !profile.conditions.some(condition => condition.active !== false && condition.ward?.charges > 0)) {
    const shield = options.find(action => action.id === 'spell:rhiannon-schild');
    if (shield) return shield;
  }
  return options.filter(hasDamage).sort((left, right) => expectedDamage(right, enemies.length) - expectedDamage(left, enemies.length))[0] || null;
}

export async function simulateCombatParty(scenario, seed) {
  const party = await createCombatParty(scenario.actors, scenario.title);
  const dice = new CheckupDice(null, seed);
  let snapshot = await party.snapshot();
  const initiative = party.actors.map(actor => ({ actor, total: dice.die(20) + Number(snapshot.profiles.get(actor.testKey).initiative || 0) }))
    .sort((left, right) => right.total - left.total).map(entry => entry.actor);
  const trace = [];
  let round = 0;
  const aliveTeams = () => new Set(party.actors.filter(actor => snapshot.profiles.get(actor.testKey).currentHitPoints > 0).map(actor => actor.combatTeam));
  while (aliveTeams().size > 1 && round < 24) {
    round++;
    for (const actor of initiative) {
      const profile = snapshot.profiles.get(actor.testKey);
      if (profile.currentHitPoints <= 0 || aliveTeams().size < 2) continue;
      let enemies = party.actors.filter(candidate => candidate.combatTeam !== actor.combatTeam && snapshot.profiles.get(candidate.testKey).currentHitPoints > 0);
      const selected = new Set();
      const segments = [];
      let resources = resetCommentScopedResources(profile.resources);
      while (selected.size < 12 && enemies.length) {
        const action = chooseAction(profile, actor.testKey, round, selected, enemies, resources);
        if (!action) break;
        selected.add(action.id);
        const targets = hasDamage(action) ? enemies.slice(0, maximumTargets(action)).map(enemy => enemy.testKey) : [actor.testKey];
        const prepared = await party.prepare({ actor: actor.testKey, targets, actionId: action.id, dice, priorSegments: segments,
          kind: round % 2 ? 'speech' : 'action', distanceMeters: maximumTargets(action) > 1 ? 3 : /bogen/i.test(action.weapon?.name || '') ? 18 : 1.5 });
        segments.push(prepared.segment);
        const results = prepared.segment.combatResolutions || [prepared.segment.combatResolution];
        resources = results.at(-1).actorResourceSnapshot?.after || results[0].actorResourceSnapshot?.after || resources;
        for (const result of results) {
          trace.push({ round, actor: actor.name, action: action.name, target: result.targetName, damage: result.damage?.total || 0,
            critical: result.attack?.criticalSuccess || false, hitPointsAfter: result.targetSnapshot.hitPointsAfter });
          if (result.targetSnapshot.hitPointsAfter <= 0) enemies = enemies.filter(enemy => enemy.id !== result.targetId);
        }
      }
      assert.ok(selected.size < 12, 'Die Ressourcen beenden den Testzug, kein künstliches Aktionslimit');
      if (segments.length) {
        const last = segments.at(-1);
        await party.commit({ payload: { entryId: threadId,
          charName: actor.name, text: 'Lokaler Gruppenkampftest', metadata: { characterId: actor.id, commentSegments: segments } }, segment: last });
        snapshot = await party.snapshot();
      }
    }
  }
  assert.ok(aliveTeams().size <= 1, `${scenario.title}: kein Stillstand nach 24 Runden`);
  const winner = [...aliveTeams()][0] || 'Unentschieden';
  const current = await active();
  const ended = await encounter({ encounterId: current.encounterId, operation: 'end', outcome: aliveTeams().size === 1 ? 'victory' : 'draw',
    winningPartyId: winner, awardExperience: false, endReason: 'incapacitation' });
  assert.equal(await active(), null);
  await party.assertConsistent();
  return { scenario: scenario.id, title: scenario.title, seed, rounds: round, winner, actions: trace.length,
    firstDefeatRound: trace.find(entry => entry.hitPointsAfter === 0)?.round || null,
    maximumNormalDamage: Math.max(0, ...trace.filter(entry => !entry.critical).map(entry => entry.damage)),
    maximumCriticalDamage: Math.max(0, ...trace.filter(entry => entry.critical).map(entry => entry.damage)),
    participants: party.actors.map(actor => ({ name: actor.name, level: actor.combatProfile.progression.level, team: actor.combatTeam,
      hitPoints: snapshot.profiles.get(actor.testKey).currentHitPoints, maximumHitPoints: snapshot.profiles.get(actor.testKey).maximumHitPoints })),
    recordedActionCount: ended.combatEncounter.summary.actionCount, trace };
}
