import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const ui = await readFile(new URL('../modules/backup/scene-backup-ui.js', import.meta.url), 'utf8');
const turn = await readFile(new URL('../modules/comments/comments-turn.js', import.meta.url), 'utf8');
const routing = await readFile(new URL('../modules/comments/comments-routing.js', import.meta.url), 'utf8');

function environment(backend) {
  const context = vm.createContext({
    window: {}, document: { querySelectorAll: () => [] },
    getCommentBackend: async () => backend,
    buildModuleExportPayload: id => ({ type: 'aleria-module', entry: { id } }),
    showAppStatus: () => {}
  });
  vm.runInContext(routing, context); vm.runInContext(ui, context); vm.runInContext(turn, context);
  return context;
}

test('ending a scene sends its module snapshot to the server and never uses the local turn fallback', async () => {
  const calls = [];
  const context = environment({
    endSceneSession: async (id, payload) => { calls.push([id, payload.entry.id]); return { id: 'backup', status: 'queued' }; },
    saveCommentTurn: async () => assert.fail('A scene closure must use the server')
  });
  await context.setCommentTurn('hearing::session:main', 'ended');
  assert.deepEqual(calls, [['hearing::session:main', 'hearing']]);
});

test('offline scene closure fails visibly, ordinary turn switching remains available', async () => {
  const calls = [];
  const context = environment({ saveCommentTurn: async (...args) => calls.push(args) });
  await assert.rejects(context.setCommentTurn('hearing::session:main', 'ended'), /Online-Verbindung/);
  assert.equal(calls.length, 0);
  await context.setCommentTurn('hearing::session:main', 'erdi');
  await context.setCommentTurn('regular-comments', 'ended');
  assert.deepEqual(calls, [['hearing::session:main', 'erdi'], ['regular-comments', 'ended']]);
});

test('double-clicking while a closure is pending creates one request', async () => {
  let resolve; let count = 0;
  const context = environment({ endSceneSession: () => { count++; return new Promise(done => { resolve = done; }); } });
  const first = context.setCommentTurn('hearing::session:main', 'ended');
  await Promise.resolve(); await Promise.resolve();
  await context.setCommentTurn('hearing::session:main', 'ended');
  assert.equal(count, 1);
  resolve({ id: 'one', status: 'queued' }); await first;
});

test('a queued call response cannot replace a newer confirmed subscription receipt', () => {
  const context = environment({});
  const target = { hidden: true, textContent: '', append() {} };
  const button = { disabled: false, textContent: '' };
  const bar = { dataset: { commentThreadId: 'hearing::session:main' }, querySelector: selector => selector === '[data-scene-backup-status]' ? target : button };
  context.document.querySelectorAll = () => [bar];
  context.window.AleriaSceneBackup.renderStatus('hearing::session:main', { sceneBackup: { id: 'one', status: 'saved', commentCount: 3 } });
  context.window.AleriaSceneBackup.renderStatus('hearing::session:main', { sceneBackup: { id: 'one', status: 'queued' } }, true);
  assert.equal(bar.dataset.sceneBackupStatus, 'saved');
  assert.match(target.textContent, /Auf GitHub gesichert/);
});
