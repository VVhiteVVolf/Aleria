// Bounded, read-only image availability audit. Credentials and storage tokens
// remain in memory; only public asset keys and aggregate checks are reported.
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url);
const require=createRequire(new URL('firebase/package.json',root));
const auth=require('firebase-tools/lib/auth.js');
const account=auth.getProjectDefaultAccount(process.cwd());
if(!account?.tokens?.refresh_token)throw Error('Existing project authentication unavailable.');
const token=await auth.getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform']);
const headers={Authorization:`Bearer ${token.access_token}`,'x-goog-user-project':'aleriaprojekt'};
const manifests=await Promise.all(['biography-assets.publication.json','biography-assets.originals.json']
  .map(name=>readFile(new URL('AleriaAlmanach/modules/patrick-biographies/'+name,root),'utf8').then(JSON.parse)));
const entries=manifests.flatMap(manifest=>manifest.entries);
const sha=value=>createHash('sha256').update(value).digest('hex');
async function request(url,authenticated=false){return fetch(url,{...(authenticated?{headers}:{}),signal:AbortSignal.timeout(30000)});}
const results=[];
for(let index=0;index<entries.length;index+=5){
  results.push(...await Promise.all(entries.slice(index,index+5).map(async entry=>{
    const parsed=new URL(entry.url),parts=parsed.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
    if(!parts)throw Error('Unexpected immutable asset URL shape.');
    const [publicResponse,metadataResponse]=await Promise.all([
      request(entry.url),request(`https://storage.googleapis.com/storage/v1/b/${parts[1]}/o/${parts[2]}?fields=bucket,name,metadata,size,contentType,updated,generation`,true)
    ]);
    const metadata=await metadataResponse.json().catch(()=>({}));
    const metadataReadable=metadataResponse.ok;
    return {key:entry.key,publicStatus:publicResponse.status,
      ...(publicResponse.ok?{publicHashMatches:sha(Buffer.from(await publicResponse.arrayBuffer()))===entry.sha256}:{}),
      authenticatedMetadataStatus:metadataResponse.status,metadataReadable,
      metadataErrorReason:metadata.error?.errors?.find(row=>row.reason)?.reason,
      metadataPublic:metadataReadable?metadata.metadata?.visibility==='public':null,
      metadataHashMatches:metadataReadable?metadata.metadata?.sha256===entry.sha256:null,
      familyIdMatches:metadataReadable?metadata.metadata?.familyId==='haus-sgrechiwr':null,
      expectedBucket:metadataReadable?metadata.bucket==='aleriaprojekt.firebasestorage.app':null,size:metadata.size?Number(metadata.size):undefined,
      updated:metadata.updated};
  })));
}
const localRules=await readFile(new URL('firebase/storage.rules',root),'utf8');
const releaseResponse=await request('https://firebaserules.googleapis.com/v1/projects/aleriaprojekt/releases/firebase.storage/aleriaprojekt.firebasestorage.app',true);
let rules={releaseStatus:releaseResponse.status};
if(releaseResponse.ok){
  const release=await releaseResponse.json();
  const rulesResponse=await request('https://firebaserules.googleapis.com/v1/'+release.rulesetName,true);
  rules.rulesetStatus=rulesResponse.status;
  if(rulesResponse.ok){
    const ruleset=await rulesResponse.json(),files=ruleset.source?.files||[];
    const live=files.map(file=>file.content).join('\n');
    rules={...rules,releaseUpdated:release.updateTime,liveRulesHash:sha(live),localRulesHash:sha(localRules),
      liveEqualsLocal:live.replaceAll('\r\n','\n').trim()===localRules.replaceAll('\r\n','\n').trim(),
      publicMetadataClausePresent:live.includes("resource.metadata.visibility == 'public'"),
      sourceFileCount:files.length};
  }
}
const tally=field=>Object.fromEntries([...new Set(results.map(row=>String(row[field])))].map(value=>[value,results.filter(row=>String(row[field])===value).length]));
const report={schema:'aleria.public-image-read-audit',checkedAt:new Date().toISOString(),externalWrites:0,
  assets:results.length,publicStatuses:tally('publicStatus'),metadataStatuses:tally('authenticatedMetadataStatus'),
  allMetadataPublic:results.every(row=>row.metadataReadable)?results.every(row=>row.metadataPublic):null,
  allMetadataHashMatches:results.every(row=>row.metadataReadable)?results.every(row=>row.metadataHashMatches):null,
  allBucketsExpected:results.every(row=>row.metadataReadable)?results.every(row=>row.expectedBucket):null,
  metadataErrorReasons:tally('metadataErrorReason'),rules,results};
await writeFile(new URL('storage-availability.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
