import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import pages from '../modules/dunfal/pages.source.json' with {type:'json'};
import {createTerritory} from '../modules/dunfal/territory-page.mjs';
import {TADG_NUADAT_PORTRAIT} from '../../Stammbäume/assets/js/data/dunfal-portrait-upgrade.js';
import {DUNFAL_HOUSE_DEFINITIONS} from '../../Stammbäume/assets/js/data/dunfal-territorial-catalog.js';

const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../assets/js/herrschaft-data.js',import.meta.url),'utf8'),context);
const data=context.window.ALERIA_HERRSCHAFT_DATA;

test('thirteen prepared Dunfal pages share the shell; only territorial name meanings supplement the empty prose',()=>{
  assert.equal(pages.pages.length,13);
  for(const source of pages.pages){
    assert.deepEqual(Object.keys(source.copy).filter(key=>key!=='geography'),[]);
    const page=createTerritory(source.id,data);assert.equal(page.meta.id,source.id);
    for(const member of source.councilGroups.flatMap(g=>g.members)){
      if(member.imageSrc)assert.ok(fs.existsSync(new URL('../..'+member.imageSrc,import.meta.url)),member.imageSrc);
    }
    for(const section of source.families)for(const house of section.houses){
      assert.ok(house.imageSrc);assert.ok(fs.existsSync(new URL('../..'+house.imageSrc,import.meta.url)));
    }
  }
});

test('main view lists every clan once, while place registers and links retain their hierarchy',()=>{
  const byId=new Map(pages.pages.map(p=>[p.id,p]));
  assert.deepEqual(byId.get('fuerstentum-dunfal').territoryLinks,['oberherrschaft-tir-na-rithe','oberherrschaft-tir-na-fathach']);
  assert.equal(byId.get('oberherrschaft-tir-na-rithe').territoryLinks.length,4);
  assert.equal(byId.get('oberherrschaft-tir-na-fathach').territoryLinks.length,6);
  const houses=byId.get('fuerstentum-dunfal').families.flatMap(s=>s.houses);
  assert.deepEqual(new Set(houses.map(h=>h.familyId)),new Set(DUNFAL_HOUSE_DEFINITIONS.map(h=>h.familyId)));
  assert.equal(houses.length,13);
  assert.equal(byId.get('fuerstentum-dunfal').domains.length,1);
  assert.ok(!pages.pages.some(p=>/^(I|II|III)\. Herrschaft$/.test(p.title)));
});

test('the corrected Tadg portrait is shared by the principality and Fathach council',()=>{
  for(const id of ['fuerstentum-dunfal','oberherrschaft-tir-na-fathach']){
    const member=pages.pages.find(p=>p.id===id).councilGroups.flatMap(g=>g.members).find(m=>m.name==='Tadg Nuadat');
    assert.equal(member.imageSrc,'/Stammbäume/'+TADG_NUADAT_PORTRAIT);
    assert.match(member.href,/family=haus-nuadat.*person=tadg-1663-nuadat/);
  }
});

test('all 133 places remain reachable, including the 28 places with pending clan allocation',()=>{
  const markers=JSON.parse(fs.readFileSync(new URL('../../Karten/Dunfal/markers.source.json',import.meta.url),'utf8')).markers;
  const listed=pages.pages.flatMap(p=>p.domains.flatMap(d=>d.sections.flatMap(s=>s.placeIds)));
  assert.equal(listed.length,133);
  assert.deepEqual(new Set(listed),new Set(markers.map(m=>m.id)));
  const pending=pages.pages.find(p=>p.id==='oberherrschaft-tir-na-fathach').domains.filter(d=>d.territoryId.startsWith('dunfal-offen-'));
  assert.equal(pending.length,3);
  assert.equal(pending.flatMap(d=>d.sections.flatMap(s=>s.placeIds)).length,28);
});
