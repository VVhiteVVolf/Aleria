import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { applyBundleMutation, emptyBundleMetadata, normalizeBundleMetadata, normalizeBundleTitle, partitionBundleItems, planBundleBefore, resolveBundleRanges, validateBundleThreadId } from '../modules/comments/comment-page-bundles-model.mjs';

const items = count => Array.from({ length: count }, (_, index) => ({ id: `c-${index}`, order: index*1000, time: index*1000, stable: true, index, comment: { id: `c-${index}`, orderKey: index*1000, text: `Unverändert ${index}` } }));
function create(metadata, list, index, id, options = {}) {
  const plan = planBundleBefore(list, metadata.pages, list[index].id, options);
  return applyBundleMutation(metadata, { kind: 'create', page: { id, title: id, start: plan.start, end: plan.end, before: plan.before }, replaceIds: plan.replaceIds }, 'erdi', `mutation-${id}`);
}
function pagination(metadata) {
  const context = vm.createContext({ console, escapeHtml: value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
    isSceneTimeEventComment: comment => !!comment.day, isSceneTimeSegmentBreakEvent: comment => !!comment.day,
    getSceneTimeEventSegmentLabel: (_,index) => `Tag ${index}` });
  context.window=context;
  context.AleriaCommentPageBundles={ count:()=>metadata.pages.length, getGroups:(_,comments)=>partitionBundleItems(comments.map((comment,index)=>({id:comment.id,order:comment.orderKey,time:comment.orderKey,stable:true,index,comment})),metadata.pages).groups };
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
  metadata=applyBundleMutation(metadata,{kind:'rename',pageId:'Am Tor',title:'Abend <img src=x>'},'patrick','rename-one');
  assert.equal(metadata.pages[0].start.id,JSON.parse(bounds).start.id);
  const context=pagination(metadata),info=context.getCommentPaginationWindow(list.map(item=>item.comment),'scene::session:one');
  const html=context.renderCommentPaginationControls('scene::session:one',info);
  assert.match(html,/Abend &lt;img src=x&gt;/);assert.doesNotMatch(html,/<img src=x>/);
  metadata=applyBundleMutation(metadata,{kind:'remove',pageId:'Am Tor'},'patrick','remove-one');
  assert.equal(metadata.pages.length,0);assert.equal(pagination(metadata).buildCommentTimelinePages(list.map(item=>item.comment)).length,3);
});
test('overlapping or malformed operations fail without modifying the existing metadata',()=>{
  const list=items(30),metadata=create(emptyBundleMetadata(),list,10,'Erste'),before=JSON.stringify(metadata);
  const plan=planBundleBefore(list,[],list[20].id);
  assert.throws(()=>applyBundleMutation(metadata,{kind:'create',page:{id:'overlap',title:'Überlappung',start:plan.start,end:plan.end,before:plan.before}},'erdi','overlap-request'),/bereits gebündelt/);
  assert.throws(()=>normalizeBundleTitle('   '));assert.throws(()=>normalizeBundleTitle('x'.repeat(121)));
  assert.throws(()=>normalizeBundleMetadata({version:2,pages:[]}));assert.throws(()=>validateBundleThreadId('scene/escape::session:x'));
  assert.throws(()=>validateBundleThreadId('a::page:x'));assert.equal(JSON.stringify(metadata),before);
});
