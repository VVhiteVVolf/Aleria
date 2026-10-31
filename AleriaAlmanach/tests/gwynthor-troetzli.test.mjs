import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { HOUSE_PENRUDD_FAMILY as penrudd } from '../../Stammbäume/assets/js/data/house-penrudd-family.js';
import { HOUSE_LLYTHFOR_FAMILY as llythfor } from '../../Stammbäume/assets/js/data/house-llythfor-family.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../../Stammbäume/assets/js/adapters/family-chart-layout-policy.js';
import { assertMirroredCrossFamilyBatch } from '../../Stammbäume/assets/js/modules/family-sync/cross-family-sync-invariant.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { TROETZLI_PEOPLE, LLYTHFOR_MARRIAGE_ID, LLYTHFOR_EMBLEM } from '../modules/gwynthor-troetzli/troetzli-household.mjs';
import { TROETZLI_CREATURE_SOURCE } from '../modules/creatures/catalog/troetzli.js';
import { sanitizeCreature } from '../modules/creatures/creature-model.js';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { buildTroetzliCharacterExports } from '../scripts/build-gwynthor-troetzli.mjs';
import { buildTroetzliNotice, TROETZLI_NOTICE_ID } from '../../Anzeigetafeln/tools/quests/troetzli.mjs';
import { buildGwynthorQuestPack } from '../../Anzeigetafeln/tools/build-gwynthor-quest-notices.mjs';
import { FEARNAN_NOTICE_ID } from '../../Anzeigetafeln/tools/build-household-quests.mjs';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';

const root = new URL('../../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));

test('the new adult daughter is mirrored, while her child continues only behind the Llythfor link', () => {
  assert.equal(assertMirroredCrossFamilyBatch([{ family: penrudd }, { family: llythfor }]), true);
  for (const family of [penrudd, llythfor]) {
    assert.deepEqual(assertValidFamily(family).diagnostics, []);
    assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
    for (const key of ['esyllt', 'cynddelw']) {
      assert.equal(family.persons.find(p => p.id === TROETZLI_PEOPLE[key].id).worldPersonId, TROETZLI_PEOPLE[key].worldPersonId);
    }
    assert.ok(family.partnerships.some(p => p.id === LLYTHFOR_MARRIAGE_ID));
  }
  assert.deepEqual(penrudd.parentages.find(p => p.childId === 'esyllt-penrudd').parentIds, ['tudur-penrudd', 'bethan-penrudd']);
  assert.ok(Number(TROETZLI_PEOPLE.esyllt.birth) > 1704);
  assert.ok(!penrudd.persons.some(p => p.id === 'eirlys-llythfor'));
  assert.ok(!penrudd.parentages.some(p => p.partnershipId === LLYTHFOR_MARRIAGE_ID));
  assert.deepEqual(llythfor.parentages.find(p => p.childId === 'eirlys-llythfor').parentIds, ['cynddelw-llythfor', 'esyllt-penrudd']);
  assert.equal(llythfor.persons.find(p => p.id === 'eirlys-llythfor').portraitPlaceholder, 'child');
  const daughter = llythfor.persons.find(p => p.id === 'eirlys-llythfor');
  assert.equal(daughter.birth, '1730');
  assert.equal(daughter.extensions.portraitAge, 10);
  assert.match(daughter.portrait, /eirlys-llythfor\.png$/);
  assert.equal(penrudd.cadetBranches.find(b => b.parentPartnershipId === LLYTHFOR_MARRIAGE_ID).targetFamilyId, 'haus-llythfor');
  assert.equal(llythfor.document.emblem, LLYTHFOR_EMBLEM);
  assert.equal(llythfor.timeJumps.length, 1);
  assert.deepEqual(llythfor.timeJumps[0].childIds, ['cynddelw-llythfor']);
});

test('upgrading the old Penrudd tree adds the married-away household without overwriting an existing relative', () => {
  const prior = structuredClone(penrudd);
  prior.extensions.sourceRevision = 2;
  prior.persons = prior.persons.filter(p => !['esyllt-penrudd', 'cynddelw-llythfor'].includes(p.id));
  prior.partnerships = prior.partnerships.filter(p => p.id !== LLYTHFOR_MARRIAGE_ID);
  prior.parentages = prior.parentages.filter(p => p.childId !== 'esyllt-penrudd');
  prior.cadetBranches = [];
  const old = prior.persons.find(p => p.id === 'carwyn-penrudd');
  old.birth = '1693'; old.extensions.personalNote = 'Lokale Notiz bewahren';
  const upgraded = resolveRegisteredFamilyUpgrade(penrudd, prior);
  assert.deepEqual(upgraded.persons.find(p => p.id === old.id), old);
  assert.ok(upgraded.persons.some(p => p.id === 'esyllt-penrudd'));
  assert.ok(!upgraded.persons.some(p => p.id === 'eirlys-llythfor'));
  assert.deepEqual(resolveRegisteredFamilyUpgrade(penrudd, upgraded), upgraded);
});

test('the reporter has one owned horse with the actual Rhyfel profile and no generic rideability claim', async () => {
  const horse = sanitizeCreature(TROETZLI_CREATURE_SOURCE);
  assert.equal(horse.bestiaryReference.id, 'tiere/pferde/rhyfel');
  await read('Bestiarium/tiere/pferde/rhyfel/profil.json');
  assert.equal(getBuiltinCreatureTemplates().filter(c => c.id === horse.id).length, 1);
  const exports = buildTroetzliCharacterExports();
  const owner = exports.find(e => e.character.id === horse.itemOrigin.ownerCharacterId).character;
  assert.equal(owner.inventory.companions.length, 1);
  assert.equal(owner.inventory.companions[0].creatureId, horse.id);
  assert.equal(owner.inventory.items[0].creatureId, horse.id);
  assert.equal(owner.inventory.items[0].ownerCharacterId, owner.id);
  assert.match(owner.inventory.companions[0].role, /nicht reitbar/);
  assert.ok(!horse.combatProfile.abilities.some(a => a.name === 'Reittier'));
  const wife = exports.find(e => e.character.id === TROETZLI_PEOPLE.esyllt.worldPersonId).character;
  assert.deepEqual(wife.genealogy.relationships.parents.map(p => p.name), ['Tudur Penrudd', 'Bethan']);
  assert.equal(wife.genealogy.relationships.children[0].name, 'Eirlys Llythfor');
  assert.equal(wife.genealogy.sources.length, 2);
});

test('the notice joins Hilfe as its own publication and never adds a poster or reveals an invented trauma', async () => {
  const pack = await buildGwynthorQuestPack();
  const context = { window: {} };
  vm.runInNewContext(await readFile(new URL('Anzeigetafeln/assets/js/notes/notice-stacks.js', root), 'utf8'), context);
  const model = context.window.TafelNoticeStacks, notice = buildTroetzliNotice();
  const stack = model.members(pack.zettel, FEARNAN_NOTICE_ID);
  assert.deepEqual(Array.from(stack, n => n.id), [FEARNAN_NOTICE_ID, TROETZLI_NOTICE_ID]);
  assert.equal(model.publication(pack.zettel, TROETZLI_NOTICE_ID).notices.length, 1);
  assert.ok(!pack.boardBindings.some(b => b.noticeId === TROETZLI_NOTICE_ID));
  const layout = await read('Anzeigetafeln/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor/board-layout.json');
  assert.equal(layout.layout.posters.find(p => p.id === 'gwynthor-poster-hilfe').noticeId, FEARNAN_NOTICE_ID);
  assert.match(notice.text, /fünfhundert Kupfer/);
  assert.match(notice.text, /sechs Stunden/);
  assert.match(notice.text, /was er erlebt hat, weiß ich nicht/);
  assert.match(notice.text, /Tudur Penrudd/);
  assert.match(notice.portrait, /eirlys-skizze-v1\.webp$/);
  assert.doesNotMatch(JSON.stringify(notice), /portraits\/troetzli\.png/);
  assert.match(notice.media.portrait.name, /Eirlys/);
  assert.deepEqual(notice.rewards[0], { kind: 'money', currency: 'copper', amount: 50,
    condition: 'Für die sichere Übergabe Trötzlis an Tudur Penrudd auf dem Penrudd-Hof.' });
  assert.deepEqual(notice.rewards.slice(1).map(item => [item.title, item.quantity]), [['Schickes Notizbuch', 1], ['Schreibutensilien', 1]]);
  for (const reward of notice.rewards.slice(1)) {
    assert.ok(STANDARD_ITEMS.some(item => item.id === reward.itemId));
    await readFile(new URL(reward.image.slice(1), root));
  }
  for (const field of ['verfasser', 'portrait', 'unterschrift', 'siegel']) await readFile(new URL(notice[field], new URL('Anzeigetafeln/tafel.html', root)));
});

test('reviewable snapshots and public records retain the same identities and genealogy', async () => {
  const snapshots = await Promise.all(['haus-penrudd', 'haus-llythfor'].map(id => read(`Stammbäume/assets/data/published-families/${id}.json`)));
  for (const { family } of snapshots) assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  assert.equal(assertMirroredCrossFamilyBatch(snapshots), true);
  const database = await read('CharakterDatenbank/generated/characters.snapshot.json');
  for (const expected of buildTroetzliCharacterExports()) {
    const character = database.characters.find(c => c.id === expected.character.id);
    assert.equal(character.identity.worldPersonId, expected.character.identity.worldPersonId);
    assert.deepEqual(character.genealogy, expected.character.genealogy);
  }
});
