import test from 'node:test';
import assert from 'node:assert/strict';
import {createModule} from '../modules/templates/catalog.mjs';
import {buildRequestPackage} from '../modules/requests/request-package.mjs';
import {createGitHubRequestClient,REQUEST_BRANCH} from '../modules/github/github-requests.mjs';

const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5YQAAAAASUVORK5CYII=';
const HEAD='a'.repeat(40),COMMIT='b'.repeat(40),CHANGED='c'.repeat(40);
function packet(){const module=createModule('avatar-request');module.title='Neues Portrait';module.pages.flatMap(page=>page.blocks).find(block=>block.kind==='text').value='Bitte den vorhandenen Mantel erhalten.';module.pages.flatMap(page=>page.blocks).find(block=>block.kind==='image').value=PNG;return buildRequestPackage({workspaceId:'projekt-1',requests:[module]});}
function mock({existing=false,privateRepo=true,conflict=false,refConflict=false,extraFiles=[],markerFormat='ideenwerk-request-branch',defaultBranch='main'}={}) {
  const calls=[];let reads=0;
  const fetchRef=async(url,options)=>{
    const path=new URL(url).pathname.replace('/repos/patrick/wuensche','')+new URL(url).search;
    const body=options.body?JSON.parse(options.body):null;calls.push({path,method:options.method,body,options});
    const response=(value,status=200)=>new Response(JSON.stringify(value),{status});
    if(path==='')return response({full_name:'patrick/wuensche',private:privateRepo,default_branch:defaultBranch,permissions:{push:true}});
    if(path===`/git/ref/heads/${REQUEST_BRANCH}`){reads++;return existing?response({object:{sha:conflict&&reads>1?CHANGED:HEAD}}):response({},404);}
    if(path==='/git/ref/heads/main')return response({object:{sha:HEAD}});
    if(path.startsWith('/git/commits/')&&options.method==='GET')return response({tree:{sha:'base-tree'}});
    if(path==='/git/trees/base-tree?recursive=1')return response({tree:[{path:'.ideenwerk-wuensche.json',mode:'100644',type:'blob',sha:'marker-sha'},...extraFiles],truncated:false});
    if(path==='/git/blobs/marker-sha')return response({encoding:'base64',content:btoa(JSON.stringify({format:markerFormat,version:1}))});
    if(path==='/git/blobs'&&body)return response({sha:'picture-blob'},201);
    if(path==='/git/trees'&&body)return response({sha:'new-tree'},201);
    if(path==='/git/commits'&&body)return response({sha:COMMIT},201);
    if((path==='/git/refs'||path===`/git/refs/heads/${REQUEST_BRANCH}`)&&body)return refConflict?response({},422):response({object:{sha:COMMIT}},201);
    throw new Error(`Unexpected ${options.method} ${path}`);
  };
  return {client:createGitHubRequestClient({token:'ephemeral-test-token',repository:'patrick/wuensche',fetchRef}),calls};
}

test('neue Wünsche erhalten einen eigenen Inhaltsbranch und separate Git-Bildblobs',async()=>{
  const {client,calls}=mock(),prepared=packet();const plan=await client.inspect();
  assert.ok(calls.every(call=>call.method==='GET'));
  const result=await client.push(prepared,plan);
  assert.equal(result.sha,COMMIT);assert.deepEqual(result.requestIds,prepared.requests.map(request=>request.id));
  assert.equal(result.repository,'patrick/wuensche');assert.equal(result.branch,REQUEST_BRANCH);
  const tree=calls.find(call=>call.path==='/git/trees').body;
  assert.equal(tree.base_tree,undefined);assert.ok(tree.tree.some(file=>file.sha==='picture-blob'));
  assert.ok(tree.tree.every(file=>file.path==='.ideenwerk-wuensche.json'||file.path.startsWith('wuensche/projekt-1/')));
  assert.deepEqual(calls.find(call=>call.path==='/git/commits').body.parents,[]);
  assert.equal(calls.find(call=>call.path==='/git/refs').body.ref,`refs/heads/${REQUEST_BRANCH}`);
  assert.match(calls.find(call=>call.path==='/git/commits').body.message,/\[skip ci\] \[skip netlify\]/);
  assert.ok(!JSON.stringify(calls.map(call=>call.body)).includes('ephemeral-test-token'));
  assert.ok(calls.every(call=>!call.path.includes('actions')&&!call.path.includes('deploy')));
});

test('bestehende Wünsche und Bearbeitungsnotizen bleiben im Basistree und werden ohne Force-Push ergänzt',async()=>{
  const notes={path:'wuensche/anderes-projekt/anderer-wunsch/bearbeitung.md',mode:'100644',type:'blob',sha:'note-sha'};
  const {client,calls}=mock({existing:true,extraFiles:[notes]});
  await client.push(packet(),await client.inspect());
  assert.equal(calls.find(call=>call.path==='/git/trees').body.base_tree,'base-tree');
  assert.deepEqual(calls.find(call=>call.path==='/git/commits').body.parents,[HEAD]);
  assert.equal(calls.find(call=>call.method==='PATCH').body.force,false);
  assert.ok(calls.find(call=>call.path==='/git/trees').body.tree.every(file=>file.sha!==null&&!file.path.includes('bearbeitung.md')));
});

test('öffentliche Repositories, Standardbranch und fremde Inhalte sperren Übertragungen vor dem ersten Schreibzugriff',async()=>{
  for(const options of [{privateRepo:false},{defaultBranch:REQUEST_BRANCH},{existing:true,markerFormat:'foreign'},
    {existing:true,extraFiles:[{path:'.github/workflows/deploy.yml',mode:'100644',type:'blob'}]},
    {existing:true,extraFiles:[{path:'wuensche/projekt/link.md',mode:'120000',type:'blob'}]}]){
    const {client,calls}=mock(options);
    await assert.rejects(client.inspect());assert.ok(calls.every(call=>call.method==='GET'));
  }
});

test('geänderte Branchspitzen überschreiben keine neueren Wünsche oder Rückmeldungen',async()=>{
  const {client,calls}=mock({existing:true,conflict:true}),plan=await client.inspect();
  await assert.rejects(client.push(packet(),plan),/seit der Prüfung/);
  assert.ok(calls.every(call=>call.method==='GET'));
});

test('ein Konflikt beim abschließenden Referenzupdate wird nicht als gespeicherter Wunsch gemeldet',async()=>{
  const {client,calls}=mock({existing:true,refConflict:true});
  await assert.rejects(client.push(packet(),await client.inspect()),/gleichzeitig verändert/);
  assert.equal(calls.filter(call=>call.method==='PATCH').length,1);
  assert.ok(calls.every(call=>call.body?.force!==true));
});

test('vorbereitete Dateilisten können keine fremden Pfade in die Übergabe schmuggeln',async()=>{
  const {client,calls}=mock(),prepared=packet();
  prepared.files.push({path:'.github/workflows/evil.yml',encoding:'utf-8',content:'arbitrary'});
  await client.push(prepared,await client.inspect());
  assert.ok(calls.find(call=>call.path==='/git/trees').body.tree.every(file=>!file.path.startsWith('.github/')));
});
