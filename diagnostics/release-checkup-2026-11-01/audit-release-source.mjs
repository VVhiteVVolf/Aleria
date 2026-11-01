import { execFileSync } from 'node:child_process';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const git=args=>execFileSync('git',['-c','core.quotepath=false','-c','core.safecrlf=false',...args],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
const changed=[...new Set([...git(['diff','--name-only','-z','HEAD']).split('\0'),...git(['ls-files','--others','--exclude-standard','-z']).split('\0')].filter(Boolean))];
const patterns=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]{40}/],
  ['oauth-access-token',/ya29\.[A-Za-z0-9_-]{50,}/],['github-token',/(?:gh[pousr]_[A-Za-z0-9]{35,}|github_pat_[A-Za-z0-9_]{50,})/],
  ['aws-access-key',/AKIA[A-Z0-9]{16}/],['service-account-key',/"private_key"\s*:\s*"[^"\n]{100,}/]];
const findings=[],large=[],newFiles=[],reviewedSyntheticReports=new Set([
  'diagnostics/group-system-integration-2026-11-01/browser-profile-differences.json',
  'diagnostics/group-system-integration-2026-11-01/browser-profile-replay-fixed.json'
]);
for(const file of changed){
  const path=resolve(root,file),info=await stat(path).catch(()=>null);if(!info?.isFile())continue;
  if(info.size>90*1024*1024)large.push({file,bytes:info.size});
  const suspiciousPath=/(?:^|\/)(?:\.env(?:\.|$)|.*(?:service.?account|credentials|browser.?profile|private.?dossier).*)/i.test(file);
  if(suspiciousPath&&!reviewedSyntheticReports.has(file))findings.push({file,kind:'review-path'});
  if(info.size<12*1024*1024&&['.js','.mjs','.json','.md','.html','.txt','.log','.yaml','.yml','.rules'].includes(extname(file))){
    const source=await readFile(path,'utf8');for(const[kind,re]of patterns)if(re.test(source))findings.push({file,kind});
  }
  newFiles.push({file,bytes:info.size,published:shouldPublish(file)});
}
const report={checkedAt:new Date().toISOString(),changedFileCount:changed.length,existingChangedFiles:newFiles.length,
  changedBytes:newFiles.reduce((sum,row)=>sum+row.bytes,0),staticChangedFiles:newFiles.filter(row=>row.published).length,
  sourceOnlyChangedFiles:newFiles.filter(row=>!row.published).length,largeFiles:large,findings,
  reviewedSyntheticReports:[...reviewedSyntheticReports],files:newFiles};
await writeFile(new URL('source-inventory.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,files:undefined},null,2));
