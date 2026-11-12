import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const realm=new URL('../',import.meta.url);

test('the delivered originals and source admission copies remain byte-identical',async()=>{
  const inventory=JSON.parse(await readFile(new URL('assets.source.json',realm),'utf8'));
  assert.equal(inventory.mapProvided,false);assert.equal(inventory.entries.length,2);
  for(const entry of inventory.entries){
    for(const path of [entry.original,entry.admissionCopy]){
      const bytes=await readFile(new URL(path,realm));
      assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256);
    }
    assert.equal(entry.generatorPrompt,null);
  }
});
