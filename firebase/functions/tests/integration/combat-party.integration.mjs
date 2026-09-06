import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { database, undo, commitAction } from './combat-test-context.mjs';
import { createCombatParty } from './combat-party-context.mjs';
import { CheckupDice } from './combat-test-actions.mjs';

after(() => database.terminate());
const mixed = [
  { key: 'gawain', slug: 'gawain-draig', team: 'Draig' },
  { key: 'rhiannon', slug: 'rhiannon-draig', team: 'Draig' },
  { key: 'gildas', slug: 'gildas-gafyr', team: 'Gafyr' },
  { key: 'pluenderer', creature: 'catalog-schwarzer-zitteraal-pluenderer', team: 'Gafyr' }
];
const attack = suffix => `technique:combat-style-drachentanz-jungdrache-${suffix}`;

test('Rhiannon und Gawain gegen Gildas und Plünderer: Flächenzauber, Folgebeiträge und vollständige Rücknahme', async () => {
  const party = await createCombatParty(mixed, 'Rhiannon und Gawain gegen Gildas und Plünderer');
  const before = await party.snapshot();
  const spell = await party.prepare({ actor: 'rhiannon', targets: ['gildas', 'pluenderer'], actionId: 'spell:rhiannon-hundert-klingen-sturm' });
  const cast = await party.commit(spell);
  const results = cast.mechanics.commentSegments[0].combatResolutions;
  assert.equal(results.length, 2);
  assert.ok(results[0].resourceCosts.length > 0);
  assert.equal(results[1].resourceCosts.length, 0, 'Mana und Aktion nur einmal pro Flächenzauber');
  assert.equal((await party.snapshot()).profiles.get('gawain').currentHitPoints, before.profiles.get('gawain').currentHitPoints, 'Verbündeter nicht versehentlich getroffen');
  const first = await party.prepare({ actor: 'gildas', targets: ['gawain'], actionId: attack('06-sechsfacher-lehrhieb') });
  const second = await party.prepare({ actor: 'gildas', targets: ['gawain'], actionId: attack('03-gekreuzte-klauen'), priorSegments: [first.segment] });
  const strikes = await party.commit(second);
  assert.ok((await party.snapshot()).profiles.get('gawain').currentHitPoints > 0);
  await undo(strikes.id);
  await undo(cast.id);
  const restored = await party.assertConsistent();
  for (const key of ['gawain', 'rhiannon', 'gildas', 'pluenderer']) {
    assert.equal(restored.profiles.get(key).currentHitPoints, before.profiles.get(key).currentHitPoints);
    assert.deepEqual(restored.profiles.get(key).resources, before.profiles.get(key).resources);
  }
});

test('Rhiannons Selbstschutz: temporäre TP, Schild, gegnerischer Treffer und Ablauf', async () => {
  const party = await createCombatParty(mixed);
  const armor = await party.commit(await party.prepare({ actor: 'rhiannon', targets: ['rhiannon'], actionId: 'spell:rhiannon-magierruestung' }));
  assert.equal((await party.snapshot()).profiles.get('rhiannon').temporaryHitPoints, 5);
  const shield = await party.commit(await party.prepare({ actor: 'rhiannon', targets: ['rhiannon'], actionId: 'spell:rhiannon-schild' }));
  const protectedProfile = (await party.snapshot()).profiles.get('rhiannon');
  assert.ok(protectedProfile.conditions.some(condition => condition.ward?.enabled && condition.ward.charges === 1));
  const blocked = await party.commit(await party.prepare({ actor: 'gildas', targets: ['rhiannon'], natural: 15 }));
  assert.equal(blocked.mechanics.commentSegments[0].combatResolution.damage?.total || 0, 0);
  assert.equal((await party.snapshot()).profiles.get('rhiannon').temporaryHitPoints, 5);
  const refreshedShield = await party.commit(await party.prepare({ actor: 'rhiannon', targets: ['rhiannon'], actionId: 'spell:rhiannon-schild' }));
  const hit = await party.commit(await party.prepare({ actor: 'gildas', targets: ['rhiannon'], natural: 20 }));
  const afterHit = (await party.snapshot()).profiles.get('rhiannon');
  assert.equal(afterHit.temporaryHitPoints, 0);
  assert.ok(afterHit.currentHitPoints < 20);
  await undo(hit.id);
  await undo(refreshedShield.id);
  await undo(blocked.id);
  await undo(shield.id);
  await undo(armor.id);
  const restored = await party.assertConsistent();
  assert.equal(restored.profiles.get('rhiannon').temporaryHitPoints, 0);
  assert.equal(restored.profiles.get('rhiannon').currentHitPoints, 25);
});

test('Fenrirs Berserkergang und Doppelhieb werden mit echten Würfelbelegen serverseitig identisch ausgewertet', async () => {
  const party = await createCombatParty([
    { key: 'fenrir', slug: 'fenrir-varulv', team: 'Nord' },
    { key: 'ritter', creature: 'catalog-schwarzer-zitteraal-raubritter', team: 'Gegner' }
  ]);
  await party.commit(await party.prepare({ actor: 'fenrir', targets: ['fenrir'], actionId: 'ability:fenrir-berserkergang' }));
  const hit = await party.commit(await party.prepare({ actor: 'fenrir', targets: ['ritter'], actionId: 'technique:fenrir-twin-axe-flurry' }));
  const resolution = hit.mechanics.commentSegments[0].combatResolution;
  assert.equal(resolution.followUpAttacks.length, 1);
  assert.equal(resolution.followUpAttacks[0].damage.modifier, 0);
  assert.equal(resolution.followUpAttacks[0].damage.diceResults.length, 1);
});

test('Freya trifft mehrere Gegner mit dem Schrei: Eigenschaden und Fähigkeitsverbrauch fallen einmal an', async () => {
  const party = await createCombatParty([
    { key: 'freya', slug: 'freya-skald', team: 'Nord' },
    { key: 'fenrir', slug: 'fenrir-varulv', team: 'Nord' },
    { key: 'ritter', creature: 'catalog-schwarzer-zitteraal-raubritter', team: 'Gegner' },
    { key: 'pluenderer', creature: 'catalog-schwarzer-zitteraal-pluenderer', team: 'Gegner' }
  ]);
  const start = await party.snapshot();
  const cast = await party.commit(await party.prepare({ actor: 'freya', targets: ['ritter', 'pluenderer'], actionId: 'ability:freya-arkaner-schrei' }));
  const results = cast.mechanics.commentSegments[0].combatResolutions;
  assert.equal(results.length, 2);
  const end = await party.snapshot();
  assert.equal(start.profiles.get('freya').currentHitPoints - end.profiles.get('freya').currentHitPoints, 3);
  assert.equal(end.profiles.get('fenrir').currentHitPoints, start.profiles.get('fenrir').currentHitPoints);
  assert.equal(results[1].resourceCosts.length, 0);
});

test('Stufe 8 bezahlt einen Angriff vollständig mit Aura, Folgeangriff verwendet den übrigen Aktionspool', async () => {
  const party = await createCombatParty([
    { key: 'gawain', slug: 'gawain-draig', level: 8, team: 'Draig' },
    { key: 'ritter', creature: 'catalog-schwarzer-zitteraal-raubritter', team: 'Gegner' }
  ]);
  const first = await party.prepare({ actor: 'gawain', targets: ['ritter'], actionId: attack('06-sechsfacher-lehrhieb'), paymentMode: 'aura' });
  const second = await party.prepare({ actor: 'gawain', targets: ['ritter'], actionId: attack('02-drachenbiss'), priorSegments: [first.segment] });
  const result = await party.commit(second);
  const resolutions = result.mechanics.commentSegments.map(segment => segment.combatResolution);
  assert.deepEqual(resolutions[0].resourceCosts.map(cost => cost.resourceId), ['aura-focus']);
  assert.ok(resolutions[1].resourceCosts.some(cost => cost.resourceId === 'action'));
  assert.equal((await party.snapshot()).profiles.get('gawain').resources.find(resource => resource.id === 'aura-focus').current, 0);
});

test('zwei Instanzen derselben Kreatur führen getrennte TP und verändern ihre gemeinsame Vorlage nicht', async () => {
  const party = await createCombatParty([
    { key: 'gawain', slug: 'gawain-draig', team: 'Draig' },
    { key: 'eins', creature: 'catalog-schwarzer-zitteraal-pluenderer', team: 'Gegner' },
    { key: 'zwei', creature: 'catalog-schwarzer-zitteraal-pluenderer', team: 'Gegner' }
  ]);
  await party.commit(await party.prepare({ actor: 'gawain', targets: ['eins'], actionId: attack('02-drachenbiss') }));
  const state = await party.assertConsistent();
  assert.ok(state.profiles.get('eins').currentHitPoints < 24);
  assert.equal(state.profiles.get('zwei').currentHitPoints, 24);
});

test('Rhiannons höher gewirktes Geschoss kostet den gewählten Grad, lässt sich wiederholen und vollständig zurücknehmen', async () => {
  const party = await createCombatParty(mixed);
  const before = (await party.snapshot()).profiles.get('rhiannon');
  const manaBefore = before.resources.find(resource => resource.id === 'mana-focus').current;
  const receipts = [];
  for (let count = 0; count < 2; count += 1) {
    const result = await party.commit(await party.prepare({ actor: 'rhiannon', targets: ['gildas'], actionId: 'spell:rhiannon-magisches-geschoss', castLevel: 3 }));
    const costs = result.mechanics.commentSegments[0].combatResolution.resourceCosts;
    assert.equal(costs.find(cost => cost.resourceId === 'mana-focus').amount, 5);
    assert.ok(!costs.some(cost => cost.resourceId.startsWith('spell-slot-')));
    receipts.push(result.id);
  }
  assert.equal((await party.snapshot()).profiles.get('rhiannon').resources.find(resource => resource.id === 'mana-focus').current, manaBefore - 10);
  await assert.rejects(() => party.prepare({ actor: 'rhiannon', targets: ['gildas'], actionId: 'spell:rhiannon-magisches-geschoss', castLevel: 4 }), /freigeschaltet/);
  for (const id of receipts.reverse()) await undo(id);
  assert.deepEqual((await party.assertConsistent()).profiles.get('rhiannon').resources, before.resources);
});

test('Freyas bereits ausgelöster Flächenschrei trifft alle Ziele auch wenn der einmalige Eigenschaden sie ausschaltet', async () => {
  const party = await createCombatParty([
    { key: 'freya', slug: 'freya-skald', hitPoints: 2, team: 'Nord' },
    { key: 'eins', creature: 'catalog-schwarzer-zitteraal-raubritter', team: 'Gegner' },
    { key: 'zwei', creature: 'catalog-schwarzer-zitteraal-raubritter', team: 'Gegner' }
  ]);
  const prepared = await party.prepare({ actor: 'freya', targets: ['eins', 'zwei'], actionId: 'ability:freya-arkaner-schrei', dice: new CheckupDice(1) });
  const result = await party.commit(prepared);
  const resolutions = result.mechanics.commentSegments[0].combatResolutions;
  assert.equal(resolutions.length, 2);
  assert.ok(resolutions.every(resolution => (resolution.damage?.total || 0) > 0));
  assert.equal((await party.snapshot()).profiles.get('freya').currentHitPoints, 0);
  await assert.rejects(() => party.prepare({ actor: 'freya', targets: ['eins'], actionId: 'ability:freya-arkaner-schrei' }), /handlungsunfähig/);
  await assert.rejects(() => commitAction(prepared.payload), /handlungsunfähig/);
  await undo(result.id);
  const restored = await party.assertConsistent();
  assert.equal(restored.profiles.get('freya').currentHitPoints, 2);
  assert.equal(restored.profiles.get('eins').currentHitPoints, 67);
  assert.equal(restored.profiles.get('zwei').currentHitPoints, 67);
});
