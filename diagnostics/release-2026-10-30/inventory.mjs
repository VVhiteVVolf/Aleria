import {execFileSync} from 'node:child_process';
import {stat,writeFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url);
const git=(...args)=>execFileSync('C:/Program Files/Git/ucrt64/bin/git.exe',args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
const files=[...new Set([...git('diff','--name-only','-z','HEAD').split('\0'),...git('ls-files','--others','--exclude-standard','-z').split('\0')].filter(Boolean))];
const entries=await Promise.all(files.map(async file=>({file,bytes:(await stat(new URL(file,root))).size})));
const groups={};
for(const e of entries){const group=e.file.split('/').slice(0,2).join('/');groups[group]??={files:0,bytes:0};groups[group].files++;groups[group].bytes+=e.bytes;}
const report={files:entries.length,bytes:entries.reduce((a,e)=>a+e.bytes,0),groups,large:entries.filter(e=>e.bytes>90*1024*1024),sensitiveNames:files.filter(f=>/(?:^|\/)(?:\.env(?:\.|$)|.*(?:credentials|service.account|private.key|secret|\.pem$))/i.test(f)),entries};
await writeFile(new URL('inventory.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,entries:undefined},null,2));
