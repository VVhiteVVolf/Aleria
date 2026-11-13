import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { applyBundleMutation, emptyBundleMetadata, itemAnchor, normalizeBundleMetadata, normalizeBundleTitle, normalizeBundleMutation, partitionBundleItems, partitionCommentPageItems, planBundleBefore, resolveBundleRanges, validateBundleThreadId } from '../modules/comments/comment-page-bundles-model.mjs';

const items = count => Array.from({ length: count }, (_, index) => ({ id: `c-${index}`, order: index*1000, time: index*1000, stable: true, index, comment: { id: `c-${index}`, orderKey: index*1000, text: `Unverändert ${index}` } }));
function create(metadata, list, index, id, options = {}) {
  const plan = planBundleBefore(list, metadata.pages, list[index].id, options);
  return applyBundleMutation(metadata, { kind: 'create', page: { id, title: id, start: plan.start, end: plan.end, before: plan.before }, replaceIds: plan.replaceIds }, `mutation-${id}`);
}
function pagination(metadata) {
  const context = vm.createContext({ console, escapeHtml: value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
    isSceneTimeEventComment: comment => !!comment.day, isSceneTimeSegmentBreakEvent: comment => !!comment.day,
    getSceneTimeEventSegmentLabel: (_,index) => `Tag ${index}` });
  context.window=context;
  context.AleriaCommentPageBundles={ count:()=>metadata.pages.length + metadata.regularPages.length, pageSize:()=>metadata.pageSize,
    getGroups:(_,comments)=>partitionCommentPageItems(comments.map((comment,index)=>({id:comment.id,order:comment.orderKey,time:comment.orderKey,stable:true,index,comment})),metadata).groups };
  vm.runInContext(readFileSync(new URL('../modules/comments/comments-pagination.js',import.meta.url),'utf8'),context);
  return context;
}

test('ordinary pages retain their 75-comment boundaries',()=>{
  const list=items(152),context=pagination(emptyBundleMetadata());
  const pages=context.buildCommentTimelinePages(list.map(item=>item.comment),'scene::session:one');
  assert.deepEqual(Array.from(pages,page=>page.items.length),[75,75,2]);
});
test('a named megapage has no 75-comment cap and does not duplicate or mutate comments',()=>{
  const list=items(7501),before=JSON.stringify(list),metadata=create(emptyBundleMetadata(),list,7000,'Ankunft');
  const groups=partitionBundleItems(list,metadata.pages).groups;
  assert.equal(groups[0].type,'bundle');assert.equal(groups[0].items.length,7000);
  const context=pagination(metadata),pages=context.buildCommentTimelinePages(list.map(item=>item.comment),'scene::session:one');
  assert.equal(pages.length,8);assert.equal(pages[0].items.length,7000);assert.equal(pages[0].label,'Ankunft');
  assert.equal(new Set(pages.flatMap(page=>page.items.map(item=>item.comment.id))).size,list.length);
  assert.equal(JSON.stringify(list),before);
});
test('the selected comment stays after the bundle unless explicitly included',()=>{
  const list=items(112),empty=emptyBundleMetadata();
  assert.equal(planBundleBefore(list,[],list[111].id).count,111);
  assert.equal(planBundleBefore(list,[],list[111].id,{includeComment:true}).count,112);
  assert.equal(planBundleBefore(list,[],list[0].id).count,0);
  const metadata=create(empty,list,111,'Alle',{includeComment:true}),context=pagination(metadata);
  const info=context.getCommentPaginationWindow(list.map(item=>item.comment),'scene::session:one');
  assert.equal(info.pageCount,1);assert.match(context.renderCommentPaginationControls('scene::session:one',info),/Seiten verwalten/);
});
test('later bundles start after existing named pages and explicit merging replaces only covered bundles',()=>{
  const list=items(300);let metadata=create(emptyBundleMetadata(),list,100,'Ankunft');
  metadata=create(metadata,list,200,'Gespräch');
  assert.deepEqual(metadata.pages.map(page=>[page.title,page.start.id,page.end.id]),[['Ankunft','c-0','c-99'],['Gespräch','c-100','c-199']]);
  const merged=create(metadata,list,299,'Ein langer Abend',{includeComment:true,includeBundles:true});
  assert.equal(merged.pages.length,1);assert.equal(partitionBundleItems(list,merged.pages).groups[0].items.length,300);
  const contained=planBundleBefore(list,metadata.pages,'c-50');assert.equal(contained.existingPage.id,'Ankunft');
});
test('retroactive insertions stay before the same boundary, including after that boundary comment is deleted',()=>{
  const list=items(8),metadata=create(emptyBundleMetadata(),list,4,'Vormittag');
  const added={id:'retro',order:3500,time:3500,stable:true,index:4,comment:{id:'retro',orderKey:3500}};
  const expanded=[...list.slice(0,4),added,...list.slice(4)];
  assert.equal(partitionBundleItems(expanded,metadata.pages).groups[0].items.length,5);
  const deleted=expanded.filter(item=>item.id!=='c-4');
  assert.equal(partitionBundleItems(deleted,metadata.pages).groups[0].items.length,5);
  assert.equal(resolveBundleRanges(deleted,metadata.pages).unresolved.length,0);
});
test('unresolvable imported boundaries fall back to ordinary comments without losing their title metadata',()=>{
  const list=items(5),metadata=create(emptyBundleMetadata(),list,3,'Erinnerung');
  metadata.pages[0].start.stable=false;metadata.pages[0].end.stable=false;metadata.pages[0].before.stable=false;
  const remaining=list.filter(item=>!['c-0','c-2','c-3'].includes(item.id));
  const result=partitionBundleItems(remaining,metadata.pages);
  assert.deepEqual(result.unresolved,['Erinnerung']);assert.equal(result.groups.flatMap(group=>group.items).length,remaining.length);
  assert.equal(metadata.pages[0].title,'Erinnerung');
});
test('time markers inside a megapage stay visible and later day labels retain their original count',()=>{
  const list=items(170);list[60].comment.day=true;list[150].comment.day=true;
  const metadata=create(emptyBundleMetadata(),list,100,'Ein Tag'),context=pagination(metadata);
  const pages=context.buildCommentTimelinePages(list.map(item=>item.comment),'scene::session:one');
  assert.equal(pages[0].items.length,100);assert(pages[0].items.some(item=>item.comment.id==='c-60'));
  assert.equal(pages.find(page=>page.type==='segment-break').label,'Tag 2');
});
test('renaming and unbundling affect presentation metadata only; titles are escaped in navigation',()=>{
  const list=items(180);let metadata=create(emptyBundleMetadata(),list,150,'Am Tor');
  const bounds=JSON.stringify(metadata.pages[0]);
  metadata=applyBundleMutation(metadata,{kind:'rename',pageId:'Am Tor',title:'Abend <img src=x>'},'rename-one');
  assert.equal(metadata.pages[0].start.id,JSON.parse(bounds).start.id);
  const context=pagination(metadata),info=context.getCommentPaginationWindow(list.map(item=>item.comment),'scene::session:one');
  const html=context.renderCommentPaginationControls('scene::session:one',info);
  assert.match(html,/Abend &lt;img src=x&gt;/);assert.doesNotMatch(html,/<img src=x>/);
  metadata=applyBundleMutation(metadata,{kind:'remove',pageId:'Am Tor'},'remove-one');
  assert.equal(metadata.pages.length,0);assert.equal(pagination(metadata).buildCommentTimelinePages(list.map(item=>item.comment)).length,3);
});
test('overlapping or malformed operations fail without modifying the existing metadata',()=>{
  const list=items(30),metadata=create(emptyBundleMetadata(),list,10,'Erste'),before=JSON.stringify(metadata);
  const plan=planBundleBefore(list,[],list[20].id);
  assert.throws(()=>applyBundleMutation(metadata,{kind:'create',page:{id:'overlap',title:'Überlappung',start:plan.start,end:plan.end,before:plan.before}},'overlap-request'),/bereits gebündelt/);
  assert.throws(()=>normalizeBundleTitle('   '));assert.throws(()=>normalizeBundleTitle('x'.repeat(121)));
  assert.throws(()=>normalizeBundleMetadata({version:2,pages:[]}));assert.throws(()=>validateBundleThreadId('scene/escape::session:x'));
  assert.throws(()=>validateBundleThreadId('a::page:x'));assert.equal(JSON.stringify(metadata),before);
});

test('bundling every comment can atomically create an empty regular successor, preserved after reload and filled by new comments',()=>{
  const list=items(120),plan=planBundleBefore(list,[],list.at(-1).id,{includeComment:true});
  const nextPage={id:'regular-next',title:'Nach dem Übungskampf',after:plan.end,time:null};
  let metadata=applyBundleMutation(emptyBundleMetadata(),{kind:'create',page:{id:'all',title:'Übungskampf',start:plan.start,end:plan.end,before:plan.before},nextPage},'bundle-with-successor');
  metadata=normalizeBundleMetadata(JSON.parse(JSON.stringify(metadata)));
  let pages=pagination(metadata).buildCommentTimelinePages(list.map(item=>item.comment),'scene::session:one');
  assert.deepEqual(Array.from(pages,page=>[page.label,page.items.length]),[['Übungskampf',120],['Nach dem Übungskampf',0]]);
  assert.equal(pages[1].regularPageId,'regular-next');
  const expanded=items(123);
  pages=pagination(metadata).buildCommentTimelinePages(expanded.map(item=>item.comment),'scene::session:one');
  assert.deepEqual(Array.from(pages,page=>page.items.length),[120,3]);
  assert.equal(pages[1].items[0].id,'c-120');
});

test('regular page size applies per scene; regular names and page time survive subsequent overflow',()=>{
  const list=items(11),time={calendarDate:{year:1740,month:3,day:11},seconds:43200};
  let metadata=applyBundleMutation(emptyBundleMetadata(),{kind:'configure',pageSize:3},'set-page-size');
  metadata=applyBundleMutation(metadata,{kind:'regular',page:{id:'regular-second',title:'Mittag',after:itemAnchor(list[2]),time}},'name-regular-page');
  const pages=pagination(metadata).buildCommentTimelinePages(list.map(item=>item.comment),'scene::session:one');
  assert.deepEqual(Array.from(pages,page=>page.items.length),[3,3,3,2]);
  assert.deepEqual(Array.from(pages,page=>page.label),['1','Mittag','2','3']);
  assert.deepEqual(pages[1].time,time);
  const unrelated=pagination(emptyBundleMetadata()).buildCommentTimelinePages(list.map(item=>item.comment),'other::session:two');
  assert.equal(unrelated.length,1);
});

test('a regular successor can be added after an existing all-comment bundle without changing it',()=>{
  const list=items(100),bundled=create(emptyBundleMetadata(),list,99,'Ganz',{includeComment:true}),old=JSON.stringify(bundled.pages);
  let metadata=applyBundleMutation(bundled,{kind:'regular',page:{id:'next',after:itemAnchor(list[99]),title:'',time:null}},'new-empty-page');
  const context=pagination(metadata),info=context.getCommentPaginationWindow(list.map(item=>item.comment),'scene::session:one');
  assert.equal(info.pageCount,2);assert.equal(info.pages[1].label,'1');assert.equal(info.pages[1].items.length,0);
  assert.equal(JSON.stringify(metadata.pages),old);
  metadata=applyBundleMutation(metadata,{kind:'remove-regular',pageId:'next'},'remove-empty-page');
  assert.equal(pagination(metadata).buildCommentTimelinePages(list.map(item=>item.comment)).length,1);
  assert.equal(JSON.stringify(metadata.pages),old);
});

test('empty scenes expose management; empty pages never display an inverted comment range',()=>{
  const metadata=applyBundleMutation(emptyBundleMetadata(),{kind:'regular',page:{id:'first',after:null,title:''}},'empty-scene-first');
  const context=pagination(metadata),info=context.getCommentPaginationWindow([],'scene::session:one');
  const html=context.renderCommentPaginationControls('scene::session:one',info);
  assert.equal(info.pageCount,1);assert.match(html,/Neue Seite/);assert.match(html,/Seiten verwalten/);assert.match(html,/noch keine Kommentare/);
  assert.doesNotMatch(html,/Kommentare 1-0/);
});

test('regular boundaries use saved positions when an anchor is deleted and preserve retroactive insertions',()=>{
  const list=items(6),metadata=applyBundleMutation(emptyBundleMetadata(),{kind:'regular',page:{id:'next',title:'Weiter',after:itemAnchor(list[3])}},'stable-regular-page');
  const retro={id:'retro',order:2500,time:2500,stable:true,comment:{id:'retro',orderKey:2500}};
  const expanded=[...list.slice(0,3),retro,...list.slice(4)].map((item,index)=>({...item,index}));
  const groups=partitionCommentPageItems(expanded,metadata).groups;
  assert.deepEqual(groups.filter(group=>group.type==='comments').map(group=>group.items.map(item=>item.id)),[['c-0','c-1','c-2','retro'],['c-4','c-5']]);
  assert.equal(new Set(groups.flatMap(group=>group.items.map(item=>item.id))).size,expanded.length);
});

test('invalid page settings, dates, duplicate boundaries and detached successors are rejected atomically',()=>{
  const list=items(3),page={id:'first',title:'',after:itemAnchor(list[2])};
  const metadata=applyBundleMutation(emptyBundleMetadata(),{kind:'regular',page},'first-marker'),before=JSON.stringify(metadata);
  for(const pageSize of [0,-1,1.5,1001,'75',null]) assert.throws(()=>applyBundleMutation(metadata,{kind:'configure',pageSize},'bad-setting'));
  assert.throws(()=>applyBundleMutation(metadata,{kind:'regular',page:{...page,id:'same-boundary'}},'duplicate-boundary'),/bereits/);
  assert.throws(()=>normalizeBundleMutation({kind:'regular',page:{...page,time:{calendarDate:{year:1740,month:3,day:37},seconds:0}}}));
  const plan=planBundleBefore(list,[],list[2].id,{includeComment:true});
  assert.throws(()=>applyBundleMutation(emptyBundleMetadata(),{kind:'create',page:{id:'bundle',title:'Alle',start:plan.start,end:plan.end},nextPage:{...page,after:itemAnchor(list[0])}},'detached-page'),/direkt nach/);
  assert.equal(JSON.stringify(metadata),before);
});

test('version-one metadata upgrades without losing bundles; normalization keeps every new setting',()=>{
  const list=items(3),metadata=create(emptyBundleMetadata(),list,2,'Alt');
  const old={schema:metadata.schema,version:1,revision:metadata.revision,pages:metadata.pages,lastMutationId:'original',lastMutationHash:'original-hash'};
  const upgraded=normalizeBundleMetadata(old);
  assert.equal(upgraded.version,2);assert.equal(upgraded.pageSize,75);assert.deepEqual(upgraded.regularPages,[]);assert.deepEqual(upgraded.pages,metadata.pages);
});
