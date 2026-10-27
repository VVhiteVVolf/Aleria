import test from 'node:test';
import assert from 'node:assert/strict';
import {createGitHubBackupClient,BACKUP_BRANCH} from '../modules/github/github-backup.mjs';
import {createWorkspace} from '../modules/workspace/seed.mjs';
function mock({existing=false,extraFiles=[],conflict=false,defaultBranch='main'}={}){
  const calls=[];let reads=0;
  const fetchRef=async(url,options)=>{
    const path=new URL(url).pathname.replace('/repos/patrick/ideen','')+new URL(url).search;
    const body=options.body?JSON.parse(options.body):null;calls.push({path,method:options.method,body,options});
    const response=(value,status=200)=>new Response(JSON.stringify(value),{status});
    if(path==='')return response({full_name:'patrick/ideen',private:true,default_branch:defaultBranch,size:1,permissions:{push:true}});
    if(path===`/git/ref/heads/${BACKUP_BRANCH}`){reads++;return existing?response({object:{sha:conflict&&reads>1?'changed':'head'}}):response({},404);}
    if(path==='/git/ref/heads/main')return response({object:{sha:'default-head'}});
    if(path.startsWith('/git/commits/')&&options.method==='GET')return response({tree:{sha:'base-tree'}});
    if(path==='/git/trees/base-tree?recursive=1')return response({tree:[{path:'.ideenwerk-backup.json',mode:'100644',type:'blob'},...extraFiles],truncated:false});
    if(path==='/git/trees'&&body)return response({sha:'new-tree'},201);
    if(path==='/git/commits'&&body)return response({sha:'new-commit'},201);
    if((path==='/git/refs'||path===`/git/refs/heads/${BACKUP_BRANCH}`)&&body)return response({object:{sha:'new-commit'}},201);
    throw new Error(`Unexpected call ${options.method} ${path}`);
  };
  return {client:createGitHubBackupClient({repository:'patrick/ideen',token:'test-token',fetchRef}),calls};
}
test('Neue GitHub-Sicherung ist ein unabhängiger Branch mit ausschließlich JSON-Projektdateien',async()=>{
  const {client,calls}=mock(),project=createWorkspace();const plan=await client.inspect();assert.ok(calls.every(call=>call.method==='GET'));
  const result=await client.push(project,plan);assert.equal(result.sha,'new-commit');
  const tree=calls.find(call=>call.path==='/git/trees').body;assert.equal(tree.base_tree,undefined);assert.deepEqual(tree.tree.map(item=>item.path),[`projects/${project.id}.json`,'.ideenwerk-backup.json']);
  const commit=calls.find(call=>call.path==='/git/commits').body;assert.deepEqual(commit.parents,[]);assert.match(commit.message,/\[skip ci\]/);assert.match(commit.message,/\[skip netlify\]/);
  const ref=calls.find(call=>call.path==='/git/refs').body;assert.equal(ref.ref,'refs/heads/ideenwerk-backup');
  assert.ok(calls.every(call=>!call.path.includes('/deploy')&&!call.path.includes('/actions')));
  assert.ok(!JSON.stringify(tree).includes('test-token'));assert.equal(calls[0].options.headers.Authorization,'Bearer test-token');
});
test('Bestehende Backups werden mit Elterncommit und ohne Force-Push fortgeschrieben',async()=>{
  const {client,calls}=mock({existing:true});await client.push(createWorkspace(),await client.inspect());
  assert.equal(calls.find(call=>call.path==='/git/trees').body.base_tree,'base-tree');
  assert.deepEqual(calls.find(call=>call.path==='/git/commits').body.parents,['head']);
  assert.equal(calls.find(call=>call.method==='PATCH').body.force,false);
});
test('Fremder Anwendungscode oder Deployment-Konfiguration im Backup-Branch sperren den Push',async()=>{
  const {client,calls}=mock({existing:true,extraFiles:[{path:'.github/workflows/deploy.yml',type:'blob',mode:'100644'}]});
  await assert.rejects(client.inspect(),/ausschließlich/);assert.ok(calls.every(call=>call.method==='GET'));
});
test('Zwischenzeitliche Branch-Änderungen überschreiben keine fremden Sicherungen',async()=>{
  const {client,calls}=mock({existing:true,conflict:true});const plan=await client.inspect();await assert.rejects(client.push(createWorkspace(),plan),/seit der Prüfung/);assert.ok(calls.every(call=>call.method==='GET'));
});
test('Der Standardbranch ist als Backup-Ziel gesperrt',async()=>{
  const {client}=mock({defaultBranch:BACKUP_BRANCH});await assert.rejects(client.inspect(),/Standardbranch/);
});
