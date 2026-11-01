import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,access } from 'node:fs/promises';
import { withGawainDuncanContent,GAWAIN_DUNCAN_TRAINING_THREAD,GAWAIN_DUNCAN_CONTENT_VERSION } from '../modules/gawain-duncan/gawain-duncan-module.mjs';
import { withGawainPublicBiography,GAWAIN_ID,DUNCAN_ID,GAWAIN_PUBLIC_SUMMARY,GAWAIN_PUBLIC_BIOGRAPHY } from '../modules/gawain-duncan/gawain-public-biography.mjs';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { CARREG_CREATURE_SOURCE,DUNCAN_CHARACTER_ID } from '../modules/creatures/catalog/duncan-carreg.js';
import { collectGroupRoster,resolveGroupRoster } from '../modules/landing/group-landing-roster.js';
import { appendGroupCompanions } from '../modules/landing/group-landing-companions.js';
import { mergeOnlineAndLocalCharacter } from '../../CharakterDatenbank/assets/js/character-database-client.mjs';
import { HOUSE_DRAIG_FAMILY } from '../../Stammbäume/assets/js/data/house-draig-family.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
const read = async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const source=(await read('../modules/gawain-duncan/source/gawain-duncan-online-2026-11-01.json')).entry;

test('reviewed group preserves five pages and thread identities, with Duncan above the already knighted Gawain',()=>{
  const before=structuredClone(source),next=withGawainDuncanContent(source);
  assert.deepEqual(source,before);assert.equal(next.id,source.id);
  assert.deepEqual(next.pages.map(page=>page.commentThreadKey),['0','1','2','3','4']);
  assert.deepEqual(collectGroupRoster(next).map(member=>member.name),['Sir Duncan Gafyr','Sir Gawain Draig']);
  const hierarchy=next.pages.find(page=>page.hierarchyPage).hierarchy;
  assert.deepEqual(hierarchy.trees[0].levels.map(level=>level.nodes.length),[1,1]);
  assert.ok(hierarchy.details.every(row=>row.label&&row.value));
  assert.match(next.pages[0].description,/bereits den Ritterschlag/);
  assert.equal(next.pages[3].landing.group.threadId,GAWAIN_DUNCAN_TRAINING_THREAD);
  assert.equal(withGawainDuncanContent(next),next);
});

test('guest and actual animal identities stay separate from the hierarchy and from template possessions',async()=>{
  const next=withGawainDuncanContent(source),group=next.pages[3].landing.group;
  assert.deepEqual(group.guests.map(row=>[row.kind,row.characterId||row.creatureId]),[['character','bSYZYAEOwiRgy44f6OmO'],['creature','companion-ylva-freki'],['creature','companion-tanor'],['creature','companion-duncan-carreg']]);
  const profiles=await Promise.all(['gawain','duncan'].map(async name=>(await read(`../modules/gawain-duncan/source/${name}-public-profile-2026-11-01.json`)).character));
  const characters=profiles.map(row=>({...row,inventory:{items:row.companionItems,companions:row.companions}}));
  const roster=resolveGroupRoster(next,group,characters);
  assert.deepEqual(appendGroupCompanions(roster,characters,[]),roster,'unavailable creature records never become phantom automatic members; the saved typed guests retain their explicit identities');
  // Explicit gateway fixtures represent the corresponding canonical creature records.
  const creatures=characters.flatMap(owner=>owner.inventory.items.map(item=>({id:item.creatureId,name:item.name,itemOrigin:{
    ownerCharacterId:owner.id,inventoryItemId:item.id,instanceId:item.instanceId||item.id,disposition:'owned'
  }})));
  const members=appendGroupCompanions(roster,characters,creatures);
  assert.deepEqual(members.filter(row=>row.kind==='creature').map(row=>row.creatureId).sort(),['companion-duncan-carreg','companion-tanor','companion-ylva-freki']);
  assert.ok(!members.some(row=>row.name==='Treuer Begleiter'));assert.deepEqual(next.pages[3].landing.group.treasury,source.pages[3].landing.group.treasury);
});

test('the module includes Gawains complete shared public biography and traits alongside the distinct mentor relationship',()=>{
  const next=withGawainDuncanContent(source),page=next.pages.find(row=>row.biographyPage);
  assert.equal(page.pageTitle,'Sir Gawain Draig');
  assert.equal(page.biography.biographyText,GAWAIN_PUBLIC_BIOGRAPHY.biography.biographyText);
  assert.deepEqual(page.biography.abilities,GAWAIN_PUBLIC_BIOGRAPHY.biography.abilities);
  assert.match(page.biography.historyText,/Duncan führt diese kleine Gemeinschaft/);
  const authored=structuredClone(source);authored.pages.find(row=>row.biographyPage).biography.biographyText='Eigene fortgeschriebene Biografie';
  assert.equal(withGawainDuncanContent(authored).pages.find(row=>row.biographyPage).biography.biographyText,'Eigene fortgeschriebene Biografie');
});

test('the v2 mount upgrade preserves customized v1 pages and guests, and never duplicates real automatic companions',async()=>{
  const older=withGawainDuncanContent(source);older.gawainDuncanContentVersion=1;
  const landing=older.pages.find(page=>page.landingPage).landing;
  landing.presentation='classic';landing.coverImage='/custom-cover.png';landing.group.treasury.openingCopper=37;
  const tanor=landing.group.guests.find(row=>row.creatureId==='companion-tanor');
  tanor.id='my-tanor';tanor.note='Eigene Pferdenotiz';tanor.assignment='reserve';
  landing.group.guests=landing.group.guests.filter(row=>row.creatureId!=='companion-duncan-carreg');
  landing.group.guests.push({id:'my-guest',kind:'character',characterId:'my-person',name:'Eigener Gast',note:'Bleibt.'});
  const before=structuredClone(older),next=withGawainDuncanContent(older),nextLanding=next.pages.find(page=>page.landingPage).landing;
  assert.deepEqual(older,before);assert.equal(next.gawainDuncanContentVersion,GAWAIN_DUNCAN_CONTENT_VERSION);
  assert.deepEqual(next.pages.filter(page=>!page.landingPage),before.pages.filter(page=>!page.landingPage));
  assert.deepEqual(nextLanding.group.guests.slice(0,-1),before.pages.find(page=>page.landingPage).landing.group.guests);
  assert.equal(nextLanding.group.guests.at(-1).creatureId,'companion-duncan-carreg');
  assert.equal(nextLanding.presentation,'classic');assert.equal(nextLanding.coverImage,'/custom-cover.png');assert.equal(nextLanding.group.treasury.openingCopper,37);
  assert.equal(withGawainDuncanContent(next),next);
  const records=await Promise.all(['gawain','duncan'].map(async name=>(await read(`../modules/gawain-duncan/source/${name}-public-profile-2026-11-01.json`)).character));
  const characters=records.map(row=>({...row,inventory:{items:row.companionItems,companions:row.companions}}));
  const roster=appendGroupCompanions(resolveGroupRoster(next,nextLanding.group,characters),characters,getBuiltinCreatureTemplates());
  for(const id of ['companion-tanor','companion-duncan-carreg'])assert.equal(roster.filter(row=>row.creatureId===id).length,1);
  assert.equal(roster.find(row=>row.creatureId==='companion-tanor').assignment,'reserve');
});

test('Tanor and Carreg use the exact public ownership, inventory instance and existing creature identities',async()=>{
  const catalog=getBuiltinCreatureTemplates(),tanor=catalog.find(row=>row.id==='companion-tanor'),carreg=catalog.find(row=>row.id==='companion-duncan-carreg');
  assert.equal(DUNCAN_CHARACTER_ID,DUNCAN_ID);assert.equal(CARREG_CREATURE_SOURCE.id,carreg.id);
  for(const [name,creature,ownerId,itemId] of [['gawain',tanor,GAWAIN_ID,'gawain-tanor'],['duncan',carreg,DUNCAN_ID,'duncan-carreg']]) {
    const owner=(await read(`../modules/gawain-duncan/source/${name}-public-profile-2026-11-01.json`)).character;
    const item=owner.companionItems.find(row=>row.id===itemId);
    assert.equal(owner.id,ownerId);assert.equal(item.ownerCharacterId,ownerId);assert.equal(item.creatureId,creature.id);
    assert.equal(creature.itemOrigin.ownerCharacterId,ownerId);assert.equal(creature.itemOrigin.inventoryItemId,item.id);
    assert.equal(creature.itemOrigin.instanceId,item.instanceId);assert.equal(creature.itemOrigin.disposition,'owned');
  }
  assert.equal(tanor.level,1);assert.equal(tanor.combatProfile.hitPoints.current,16);
  assert.deepEqual(tanor.combatProfile.weapons.filter(row=>row.id.startsWith('tanor-')).map(row=>row.id),['tanor-tritt','tanor-biss']);
  assert.equal(carreg.level,3);assert.equal(carreg.species,'Ritterschimmer');
});

test('one-time group projection preserves real notes, clocks and future manual composition edits',()=>{
  const custom=structuredClone(source);custom.pages[0].description='Eigener Einstieg';custom.pages[4].sessionIntro='Eigene laufende Szene';
  const landing=custom.pages[3].landing;landing.group.threadId='custom::session:kept';landing.group.treasury.openingCopper=37;
  landing.quests.push({id:'real',title:'Ein echter Auftrag',text:'Eigene Aufgabe',status:'active'});
  const next=withGawainDuncanContent(custom);
  assert.equal(next.pages[0].description,'Eigener Einstieg');assert.equal(next.pages[4].sessionIntro,'Eigene laufende Szene');
  assert.equal(next.pages[3].landing.group.threadId,'custom::session:kept');assert.equal(next.pages[3].landing.group.treasury.openingCopper,37);
  assert.equal(next.pages[3].landing.quests[0].id,'real');
  next.pages[3].landing.group.guests=[];next.pages[3].landing.presentation='classic';
  assert.equal(withGawainDuncanContent(next),next);assert.equal(next.pages[3].landing.group.guests.length,0);
});

test('public character projection replaces only known empty editorial fields and retains all live mechanics',()=>{
  const inventory={revision:123,items:[{id:'same-item'}],moneyState:{totalCopper:37}},combatProfile={revision:88,hitPoints:{current:4},resources:[{current:1}]};
  const old={id:GAWAIN_ID,name:'Gawain Draig',title:'Mundschenk des Grafen, Gwynthor',bio:'',inventory,combatProfile,identity:{worldPersonId:'person--haus-draig--gawain-draig'}};
  const next=withGawainPublicBiography(old);assert.equal(next.bio,GAWAIN_PUBLIC_SUMMARY);assert.equal(next.inventory,inventory);assert.equal(next.combatProfile,combatProfile);
  assert.ok(next.biography.stats.every(row=>!Array.isArray(row)&&row.label));
  assert.equal(withGawainPublicBiography(next),next);
  const custom={...old,title:'Eigener Titel',bio:'Eigene Kurzbiografie',biography:{quote:'Eigene Worte',biography:{biographyText:'Eigene ausgearbeitete Biografie'}}};
  assert.equal(withGawainPublicBiography(custom),custom);assert.equal(withGawainPublicBiography({...old,id:'someone-else',identity:{}}).bio,'');
  const merged=mergeOnlineAndLocalCharacter(old,{id:GAWAIN_ID,bio:'Lokaler Text'});
  assert.deepEqual(merged.inventory,inventory);assert.deepEqual(merged.combatProfile,combatProfile);assert.equal(merged.bio,GAWAIN_PUBLIC_SUMMARY);
});

test('family upgrade changes only Gawains editorial fields, keeps neighbouring people and relationship history',()=>{
  const prior=normalizeFamily(structuredClone(HOUSE_DRAIG_FAMILY));prior.extensions.sourceRevision=11;
  const gawain=prior.persons.find(person=>person.id==='gawain-draig');gawain.title='';gawain.notes='';delete gawain.extensions.biographyModule;
  const neighbour=prior.persons.find(person=>person.id==='idwal-draig');neighbour.notes='Eigene Nachbarnotiz';neighbour.portrait='../custom-idwal.png';
  const result=resolveRegisteredFamilyUpgrade(HOUSE_DRAIG_FAMILY,prior);
  assert.equal(result.persons.find(person=>person.id==='gawain-draig').extensions.biographyModule.biography.biographyText,GAWAIN_PUBLIC_BIOGRAPHY.biography.biographyText);
  assert.deepEqual(result.persons.find(person=>person.id===neighbour.id),neighbour);
  for(const key of ['partnerships','parentages','cadetBranches','timeJumps'])assert.deepEqual(result[key],prior[key]);
});

test('biography has traceable public evidence, existing trait icons, and a partial export without inventory or combat state',async()=>{
  const evidence=await read('../modules/gawain-duncan/source/public-source-review.json');assert.equal(evidence.privateSourcesUsed,false);assert.ok(evidence.findings.length>=7);
  for(const trait of GAWAIN_PUBLIC_BIOGRAPHY.biography.abilities)await access(new URL(`../..${decodeURI(trait.icon)}`,import.meta.url));
  const exported=await read('../../Charakter Archiv Exporte/gawain-draig-oeffentliche-biografie-2026-11-01.json');
  assert.deepEqual(Object.keys(exported.character).sort(),['bio','biography','id','name','title','updatedAt']);
});
