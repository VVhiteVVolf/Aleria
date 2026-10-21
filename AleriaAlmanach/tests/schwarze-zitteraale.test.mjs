import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { buildZitteraaleModule } from '../modules/schwarze-zitteraale/zitteraale-module.mjs';
import { ZITTERAALE_LEADERS, BRADHRITH_FORMER_MEMBERS } from '../modules/schwarze-zitteraale/zitteraale-people.mjs';
import { buildZitteraaleCharacters, buildZitteraalInventory, ZUNDER_CREATURE_ID } from '../modules/schwarze-zitteraale/zitteraale-characters.mjs';
import { upgradeZitteraaleEntry } from '../modules/schwarze-zitteraale/zitteraale-migration.mjs';
import { ZITTERAAL_ZUNDER } from '../modules/creatures/catalog/zitteraal-zunder.js';
import { mergeCharacterExportAssignments } from '../../CharakterDatenbank/lib/character-export-assignments.mjs';
import { buildCharacterDatabase } from '../../CharakterDatenbank/lib/character-database-model.mjs';
const entry = buildZitteraaleModule();

test('five criminal dossiers use sketches and authoritative HTML bounties', () => {
  assert.equal(entry.pages.length, 9);
  const dossiers = entry.pages.filter(p => p.bountyFilePage);
  assert.equal(dossiers.length, 5);
  assert.deepEqual(ZITTERAALE_LEADERS.map(p => p.bountyCopper), [35000,13000,11000,5000,3400]);
  for (const [i, page] of dossiers.entries()) {
    assert.equal(page.bountyFile.portraitImage, ZITTERAALE_LEADERS[i].sketch);
    assert.equal(page.bountyFile.bountyCurrency, 'Goldtaler');
    assert.ok(!JSON.stringify(page).includes('/portraits/'));
  }
  assert.doesNotMatch(JSON.stringify(entry), /Garik|Brann|Noch einer|Tegid|Rhodri|Brychan|35\.000 Taler/);
  assert.equal(new Set(entry.pages.map(p=>p.commentThreadKey)).size, entry.pages.length);
});
test('pyramid, six 13-person packs and eleven former attackers are independent', () => {
  const trees = entry.pages.find(p=>p.hierarchyPage).hierarchy.trees;
  assert.deepEqual(trees[0].levels.map(l=>l.nodes.length), [1,2,2]);
  assert.equal(trees[1].label, 'Gruppen');
  for (const tree of trees.slice(2)) assert.deepEqual(tree.levels.slice(0,4).map(l=>l.nodes.length), [1,4,4,4]);
  const former = trees[2].levels.at(-1);
  assert.match(former.label, /Ehemalige \/ Tote/);
  assert.equal(former.nodes.length, 11);
  assert.ok(former.nodes.some(p=>/Verhöre/.test(p.subtitle)));
  assert.equal(BRADHRITH_FORMER_MEMBERS.filter(p=>/verurteilt/.test(p.status)).length,2);
  assert.ok(!former.nodes.some(p=>/hingerichtet/.test(p.subtitle)));
});
test('character exports classify all five in the existing gang without replacing other groups', () => {
  const characters = buildZitteraaleCharacters();
  const previous = {tabs:['Alle','Andere'],map:{Andere:['existing']}};
  const exports = characters.map(character=>({character,assignedTab:'Schwarze Zitteraale'}));
  const charTabs = mergeCharacterExportAssignments(previous, exports);
  assert.deepEqual(previous.map,{Andere:['existing']});
  assert.deepEqual(mergeCharacterExportAssignments(charTabs,exports),charTabs);
  const db=buildCharacterDatabase({characters,charTabs},[]);
  assert.equal(db.records.length,5);
  for (const item of db.records) assert.equal(item.record.classification.primary.id,'schwarze-zitteraale');
  const inventory=buildZitteraalInventory();
  assert.equal(inventory.items.length,3);
  assert.deepEqual(inventory.items.slice(0,2).map(i=>i.name),['Donnergrollen','Zitteraal-Plattenpanzer']);
  assert.equal(inventory.companions[0].creatureId,ZUNDER_CREATURE_ID);
  assert.equal(ZITTERAAL_ZUNDER.id,ZUNDER_CREATURE_ID);
  assert.equal(ZITTERAAL_ZUNDER.itemOrigin.inventoryItemId,inventory.companions[0].inventoryItemId);
  assert.match(ZITTERAAL_ZUNDER.bestiaryReference.url,/\/rhyfel\//);
});
test('commissioned cleanup drops every legacy page while retaining edits to the nine new pages', () => {
  const scene = { ...entry.pages.at(-1), sessionIntro: 'Bearbeitete neue Szene' };
  const before={id:entry.id,custom:'preserved',zitteraaleRevision:'20261021-bandenakte-v1',pages:[
    ...entry.pages.slice(0,-1), scene,
    {pageTitle:'Alte Übersicht'}, {commentThreadKey:'legacy-bounty',pageTitle:'Alte Kopfgeldakte'},
    {commentThreadKey:'user-custom',pageTitle:'Alte eigene Seite'}, {commentThreadKey:'comments',commentsPage:true,pageTitle:'Alte Kommentare'}
  ]};
  const next=upgradeZitteraaleEntry(before,entry);
  assert.equal(next.custom,'preserved');assert.equal(next.pages.length,9);
  assert.deepEqual(next.pages.map(p=>p.commentThreadKey),entry.pages.map(p=>p.commentThreadKey));
  assert.equal(next.pages.at(-1).sessionIntro,'Bearbeitete neue Szene');
  assert.notEqual(next.pages.at(-1),scene);
  assert.equal(upgradeZitteraaleEntry(next,entry),next);
  assert.equal(before.pages.length,13);
  const unrelated={id:'another-module',pages:[{pageTitle:'Keep'}]};
  assert.equal(upgradeZitteraaleEntry(unrelated,entry),unrelated);
});
test('built-in registration replaces the existing module once', async () => {
  const context=vm.createContext({SECTIONS:[{key:'Kriminalität',entries:[{id:entry.id,pages:[]}]}],structuredClone});
  const script=await readFile(new URL('../modules/schwarze-zitteraale/zitteraale-data.js',import.meta.url),'utf8');
  vm.runInContext(script,context);
  assert.equal(context.SECTIONS[0].entries.length,1);
  assert.equal(context.SECTIONS[0].entries[0].pages.length,9);
});
test('all project image paths in the module and inventory exist', async () => {
  const json=JSON.stringify([entry,buildZitteraalInventory()]);
  const paths=new Set([...json.matchAll(/\/(AleriaAlmanach\/[^"<>]+\.(?:png|webp))/g)].map(m=>m[1]));
  for (const path of paths) await access(new URL(`../../${path}`,import.meta.url));
});
