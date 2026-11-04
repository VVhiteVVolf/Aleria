import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { normalizeFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { withHouseLoreCorrections } from '../assets/js/modules/house-lore-corrections/house-lore-corrections.js';
import { HOUSE_LORE_CORRECTION_FIELDS } from '../assets/js/modules/house-lore-corrections/house-lore-correction-fields.js';

const root = new URL('../../', import.meta.url);
const fixture = JSON.parse(readFileSync(new URL('Familien Häuser und Clans/tests/fixtures/house-lore-corrections-20261104.json', root),'utf8'));
const records = new Map(FAMILY_REGISTRY.map(record => [record.id, record]));
const person = (familyId, personId) => records.get(familyId).family.persons.find(person => person.id === personId);
const entity = (family, row) => row.collection === 'document' ? family.document
  : family[row.collection].find(entity => entity.id === row.entityId);
const changesFor = id => fixture.changes.filter(row => row.familyId === id);

function staleFamily(id) {
  const local = normalizeFamily(records.get(id).family);
  local.extensions.sourceRevision = fixture.previousRevisions[id];
  delete local.extensions.houseLoreCorrectionInventory;
  for (const row of changesFor(id)) entity(local,row)[row.field] = row.before;
  return local;
}

test('all approved fields include the public Marmue counterpart and are explicitly versioned', () => {
  assert.equal(fixture.changes.length,71);
  assert.equal(Object.keys(HOUSE_LORE_CORRECTION_FIELDS).length,28);
  for (const row of fixture.changes) {
    const family = records.get(row.familyId).family, current = entity(family,row);
    assert.deepEqual(current[row.field],row.after,`${row.familyId}/${row.entityId}/${row.field}`);
    const revisions = row.collection === 'document' ? family.extensions.registryManagedDocumentFieldRevisions
      : current.extensions.registryManagedFieldRevisions;
    assert.equal(revisions[row.field],HOUSE_LORE_CORRECTION_FIELDS[row.familyId].revision);
  }
  for (const id of Object.keys(HOUSE_LORE_CORRECTION_FIELDS)) {
    assert.equal(withHouseLoreCorrections(records.get(id).family),records.get(id).family,`${id}: idempotent confirmation`);
  }
});

test('the fifteen protected child dates stay fixed while the parental chronology is repaired', () => {
  for (const row of fixture.protectedChildren) assert.equal(person(row.familyId,row.personId).birth,row.birth,row.personId);
  for (const [familyId,id,birth,death] of [
    ['haus-dal-ceardaiocht','aonghus-gallchobhair','1610','1672'],
    ['haus-dal-ceardaiocht','etain-ancient','1612','1695'],
    ['haus-pendrag','annegrit-vaeren','1533','1572'],
    ['haus-pendrag','rhodri-pendrag','1530','1599'],
    ['haus-canwyll','cynwrig-canwyll','1652','1720'],
    ['haus-canwyll','dylis-tiwna','1650','1720']
  ]) { assert.equal(person(familyId,id).birth,birth,id); assert.equal(person(familyId,id).death,death,id); }
  assert.ok(Number(person('haus-pendrag','rhodri-pendrag').death)<1600,'Rhodri predeceases Agravaine');
});

test('living council members and Morgan keep their identities, while the ended administration and survivors remain distinct', () => {
  for (const [familyId,id] of [['haus-dal-t-saor','wunbhna-spouse-tsaoir'],['haus-choinnich','maolmhuire-spouse-choinnich'],
    ['haus-dyngwn','morgan-dyngwn'],['haus-grael','morgan-dyngwn'],['haus-neidr','morgan-dyngwn']]) {
    assert.equal(person(familyId,id).status,'alive',id);assert.equal(person(familyId,id).death,'',id);
  }
  const historical=records.get('haus-dal-t-saor').family;
  assert.equal(historical.extensions.historicalStatus,'extinct');
  for(const id of ['quona-tsaoir','junaid-tsaoir'])assert.equal(person('haus-dal-t-saor',id).status,'alive');
});

test('the original twenty-case receipt stays intact; the five unapproved date and sex conflicts remain unchanged', () => {
  assert.equal(fixture.preservedCounterpartConflicts.length,20);
  const unresolved=fixture.preservedCounterpartConflicts.filter(row=>!row.fields.includes('status'));
  assert.equal(unresolved.length,5);
  for(const row of unresolved)for(const entry of row.entries) {
    const current=person(entry.familyId,entry.personId);
    assert.equal(current.worldPersonId,row.worldPersonId);
    for(const[field,value]of Object.entries(entry.values))assert.equal(current[field],value,`${entry.familyId}/${entry.personId}/${field}`);
  }
});

test('cached source records receive only approved fields and preserve authored metadata and neighboring people', () => {
  for(const id of Object.keys(HOUSE_LORE_CORRECTION_FIELDS)) {
    const registered=records.get(id).family,local=staleFamily(id);
    const targets=new Set(changesFor(id).filter(row=>row.collection==='persons').map(row=>row.entityId));
    const neighbor=local.persons.find(person=>!targets.has(person.id));
    if(neighbor){neighbor.birth='1701';neighbor.notes='Meine eigene Recherche';neighbor.portrait='mein-lokales-portrait.png';}
    local.document.houseProfile.seat='Mein lokaler Hofentwurf';
    local.document.emblem='mein-lokales-wappen.png';
    local.extensions.inheritance={local:'Eigene Erbfolgenotiz'};
    local.extensions.localResearch='Meine unveröffentlichte Recherche';
    local.view.orientation='horizontal';
    const result=resolveRegisteredFamilyUpgrade(registered,local);
    for(const row of changesFor(id))assert.deepEqual(entity(result,row)[row.field],row.after,`${id}/${row.entityId}/${row.field}`);
    assert.equal(result.document.houseProfile.seat,'Mein lokaler Hofentwurf',id);
    assert.equal(result.document.emblem,'mein-lokales-wappen.png',id);
    assert.deepEqual(result.extensions.inheritance,{local:'Eigene Erbfolgenotiz'},id);
    assert.equal(result.extensions.localResearch,local.extensions.localResearch,id);
    assert.equal(result.view.orientation,'horizontal',id);
    if(neighbor){const saved=result.persons.find(person=>person.id===neighbor.id);for(const field of ['birth','notes','portrait'])assert.equal(saved[field],neighbor[field],`${id}: neighbor ${field}`);}
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,result),result,`${id}: repeated upgrade`);
  }
});

test('default correction notes refresh, personal notes on those same entities remain local', () => {
  const notes=fixture.changes.filter(row=>row.field==='notes');
  assert.equal(notes.length,6);
  for(const row of notes) {
    const registered=records.get(row.familyId).family,local=staleFamily(row.familyId);
    assert.equal(entity(resolveRegisteredFamilyUpgrade(registered,local),row).notes,row.after);
    entity(local,row).notes='Meine eigene ausführliche Forschungsnotiz';
    assert.equal(entity(resolveRegisteredFamilyUpgrade(registered,local),row).notes,'Meine eigene ausführliche Forschungsnotiz');
  }
});

test('edited and explicitly removed biographies survive a chronology correction', () => {
  for(const id of Object.keys(HOUSE_LORE_CORRECTION_FIELDS)) {
    const registered=records.get(id).family;
    for(const removed of [false,true]) {
      const local=staleFamily(id);
      local.extensions.houseBiographyModule=removed?null:structuredClone(registered.extensions.houseBiographyModule);
      if(!removed)local.extensions.houseBiographyModule.house.biographyText='Meine eigene Hausgeschichte';
      const expected=structuredClone(local.extensions.houseBiographyModule);
      assert.deepEqual(resolveRegisteredFamilyUpgrade(registered,local).extensions.houseBiographyModule,expected,id);
    }
  }
});

test('Wolfshorn geography follows Dämmergrund and preserves the separate Bleiddorn identity', () => {
  const wolf=records.get('haus-wolfshorn');
  assert.equal(wolf.houseProfile.barony,'Dämmergrund');
  assert.match(wolf.houseProfile.liegeHouseName,/Vangandr/);
  assert.doesNotMatch(wolf.family.document.description,/Dämmertal/);
  assert.equal(records.get('haus-bleiddorn').houseProfile.kingdom,'Cenyr');
  assert.notEqual(wolf.id,records.get('haus-bleiddorn').id);
});
