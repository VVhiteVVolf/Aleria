import assert from 'node:assert/strict';
import test from 'node:test';
import {getRegisteredFamily} from '../../Stammbäume/assets/js/data/families.registry.js';
import {planSwyllFamilyCharacters,SWYLL_PROFILE_FIELDS} from '../../firebase/scripts/content/swyll-family-character-plan.mjs';
const records=['haus-swyll','haus-draenmelyn'].map(getRegisteredFamily);
const names=[['iestyn-swyll','Iestyn Swyll','haus-swyll'],['rhiannon-draenmelyn','Rhiannon Draenmelyn','haus-draenmelyn'],['gareth-swyll','Gareth Swyll','haus-swyll'],['meredith-swyll','Meredith Swyll','haus-swyll']];
const before=names.map(([slug,name,family])=>({id:slug==='meredith-swyll'?'existing-meredith':`person--${family}--${slug}`,name,
  ...(slug!=='meredith-swyll'?{identity:{worldPersonId:`person--${family}--${slug}`}}:{}),
  inventory:{revision:5,items:[{id:'keep'}]},combatProfile:{currentHp:7,resources:{mana:2}},bio:slug==='meredith-swyll'?'Eigener bestehender Text.':'',
  portrait:slug==='gareth-swyll'?null:'https://example.com/'+slug+'.png',imageSets:slug==='gareth-swyll'?[]:[{id:'standard',name:'Standard',portrait:'https://example.com/'+slug+'.png',emotes:[{label:'Alt',img:'https://example.com/old.png'}],createdAt:'2026-01-01',updatedAt:'2026-01-02'}],activeImageSetId:'standard'}));
const avatarSets=Object.fromEntries(names.slice(0,3).map(([slug])=>[slug,[1,2].map(number=>({id:'swyll-20261018-set-0'+number,name:'Neu '+number,emotes:Array.from({length:9},(_,i)=>({label:'Reaktion '+i,img:`https://example.com/${slug}-${number}-${i}.png`}))}))]));
const config={tabs:['Bestehend'],map:{Bestehend:['untouched']},subtabs:{Bestehend:['Alt']},subtabMap:{Bestehend:{Alt:['untouched']}}};
const build=(existingCharacters=before,extra={})=>planSwyllFamilyCharacters({records,existingCharacters,config,avatarSets,now:'2026-10-18T14:30:00.000Z',...extra});

test('links both parents to all three children and reuses existing Meredith identity',()=>{
 const plan=build();assert.equal(plan.entries.filter(e=>e.create).length,1);
 assert.equal(plan.entries.find(e=>e.key==='rhydwen-swyll').id,'person--haus-swyll--rhydwen-swyll');
 assert.equal(plan.entries.find(e=>e.key==='meredith-swyll').id,'existing-meredith');
 for(const slug of ['iestyn-swyll','rhiannon-draenmelyn']) {
  const entry=plan.entries.find(e=>e.key===slug);
  assert.equal(entry.patch.genealogy.relationships.children.length,3);
  assert.equal(entry.patch.genealogy.relationships.parents.length,2);
 }
});
test('keeps gameplay data, existing prose and old image sets outside the publication patch',()=>{
 const original=structuredClone(before),plan=build();assert.deepEqual(before,original);
 for(const entry of plan.entries.filter(e=>!e.create)) {
  assert(Object.keys(entry.patch).every(k=>SWYLL_PROFILE_FIELDS.includes(k)));
  assert(!Object.hasOwn(entry.patch,'inventory'));assert(!Object.hasOwn(entry.patch,'combatProfile'));
  const prior=before.find(p=>p.id===entry.id);
  if(entry.patch.imageSets&&prior.imageSets.length)assert.deepEqual(entry.patch.imageSets[0],prior.imageSets[0]);
 }
 assert(!Object.hasOwn(plan.entries.find(e=>e.key==='meredith-swyll').patch,'bio'));
 assert.deepEqual(plan.config.map.Bestehend,config.map.Bestehend);
 assert.equal(plan.entries.find(e=>e.key==='gareth-swyll').patch.imageSets.slice(1).length,2);
});
test('rejects duplicate or conflicting online identities instead of creating another profile',()=>{
 assert.throws(()=>build([...before,{...before[0],id:'duplicate'}]),/Doppelte/);
 assert.throws(()=>build([{...before[0],identity:{worldPersonId:'wrong-person'},genealogy:{birth:'1699'}},...before.slice(1)]),/Identitätskonflikt/);
});
test('repeating a successful publication changes no profile and never duplicates avatar sets',()=>{
 const first=build();
 const after=first.entries.map(e=>e.create?{id:e.id,...e.data}:{...before.find(p=>p.id===e.id),...e.patch});
 const second=build(after,{config:first.config,now:'2026-10-18T15:00:00.000Z'});
 assert(second.entries.every(e=>!e.create&&!e.patch));
 assert.deepEqual(second.config,first.config);
});
