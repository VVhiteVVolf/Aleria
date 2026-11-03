import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PATRICK_BIOGRAPHY_ASSETS, PATRICK_BIOGRAPHY_ASSET_ALIASES } from '../modules/patrick-biographies/biography-assets.mjs';
import { PATRICK_BIOGRAPHY_ENTRIES, buildPatrickBiographyModule, preparePatrickBiographyModule, preparePatrickBiographyCharacters, getPatrickBiographyPersonFields } from '../modules/patrick-biographies/biography-source.mjs';
import { CADOGAN_CHARACTER_ID, RHIANNON_CHARACTER_ID, GWEN_CHARACTER_ID } from '../modules/patrick-biographies/biography-identities.mjs';
import { HOUSE_SGRECHIWR_FAMILY } from '../../Stammbäume/assets/js/data/house-sgrechiwr-family.js';
import { HOUSE_DRAENMELYN_FAMILY } from '../../Stammbäume/assets/js/data/house-draenmelyn-family.js';
import { HOUSE_SWYLL_FAMILY } from '../../Stammbäume/assets/js/data/house-swyll-family.js';
import { HOUSE_HAMNETT_FAMILY } from '../../Stammbäume/assets/js/data/house-hamnett-family.js';
import { withPatrickBiographyFamily } from '../../Stammbäume/assets/js/data/patrick-biography-family-overlay.js';
import { reconcileFamilyWithProjectOrigin } from '../../Stammbäume/assets/js/modules/family-sync/project-origin-reconciliation.js';
import { getPersonBiographyModule } from '../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';

const now='2026-11-03T18:00:00.000Z',root=new URL('../../',import.meta.url);
const source=JSON.parse(readFileSync(new URL('../modules/patrick-biographies/source/biographies-2026-11-03.json',import.meta.url),'utf8'));
const familyPeople=family=>family.persons.filter(person=>['cadogan-sgrechiwr','unknown-cadogan-spouse','rhiannon-draenmelyn'].includes(person.id));

test('three shared biographies retain all supplied prose exactly and use only reviewed table repairs',()=>{
  for(const original of source.entries){
    assert.equal(createHash('sha256').update(JSON.stringify(original.biographyModule)).digest('hex'),original.provenance.originalBiographySha256);
    const result=buildPatrickBiographyModule(original.key);
    for(const field of ['biographyText','historyText','extraSections','works','trivia','quotes'])assert.deepEqual(result.biography[field],original.biographyModule.biography[field]);
    assert(result.biography.abilities.every(ability=>ability.icon&&!['*','✦'].includes(ability.icon)));
  }
  const cad=buildPatrickBiographyModule(CADOGAN_CHARACTER_ID),rhi=buildPatrickBiographyModule(RHIANNON_CHARACTER_ID);
  assert.equal(cad.stats.find(row=>row.label==='Geburtsort').value,'Lynthor');
  assert.equal(cad.stats.find(row=>row.label==='Wohnsitz').value,'Gwynthor');
  assert.match(rhi.stats.find(row=>row.label==='Rolle').value,/Wappen- und Zeichenmeisterin/);
});

test('every mapped trait file exists and only proven local image casing or the missing Myrddin portrait is repaired',()=>{
  const receipts=JSON.parse(readFileSync(new URL('../modules/patrick-biographies/biography-assets.publication.json',import.meta.url),'utf8'));
  assert.equal(receipts.schema,'aleria.biography-artwork-publication');assert.equal(receipts.schemaVersion,1);
  for(const [key,path]of Object.entries(PATRICK_BIOGRAPHY_ASSETS))if(key.startsWith('trait:')){
    if(path.startsWith('/'))assert(existsSync(new URL(`.${decodeURIComponent(path)}`,root)),key);
    else{
      const receipt=receipts.entries.find(entry=>entry.key===key&&entry.url===path);assert(receipt,key);
      assert(receipt.localPath.startsWith('AleriaAlmanach/public/assets/biography-trait-icons/')&&!receipt.localPath.includes('..'));
      const bytes=readFileSync(new URL(receipt.localPath,root));assert.equal(createHash('sha256').update(bytes).digest('hex'),receipt.sha256,key);
    }
  }
  const originals=JSON.parse(readFileSync(new URL('../modules/patrick-biographies/biography-assets.originals.json',import.meta.url),'utf8'));
  assert.equal(originals.entries.length,5);assert.equal(Object.keys(PATRICK_BIOGRAPHY_ASSET_ALIASES).length,5);
  for(const original of originals.entries){
    assert.equal(PATRICK_BIOGRAPHY_ASSET_ALIASES[original.sourceUrl],original.url);
    assert(original.localPath.startsWith('AleriaAlmanach/assets/biographies/patrick-20261103/originals/')&&!original.localPath.includes('..'));
    assert.equal(createHash('sha256').update(readFileSync(new URL(original.localPath,root))).digest('hex'),original.sha256);
  }
  const resolvedGwen=getPatrickBiographyPersonFields(GWEN_CHARACTER_ID).portrait;
  assert.equal(resolvedGwen,PATRICK_BIOGRAPHY_ASSET_ALIASES['https://i.imgur.com/kW95wwz.jpeg']);
  assert.equal(HOUSE_SGRECHIWR_FAMILY.persons.find(person=>person.id==='unknown-cadogan-spouse').portrait,resolvedGwen);
  assert.equal(HOUSE_HAMNETT_FAMILY.persons[0].portrait,resolvedGwen);
  assert.equal(buildPatrickBiographyModule(GWEN_CHARACTER_ID).biography.portrait,resolvedGwen);
  for(const row of PATRICK_BIOGRAPHY_ENTRIES){
    const bio=buildPatrickBiographyModule(row.key).biography;
    for(const connection of bio.connections||[]){
      assert(!/\/stammb(?:%C3%A4|ä)ume\//i.test(connection.image||'')||!/\/stammb/.test(connection.image||''));
      if(connection.image?.startsWith('/Stammbäume/'))assert(existsSync(new URL(`.${connection.image}`,root)));
    }
  }
  const gwen=buildPatrickBiographyModule(GWEN_CHARACTER_ID);
  assert.match(gwen.biography.connections.find(row=>row.name==='Myrddin Draig').image,/myrddin-draig\.jpg$/);
  const own=structuredClone(gwen);own.biography.connections.find(row=>row.name==='Myrddin Draig').image='/own-art.png';
  assert.equal(preparePatrickBiographyModule(own,GWEN_CHARACTER_ID).biography.connections.find(row=>row.name==='Myrddin Draig').image,'/own-art.png');
});

test('Gwen replaces the existing spouse identity, retaining Cadogan marriage and both daughters without invented parents',()=>{
  const family=HOUSE_SGRECHIWR_FAMILY,gwen=family.persons.find(person=>person.id==='unknown-cadogan-spouse');
  assert.equal(gwen.worldPersonId,GWEN_CHARACTER_ID);assert.equal(gwen.name,'Gwen Hamnett');assert.equal(gwen.birth,'1694');assert.equal(gwen.houseId,'house-hamnett');
  assert.equal(gwen.familyRole,'married');assert.equal(gwen.status,'alive');
  assert.deepEqual(family.partnerships.find(row=>row.id==='marriage-cadogan-spouse').participantIds,['cadogan-sgrechiwr','unknown-cadogan-spouse']);
  assert.deepEqual(family.parentages.filter(row=>row.parentIds.includes(gwen.id)).map(row=>row.childId).sort(),['eluned-sgrechiwr','meinwen-sgrechiwr']);
  assert.equal(family.parentages.filter(row=>row.childId===gwen.id).length,0);
});

test('family overlay is idempotent and leaves graph topology, view, all other people and individual house roles intact',()=>{
  for(const family of [HOUSE_SGRECHIWR_FAMILY,HOUSE_DRAENMELYN_FAMILY,HOUSE_SWYLL_FAMILY]){
    const before=structuredClone(family),after=withPatrickBiographyFamily(family);
    assert.deepEqual(after,family);assert.deepEqual(family,before);
    const changed=structuredClone(family);changed.view.customRetained=true;
    const untouched=changed.persons.find(person=>!familyPeople(family).some(row=>row.id===person.id));
    untouched.extensions={...(untouched.extensions||{}),customRetained:{yes:true}};
    const result=withPatrickBiographyFamily(changed);
    for(const key of ['partnerships','parentages','houses','cadetBranches','timeJumps','view'])assert.deepEqual(result[key],changed[key]);
    assert.deepEqual(result.persons.filter(person=>!familyPeople(family).some(row=>row.id===person.id)),changed.persons.filter(person=>!familyPeople(family).some(row=>row.id===person.id)));
  }
  assert.equal(HOUSE_DRAENMELYN_FAMILY.persons.find(person=>person.id==='rhiannon-draenmelyn').familyRole,'core');
  assert.equal(HOUSE_SWYLL_FAMILY.persons.find(person=>person.id==='rhiannon-draenmelyn').familyRole,'married');
});

test('future custom biographies and explicit deletion survive the actual registry upgrade path',()=>{
  for(const marker of [null,{disabled:true},{schema:'aleria.biography-module',biography:{biographyText:'Own later prose',extraSections:[{title:'Own',text:'Retain'}]}}]){
    const local=structuredClone(HOUSE_SGRECHIWR_FAMILY);local.extensions.sourceRevision=1;
    local.persons.find(person=>person.id==='unknown-cadogan-spouse').extensions.biographyModule=marker;
    const result=reconcileFamilyWithProjectOrigin({family:local,projectOriginFamily:HOUSE_SGRECHIWR_FAMILY}).family;
    const person=result.persons.find(person=>person.id==='unknown-cadogan-spouse');
    assert.deepEqual(person.extensions.biographyModule,marker);
    if(marker===null||marker.disabled)assert.equal(getPersonBiographyModule(person),null);
  }
});

test('character preparation preserves fresh prose, additional online relationships and depleted resources, while new Gwen has real links',()=>{
  const current=[CADOGAN_CHARACTER_ID,RHIANNON_CHARACTER_ID].map(id=>({id,name:'Existing',biography:buildPatrickBiographyModule(id),
    inventory:{items:[{id:'keep'}],coins:{copper:5}},combatProfile:{hitPoints:{current:0},resources:[{current:0}]},
    genealogy:{relationships:{parents:[{personId:'extra-online',name:'New online relation'}],partners:id===CADOGAN_CHARACTER_ID?[{personId:'unknown-cadogan-spouse',worldPersonId:GWEN_CHARACTER_ID,name:'Unbekannte Ehefrau'}]:[],children:[]}},custom:{keep:true}}));
  current[0].biography.biography.biographyText='<p>Fresh online editing retained.</p>';
  const before=structuredClone(current),prepared=preparePatrickBiographyCharacters(current,{now});
  assert.deepEqual(current,before);
  for(let i=0;i<2;i++){
    assert.deepEqual(prepared[i].inventory,current[i].inventory);assert.deepEqual(prepared[i].combatProfile,current[i].combatProfile);
    assert.deepEqual(prepared[i].genealogy.relationships.parents,current[i].genealogy.relationships.parents);
    assert.equal(prepared[i].biography.biography.biographyText,current[i].biography.biography.biographyText);
  }
  assert.equal(prepared[0].genealogy.relationships.partners[0].name,'Gwen Hamnett');
  const gwen=prepared.find(person=>person.id===GWEN_CHARACTER_ID);
  assert.equal(gwen.identity.worldPersonId,GWEN_CHARACTER_ID);assert.match(gwen.taxonomyPath,/Gwynthor$/);assert.equal(gwen.currentLocation,'Gwynthor');
  assert.equal(gwen.genealogy.houseId,'house-hamnett');assert.equal(gwen.genealogy.relationships.parents.length,0);
  assert.deepEqual(gwen.genealogy.relationships.partners.map(row=>row.personId),['cadogan-sgrechiwr']);
  assert.deepEqual(gwen.genealogy.relationships.children.map(row=>row.personId).sort(),['eluned-sgrechiwr','meinwen-sgrechiwr']);
  assert.deepEqual(gwen.genealogy.sources.map(row=>row.familyId).sort(),['haus-hamnett','haus-sgrechiwr']);
  assert(gwen.genealogy.sources.every(row=>row.url.includes('mode=view')&&row.url.includes('unknown-cadogan-spouse')));
  assert.deepEqual(gwen.aliases,['Gwen Hamnett','Gwen Sgrechiwr']);
  assert.deepEqual(preparePatrickBiographyCharacters(prepared,{now:'2026-11-04T18:00:00.000Z'}),prepared);
});

test('Hamnett origin contains one existing Gwen projection and no invented founder, parents, territorial seat or new marriage',()=>{
  const family=HOUSE_HAMNETT_FAMILY;
  assert.equal(family.persons.length,1);assert.equal(family.persons[0].worldPersonId,GWEN_CHARACTER_ID);
  for(const field of ['partnerships','parentages','cadetBranches','timeJumps'])assert.deepEqual(family[field],[]);
  assert.equal(family.document.houseProfile.county,'Silberinsel');
  for(const field of ['seat','barony','liegeHouseId'])assert.equal(family.document.houseProfile[field],'');
  assert.equal(family.lineage.founderPartnershipId,'');
  assert.equal(HOUSE_SGRECHIWR_FAMILY.document.houseProfile.seat,'Lynthor');
});
