import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {FAMILY_REGISTRY,getRegisteredFamily} from '../assets/js/data/families.registry.js';
import {CEITHEACH_DEPENDENT_CLANS,CEITHEACH_TERRITORIAL_SOURCES} from '../assets/js/data/ceitheach-territorial-catalog.js';
import {CEITHEACH_NEW_DEPENDENT_FAMILIES} from '../assets/js/data/ceitheach-house-families.js';
import {assertValidFamily} from '../assets/js/domain/family-schema.js';
import {createRegistryBrowserIndex,registryPathKey} from '../assets/js/modules/family-registry/registry-browser-model.js';
import {loadFamilyById} from '../assets/js/services/family-library.js';

const audit=JSON.parse(fs.readFileSync(new URL('../assets/data/source-inventories/ceitheach-territories-2026-10-05.json',import.meta.url),'utf8'));

test('Ceitheachs acht zusätzliche Clans liegen unter ihren belegten Oberherrschaften und Lehnsherren',()=>{
  assert.equal(CEITHEACH_TERRITORIAL_SOURCES.length,6);
  assert.equal(CEITHEACH_DEPENDENT_CLANS.length,8);
  const index=createRegistryBrowserIndex(FAMILY_REGISTRY);
  const ceitheach=index.nodes.get(registryPathKey(['Ceitheach']));
  assert.equal(ceitheach.familyIds.size,15);
  for(const clan of CEITHEACH_DEPENDENT_CLANS){
    const node=index.nodes.get(registryPathKey(clan.folderPath));
    assert.ok(node.familyIds.has(clan.familyId),clan.title);
    const placement=node.records.find(r=>r.id===clan.familyId);
    assert.equal(placement.houseProfile.liegeHouseId,clan.liegeFamilyId);
    assert.equal(placement.houseProfile.rankId,clan.rankId);
    assert.equal(placement.houseProfile.seat,clan.seat);
    assert.equal(placement.houseProfile.barony,'');
    assert.equal(placement.family.lineage.houseId,clan.houseId);
    assert.equal(FAMILY_REGISTRY.filter(r=>r.id===clan.familyId).length,1);
    const source=audit.sources.find(s=>s.attachmentId===clan.attachmentId);
    const cell=row=>source.rows.find(r=>r.row===row).cells.find(c=>c.column===clan.sourceColumn);
    assert.equal(cell(80).text,clan.sourceName);
    assert.equal(cell(78).text,clan.sourceSeat);
    assert.equal(cell(79).images[0].url,clan.emblemSource);
  }
  assert.equal(getRegisteredFamily('haus-nic-blar').houseProfile.seat,'Lochcoille');
  assert.deepEqual(getRegisteredFamily('haus-nic-blar').houseProfile.secondarySeats,[]);
  assert.deepEqual(getRegisteredFamily('sept-daire').folderPath,['Ceitheach','Tir na Dorcha','Tír na Droma','Tulachinis']);
});

test('alle sieben nachgereichten Clans ersetzen die Leerakte innerhalb ihrer bestehenden territorialen Akte',()=>{
  assert.equal(CEITHEACH_NEW_DEPENDENT_FAMILIES.length,7);
  const empty=CEITHEACH_NEW_DEPENDENT_FAMILIES.filter(family=>family.extensions.blankFamily);
  assert.equal(empty.length,0);
  for(const family of CEITHEACH_NEW_DEPENDENT_FAMILIES){
    assertValidFamily(family);
    assert.equal(family.extensions.blankFamily,false);
    assert.equal(family.document.houseProfile.rankId,'unknown');
    assert.ok(family.persons.length>0);
    assert.ok(family.view.focusPersonId);
    assert.ok(family.lineage.founderPartnershipId);
  }
  for(const id of ['haus-craobhan','haus-eldath','haus-eamhra']){
    assert.ok(getRegisteredFamily(id),id);
    assert.ok(FAMILY_REGISTRY.some(r=>r.family.cadetBranches.some(b=>b.targetFamilyId===id)),id);
  }
});

test('Somhairles Ceitheach-Platzierung ergänzt dieselbe Leitheacher Akte auch bei lokal gespeicherten Daten',()=>{
  const registered=getRegisteredFamily('haus-somhairle');
  const local=structuredClone(registered);
  delete local.family.extensions.registryAdditionalPlacements;
  local.family.persons[0].notes='Eigene Notiz';
  local.family.view.orientation='horizontal';
  local.family.lineage.crestSubtitle='Eigenes Hauswort';
  const storage={getItem:key=>key==='aleria.family-tree.saved-families.v1'?JSON.stringify([local]):null};
  const loaded=loadFamilyById('haus-somhairle',storage);
  assert.deepEqual(loaded.folderPath,['Leitheach','Tir na Gortanna','Herrschaft von Broch an Clais','Broch an Clais']);
  assert.equal(loaded.family.persons.length,34);
  assert.equal(loaded.family.persons[0].notes,'Eigene Notiz');
  assert.equal(loaded.family.view.orientation,'horizontal');
  assert.equal(loaded.family.lineage.crestSubtitle,'Eigenes Hauswort');
  assert.equal(loaded.family.extensions.sourceRevision,registered.family.extensions.sourceRevision);
  assert.deepEqual(loaded.additionalPlacements[0].folderPath,['Ceitheach','Tir na Dun','Glaennmor']);
  assert.equal(loaded.additionalPlacements[0].houseProfile.liegeHouseId,'haus-dal-leite');
  const index=createRegistryBrowserIndex([loaded]);
  assert.equal(index.families.size,1);
  assert.equal(index.families.get('haus-somhairle').placements.length,2);
});

test('alle 21 Clan- und Regionswappen entsprechen den Quellen und sind lokal verfügbar',()=>{
  assert.equal(audit.sources.length,7);
  assert.equal(audit.assets.length,21);
  assert.equal(audit.assets.filter(a=>a.writeNew).length,7);
  for(const asset of audit.assets){
    const bytes=fs.readFileSync(new URL('../'+asset.target,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.name);
    assert.equal(asset.matches,true,asset.name);
  }
});
