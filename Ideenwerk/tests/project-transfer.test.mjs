import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectTransfer} from '../modules/workspace/project-transfer.mjs';
import {createWorkspaceStore} from '../modules/workspace/store.mjs';
import {createWorkspace} from '../modules/workspace/seed.mjs';
function inputFor(project){
  const text=JSON.stringify(project);
  return {files:[{size:Buffer.byteLength(text),text:async()=>text}],value:'project.json',addEventListener(event,listener){this[event]=listener;}};
}
test('Import fügt Pinnwände mit neuen Kennungen hinzu, erhält vorhandene Inhalte und ist rückgängig zu machen',async()=>{
  const original=createWorkspace(),store=createWorkspaceStore(original),imported=createWorkspace();
  imported.boards[0].modules[0].pages[0].blocks[0].value='data:image/png;base64,aGVsbG8=';
  const input=inputFor(imported);let activeId;
  createProjectTransfer({input,store,ask:async()=>true,toast:()=>{},onImported:id=>{activeId=id;}});
  await input.change();
  assert.equal(store.get().boards.length,2);assert.deepEqual(store.get().boards[0],original.boards[0]);
  const added=store.get().boards[1];assert.notEqual(added.id,imported.boards[0].id);assert.equal(activeId,added.id);
  assert.deepEqual(added.modules,imported.boards[0].modules);assert.equal(input.value,'');
  store.undo();assert.deepEqual(store.get(),original);
});
test('Abgebrochener oder ungültiger Import ändert den lokalen Stand nicht',async()=>{
  const original=createWorkspace(),store=createWorkspaceStore(original),input=inputFor(createWorkspace());
  let warnings=[];
  createProjectTransfer({input,store,ask:async()=>false,toast:message=>warnings.push(message),onImported:()=>assert.fail('Kein Import erwartet')});
  await input.change();assert.deepEqual(store.get(),original);
  input.files=[{size:10,text:async()=>'{broken'}];await input.change();assert.deepEqual(store.get(),original);assert.equal(warnings.length,1);assert.match(warnings[0],/JSON/);
});
