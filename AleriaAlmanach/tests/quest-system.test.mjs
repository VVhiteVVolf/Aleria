import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { normalizeQuest, normalizeQuestRewards, normalizeQuestParty, questStamp, questStampKey, questHref, questMatches } from '../modules/quests/quest-model.js';
import { questsFromBoard, mergeQuestSources, questsFromModules } from '../modules/quests/quest-sources.js';
import { projectQuestJournal } from '../modules/quests/quest-journal.js';
import { createQuestStore } from '../modules/quests/quest-store.js';
import { renderQuestDetail } from '../modules/quests/quest-view.js';
import { readFirebaseModuleEntry } from '../modules/module-store/module-entry-serialization.js';
import { createItemDefinitionRegistry } from '../modules/item-definitions/item-definition-registry.js';
import { readQuestBoardSource } from '../modules/quests/quest-board-source.js';
import { mountQuestSceneTrackers, unmountQuestSceneTrackers } from '../modules/quests/quest-scene-tracker.js';
const context = vm.createContext({}); vm.runInContext(await readFile(new URL('../modules/core/aleria-calendar.js', import.meta.url), 'utf8'), context);

test('quest navigation reaches the existing central map and board entry pages',async()=>{
  const page=new URL('../quests.html',import.meta.url),html=await readFile(page,'utf8');
  const links=[...new Set([...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(match=>match[1]).filter(href=>/^\.\.?\//.test(href)))];
  assert.ok(links.includes('../Karten/karte.html'));assert.ok(links.includes('../Anzeigetafeln/tafel.html'));
  for(const href of links)await access(new URL(href.split(/[?#]/)[0],page));
  assert.doesNotMatch(html,/(?:Karten|Anzeigetafeln)\/index\.html/);
});
const calendar = context.AleriaCalendar, stamp = { date: { year: 1740, month: 3, day: 9 }, time: '08:00' };
const quest = () => normalizeQuest({ id: 'quest:one', title: 'Ein Auftrag', links: { maps: ['map'], scenes: ['inn::session:0'] } });
test('the shared contract preserves immutable item references and rejects malformed rewards', () => {
  assert.deepEqual(normalizeQuestRewards([{ kind: 'item', definitionRef: { id: 'item:one', revision: 'b719af3' }, quantity: 2 }])[0].definitionRef, { id: 'item:one', revision: 'b719af3' });
  for (const reward of [{ kind: 'money', amount: -1, currency: 'copper' }, { kind: 'item', itemId: 'sword', quantity: 1.5 }, { kind: 'item', quantity: 1 }, { kind: 'xp', amount: 500 }]) assert.throws(() => normalizeQuestRewards([reward]));
});
test('Aleria stamps allow day 36/month 13, sort across years and keep Play day 1 fixed', () => {
  assert.equal(calendar.playDay(stamp.date), 1); assert.equal(calendar.playDay({ year: 1740, month: 3, day: 10 }), 2);
  assert.ok(questStampKey({ date: { year: 1740, month: 13, day: 36 }, time: '23:59' }) < questStampKey({ date: { year: 1741, month: 1, day: 1 }, time: '00:00' }));
  assert.throws(() => questStamp({ ...stamp, time: '24:01' })); assert.throws(() => questStamp({ date: { year: 1740, month: 3, day: 37 }, time: '08:00' }));
});
test('party identities distinguish characters and creatures, and reject duplicate possessions of a party slot', () => {
  assert.equal(normalizeQuestParty([{ kind: 'character', recordId: 'one' }, { kind: 'creature', recordId: 'one' }]).length, 2);
  assert.throws(() => normalizeQuestParty([{ kind: 'character', recordId: 'one' }, { kind: 'character', recordId: 'one' }]));
});
test('board sheets are grouped by explicit publication identity; private notices and HTML are excluded', () => {
  const rows = questsFromBoard({ id: 'board' }, { zettel: [
    { id: 'front', title: 'Öffentlich', typ: 'hilfsgesuch', text: '<p>Ein Auftrag</p>', noticeGroupId: 'front' },
    { id: 'back', title: 'Zweite Seite', typ: 'quest', noticeGroupId: 'front' },
    { id: 'hidden', title: 'Geheim', typ: 'quest', secret: true }
  ] });
  assert.equal(rows.length, 1); assert.equal(rows[0].summary, 'Ein Auftrag'); assert.equal(rows[0].links.notices[0].noticeId, 'front');
});
test('new live modules and their quest-file pages use the same source projection', () => {
  assert.equal(questsFromModules([{ id: 'one', title: 'Modul', pages: [{ questFile: { title: 'Auftrag', sectionThreeItems: [{ title: 'Liefern' }] } }] }])[0].objectives[0].title, 'Liefern');
  assert.deepEqual(readFirebaseModuleEntry({ entryJson: '{"id":"one","title":"Live"}' }), { id: 'one', title: 'Live' });
  assert.throws(() => readFirebaseModuleEntry({ entryJson: 'broken' }));
});
test('source links select actual page/session threads and safely encode routes', () => {
  assert.ok(questMatches(quest(), '', { module: 'inn' })); assert.ok(!questMatches(quest(), '', { module: 'other' }));
  assert.match(questHref('scene', 'inn::session:0'), /entry=inn&thread=inn%3A%3Asession%3A0/);
  assert.equal(questHref('board', 'one', 'notice'), '/Anzeigetafeln/tafel.html?tafel=one&notice=notice');
});
test('an authored override replaces one source without duplicating its quest', () => {
  assert.equal(mergeQuestSources([quest()], [{ ...quest(), title: 'Edited' }]).length, 1);
});
test('journal renders escaped player text and distinguishes claimed rewards from promises', () => {
  const html = renderQuestDetail({ ...quest(), title: '<script>alert(1)</script>', party: [], status: 'completed', rewardStatus: 'claimed', rewardPlan: [], started: stamp }, { run: true, catalog: { maps: [], boards: [], modules: [] }, calendar });
  assert.ok(!html.includes('<script>')); assert.match(html, /Übergebene Belohnungen/); assert.match(html, /thread=inn/);
});
test('journal ignores untrusted mechanical claims, while tracking real encounters and rests', () => {
  const run = { party: [{ recordId: 'hero' }] };
  const journal = projectQuestJournal(run, [{ id: 'fake', sceneRest: {}, text: 'Fake' }, { id: 'rest', serverValidatedMechanics: true, sceneRest: {}, text: 'Rast' }]);
  assert.equal(journal.activities.length, 1); assert.equal(journal.activities[0].id, 'rest');
});
test('an archived adventure excludes earlier and later mechanics from a reused scene', () => {
  const run={party:[],sceneWindows:{scene:{after:10,through:20}}};
  const comments=[5,15,25].map(orderKey=>({id:`post-${orderKey}`,entryId:'scene',orderKey,serverValidatedMechanics:true,sceneRest:{}}));
  assert.deepEqual(projectQuestJournal(run,comments).activities.map(row=>row.id),['post-15']);
  assert.equal(projectQuestJournal(run,comments,{evidenceIds:['post-5']}).activities.length,2);
});

test('journal replays descending scene pages chronologically and preserves the final encounter result', () => {
  const participants = [
    { actorId: 'hero', name: 'Bote', partyId: 'couriers', persistence: { kind: 'character', recordId: 'hero' } },
    { actorId: 'thief', name: 'Dieb', partyId: 'thieves', persistence: { kind: 'creature', recordId: 'thief' } }
  ];
  const comments = [
    { id: 'end', orderKey: 30, serverValidatedMechanics: true, combatEncounter: { encounterId: 'fight', operation: 'end', winningPartyId: 'couriers', participants: [{ ...participants[1], status: 'defeated' }] } },
    { id: 'start', orderKey: 10, serverValidatedMechanics: true, combatEncounter: { encounterId: 'fight', operation: 'start', participants } }
  ];
  const journal = projectQuestJournal({ party: [{ kind: 'character', recordId: 'hero' }] }, comments);
  assert.equal(journal.encounters[0].active, false);
  assert.equal(journal.foes.find(row => row.actorId === 'thief').status, 'defeated');
  assert.deepEqual(journal.activities.map(row => row.id), ['start', 'end']);
  assert.deepEqual(comments.map(row => row.id), ['end', 'start']);
});

test('journal distinguishes a character from an unrelated creature with the same record identifier', () => {
  const comments = [{ id: 'other', serverValidatedMechanics: true, combatEncounter: { encounterId: 'fight', operation: 'start', participants: [
    { actorId: 'same', persistence: { kind: 'creature', recordId: 'same' } },
    { actorId: 'wolf', persistence: { kind: 'creature', recordId: 'wolf' } }
  ] } }];
  const journal = projectQuestJournal({ party: [{ kind: 'character', recordId: 'same' }] }, comments);
  assert.equal(journal.encounters.length, 0); assert.equal(journal.foes.length, 0);
});

test('imported, undone and unlinked scene mechanics never become quest evidence by projection', () => {
  const run = { party: [], links: { scenes: ['scene'] } };
  const comments = [
    { id: 'rest', entryId: 'scene' }, { id: 'import', entryId: 'scene', importedHistoricalMechanics: true },
    { id: 'undone', entryId: 'scene', mechanicalUndone: true }, { id: 'removed', entryId: 'scene', undoneAt: '2026-11-01' },
    { id: 'unlinked', entryId: 'elsewhere' }
  ].map(row => ({ ...row, serverValidatedMechanics: true, sceneRest: {} }));
  assert.deepEqual(projectQuestJournal(run, comments).activities.map(row => row.id), ['rest']);
  assert.deepEqual(projectQuestJournal(run, comments, { evidenceIds: ['import', 'undone'] }).activities.map(row => row.id), ['rest']);
});

test('a scene query error preserves the mounted tracker and later updates, and teardown ignores pending callbacks', async () => {
  const previous = globalThis.document;
  const element = () => ({ children: [], markup: '', querySelector: () => null, addEventListener() {},
    append(child) { this.children.push(child); },
    get innerHTML() { return this.markup + this.children.map(child => child.innerHTML).join(''); },
    set innerHTML(value) { this.markup = value; this.children = []; }
  });
  const root = Object.assign(element(), { isConnected: true, dataset: { moduleId: 'inn', threadId: 'scene' } });
  const scope = { querySelectorAll: () => [root] };
  let next, error, stopped = 0;
  globalThis.document = { createElement: element };
  try {
    mountQuestSceneTrackers(scope, { client: async () => ({ context(_input, onNext, onError) { next = onNext; error = onError; return () => stopped++; } }), readCatalog: async () => ({}) });
    await new Promise(resolve => setImmediate(resolve));
    const run = { id: 'run', title: 'Erster Stand', party: [], links: { scenes: ['scene'] }, status: 'active' };
    next({ runs: [run] }); assert.match(root.innerHTML, /Erster Stand/);
    error(Error('Quelle unterbrochen'));
    next({ runs: [{ ...run, title: 'Aktueller Stand' }] });
    assert.match(root.innerHTML, /Aktueller Stand/); assert.match(root.innerHTML, /nicht verbunden/);
    unmountQuestSceneTrackers(scope); assert.equal(stopped, 1);
    const html = root.innerHTML;
    next({ runs: [{ ...run, title: 'Zu spät' }] }); assert.equal(root.innerHTML, html);
  } finally { unmountQuestSceneTrackers(scope); globalThis.document = previous; }
});
test('a missing run subscription cannot be hidden by a successful board or module update', async () => {
  const store=createQuestStore({quests:[],boards:[],maps:[],modules:[],scenes:[]});let next,error;
  store.connect({subscribe(onNext,onError){next=onNext;error=onError;return()=>{};},watchAccess(){return()=>{};}});
  error(Object.assign(Error('Aktive Durchläufe fehlen'),{source:'active'}));
  await next({source:'modules',modules:[]});assert.equal(store.snapshot().online,false);assert.match(store.snapshot().error,/Durchläufe/);
  await next({source:'active',activeRuns:[]});await next({source:'archive',archivedRuns:[]});await next({source:'quests',quests:[]});
  assert.equal(store.snapshot().online,true);assert.equal(store.snapshot().error,'');store.destroy();
});
test('source store removes deliberately deleted live notices and merges paged runs without duplicates', async () => {
  const boardQuest = { ...quest(), links: { boards: ['board'] } }, store = createQuestStore({ quests: [boardQuest], boards: [{ id: 'board' }], maps: [] }, { mergeBoard: async () => [] });
  let update;
  store.connect({ subscribe(next) { update = next; return () => {}; }, watchAccess(next) { next(null); return () => {}; }, more: async () => ({ records: [{ id: 'run1' }], cursor: null }) });
  await update({ boards: [{ id: 'board', state: { zettel: [] } }], runs: [{ id: 'run1' }], cursor: 'cursor' });
  assert.equal(store.snapshot().quests.length, 0); await store.more(); assert.equal(store.snapshot().runs.length, 1); store.destroy();
});
test('generated catalog contains every registered board and map and actual session thread identifiers', async () => {
  const catalog = JSON.parse(await readFile(new URL('../modules/quests/quest-catalog.json', import.meta.url)));
  assert.equal(catalog.boards.length, 3); assert.ok(catalog.maps.length >= 69); assert.ok(catalog.quests.length >= 15);
  assert.ok(catalog.scenes.some(scene => scene.id.includes('::session:')));
  assert.ok(catalog.quests.some(quest => /Städter/.test(quest.title)));
});
test('the full reward catalogue preserves standard rule versions despite venue-specific display prose', async () => {
  const catalog=JSON.parse(await readFile(new URL('../../Anzeigetafeln/assets/data/notice-reward-catalog.json',import.meta.url)));
  const registry=createItemDefinitionRegistry();
  assert.doesNotThrow(()=>registry.add(catalog.definitions,{current:false}));
  assert.ok(catalog.items.length>=1110);
  const shared=catalog.items.filter(row=>row.definitionRef?.id==='standard:taverne:eintopf-des-tages');
  assert.ok(shared.length>1);
  assert.ok(shared.some(row=>row.description!==registry.get(row.definitionRef).description));
  for(const row of shared) assert.equal(registry.get(row.definitionRef).id,'standard:taverne:eintopf-des-tages');
});
test('the board publisher JSON takes precedence over an obsolete Firebase migration document', async () => {
  let legacyReads=0;const state={zettel:[{id:'published',title:'Aktuell'}]};
  const result=await readQuestBoardSource({id:'board'},{readPublished:async()=>({revision:7,state}),readLegacy:async()=>{legacyReads++;return{data:JSON.stringify({zettel:[{id:'old'}]})};}});
  assert.deepEqual(result.state,state);assert.equal(legacyReads,0);
});
test('a deliberately empty published board never resurrects old Firebase notices', async () => {
  const result=await readQuestBoardSource({id:'board'},{readPublished:async()=>({state:{zettel:[]}}),readLegacy:async()=>{throw Error('must not load');}});
  assert.equal(result.state.zettel.length,0);
});
test('legacy boards decode their actual serialized data field when no published state exists', async () => {
  const result=await readQuestBoardSource({id:'board'},{readPublished:async()=>null,readLegacy:async()=>({data:'{"zettel":[{"id":"legacy"}]}'})});
  assert.equal(result.state.zettel[0].id,'legacy');
});
