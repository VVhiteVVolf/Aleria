import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace} from '../modules/workspace/seed.mjs';
import {createModule,TEMPLATES} from '../modules/templates/catalog.mjs';
import {parseWorkspace,parseProjectText} from '../modules/workspace/schema.mjs';
import {createWorkspaceStore} from '../modules/workspace/store.mjs';
import {createAutosave} from '../modules/workspace/storage.mjs';
import {renderCard,moduleMatches} from '../modules/board/board-view.mjs';
test('Alle Vorlagen mit Seiten, Bildern und Mindmap sind verlustfrei portabel',()=>{
  const project=createWorkspace();project.boards[0].modules.push(...TEMPLATES.map(template=>createModule(template.id)));
  project.boards[0].modules[0].pages[0].blocks[0].value='data:image/png;base64,aGVsbG8=';
  assert.deepEqual(parseProjectText(JSON.stringify(project)),project);
});
test('Import verwirft fremde Metadaten und lehnt kaputte Verweise und Bildquellen ab',()=>{
  const project=createWorkspace();project.token='secret';assert.equal(parseWorkspace(project).token,undefined);
  const invalid=structuredClone(project);invalid.boards[0].modules[0].pages[0].blocks[0].value='https://example.org/tracker.png';
  assert.throws(()=>parseWorkspace(invalid),/eingebettete/);
  const dangling=structuredClone(project);dangling.boards[0].modules[2].mindmap.edges[0].to='missing';assert.throws(()=>parseWorkspace(dangling),/Endpunkte/);
  const duplicate=structuredClone(project);duplicate.boards[0].modules.push(duplicate.boards[0].modules[0]);assert.throws(()=>parseWorkspace(duplicate),/Doppelte/);
  const future=structuredClone(project);future.version=99;assert.throws(()=>parseWorkspace(future),/Version/);
  assert.throws(()=>parseProjectText('{no'),/JSON/);
});
test('Import und Rendering führen HTML aus Inhalten nicht aus',()=>{
  const module=createModule('note');module.title='<img src=x onerror=alert(1)>';module.pages[0].blocks[0].value='<script>alert(1)</script>';
  const html=renderCard(module,'grid');assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img src=x'));assert.ok(html.includes('&lt;img'));
});
test('Suche findet Seitentexte und Mindmap-Knoten, aber keine Bilderdaten',()=>{
  const project=createWorkspace();assert.ok(moduleMatches(project.boards[0].modules[2],'Versprechen','mindmap'));
  assert.ok(moduleMatches(project.boards[0].modules[0],'Widersprüche','all')===false);
  assert.ok(!moduleMatches(project.boards[0].modules[0],'','story'));
  const module=createModule('character');module.pages[0].blocks[0].value='data:image/png;base64,aGVsbG8=';assert.ok(!moduleMatches(module,'aGVsbG8','all'));
});
test('Rückgängig und Wiederholen erhalten Bilder und gruppieren fortlaufende Eingaben',()=>{
  const project=createWorkspace(),store=createWorkspaceStore(project);
  store.change(state=>{state.boards[0].modules[0].title='A';},{groupKey:'title'});
  store.change(state=>{state.boards[0].modules[0].title='AB';},{groupKey:'title'});
  store.undo();assert.deepEqual(store.get(),project);store.redo();assert.equal(store.get().boards[0].modules[0].title,'AB');
  store.undo();store.change(state=>{state.name='Neues Projekt';});assert.equal(store.canRedo(),false);
});
test('Autosave schreibt Änderungen während eines laufenden Speicherns in richtiger Reihenfolge',async()=>{
  const calls=[],resolvers=[];const statuses=[];
  const autosave=createAutosave({save:document=>new Promise(resolve=>{calls.push(document);resolvers.push(resolve);})},status=>statuses.push(status));
  autosave.queue({version:1});const flushing=autosave.flush();autosave.queue({version:2});
  resolvers.shift()();await new Promise(resolve=>setTimeout(resolve,0));resolvers.shift()();await flushing;
  assert.deepEqual(calls,[{version:1},{version:2}]);assert.equal(autosave.isPending(),false);assert.equal(statuses.at(-1),'saved');
});
test('Speicherfehler werden gemeldet, die neue Fassung bleibt exportierbar',async()=>{
  let status;const autosave=createAutosave({save:async()=>{throw new Error('quota');}},(value,message)=>{status={value,message};});
  autosave.queue({version:1});await autosave.flush();assert.deepEqual(status,{value:'error',message:'quota'});assert.equal(autosave.isPending(),true);
});
