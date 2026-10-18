import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildGwregysduHarbor, HARBOR_SECTION } from '../modules/gwregysdu-harbor/harbor-module.mjs';
import { HOUSE_GWREGYSDU_FAMILY as family } from '../../Stammbäume/assets/js/data/house-gwregysdu-family.js';
import { HOUSE_BRADRHITH_FAMILY as bradrhith } from '../../Stammbäume/assets/js/data/house-bradrhith-family.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../../Stammbäume/assets/js/adapters/family-chart-layout-policy.js';

test('Gwregysdu genealogy preserves the established Bradrhith people and the uncle relationship', () => {
  assert.deepEqual(assertValidFamily(family).diagnostics, []);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  const byId = new Map(family.persons.map(p => [p.id, p]));
  const gruffudd = byId.get('gruffudd-gwregysdu');
  const oldGruffudd = bradrhith.persons.find(p => p.id === gruffudd.id);
  for (const key of ['worldPersonId', 'birth', 'status', 'portrait']) assert.equal(gruffudd[key], oldGruffudd[key]);
  assert.equal(byId.get('arianwen-bradrhith').worldPersonId, bradrhith.persons.find(p => p.id === 'arianwen-bradrhith').worldPersonId);
  assert.equal(new Set(family.persons.map(p => p.worldPersonId)).size, family.persons.length);
  const children = id => family.parentages.filter(r => r.parentIds.includes(id)).map(r => r.childId);
  assert.deepEqual(children('idris-gwregysdu'), ['heddwyn-gwregysdu', 'gwenllian-gwregysdu', 'rhodri-gwregysdu', gruffudd.id, 'esyllt-gwregysdu']);
  assert.deepEqual(children('dyfnwal-gwregysdu'), ['bleddyn-gwregysdu', 'idris-gwregysdu']);
  assert.deepEqual(children('bleddyn-gwregysdu'), ['cynan-gwregysdu', 'tudur-gwregysdu']);
  const link = family.cadetBranches.find(b => b.targetFamilyId === 'haus-bradrhith');
  assert.equal(link.linkType, 'married-away');
  assert.equal(link.parentPartnershipId, 'marriage-arianwen-gruffudd');
  assert.ok(!family.persons.some(p => ['arianwen-sohn-1', 'arianwen-sohn-2', 'arianwen-tochter'].includes(p.id)), 'children stay in their target family');
  for (const r of family.parentages) for (const parentId of r.parentIds) {
    const parent = byId.get(parentId), child = byId.get(r.childId);
    assert.ok(Number(child.birth) - Number(parent.birth) >= 18, `${parentId} at ${child.id} birth`);
    assert.ok(!parent.death || Number(parent.death) >= Number(child.birth));
  }
  for (const p of family.partnerships) for (const id of p.participantIds) {
    assert.ok(Number(p.start) - Number(byId.get(id).birth) >= 18, `${id} at marriage`);
  }
});

test('harbor has seven distinct pages, six services and the requested anonymous guard strength', () => {
  const entry = buildGwregysduHarbor();
  assert.equal(entry.pages.length, 7);
  assert.equal(entry.pages.filter(p => p.sessionPage).length, 3);
  assert.equal(new Set(entry.pages.map(p => p.commentThreadKey)).size, 7);
  assert.equal(entry.pages.filter(p => p.guildServicesPage)[0].guildServices.services.length, 6);
  assert.ok(!entry.pages.some(p => p.tradeCatalogPage));
  const hierarchy = entry.pages.find(p => p.hierarchyPage).hierarchy;
  const groups = hierarchy.trees.filter(t => t.id.startsWith('wachgruppe-'));
  assert.equal(groups.length, 3);
  assert.ok(groups.every(t => t.levels.length === 2 && t.levels.every(l => l.nodes.length === 4)));
  const officers = hierarchy.trees.find(t => t.id === 'wache');
  assert.deepEqual(officers.levels.map(l => l.nodes.length), [1, 2]);
  assert.equal(new Set(groups.flatMap(t => t.levels.flatMap(l => l.nodes.map(n => n.portrait)))).size, 1);
  assert.ok(hierarchy.trees.find(t => t.id === 'logistik').levels.every(l => l.nodes.every(n => !n.portrait)));
  assert.deepEqual(hierarchy.trees.find(t => t.id === 'fuehrung').levels.flatMap(l => l.nodes.map(n => n.title)), ['Bleddyn Gwregysdu', 'Cynan Gwregysdu', 'Tudur Gwregysdu']);
});

test('loading the harbor bundle twice retains exactly one module and respects existing entries', async () => {
  const source = await readFile(new URL('../modules/gwregysdu-harbor/harbor-data.js', import.meta.url), 'utf8');
  const entry = buildGwregysduHarbor();
  for (const entries of [[], [{ id: entry.id, title: 'Existing' }]]) {
    const context = vm.createContext({ SECTIONS: [{ ...HARBOR_SECTION, entries }] });
    vm.runInContext(source, context); vm.runInContext(source, context);
    const matches = context.SECTIONS.flatMap(s => s.entries).filter(e => e.id === entry.id);
    assert.equal(matches.length, 1);
    if (entries[0]?.title === 'Existing') assert.equal(matches[0].title, 'Existing');
  }
});

test('all nineteen requested artwork assets exist and match their recorded formats and hashes', async () => {
  const root = new URL('../../', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('../assets/gwregysdu-harbor/image-results.json', import.meta.url), 'utf8'));
  assert.equal(manifest.images.length, 19);
  assert.equal(new Set(manifest.images.map(i => i.destination)).size, 19);
  for (const image of manifest.images) {
    const bytes = await readFile(new URL(image.destination, root));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    assert.equal(width, image.width); assert.equal(height, image.height);
    assert.equal(image.id === 'wappen' ? width : width * 3, image.id === 'wappen' ? height : height * 2);
  }
});
