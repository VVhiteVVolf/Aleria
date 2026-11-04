import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,dirname,relative,isAbsolute,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createContentPublicationClient,backupContentPublication} from './content-publication-client.mjs';
import {decodeFirestoreFields} from '../backup/firestore-value-codec.mjs';
import {publicationHash,PATRICK_PUBLICATION_IDS,PATRICK_PET_IDS} from './patrick-biography-publication-plan.mjs';
import {PATRICK_STATIC_READ_PATHS,buildPatrickStaticAssetPlan,validatePatrickStaticAssets,
  validatePatrickStaticAssetPlan,buildPatrickStaticAssetWrites,verifyPatrickStaticAssetPublication} from './patrick-biography-static-assets-plan.mjs';

const ROOT=fileURLToPath(new URL('../../../',import.meta.url));
const PRIVATE=resolve(ROOT,'.private-backups/patrick-bios-20261103');
const MANIFEST='AleriaAlmanach/modules/patrick-biographies/biography-assets.static.json';
const OWN_CODE=['firebase/scripts/content/patrick-biography-static-assets-plan.mjs',
  'firebase/scripts/content/patrick-biography-static-assets.mjs','firebase/scripts/content/publish-patrick-biography-static-assets.mjs'];
const SOURCE_FILES=[MANIFEST,'AleriaAlmanach/modules/patrick-biographies/biography-assets.mjs',...OWN_CODE,
  'firebase/scripts/content/patrick-biography-publication-plan.mjs','firebase/scripts/content/content-publication-client.mjs',
  'firebase/scripts/backup/firestore-value-codec.mjs'];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const save=async(file,value,options={})=>{await mkdir(dirname(file),{recursive:true});await writeFile(file,JSON.stringify(value,null,2)+'\n',options);};
const sourceHashes=async()=>Object.fromEntries(await Promise.all(SOURCE_FILES.map(async file=>[file,hash(await readFile(resolve(ROOT,file)))])));

export function patrickStaticPrivatePath(path){
  const file=resolve(ROOT,path),rel=relative(PRIVATE,file);
  assert(rel&&!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+sep)&&!rel.startsWith(sep),'Bildplan und vollständiger Beleg müssen im privaten Patrick-Ordner liegen.');
  return file;
}

async function assertLocalStaticAssets(manifest){
  validatePatrickStaticAssets(manifest);
  for(const entry of manifest.entries)assert.equal(hash(await readFile(resolve(ROOT,entry.localPath))),entry.sha256,'Freigegebenes lokales Bildoriginal wurde geändert.');
}
async function checkSources(plan,{recovery=false}={}){
  const actual=await sourceHashes();
  if(recovery){
    assert.deepEqual(Object.keys(actual).sort(),Object.keys(plan.sourceHashes).sort(),'Sourceumfang wurde geändert.');
    for(const [file,value]of Object.entries(actual))if(!OWN_CODE.includes(file))assert.equal(value,plan.sourceHashes[file],'Eine geprüfte Daten-/Assetquelle wurde geändert.');
  }else assert.equal(publicationHash(actual),publicationHash(plan.sourceHashes),'Geprüfte Source-/Planmodule wurden geändert; einen neuen Plan vorbereiten.');
  await assertLocalStaticAssets(plan.manifest);
}

export async function assertPatrickStaticAssetsPublished(plan,{request=fetch}={}){
  for(let index=0;index<plan.manifest.entries.length;index+=5)await Promise.all(plan.manifest.entries.slice(index,index+5).map(async entry=>{
    const response=await request(entry.url,{signal:AbortSignal.timeout(30000)});
    assert(response.status===200&&response.headers.get('content-type')?.startsWith('image/'),'Ein statisches Bild ist öffentlich noch nicht als Bild verfügbar.');
    const bytes=Buffer.from(await response.arrayBuffer());
    assert(bytes.length>0&&bytes.length<=32*1024*1024,'Ungültige öffentliche Bildgröße.');
    assert.equal(hash(bytes),entry.sha256,'Öffentliches Bild stimmt nicht mit dem freigegebenen Original überein.');
  }));
  return {assetsVerified:plan.manifest.entries.length};
}

export async function readPatrickStaticState(client){
  return Object.fromEntries(await Promise.all(PATRICK_STATIC_READ_PATHS.map(async path=>[path,await client.request('/'+path)])));
}
function summary(plan,additional={}){
  return {planId:plan.planId,plannedAt:plan.now,assets:plan.manifest.entries.length,
    records:plan.records.map(row=>({path:row.path,imageReplacements:row.changes.length,fieldMask:row.updateMask})),
    combatLockGuards:plan.locks.filter(lock=>lock.guard).length,...additional};
}

async function confirmPublication(plan,documents,verification){
  const decode=path=>({id:path.split('/').at(-1),...decodeFirestoreFields(documents[path].fields)});
  const confirmation={schema:'aleria.patrick-biography-publication-confirmation',schemaVersion:1,verified:true,
    planId:plan.planId,committedAt:verification.committedAt,
    characters:PATRICK_PUBLICATION_IDS.map(id=>decode(`characters/${id}`)),creatures:PATRICK_PET_IDS.map(id=>decode(`creatures/${id}`)),
    imageUrlMigration:true,unrelatedRawFieldsUnchanged:true};
  const path=patrickStaticPrivatePath(`.private-backups/patrick-bios-20261103/static-assets-confirmation-${plan.planId.slice(0,16)}.json`);
  if(existsSync(path))assert.equal(publicationHash(await json(path)),publicationHash(confirmation),'Ein anderer vollständiger Beleg bleibt erhalten.');
  else await save(path,confirmation,{flag:'wx'});
  const publicResult=summary(plan,{...verification,previousImageHostUnavailable:true,staticOriginalsVerified:true,
    confirmationPath:relative(ROOT,path).replaceAll('\\','/')});
  await save(resolve(ROOT,'diagnostics/patrick-bios-20261103/static-assets-publication-verification.json'),publicResult);
  return publicResult;
}

export async function preparePatrickStaticAssets({client,planPath,now}){
  const file=patrickStaticPrivatePath(planPath),prior=existsSync(file)?await json(file):null;
  now||=prior?.now||new Date().toISOString();
  const manifest=await json(resolve(ROOT,MANIFEST));await assertLocalStaticAssets(manifest);
  const documents=await readPatrickStaticState(client);
  const plan=buildPatrickStaticAssetPlan({documents,manifest,now,sourceHashes:await sourceHashes()});
  validatePatrickStaticAssetPlan(plan);
  if(prior){assert.equal(prior.planId,plan.planId,'Vorhandener Bildplan bleibt unverändert; für neuen Stand einen neuen Pfad wählen.');return summary(plan,{alreadyPrepared:true});}
  await backupContentPublication('patrick-static-assets-before-prepare',Object.values(documents),[],now);
  await save(file,plan,{flag:'wx'});
  return summary(plan,{prepared:true,externalWrites:0,encryptedOriginalBackupCreated:true});
}

export async function applyPreparedPatrickStaticAssets({client,plan,hooks={}}){
  validatePatrickStaticAssetPlan(plan);await(hooks.checkSources||checkSources)(plan);
  const documents=await readPatrickStaticState(client);
  const isApplied=plan.records.every(row=>documents[row.path]?.fields&&publicationHash(documents[row.path].fields)===row.afterHash);
  if(isApplied){
    const verification=verifyPatrickStaticAssetPublication(plan,documents);
    await(hooks.checkAssets||assertPatrickStaticAssetsPublished)(plan);
    return (hooks.confirm||confirmPublication)(plan,documents,{...verification,alreadyApplied:true,externalWrites:0});
  }
  const rebuilt=buildPatrickStaticAssetPlan({documents,manifest:plan.manifest,sourceHashes:plan.sourceHashes,now:plan.now});
  assert.equal(rebuilt.planId,plan.planId,'Aktuelle Onlinewerte entsprechen nicht mehr dem geprüften Bildplan.');
  const writes=buildPatrickStaticAssetWrites(plan,documents,client.documentName);
  await(hooks.checkAssets||assertPatrickStaticAssetsPublished)(plan);
  await(hooks.backup||backupContentPublication)('patrick-static-assets-before-apply',Object.values(documents),[],new Date().toISOString());
  const commit=await client.request(':commit',{writes});
  const after=await readPatrickStaticState(client),verification=verifyPatrickStaticAssetPublication(plan,after);
  assert.equal(verification.committedAt,commit.commitTime,'Bestätigter Commitzeitpunkt weicht ab.');
  return(hooks.confirm||confirmPublication)(plan,after,{...verification,externalWrites:writes.filter(write=>write.update).length});
}

export async function verifyPreparedPatrickStaticAssets({client,plan,hooks={}}){
  validatePatrickStaticAssetPlan(plan);await(hooks.checkSources||checkSources)(plan,{recovery:true});
  const documents=await readPatrickStaticState(client),verification=verifyPatrickStaticAssetPublication(plan,documents);
  await(hooks.checkAssets||assertPatrickStaticAssetsPublished)(plan);
  return(hooks.confirm||confirmPublication)(plan,documents,{...verification,readOnlyRecovery:true,externalWrites:0});
}

export async function runPatrickStaticAssets({mode,planPath,now}){
  assert(['prepare','check','apply','verify-published','check-assets'].includes(mode));
  if(mode==='prepare')return preparePatrickStaticAssets({client:await createContentPublicationClient(),planPath,now});
  const plan=await json(patrickStaticPrivatePath(planPath));validatePatrickStaticAssetPlan(plan);
  if(mode==='check'){await checkSources(plan);return summary(plan,{checked:true,externalWrites:0,networkRequests:0});}
  if(mode==='check-assets'){await checkSources(plan);return summary(plan,{...await assertPatrickStaticAssetsPublished(plan),externalWrites:0});}
  const client=await createContentPublicationClient();
  return mode==='apply'?applyPreparedPatrickStaticAssets({client,plan}):verifyPreparedPatrickStaticAssets({client,plan});
}
