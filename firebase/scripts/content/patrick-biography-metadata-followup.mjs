// A separate, bounded correction for the two flat Rhiannon profile fields.
// It never replays the original character/companion publication.
import assert from 'node:assert/strict';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { dirname,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { createPublicContentReadClient,createContentPublicationClient,backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields,encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { PATRICK_PUBLICATION_IDS,PATRICK_PET_IDS,publicationHash } from './patrick-biography-publication-plan.mjs';
import { patrickPrivatePlanPath } from './patrick-biography-publication.mjs';
import { RHIANNON_CHARACTER_ID } from '../../../AleriaAlmanach/modules/patrick-biographies/biography-identities.mjs';
import { getPatrickBiographyCharacterMetadata } from '../../../AleriaAlmanach/modules/patrick-biographies/biography-source.mjs';
import { createPatrickBiographyExports } from '../../../AleriaAlmanach/modules/patrick-biographies/biography-database-projection.mjs';

const ROOT=fileURLToPath(new URL('../../../',import.meta.url));
const PRIVATE=resolve(ROOT,'.private-backups/patrick-bios-20261103');
const PATHS=[...PATRICK_PUBLICATION_IDS.map(id=>'characters/'+id),...PATRICK_PET_IDS.map(id=>'creatures/'+id)];
const TARGET='characters/'+RHIANNON_CHARACTER_ID;
const MASK=['bio','role','updatedAt'];
const SOURCE_FILES=[
  'AleriaAlmanach/modules/patrick-biographies/biography-source.mjs',
  'AleriaAlmanach/modules/patrick-biographies/biography-source.generated.mjs',
  'AleriaAlmanach/modules/patrick-biographies/biography-database-projection.mjs',
  'firebase/scripts/content/patrick-biography-metadata-followup.mjs',
  'firebase/scripts/content/publish-patrick-biography-metadata.mjs',
];
const readJson=async path=>JSON.parse(await readFile(path,'utf8'));
const save=async(path,value)=>{await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(value,null,2)+'\n',{flag:'wx'});};
const withoutMetadata=fields=>Object.fromEntries(Object.entries(fields).filter(([key])=>!MASK.includes(key)));
const capture=async client=>Object.fromEntries(await Promise.all(PATHS.map(async path=>[path,await client.request('/'+path)])));
async function sourceHashes(){return Object.fromEntries(await Promise.all(SOURCE_FILES.map(async path=>[path,createHash('sha256').update(await readFile(resolve(ROOT,path))).digest('hex')])));}

function decodedConfirmation(documents,{planId,committedAt,previousPlanId,verifiedAt}){
  const decode=path=>({id:path.split('/').at(-1),...decodeFirestoreFields(documents[path].fields)});
  return {schema:'aleria.patrick-biography-publication-confirmation',schemaVersion:1,verified:true,planId,committedAt,verifiedAt,
    publicationLineage:{kind:'rhiannon-flat-metadata-followup',previousPlanId},
    characters:PATRICK_PUBLICATION_IDS.map(id=>decode('characters/'+id)),creatures:PATRICK_PET_IDS.map(id=>decode('creatures/'+id))};
}

export function validatePatrickMetadataState(documents,proof){
  assert.deepEqual(Object.keys(documents).sort(),[...PATHS].sort(),'Unvollständiger Leseumfang.');
  assert(PATHS.every(path=>documents[path]?.updateTime&&documents[path]?.fields),'Eine bestätigte öffentliche Akte fehlt.');
  const confirmation=decodedConfirmation(documents,proof);
  createPatrickBiographyExports(confirmation); // Exact three identities and four real bestiary/owner identities.
  for(const creature of confirmation.creatures){
    const owner=confirmation.characters.find(row=>row.id===creature.itemOrigin.ownerCharacterId);
    const cards=owner.inventory?.companions?.filter(card=>card.creatureId===creature.id)||[];
    const items=owner.inventory?.items?.filter(item=>item.creatureId===creature.id)||[];
    assert(cards.length===1&&items.length===1,'Die aktuelle Begleiterbindung ist nicht eindeutig.');
    assert(cards[0].inventoryItemId===creature.itemOrigin.inventoryItemId&&items[0].id===creature.itemOrigin.inventoryItemId
      &&items[0].instanceId===creature.itemOrigin.instanceId,'Die aktuelle Begleiterbindung widerspricht dem Tier.');
  }
  return confirmation;
}

export function buildPatrickMetadataPlan({documents,preparedAt,previousPlanId,sourceHashes}){
  assert(Number.isFinite(Date.parse(preparedAt))&&/^[a-f0-9]{64}$/.test(previousPlanId),'Gültiger Zeitpunkt und voriger Publikationsbeleg fehlen.');
  validatePatrickMetadataState(documents,{planId:previousPlanId,committedAt:preparedAt});
  const metadata=getPatrickBiographyCharacterMetadata(RHIANNON_CHARACTER_ID),fields=encodeFirestoreFields({...metadata,updatedAt:preparedAt});
  assert(!isDeepStrictEqual(Object.fromEntries(Object.keys(metadata).map(key=>[key,documents[TARGET].fields[key]])),encodeFirestoreFields(metadata)),
    'Die Rollen-Kurzfassung ist bereits aktuell; kein neuer Schreibplan.');
  const plan={schema:'aleria.patrick-biography-metadata-followup-plan',schemaVersion:1,preparedAt,previousPlanId,sourceHashes,
    target:TARGET,fieldMask:MASK,fields,
    sources:PATHS.map(path=>({path,updateTime:documents[path].updateTime,sha256:publicationHash(documents[path].fields)})),
    unrelatedSha256:publicationHash(withoutMetadata(documents[TARGET].fields)),
    rollback:Object.fromEntries(MASK.map(key=>[key,Object.hasOwn(documents[TARGET].fields,key)?{restoreRestValue:documents[TARGET].fields[key]}:{deleteField:true}]))};
  plan.planId=publicationHash(plan);return plan;
}

export function validatePatrickMetadataPlan(plan){
  const {planId,...body}=plan;
  assert.equal(plan.schema,'aleria.patrick-biography-metadata-followup-plan');assert.equal(plan.schemaVersion,1);
  assert.equal(publicationHash(body),planId,'Geprüfter Metadatenplan wurde verändert.');
  assert.equal(plan.target,TARGET);assert.deepEqual(plan.fieldMask,MASK);
  assert.deepEqual(plan.sources.map(row=>row.path),PATHS);
  assert.deepEqual(plan.fields,encodeFirestoreFields({...getPatrickBiographyCharacterMetadata(RHIANNON_CHARACTER_ID),updatedAt:plan.preparedAt}),
    'Metadatenplan weicht von der freigegebenen Rollenquelle ab.');
}

export function buildPatrickMetadataWrites(plan,documents,documentName){
  validatePatrickMetadataPlan(plan);
  for(const row of plan.sources)assert(documents[row.path]?.updateTime===row.updateTime&&publicationHash(documents[row.path].fields)===row.sha256,
    'Eine geprüfte Personen- oder Tierakte wurde inzwischen verändert.');
  return plan.sources.map(row=>row.path===TARGET?{update:{name:documentName(TARGET),fields:plan.fields},
    updateMask:{fieldPaths:MASK},currentDocument:{updateTime:row.updateTime}}:{verify:documentName(row.path),currentDocument:{updateTime:row.updateTime}});
}

export function verifyPatrickMetadataFollowup(plan,before,after){
  validatePatrickMetadataPlan(plan);
  for(const path of PATHS){
    assert(after[path]?.fields,'Eine nachgeprüfte Akte fehlt.');
    if(path===TARGET){
      assert(isDeepStrictEqual(withoutMetadata(after[path].fields),withoutMetadata(before[path].fields)),'Unbeteiligte REST-Felder wurden verändert.');
      assert.equal(publicationHash(withoutMetadata(after[path].fields)),plan.unrelatedSha256,'Unbeteiligte REST-Prüfsumme weicht ab.');
      assert(isDeepStrictEqual(Object.fromEntries(MASK.map(key=>[key,after[path].fields[key]])),plan.fields),'Geschriebene Rollen-Kurzfassung weicht ab.');
    }else assert(isDeepStrictEqual(after[path],before[path]),'Eine andere Personen- oder Tierakte wurde verändert.');
  }
  return true;
}

export async function applyPatrickMetadataFollowup({client,plan,hooks={}}){
  validatePatrickMetadataPlan(plan);
  assert.deepEqual(await (hooks.sourceHashes||sourceHashes)(),plan.sourceHashes,'Die geprüften Metadatenquellen wurden verändert.');
  const before=await capture(client);
  validatePatrickMetadataState(before,{planId:plan.planId,committedAt:plan.preparedAt});
  const writes=buildPatrickMetadataWrites(plan,before,client.documentName);
  await (hooks.backup||backupContentPublication)('patrick-biography-metadata-before-apply',Object.values(before),[],new Date().toISOString());
  const commit=await client.request(':commit',{writes});
  const after=await capture(client);verifyPatrickMetadataFollowup(plan,before,after);
  assert.equal(after[TARGET].updateTime,commit.commitTime,'Commitzeitpunkt der Rollenänderung weicht ab.');
  const confirmation=validatePatrickMetadataState(after,{planId:plan.planId,committedAt:commit.commitTime,previousPlanId:plan.previousPlanId,verifiedAt:new Date().toISOString()});
  const proof={schema:'aleria.patrick-biography-metadata-followup-verification',schemaVersion:1,verified:true,planId:plan.planId,previousPlanId:plan.previousPlanId,
    committedAt:commit.commitTime,verifiedAt:confirmation.verifiedAt,characterId:RHIANNON_CHARACTER_ID,fieldMask:MASK,metadata:getPatrickBiographyCharacterMetadata(RHIANNON_CHARACTER_ID),
    verifiedDocuments:7,updatedDocuments:1,verifyOnlyDocuments:6,unrelatedRawFieldsExact:true,inventoryWrites:0,combatWrites:0};
  if(hooks.confirm)await hooks.confirm(confirmation,proof);
  else{
    await save(resolve(PRIVATE,'metadata-followup-confirmation.json'),confirmation);
    await save(resolve(ROOT,'diagnostics/patrick-bios-20261103/metadata-followup-verification.json'),proof);
  }
  return proof;
}

export async function runPatrickMetadataFollowup({mode,planPath}){
  const path=patrickPrivatePlanPath(planPath);
  if(mode==='prepare'){
    const historical=await readJson(resolve(PRIVATE,'publication-confirmation.json'));
    assert.equal(historical.verified,true);createPatrickBiographyExports(historical);
    const documents=await capture(createPublicContentReadClient());
    const plan=buildPatrickMetadataPlan({documents,preparedAt:new Date().toISOString(),previousPlanId:historical.planId,sourceHashes:await sourceHashes()});
    await save(path,plan);
    return {prepared:true,planId:plan.planId,target:plan.target,fieldMask:plan.fieldMask,metadata:getPatrickBiographyCharacterMetadata(RHIANNON_CHARACTER_ID),
      externalWrites:0,guardedDocuments:plan.sources.length};
  }
  assert.equal(mode,'apply');
  return applyPatrickMetadataFollowup({client:await createContentPublicationClient(),plan:await readJson(path)});
}
