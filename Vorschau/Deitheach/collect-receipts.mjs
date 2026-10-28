import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('./',import.meta.url),directory=new URL('assets/generated/receipts/',root);
const records=[];
for(const file of (await readdir(directory)).sort()){
 const record=JSON.parse(await readFile(new URL(file,directory),'utf8'));
 const bytes=await readFile(new URL(record.target,root));
 if(createHash('sha256').update(bytes).digest('hex')!==record.sha256)throw Error(`Generator original changed: ${record.kind}/${record.id}`);
 records.push(record);
}
await writeFile(new URL('generation-receipts.json',root),JSON.stringify(records,null,2)+'\n');
console.log(JSON.stringify({generatorReceipts:records.length}));
