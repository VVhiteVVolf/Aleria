import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { reconcileFamilyWithProjectOrigin } from '../../Stammbäume/assets/js/modules/family-sync/project-origin-reconciliation.js';
import { planEleganzCharacters } from '../modules/goettliche-eleganz/eleganz-characters.mjs';
import { planKanneCharacters } from '../modules/krumme-kanne/krumme-kanne-characters.mjs';
import { eleganzPerson } from '../modules/goettliche-eleganz/eleganz-family-people.mjs';
import { beforeEleganzEditorialCorrections, withEleganzPortraitCorrections } from '../modules/goettliche-eleganz/eleganz-editorial-corrections.mjs';
import { buildGoettlicheEleganz } from '../modules/goettliche-eleganz/eleganz-module.mjs';
const family=id=>assertValidFamily(FAMILY_REGISTRY.find(record=>record.id===id).family).family;
const transfers=[
  ['haus-coeddu','haus-raves',['serafina-raves'],'marriage-tiberian-maelwen-raves'],
  ['haus-trevoryn','haus-svathamar',['styr-svathamar-kanne','heledd-svathamar-kanne'],'marriage-hrolf-eirian-kanne'],
  ['haus-tonnarth','haus-dubhdarach',['neifion-dubhdarach-kanne','eirlys-dubhdarach-kanne'],'marriage-aedan-mair-kanne']
];

test('married-away pairs end at their destination link; children continue with unchanged parents there',()=>{
  for(const [birthId,destinationId,children,marriageId] of transfers) {
    const birth=family(birthId),destination=family(destinationId);
    assert(birth.partnerships.some(record=>record.id===marriageId));
    assert(birth.cadetBranches.some(branch=>branch.linkType==='married-away'
      && branch.targetFamilyId===destinationId && branch.parentPartnershipId===marriageId));
    for(const id of children) {
      assert(!birth.persons.some(person=>person.id===id));
      assert(!birth.parentages.some(record=>record.childId===id));
      assert(destination.persons.some(person=>person.id===id));
      assert.deepEqual(destination.parentages.find(record=>record.childId===id).parentIds,
        destination.partnerships.find(record=>record.id===marriageId).participantIds);
    }
  }
  assert(family('haus-tonnarth').persons.some(person=>person.id==='caradog-bastard-tonnarth'));
  const raves=family('haus-raves');
  for(const id of ['aurelio-raves','lavinia-raves']) {
    assert(raves.parentages.find(record=>record.childId===id).parentIds.includes('eleonora-raves'));
  }
  assert(!raves.cadetBranches.some(branch=>branch.parentPartnershipId==='marriage-eleonora-luciano-raves'));
});

test('saved pre-correction trees lose only duplicate child projections, preserving their destination identity',()=>{
  for(const [birthId,destinationId,children] of transfers) {
    const old=structuredClone(family(birthId));
    old.extensions.sourceRevision-=1;
    delete old.extensions.registryTransferredPersons;
    delete old.extensions.registryTombstones;
    for(const id of children) {
      old.persons.push(family(destinationId).persons.find(person=>person.id===id));
      old.parentages.push(family(destinationId).parentages.find(record=>record.childId===id));
    }
    const reconciliation=reconcileFamilyWithProjectOrigin({family:old,projectOriginFamily:family(birthId)});
    assert(reconciliation.upgraded);
    const corrected=reconciliation.family;
    for(const id of children) assert(!corrected.persons.some(person=>person.id===id));
    for(const person of old.persons) {
      const retained=corrected.persons.find(item=>item.id===person.id)
        || family(destinationId).persons.find(item=>item.worldPersonId===person.worldPersonId);
      assert(retained,person.id);
      for(const field of ['id','worldPersonId','birth','death','houseId']) assert.equal(retained[field],person[field]);
    }
  }
});

test('profile source retirement is bounded and leaves live data and unrelated sources intact',()=>{
  for(const [birthId,destinationId,children] of transfers) for(const id of children) {
    const person=family(destinationId).persons.find(person=>person.id===id);
    const retained={familyId:'unrelated',personId:'original',fingerprint:'custom'};
    const prior={id:person.worldPersonId,identity:{worldPersonId:person.worldPersonId},inventory:{live:7},
      portrait:'custom.png',genealogy:{sources:[{familyId:birthId,personId:id},retained]}};
    const plan=(birthId==='haus-coeddu'?planEleganzCharacters:planKanneCharacters)([prior],{},'2026-10-16T12:00:00Z');
    const patch=plan.entries.find(entry=>entry.id===prior.id).patch;
    assert(patch.genealogy.sources.some(source=>source.familyId===destinationId));
    assert(!patch.genealogy.sources.some(source=>source.familyId===birthId && source.personId===id));
    assert.deepEqual(patch.genealogy.sources.find(source=>source.familyId==='unrelated'),retained);
    assert(!Object.hasOwn(patch,'portrait') && !Object.hasOwn(patch,'inventory'));
    assert.equal(prior.inventory.live,7);
  }
});

test('requested portrait correction rejects unrelated online edits and keeps Gwenoras dates',()=>{
  const maelwen=eleganzPerson('maelwen'),gwenora=eleganzPerson('gwenora');
  assert.equal(gwenora.portraitAge,Number(gwenora.death)-Number(gwenora.birth));
  assert.match(maelwen.appearance,/orange-ginger.*green eyes/);
  const existing=[{id:maelwen.worldPersonId,portrait:'./assets/goettliche-eleganz/portraits/maelwen.png'}];
  const plan={entries:[{id:maelwen.worldPersonId,key:'maelwen',create:false,patch:null}]};
  assert.equal(withEleganzPortraitCorrections(plan,existing).entries[0].patch.portrait,maelwen.portrait);
  assert.throws(()=>withEleganzPortraitCorrections(plan,[{...existing[0],portrait:'custom.png'}]),/Online-Porträt/);
  const previous=beforeEleganzEditorialCorrections(buildGoettlicheEleganz());
  assert(!Object.hasOwn(previous,'previewImage'));
  assert(!JSON.stringify(previous).includes('portraits/maelwen-v2.png'));
});
