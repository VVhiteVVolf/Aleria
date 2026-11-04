import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createWorkspace} from '../modules/workspace/seed.mjs';
import {parseWorkspace} from '../modules/workspace/schema.mjs';
import {removeUnchangedWorkspaceExamples} from '../modules/workspace/example-migration.mjs';
import {createModule} from '../modules/templates/catalog.mjs';

const legacy=JSON.parse(await readFile(new URL('./fixtures/legacy-example-workspace.json',import.meta.url),'utf8'));

test('new projects begin with one empty, portable board and no sample content',()=>{
  const workspace=createWorkspace();
  assert.equal(workspace.boards.length,1);
  assert.equal(workspace.boards[0].example,false);
  assert.deepEqual(workspace.boards[0].modules,[]);
  assert.deepEqual(parseWorkspace(workspace),workspace);
  assert.notEqual(createWorkspace().id,workspace.id);
});

test('unchanged shipped examples disappear without changing board IDs, names or the input',()=>{
  const input=structuredClone(legacy),before=structuredClone(input);
  const {workspace,changed}=removeUnchangedWorkspaceExamples(input);
  assert.equal(changed,true);
  assert.deepEqual(workspace.boards[0].modules,[]);
  assert.equal(workspace.boards[0].id,input.boards[0].id);
  assert.equal(workspace.boards[0].name,input.boards[0].name);
  assert.equal(workspace.boards[0].example,false);
  assert.equal(workspace.id,input.id);
  assert.equal(workspace.updatedAt,input.updatedAt);
  assert.deepEqual(input,before);
  assert.deepEqual(parseWorkspace(workspace),workspace);
});

test('edited examples, imported images, moved cards and new modules remain intact',()=>{
  const input=structuredClone(legacy);
  const [character,story,mindmap,note,place]=input.boards[0].modules;
  character.pages[0].blocks[0].value='data:image/png;base64,aGVsbG8=';
  story.pages[0].blocks[0].value+=' Ein eigener Zusatz.';
  mindmap.mindmap.edges[0].label='eine andere Verbindung';
  note.x+=1;
  place.collapsed=false;
  const own=createModule('note');own.title='Patricks eigene Idee';
  input.boards[0].modules.push(own);
  const {workspace}=removeUnchangedWorkspaceExamples(input);
  assert.deepEqual(workspace.boards[0].modules,input.boards[0].modules);
});

test('only exact examples on marked legacy boards are removed; user boards and copies stay',()=>{
  const input=structuredClone(legacy);
  input.boards[0].modules[0].title='Eine überarbeitete Figur';
  const protectedBoard={...structuredClone(input.boards[0]),id:'personal-board',name:'Eigene Sammlung',example:false};
  input.boards.push(protectedBoard);
  const {workspace}=removeUnchangedWorkspaceExamples(input);
  assert.deepEqual(workspace.boards[0].modules,[input.boards[0].modules[0]]);
  assert.equal(workspace.boards[1],protectedBoard);
  assert.deepEqual(workspace.boards[1].modules,protectedBoard.modules);
});

test('random IDs do not affect demo recognition and migration is idempotent',()=>{
  const input=structuredClone(legacy);
  for(const [index,module] of input.boards[0].modules.entries()){
    module.id=`changed-module-${index}`;
    module.pages.forEach((page,pageIndex)=>{
      page.id=`changed-page-${index}-${pageIndex}`;
      page.blocks.forEach((block,blockIndex)=>{block.id=`changed-block-${index}-${pageIndex}-${blockIndex}`;});
    });
    const remap=new Map(module.mindmap.nodes.map((node,nodeIndex)=>[node.id,`node-${nodeIndex}`]));
    module.mindmap.nodes.forEach(node=>{node.id=remap.get(node.id);});
    module.mindmap.edges.forEach((edge,edgeIndex)=>{edge.id=`edge-${edgeIndex}`;edge.from=remap.get(edge.from);edge.to=remap.get(edge.to);});
  }
  const first=removeUnchangedWorkspaceExamples(input);
  assert.equal(first.workspace.boards[0].modules.length,0);
  const second=removeUnchangedWorkspaceExamples(first.workspace);
  assert.equal(second.changed,false);
  assert.equal(second.workspace,first.workspace);
  const empty=createWorkspace();
  assert.deepEqual(removeUnchangedWorkspaceExamples(empty),{workspace:empty,changed:false});
});
