import test from 'node:test';
import assert from 'node:assert/strict';
import {createModule} from '../modules/templates/catalog.mjs';
import {parseModule,parseWorkspace} from '../modules/workspace/schema.mjs';
import {createWorkspace} from '../modules/workspace/seed.mjs';
import {buildRequestSummary,fingerprintRequest,collectWorkspaceRequests} from '../modules/requests/request-model.mjs';
import {renderEditor} from '../modules/editor/editor-view.mjs';
import {renderRequestControls} from '../modules/requests/request-editor.mjs';

const image='data:image/png;base64,iVBORw0KGgo=';
function avatar(){
  const module=createModule('avatar-request');
  module.title='Neues Reisebild für die Figur';
  module.pages[0].blocks[0].value='Meine bestehende Figur, mit derselben Gesichtsform.';
  module.pages[0].blocks[1].value=image;
  return module;
}

test('new requests have blank content, explicit draft state and ordinary ideas remain unchanged',()=>{
  for(const type of ['module-request','avatar-request']){
    const module=createModule(type);
    assert.equal(module.type,type);assert.equal(module.requestMeta.stage,'draft');
    assert.ok(module.pages.flatMap(page=>page.blocks).every(block=>block.value===''));
    assert.deepEqual(parseModule(module),module);
  }
  assert.equal(Object.hasOwn(parseModule(createModule('character')),'requestMeta'),false);
});

test('handover readiness requires a description and avatar reference, independently of draft selection',()=>{
  const module=createModule('avatar-request');
  assert.equal(buildRequestSummary(module).problems.length,3);
  const complete=avatar();
  assert.deepEqual(buildRequestSummary(complete).problems,[]);
  assert.equal(buildRequestSummary(complete).ready,false);
  complete.requestMeta.stage='ready';
  assert.equal(buildRequestSummary(complete).ready,true);
  const ordinary=createModule('module-request');ordinary.title='Ein neuer Hafen';ordinary.pages[0].blocks[0].value='Eine interaktive Hafenszene.';
  assert.deepEqual(buildRequestSummary(ordinary).problems,[]);
});

test('content fingerprints ignore arrangement and local stage but detect text and image changes',async()=>{
  const module=avatar(),original=await fingerprintRequest(module);
  module.x+=40;module.collapsed=true;module.requestMeta.stage='ready';
  assert.equal(await fingerprintRequest(module),original);
  module.pages[0].blocks[0].value+=' Mit Mantel.';
  assert.notEqual(await fingerprintRequest(module),original);
  const changed=await fingerprintRequest(module);module.pages[0].blocks[1].value='data:image/png;base64,iVBORw0KGgoAAA==';
  assert.notEqual(await fingerprintRequest(module),changed);
});

test('local submission receipts survive file reload without retaining arbitrary data or unsafe URLs',async()=>{
  const module=avatar();
  module.requestMeta.submission={repository:'patrick/wuensche',branch:'ideenwerk-wuensche',sha:'a'.repeat(40),fingerprint:await fingerprintRequest(module),sentAt:'2026-11-03T12:00:00.000Z',url:'javascript:unwanted()',token:'never-copy-this'};
  const parsed=parseModule(module);
  assert.equal(parsed.requestMeta.submission.url,'https://github.com/patrick/wuensche/tree/ideenwerk-wuensche');
  assert.equal(JSON.stringify(parsed).includes('never-copy-this'),false);
  assert.equal(await fingerprintRequest(parsed),module.requestMeta.submission.fingerprint);
  assert.throws(()=>parseModule({...module,requestMeta:{...module.requestMeta,stage:'sent-by-magic'}}),/Wunschangaben/);
  assert.throws(()=>parseModule({...module,requestMeta:{...module.requestMeta,submission:{...module.requestMeta.submission,sha:'bad'}}}),/Speicherbeleg/);
});

test('requests are collected across boards without treating private character cards as handover requests',()=>{
  const workspace=createWorkspace(),module=avatar();
  workspace.boards[0].modules=[module,createModule('character')];
  workspace.boards.push({id:'second',name:'Zweite Pinnwand',example:false,modules:[createModule('module-request')]});
  const all=collectWorkspaceRequests(parseWorkspace(workspace));
  assert.equal(all.length,2);assert.equal(all[0].module.id,module.id);assert.equal(all[1].boardId,'second');
});

test('request editor exposes image input, readiness and explicit GitHub handover with safely rendered content',()=>{
  const module=avatar();module.title='<script>unwanted()</script>';
  const html=renderEditor(module,{pageId:module.pages[0].id,mapState:{}});
  assert.match(html,/alt="Referenzbild der Figur"/);assert.match(html,/data-request-field="stage"/);assert.match(html,/data-action="share-request"/);
  assert.ok(!html.includes('<script>unwanted()'));
  module.pages[0].blocks[1].value='';
  assert.match(renderEditor(module,{pageId:module.pages[0].id,mapState:{}}),/data-image-upload/);
  assert.equal(renderRequestControls(createModule('character')),'');
});
