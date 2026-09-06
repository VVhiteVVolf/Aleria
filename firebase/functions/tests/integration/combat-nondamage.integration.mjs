import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createCombatParty } from './combat-party-context.mjs';
import { database, history, request, threadId, encounter, active, undo, CheckupDice, commitAction } from './combat-test-context.mjs';
import { commitCombatStatus } from '../../src/mechanics/commit-combat-status.js';
import { commitNarrativeComment } from '../../src/comments/commit-narrative-comment.js';
import { commitSceneRest } from '../../src/mechanics/commit-scene-rest.js';
import { commitSkillComment } from '../../src/mechanics/commit-skill-comment.js';
import { SkillResolutionService } from '../../../../AleriaAlmanach/modules/skill-checks/skill-resolution-service.js';
import { createSceneSkillProfileResolver } from '../../../../AleriaAlmanach/modules/skill-checks/skill-scene-profile.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { getSavingThrowTotal, getSkillTotal, resolveSavingThrowRollMode } from '../../../../AleriaAlmanach/modules/combat/combat-profile-model.js';

after(() => database.terminate());
const definitions = [
  { key: 'rhiannon', slug: 'rhiannon-draig', team: 'draig' },
  { key: 'gawain', slug: 'gawain-draig', team: 'draig' },
  { key: 'gildas', slug: 'gildas-gafyr', team: 'gafyr' },
  { key: 'freya', slug: 'freya-skald', team: 'gafyr' },
  { key: 'fenrir', slug: 'fenrir-varulv', team: 'gafyr' }
];
const conditions = profile => profile.temporaryConditions || [];
const has = (profile, name) => conditions(profile).find(condition => condition.name === name);
const resources = profile => Object.fromEntries(profile.resources.map(resource => [resource.id, resource.current]));
const resolution = result => result.mechanics.commentSegments.at(-1).combatResolution;
async function profile(party, key) { return (await party.snapshot()).profiles.get(key); }
async function cast(party, actor, actionId, target = actor, options = {}) {
  return party.commit(await party.prepare({ actor, targets: [target], actionId, ...options }));
}
async function status(party, key, condition, extra = {}) {
  const actorId = party.byKey.get(key).id;
  return commitCombatStatus.run(request({ entryId: threadId, actorId, recordId: actorId, kind: 'character',
    expectedLastCommentId: (await history()).at(-1)?.id || '', operation: 'add', condition, ...extra }));
}
async function narrative(party, key, count = 1) {
  const actor = party.byKey.get(key);
  return commitNarrativeComment.run(request({ entryId: threadId, text: 'Die Figur beobachtet und wartet.', charName: actor.name,
    metadata: { characterId: actor.id, commentSegments: Array.from({ length: count }, () => ({ characterId: actor.id, kind: 'speech', text: 'Warten.' })) } }));
}
async function endFight() {
  const fight = await active();
  return encounter({ encounterId: fight.encounterId, operation: 'end', expectedRevision: fight.revision, outcome: 'draw', endReason: 'agreement', participants: [] });
}

test('Expliziter Eigenschaden wird einmal gespeichert und lässt sich samt Ressourcenkosten zurücknehmen', async () => {
  const party = await createCombatParty(definitions);
  const actor = await party.record('gawain');
  await database.collection('characters').doc(actor.id).update({ 'combatProfile.abilities': [
    ...actor.combatProfile.abilities, { id: 'test-health-cost', name: 'Eigener Lebenspunkteeinsatz', active: true,
      combatUsable: true, activationType: 'reaction', resolutionType: 'automatic',
      effects: [{ type: 'damage', target: 'self', on: 'always', amount: 2 }] }
  ] });
  const before = await profile(party, 'gawain');
  const used = await cast(party, 'gawain', 'ability:test-health-cost');
  const after = await profile(party, 'gawain');
  assert.equal(after.currentHitPoints, before.currentHitPoints - 2);
  assert.equal(resources(after).reaction, resources(before).reaction - 1);
  await undo(used.id);
  const restored = await profile(party, 'gawain');
  assert.equal(restored.currentHitPoints, before.currentHitPoints);
  assert.equal(resources(restored).reaction, resources(before).reaction);
  const count = (await history()).length;
  await assert.rejects(() => party.prepare({ actor: 'gawain', targets: ['gawain'] }), /selbst/);
  assert.equal((await history()).length, count);
  await party.assertConsistent();
});

test('Rüstungsroutine verwendet auf Server und Vorschau dieselbe Grenze 11/12, auch nach Rückstufung', async () => {
  for (const level of [11, 12, 11]) {
    const party = await createCombatParty(definitions);
    const target = await party.record('gawain');
    const armorItems = target.combatProfile.armorItems.map(item => ({ ...item, dexterityUnlockLevel: 6 }));
    await database.collection('characters').doc(target.id).update({ 'combatProfile.progression.level': level,
      'combatProfile.armorItems': armorItems });
    const expected = level >= 12 ? 19 : 16;
    assert.equal((await profile(party, 'gawain')).totalDefense, expected);
    const prepared = await party.prepare({ actor: 'gildas', targets: ['gawain'], natural: 11 });
    const saved = resolution(await party.commit(prepared));
    assert.equal(saved.targetSnapshot.defense, expected);
    await party.assertConsistent();
  }
});

test('Schild schützt weiterhin nach eigener Magierrüstung; Buffs verbrauchen keine Abwehrladung', async () => {
  const party = await createCombatParty(definitions);
  await cast(party, 'rhiannon', 'spell:rhiannon-schild');
  const armor = resolution(await cast(party, 'rhiannon', 'spell:rhiannon-magierruestung'));
  assert.equal(armor.damage, null);
  assert.equal(armor.wardResolution, null, 'Ein Schutzzauber darf keinen Schild auslösen');
  const rhiannon = await profile(party, 'rhiannon');
  assert.equal(rhiannon.temporaryHitPoints, 5);
  assert.equal(has(rhiannon, 'Schild')?.ward.charges, 1);
});

test('Wiederholte Spiegelbilder erneuern denselben Schutz, statt Ladungen endlos zu stapeln', async () => {
  const party = await createCombatParty(definitions);
  await cast(party, 'rhiannon', 'spell:rhiannon-spiegelbilder');
  await cast(party, 'rhiannon', 'spell:rhiannon-spiegelbilder');
  const effects = conditions(await profile(party, 'rhiannon')).filter(condition => condition.name === 'Spiegelbilder');
  assert.equal(effects.length, 1);
  assert.equal(effects[0].ward.charges, 2);
});

test('Spiegelbilder: Fehlschlag verbraucht nichts; Ablenkungen zählen Ladungen genau herunter', async () => {
  const party = await createCombatParty(definitions);
  await cast(party, 'rhiannon', 'spell:rhiannon-spiegelbilder');
  await cast(party, 'gildas', '', 'rhiannon', { natural: 1 });
  assert.equal(has(await profile(party, 'rhiannon'), 'Spiegelbilder').ward.charges, 2);
  const dice = new CheckupDice(19);
  dice.rollWardDeflection = async () => ({ natural: 1, dice: [1], keptDice: [1], total: 1 });
  for (const remaining of [1, 0]) {
    const result = resolution(await cast(party, 'gildas', '', 'rhiannon', { dice }));
    assert.equal(result.wardResolution.deflected, true);
    assert.equal(result.wardResolution.chargesAfter, remaining);
    assert.equal(result.damage, null);
  }
  assert.equal(has(await profile(party, 'rhiannon'), 'Spiegelbilder'), undefined);
});

test('Spottvers: Rettungswurf entscheidet, Malus trifft den nächsten ganzen Beitrag und läuft danach ab', async () => {
  const party = await createCombatParty(definitions);
  const base = await profile(party, 'gawain');
  let result = resolution(await cast(party, 'freya', 'spell:freya-spottvers', 'gawain', { natural: 20 }));
  assert.equal(result.attack.saveSucceeded, true);
  assert.equal(has(await profile(party, 'gawain'), 'Verspottet'), undefined);
  result = resolution(await cast(party, 'freya', 'spell:freya-spottvers', 'gawain', { natural: 1 }));
  assert.equal(result.attack.saveSucceeded, false);
  assert.equal(result.damage, null);
  assert.equal((await profile(party, 'gawain')).attackModifier, base.attackModifier - 2);
  await narrative(party, 'gildas');
  assert.equal(has(await profile(party, 'gawain'), 'Verspottet').remainingActorComments, 1);
  const attack = resolution(await cast(party, 'gawain', '', 'gildas', { natural: 1 }));
  assert.equal(attack.attack.modifier, base.attackModifier - 2);
  assert.equal(has(await profile(party, 'gawain'), 'Verspottet'), undefined);
});

test('Person festhalten reduziert Bewegung und bindet den Effekt an Rhiannons Konzentration', async () => {
  const party = await createCombatParty(definitions);
  await cast(party, 'rhiannon', 'spell:rhiannon-person-festhalten', 'gildas', { natural: 1 });
  const target = await profile(party, 'gildas');
  assert.equal(target.movement, 0);
  assert.equal(has(target, 'Festgehalten').concentrationOwnerId, party.byKey.get('rhiannon').id);
  assert.equal((await profile(party, 'rhiannon')).concentration?.actionId, 'spell:rhiannon-person-festhalten');
});

test('Neue Konzentration löst den alten Haltezauber auch auf einem anderen Ziel', async () => {
  const party = await createCombatParty(definitions);
  await cast(party, 'rhiannon', 'spell:rhiannon-person-festhalten', 'gildas', { natural: 1 });
  await cast(party, 'rhiannon', 'spell:rhiannon-person-festhalten', 'freya', { natural: 1 });
  assert.equal(has(await profile(party, 'gildas'), 'Festgehalten'), undefined);
  assert.ok(has(await profile(party, 'freya'), 'Festgehalten'));
});

test('Misslungene Konzentrationsprobe entfernt fernwirkende Zustände; Undo stellt beide Seiten wieder her', async () => {
  const party = await createCombatParty(definitions);
  await cast(party, 'rhiannon', 'spell:rhiannon-person-festhalten', 'gildas', { natural: 1 });
  const dice = new CheckupDice(19);
  dice.rollSavingThrow = async ({ modifier }) => ({ natural: 1, dice: [1], keptDice: [1], total: 1 + modifier });
  const attack = await cast(party, 'gawain', '', 'rhiannon', { dice });
  assert.equal(resolution(attack).targetConcentrationSnapshot.reason, 'save-failed');
  assert.equal((await profile(party, 'rhiannon')).concentration, null);
  assert.equal(has(await profile(party, 'gildas'), 'Festgehalten'), undefined);
  await undo(attack.id);
  assert.ok(has(await profile(party, 'gildas'), 'Festgehalten'));
  assert.ok((await profile(party, 'rhiannon')).concentration);
});

test('Berserkergang ändert Angriff, RK und Rettungswürfe; Ende und Undo räumen korrekt auf', async () => {
  const party = await createCombatParty(definitions);
  const base = await profile(party, 'fenrir');
  const applied = await cast(party, 'fenrir', 'ability:fenrir-berserkergang');
  const buffed = await profile(party, 'fenrir');
  assert.equal(buffed.attackModifier, base.attackModifier + 1);
  assert.equal(buffed.totalDefense, base.totalDefense - 4);
  assert(buffed.temporaryHitPoints > 0);
  assert.equal(resolveSavingThrowRollMode(buffed, 'strength'), 'normal');
  for (const key of ['constitution', 'wisdom', 'intelligence', 'charisma']) assert.equal(resolveSavingThrowRollMode(buffed, key), 'normal');
  assert.equal(buffed.abilities.find(ability => ability.id === 'fenrir-berserkergang').usesCurrent, 0);
  await undo(applied.id);
  assert.equal(has(await profile(party, 'fenrir'), 'Berserkergang'), undefined);
  await cast(party, 'fenrir', 'ability:fenrir-berserkergang');
  await endFight();
  assert.equal(has(await profile(party, 'fenrir'), 'Berserkergang'), undefined);
});

test('Manuelle Boni und Mali wirken in Angriff, Rettungswurf und Fertigkeit ohne Grundprofil zu ändern', async () => {
  const party = await createCombatParty(definitions);
  const base = await profile(party, 'gawain');
  await status(party, 'gawain', { name: 'Prüfsegen', durationKind: 'actor-comments', durationAmount: 2,
    mechanics: { attack: 2, armorClass: 1, savingThrow: 3, skill: -2 } });
  const buffed = await profile(party, 'gawain');
  assert.equal(buffed.attackModifier, base.attackModifier + 2);
  assert.equal(buffed.totalDefense, base.totalDefense + 1);
  assert.equal(getSavingThrowTotal(buffed, 'wisdom'), getSavingThrowTotal(base, 'wisdom') + 3);
  const skill = base.skills[0];
  assert.equal(getSkillTotal(buffed, skill.id), getSkillTotal(base, skill.id) - 2);
  assert.deepEqual(resources(buffed), resources(base));
  assert.equal(resolveCombatProfile(await party.record('gawain')).attackModifier, base.attackModifier);
  await narrative(party, 'gawain', 3);
  assert.equal(has(await profile(party, 'gawain'), 'Prüfsegen').remainingActorComments, 1);
  await narrative(party, 'gawain');
  assert.equal(has(await profile(party, 'gawain'), 'Prüfsegen'), undefined);
});

test('Temporärer Zauber-SG wird bei Rettungswürfen tatsächlich verwendet', async () => {
  const party = await createCombatParty(definitions);
  const before = await party.prepare({ actor: 'rhiannon', targets: ['gildas'], actionId: 'spell:rhiannon-person-festhalten', natural: 10 });
  await status(party, 'rhiannon', { name: 'Arkane Klarheit', durationKind: 'combat', mechanics: { spellSaveDc: 3 } });
  const after = await cast(party, 'rhiannon', 'spell:rhiannon-person-festhalten', 'gildas', { natural: 10 });
  assert.equal(resolution(after).attack.targetDefense, before.segment.combatResolution.attack.targetDefense + 3);
});

test('Fremde Beiträge zählen Szenendauer; Statusänderungen zählen nicht und füllen keine Ressourcen', async () => {
  const party = await createCombatParty(definitions);
  await cast(party, 'gawain', '', 'gildas', { natural: 1 });
  const spent = resources(await profile(party, 'gawain'));
  await status(party, 'gawain', { name: 'Kurzer Schutz', durationKind: 'scene-comments', durationAmount: 2, mechanics: { armorClass: 1 } });
  await status(party, 'gildas', { presetId: 'poisoned', durationKind: 'permanent' });
  assert.deepEqual(resources(await profile(party, 'gawain')), spent);
  assert.equal(has(await profile(party, 'gawain'), 'Kurzer Schutz').remainingSceneComments, 2);
  await narrative(party, 'freya', 3);
  assert.equal(has(await profile(party, 'gawain'), 'Kurzer Schutz').remainingSceneComments, 1);
  await narrative(party, 'rhiannon');
  assert.equal(has(await profile(party, 'gawain'), 'Kurzer Schutz'), undefined);
  assert.ok(has(await profile(party, 'gildas'), 'Vergiftet'));
});

test('Entfernen des letzten Halte-Effekts beendet Konzentration; Undo stellt die Verbindung wieder her', async () => {
  const party = await createCombatParty(definitions);
  await cast(party, 'rhiannon', 'spell:rhiannon-person-festhalten', 'gildas', { natural: 1 });
  const conditionId = has(await profile(party, 'gildas'), 'Festgehalten').id;
  const removed = await status(party, 'gildas', null, { operation: 'remove', conditionId });
  assert.equal((await profile(party, 'rhiannon')).concentration, null);
  await undo(removed.id);
  assert.ok((await profile(party, 'rhiannon')).concentration);
  assert.ok(has(await profile(party, 'gildas'), 'Festgehalten'));
});

test('Natürlicher Ablauf entfernt Konzentration; ein erfolgreicher Zielrettungswurf hinterlässt keine Geisterkonzentration', async () => {
  const party = await createCombatParty(definitions);
  await cast(party, 'rhiannon', 'spell:rhiannon-person-festhalten', 'gildas', { natural: 1 });
  await narrative(party, 'gildas'); await narrative(party, 'gildas');
  assert.equal((await profile(party, 'rhiannon')).concentration, null);
  await cast(party, 'rhiannon', 'spell:rhiannon-person-festhalten', 'freya', { natural: 20 });
  assert.equal(has(await profile(party, 'freya'), 'Festgehalten'), undefined);
  assert.equal((await profile(party, 'rhiannon')).concentration, null);
});

test('Eine bestandene Konzentrationsprobe erhält den entfernten Zustand', async () => {
  const party = await createCombatParty(definitions);
  await cast(party, 'rhiannon', 'spell:rhiannon-person-festhalten', 'gildas', { natural: 1 });
  const attack = resolution(await cast(party, 'gawain', '', 'rhiannon'));
  assert.equal(attack.targetConcentrationSnapshot.reason, 'save-succeeded');
  assert.ok(has(await profile(party, 'gildas'), 'Festgehalten'));
});

test('Dritte Figur handelt nach Ende der Konzentration: Rücknahme darf ihren Folgebeitrag nicht verfälschen', async () => {
  const party = await createCombatParty(definitions);
  await cast(party, 'rhiannon', 'spell:rhiannon-person-festhalten', 'gildas', { natural: 1 });
  const dice = new CheckupDice(19);
  dice.rollSavingThrow = async ({ modifier }) => ({ natural: 1, dice: [1], keptDice: [1], total: 1 + modifier });
  const broken = await cast(party, 'gawain', '', 'rhiannon', { dice });
  await narrative(party, 'gildas');
  await assert.rejects(() => undo(broken.id), /neuere Handlung/);
});

test('Kurze Rast, lange Rast und Tageswechsel entfernen nur passende manuelle Zustände', async () => {
  const party = await createCombatParty(definitions);
  await endFight();
  for (const durationKind of ['short-rest', 'long-rest', 'day', 'permanent']) {
    await status(party, 'gawain', { name: durationKind, durationKind });
  }
  // Short rest stays on the same scene day and does not simulate a new day.
  const actor = party.byKey.get('gawain');
  const rest = (type, day, seconds) => commitSceneRest.run(request({ entryId: threadId, text: 'Lokale Prüfrast', metadata: {
    sceneRest: { type, participants: [{ actorId: actor.id, name: actor.name, persistence: { kind: 'character', recordId: actor.id } }] },
    sceneTimeEvent: { anchorDay: day, anchorSeconds: seconds }
  } }));
  await rest('short', 1, 3600);
  assert.deepEqual(conditions(await profile(party, 'gawain')).map(condition => condition.name).sort(), ['day', 'long-rest', 'permanent']);
  await rest('long', 2, 3600);
  assert.deepEqual(conditions(await profile(party, 'gawain')).map(condition => condition.name), ['permanent']);
});

async function addFixtureSpell(party, spell) {
  // Isolated mechanics fixture: no new spell is added to a real character file.
  const actor = await party.record('rhiannon');
  await database.collection('characters').doc(actor.id).update({ 'combatProfile.magic.spells': [
    ...actor.combatProfile.magic.spells, { id: 'test-ritual', name: 'Prüfritual', level: 1, prepared: true,
      activationType: 'action', resolutionType: 'automatic', range: 'Selbst',
      effects: [{ type: 'buff', target: 'self', on: 'always', condition: { id: 'test-ward', name: 'Ritualschutz', mechanics: { armorClass: 2 }, durationModel: { kind: 'combat' } } }], ...spell }
  ] });
}

test('Kanalisierung über drei Beiträge: erst Fertigstellung gibt Schutz und bezahlt Ressourcen', async () => {
  const party = await createCombatParty(definitions);
  await addFixtureSpell(party, { channelComments: 3 });
  const before = resources(await profile(party, 'rhiannon'));
  for (const progress of [1, 2]) {
    const result = resolution(await cast(party, 'rhiannon', 'spell:test-ritual'));
    assert.equal(result.actionType, 'channeling');
    assert.equal((await profile(party, 'rhiannon')).channeling.progress, progress);
    assert.deepEqual(resources(await profile(party, 'rhiannon')), before);
    assert.equal(has(await profile(party, 'rhiannon'), 'Ritualschutz'), undefined);
  }
  const finished = resolution(await cast(party, 'rhiannon', 'spell:test-ritual'));
  assert.equal(finished.actorChannelingSnapshot.reason, 'completed');
  assert.equal((await profile(party, 'rhiannon')).channeling, null);
  assert.ok(has(await profile(party, 'rhiannon'), 'Ritualschutz'));
  assert.ok(resources(await profile(party, 'rhiannon'))['mana-focus'] < before['mana-focus']);
});

test('Mehrere Abschnitte desselben Posts dürfen ein Mehrbeitragsritual nicht abkürzen', async () => {
  const party = await createCombatParty(definitions);
  await addFixtureSpell(party, { channelComments: 3 });
  const first = await party.prepare({ actor: 'rhiannon', targets: ['rhiannon'], actionId: 'spell:test-ritual' });
  await assert.rejects(() => party.prepare({ actor: 'rhiannon', targets: ['rhiannon'], actionId: 'spell:test-ritual', priorSegments: [first.segment] }), /Beitrag|Kanalisierung/);
  const payload = structuredClone(first.payload);
  payload.metadata.commentSegments.push(structuredClone(first.segment));
  await assert.rejects(() => commitAction(payload), /Beitrag|Kanalisierung/);
  assert.equal((await profile(party, 'rhiannon')).channeling, null, 'Abgewiesener Post hinterlässt keinen Fortschritt');
});

test('Unterbrechen ohne Schaden beendet Kanalisierung und Konzentration', async () => {
  const party = await createCombatParty(definitions);
  await addFixtureSpell(party, { channelComments: 3 });
  const freya = await party.record('freya');
  await database.collection('characters').doc(freya.id).update({ 'combatProfile.abilities': [...freya.combatProfile.abilities,
    { id: 'test-interrupt', name: 'Prüfunterbrechung', active: true, combatUsable: true, resolutionType: 'automatic',
      activationType: 'reaction', effects: [{ type: 'interrupt', target: 'target', on: 'always' }] }
  ] });
  await cast(party, 'rhiannon', 'spell:rhiannon-person-festhalten', 'gildas', { natural: 1 });
  await cast(party, 'rhiannon', 'spell:test-ritual');
  const interrupted = resolution(await cast(party, 'freya', 'ability:test-interrupt', 'rhiannon'));
  assert.equal(interrupted.damage, null);
  assert.equal(interrupted.targetChannelingSnapshot.reason, 'interrupted');
  assert.equal(interrupted.targetConcentrationSnapshot.reason, 'interrupted');
  assert.equal((await profile(party, 'rhiannon')).channeling, null);
  assert.equal((await profile(party, 'rhiannon')).concentration, null);
  assert.equal(has(await profile(party, 'gildas'), 'Festgehalten'), undefined);
});

test('Temporärer Fertigkeitsbonus stimmt im Browsermodell, Serverwurf und nächsten Szenenstand überein', async () => {
  const party = await createCombatParty(definitions);
  await status(party, 'gawain', { name: 'Mut', durationKind: 'actor-comments', durationAmount: 2, mechanics: { skill: 3 } });
  const actor = await party.record('gawain');
  const scene = createSceneSkillProfileResolver(await history(), { recoveryDayKey: `scene:${threadId}:day-1` });
  const preview = await new SkillResolutionService({ rollSkill: async ({ modifier, rollMode }) => ({ natural: 10, dice: rollMode === 'normal' ? [10] : [10, 10], keptDice: [10], total: 10 + modifier }) }).resolve({
    actor, settings: { skillId: 'persuasion', difficulty: 12 }, actorPersistence: scene.resolve(actor).persistence
  }, { actorProfile: scene.resolve(actor) });
  const result = await commitSkillComment.run(request({ entryId: threadId, charName: actor.name, text: 'Eine mutige Ansprache.', metadata: {
    characterId: actor.id, commentSegments: [{ kind: 'speech', commentKind: 'speech', mechanicMode: 'skill', characterId: actor.id,
      text: 'Eine mutige Ansprache.', skillId: 'persuasion', skillDifficulty: 12, skillResolution: preview }]
  } }));
  const actual = result.mechanics.commentSegments[0].skillResolution;
  assert.equal(actual.total, preview.total);
  assert.equal(actual.profileModifier, preview.profileModifier);
  assert.equal(has(await profile(party, 'gawain'), 'Mut').remainingActorComments, 1);
});

test('Eine echte hochstufige Teulu-Form überträgt ihren Selbstbuff auf Vorschau, Server und Gegnerauswertung', async () => {
  const party = await createCombatParty(definitions.map(definition => definition.key === 'gawain' ? { ...definition, level: 20 } : definition));
  const before = await profile(party, 'gawain');
  const action = before.actions.find(action => action.kind === 'technique' && action.compatible
    && action.effects.some(effect => effect.target === 'self' && effect.condition?.mechanics?.armorClass > 0));
  assert.ok(action, 'Eine tatsächlich gelernte Schutztechnik ist verfügbar');
  const protection = action.effects.find(effect => effect.target === 'self' && effect.condition?.mechanics?.armorClass > 0);
  await cast(party, 'gawain', action.id, 'gildas', { natural: 1 });
  assert.equal((await profile(party, 'gawain')).totalDefense, before.totalDefense + protection.condition.mechanics.armorClass);
  const enemy = resolution(await cast(party, 'gildas', '', 'gawain', { natural: 1 }));
  assert.equal(enemy.attack.targetDefense, before.totalDefense + protection.condition.mechanics.armorClass);
});

test('Manueller Kreaturenzustand betrifft nur die gewählte Instanz, niemals ihre Vorlage oder die zweite Kreatur', async () => {
  const party = await createCombatParty([
    definitions[1],
    { key: 'one', creature: 'catalog-schwarzer-zitteraal-pluenderer', team: 'feinde' },
    { key: 'two', creature: 'catalog-schwarzer-zitteraal-pluenderer', team: 'feinde' }
  ]);
  const actor = party.byKey.get('one');
  const before = await profile(party, 'one');
  await commitCombatStatus.run(request({ entryId: threadId, actorId: actor.id, recordId: actor.sourceCreatureId, kind: 'creature',
    expectedLastCommentId: (await history()).at(-1).id, operation: 'add',
    condition: { name: 'Geschwächt', durationKind: 'combat', mechanics: { attack: -3 } }
  }));
  assert.equal((await profile(party, 'one')).attackModifier, before.attackModifier - 3);
  assert.equal((await profile(party, 'two')).attackModifier, before.attackModifier);
  await party.assertConsistent();
});
