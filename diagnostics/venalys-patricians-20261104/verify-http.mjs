import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { houses } from '../../Vorschau/Venalys/house-data.mjs';
import { warriors } from '../../Vorschau/Venalys/warrior-data.mjs';

const base = new URL('http://127.0.0.1:8897/Vorschau/Venalys/');
const local = new URL('../../Vorschau/Venalys/',import.meta.url);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const files = [...new Set(['index.html','proposal-page.mjs','house-data.mjs','house-catalog.json','warrior-data.mjs',
  ...houses.map(house => house.crest),...warriors.flatMap(warrior => [warrior.image,warrior.fullsize])])];
const records = [];
for (let offset = 0; offset < files.length; offset += 8) {
  records.push(...await Promise.all(files.slice(offset,offset+8).map(async file => {
    const response = await fetch(new URL(file,base));
    assert.equal(response.status,200,file);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const sha256 = digest(bytes);
    assert.equal(sha256,digest(await fs.readFile(new URL(file,local))),file);
    return { file,status:response.status,bytes:bytes.length,sha256 };
  })));
}
const report = { base:base.href,houses:houses.length,warriors:warriors.length,
  checkedFiles:records.length,allBytesMatch:true,browser:'limited: CUA navigation timeoutMs error',records };
await fs.writeFile(new URL('http-verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({houses:report.houses,warriors:report.warriors,checkedFiles:report.checkedFiles,allBytesMatch:true}));
