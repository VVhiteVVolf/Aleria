import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const directory=path.dirname(fileURLToPath(import.meta.url));
const workspace=path.resolve(directory,'../..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function log(name) {
  const bytes=await fs.readFile(path.join(directory,name));
  const content=bytes.toString(bytes[0]===255&&bytes[1]===254?'utf16le':'utf8');
  const count=Number(content.match(/# tests (\d+)/)?.[1]);
  const failed=Number(content.match(/# fail (\d+)/)?.[1]);
  if (!count || failed!==0) throw Error(`Unsuccessful verification log: ${name}`);
  return {file:name,tests:count,failed,sha256:sha(bytes)};
}
const tests={frontend:await log('frontend-tests.log'),backend:await log('backend-tests.log'),
  latestAffectedBackend:await log('final-possession-regressions.log'),firestore:await log('checkout-emulator.log'),rules:await log('rules-emulator.log')};
const http=JSON.parse(await fs.readFile(path.join(directory,'http-checks.json'),'utf8'));
if(http.some(row=>row.status!==200))throw Error('HTTP check failed');
const parity=[];
for(const file of ['scene-trade/scene-trade-model.js','scene-trade/scene-trade-summary.js','item-register/item-register-module-catalog.js']) {
  const source=await fs.readFile(path.join(workspace,'AleriaAlmanach/modules',file));
  const generated=await fs.readFile(path.join(workspace,'firebase/functions/src/generated',file));
  if(!source.equals(generated))throw Error(`Mechanics parity failed: ${file}`);
  parity.push({file,sha256:sha(source)});
}
const sourcePaths=[...http.map(row=>row.path),'firebase/firestore.rules','firebase/firestore.indexes.json',
  'firebase/functions/src/scene-trade/commit-scene-trade.js','firebase/functions/src/scene-trade/scene-trade-context.js',
  'firebase/functions/src/scene-trade/scene-trade-accounts.js','firebase/functions/src/scene-trade/scene-trade-products.js',
  'firebase/functions/src/scene-trade/scene-trade-availability.js'];
const sources=await Promise.all(sourcePaths.map(async file=>({file,sha256:sha(await fs.readFile(path.join(workspace,file)))})));
const result={schemaVersion:1,date:'2026-11-04',scope:'local scene-trade implementation',tests,
  distinctTests:tests.frontend.tests+tests.backend.tests+tests.firestore.tests+tests.rules.tests,
  http:{checked:http.length,passed:http.length},mechanicsParity:parity,sources,
  dependencyBundle:{status:'passed',tool:'existing local esbuild',scope:'scene-trade entry/controller and both feature styles'},
  browser:{status:'limited',reason:'CUA browser connection throws timeoutMs; no browser pass claimed'},
  emulator:{host:'127.0.0.1:8187',projects:['demo-aleria-scene-trade','demo-aleria-scene-trade-rules'],language:'en-US (avoids emulator de_DE missing resource bundle)'},
  liveApplicationWrites:0,push:false,deploy:false,billingChanged:false,
  releaseDependency:'Functions, default Firestore rules and sold index require coordinated release; existing BILLING_DISABLED remains unresolved'};
await fs.writeFile(path.join(directory,'verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({distinctTests:result.distinctTests,http:result.http,mechanicsParity:true,liveApplicationWrites:0}));
