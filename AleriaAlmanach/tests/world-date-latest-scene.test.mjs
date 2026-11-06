import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { selectLatestScene, mountLatestSceneSidebar } from '../modules/world-date/world-date-latest-scene.mjs';

function owners() {
  const context = vm.createContext({ console, document: { addEventListener() {} } });
  for (const path of ['core/aleria-calendar.js', 'world-date/world-date-model.js', 'world-date/world-date-scene-default.js',
    'comments/comments-thread.js', 'scene-time/scene-time-state.js', 'comments/comments-routing.js', 'modal/modal-controller.js',
    'module-store/module-section-policy.js', 'scene-transition/scene-transition-state.js']) {
    vm.runInContext(readFileSync(new URL(`../modules/${path}`, import.meta.url), 'utf8'), context);
  }
  return {
    catalog: sections => context.getSceneTransitionCatalog(sections.filter(section => !context.AleriaModuleSectionPolicy.isHidden(section) && !context.AleriaModuleSectionPolicy.isRemoved(section))),
    projection: { calendar: context.AleriaCalendar, resolveStart: context.AleriaSceneDateDefaults.resolve, timeline: context.buildSceneTimeline }
  };
}
const date = day => ({ year: 1740, month: 3, day });
const entry = (id, day, extra = {}) => ({ id, title: id, multipage: true, pages: [{ sessionPage: true, commentThreadKey: 'scene', pageTitle: id, ...(day ? { sessionDateAleria: date(day) } : {}), ...extra }] });
const anchor = (id, seconds, extra = {}) => ({ id, entryId: id, orderKey: 1, ts: { seconds: 10 }, sceneTimeEvent: { presetKey: 'morning', anchorDay: 1, anchorSeconds: seconds, ...extra } });
function history(...records) { return new Map(records); }
function detailEvent(name, detail) { const event = new Event(name); Object.defineProperty(event, 'detail', { value: detail }); return event; }
function view() {
  const root = new EventTarget();
  const nodes = Object.fromEntries(['open', 'title', 'time', 'status'].map(name => [name, { hidden: false, textContent: '' }]));
  root.querySelector = selector => nodes[selector.match(/data-latest-scene-(.+)\]/)[1]];
  root.setAttribute = (key, value) => { root[key] = value; };
  nodes.open.closest = () => nodes.open;
  root.click = () => { const event = new Event('click', { cancelable: true }); Object.defineProperty(event, 'target', { value: nodes.open }); root.dispatchEvent(event); };
  return { root, nodes };
}

test('world date and confirmed scene timeline win over newer real-world posts', () => {
  const { catalog, projection } = owners();
  const scenes = catalog([{ tab: 'Welt', entries: [entry('older-post', 12), entry('recent-post', 10)] }]);
  const comments = history(['older-post::session:scene', [anchor('a', 36000)]], ['recent-post::session:scene', [{ ...anchor('b', 80000), ts: { seconds: 999999999 } }]]);
  const before = JSON.stringify([...comments]);
  assert.equal(selectLatestScene(scenes, comments, projection).threadId, 'older-post::session:scene');
  assert.equal(JSON.stringify([...comments]), before);
});

test('existing visibility and comment routing exclude hidden and noninteractive scenes', () => {
  const { catalog, projection } = owners();
  const scenes = catalog([{ tab: 'Welt', entries: [entry('play', 9), entry('quest', 35, { questFilePage: true }), entry('disabled', 35, { enableComments: false })] },
    { tab: 'Test', entries: [entry('hidden', 36)] }, { tab: 'Familien', entries: [entry('removed', 36)] }]);
  assert.deepEqual(Array.from(scenes, scene => scene.endpoint.threadId), ['play::session:scene']);
  assert.equal(selectLatestScene(scenes, new Map(), projection).threadId, 'play::session:scene');
});

test('missing dates never gain today; stored comment start date is accepted without writes', () => {
  const { catalog, projection } = owners();
  const scenes = catalog([{ entries: [entry('undated'), entry('dated', 9), entry('comment-date')] }]);
  const histories = history(['undated::session:scene', [anchor('a', 86399)]], ['comment-date::session:scene', [{ ...anchor('b', 1), sceneStartDateAleria: date(11) }]]);
  assert.equal(selectLatestScene(scenes, histories, projection).threadId, 'comment-date::session:scene');
  assert.equal(scenes[0].page.sessionDateAleria, undefined);
  assert.equal(selectLatestScene([scenes[0]], histories, projection), null);
});

test('confirmed time advances through midnight and uses the final clock rather than an old maximum', () => {
  const { catalog, projection } = owners();
  const scenes = catalog([{ entries: [entry('night', 9), entry('next-day', 10)] }]);
  const histories = history(['night::session:scene', [anchor('a', 86398), { id: 'b', orderKey: 2, text: 'Ein Schritt.' }]], ['next-day::session:scene', [anchor('c', 2)]]);
  const selected = selectLatestScene(scenes, histories, projection);
  assert.equal(selected.threadId, 'night::session:scene');
  assert.equal(selected.timeSeconds, 3);
  histories.set('night::session:scene', [anchor('a', 80000), { ...anchor('b', 1), orderKey: 2 }]);
  assert.equal(selectLatestScene(scenes, histories, projection).threadId, 'next-day::session:scene');
});

test('stable ties use the thread ID and unconfirmed local comments cannot advance time', () => {
  const { catalog, projection } = owners();
  const scenes = catalog([{ entries: [entry('z', 9), entry('a', 9)] }]);
  const histories = history(['z::session:scene', [anchor('z', 10)]], ['a::session:scene', [anchor('a', 10), { ...anchor('pending', 20, { calendarDay: 30 }), localOnly: true }]]);
  assert.equal(selectLatestScene(scenes, histories, projection).threadId, 'a::session:scene');
  assert.equal(selectLatestScene([...scenes].reverse(), histories, projection).threadId, 'a::session:scene');
});

test('one complete background read, race-safe thread events, existing route and visibility revalidation', async () => {
  const { catalog, projection } = owners();
  let sections = [{ entries: [entry('old', 9), entry('new', 10)] }], finish, reads = 0;
  const events = new EventTarget(), windowEvents = new EventTarget(), opened = [], { root, nodes } = view();
  const api = mountLatestSceneSidebar(root, { getCatalog: () => catalog(sections), ...projection, events, windowEvents,
    loadComments: () => { reads++; return new Promise(resolve => { finish = resolve; }); }, openScene: id => opened.push(id) });
  assert.equal(nodes.open.hidden, true);
  assert.match(nodes.status.textContent, /geladen/);
  await Promise.resolve();
  windowEvents.dispatchEvent(new Event('fb-ready'));
  events.dispatchEvent(detailEvent('aleria:comments-updated', { threadId: 'old::session:scene', comments: [anchor('event', 10, { calendarDay: 3 })] }));
  finish([anchor('new::session:scene', 1)]);
  assert.equal(await api.ready, true);
  assert.equal(nodes.title.textContent, 'old');
  assert.equal(reads, 1);
  root.click(); assert.deepEqual(opened, ['old::session:scene']);
  events.dispatchEvent(detailEvent('aleria:comments-updated', { threadId: 'new::session:scene', comments: [anchor('event2', 10, { calendarDay: 4 })] }));
  assert.equal(nodes.title.textContent, 'new');
  events.dispatchEvent(detailEvent('aleria:comments-updated', { threadId: 'old::session:scene', comments: [{ ...anchor('local', 10, { calendarDay: 30 }), pending: true }] }));
  assert.equal(nodes.title.textContent, 'new');
  events.dispatchEvent(detailEvent('aleria:comments-updated', { threadId: 'old::session:scene', comments: [anchor('confirmed', 10, { calendarDay: 6 }), { ...anchor('local', 10, { calendarDay: 30 }), localOnly: true }] }));
  assert.equal(nodes.title.textContent, 'old');
  sections = [];
  root.click(); assert.deepEqual(opened, ['old::session:scene']);
  assert.equal(nodes.open.hidden, true);
  windowEvents.dispatchEvent(new Event('fb-ready'));
  assert.equal(reads, 1);
  api.destroy();
});

test('failed full snapshot does not present a partial maximum', async () => {
  const { catalog, projection } = owners(), { root, nodes } = view(), events = new EventTarget();
  const api = mountLatestSceneSidebar(root, { ...projection, events, windowEvents: new EventTarget(), getCatalog: () => catalog([{ entries: [entry('known', 9)] }]), loadComments: async () => { throw Error('offline'); } });
  events.dispatchEvent(detailEvent('aleria:comments-updated', { threadId: 'known::session:scene', comments: [anchor('a', 10)] }));
  assert.equal(await api.ready, false);
  assert.equal(nodes.open.hidden, true);
  assert.match(nodes.status.textContent, /nicht verfügbar/);
  api.destroy();
});

test('existing recovery retries a failed initial read and stops after its first success', async () => {
  const { catalog, projection } = owners(), { root, nodes } = view(), events = new EventTarget();
  let reads = 0;
  const api = mountLatestSceneSidebar(root, { ...projection, events, windowEvents: new EventTarget(), getCatalog: () => catalog([{ entries: [entry('known', 9)] }]),
    loadComments: async () => { if (++reads === 1) throw Error('offline'); return []; } });
  assert.equal(await api.ready, false);
  events.dispatchEvent(detailEvent('aleria:comment-backend-reconnect', { sources: ['comments'] }));
  assert.equal(reads, 1);
  events.dispatchEvent(detailEvent('aleria:comment-backend-reconnect', { sources: ['latest-scene'] }));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(nodes.title.textContent, 'known');
  assert.equal(reads, 2);
  events.dispatchEvent(detailEvent('aleria:comment-backend-reconnect', { sources: ['latest-scene'] }));
  assert.equal(reads, 2);
  api.destroy();
});

test('server-only full read does not change the existing export gateway default', async () => {
  const source = readFileSync(new URL('../firebase.js', import.meta.url), 'utf8');
  const body = source.match(/async loadAllComments\(options = \{\}\) \{([\s\S]*?)\n      \},/)[1];
  const reads = [], records = [{ id: 'one', data: () => ({ entryId: 'scene' }) }];
  const load = new Function('getDocs', 'getDocsFromServer', 'collection', 'db', 'notifyAppStatus', 'getFirebaseErrorMessage',
    `return async function(options = {}) {${body}}`)(async path => { reads.push(['cached', path]); return { docs: records }; },
    async path => { reads.push(['server', path]); return { docs: records }; }, (_db, name) => name, {}, assert.fail, assert.fail);
  assert.deepEqual(await load(), [{ id: 'one', entryId: 'scene' }]);
  assert.deepEqual(await load({ serverOnly: true }), [{ id: 'one', entryId: 'scene' }]);
  assert.deepEqual(reads, [['cached', 'comments'], ['server', 'comments']]);
});
