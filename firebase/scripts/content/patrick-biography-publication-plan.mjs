import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { createHash } from 'node:crypto';
import { decodeFirestoreFields, decodeFirestoreValue, encodeFirestoreFields, encodeFirestoreValue } from '../backup/firestore-value-codec.mjs';
import { sanitizeCharacterBiographyForFirestore } from '../../../AleriaAlmanach/modules/characters/character-save-guard.js';
import { preparePatrickBiographyCharacters } from '../../../AleriaAlmanach/modules/patrick-biographies/biography-source.mjs';
import { planPatrickBiographies } from '../../../AleriaAlmanach/modules/patrick-biographies/biography-plan.mjs';
import { PATRICK_BIOGRAPHY_ASSETS } from '../../../AleriaAlmanach/modules/patrick-biographies/biography-assets.mjs';
import { PATRICK_BIOGRAPHY_PETS } from '../../../AleriaAlmanach/modules/patrick-biographies/biography-companions.mjs';
import { CADOGAN_CHARACTER_ID, RHIANNON_CHARACTER_ID, GWEN_CHARACTER_ID } from '../../../AleriaAlmanach/modules/patrick-biographies/biography-identities.mjs';

export const PATRICK_PUBLICATION_IDS = Object.freeze([CADOGAN_CHARACTER_ID, RHIANNON_CHARACTER_ID, GWEN_CHARACTER_ID]);
export const PATRICK_PET_IDS = Object.freeze(PATRICK_BIOGRAPHY_PETS.map(spec => `companion-${spec.ownerSlug}-${spec.slug}`));
export const PATRICK_PATCH_FIELDS = Object.freeze(['biography','inventory','name','title','currentLocation','identity','genealogy','aliases','portrait','updatedAt']);
export const PATRICK_GWEN_CREATE_FIELDS = Object.freeze([...PATRICK_PATCH_FIELDS,'taxonomyPath','createdAt','ownerUid','createdBy',
  'archived','status','role','origin','fraktion','relevance','plotNode','profileLink','playerOwner','bio']);
export const PATRICK_READ_PATHS = Object.freeze([
  ...PATRICK_PUBLICATION_IDS.map(id => `characters/${id}`), ...PATRICK_PET_IDS.map(id => `creatures/${id}`),
  ...PATRICK_PUBLICATION_IDS.map(id => `combat_profile_locks/characters/records/${id}`),
]);
const ORIGIN = 'https://dieweltvonaleria.netlify.app';
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key,stable(value[key])])) : value;
export const publicationHash = value => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
const without = (object, fields) => Object.fromEntries(Object.entries(object).filter(([key]) => !fields.includes(key)));
const person = (id, document) => ({ id, ...decodeFirestoreFields(document.fields) });

// Firestore omits the empty `values`/`fields` members in REST responses. This
// equivalence keeps the Value oneof intact; timestamps, references, bytes and
// every nonempty value retain their original type and representation.
export function canonicalizePatrickRestEmptyContainers(value) {
  if(Array.isArray(value)) return value.map(canonicalizePatrickRestEmptyContainers);
  if(!value || typeof value!=='object') return value;
  const result = Object.fromEntries(Object.entries(value).map(([key,child]) => [key,canonicalizePatrickRestEmptyContainers(child)]));
  if(Object.keys(result).length!==1) return result;
  const record = child => child && typeof child==='object' && !Array.isArray(child);
  if(record(result.arrayValue)) {
    const body=result.arrayValue,keys=Object.keys(body);
    if(keys.length===0 || (keys.length===1&&keys[0]==='values'&&Array.isArray(body.values)&&body.values.length===0)) {
      return {arrayValue:{values:[]}};
    }
  }
  if(record(result.mapValue)) {
    const body=result.mapValue,keys=Object.keys(body);
    if(keys.length===0 || (keys.length===1&&keys[0]==='fields'&&record(body.fields)&&Object.keys(body.fields).length===0)) {
      return {mapValue:{fields:{}}};
    }
  }
  return result;
}
export const patrickRestWrittenValuesEqual = (actual,expected) => isDeepStrictEqual(
  canonicalizePatrickRestEmptyContainers(actual),canonicalizePatrickRestEmptyContainers(expected));

// Reuse untouched REST values even inside a patched map/array. The shared codec
// intentionally cannot reconstruct timestamp/reference/bytes types from JSON.
export function encodePatrickValuePreservingTypes(previous, value) {
  if (previous && isDeepStrictEqual(decodeFirestoreValue(previous), value)) return structuredClone(previous);
  if (previous?.mapValue && value && typeof value === 'object' && !Array.isArray(value)) {
    const fields = previous.mapValue.fields || {};
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key,child]) =>
      [key,encodePatrickValuePreservingTypes(fields[key],child)])) } };
  }
  if (previous?.arrayValue && Array.isArray(value)) {
    return { arrayValue: { values: value.map((child,index) => encodePatrickValuePreservingTypes(previous.arrayValue.values?.[index],child)) } };
  }
  return encodeFirestoreValue(value);
}

const fieldSegment = key => /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : '`'+key.replaceAll('\\','\\\\').replaceAll('`','\\`')+'`';
function changedPaths(before, after, segments = []) {
  if (isDeepStrictEqual(before,after)) return [];
  if (before?.mapValue && after?.mapValue) {
    const old = before.mapValue.fields || {}, next = after.mapValue.fields || {};
    assert(Object.keys(old).every(key => Object.hasOwn(next,key)), 'Dieser Veröffentlichungsschritt darf keine gespeicherten Felder löschen.');
    return Object.keys(next).sort().flatMap(key => changedPaths(old[key],next[key],[...segments,key]));
  }
  return [segments.map(fieldSegment).join('.')];
}

export function collectPatrickPublicationAssetUrls(characters, creatures) {
  const urls = new Set();
  const visit = (value,key = '') => {
    if (Array.isArray(value)) return value.forEach(child => visit(child,key));
    if (value && typeof value === 'object') return Object.entries(value).forEach(([childKey,child]) => visit(child,childKey));
    if (typeof value !== 'string' || !['portrait','portraitStages','image','icon'].includes(key)
      || !/^(https:\/\/|\/|\.\.\/|\.\/)/.test(value)) return;
    const url = new URL(value,ORIGIN+'/AleriaAlmanach/');
    assert.equal(url.protocol,'https:'); assert(!url.username && !url.password);
    urls.add(url.href);
  };
  characters.forEach(character => { visit(character.biography); visit(character.portrait,'portrait'); });
  creatures.forEach(creature => visit(creature.portrait,'portrait'));
  return [...urls].sort();
}

export function preparePatrickPublicationDesired(documents, now) {
  assert(Number.isFinite(Date.parse(now)), 'Ungültiger stabiler Planzeitpunkt.');
  const current = [CADOGAN_CHARACTER_ID,RHIANNON_CHARACTER_ID].map(id => {
    assert(documents[`characters/${id}`], 'Eine bestehende Hauptakte fehlt.');
    return person(id,documents[`characters/${id}`]);
  });
  const prepared = preparePatrickBiographyCharacters(current,{now,assetMap:PATRICK_BIOGRAPHY_ASSETS});
  const additions = planPatrickBiographies({characters:prepared,existingCreatures:[],assetMap:PATRICK_BIOGRAPHY_ASSETS,now});
  assert.equal(additions.pending.length,0,'Biografieassets oder Besitzer fehlen.');
  const desired = prepared.map(character => ({...character,...additions.characters.find(row => row.id === character.id).patch}));
  const cadogan = current.find(row => row.id === CADOGAN_CHARACTER_ID);
  const rights = character => {
    const ownerUid = character.ownerUid, createdBy = character.createdBy || ownerUid;
    assert(typeof ownerUid === 'string' && ownerUid && typeof createdBy === 'string' && createdBy,'Belegte Besitzrechte fehlen.');
    return {ownerUid,createdBy};
  };
  Object.assign(desired.find(row => row.id === GWEN_CHARACTER_ID),rights(cadogan));
  const creatures = additions.creatures.map(creature => ({...creature,...rights(desired.find(row => row.id === creature.itemOrigin.ownerCharacterId))}));
  return { current, desired, creatures };
}

export function buildPatrickPublicationPlan({documents,nameMatches,now,assets,sourceHashes}) {
  assert.deepEqual(Object.keys(documents).sort(),[...PATRICK_READ_PATHS].sort(),'Unerwarteter Dokumentumfang.');
  assert(Array.isArray(nameMatches) && nameMatches.length === 0,'Mindestens ein benanntes Tier besitzt bereits eine Online-Akte.');
  assert.equal(documents[`characters/${GWEN_CHARACTER_ID}`],null,'Gwens Akte existiert bereits; keine automatische Übernahme.');
  assert(PATRICK_PET_IDS.every(id => documents[`creatures/${id}`] === null),'Eine geplante Tier-ID existiert bereits.');
  const {desired,creatures} = preparePatrickPublicationDesired(documents,now);
  const requiredUrls = collectPatrickPublicationAssetUrls(desired,creatures);
  assert.deepEqual(assets.map(asset => asset.url).sort(),requiredUrls,'Asset-Prüfumfang ist unvollständig.');
  assert(assets.every(asset => /^[a-f0-9]{64}$/.test(asset.sha256)),'Assetprüfsumme fehlt.');
  const characters = desired.map(character => {
    const id = character.id, original = documents[`characters/${id}`], create = id === GWEN_CHARACTER_ID;
    const allowed = create?PATRICK_GWEN_CREATE_FIELDS:PATRICK_PATCH_FIELDS;
    const body = sanitizeCharacterBiographyForFirestore(Object.fromEntries(allowed.filter(key => Object.hasOwn(character,key)).map(key => [key,character[key]])));
    if(create) body.createdAt = now;
    const previous = original?decodeFirestoreFields(original.fields):{};
    if(body.biography && !isDeepStrictEqual(body.biography,previous.biography)) {
      body.biography = {...body.biography,revision:Math.max(Date.parse(now),(Number(previous.biography?.revision)||0)+1)};
    }
    const changed = create ? Object.keys(body) : Object.keys(body).filter(key => !isDeepStrictEqual(body[key],previous[key]));
    if(!create && changed.length && !changed.includes('updatedAt')) { body.updatedAt = now; changed.push('updatedAt'); }
    const fields = Object.fromEntries(changed.map(key => [key,encodePatrickValuePreservingTypes(original?.fields?.[key],body[key])]));
    const masks = create ? [] : changed.flatMap(key => changedPaths(original.fields[key],fields[key],[key])).sort();
    return {id,create,source:original?{updateTime:original.updateTime,hash:publicationHash(original.fields)}:null,
      fields,updateMask:masks,unrelatedHash:original?publicationHash(without(original.fields,changed)):null};
  });
  const locks = PATRICK_PUBLICATION_IDS.map(id => {
    const path = `combat_profile_locks/characters/records/${id}`,document = documents[path];
    const keys = document?decodeFirestoreFields(document.fields).activeEncounterKeys:[];
    assert(keys === undefined || (Array.isArray(keys) && keys.length === 0),'Inventaränderung während eines laufenden Kampfes gesperrt.');
    return {path,source:document?{updateTime:document.updateTime,hash:publicationHash(document.fields)}:null};
  });
  const plan = {schema:'aleria.patrick-biography-publication-plan',schemaVersion:1,now,sourceHashes,assets,characters,locks,
    creatures:creatures.map(({id,...creature}) => ({id,fields:encodeFirestoreFields(creature)}))};
  plan.planId = publicationHash(plan);
  return plan;
}

export function validatePatrickPublicationPlan(plan) {
  assert.equal(plan.schema,'aleria.patrick-biography-publication-plan'); assert.equal(plan.schemaVersion,1);
  assert.equal(plan.planId,publicationHash(without(plan,['planId'])),'Plan wurde verändert.');
  assert.deepEqual(plan.characters.map(row => row.id),[...PATRICK_PUBLICATION_IDS]);
  assert.deepEqual(plan.creatures.map(row => row.id),[...PATRICK_PET_IDS]);
  assert.deepEqual(plan.locks.map(row => row.path),PATRICK_PUBLICATION_IDS.map(id => `combat_profile_locks/characters/records/${id}`));
  for(const row of plan.characters) {
    assert.equal(row.create,row.id===GWEN_CHARACTER_ID);
    const allowed = row.create?PATRICK_GWEN_CREATE_FIELDS:PATRICK_PATCH_FIELDS;
    assert(Object.keys(row.fields).every(field => allowed.includes(field)),'Unerlaubtes Charakterfeld.');
    assert(row.create || (row.source?.updateTime && /^[a-f0-9]{64}$/.test(row.source.hash)));
    assert(row.updateMask.every(mask => Object.keys(row.fields).some(key => mask===key||mask.startsWith(key+'.'))));
  }
  for(const [index,row] of plan.creatures.entries()) {
    const creature = decodeFirestoreFields(row.fields), spec = PATRICK_BIOGRAPHY_PETS[index];
    assert.equal(creature.name,spec.name); assert.equal(creature.itemOrigin?.ownerCharacterId,spec.ownerId);
    assert.equal(creature.bestiaryReference?.id,spec.bestiaryId);
    assert(creature.ownerUid && creature.createdBy,'Besitzrechte für neue Tierakte fehlen.');
  }
  return true;
}

export function patrickPublicationAlreadyApplied(plan, documents) {
  return [...plan.characters,...plan.creatures.map(row => ({...row,create:true,collection:'creatures'}))].every(row => {
    const current = documents[`${row.collection||'characters'}/${row.id}`];
    if(!current) return false;
    if(row.create) return patrickRestWrittenValuesEqual(current.fields,row.fields);
    return Object.entries(row.fields).every(([key,value]) => patrickRestWrittenValuesEqual(current.fields[key],value))
      && publicationHash(without(current.fields,Object.keys(row.fields))) === row.unrelatedHash;
  });
}

export function buildPatrickPublicationWrites(plan, documents, documentName) {
  validatePatrickPublicationPlan(plan);
  for(const row of plan.characters) {
    const original = documents[`characters/${row.id}`];
    if(row.create) assert.equal(original,null,'Neue Personen-ID inzwischen belegt.');
    else assert(original?.updateTime===row.source.updateTime && publicationHash(original.fields)===row.source.hash,'Eine Hauptakte wurde inzwischen bearbeitet. Plan neu erstellen.');
  }
  for(const row of plan.creatures) assert.equal(documents[`creatures/${row.id}`],null,'Neue Tier-ID inzwischen belegt.');
  const writes = plan.locks.map(row => {
    const lock = documents[row.path];
    assert(row.source?lock?.updateTime===row.source.updateTime&&publicationHash(lock.fields)===row.source.hash:lock===null,'Kampfsperre wurde inzwischen geändert.');
    return {verify:documentName(row.path),currentDocument:row.source?{updateTime:row.source.updateTime}:{exists:false}};
  });
  for(const row of plan.characters) writes.push({update:{name:documentName(`characters/${row.id}`),fields:row.fields},
    ...(!row.create?{updateMask:{fieldPaths:row.updateMask}}:{}),currentDocument:row.create?{exists:false}:{updateTime:row.source.updateTime}});
  for(const row of plan.creatures) writes.push({update:{name:documentName(`creatures/${row.id}`),fields:row.fields},currentDocument:{exists:false}});
  return writes;
}

export function verifyPatrickPublication(plan, before, after) {
  for(const row of plan.characters) {
    const actual = after[`characters/${row.id}`]?.fields;
    assert(actual,`Bestätigte Person fehlt: characters/${row.id}`);
    if(row.create) assert(patrickRestWrittenValuesEqual(actual,row.fields),`Geschriebene Person weicht ab: characters/${row.id}`);
    else {
      assert(isDeepStrictEqual(without(actual,Object.keys(row.fields)),without(before[`characters/${row.id}`].fields,Object.keys(row.fields))),
        `Unbeteiligte REST-Felder wurden verändert: characters/${row.id}`);
      assert.equal(publicationHash(without(actual,Object.keys(row.fields))),row.unrelatedHash,`Unbeteiligte REST-Prüfsumme weicht ab: characters/${row.id}`);
      for(const [key,value] of Object.entries(row.fields)) assert(patrickRestWrittenValuesEqual(actual[key],value),`Geschriebenes Feld weicht ab: characters/${row.id}.${key}`);
    }
  }
  for(const row of plan.creatures) assert(patrickRestWrittenValuesEqual(after[`creatures/${row.id}`]?.fields,row.fields),`Bestätigtes Tier weicht ab: creatures/${row.id}`);
  return true;
}

// Recovery validates the reviewed encoded plan against the already written
// documents. It neither rebuilds from changed source code nor issues writes.
export function verifyPatrickPublishedRecovery(plan, documents) {
  validatePatrickPublicationPlan(plan);
  for(const lock of plan.locks) assert(Object.hasOwn(documents,lock.path),`Kampfsperre wurde nicht eingelesen: ${lock.path}`);
  for(const row of plan.characters) {
    const fields = documents[`characters/${row.id}`]?.fields;
    assert(fields,`Veröffentlichte Person fehlt: characters/${row.id}`);
    if(row.create) assert(patrickRestWrittenValuesEqual(fields,row.fields),`Veröffentlichte Person weicht ab: characters/${row.id}`);
    else {
      assert.equal(publicationHash(without(fields,Object.keys(row.fields))),row.unrelatedHash,`Unbeteiligte REST-Prüfsumme weicht ab: characters/${row.id}`);
      for(const [key,value] of Object.entries(row.fields)) assert(patrickRestWrittenValuesEqual(fields[key],value),`Veröffentlichtes Feld weicht ab: characters/${row.id}.${key}`);
    }
  }
  for(const row of plan.creatures) assert(patrickRestWrittenValuesEqual(documents[`creatures/${row.id}`]?.fields,row.fields),`Veröffentlichtes Tier weicht ab: creatures/${row.id}`);
  const paths = [...PATRICK_PUBLICATION_IDS.map(id=>`characters/${id}`),...PATRICK_PET_IDS.map(id=>`creatures/${id}`)];
  const updateTimes = paths.map(path=>documents[path]?.updateTime);
  assert(updateTimes.every(time=>typeof time==='string'&&Number.isFinite(Date.parse(time))&&Date.parse(time)>=Date.parse(plan.now)),
    'Ein verlässlicher Commitzeitpunkt der sieben Dokumente fehlt.');
  assert(updateTimes.every(time=>time===updateTimes[0]),'Die sieben Dokumente besitzen keinen gemeinsamen Commitzeitpunkt.');
  return {committedAt:updateTimes[0],verifiedDocuments:paths.length,locksRead:plan.locks.length,
    restEmptyContainerCanonicalization:true,unrelatedMainFieldsExact:true,externalWrites:0,readOnlyRecovery:true};
}
