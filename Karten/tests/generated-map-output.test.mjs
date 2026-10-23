import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {stateHash,writeGeneratedMap} from '../tools/generated-map-output.mjs';

test('rebuilding a generated map refuses to overwrite later manual changes',async t=>{
  const folder=await fs.mkdtemp(path.join(os.tmpdir(),'aleria-map-output-'));
  t.after(async()=>{
    await fs.unlink(path.join(folder,'data.json')).catch(error=>{if(error.code!=='ENOENT')throw error;});
    await fs.rmdir(folder);
  });
  const root=pathToFileURL(folder+'/');
  const state={pins:[{id:'existing',title:'Ort'}]};
  const data={state,generatedStateHash:stateHash(state)};
  await writeGeneratedMap(root,'data.json',data);
  await writeGeneratedMap(root,'data.json',data,{check:true});
  const edited=structuredClone(data);edited.state.pins[0].title='Eigene Überarbeitung';
  await fs.writeFile(new URL('data.json',root),JSON.stringify(edited));
  await assert.rejects(writeGeneratedMap(root,'data.json',data),/bereits bearbeitet/);
  assert.equal(JSON.parse(await fs.readFile(new URL('data.json',root),'utf8')).state.pins[0].title,'Eigene Überarbeitung');
});
