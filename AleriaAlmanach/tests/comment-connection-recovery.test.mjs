import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const sources = await Promise.all(['comments-backend.js', 'comments-thread.js', 'comments-turn.js'].map(async name => ({
  name,
  text: await readFile(new URL(`../modules/comments/${name}`, import.meta.url), 'utf8')
})));
const sidebarSource = await readFile(new URL('../modules/sidebar/sidebar-feed.js', import.meta.url), 'utf8');
const firebaseSource = await readFile(new URL('../firebase.js', import.meta.url), 'utf8');

async function settle() {
  for (let index = 0; index < 12; index++) await Promise.resolve();
}

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, listener, options = {}) {
      const entries = listeners.get(type) || [];
      entries.push({ listener, once: options.once === true });
      listeners.set(type, entries);
    },
    removeEventListener(type, listener) {
      listeners.set(type, (listeners.get(type) || []).filter(entry => entry.listener !== listener));
    },
    dispatchEvent(event) {
      for (const entry of [...(listeners.get(event.type) || [])]) {
        if (entry.once) this.removeEventListener(event.type, entry.listener);
        entry.listener(event);
      }
      return true;
    },
    listenerCount(type) { return (listeners.get(type) || []).length; }
  };
}

function controlledClock() {
  let now = 0, nextId = 1;
  const tasks = new Map();
  return {
    now: () => now,
    setTimeout(callback, delay = 0) {
      const id = nextId++;
      tasks.set(id, { callback, due: now + Math.max(0, Number(delay) || 0) });
      return id;
    },
    clearTimeout(id) { tasks.delete(id); },
    get pending() { return tasks.size; },
    async advance(milliseconds) {
      const target = now + milliseconds;
      for (let executions = 0; executions < 1000; executions++) {
        const next = [...tasks].filter(([, task]) => task.due <= target).sort((a, b) => a[1].due - b[1].due)[0];
        if (!next) { now = target; await settle(); return; }
        now = next[1].due;
        tasks.delete(next[0]);
        next[1].callback();
        await settle();
      }
      throw Error('A timer loop exceeded the test safety bound.');
    },
    async next() {
      const due = Math.min(...[...tasks.values()].map(task => task.due));
      if (Number.isFinite(due)) await this.advance(due - now);
    }
  };
}

function createHarness({ online = true, localComments = {}, sidebar = false } = {}) {
  const clock = controlledClock(), window = eventTarget(), document = eventTarget();
  const storage = new Map([['aleria-local-comments-v1', JSON.stringify(localComments)]]);
  const notices = [], renders = [], turns = [], comments = [], turnSubscriptions = [], recentCalls = [];
  const feed = sidebar ? { innerHTML: '', isConnected: true } : null;
  let readRecent = async () => [];
  const originalStorage = storage.get('aleria-local-comments-v1');
  let currentThread = 'scene-a', opened = true, remoteWrites = 0;
  const scroll = {
    dataset: { commentThreadId: currentThread },
    isConnected: true,
    closest: selector => selector === '#modal-overlay' ? modal : null,
    getClientRects: () => opened ? [{}] : []
  };
  const modal = { classList: { contains: name => name === 'active' && opened }, querySelector: () => scroll };
  document.getElementById = id => id === 'modal-overlay' ? modal : id === 'sidebar-feed' ? feed : null;
  document.querySelectorAll = () => [];
  document.querySelector = selector => {
    if (!selector.includes('.comments-scroll')) return null;
    const thread = selector.match(/data-comment-thread-id="([^"]+)"/)?.[1];
    return !thread || thread === scroll.dataset.commentThreadId ? scroll : null;
  };
  const navigator = { onLine: online };
  Object.assign(window, { document, navigator, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout });
  const remote = {
    subscribeComments(threadId, next, error) {
      const subscription = { threadId, next, error, stops: 0 };
      comments.push(subscription);
      return () => subscription.stops++;
    },
    subscribeCommentTurn(threadId, next, error) {
      const subscription = { threadId, next, error, stops: 0 };
      turnSubscriptions.push(subscription);
      return () => subscription.stops++;
    },
    loadRecentComments(take, options) {
      recentCalls.push({ take, options });
      return readRecent(take, options);
    },
    addComment() { remoteWrites++; throw Error('No test may publish a comment.'); },
    saveCommentTurn() { remoteWrites++; throw Error('No test may publish a turn.'); }
  };
  const context = vm.createContext({
    window, document, navigator,
    setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
    Date: class extends Date { static now() { return clock.now(); } },
    console: { log() {}, warn() {}, error() {} },
    Event: class { constructor(type) { this.type = type; } },
    CustomEvent: class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    showAppStatus: message => notices.push(message),
    showFriendlyAppError() {}, updateFirebaseSyncStatus() {},
    getCurrentCommentThread: () => currentThread ? { threadId: currentThread } : null,
    getCurrentCommentThreadId: () => currentThread || '',
    getActiveCommentsScroll: () => scroll,
    getValidSections: () => [],
    setCommentPageTarget() {}, applyCommentToolsVisibility() {},
    requestAnimationFrame: callback => callback()
  });
  for (const source of sources) vm.runInContext(source.text, context, { filename: source.name });
  if (sidebar) {
    vm.runInContext(sidebarSource, context, { filename: 'sidebar-feed.js' });
    context.buildSidebarFeedItem = comment => `<p>${comment.id}:${comment.text}</p>`;
  }
  context.renderCommentsToScroll = (target, values) => renders.push({ threadId: target.dataset.commentThreadId, comments: JSON.parse(JSON.stringify(values)) });
  context.renderCommentTurnState = (threadId, state) => turns.push({ threadId, state: JSON.parse(JSON.stringify(state)) });
  return {
    context, clock, window, document, navigator, remote, comments, turnSubscriptions, renders, turns, notices, storage, originalStorage, feed, recentCalls,
    recentReader(reader) { readRecent = reader; },
    get remoteWrites() { return remoteWrites; },
    cache(threadId = currentThread) { return JSON.parse(vm.runInContext(`JSON.stringify(_commentCache[${JSON.stringify(threadId)}] || [])`, context)); },
    activate(threadId) { currentThread = threadId; opened = true; scroll.isConnected = true; },
    close() { opened = false; currentThread = null; context.stopCommentLiveUpdates(); },
    event(type) { window.dispatchEvent({ type }); },
    async connect() {
      window._fb = remote;
      await context.loadCommentsIntoPage(currentThread);
      await settle();
    }
  };
}

test('a short readiness timeout does not pin later reads to the local backend', async () => {
  const harness = createHarness();
  const initialListeners = harness.window.listenerCount('fb-ready');
  const waiting = harness.context.getCommentBackend({ timeoutMs: 20 });
  await harness.clock.advance(20);
  assert.equal((await waiting)._localFallback, true);
  assert.equal(harness.window.listenerCount('fb-ready'), initialListeners, 'the expired readiness listener is removed');
  harness.window._fb = harness.remote;
  assert.equal(await harness.context.getCommentBackend(), harness.remote);
});

test('successful readiness removes its temporary listener and timeout', async () => {
  const harness = createHarness();
  const initialListeners = harness.window.listenerCount('fb-ready');
  const waiting = harness.context.getCommentBackend({ timeoutMs: 100 });
  assert.equal(harness.window.listenerCount('fb-ready'), initialListeners + 1);
  harness.window._fb = harness.remote;
  harness.event('fb-ready');
  assert.equal(await waiting, harness.remote);
  assert.equal(harness.window.listenerCount('fb-ready'), initialListeners);
  assert.equal(harness.clock.pending, 0, 'readiness must not leave the timeout running');
});

test('late readiness coalesces connection events and retains local-only posts without publishing them', async () => {
  const localPost = { id: 'local-one', text: 'Unpublished local post', localOnly: true, orderKey: 1 };
  const harness = createHarness({ localComments: { 'scene-a': [localPost] } });
  const firstLoad = harness.context.loadCommentsIntoPage('scene-a');
  await harness.clock.advance(4500);
  await firstLoad;
  harness.window._fb = harness.remote;
  harness.event('fb-ready');
  harness.event('online');
  await harness.clock.advance(0);
  assert.equal(harness.comments.length, 1);
  assert.equal(harness.turnSubscriptions.length, 1);
  harness.comments[0].next([{ id: 'remote-one', text: 'Online post', orderKey: 2 }]);
  harness.turnSubscriptions[0].next({ current: 'patrick' });
  await settle();
  assert.deepEqual(harness.cache().map(comment => comment.id), ['local-one', 'remote-one']);
  assert.equal(harness.storage.get('aleria-local-comments-v1'), harness.originalStorage);
  assert.equal(harness.remoteWrites, 0);
  assert.equal(harness.clock.pending, 0);
});

test('late readiness reuses a remote subscription just established by a waiting reader', async () => {
  const harness = createHarness();
  const sidebarBackend = harness.context.getCommentBackend({ timeoutMs: 20 });
  const reader = harness.context.loadCommentsIntoPage('scene-a');
  await harness.clock.advance(20);
  assert.equal((await sidebarBackend)._localFallback, true);
  harness.window._fb = harness.remote;
  harness.event('fb-ready');
  await reader;
  await settle();
  assert.equal(harness.comments.length, 1);
  await harness.clock.advance(0);
  assert.equal(harness.comments.length, 1, 'the queued recovery must reuse the newly established live read');
});

test('an initial turn snapshot cannot cancel recovery of comments still in local mode', async () => {
  const harness = createHarness();
  const firstLoad = harness.context.loadCommentsIntoPage('scene-a');
  await harness.clock.advance(4500);
  await firstLoad;
  const subscribeTurn = harness.remote.subscribeCommentTurn;
  harness.remote.subscribeCommentTurn = (threadId, next, error) => {
    const stop = subscribeTurn(threadId, next, error);
    Promise.resolve().then(() => next({ current: 'patrick' }));
    return stop;
  };
  harness.window._fb = harness.remote;
  harness.event('fb-ready');
  await settle();
  assert.equal(harness.turnSubscriptions.length, 1);
  assert.equal(harness.comments.length, 0, 'the initial turn snapshot arrives before the queued reconnect');
  await harness.clock.advance(0);
  assert.equal(harness.comments.length, 1, 'turn readiness must not acknowledge the pending comment read');
  harness.comments[0].next([{ id: 'online', text: 'Online history' }]);
  await settle();
  assert.equal(harness.cache()[0].id, 'online');
  assert.equal(harness.clock.pending, 0);
});

test('a transient listener error retains visible history and recovers without a page reload', async () => {
  const harness = createHarness();
  await harness.connect();
  harness.comments[0].next([{ id: 'one', text: 'Visible history' }]);
  await harness.comments[0].error(Object.assign(Error('Temporary connection failure'), { code: 'unavailable' }));
  await settle();
  assert.equal(harness.cache()[0].text, 'Visible history');
  assert.equal(harness.comments[0].stops, 1);
  await harness.clock.next();
  assert.equal(harness.comments.length, 2);
  harness.comments[1].next([{ id: 'one', text: 'Updated online history' }]);
  harness.turnSubscriptions.at(-1).next({ current: 'erdi' });
  await settle();
  assert.equal(harness.cache()[0].text, 'Updated online history');
  assert.equal(harness.clock.pending, 0);
  assert.equal(harness.remoteWrites, 0);
});

test('a waiting load cannot subscribe after a scene switch or dialog closure', async t => {
  for (const action of ['switch', 'close']) {
    await t.test(action, async () => {
      const harness = createHarness();
      let release;
      const waitingBackend = new Promise(resolve => { release = resolve; });
      harness.context.getCommentBackend = () => waitingBackend;
      const oldLoad = harness.context.loadCommentsIntoPage('scene-a');
      let newLoad;
      if (action === 'switch') {
        harness.activate('scene-b');
        newLoad = harness.context.loadCommentsIntoPage('scene-b');
      } else harness.close();
      release(harness.remote);
      await Promise.all([oldLoad, newLoad]);
      await settle();
      assert.deepEqual(harness.comments.map(subscription => subscription.threadId), action === 'switch' ? ['scene-b'] : []);
    });
  }
});

test('stale success and failure callbacks cannot disturb the newly active scene', async () => {
  const harness = createHarness();
  await harness.connect();
  const oldSubscription = harness.comments[0];
  harness.activate('scene-b');
  await harness.context.loadCommentsIntoPage('scene-b');
  await settle();
  const currentSubscription = harness.comments.at(-1), currentTurn = harness.turnSubscriptions.at(-1);
  currentSubscription.next([{ id: 'current', text: 'New scene history' }]);
  const noticeCount = harness.notices.length;
  oldSubscription.next([{ id: 'stale', text: 'Old scene history' }]);
  await oldSubscription.error(Object.assign(Error('Old connection error'), { code: 'unavailable' }));
  await settle();
  assert.equal(harness.cache('scene-b')[0].id, 'current');
  assert.equal(currentSubscription.stops, 0);
  assert.equal(currentTurn.stops, 0);
  assert.equal(harness.notices.length, noticeCount);
  assert.equal(harness.clock.pending, 0);
});

test('a delayed local fallback cannot replace a scene opened while that read was pending', async () => {
  const harness = createHarness();
  await harness.connect();
  harness.comments[0].next([{ id: 'original', text: 'Original scene' }]);
  let release;
  const fallbackRead = new Promise(resolve => { release = resolve; });
  harness.context.getLocalCommentBackend = () => ({ loadComments: () => fallbackRead });
  const oldFailure = harness.comments[0].error(Object.assign(Error('Temporary failure'), { code: 'unavailable' }));
  harness.activate('scene-b');
  await harness.context.loadCommentsIntoPage('scene-b');
  await settle();
  harness.comments.at(-1).next([{ id: 'current', text: 'Current scene' }]);
  const renderCount = harness.renders.length;
  release([{ id: 'old-local', text: 'Old scene local post', localOnly: true }]);
  await oldFailure;
  await settle();
  assert.equal(harness.cache('scene-b')[0].id, 'current');
  assert.equal(harness.renders.length, renderCount);
});

test('a failed turn listener is released and replaced while stale turn callbacks are ignored', async () => {
  const harness = createHarness();
  await harness.connect();
  harness.comments[0].next([{ id: 'one' }]);
  const commentReads = harness.comments.length;
  const oldTurn = harness.turnSubscriptions[0];
  oldTurn.next({ current: 'patrick' });
  await oldTurn.error(Object.assign(Error('Temporary turn failure'), { code: 'unavailable' }));
  await settle();
  assert.equal(oldTurn.stops, 1);
  assert.equal(harness.turns.at(-1).state.current, 'patrick', 'a transient outage must not erase the known turn');
  await harness.clock.next();
  assert.equal(harness.turnSubscriptions.length, 2);
  assert.equal(harness.comments.length, commentReads, 'a turn-only outage must reuse healthy comment subscriptions');
  harness.comments.at(-1).next([{ id: 'one' }]);
  harness.turnSubscriptions[1].next({ current: 'erdi' });
  oldTurn.next({ current: 'ended' });
  await settle();
  assert.equal(harness.turns.at(-1).state.current, 'erdi');
  assert.equal(harness.clock.pending, 0);
});

test('turn callbacks ignore a scene that is no longer the current navigation context', async () => {
  const harness = createHarness();
  await harness.connect();
  const oldTurn = harness.turnSubscriptions[0];
  oldTurn.next({ current: 'patrick' });
  harness.activate('scene-b');
  const renderCount = harness.turns.length, noticeCount = harness.notices.length;
  oldTurn.next({ current: 'ended' });
  await oldTurn.error(Object.assign(Error('Old scene failed during navigation'), { code: 'unavailable' }));
  await settle();
  assert.equal(harness.turns.length, renderCount);
  assert.equal(harness.notices.length, noticeCount);
});

test('permission failures do not cause a background retry loop', async () => {
  const harness = createHarness();
  await harness.connect();
  harness.comments[0].next([{ id: 'one' }]);
  await harness.comments[0].error(Object.assign(Error('Permission denied'), { code: 'permission-denied' }));
  await settle();
  await harness.clock.advance(300000);
  assert.equal(harness.comments.length, 1);
  assert.equal(harness.clock.pending, 0);
});

test('offline recovery waits for online and persistent failures have a bounded retry budget', async () => {
  const harness = createHarness();
  await harness.connect();
  harness.comments[0].next([{ id: 'one' }]);
  harness.navigator.onLine = false;
  await harness.comments[0].error(Object.assign(Error('Offline'), { code: 'unavailable' }));
  await settle();
  await harness.clock.advance(300000);
  assert.equal(harness.comments.length, 1);
  harness.navigator.onLine = true;
  harness.event('online');
  await harness.clock.next();
  assert.equal(harness.comments.length, 2);
  for (let attempt = 0; attempt < 15; attempt++) {
    await harness.comments.at(-1).error(Object.assign(Error('Still unavailable'), { code: 'unavailable' }));
    await settle();
    if (!harness.clock.pending) break;
    await harness.clock.next();
  }
  assert.equal(harness.clock.pending, 0, 'persistent failure must eventually stop automatic retries');
  assert(harness.comments.length <= 8, 'retry attempts must remain bounded');
  assert.equal(harness.remoteWrites, 0);
});

test('terminal comment failure stays isolated while a recovered turn receives a fresh retry budget', async () => {
  const harness = createHarness();
  await harness.connect();
  harness.comments[0].next([{ id: 'one' }]);
  harness.turnSubscriptions[0].next({ current: 'patrick' });
  await harness.comments[0].error(Object.assign(Error('Permission denied'), { code: 'permission-denied' }));
  await settle();
  await harness.context.loadCommentTurnIntoPage('scene-a');
  for (let attempt = 0; attempt < 8; attempt++) {
    await harness.turnSubscriptions.at(-1).error(Object.assign(Error('Temporary turn failure'), { code: 'unavailable' }));
    await settle();
    if (!harness.clock.pending) break;
    await harness.clock.next();
  }
  assert.equal(harness.clock.pending, 0, 'the initial turn retry budget is exhausted');
  assert.equal(harness.comments.length, 1, 'terminal comments must not be retried because turns are transient');
  await harness.context.loadCommentTurnIntoPage('scene-a');
  harness.turnSubscriptions.at(-1).next({ current: 'erdi' });
  await settle();
  await harness.turnSubscriptions.at(-1).error(Object.assign(Error('A later independent outage'), { code: 'unavailable' }));
  await settle();
  assert.equal(harness.clock.pending, 1, 'a successful turn read resets its budget even while terminal comments remain pending');
  await harness.clock.next();
  assert.equal(harness.comments.length, 1);
});

test('terminal turn failure is not retried when transient comments reconnect', async () => {
  const harness = createHarness();
  await harness.connect();
  harness.comments[0].next([{ id: 'one', text: 'Visible history' }]);
  harness.turnSubscriptions[0].next({ current: 'patrick' });
  await harness.turnSubscriptions[0].error(Object.assign(Error('Turn permission denied'), { code: 'permission-denied' }));
  await settle();
  await harness.comments[0].error(Object.assign(Error('Comments temporarily unavailable'), { code: 'unavailable' }));
  await settle();
  await harness.clock.next();
  assert.equal(harness.comments.length, 2, 'transient comment reads are reconnected');
  assert.equal(harness.turnSubscriptions.length, 1, 'comment recovery must not indirectly retry the terminal turn read');
  harness.comments[1].next([{ id: 'one', text: 'Recovered history' }]);
  await settle();
  assert.equal(harness.cache()[0].text, 'Recovered history');
  assert.equal(harness.clock.pending, 0);
});

test('stale sidebar responses and failures cannot replace a newer result or acknowledge its connection', async t => {
  for (const staleOutcome of ['response', 'failure']) {
    await t.test(staleOutcome, async () => {
      const harness = createHarness({ sidebar: true });
      harness.window._fb = harness.remote;
      const deferred = [];
      harness.recentReader(() => new Promise((resolve, reject) => deferred.push({ resolve, reject })));
      const acknowledgements = [];
      harness.document.addEventListener('aleria:comment-backend-connected', event => acknowledgements.push(event.detail.source));
      const firstLoad = harness.context.loadSidebarFeed();
      await settle();
      const secondLoad = harness.context.loadSidebarFeed();
      await settle();
      assert.equal(deferred.length, 2);
      deferred[1].resolve([{ id: 'fresh', text: 'New activity' }]);
      await secondLoad;
      assert.match(harness.feed.innerHTML, /fresh:New activity/);
      if (staleOutcome === 'response') deferred[0].resolve([{ id: 'stale', text: 'Old activity' }]);
      else deferred[0].reject(Object.assign(Error('Stale request failed'), { code: 'unavailable' }));
      await firstLoad;
      assert.match(harness.feed.innerHTML, /fresh:New activity/);
      assert.deepEqual(acknowledgements, ['sidebar']);
      assert.equal(harness.notices.length, 0);
      assert.equal(harness.clock.pending, 0);
      assert(harness.recentCalls.every(call => call.options.throwOnError === true));
    });
  }
});

test('a transient strict sidebar failure retries only the sidebar and acknowledges successful recovery', async () => {
  const harness = createHarness({ sidebar: true });
  harness.window._fb = harness.remote;
  let reads = 0;
  harness.recentReader(async () => {
    if (++reads === 1) throw Object.assign(Error('Sidebar temporarily unavailable'), { code: 'unavailable' });
    return [{ id: 'restored', text: 'Activity restored' }];
  });
  const acknowledgements = [];
  harness.document.addEventListener('aleria:comment-backend-connected', event => acknowledgements.push(event.detail.source));
  await harness.context.loadSidebarFeed();
  assert.match(harness.feed.innerHTML, /Konnte nicht laden/);
  assert.equal(acknowledgements.length, 0);
  await harness.clock.next();
  assert.match(harness.feed.innerHTML, /restored:Activity restored/);
  assert.deepEqual(acknowledgements, ['sidebar']);
  assert.equal(harness.recentCalls.length, 2);
  assert.equal(harness.comments.length, 0);
  assert.equal(harness.turnSubscriptions.length, 0);
  assert.equal(harness.clock.pending, 0);
  assert.equal(harness.remoteWrites, 0);
});

function recentCommentReader({ activityResult = null, activityError = null, readError = null, sdkError = null } = {}) {
  const start = firebaseSource.indexOf('      async loadRecentComments(');
  const end = firebaseSource.indexOf('      async loadAllComments(', start);
  assert(start >= 0 && end > start, 'the real Firebase activity method must be present');
  const method = firebaseSource.slice(start, end).trim().replace(/,\s*$/, '');
  const isolatedMethod = method.replace(/await import\(\s*["']https:\/\/www\.gstatic\.com\/firebasejs\/[^"']+["']\s*\)/, 'await sdkImport()');
  assert.notEqual(isolatedMethod, method, 'replace only the remote SDK import; execute the actual method body');
  let fallbackReads = 0;
  const context = vm.createContext({
    console: { warn() {}, error() {} }, db: {},
    commentActivity: { async recent() { if (activityError) throw activityError; return activityResult; } },
    async sdkImport() {
      if (sdkError) throw sdkError;
      return {
        collection: (_db, name) => name,
        async getDocs() {
          fallbackReads++;
          if (readError) throw readError;
          return { docs: [{ id: 'one', data: () => ({ text: 'Legacy history' }) }] };
        }
      };
    },
    sortCommentsByRecentActivity: comments => comments,
    notifyAppStatus() {}, getFirebaseErrorMessage: (_error, fallback) => fallback
  });
  const backend = vm.runInContext(`({ ${isolatedMethod} })`, context);
  return { read: backend.loadRecentComments.bind(backend), get fallbackReads() { return fallbackReads; } };
}

test('Firebase recent-comment reads keep legacy empty-on-error behavior while strict callers receive the real error', async () => {
  const error = Object.assign(Error('Firestore unavailable'), { code: 'unavailable' });
  const reader = recentCommentReader({ activityError: error, readError: error });
  assert.equal((await reader.read(30)).length, 0);
  await assert.rejects(reader.read(30, { throwOnError: true }), actual => actual === error);
  assert.equal(reader.fallbackReads, 2);
});

test('strict recent-comment reads accept a genuine empty index and recover through the existing legacy reader', async () => {
  const empty = recentCommentReader({ activityResult: [] });
  assert.equal((await empty.read(30, { throwOnError: true })).length, 0);
  assert.equal(empty.fallbackReads, 0);
  const fallback = recentCommentReader({ activityError: Error('Index unavailable') });
  assert.equal((await fallback.read(30, { throwOnError: true }))[0].id, 'one');
  assert.equal(fallback.fallbackReads, 1);
  const sdkError = Error('SDK unavailable');
  await assert.rejects(recentCommentReader({ sdkError }).read(30, { throwOnError: true }), actual => actual === sdkError);
});
