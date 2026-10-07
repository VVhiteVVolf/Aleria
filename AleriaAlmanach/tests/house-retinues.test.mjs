import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { buildDrakenschluck } from '../modules/house-retinues/drakenschluck-model.mjs';
import { buildMelynwyrrd } from '../modules/house-retinues/melynwyrrd-model.mjs';
const root = new URL('../modules/house-retinues/', import.meta.url);
const sources = ['drakenschluck','melynwyrrd'].map(name => JSON.parse(readFileSync(new URL(`sources/${name}.json`,root),'utf8')));
const entries = [buildDrakenschluck(sources[0]), buildMelynwyrrd(sources[1])];
const strings = value => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
const roles = entry => entry.pages.flatMap(page => (page.hierarchy?.trees || []).flatMap(tree => tree.levels.flatMap(level => level.nodes)));

test('both ten-page organizations retain substantive source text and use the requested templates', () => {
  entries.forEach((entry,index) => {
    assert.equal(entry.pages.length,10);
    assert.equal(entry.pages.filter(page=>page.guildPage).length,1);
    assert.equal(entry.pages.filter(page=>page.hierarchyPage).length,3);
    assert.equal(entry.pages.filter(page=>page.organizationNetworkPage).length,1);
    const content=strings(entry).join('\n');
    for(const block of sources[index].blocks.filter(block=>block.text.length>100)) assert(content.includes(block.html.replaceAll('Melynwyrdd','Melynwyrrd')),`Source lost: ${block.text.slice(0,65)}`);
    assert.doesNotMatch(content,/Jahr 0 - 100|Jahr \?\?\?|\.\.\. Text \.\.\./);
  });
});

test('role hierarchies include complete rank ladders, connected departments and unoccupied expansion places', () => {
  const rankLists=[['Drakenführer','Drakenhauptmann','Drakensöldner','Drachling','Rekrut'],['Erzgauner','Ritterdieb','Schattenknappe','Streuner']];
  entries.forEach((entry,index)=>{
    const nodes=roles(entry);
    assert.equal(nodes.length,index===0?58:63);
    assert.equal(nodes.filter(node=>node.title.startsWith('Freier Platz')).length,index===0?6:7);
    assert.equal(entry.pages.reduce((count,page)=>count+(page.hierarchy?.trees.length||0),0),index===0?10:11);
    for(const title of rankLists[index]) assert(nodes.some(node=>node.title===title&&node.subtitle.includes('Überlieferter Rang')),title);
    for(const node of nodes) {
      assert.match(node.text,/Unterstellung/);
      assert.doesNotMatch(node.portrait,/portraits\//);
      assert.doesNotMatch(node.text,/Edlym|Olwen|Evrel|Wendy|Arfon|Talfryn/);
      if(node.title.startsWith('Freier Platz')) assert.equal(node.portrait,'');
    }
    for(const page of entry.pages.filter(page=>page.hierarchyPage)) {
      assert.equal(page.hierarchy.treeDisplayMode,'tabs');
      const trees=page.hierarchy.trees, byId=new Map(trees.map(tree=>[tree.id,tree]));
      assert(trees.length>=3&&trees.length<=4);
      assert.equal(byId.size,trees.length);
      assert.equal(trees.filter(tree=>!tree.parentTreeId).length,1);
      for(const tree of trees) {
        assert(tree.levels.length<=12);
        assert(tree.levels.every(level=>level.nodes.length<=6));
        const seen=new Set([tree.id]); let parent=tree.parentTreeId;
        while(parent) {assert(byId.has(parent));assert(!seen.has(parent));seen.add(parent);parent=byId.get(parent).parentTreeId;}
      }
    }
  });
});

test('classic hierarchy sanitation preserves all branches, descriptions and blank portraits', () => {
  const context=vm.createContext({window:{},deepClone:structuredClone});
  vm.runInContext(readFileSync(new URL('../modules/module-editor/module-editor-data.js',import.meta.url),'utf8'),context);
  for(const page of entries.flatMap(entry=>entry.pages).filter(page=>page.hierarchyPage)) {
    context.input=page.hierarchy;
    const sanitized=JSON.parse(JSON.stringify(vm.runInContext('sanitizeHierarchyData(input)',context)));
    assert.deepEqual(sanitized.trees,page.hierarchy.trees);
  }
});

test('registration is idempotent, keeps existing mercenaries and leaves edited modules intact', () => {
  const context=vm.createContext({SECTIONS:[{key:'Söldner',tab:'Söldner',entries:[{id:'windreiter',title:'Existing'}]}]});
  const source=readFileSync(new URL('house-retinues-data.js',root),'utf8');
  vm.runInContext(source,context);
  assert.equal(context.SECTIONS[0].entries.length,1);
  assert.deepEqual(Array.from(context.SECTIONS[1].path),['Drakenschluck Söldner']);
  assert.equal(context.SECTIONS[2].tab,'Banden');
  assert.match(context.SECTIONS[2].iconUrl,/banden\.png$/);
  context.SECTIONS[1].entries[0].title='Edited';
  vm.runInContext(source,context);
  assert.equal(context.SECTIONS.length,3);
  assert.equal(context.SECTIONS[1].entries.length,1);
  assert.equal(context.SECTIONS[1].entries[0].title,'Edited');
});

test('artwork resolves locally, scenes are 2:3 and the new parchment icon is square', () => {
  const base=new URL('../AleriaAlmanach.html',import.meta.url);
  for(const reference of strings(entries).filter(value=>/^\.\.?\//.test(value))) {const url=new URL(reference,base);url.search='';assert(existsSync(url),reference);}
  const manifest=JSON.parse(readFileSync(new URL('image-prompts.json',root),'utf8'));
  for(const image of manifest.images) {
    const bytes=readFileSync(new URL(`../../${image.file}`,import.meta.url));
    const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
    assert.equal(image.id==='banden'?width:width*3,image.id==='banden'?height:height*2,image.id);
    if(image.id.startsWith('drakenschluck')) assert.match(image.prompt,/CLOSED|closed/);
  }
  assert.match(manifest.images.find(image=>image.id==='melynwyrrd-dieb').prompt,/watercolor, gouache/);
  const guild=entries[1].pages.find(page=>page.guildPage).guild;
  assert.equal(guild.connections.length,5);
  assert(guild.abilities.every(trait=>trait.icon));
});

test('networks distinguish house seats, contracted posts and the two unrelated Last Rest inns', () => {
  const networks=entries.map(entry=>entry.pages.find(page=>page.organizationNetworkPage).organizationNetwork);
  assert.equal(networks[0].sites[0].name,'Drakenburg');
  assert.equal(networks[1].sites.length,7);
  assert.match(networks[1].note,/nicht mit „Celtigerns Letzte Rast“/);
  assert(networks[1].sites.every(site=>site.region.startsWith('Sonnenküste')));
  const context=vm.createContext({});
  vm.runInContext(readFileSync(new URL('../modules/organization-network/organization-network-data.js',import.meta.url),'utf8'),context);
  for(const network of networks) {
    context.input=network;
    const sanitized=JSON.parse(JSON.stringify(vm.runInContext('sanitizeOrganizationNetworkData(input)',context)));
    assert.deepEqual(sanitized.sites.map(site=>site.kind),network.sites.map(site=>site.kind));
  }
});
