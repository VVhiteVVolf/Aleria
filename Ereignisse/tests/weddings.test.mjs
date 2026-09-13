import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { validateWedding, validateWeddingEnvelope, weddingPageHref } from '../modules/weddings/wedding-schema.mjs';
import { selectWeddingGuests, updateWeddingEntry, weddingCalendarHref, weddingChanges } from '../modules/weddings/wedding-model.mjs';
import { createWeddingStore } from '../modules/weddings/wedding-store.mjs';
import { renderWedding } from '../modules/weddings/wedding-render.mjs';
import { calendarChronicleSelection } from '../modules/catalog/events-model.mjs';
import { parseWeddingPublication, publishWedding, handler } from '../../netlify/functions/wedding-publisher.mjs';

const record = JSON.parse(await readFile(new URL('../Hochzeiten/data/tudwal-revelyn.json',import.meta.url),'utf8'));
const template = JSON.parse(await readFile(new URL('../Hochzeiten/templates/hochzeit.json',import.meta.url),'utf8'));
const memory = () => { const data = new Map(); return { getItem: key => data.get(key), setItem: (key,value) => data.set(key,value) }; };
const config = { owner:'test',repo:'repo',repository:'test/repo',branch:'master',token:'test-token' };
const calendarContext = vm.createContext({});
vm.runInContext(await readFile(new URL('../../AleriaAlmanach/modules/core/aleria-calendar.js',import.meta.url),'utf8'),calendarContext);

test('the entire guest source survives, including joint gifts and the unknown guest', () => {
  const result = validateWeddingEnvelope(record);
  assert.equal(result.wedding.guests.length,39);
  assert.deepEqual(['ceremony','house-one','house-two','individual','delegations'].map(group => result.wedding.guests.filter(guest => guest.group === group).length),[9,9,7,14,0]);
  assert.match(result.wedding.guests.find(guest => guest.id === 'individual-rhydian-lynne').gift,/falsches Schiff/);
  assert.equal(result.wedding.guests.find(guest => guest.id === 'individual-rhydian-lynne').giftStatus,'later');
  assert.equal(selectWeddingGuests(result.wedding.guests,{query:'magischer abakus'})[0].name,'Rhiannon');
  assert.equal(selectWeddingGuests(result.wedding.guests,{query:'Rhiannon',group:'ceremony'}).length,0);
  assert.equal(validateWeddingEnvelope(template).wedding.guests.length,0);
  assert.equal(result.wedding.guests.flatMap(guest => guest.portraits).length,43);
  assert.equal(result.wedding.guests.find(guest => guest.id === 'individual-fenrir-skalli-slepinir').portraits.length,3);
});
test('invalid dates, duplicate IDs, unsafe media and broken revisions are rejected', () => {
  const wedding = record.wedding;
  for (const date of [{year:1740,month:14,day:1,time:''},{year:null,month:1,day:1,time:''},{year:1740,month:1,day:1,time:'25:00'}]) assert.throws(() => validateWedding({...wedding,date}));
  assert.throws(() => validateWedding({...wedding,status:'scheduled',date:{year:null,month:null,day:null,time:''}}));
  assert.throws(() => validateWedding({...wedding,guests:[wedding.guests[0],wedding.guests[0]]}));
  for (const image of ['javascript:alert(1)','assets/../secrets.png','https://user:pass@example.com/x.png']) assert.throws(() => validateWedding({...wedding,image}));
  assert.throws(() => validateWedding({...wedding,guests:[{...wedding.guests[0],portraits:[{id:'unsafe',name:'Gast',image:'../Stammbäume/assets/images/portraits/../../secret.png',position:'top'}]}]}));
  assert.throws(() => validateWeddingEnvelope({...record,revision:-1}));
  assert.throws(() => weddingPageHref('../escape'));
  for (const body of ['null','[]','{"id":"../secret"}']) assert.throws(() => parseWeddingPublication(body));
});
test('exact wedding dates open the matching calendar day without moving the world date', () => {
  const wedding = {...record.wedding,date:{year:1741,month:13,day:36,time:'16:00'}};
  const url = new URL(weddingCalendarHref(wedding,'https://aleria.test/Ereignisse/'));
  const current = {year:1740,month:1,day:9};
  assert.deepEqual(calendarChronicleSelection(url.searchParams,current).selected,{year:1741,month:13,day:36});
  assert.deepEqual(current,{year:1740,month:1,day:9});
  assert.deepEqual(calendarChronicleSelection(new URLSearchParams('year=1741&month=99&date=999'),current).selected,{...current,year:1741});
});
test('local drafts survive reload, stay isolated and retain conflicts for review', () => {
  const storage = memory(), store = createWeddingStore(record,{storage});
  const wedding = updateWeddingEntry(record.wedding,'guests',{...record.wedding.guests[0],gift:'Ein gemeinsames Buch'});
  store.edit(wedding);
  const reload = createWeddingStore(record,{storage});
  assert.equal(reload.getState().envelope.wedding.guests[0].gift,'Ein gemeinsames Buch');
  assert.equal(reload.getState().published.wedding.guests[0].gift,'');
  const next = createWeddingStore({...record,revision:2},{storage});
  assert.equal(next.getState().conflict,true);
  assert.equal(next.getState().envelope.revision,1);
  assert.equal(createWeddingStore({...template,id:'anderes-fest'},{storage}).getState().envelope.wedding.guests.length,0);
  next.discard(); assert.equal(next.getState().envelope.revision,2);
});
test('storage failure cannot silently lose an edit; successful commits are retained', () => {
  const storage = { getItem:()=>null,setItem:()=>{throw new Error('Quota');} }, store = createWeddingStore(record,{storage});
  assert.throws(() => store.edit({...record.wedding,notes:'nicht gespeichert'}),/Speicher/);
  assert.equal(store.getState().dirty,false);
  store.acceptPublished({...record,revision:2});
  assert.equal(store.getState().envelope.revision,2);
  assert.match(store.getState().error,/Cache/);
});
test('readers see full text safely escaped; publication review notices reordered programs', () => {
  const wedding = structuredClone(record.wedding); wedding.guests[0].gift = '<img src=x onerror=alert(1)>\nVollständiger Beitrag';
  const html = renderWedding(wedding,{eventsBase:'https://aleria.test/Ereignisse/',calendar:calendarContext.AleriaCalendar,editing:false,dirty:false,revision:1});
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes('<img src=x')); assert.ok(!html.includes('<table'));
  const first = {id:'a',title:'Trauung',time:'',location:'',description:''}, second = {...first,id:'b',title:'Feier'};
  assert.deepEqual(weddingChanges({...wedding,schedule:[first,second]},{...wedding,schedule:[second,first]}),['Ablauf: Reihenfolge geändert']);
});

function githubFixture({ revision = 1, race = false } = {}) {
  const requests = [], encode = value => ({content:Buffer.from(JSON.stringify(value)).toString('base64')});
  return { requests, fetchRef: async (url,options = {}) => {
    const path = decodeURIComponent(new URL(url).pathname).replace('/repos/test/repo',''), body = options.body ? JSON.parse(options.body) : null;
    requests.push({url,path,body,method:options.method || 'GET'});
    let status = 200, value;
    if (path === '/git/ref/heads/master') value = {object:{sha:'head-a'}};
    else if (path === '/git/commits/head-a') value = {tree:{sha:'tree-a'}};
    else if (path.endsWith('/registry.json')) value = encode({schemaVersion:1,weddings:[{id:'anderes-fest',title:'Andere Hochzeit',revision:8}]});
    else if (path.includes('/contents/')) { if (revision) value = encode({...record,revision}); else {status = 404;value = {};} }
    else if (path === '/git/blobs') value = {sha:`blob-${requests.length}`};
    else if (path === '/git/trees') value = {sha:'tree-b'};
    else if (path === '/git/commits') value = {sha:'commit-b'};
    else if (path === '/git/refs/heads/master') {status = race ? 422 : 200;value = {};}
    else throw new Error(`Unexpected request ${path}`);
    return new Response(JSON.stringify(value),{status});
  }};
}
test('publication updates data and registry in one non-force commit and preserves other weddings', async () => {
  const fixture = githubFixture();
  const saved = await publishWedding({id:record.id,expectedRevision:1,wedding:record.wedding},config,fixture.fetchRef);
  assert.equal(saved.envelope.revision,2);
  const tree = fixture.requests.find(request => request.path === '/git/trees');
  assert.deepEqual(tree.body.tree.map(entry => entry.path),['Ereignisse/Hochzeiten/data/tudwal-revelyn.json','Ereignisse/Hochzeiten/registry.json']);
  assert.equal(tree.body.base_tree,'tree-a');
  const registry = fixture.requests.filter(request => request.path === '/git/blobs').map(request => JSON.parse(request.body.content)).find(value => value.weddings);
  assert.equal(registry.weddings.find(entry => entry.id === 'anderes-fest').revision,8);
  assert.equal(registry.weddings.find(entry => entry.id === record.id).revision,2);
  assert.deepEqual(fixture.requests.find(request => request.method === 'PATCH').body,{sha:'commit-b',force:false});
  assert.ok(fixture.requests.filter(request => request.path.includes('/contents/')).every(request => new URL(request.url).searchParams.get('ref') === 'head-a'));
});
test('stale edits stop before writes and branch races cannot overwrite another commit', async () => {
  const stale = githubFixture({revision:3}), race = githubFixture({race:true});
  const input = {id:record.id,expectedRevision:1,wedding:record.wedding};
  await assert.rejects(publishWedding(input,config,stale.fetchRef),error => error.status === 409);
  assert.ok(stale.requests.every(request => request.method === 'GET'));
  await assert.rejects(publishWedding(input,config,race.fetchRef),error => error.status === 422);
});
test('public endpoint requires authorization before accepting writes', async () => {
  assert.equal((await handler({httpMethod:'POST',headers:{},body:'null'})).statusCode,401);
  assert.equal((await handler({httpMethod:'DELETE',headers:{}})).statusCode,405);
  assert.equal((await handler({httpMethod:'GET',queryStringParameters:{id:'../secret'}})).statusCode,400);
});
