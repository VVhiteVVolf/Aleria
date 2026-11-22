import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildZitteraaleGroupModules } from '../modules/schwarze-zitteraale/zitteraale-group-modules.mjs';
import { buildZitteraaleModule } from '../modules/schwarze-zitteraale/zitteraale-module.mjs';
import { buildCadwganBiography, buildCadwganCharacterExport } from '../modules/schwarze-zitteraale/sumpfnattern-biography.mjs';
import { CADWGAN_ID, CADWGAN_FAMILY_EMBLEM, SUMPFNATTERN_GROUP } from '../modules/schwarze-zitteraale/sumpfnattern-people.mjs';
import existingThreads from './fixtures/sumpfnattern-existing-threads.json' with { type: 'json' };

const { before, aaleBefore } = existingThreads;

const groups = buildZitteraaleGroupModules();
const group = groups[1];

test('the authored second group retains its existing module and all page/thread identities', () => {
  assert.equal(group.id, before.entry.id);
  assert.equal(group.title, 'Die Sumpfnattern');
  assert.deepEqual(group.pages.map(p => p.commentThreadKey), before.entry.pages.map(p => p.commentThreadKey));
  assert.deepEqual(group.sessionCast, [CADWGAN_ID]);
  assert.deepEqual(group.pages[3].sessionDateAleria, before.entry.pages[3].sessionDateAleria);
  assert.equal(group.pages[3].sessionLocation, 'Lycath · Lager der Sumpfnattern');
});

test('both headquarters use real scene pictures and the new group has two distinct environmental images', () => {
  for (const item of groups.slice(0, 2)) {
    assert.match(item.pages[3].image, /\/scenes\//);
    assert.doesNotMatch(item.pages[3].image, /\/banners\//);
    assert(item.pages[3].sessionPage);
  }
  assert.equal(groups[0].pages[3].commentThreadKey, aaleBefore.entry.pages[3].commentThreadKey);
  assert.equal(groups[0].pages[3].sessionLocation, aaleBefore.entry.pages[3].sessionLocation);
  assert.equal(groups[0].pages[3].sessionIntro, aaleBefore.entry.pages[3].sessionIntro);
  assert.notEqual(group.pages[0].image, group.pages[3].image);
  assert.equal(group.symbol, SUMPFNATTERN_GROUP.emblem);
  assert.notEqual(group.symbol, group.image);
});

test('the biography carries the latest Bwach/Gwaulwyn decision and distinguishes allegations from proven plunder', () => {
  const profile = buildCadwganCharacterExport().character;
  assert.equal(profile.id, 'zitteraale-gruppe-ii-fuehrer');
  assert.equal(profile.name, 'Cadwgan Bwach');
  assert.equal(profile.biography.biography.connections.find(c => c.name === 'Haus Bwach · Gwaulwyn').image, CADWGAN_FAMILY_EMBLEM);
  assert.match(profile.bio, /Gwaulwyn/);
  assert.match(profile.bio, /zwanzig Jahren/);
  assert.match(profile.bio, /albisches Dorf in Ceitheach/);
  assert.match(profile.bio, /nicht unmittelbar nachweisen/);
  assert.match(profile.bio, /seines Ritterstandes enthoben/);
  assert.match(profile.bio, /bevor es zu diesem Verfahren kam/);
  assert.match(profile.bio, /eingegliedert|gliederten/);
  assert.match(profile.bio, /Vendetta/);
  assert.doesNotMatch(JSON.stringify(profile), /Bronfelen|Cadwgan Bwch/);
  for (const key of ['inventory', 'combatProfile', 'worldPersonId', 'familyId', 'age', 'birthYear']) assert(!(key in profile), key);
  assert(buildCadwganBiography().biography.extraSections.every(s => s.position === 'afterWorks'));
});

test('the correct male lieutenants occupy stable seats while six other groups stay unassigned', () => {
  const trees = group.pages[2].hierarchy.trees;
  assert.deepEqual(trees[0].levels.map(l => l.nodes.length), [1, 2, 4, 4, 4, 4]);
  const lieutenants = trees[0].levels[1].nodes;
  assert.deepEqual(lieutenants.map(n => n.id), ['zitteraale-gruppe-ii-leutnant-1', 'zitteraale-gruppe-ii-leutnant-2']);
  assert.match(lieutenants[0].portrait, /leutnant-1-v2/);
  assert.match(lieutenants[1].portrait, /alchemist-v1/);
  assert.doesNotMatch(JSON.stringify(group), /giftkundige|Wildererführerin|Rhodri|Brychan|Tegid/);
  assert.equal(trees[1].levels[0].nodes.length, 8);
  assert.equal(trees[2].levels[0].nodes.length, 4);
  assert(groups.slice(2).every(item => item.pages[1].pageTitle === 'Anführer · unbenannt'));
});

test('the parent hierarchy links the named second group and its actual banner and leader', () => {
  const trees = buildZitteraaleModule().pages.find(p => p.hierarchyPage).hierarchy.trees;
  assert.equal(trees[0].levels[2].nodes[1].id, CADWGAN_ID);
  assert.equal(trees[0].levels[2].nodes[1].title, 'Cadwgan Bwach');
  const node = trees[1].levels[0].nodes[1];
  assert.equal(node.title, 'Die Sumpfnattern');
  assert.equal(node.portrait, SUMPFNATTERN_GROUP.banner);
  assert.match(node.text, /entry=zitteraale-gruppe-ii/);
  assert.match(node.text, /Lycath/);
});

test('all admitted art exists, originals remain byte-identical and technical transforms are explicit', async () => {
  const data = JSON.parse(await readFile(new URL('../docs/art/sumpfnattern-20261122/generation.json', import.meta.url), 'utf8'));
  const active = data.jobs.filter(j => j.active);
  assert.equal(active.length, 9);
  for (const j of active) {
    const root = new URL('../../', import.meta.url);
    const original = await readFile(new URL(j.originalPath, root));
    const target = await readFile(new URL(j.target, root));
    assert.equal(createHash('sha256').update(original).digest('hex'), j.sha256);
    assert.equal(createHash('sha256').update(target).digest('hex'), j.targetSha256);
    if (!j.processing) assert(original.equals(target));
    else assert(j.processing.rgbUnchanged || j.processing.proof?.rgbUnchanged);
    assert.equal(j.visualReview.viewed, true);
  }
  for (const row of group.pages[1].biography.abilities) await access(new URL('../../' + decodeURI(row.icon.slice(1)), import.meta.url));
});
