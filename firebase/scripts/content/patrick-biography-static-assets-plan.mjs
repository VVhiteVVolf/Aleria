// Exact image URL substitutions in seven existing public records. Raw REST
// values are retained; no authored prose, identities or numeric values decode.
import assert from 'node:assert/strict';
import {PATRICK_PUBLICATION_IDS,PATRICK_PET_IDS,publicationHash} from './patrick-biography-publication-plan.mjs';
import {decodeFirestoreFields} from '../backup/firestore-value-codec.mjs';

export const PATRICK_STATIC_DOCUMENT_PATHS=Object.freeze([
  ...PATRICK_PUBLICATION_IDS.map(id=>`characters/${id}`),...PATRICK_PET_IDS.map(id=>`creatures/${id}`),
]);
export const PATRICK_STATIC_LOCK_PATHS=Object.freeze(PATRICK_PUBLICATION_IDS.map(id=>`combat_profile_locks/characters/records/${id}`));
export const PATRICK_STATIC_READ_PATHS=Object.freeze([...PATRICK_STATIC_DOCUMENT_PATHS,...PATRICK_STATIC_LOCK_PATHS]);
const ORIGIN='https://dieweltvonaleria.netlify.app';
const IMAGE_KEYS=new Set(['icon','image','portrait','img','avatar','thumbnail','portraitStages']);
const EXISTING_PORTRAITS=new Set([
  'Stammbäume/assets/images/portraits/haus-draenmelyn/rhiannon-draenmelyn.png',
  'Stammbäume/assets/images/portraits/haus-swyll/gareth-swyll.png',
]);
const fieldSegment=key=>/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)?key:'`'+key.replaceAll('\\','\\\\').replaceAll('`','\\`')+'`';
const fieldMask=keys=>keys.filter(key=>typeof key==='string').map(fieldSegment).join('.');
const sortedUnique=items=>[...new Set(items)].sort();
const compareImagePaths=(left,right)=>{
  const a=JSON.stringify(left.rawPath),b=JSON.stringify(right.rawPath);
  return a<b?-1:a>b?1:0;
};
const plain=value=>value&&typeof value==='object'&&!Array.isArray(value);
const at=(fields,path)=>path.reduce((value,key)=>value?.[key],fields);

function imageContext(keys){
  const last=keys.filter(key=>typeof key==='string').at(-1);
  return IMAGE_KEYS.has(last)||(keys.includes('portraitStages')&&!['id','name','description','notes','text','sourceId'].includes(last))
    ||(['url','src'].includes(last)&&keys.slice(0,-1).some(key=>IMAGE_KEYS.has(key)));
}

export function validatePatrickStaticAssets(manifest){
  assert.equal(manifest.schema,'aleria.biography-static-assets');assert.equal(manifest.schemaVersion,1);
  assert(Array.isArray(manifest.entries)&&manifest.entries.length>0,'Static-Assetmanifest fehlt.');
  const aliases=new Map(),targets=new Set();
  for(const entry of manifest.entries){
    assert(typeof entry.key==='string'&&entry.key,'Assetschlüssel fehlt.');
    assert(typeof entry.localPath==='string'&&(EXISTING_PORTRAITS.has(entry.localPath)
      ||/^AleriaAlmanach\/(?:public\/assets\/biography-trait-icons|assets\/biographies\/patrick-20261103\/originals)\/[a-z0-9.-]+\.(png|jpe?g)$/.test(entry.localPath)),'Unzulässiges öffentliches Assetoriginal.');
    const target=new URL(entry.url);
    assert.equal(target.origin,ORIGIN);assert(!target.search&&!target.hash&&!target.username&&!target.password);
    assert.equal(decodeURIComponent(target.pathname),'/'+entry.localPath,'Auslieferungs- und Originalpfad stimmen nicht überein.');
    assert(/^[a-f0-9]{64}$/.test(entry.sha256),'Assetprüfsumme fehlt.');
    assert(!targets.has(entry.url),'Doppeltes Static-Assetziel.');targets.add(entry.url);
    assert(Array.isArray(entry.aliases)&&entry.aliases.length>0,'Exakte Altverweise fehlen.');
    for(const alias of entry.aliases){
      const source=new URL(alias);
      assert.equal(source.protocol,'https:');assert(!source.username&&!source.password);
      assert(source.hostname==='i.imgur.com'||(source.hostname==='firebasestorage.googleapis.com'
        &&source.pathname.startsWith('/v0/b/aleriaprojekt.firebasestorage.app/o/family-assets%2Fhaus-sgrechiwr%2F')),'Unbekannte Aliasquelle.');
      assert(!aliases.has(alias),'Ein Alias besitzt mehrere Ziele.');aliases.set(alias,entry.url);
    }
  }
  return aliases;
}

function migrateValue(value,keys,rawPath,aliases){
  if(!plain(value))return {value,masks:[],changes:[]};
  if(Object.keys(value).length===1&&Object.hasOwn(value,'stringValue')&&imageContext(keys)&&aliases.has(value.stringValue)){
    const next=aliases.get(value.stringValue);
    return {value:{stringValue:next},masks:[fieldMask(keys)],changes:[{rawPath:[...rawPath,'stringValue'],from:value.stringValue,to:next}]};
  }
  if(value.mapValue&&plain(value.mapValue.fields)){
    const entries=[],masks=[],changes=[];
    for(const [key,child]of Object.entries(value.mapValue.fields)){
      const result=migrateValue(child,[...keys,key],[...rawPath,'mapValue','fields',key],aliases);
      entries.push([key,result.value]);masks.push(...result.masks);changes.push(...result.changes);
    }
    return {value:changes.length?{...value,mapValue:{...value.mapValue,fields:Object.fromEntries(entries)}}:value,masks,changes};
  }
  if(value.arrayValue&&Array.isArray(value.arrayValue.values)){
    const changes=[],values=value.arrayValue.values.map((child,index)=>{
      const result=migrateValue(child,[...keys,index],[...rawPath,'arrayValue','values',index],aliases);
      changes.push(...result.changes);return result.value;
    });
    // Firestore masks address fields, never array positions. Preserve each
    // untouched REST member and replace only this nearest outer array value.
    return {value:changes.length?{...value,arrayValue:{...value.arrayValue,values}}:value,
      masks:changes.length?[fieldMask(keys)]:[],changes};
  }
  return {value,masks:[],changes:[]};
}

export function migratePatrickStaticImageFields(fields,manifest){
  const aliases=validatePatrickStaticAssets(manifest),entries=[],masks=[],changes=[];
  for(const [key,value]of Object.entries(fields)){
    const result=migrateValue(value,[key],[key],aliases);
    entries.push([key,result.value]);masks.push(...result.masks);changes.push(...result.changes);
  }
  // Firestore REST maps have no stable entry order. A plan's ordered change
  // list follows its immutable raw paths, independent of each GET's key order.
  return {fields:Object.fromEntries(entries),updateMask:sortedUnique(masks),changes:changes.sort(compareImagePaths)};
}

function preservedHash(fields,changes){
  const copy=structuredClone(fields);
  for(const change of changes){
    const parent=at(copy,change.rawPath.slice(0,-1));
    assert(plain(parent),'Bildänderungspfad fehlt.');
    parent[change.rawPath.at(-1)]='__aleria_reviewed_image_url__';
  }
  return publicationHash(copy);
}

function reviewedImagePath(rawPath){
  assert(Array.isArray(rawPath)&&typeof rawPath[0]==='string','Ungültiger roher Bildpfad.');
  const keys=[rawPath[0]];let mask;
  for(let index=1;index<rawPath.length;index+=3){
    if(rawPath[index]==='stringValue'){
      assert.equal(index,rawPath.length-1,'Bildpfad läuft hinter dem String weiter.');
      assert(imageContext(keys),'Der Alias steht außerhalb eines Bildfelds.');
      return mask||fieldMask(keys);
    }
    if(rawPath[index]==='mapValue'){
      assert(rawPath[index+1]==='fields'&&typeof rawPath[index+2]==='string','Ungültiger roher Mappfad.');
    }else{
      assert(rawPath[index]==='arrayValue'&&rawPath[index+1]==='values'&&Number.isInteger(rawPath[index+2])&&rawPath[index+2]>=0,'Ungültiger roher Arraypfad.');
      mask||=fieldMask(keys);
    }
    keys.push(rawPath[index+2]);
  }
  assert.fail('Der rohe Bildpfad endet nicht in einem String.');
}

export function buildPatrickStaticAssetPlan({documents,manifest,sourceHashes,now}){
  assert(Number.isFinite(Date.parse(now)),'Stabiler Planzeitpunkt fehlt.');
  assert.deepEqual(Object.keys(documents).sort(),[...PATRICK_STATIC_READ_PATHS].sort(),'Unerwarteter Leseumfang.');
  validatePatrickStaticAssets(manifest);
  const records=PATRICK_STATIC_DOCUMENT_PATHS.map(path=>{
    const original=documents[path];assert(original?.fields&&original.updateTime,'Eine vorhandene Haupt- oder Tierakte fehlt.');
    const result=migratePatrickStaticImageFields(original.fields,manifest);
    return {path,expectedUpdateTime:original.updateTime,beforeHash:publicationHash(original.fields),afterHash:publicationHash(result.fields),
      preservedRawHash:preservedHash(original.fields,result.changes),updateMask:result.updateMask,changes:result.changes,
      fields:Object.fromEntries([...new Set(result.changes.map(change=>change.rawPath[0]))].map(key=>[key,result.fields[key]]))};
  });
  assert(records.some(row=>row.changes.length),'Keine freigegebenen alten Bildverweise gefunden.');
  const locks=PATRICK_STATIC_LOCK_PATHS.map(path=>{
    const document=documents[path],characterPath='characters/'+path.split('/').at(-1);
    const guard=records.find(row=>row.path===characterPath).updateMask.some(mask=>mask==='inventory'||mask.startsWith('inventory.'));
    const active=document?decodeFirestoreFields(document.fields).activeEncounterKeys:[];
    assert(!guard||active===undefined||(Array.isArray(active)&&active.length===0),'Inventarbilder während eines laufenden Kampfes gesperrt.');
    return {path,guard,source:document?{updateTime:document.updateTime,hash:publicationHash(document.fields)}:null};
  });
  const plan={schema:'aleria.patrick-biography-static-asset-plan',schemaVersion:1,now,sourceHashes,manifest,records,locks};
  plan.planId=publicationHash(plan);return plan;
}

export function validatePatrickStaticAssetPlan(plan){
  assert.equal(plan.schema,'aleria.patrick-biography-static-asset-plan');assert.equal(plan.schemaVersion,1);
  const {planId,...body}=plan;assert.equal(planId,publicationHash(body),'Der immutable Bildplan wurde verändert.');
  const aliases=validatePatrickStaticAssets(plan.manifest);
  assert.deepEqual(plan.records.map(row=>row.path),[...PATRICK_STATIC_DOCUMENT_PATHS]);
  assert.deepEqual(plan.locks.map(row=>row.path),[...PATRICK_STATIC_LOCK_PATHS]);
  for(const row of plan.records){
    assert(row.expectedUpdateTime&&row.beforeHash&&row.afterHash&&row.preservedRawHash);
    assert.deepEqual(row.updateMask,sortedUnique(row.changes.map(change=>reviewedImagePath(change.rawPath))),'Bildmasken sind nicht exakt auf die geänderten Felder begrenzt.');
    assert.deepEqual(Object.keys(row.fields).sort(),sortedUnique(row.changes.map(change=>change.rawPath[0])),'Der Bildpatch enthält unbeteiligte Hauptfelder.');
    for(const change of row.changes){
      assert.equal(aliases.get(change.from),change.to,'Nicht freigegebener Bildalias.');
      assert.equal(change.rawPath.at(-1),'stringValue','Nur rohe Stringwerte dürfen geändert werden.');
      assert.equal(at(row.fields,change.rawPath),change.to,'Patch und Bildänderung weichen ab.');
    }
  }
  return true;
}

export function buildPatrickStaticAssetWrites(plan,documents,documentName){
  validatePatrickStaticAssetPlan(plan);
  const writes=[];
  for(const lock of plan.locks.filter(lock=>lock.guard)){
    const actual=documents[lock.path];
    assert(lock.source?actual?.updateTime===lock.source.updateTime&&publicationHash(actual.fields)===lock.source.hash:actual===null,'Kampfsperre wurde verändert.');
    writes.push({verify:documentName(lock.path),currentDocument:lock.source?{updateTime:lock.source.updateTime}:{exists:false}});
  }
  for(const row of plan.records){
    const original=documents[row.path];
    assert(original?.updateTime===row.expectedUpdateTime&&publicationHash(original.fields)===row.beforeHash,'Eine geprüfte Onlineakte wurde zwischenzeitlich geändert.');
    writes.push(row.changes.length?{update:{name:documentName(row.path),fields:row.fields},updateMask:{fieldPaths:row.updateMask},
      currentDocument:{updateTime:row.expectedUpdateTime}}:{verify:documentName(row.path),currentDocument:{updateTime:row.expectedUpdateTime}});
  }
  return writes;
}

export function verifyPatrickStaticAssetPublication(plan,documents){
  validatePatrickStaticAssetPlan(plan);
  const times=[];
  for(const row of plan.records){
    const document=documents[row.path];assert(document?.fields,'Veröffentlichtes Prüfdokument fehlt.');
    assert.equal(publicationHash(document.fields),row.afterHash,'Veröffentlichtes Dokument weicht vom exakten Bildplan ab.');
    assert.equal(preservedHash(document.fields,row.changes),row.preservedRawHash,'Unbeteiligte rohe REST-Werte wurden geändert.');
    for(const change of row.changes)assert.equal(at(document.fields,change.rawPath),change.to,'Freigegebener Bildverweis fehlt.');
    if(row.changes.length)times.push(document.updateTime);
    else assert.equal(document.updateTime,row.expectedUpdateTime,'Unbeteiligte Akte besitzt eine neue Version.');
  }
  assert(times.length>0&&times.every(time=>typeof time==='string'&&Number.isFinite(Date.parse(time))&&Date.parse(time)>=Date.parse(plan.now)),'Verlässlicher Bildcommitzeitpunkt fehlt.');
  assert(times.every(time=>time===times[0]),'Bildänderungen besitzen keinen gemeinsamen Commitzeitpunkt.');
  return {verified:true,committedAt:times[0],verifiedDocuments:plan.records.length,
    changedDocuments:plan.records.filter(row=>row.changes.length).length,imageReplacements:plan.records.reduce((sum,row)=>sum+row.changes.length,0),
    unrelatedRawFieldsUnchanged:true};
}
