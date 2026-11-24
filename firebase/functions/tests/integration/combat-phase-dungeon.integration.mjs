import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import test, { after } from 'node:test';
import { database } from './combat-test-context.mjs';
import { approach, createDungeonFixture, phaseSettings, sceneNames } from './combat-phase-dungeon-fixture.mjs';
import { getActiveCombatEncounter } from '../../../../AleriaAlmanach/modules/combat/combat-encounter-model.js';
import { deriveCombatStateFromComments } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { getLatestCombatPhase } from '../../../../AleriaAlmanach/modules/combat-phase-counter/combat-phase-model.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { COMBAT_WAIT_ACTION } from '../../../../AleriaAlmanach/modules/combat/combat-wait-action.js';
import { CREATURE_TURN_END_ID } from '../../../../AleriaAlmanach/modules/combat/combat-creature-actions.js';

after(() => database.terminate());

test('Gruft mit drei Szenen: manuell geschaltete Zähler, Gruppenproben, fünf Versunkene, Fallen und Trollblut', async () => {
  const dungeon = await createDungeonFixture();
  const { heroes, enemies, troll, threadIds, history, phase, step, prepare, attempt, post, attack, announce, endFight, readPhase, transition } = dungeon;
  const [oweta, lefraye, rianna, caralyn] = heroes;
  const [hall, gallery, vault] = threadIds;
  const active = async entryId => getActiveCombatEncounter(await history(entryId));
  const states = async entryId => deriveCombatStateFromComments(await history(entryId));
  const assertReveal = async (entryId, phaseResult, definition) => {
    assert.deepEqual(phaseResult.revealed, ['reveal-' + definition.sceneElementId]);
    const rows = await history(entryId);
    const index = rows.findIndex(row => row.id === phaseResult.id);
    const reveal = rows[index + 1];
    assert.equal(reveal.id, phaseResult.revealed[0]);
    assert.equal(reveal.combatPhaseReveal.phase, phaseResult.phase);
    assert.equal(reveal.combatPhaseReveal.commentId, phaseResult.id);
    return reveal;
  };
  const archive = { phases: [], challenges: [], combatPosts: [], transitions: [], health: {} };
  async function manual(entryId, operation, settings, author = 1, options) {
    const result = await step(entryId, operation, settings, author, options);
    archive.phases.push({ entryId, operation, phase: result.phase, author });
    return result;
  }
  async function move(from, to) {
    const characters = heroes.map(({ id, name, portrait }) => ({ id, name, portrait: portrait || '' }));
    const source = { threadId: threadIds[from], entryId: dungeon.moduleId, pageTitle: sceneNames[from] };
    const target = { threadId: threadIds[to], entryId: dungeon.moduleId, pageTitle: sceneNames[to] };
    const sceneTransition = { transitionId: randomUUID(), source, target, characters, flavourText: 'Das Quartett steigt gemeinsam tiefer in die Gruft.' };
    await transition(source.threadId, target.threadId, sceneTransition.flavourText, { commentMode: 'scene-transition', commentKind: 'scene-transition-event', sceneTransition });
    for (const threadId of [source.threadId, target.threadId]) {
      const receipts = (await history(threadId)).filter(row => row.sceneTransition?.transitionId === sceneTransition.transitionId);
      assert.equal(receipts.length, 1);
      assert.deepEqual(receipts[0].sceneTransition.characters.map(actor => actor.id), heroes.map(actor => actor.id));
    }
    assert.equal((await readPhase(target.threadId)).phase, 0);
    archive.transitions.push({ from: source.pageTitle, to: target.pageTitle, figures: characters.map(actor => actor.name) });
  }

  const paths = heroes.map((actor, index) => approach(`antwort-${index + 1}`, `${actor.name} prüft seinen Abschnitt.`));
  const audience = { mode: 'selected', actorIds: heroes.map(actor => actor.id) };
  const two = await prepare(hall, 2, { title: 'Der Boden gibt nach', approaches: paths, audience });
  const five = await prepare(hall, 5, { title: 'Vier Siegel am Tor', approaches: paths, audience }, 2);
  assert.equal((await history(hall)).filter(row => row.herausforderung).length, 0);
  assert.ok((await history(hall)).filter(row => row.sceneElementSignal).every(row => !row.sceneElementSignal.visible && !row.sceneElementSignal.title));
  const first = await manual(hall, 'start', phaseSettings(1, 5, { phaseConditions: true, steps: [
    { phase: 1, flavor: 'Die Stufen unter euren Füßen sind glitschig.', conditions: [] }
  ] }));
  assert.equal(first.phase, 1);
  assert.equal(await active(hall), null);
  assert.ok((await history(hall)).every(row => row.characterId !== oweta.id));
  for (const actor of heroes) await post(hall, actor, 'Die Figur tastet sich vorsichtig voran.');
  assert.equal((await readPhase(hall)).phase, 1);
  assert.equal((await history(hall)).filter(row => row.herausforderung).length, 0);

  const revision = (await readPhase(hall)).revision;
  const sameOperation = { entryId: hall, operation: 'advance', expectedRevision: revision, operationId: randomUUID() };
  const checked = await phase(sameOperation, 2);
  assert.deepEqual(await phase(sameOperation, 2), checked);
  await assert.rejects(() => phase({ ...sameOperation, operationId: randomUUID() }, 1), error => error.code === 'aborted');
  archive.phases.push({ entryId: hall, operation: 'advance', phase: 2, author: 2 });
  const hallReactions = async (receipt, definition) => {
    const reveal = await assertReveal(hall, receipt, definition);
    for (const [index, actor] of heroes.entries()) {
      const result = await attempt(hall, reveal.id, paths[index].approachId, actor);
      const saved = result.mechanics.commentSegments[0].skillResolution;
      assert.equal(saved.targetChallengeId, `herausforderung:${reveal.id}:${paths[index].approachId}`);
      assert.ok(saved.herausforderungSolved ?? ['success', 'critical-success'].includes(saved.outcome));
    }
    archive.challenges.push({ title: reveal.herausforderung.title, phase: receipt.phase, responses: 4 });
  };
  await hallReactions(checked, two);
  const next = phaseSettings(1, 5, { phaseConditions: true, steps: [{ phase: 3, flavor: 'Rostiges Metall streift Owetas Arm.',
    conditions: [{ actorId: oweta.id, presetId: 'bleeding', durationKind: 'actor-comments', durationAmount: 2 }] }] });
  await manual(hall, 'advance', next);
  const wound = (await states(hall)).get(oweta.id);
  assert.equal(wound.temporaryConditions.find(condition => condition.presetId === 'bleeding').remainingActorComments, 2);
  await post(hall, oweta, 'Sie bindet sich ein loses Stück Stoff um den Arm.');
  await post(hall, oweta, 'Oweta prüft die nächste Bodenplatte.');
  assert.equal((await states(hall)).get(oweta.id).temporaryConditions.find(condition => condition.presetId === 'bleeding').remainingActorComments, 2);
  const fourth = await manual(hall, 'advance', undefined, 2);
  const fourthRow = (await history(hall)).find(row => row.id === fourth.id);
  assert.equal(fourthRow.criticalLifecycle[0].loss, 1);
  assert.equal((await dungeon.record(oweta)).combatProfile.hitPoints.current, fourthRow.criticalLifecycle[0].after.current);
  await hallReactions(await manual(hall, 'advance'), five);
  assert.equal((await states(hall)).get(oweta.id).temporaryConditions.some(condition => condition.presetId === 'bleeding'), false);
  await assert.rejects(() => step(hall, 'advance'), /letzte Phase/);
  await move(0, 1);

  const trap = (title, actor) => ({ title, elementType: 'danger', approaches: [approach('ducken', 'Der Falle ausweichen', {
    preferredSkills: ['acrobatics'], insight: 'Die Falle schnappt ins Leere.'
  })], activation: { target: { mode: 'fixed', actorId: actor.id }, detection: { enabled: true, skillId: 'perception',
    difficulty: 12, detectedText: 'Die Mechanik klickt hörbar.', missedText: 'Der Mechanismus schlägt unvermittelt zu.' } } });
  const seven = await prepare(gallery, 7, trap('Fallender Gitterrost', rianna));
  const ten = await prepare(gallery, 10, trap('Speerreihe im Mauerwerk', caralyn), 2);
  await manual(gallery, 'start', phaseSettings(5, 10));
  assert.equal(await active(gallery), null);
  await announce(gallery, [...heroes, ...enemies], 'Fünf Versunkene in der Galerie');
  assert.equal((await active(gallery)).participants.size, 9);
  assert.equal((await readPhase(gallery)).phase, 5);
  let combatTurn = 0;
  async function exchange(entryId, actor, target, options) {
    const saved = await attack(entryId, actor, target, options);
    archive.combatPosts.push({ entryId, actor: actor.name, target: target.name, id: saved.id });
    return saved;
  }
  await exchange(gallery, enemies[0], lefraye, { natural: 12 });
  await exchange(gallery, oweta, enemies[0]);
  assert.equal((await readPhase(gallery)).phase, 5);
  await manual(gallery, 'advance', undefined, 2);
  const sevenResult = await manual(gallery, 'advance', undefined, 1, { rollDie: () => 20 });
  const sevenReveal = await assertReveal(gallery, sevenResult, seven);
  assert.equal(sevenReveal.herausforderung.reaction.actorId, rianna.id);
  assert.equal(sevenReveal.herausforderung.reaction.rollMode, 'advantage');
  const sevenAttempt = await attempt(gallery, sevenReveal.id, 'ducken', rianna, 'acrobatics');
  assert.equal(sevenAttempt.mechanics.commentSegments[0].skillResolution.rollMode, 'advantage');
  await exchange(gallery, enemies[1], caralyn, { natural: 12 });
  await manual(gallery, 'advance');
  await exchange(gallery, rianna, enemies[1]);
  await manual(gallery, 'advance', undefined, 2);
  const tenResult = await manual(gallery, 'advance', undefined, 1, { rollDie: () => 1 });
  const tenReveal = await assertReveal(gallery, tenResult, ten);
  assert.equal(tenReveal.herausforderung.reaction.actorId, caralyn.id);
  assert.equal(tenReveal.herausforderung.reaction.rollMode, 'disadvantage');
  const tenAttempt = await attempt(gallery, tenReveal.id, 'ducken', caralyn, 'acrobatics');
  assert.equal(tenAttempt.mechanics.commentSegments[0].skillResolution.rollMode, 'disadvantage');
  assert.equal((await active(gallery)).active, true);
  archive.challenges.push({ phase: 7, title: sevenReveal.herausforderung.title, reaction: 'Vorteil' },
    { phase: 10, title: tenReveal.herausforderung.title, reaction: 'Nachteil' });

  for (const enemy of enemies) {
    let hits = 0;
    while ((await states(gallery)).get(enemy.id).current > 0 && hits++ < 16) {
      await exchange(gallery, heroes[combatTurn++ % heroes.length], enemy);
    }
    assert.equal((await states(gallery)).get(enemy.id).current, 0, enemy.name);
  }
  assert.deepEqual((await database.collection('creatures').doc(dungeon.drowned.id).get()).data().combatProfile.hitPoints, dungeon.drowned.combatProfile.hitPoints);
  await endFight(gallery);
  assert.equal((await readPhase(gallery)).phase, 10);
  await move(1, 2);

  await manual(vault, 'start', phaseSettings(10, 15));
  assert.equal(await active(vault), null);
  for (let i = 11; i < 15; i++) assert.equal((await manual(vault, 'advance', undefined, i % 2 + 1)).phase, i);
  await announce(vault, [...heroes, troll], 'Ein Höhlentroll stemmt sich unter dem Gewölbe hoch');
  assert.equal((await active(vault)).participants.get(troll.id).level, 12);
  const boss = await prepare(vault, 15, { title: 'Feuer in der Felsspalte', audience, combatBound: true, completionMode: 'any',
    approaches: [approach('feuer', 'Die Ölrinnen entzünden', { rewards: { combatEffects: [
      { effectId: 'oelfeuer', type: 'damage', amount: 18, damageType: 'Feuer', targetActorId: troll.id }
    ] } })] });
  const before = (await states(vault)).get(troll.id).current;
  const final = await manual(vault, 'advance', phaseSettings(10, 15, { steps: [
    { phase: 15, flavor: 'Der Höhlentroll bricht aus einer Spalte. Alte Ölrinnen laufen zu seinen Füßen zusammen.', conditions: [] }
  ] }), 2);
  const reveal = await assertReveal(vault, final, boss);
  await attempt(vault, reveal.id, 'feuer', lefraye);
  const damaged = (await states(vault)).get(troll.id);
  assert.equal(before - damaged.current, 36);
  assert.ok(damaged.temporaryConditions.some(condition => condition.id === 'regeneration-fire-exposure'));
  const trollTurn = await exchange(vault, troll, oweta, { natural: 4 });
  const turnEnd = trollTurn.mechanics.commentSegments.at(-1).combatResolution.turnEnd;
  assert.equal(turnEnd.suppressed, true);
  assert.equal((await states(vault)).get(troll.id).current, damaged.current);
  archive.health.troll = { before, afterFire: damaged.current, fire: 36, regenerationSuppressed: turnEnd.suppressed };
  archive.challenges.push({ phase: 15, title: reveal.herausforderung.title, fireDamage: 36, regenerationSuppressed: true });
  let finish = 0;
  while ((await states(vault)).get(troll.id).current > 0 && finish++ < 38) {
    await exchange(vault, heroes[combatTurn++ % heroes.length], troll);
  }
  assert.equal((await states(vault)).get(troll.id).current, 0);
  assert.equal((await dungeon.record(troll)).combatProfile.hitPoints.current, 0);
  await endFight(vault);
  assert.equal(getLatestCombatPhase(await history(vault)).phase, 15);
  for (const [index, numbers] of [[1, 2, 3, 4, 5], [5, 6, 7, 8, 9, 10], [10, 11, 12, 13, 14, 15]].entries()) {
    assert.deepEqual((await history(threadIds[index])).flatMap(row => ['start', 'advance'].includes(row.combatPhase?.operation) ? [row.combatPhase.phase] : []), numbers);
  }
  if (process.env.ALERIA_DUNGEON_PROOF) await writeFile(process.env.ALERIA_DUNGEON_PROOF, JSON.stringify(archive, null, 2) + '\n', 'utf8');
});

test('Aktionsvorrat bleibt zwischen Beiträgen verbraucht und ein Phasenwechsel regeneriert nur die vorgesehenen Ressourcen', async () => {
  const dungeon = await createDungeonFixture();
  const { heroes: [oweta], enemies: [enemy], threadIds: [entryId], history, announce, attack, step, readPhase } = dungeon;
  const states = async () => deriveCombatStateFromComments(await history(entryId));
  await announce(entryId, [oweta, enemy], 'Aktionsökonomie im Testduell');
  await step(entryId, 'start', phaseSettings(1, 4, { renewActions: true }));
  const beginning = (await states()).get(oweta.id).resources;
  const capacity = beginning.find(resource => resource.id === 'action').current;
  assert.ok(capacity > 0);
  for (let left = capacity; left > 0; left--) {
    await attack(entryId, oweta, enemy, { natural: 1 });
    assert.equal((await states()).get(oweta.id).resources.find(resource => resource.id === 'action').current, left - 1);
  }
  await assert.rejects(() => attack(entryId, oweta, enemy, { natural: 1 }));
  assert.equal((await readPhase(entryId)).phase, 1);
  const spent = (await states()).get(oweta.id).resources.filter(resource => resource.scope !== 'comment');
  const revision = (await readPhase(entryId)).revision;
  const payload = { entryId, operation: 'advance', expectedRevision: revision, operationId: randomUUID() };
  const concurrent = await Promise.allSettled([dungeon.phase(payload, 1), dungeon.phase({ ...payload, operationId: randomUUID() }, 2)]);
  assert.equal(concurrent.filter(item => item.status === 'fulfilled').length, 1);
  assert.equal(concurrent.find(item => item.status === 'rejected').reason.code, 'aborted');
  assert.equal((await readPhase(entryId)).phase, 2);
  const afterStep = (await states()).get(oweta.id).resources;
  assert.equal(afterStep.find(resource => resource.id === 'action').current, capacity);
  assert.deepEqual(afterStep.filter(resource => resource.scope !== 'comment'), spent);
  await step(entryId, 'stop');
  assert.equal((await readPhase(entryId)).stopped, true);
  for (let i = 0; i < capacity + 1; i++) await attack(entryId, oweta, enemy, { natural: 1 });
});

test('Gekoppelte Trollregeneration und Brennend wirken beim Wechsel einmal, auch nach mehreren Trollbeiträgen', async () => {
  const dungeon = await createDungeonFixture();
  const { heroes: [oweta], troll, threadIds: [entryId], history, announce, attack, step, prepare, record } = dungeon;
  const state = async () => deriveCombatStateFromComments(await history(entryId)).get(troll.id);
  const profile = resolveCombatProfile(await record(troll));
  await database.collection('creatures').doc(troll.id).update({ 'combatProfile.hitPoints.current': profile.maximumHitPoints - 50 });
  await announce(entryId, [oweta, troll], 'Phasentakt im Trollkampf');
  const settings = phaseSettings(1, 5, { phaseConditions: true, steps: [{ phase: 2, flavor: '', conditions: [
    { actorId: troll.id, presetId: 'burning', durationKind: 'actor-comments', durationAmount: 1 }
  ] }] });
  const hp = (await state()).current;
  await step(entryId, 'start', settings);
  await attack(entryId, troll, troll, { actionId: COMBAT_WAIT_ACTION.id, skipTurnEnd: true });
  assert.equal((await state()).current, hp);
  const next = await step(entryId, 'advance', undefined, 2, { rollDie: () => 2 });
  const restored = (await state()).current;
  const receipt = (await history(entryId)).find(row => row.id === next.id);
  assert.ok(restored > hp);
  assert.equal(receipt.combatPhase.creatureResolutions.length, 1);
  for (let index = 0; index < 2; index++) await attack(entryId, troll, troll, { actionId: COMBAT_WAIT_ACTION.id, skipTurnEnd: true });
  assert.equal((await state()).current, restored);
  assert.ok((await state()).temporaryConditions.some(condition => condition.presetId === 'burning'));
  const phaseBlindPreview = (await history(entryId)).filter(row => !row.combatPhase);
  await assert.rejects(() => attack(entryId, troll, troll, { actionId: CREATURE_TURN_END_ID, comments: phaseBlindPreview,
    skipTurnEnd: true }), /beim nächsten manuellen Phasenwechsel/);
  const ash = await step(entryId, 'advance', undefined, 1, { rollDie: () => 3 });
  assert.equal((await state()).current, restored - 3);
  assert.ok(!(await state()).temporaryConditions.some(condition => condition.presetId === 'burning'));
  assert.equal((await record(troll)).combatProfile.hitPoints.current, restored - 3);
  assert.equal((await history(entryId)).find(row => row.id === ash.id).combatPhase.creatureResolutions[0].turnEnd.suppressed, true);
  const late = { title: 'Dies gehört in eine spätere Phase', approaches: [approach('spaet', 'Untersuchen')] };
  await assert.rejects(() => prepare(entryId, 3, late), /kommende Phase/);
});
