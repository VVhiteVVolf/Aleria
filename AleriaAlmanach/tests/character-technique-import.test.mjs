import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../modules/characters/character-archive-io.js', import.meta.url), 'utf8');
const context = vm.createContext({});
vm.runInContext(source, context);
const normalize = payload => {
  context.importPayload = payload;
  return vm.runInContext('normalizeCharacterImportPayload(importPayload)', context);
};

test('technique-only releases are rejected before either full-character import can write', () => {
  assert.throws(() => normalize({ type:'aleria-character', mergeStrategy:'merge-combat-techniques',
    character:{id:'test',name:'Test',combatProfile:{techniques:[{id:'new'}]}} }), /vollständigen Charakterexport/);
});

test('complete character exports, archives and legacy payloads remain importable', () => {
  const character={id:'test',name:'Test',combatProfile:{hitPoints:{current:7},resources:[],techniques:[]}};
  for(const payload of [{type:'aleria-character',character},{type:'aleria-character-archive',characters:[character]},[character],character]) {
    assert.deepEqual(JSON.parse(JSON.stringify(normalize(payload).characters)),[character]);
  }
});
