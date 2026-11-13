import test from 'node:test';
import assert from 'node:assert/strict';
import { commitCommentPageBundleOperation } from '../src/comments/commit-comment-page-bundle.js';

const threadId='castle::session:courtyard';
const actor={uid:'erdi',token:{aleriaRole:'player'}};
const page={id:'page-first',title:'Am Brunnen',start:{id:'a',order:10,time:10,stable:true},end:{id:'b',order:20,time:20,stable:true},before:{id:'c',order:30,time:30,stable:true}};
const request=(operation={kind:'create',page},expectedRevision=0,mutationId='mutation-first',auth=actor)=>({auth,data:{threadId,operation,expectedRevision,mutationId}});
function database(seed){
  let record=seed?structuredClone(seed):null,tail=Promise.resolve();const writes=[],reads=[];
  return {writes,reads,record:()=>structuredClone(record),collection(name){assert.equal(name,'comment_turns');return{doc(id){assert.equal(id,threadId);return{path:`${name}/${id}`};}};},
    async runTransaction(action){const prior=tail;let release;tail=new Promise(resolve=>release=resolve);await prior;
      const pending=[];try{await action({async get(ref){reads.push(ref.path);const value=record?structuredClone(record):null;return{exists:!!value,data:()=>value};},set(ref,value,options){assert.equal(ref.path,`comment_turns/${threadId}`);assert.deepEqual(options,{merge:true});pending.push(structuredClone(value));}});
        for(const patch of pending){writes.push(patch);record={...(record||{}),...patch};}
      }finally{release();}}
  };
}
const run=(db,payload)=>commitCommentPageBundleOperation(payload,{db,timestamp:()=>({seconds:99,nanoseconds:4})});

test('ordinary signed-in players may organize ended scenes without touching turn, backup or game fields',async()=>{
  const old={threadId,current:'ended',updatedBy:'closer',updatedAt:{seconds:11,nanoseconds:2},sceneBackup:{id:'original',status:'verified'},custom:{keep:['all','types']}};
  const db=database(old),result=await run(db,request());
  assert.equal(result.metadata.revision,1);assert.equal(result.metadata.pages[0].title,'Am Brunnen');
  const after=db.record();delete after.commentPageBundles;assert.deepEqual(after,old);
  assert.deepEqual(Object.keys(db.writes[0]),['commentPageBundles']);assert.deepEqual(db.reads,[`comment_turns/${threadId}`]);
});
test('metadata-only initialization creates no current turn and no comment records',async()=>{
  const db=database();await run(db,request());
  assert.deepEqual(Object.keys(db.record()).sort(),['commentPageBundles','threadId']);
});
test('repeating an acknowledged request is idempotent; changing its payload is rejected',async()=>{
  const db=database(),first=await run(db,request()),again=await run(db,request());
  assert.deepEqual(again,first);assert.equal(db.writes.length,1);
  assert(!JSON.stringify(db.record().commentPageBundles).includes('erdi'));
  assert(!Object.hasOwn(db.record().commentPageBundles,'updatedBy'));
  await assert.rejects(run(db,request(undefined,0,'mutation-first',{uid:'patrick',token:{}})),error=>error.code==='already-exists');
  await assert.rejects(run(db,request({kind:'create',page:{...page,title:'Anderer Titel'}})),error=>error.code==='already-exists');
  assert.equal(db.writes.length,1);
});
test('concurrent edits use a revision check instead of overwriting the other player',async()=>{
  const db=database();const other={...page,id:'page-patrick',title:'Patricks Seite'};
  const results=await Promise.allSettled([run(db,request()),run(db,request({kind:'create',page:other},0,'mutation-patrick',{uid:'patrick',token:{}}))]);
  assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
  assert.equal(results.find(result=>result.status==='rejected').reason.code,'aborted');
  assert.equal(db.record().commentPageBundles.pages.length,1);assert.equal(db.writes.length,1);
});
test('rename and remove retain every unrelated field',async()=>{
  const db=database({threadId,current:'patrick',sceneBackup:{status:'complete'}});await run(db,request());
  await run(db,request({kind:'rename',pageId:page.id,title:'Neuer Titel'},1,'mutation-rename',{uid:'patrick',token:{}}));
  assert.equal(db.record().commentPageBundles.pages[0].title,'Neuer Titel');
  await run(db,request({kind:'remove',pageId:page.id},2,'mutation-remove'));
  assert.equal(db.record().commentPageBundles.pages.length,0);assert.equal(db.record().current,'patrick');assert.deepEqual(db.record().sceneBackup,{status:'complete'});
});
test('unauthenticated and invalid requests cannot write metadata',async()=>{
  for(const payload of [request(undefined,0,'mutation-first',null),{...request(),data:{...request().data,threadId:'invalid/path'}},request({kind:'create',page:{...page,title:''}}),request(undefined,-1)]){
    const db=database();await assert.rejects(run(db,payload));assert.equal(db.writes.length,0);
  }
});

test('bundle plus empty successor is one metadata-only transaction; settings and names survive other edits',async()=>{
  const original={threadId,current:'ended',sceneBackup:{status:'complete'},updatedAt:{seconds:12,nanoseconds:3}};
  const db=database(original),nextPage={id:'regular-next',title:'Danach',after:page.end,time:{calendarDate:{year:1740,month:3,day:11},seconds:43200}};
  await run(db,request({kind:'create',page,nextPage}));
  assert.equal(db.writes.length,1);assert.equal(db.record().commentPageBundles.regularPages.length,1);
  await run(db,request({kind:'configure',pageSize:40},1,'configure-size'));
  await run(db,request({kind:'rename',pageId:page.id,title:'Morgen'},2,'rename-old-bundle'));
  assert.equal(db.record().commentPageBundles.pageSize,40);assert.deepEqual(db.record().commentPageBundles.regularPages,[nextPage]);
  const after=db.record();delete after.commentPageBundles;assert.deepEqual(after,original);
  assert(db.writes.every(write=>Object.keys(write).join(',')==='commentPageBundles'));
});

test('a new page and page-size edits retain replay protection and conflict detection',async()=>{
  const db=database();await run(db,request());
  const payload=request({kind:'regular',page:{id:'next',title:'',after:page.end,time:null}},1,'add-successor');
  await run(db,payload);await run(db,payload);assert.equal(db.writes.length,2);
  await assert.rejects(run(db,request({kind:'configure',pageSize:25},1,'stale-page-size')),error=>error.code==='aborted');
  await assert.rejects(run(db,request({kind:'configure',pageSize:0},2,'invalid-page-size')),error=>error.code==='invalid-argument');
  assert.equal(db.writes.length,2);
});
