import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createLandingPage, normalizeLandingData } from '../modules/landing/landing-model.js';
import { normalizeLandingQuestJournal, landingQuestJournalShell, landingQuestJournalHref } from '../modules/landing/landing-quest-model.js';
import { mountLandingQuestJournal, unmountLandingQuestJournal } from '../modules/landing/landing-quest-journal.js';
import { createQuestRepository } from '../modules/quests/quest-firebase.js';
const calendarContext = vm.createContext({}); vm.runInContext(await readFile(new URL('../modules/core/aleria-calendar.js',import.meta.url),'utf8'),calendarContext);
const stamp = { date: { year:1740,month:3,day:9 }, time:'08:00' };
test('every newly created landing page has a reusable journal contract without seeded quests or groups', () => {
  const page = createLandingPage('Neue Gruppe');
  assert.deepEqual(page.landing.questJournal,{enabled:true,questIds:[],runIds:[],includeMembers:true}); assert.deepEqual(page.landing.quests,[]);
  assert.deepEqual(normalizeLandingQuestJournal(null),page.landing.questJournal);
});
test('normalization retains explicit references and existing local tasks without copying live run state', () => {
  const data = normalizeLandingData({ title:'Gruppe',questJournal:{questIds:['one','one'],runIds:'run-1\nrun-2',includeMembers:false},quests:[{id:'local',title:'Planung',status:'active'}] });
  assert.deepEqual(data.questJournal.runIds,['run-1','run-2']);assert.deepEqual(data.questJournal.questIds,['one']);
  assert.equal(data.quests[0].id,'local');assert.equal(data.questJournal.includeMembers,false);
  assert.deepEqual(normalizeLandingData(data),data);
});
test('journal shell and routes escape arbitrary module identifiers, and archive routes preserve their view', () => {
  assert.match(landingQuestJournalHref('crew','archive'),/module=crew&view=archive/);
  assert.ok(!landingQuestJournalShell('\" onclick=\"bad').includes('onclick="bad'));
  assert.match(landingQuestJournalShell('crew'),/Quests &amp; Abenteuer/);
});
test('context queries use bounded real identities and every sorted run window has a deployable index', async () => {
  const queries=[], stops=[];
  const sdk={collection:(_db,name)=>name,doc:(_db,name,id)=>`${name}/${id}`,where:(...args)=>({where:args}),orderBy:(...args)=>({orderBy:args}),limit:n=>({limit:n}),query:(...parts)=>parts.flat(),
    onSnapshot(query){queries.push(query);const stop=()=>stops.push(query);return stop;}};
  const repository=createQuestRepository({db:{},sdk,functions:{},httpsCallable:()=>()=>{},requireUser:()=>{},auth:{},authSdk:{}});
  const stop=repository.context({moduleId:'crew',threadIds:['inn::session:one'],memberKeys:['character:mara'],questIds:['quest'],runIds:['run']},()=>{},()=>{});
  assert.ok(queries.some(query=>Array.isArray(query)&&query.some(part=>part?.where?.[0]==='partyKeys')));
  assert.ok(queries.some(query=>Array.isArray(query)&&query.some(part=>part?.where?.[2]==='inn::session:one')));
  assert.ok(!queries.some(query=>JSON.stringify(query).includes('anzeigetafeln')));
  const {indexes} = JSON.parse(await readFile(new URL('../../firebase/firestore.indexes.json',import.meta.url),'utf8'));
  const runQueries = queries.filter(query=>Array.isArray(query)&&query[0]==='quest_runs');
  assert.equal(runQueries.length,6);
  for (const query of runQueries) {
    const array = query.find(part=>['array-contains','array-contains-any'].includes(part.where?.[1])).where[0];
    const [sort,direction] = query.find(part=>part.orderBy).orderBy;
    assert.equal(query.find(part=>part.limit).limit,50);assert.equal(direction,'desc');
    assert.ok(indexes.some(index=>index.collectionGroup==='quest_runs'&&index.queryScope==='COLLECTION'
      &&index.fields.some(field=>field.fieldPath===array&&field.arrayConfig==='CONTAINS')
      &&index.fields.some(field=>field.fieldPath==='status'&&field.order==='ASCENDING')
      &&index.fields.some(field=>field.fieldPath===sort&&field.order==='DESCENDING')),`missing index for ${array}, status, ${sort}`);
  }
  stop();assert.equal(stops.length,queries.length);
});

test('context keeps active runs visible beside large archives for modules, scenes and party members', () => {
  const history = Array.from({length:70}, (_, index) => ({ id:`archive-${String(index).padStart(3,'0')}`, status:index % 2 ? 'abandoned' : 'completed',
    endedKey:`01740-03-${String(index).padStart(3,'0')}T08:00`, updatedAt:index ? '2020' : '2099',
    links:{modules:['crew'],scenes:['inn::session:one']},partyKeys:['character:mara'] }));
  const active = {id:'zz-active',status:'active',updatedAt:'2026',revision:1,links:{modules:['crew'],scenes:['inn::session:one']},partyKeys:['character:mara']};
  const value = (row, path) => path.split('.').reduce((result, key) => result?.[key], row);
  for (const request of [{moduleId:'crew'}, {moduleId:'other',threadIds:['inn::session:one']}, {moduleId:'other',memberKeys:['character:mara',...Array.from({length:29},(_,index)=>`character:${index}`)]}]) {
    const listeners = []; let projected, stopped = 0;
    const sdk = { collection:(_db,name)=>name,doc:(_db,name,id)=>({collection:name,id}),where:(...where)=>({where}),orderBy:(...orderBy)=>({orderBy}),limit:limit=>({limit}),query:(...parts)=>parts.flat(),
      onSnapshot(query, next) { listeners.push({query,next}); return () => stopped++; } };
    const repository = createQuestRepository({db:{},sdk,functions:{},httpsCallable:()=>()=>{},requireUser:()=>{},auth:{},authSdk:{}});
    const stop = repository.context(request, next => {projected=next;}, error => {throw error;});
    const emit = () => {
      for (const {query,next} of listeners) {
        let rows = query[0] === 'quest_runs' ? [...history,active] : [];
        for (const filter of query.filter(part=>part.where)) {
          const [field,operator,expected] = filter.where;
          rows = rows.filter(row => operator === '==' ? value(row,field) === expected : operator === 'in' ? expected.includes(value(row,field))
            : operator === 'array-contains' ? value(row,field)?.includes(expected) : expected.some(key=>value(row,field)?.includes(key)));
        }
        for (const {orderBy:[field,direction]} of query.filter(part=>part.orderBy)) rows.sort((a,b)=>(direction==='desc'?-1:1)*String(value(a,field)).localeCompare(String(value(b,field))));
        const limit = query.find(part=>part.limit)?.limit;
        rows = rows.slice(0,limit); next({docs:rows.map(row=>({id:row.id,data:()=>structuredClone(row)}))});
      }
    };
    emit();
    assert.ok(projected.runs.some(row=>row.id===active.id && row.status==='active'));
    const archive = projected.runs.filter(row=>row.status!=='active');
    assert.equal(archive.length,50);assert.equal(archive[0].id,'archive-069');assert.ok(!archive.some(row=>row.id==='archive-000'));
    for (const {query} of listeners.filter(row=>row.query[0]==='quest_runs')) {
      const disjunctions = query.filter(part=>['in','array-contains-any'].includes(part.where?.[1])).reduce((count,part)=>count*part.where[2].length,1);
      assert.ok(disjunctions<=30, 'combined status and participant filters obey Firestore disjunction limits');
    }
    active.status='completed';active.endedKey='01741-01-01T00:00';active.revision++;
    emit();assert.equal(projected.runs.find(row=>row.id===active.id).status,'completed');assert.equal(projected.runs.filter(row=>row.status!=='active').length,50);
    stop();assert.equal(stopped,listeners.length);
    active.status='active';delete active.endedKey;
  }
});
test('a landing page projects completed runs and payout status, and disposes its realtime listeners', async () => {
  const previous=globalThis.AleriaCalendar;globalThis.AleriaCalendar=calendarContext.AleriaCalendar;
  const content={innerHTML:''},listeners=new Map(),host={querySelector:()=>content,addEventListener:(name,handler)=>listeners.set(name,handler)};
  const root={querySelector:()=>host};let disposed=0,request;
  const context={root,entry:{id:'crew'},page:createLandingPage('Mannschaft')};
  const run={id:'run',title:'Lieferung',status:'completed',party:[{name:'Mara'}],groupName:'Boten',started:stamp,ended:stamp,updatedAt:'2026',rewardStatus:'claimed'};
  const later={...run,id:'later',title:'Neuer Abschluss',ended:{...stamp,date:{...stamp.date,day:10}},updatedAt:'2025'};
  mountLandingQuestJournal(context,{client:async()=>({context(input,next){request=input;next({quests:[],runs:[run,later]});return()=>disposed++;}}),catalog:async()=>({quests:[]})});
  await Promise.resolve();await Promise.resolve();await Promise.resolve();
  assert.equal(request.moduleId,'crew');assert.match(content.innerHTML,/Chronik · 2/);
  listeners.get('click')({target:{closest:()=>({dataset:{landingJournalTab:'archive'}})}});
  assert.match(content.innerHTML,/Belohnung übergeben/);assert.match(content.innerHTML,/quests.html\?run=run/);
  assert.ok(content.innerHTML.indexOf('Neuer Abschluss')<content.innerHTML.indexOf('Lieferung'),'archive order follows completion time even after an older reward was modified later');
  unmountLandingQuestJournal(context);assert.equal(disposed,1);globalThis.AleriaCalendar=previous;
});
test('editor preview never initializes Firebase or modifies a real run', () => {
  const content={innerHTML:''},host={querySelector:()=>content,addEventListener(){}},context={root:{querySelector:()=>host},entry:{id:'preview'},page:createLandingPage(),preview:true};
  let connections=0;mountLandingQuestJournal(context,{client:async()=>{connections++;},catalog:async()=>({quests:[]})});
  assert.equal(connections,0);assert.match(content.innerHTML,/Vorschau/);unmountLandingQuestJournal(context);
});
