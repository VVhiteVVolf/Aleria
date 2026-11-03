import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, relative, dirname, sep, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createContentPublicationClient, createPublicContentReadClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { PATRICK_BIOGRAPHY_PETS } from '../../../AleriaAlmanach/modules/patrick-biographies/biography-companions.mjs';
import * as BIOGRAPHY_ART from '../../../AleriaAlmanach/modules/patrick-biographies/biography-assets.mjs';
import { PATRICK_READ_PATHS, PATRICK_PUBLICATION_IDS, PATRICK_PET_IDS, preparePatrickPublicationDesired,
  collectPatrickPublicationAssetUrls, buildPatrickPublicationPlan, validatePatrickPublicationPlan, publicationHash,
  patrickPublicationAlreadyApplied, buildPatrickPublicationWrites, verifyPatrickPublication,
  verifyPatrickPublishedRecovery } from './patrick-biography-publication-plan.mjs';

const ROOT = fileURLToPath(new URL('../../../',import.meta.url));
const PRIVATE = resolve(ROOT,'.private-backups/patrick-bios-20261103');
const PUBLIC = resolve(ROOT,'diagnostics/patrick-bios-20261103/publication-verification.json');
const SOURCE_FILES = [
  'AleriaAlmanach/modules/patrick-biographies/source/biographies-2026-11-03.json',
  'AleriaAlmanach/modules/patrick-biographies/biography-source.generated.mjs',
  'AleriaAlmanach/modules/patrick-biographies/biography-source.mjs',
  'AleriaAlmanach/modules/patrick-biographies/biography-assets.mjs',
  'AleriaAlmanach/modules/patrick-biographies/biography-identities.mjs',
  'AleriaAlmanach/modules/patrick-biographies/biography-icon-plan.mjs',
  'AleriaAlmanach/modules/patrick-biographies/biography-companions.mjs',
  'AleriaAlmanach/modules/patrick-biographies/biography-plan.mjs',
  'firebase/scripts/content/patrick-biography-publication-plan.mjs',
  'firebase/scripts/content/patrick-biography-publication.mjs',
];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const save = async (path,value,options={}) => { await mkdir(dirname(path),{recursive:true}); await writeFile(path,JSON.stringify(value,null,2)+'\n',options); };
const json = async path => JSON.parse(await readFile(path,'utf8'));

export function patrickPrivatePlanPath(path) {
  const target = resolve(ROOT,path), rel = relative(PRIVATE,target);
  assert(rel && !isAbsolute(rel) && !rel.startsWith('..'+sep) && rel!=='..' && !rel.startsWith(sep),'Der vollständige Plan muss im privaten Patrick-Ordner liegen.');
  return target;
}
async function sourceHashes() {
  return Object.fromEntries(await Promise.all(SOURCE_FILES.map(async file => [file,sha(await readFile(resolve(ROOT,file)))])));
}
function localAssetPath(url) {
  const parsed = new URL(url);
  const entry = Object.entries(BIOGRAPHY_ART.PATRICK_BIOGRAPHY_ASSETS).find(([,value]) => new URL(value,'https://dieweltvonaleria.netlify.app/AleriaAlmanach/').href===url);
  const original = entry && BIOGRAPHY_ART.PATRICK_BIOGRAPHY_LOCAL_ASSETS?.[entry[0]];
  if(!original && !['dieweltvonaleria.netlify.app','www.dieweltvonaleria.netlify.app'].includes(parsed.hostname)) {
    assert(!(entry?.[0].startsWith('trait:') && parsed.hostname==='firebasestorage.googleapis.com'),'Lokales freigegebenes Original für Storageicon fehlt.');
    return '';
  }
  const target = resolve(ROOT,'.'+decodeURIComponent(original||parsed.pathname)), rel = relative(ROOT,target);
  assert(!rel.startsWith('..'+sep) && rel!=='..','Ungültiger lokaler Bildpfad.');
  return target;
}
async function imageBytes(url) {
  const response = await fetch(url,{signal:AbortSignal.timeout(30000)});
  assert(response.status===200 && response.headers.get('content-type')?.startsWith('image/'),'Bild-HTTP-Prüfung fehlgeschlagen: '+url);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert(bytes.length>0 && bytes.length<=32*1024*1024,'Ungültige Bildgröße: '+url);
  return bytes;
}
async function assetManifest(urls) {
  const result = [];
  for(let index=0;index<urls.length;index+=5) result.push(...await Promise.all(urls.slice(index,index+5).map(async url => {
    const path = localAssetPath(url), bytes = path?await readFile(path):await imageBytes(url);
    return {url,sha256:sha(bytes),...(path?{localPath:relative(ROOT,path).replaceAll('\\','/')}:{})};
  })));
  return result;
}
async function assertLocalSources(plan) {
  assert.equal(publicationHash(await sourceHashes()),publicationHash(plan.sourceHashes),'Die geprüften Source-/Planmodule wurden verändert. Neu vorbereiten.');
  for(const asset of plan.assets.filter(asset => asset.localPath)) assert.equal(sha(await readFile(resolve(ROOT,asset.localPath))),asset.sha256,'Lokales Bild wurde verändert.');
}
// A post-commit verifier correction must not permit the authored biographies,
// assets or their factories to drift from the immutable reviewed plan.
async function assertRecoverySources(plan) {
  const corrected = new Set([
    'firebase/scripts/content/patrick-biography-publication-plan.mjs',
    'firebase/scripts/content/patrick-biography-publication.mjs',
  ]);
  const current = await sourceHashes();
  assert.deepEqual(Object.keys(current).sort(),Object.keys(plan.sourceHashes).sort(),'Der gespeicherte Sourceumfang weicht ab.');
  for(const [file,hash] of Object.entries(current)) if(!corrected.has(file)) {
    assert.equal(hash,plan.sourceHashes[file],'Eine geprüfte Biografie-, Asset- oder Factoryquelle wurde verändert.');
  }
  for(const asset of plan.assets.filter(asset=>asset.localPath)) {
    assert.equal(sha(await readFile(resolve(ROOT,asset.localPath))),asset.sha256,'Lokales Bild wurde verändert.');
  }
}
export async function assertPatrickPublishedAssets(plan) {
  for(let index=0;index<plan.assets.length;index+=5) await Promise.all(plan.assets.slice(index,index+5).map(async asset =>
    assert.equal(sha(await imageBytes(asset.url)),asset.sha256,'Veröffentlichtes Bild stimmt nicht mit dem geprüften Original überein: '+asset.url)));
}
export async function readPatrickPublicationState(client) {
  const [documents,query] = await Promise.all([
    Promise.all(PATRICK_READ_PATHS.map(async path => [path,await client.request('/'+path)])),
    client.request(':runQuery',{structuredQuery:{from:[{collectionId:'creatures'}],where:{fieldFilter:{field:{fieldPath:'name'},op:'IN',
      value:{arrayValue:{values:PATRICK_BIOGRAPHY_PETS.map(spec => ({stringValue:spec.name}))}}}}}}),
  ]);
  return {documents:Object.fromEntries(documents),nameMatches:query.filter(row => row.document).map(row => row.document.name)};
}
function summary(plan,additional={}) {
  return {planId:plan.planId,plannedAt:plan.now,characters:plan.characters.map(row => ({id:row.id,create:row.create,fields:Object.keys(row.fields),fieldMask:row.updateMask})),
    creatures:plan.creatures.map(row => ({id:row.id})),assets:plan.assets.length,...additional};
}

export async function preparePatrickPublication({client,planPath,now}) {
  const path = patrickPrivatePlanPath(planPath), existing = existsSync(path)?await json(path):null;
  now ||= existing?.now || new Date().toISOString();
  const state = await readPatrickPublicationState(client);
  // Fail on any existing pet before collecting external artwork or creating a plan.
  assert.equal(state.nameMatches.length,0,'Ein benanntes Tier ist bereits vorhanden.');
  const desired = preparePatrickPublicationDesired(state.documents,now);
  const assets = await assetManifest(collectPatrickPublicationAssetUrls(desired.desired,desired.creatures));
  const plan = buildPatrickPublicationPlan({...state,now,assets,sourceHashes:await sourceHashes()});
  validatePatrickPublicationPlan(plan);
  if(existing) { assert.equal(existing.planId,plan.planId,'Der vorhandene Plan bleibt erhalten; für eine neue Prüfung einen neuen privaten Planpfad wählen.'); return summary(plan,{alreadyPrepared:true}); }
  await backupContentPublication('patrick-biographies-before-prepare',Object.values(state.documents),
    [`characters/${PATRICK_PUBLICATION_IDS[2]}`,...PATRICK_PET_IDS.map(id => `creatures/${id}`)],now);
  await save(path,plan,{flag:'wx'});
  return summary(plan,{prepared:true,encryptedOriginalBackupCreated:true});
}

async function writeConfirmation(plan,documents,committedAt,verification={}) {
  const decode = path => ({id:path.split('/').at(-1),...decodeFirestoreFields(documents[path].fields)});
  const confirmation = {schema:'aleria.patrick-biography-publication-confirmation',schemaVersion:1,verified:true,planId:plan.planId,committedAt,
    characters:PATRICK_PUBLICATION_IDS.map(id => decode(`characters/${id}`)),creatures:PATRICK_PET_IDS.map(id => decode(`creatures/${id}`)),...verification};
  const path = resolve(PRIVATE,'publication-confirmation.json');
  const prior = existsSync(path)?await json(path):null;
  if(prior) assert(prior.planId===plan.planId && prior.verified===true,'Eine andere Publikationsbestätigung bleibt erhalten.');
  else await save(path,confirmation,{flag:'wx'});
  const publicResult = summary(plan,{verified:true,committedAt,unrelatedRestFieldsUnchanged:true,createdCharacters:1,createdCreatures:4,...verification});
  await save(PUBLIC,publicResult);
  return publicResult;
}

export async function applyPatrickPublication({client,planPath}) {
  const plan = await json(patrickPrivatePlanPath(planPath));
  return applyPreparedPatrickPublication({client,plan});
}

// Dependencies are injectable for offline guard tests; the CLI always uses the
// existing authenticated client, encrypted backup and real HTTP verification.
export async function applyPreparedPatrickPublication({client,plan,hooks={}}) {
  const checkSources = hooks.checkSources || assertLocalSources;
  const checkAssets = hooks.checkAssets || assertPatrickPublishedAssets;
  const backup = hooks.backup || backupContentPublication;
  const confirm = hooks.confirm || writeConfirmation;
  validatePatrickPublicationPlan(plan); await checkSources(plan);
  const state = await readPatrickPublicationState(client);
  if(patrickPublicationAlreadyApplied(plan,state.documents)) {
    return {...await confirm(plan,state.documents,state.documents[`characters/${PATRICK_PUBLICATION_IDS[2]}`].updateTime),alreadyApplied:true};
  }
  assert.equal(state.nameMatches.length,0,'Ein benanntes Tier ist inzwischen vorhanden.');
  const rebuilt = buildPatrickPublicationPlan({...state,now:plan.now,assets:plan.assets,sourceHashes:plan.sourceHashes});
  assert.equal(rebuilt.planId,plan.planId,'Die echten Onlinequellen entsprechen nicht mehr dem geprüften Plan.');
  const writes = buildPatrickPublicationWrites(plan,state.documents,client.documentName);
  await checkAssets(plan); // Every referenced URL must serve the reviewed bytes before applying live references.
  await backup('patrick-biographies-before-apply',Object.values(state.documents),
    [`characters/${PATRICK_PUBLICATION_IDS[2]}`,...PATRICK_PET_IDS.map(id => `creatures/${id}`)],new Date().toISOString());
  const commit = await client.request(':commit',{writes});
  const after = Object.fromEntries(await Promise.all([...PATRICK_PUBLICATION_IDS.map(id => `characters/${id}`),...PATRICK_PET_IDS.map(id => `creatures/${id}`)]
    .map(async path => [path,await client.request('/'+path)])));
  verifyPatrickPublication(plan,state.documents,after);
  return confirm(plan,after,commit.commitTime);
}

export async function checkPatrickPublication(planPath) {
  const plan = await json(patrickPrivatePlanPath(planPath));
  validatePatrickPublicationPlan(plan); await assertLocalSources(plan);
  return summary(plan,{checked:true,networkRequests:0});
}

export async function verifyPreparedPatrickPublication({client,plan,hooks={}}) {
  validatePatrickPublicationPlan(plan);
  await (hooks.checkSources || assertRecoverySources)(plan);
  // This recovery path has no query, backup or commit call. Even an injected
  // authenticated client is exposed here only through ten bounded GETs.
  const documents = Object.fromEntries(await Promise.all(PATRICK_READ_PATHS.map(async path=>[path,await client.request('/'+path)])));
  const recovery = verifyPatrickPublishedRecovery(plan,documents);
  const result = await (hooks.confirm || writeConfirmation)(plan,documents,recovery.committedAt,recovery);
  return {...result,...recovery};
}

export async function verifyPublishedPatrickPublication({client,planPath}) {
  return verifyPreparedPatrickPublication({client,plan:await json(patrickPrivatePlanPath(planPath))});
}

export async function runPatrickBiographyPublication({mode,planPath,publicOnly=false,now}) {
  if(mode==='check') return checkPatrickPublication(planPath);
  assert(['prepare','apply','verify-published'].includes(mode));
  assert(!(mode==='apply'&&publicOnly),'Apply benötigt die bestehende authentifizierte Projektverbindung.');
  const client = publicOnly?createPublicContentReadClient():await createContentPublicationClient();
  if(mode==='verify-published') return verifyPublishedPatrickPublication({client,planPath});
  return mode==='prepare'?preparePatrickPublication({client,planPath,now}):applyPatrickPublication({client,planPath});
}
