// Public, versioned family snapshots. This never accesses live character data.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { reconcileFamilyWithProjectOrigin } from '../../Stammbäume/assets/js/modules/family-sync/project-origin-reconciliation.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { assertMirroredCrossFamilyBatch } from '../../Stammbäume/assets/js/modules/family-sync/cross-family-sync-invariant.js';
const root = new URL('../../Stammbäume/assets/data/published-families/', import.meta.url);
const registry = JSON.parse(await readFile(new URL('registry.json', root), 'utf8'));
const now = new Date().toISOString();
const records = [];
for (const id of ['haus-raves','haus-veltrane','haus-maerllys','haus-coeddu']) {
  const registered = FAMILY_REGISTRY.find(record => record.id === id);
  assert(registered, id);
  const previous = await readFile(new URL(`${id}.json`,root),'utf8').then(JSON.parse).catch(error => {
    if(error.code !== 'ENOENT') throw error;
    return null;
  });
  const family = assertValidFamily(previous ? reconcileFamilyWithProjectOrigin({family:previous.family,projectOriginFamily:registered.family}).family : registered.family).family;
  if(previous) for(const old of previous.family.persons) {
    const current = family.persons.find(person => person.id === old.id);
    assert(current, `${id}: Person entfernt: ${old.id}`);
    for(const field of ['id','worldPersonId','birth','death','houseId']) assert.equal(current[field],old[field],`${id}/${old.id}/${field}`);
  }
  records.push({registered,previous,baseFamily:previous?.family,family,
    changed:JSON.stringify(previous?.family) !== JSON.stringify(family)});
}
assertMirroredCrossFamilyBatch(records);
const changed = records.filter(record => record.changed);
if(process.argv.includes('--apply')) {
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
console.log(JSON.stringify({applied:process.argv.includes('--apply'),changed:changed.map(record=>record.family.document.id),preservedExistingIdentities:true}));
