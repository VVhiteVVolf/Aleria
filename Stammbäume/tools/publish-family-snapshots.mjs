// Public, versioned family snapshots. This never accesses live character data.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { reconcileFamilyWithProjectOrigin } from '../assets/js/modules/family-sync/project-origin-reconciliation.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { assertMirroredCrossFamilyBatch } from '../assets/js/modules/family-sync/cross-family-sync-invariant.js';

export async function publishFamilySnapshots(familyIds, { apply = false, refreshHouseProfiles = false, houseProfilesOnly = false } = {}) {
assert(familyIds.length && new Set(familyIds).size === familyIds.length, 'Eindeutige Familienauswahl erforderlich.');
const root = new URL('../assets/data/published-families/', import.meta.url);
const registry = JSON.parse(await readFile(new URL('registry.json', root), 'utf8'));
const now = new Date().toISOString();
const records = [];
for (const id of familyIds) {
  const registered = FAMILY_REGISTRY.find(record => record.id === id);
  assert(registered, id);
  const previous = await readFile(new URL(`${id}.json`,root),'utf8').then(JSON.parse).catch(error => {
    if(error.code !== 'ENOENT') throw error;
    return null;
  });
  // A vassalage correction must not also reconcile unrelated lineage edits.
  const family = houseProfilesOnly && previous ? structuredClone(previous.family)
    : assertValidFamily(previous ? reconcileFamilyWithProjectOrigin({family:previous.family,projectOriginFamily:registered.family}).family : registered.family).family;
  if (refreshHouseProfiles || houseProfilesOnly) {
    family.document.houseProfile = structuredClone(registered.family.document.houseProfile);
    assertValidFamily(family);
  }
  records.push({registered,previous,baseFamily:previous?.family,family,
    changed:JSON.stringify(previous?.family) !== JSON.stringify(family)});
}
// A removed duplicate must retain its identity and parentage in the named house.
for (const record of records) for (const old of record.previous?.family.persons || []) {
  let current = record.family.persons.find(person => person.id === old.id);
  if (!current) {
    const transfer = record.family.extensions.registryTransferredPersons?.find(item => item.personId === old.id);
    assert(transfer && transfer.worldPersonId === old.worldPersonId, `Nicht belegte Personenentfernung: ${old.id}`);
    assert(record.family.extensions.registryTombstones.persons.includes(old.id));
    const destination = records.find(item => item.family.document.id === transfer.targetFamilyId)?.family;
    current = destination?.persons.find(person => person.worldPersonId === old.worldPersonId);
    assert(current, `Fortgeführte Person fehlt: ${old.id}`);
    for (const parentage of record.previous.family.parentages.filter(item => item.childId === old.id)) {
      assert.deepEqual(destination.parentages.find(item => item.id === parentage.id), parentage,
        `Abstammung der fortgeführten Person: ${old.id}`);
    }
  }
  for (const field of ['id','worldPersonId','birth','death','houseId']) {
    assert.equal(current[field], old[field], `${record.family.document.id}/${old.id}/${field}`);
  }
}
assertMirroredCrossFamilyBatch(records);
const changed = records.filter(record => record.changed);
if(apply) {
  const saveBackup = async envelope => {
    const backup = new URL(`backups/${envelope.familyId}/r${String(envelope.revision).padStart(8,'0')}-${envelope.updatedAt.replace(/[^0-9A-Z]/gi,'')}.json`,root);
    await mkdir(new URL('./',backup),{recursive:true});
    await writeFile(backup,JSON.stringify(envelope,null,2)+'\n');
  };
  for(const {registered,previous,family} of changed) {
    if(previous) await saveBackup(previous);
    const envelope = {schemaVersion:1,familyId:family.document.id,revision:(previous?.revision || 0)+1,updatedAt:now,family};
    await writeFile(new URL(`${envelope.familyId}.json`,root),JSON.stringify(envelope,null,2)+'\n');
    await saveBackup(envelope);
    const item = {id:envelope.familyId,familyId:envelope.familyId,title:family.document.title,motto:family.document.motto || '',emblem:family.document.emblem,
      folderPath:registered.folderPath,houseProfile:family.document.houseProfile,personCount:family.persons.length,revision:envelope.revision,updatedAt:now,
      link:`Stammbaum.html?family=${envelope.familyId}&mode=view`,source:'github'};
    const index=registry.families.findIndex(entry=>entry.id===item.id);
    if(index<0) registry.families.push(item); else registry.families[index]=item;
  }
  if(changed.length) await writeFile(new URL('registry.json',root),JSON.stringify(registry,null,2)+'\n');
}
return {applied:apply,changed:changed.map(record=>record.family.document.id),preservedExistingIdentities:true};
}
