import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { buildSceneBackupFiles, sceneBackupDirectory } from '../src/backup/scene-backup-format.js';
import { createSceneBackupGitHub } from '../src/backup/scene-backup-github.js';
import { endSceneSessionOperation, processSceneBackupJob } from '../src/backup/scene-backup-jobs.js';

const threadId = 'hearing::session:hearing-main';
const modulePayload = { type: 'aleria-module', version: 2, section: { key: 'play', tab: 'Play' }, entry: {
  id: 'hearing', title: 'Die Anhörung', pages: [{ sessionPage: true, commentThreadKey: 'hearing-main', pageTitle: 'Ratssaal' }]
} };
const request = () => ({ auth: { uid: 'editor', token: { aleriaRole: 'editor' } }, data: { threadId, modulePayload } });

function fakeDatabase(initial = {}) {
  const records = new Map(Object.entries(initial));
  function snapshot(path) {
    return { id: path.split('/').at(-1), exists: records.has(path), data: () => records.get(path), readTime: { toDate: () => new Date('2026-10-12T12:00:01.000Z') } };
  }
  function collection(name, filters = []) {
    return {
      name, filters,
      doc: id => ({ path: `${name}/${id}` }),
      where: (field, op, value) => collection(name, [...filters, { field, op, value }])
    };
  }
  const database = {
    records, collection, doc: path => ({ path }),
    async runTransaction(callback) {
      const pending = [];
      const result = await callback({
        async get(ref) {
          if (ref.path) return snapshot(ref.path);
          const docs = [...records.keys()].filter(path => path.startsWith(`${ref.name}/`)).filter(path => ref.filters.every(({ field, op, value }) => {
            const actual = typeof field === 'string' ? records.get(path)[field] : path.split('/').at(-1);
            return op === '==' ? actual === value : op === '>=' ? actual >= value : actual < value;
          })).map(snapshot);
          return { docs };
        },
        create(ref, value) { assert(!records.has(ref.path)); pending.push(() => records.set(ref.path, value)); },
        set(ref, value, options) { pending.push(() => records.set(ref.path, options?.merge ? { ...records.get(ref.path), ...value } : value)); },
        update(ref, value) { assert(records.has(ref.path)); pending.push(() => records.set(ref.path, { ...records.get(ref.path), ...value })); }
      });
      pending.forEach(write => write());
      return result;
    }
  };
  return database;
}

function fakeBucket() {
  const objects = new Map();
  return { objects, file: path => ({
    async download() { if (!objects.has(path)) throw Object.assign(new Error('missing'), { code: 404 }); return [objects.get(path)]; },
    async save(bytes) { if (objects.has(path)) throw Object.assign(new Error('exists'), { code: 412 }); objects.set(path, bytes); }
  }) };
}

test('export preserves mechanical data, old threads and comment identity without delete credentials', () => {
  const mechanics = { resolutionId: 'roll-1', damage: 17, criticalRoll: 20 };
  const comments = [
    { id: 'second', entryId: threadId, text: 'Antwort', orderKey: 2, combatResolution: mechanics, createdBy: 'private', deleteCode: 'secret', deleteCodeHash: 'hash' },
    { id: 'first', entryId: 'hearing::session:old-page', text: 'Früher', orderKey: 1 },
    { id: 'foreign', entryId: 'other::session:0', text: 'Fremde Szene' }
  ];
  const original = structuredClone(comments);
  const snapshot = buildSceneBackupFiles({ modulePayload, comments, turns: [], threadId, backupId: 'backup', requestedAt: '2026-10-12T12:00:00Z', capturedAt: '2026-10-12T12:00:01Z', moduleSource: 'browser-export' });
  const exported = JSON.parse(snapshot.files.find(file => file.path === 'comments.json').content);
  assert.deepEqual(exported.comments.map(comment => comment.id), ['first', 'second']);
  assert.deepEqual(exported.comments[1].combatResolution, mechanics);
  assert.equal(exported.summary.commentCount, 2);
  assert(exported.threads.every(thread => !Object.hasOwn(thread, 'comments')));
  assert.deepEqual(exported.comments.map(comment => comment.threadOrder), [1, 1]);
  assert(exported.threads.some(thread => thread.threadId.endsWith('old-page')));
  for (const key of ['createdBy', 'deleteCode', 'deleteCodeHash']) assert(!Object.hasOwn(exported.comments[1], key));
  const manifest = JSON.parse(snapshot.files.find(file => file.path === 'manifest.json').content);
  for (const file of manifest.files) assert.equal(file.sha256, createHash('sha256').update(snapshot.files.find(item => item.path === file.path).content).digest('hex'));
  assert.deepEqual(comments, original);
});

test('backup paths cannot escape their root or collide after slug normalization', () => {
  const first = sceneBackupDirectory('../../a?b', 'id', '2026-10-12T12:00:00Z');
  const second = sceneBackupDirectory('a-b', 'id', '2026-10-12T12:00:00Z');
  assert(first.startsWith('AleriaAlmanach/backups/scenes/'));
  assert(!first.includes('..'));
  assert.notEqual(first, second);
});

test('old timestamp-only comments retain their chronological order without changing stored timestamps', () => {
  const snapshot = buildSceneBackupFiles({ modulePayload, comments: [
    { id: 'late', entryId: threadId, ts: { seconds: 100, nanoseconds: 0 }, text: 'Später' },
    { id: 'early', entryId: threadId, ts: { _seconds: 50, _nanoseconds: 0 }, text: 'Früher' }
  ], turns: [], threadId, backupId: 'one', requestedAt: 'now', capturedAt: 'later' });
  const comments = JSON.parse(snapshot.files.find(file => file.path === 'comments.json').content).comments;
  assert.deepEqual(comments.map(comment => comment.id), ['early', 'late']);
  assert.deepEqual(comments[0].ts, { seconds: 50, nanoseconds: 0 });
  assert(!Object.hasOwn(comments[0], 'orderKey'));
});

test('ending requires an editing role and matching scene before any writes', async () => {
  const database = fakeDatabase();
  for (const auth of [null, { uid: 'guest', token: {} }]) {
    await assert.rejects(endSceneSessionOperation({ ...request(), auth }, { database }), error => ['unauthenticated', 'permission-denied'].includes(error.code));
  }
  const invalid = request(); invalid.data = { ...invalid.data, threadId: 'foreign::session:0' };
  await assert.rejects(endSceneSessionOperation(invalid, { database }), { code: 'invalid-argument' });
  assert.equal(database.records.size, 0);
});

test('repeated closure deduplicates, reopening creates another snapshot, manual retry keeps its destination', async () => {
  const database = fakeDatabase();
  const end = id => endSceneSessionOperation(request(), { database, now: 1000, newId: () => id });
  const first = await end('one');
  assert.equal(first.status, 'queued');
  assert.equal(database.records.get(`comment_turns/${threadId}`).current, 'ended');
  assert.equal((await end('two')).id, 'one');
  assert(!database.records.has('scene_backup_jobs/two'));
  const originalJob = database.records.get('scene_backup_jobs/one');
  database.records.set('scene_backup_jobs/one', { ...originalJob, status: 'failed', attempts: 8 });
  assert.equal((await end('three')).id, 'one');
  assert.equal(database.records.get('scene_backup_jobs/one').directory, originalJob.directory);
  assert.equal(database.records.get('scene_backup_jobs/one').retryGeneration, 1);
  database.records.set('scene_backup_jobs/one', { ...database.records.get('scene_backup_jobs/one'), status: 'working', leaseUntil: 999 });
  await end('expired');
  assert.equal(database.records.get('scene_backup_jobs/one').status, 'queued');
  database.records.get(`comment_turns/${threadId}`).current = 'erdi';
  assert.equal((await end('four')).id, 'four');
});

test('worker freezes export for retries, reads saved module and never rewrites combat history or a reopened turn', async () => {
  const savedEntry = { ...modulePayload.entry, title: 'Gespeicherte Anhörung' };
  const database = fakeDatabase({
    'char_tabs/config': { moduleStoreData: JSON.stringify({ customSections: [{ key: 'play', entries: [savedEntry, { id: 'unrelated' }] }] }) },
    'comments/roll': { entryId: threadId, text: 'Wurf', combatResolution: { damage: 9 }, orderKey: 1 },
    'characters/gawain': { hp: 3, resources: { action: 0 } }
  });
  await endSceneSessionOperation(request(), { database, newId: () => 'one' });
  const originalComment = structuredClone(database.records.get('comments/roll'));
  const originalCharacter = structuredClone(database.records.get('characters/gawain'));
  const bucket = fakeBucket();
  let failures = 1; const commits = [];
  const github = { async commitBackup(snapshot) { commits.push(snapshot); if (failures--) throw new Error('network unavailable'); return { url: 'https://github.com/VVhiteVVolf/Aleria/tree/sha/backup', commitSha: 'sha' }; } };
  await assert.rejects(processSceneBackupJob('one', { database, bucket, github }), /Wiederholungsversuch/);
  assert.equal(database.records.get('scene_backup_jobs/one').status, 'retrying');
  database.records.set('comments/later', { entryId: threadId, text: 'Später', orderKey: 2 });
  database.records.get(`comment_turns/${threadId}`).current = 'patrick';
  await processSceneBackupJob('one', { database, bucket, github });
  assert.deepEqual(commits[1].files, commits[0].files);
  assert.equal(JSON.parse(commits[1].files.find(file => file.path === 'module.json').content).entry.title, savedEntry.title);
  assert(!JSON.parse(commits[1].files.find(file => file.path === 'module.json').content).section.entries);
  assert.equal(database.records.get('scene_backup_jobs/one').status, 'saved');
  assert.equal(database.records.get(`comment_turns/${threadId}`).current, 'patrick');
  assert.deepEqual(database.records.get('comments/roll'), originalComment);
  assert.deepEqual(database.records.get('characters/gawain'), originalCharacter);
  await processSceneBackupJob('one', { database, bucket, github });
  assert.equal(commits.length, 2);
});

test('GitHub permission errors remain visible and retain the frozen snapshot for manual retry', async () => {
  const database = fakeDatabase(); const bucket = fakeBucket();
  await endSceneSessionOperation(request(), { database, newId: () => 'one' });
  const github = { async commitBackup() { throw Object.assign(new Error('forbidden'), { status: 403, retryable: false }); } };
  await processSceneBackupJob('one', { database, bucket, github });
  assert.equal(database.records.get('scene_backup_jobs/one').status, 'failed');
  assert.match(database.records.get(`comment_turns/${threadId}`).sceneBackup.error, /403/);
  assert.equal(bucket.objects.size, 1);
});

function githubTransport({ conflict = false, alreadyPresent = false } = {}) {
  const calls = []; let refs = 0;
  const fetchImpl = async (url, options) => {
    const path = url.replace('https://api.github.com/repos/VVhiteVVolf/Aleria', '');
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({ path, method: options.method, body });
    let data;
    if (path === '/git/blobs') data = { sha: body.content === Buffer.from('{}').toString('base64') ? 'manifest-blob' : 'content-blob' };
    else if (path === '/git/ref/heads/master') data = { object: { sha: `head-${refs}` } };
    else if (path.startsWith('/git/commits/head')) data = { tree: { sha: 'root-tree' } };
    else if (path === '/git/trees/root-tree') data = { tree: alreadyPresent ? [{ path: 'backup', type: 'tree', sha: 'backup-tree' }] : [] };
    else if (path === '/git/trees/backup-tree') data = { tree: [{ path: 'manifest.json', type: 'blob', sha: 'manifest-blob' }] };
    else if (path === '/git/trees') data = { sha: 'new-tree' };
    else if (path === '/git/commits') data = { sha: 'new-commit' };
    else if (path === '/git/refs/heads/master') {
      refs++;
      if (conflict && refs === 1) return { ok: false, status: 422, headers: { get: () => null } };
      data = {};
    } else throw new Error(`Unexpected request ${path}`);
    return { ok: true, json: async () => data };
  };
  return { calls, fetchImpl };
}

test('GitHub commits atomically, retries concurrent branch changes and never force-pushes', async () => {
  const transport = githubTransport({ conflict: true });
  const github = createSceneBackupGitHub({ token: 'test-only', fetchImpl: transport.fetchImpl });
  const result = await github.commitBackup({ directory: 'backup', files: [{ path: 'module.json', content: 'module' }, { path: 'manifest.json', content: '{}' }], backupId: 'one', moduleTitle: 'Szene' });
  assert.equal(result.commitSha, 'new-commit');
  const patches = transport.calls.filter(call => call.method === 'PATCH');
  assert.equal(patches.length, 2);
  assert(patches.every(call => call.body.force === false));
  const trees = transport.calls.filter(call => call.method === 'POST' && call.path === '/git/trees');
  assert.equal(trees[0].body.tree.length, 2);
  const commits = transport.calls.filter(call => call.method === 'POST' && call.path === '/git/commits');
  assert.deepEqual(commits[1].body.parents, ['head-1']);
});

test('GitHub recognizes a confirmed identical snapshot after a lost response', async () => {
  const transport = githubTransport({ alreadyPresent: true });
  const github = createSceneBackupGitHub({ token: 'test-only', fetchImpl: transport.fetchImpl });
  const result = await github.commitBackup({ directory: 'backup', files: [{ path: 'manifest.json', content: '{}' }], backupId: 'one' });
  assert.equal(result.reused, true);
  assert(!transport.calls.some(call => call.method === 'PATCH' || call.path === '/git/commits'));
});
