import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile,readdir} from 'node:fs/promises';
import {realms} from '../../shared/accepted-realms/catalog.mjs';
import {PREPARATIONS,PREPARATION_GROUPS,filterPreparations} from '../overview/preparation-catalog.mjs';
import {renderOverview,renderPreparationSections} from '../overview/overview-render.mjs';
const root=new URL('../../',import.meta.url),preview=new URL('../',import.meta.url);

test('the overview includes every existing open workshop and excludes admitted land pages',async()=>{
 const admitted=new Set(realms.map(realm=>realm.id));
 const uathneach=JSON.parse(await readFile(new URL('Kontinente/modules/uathneach/pages.source.json',root),'utf8'));
 assert(uathneach.pages.some(page=>page.id==='fuerstentum-uathneach'));
 admitted.add('uathneach');
 const directories=await readdir(preview,{withFileTypes:true}),workshops=[];
 for(const entry of directories){
  if(!entry.isDirectory()||['shared','tests','overview'].includes(entry.name))continue;
  try{await access(new URL(entry.name+'/index.html',preview));workshops.push(entry.name.toLocaleLowerCase('de'));}catch{}
 }
 const pending=workshops.filter(id=>!admitted.has(id)).sort();
 assert.deepEqual(PREPARATIONS.map(entry=>entry.id).sort(),pending);
 assert(PREPARATIONS.every(entry=>!admitted.has(entry.id)));
});

test('all overview page and crest links resolve to the current local country assets',async()=>{
 assert.equal(new Set(PREPARATIONS.map(entry=>entry.id)).size,PREPARATIONS.length);
 for(const entry of PREPARATIONS){
  assert(entry.href.startsWith('./')&&!entry.href.includes('..'));
  await access(new URL(entry.href+'index.html',preview));await access(new URL(entry.image,preview));
  const page=await readFile(new URL(entry.href+'index.html',preview),'utf8');
  assert.match(page,/noindex,nofollow/);
 }
});

test('Argentum has three province cards in its own group without becoming three independent countries',()=>{
 const provinces=PREPARATIONS.filter(entry=>entry.group==='argentum');
 assert.deepEqual(provinces.map(entry=>entry.name).sort(),['Calidaria','Leukonia','Vardentia']);
 assert(provinces.every(entry=>entry.kind==='Provinz Argentums'));
 assert.equal(PREPARATIONS.find(entry=>entry.name==='Vardentia').href,'./Sylvarant/');
 assert.equal(new Set(PREPARATION_GROUPS.map(group=>group.id)).size,PREPARATION_GROUPS.length);
 assert(PREPARATIONS.every(entry=>PREPARATION_GROUPS.some(group=>group.id===entry.group)));
});

test('search combines terms and restores all workshops after clearing',()=>{
 assert.equal(filterPreparations(PREPARATIONS,'').length,PREPARATIONS.length);
 assert.deepEqual(filterPreparations(PREPARATIONS,'HÖHEN unbekannt'),[]);
 assert.deepEqual(filterPreparations(PREPARATIONS,'ARGENTUM').map(entry=>entry.id).sort(),['calidaria','leukonia','sylvarant']);
 assert.deepEqual(filterPreparations(PREPARATIONS,'Pharaonische FAMILIE').map(entry=>entry.id),['kemetara']);
 assert.deepEqual(filterPreparations(PREPARATIONS,'Vardentia').map(entry=>entry.id),['sylvarant']);
});

test('the renderer escapes display data and has no inline event handlers',()=>{
 const hostile={...PREPARATIONS[0],name:'<script>unsafe</script>',summary:'" onclick="unsafe'};
 const html=renderOverview(PREPARATION_GROUPS,[hostile]);
 assert(!html.includes('<script>unsafe'));assert(html.includes('&lt;script&gt;unsafe&lt;/script&gt;'));
 assert.doesNotMatch(html,/<[^>]+\son(?:click|input|change)=/i);
 assert.equal((renderOverview(PREPARATION_GROUPS,PREPARATIONS).match(/data-preparation=/g)||[]).length,PREPARATIONS.length);
 const argentumOnly=renderPreparationSections(PREPARATION_GROUPS,filterPreparations(PREPARATIONS,'Argentum'));
 assert(!argentumOnly.includes('id="realms"'));assert(argentumOnly.includes('id="argentum"'));
});
