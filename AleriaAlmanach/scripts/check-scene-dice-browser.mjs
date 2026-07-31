import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const cdpOrigin = process.env.CDP_ORIGIN || 'http://127.0.0.1:9223';
const appUrl = process.argv[2] || process.env.ALERIA_URL || 'http://127.0.0.1:4174/AleriaAlmanach/AleriaAlmanach.html';
const screenshotPath = resolve('.codex-temp/scene-dice-browser.png');

const target = await fetch(`${cdpOrigin}/json/new?about:blank`, { method: 'PUT' }).then(response => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolveOpen, rejectOpen) => {
  socket.addEventListener('open', resolveOpen, { once: true });
  socket.addEventListener('error', rejectOpen, { once: true });
});

let messageId = 0;
const pending = new Map();
const listeners = new Map();
const failedRequests = [];
const errorResponses = [];
const runtimeErrors = [];

socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const state = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) state.reject(new Error(message.error.message));
    else state.resolve(message.result);
    return;
  }
  for (const listener of listeners.get(message.method) || []) listener(message.params || {});
  if (message.method === 'Network.loadingFailed') failedRequests.push(message.params);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) errorResponses.push(message.params.response);
  if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails);
});

function send(method, params = {}, timeoutMs = 60000) {
  const id = ++messageId;
  return new Promise((resolveSend, rejectSend) => {
    const timeout = setTimeout(() => {
      pending.delete(id);
      rejectSend(new Error(`${method} hat das Zeitlimit überschritten.`));
    }, timeoutMs);
    pending.set(id, {
      resolve: value => { clearTimeout(timeout); resolveSend(value); },
      reject: error => { clearTimeout(timeout); rejectSend(error); }
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

function once(method, timeoutMs = 30000) {
  return new Promise((resolveEvent, rejectEvent) => {
    const callback = params => {
      clearTimeout(timeout);
      listeners.set(method, (listeners.get(method) || []).filter(listener => listener !== callback));
      resolveEvent(params);
    };
    const timeout = setTimeout(() => rejectEvent(new Error(`${method} wurde nicht ausgelöst.`)), timeoutMs);
    listeners.set(method, [...(listeners.get(method) || []), callback]);
  });
}

async function evaluate(expression, timeoutMs = 60000) {
  const response = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true
  }, timeoutMs);
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result?.value;
}

await Promise.all([
  send('Page.enable'),
  send('Runtime.enable'),
  send('Network.enable')
]);
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

const loaded = once('Page.loadEventFired');
await send('Page.navigate', { url: appUrl });
await loaded;
await evaluate(`new Promise((resolve, reject) => {
  const started = Date.now();
  const check = () => {
    if (window.AleriaSceneDice && typeof ensureSceneDiceDialog === 'function') return resolve(true);
    if (Date.now() - started > 15000) return reject(new Error('Würfelmodule wurden nicht geladen.'));
    setTimeout(check, 50);
  };
  check();
})`);

const prepared = await evaluate(`(async () => {
  ensureSceneDiceDialog();
  resetSceneDiceDialog();
  activateDialog('scene-dice-overlay', { initialFocus: '#scene-dice-formula', delay: 0 });
  await new Promise(resolve => setTimeout(resolve, 60));
  const engine = await window.AleriaSceneDice.prepare(document.getElementById('scene-dice-stage'));
  return {
    fallback: engine.isFallback,
    canvasCount: document.querySelectorAll('#scene-dice-stage canvas').length,
    focusedId: document.activeElement?.id || '',
    modalOpen: document.getElementById('scene-dice-overlay').classList.contains('active')
  };
})()`, 90000);

assert.equal(prepared.fallback, false, '3D-Engine fiel unerwartet auf Textmodus zurück.');
assert.ok(prepared.canvasCount >= 1, 'Dice Box hat kein Canvas erzeugt.');
assert.equal(prepared.focusedId, 'scene-dice-formula');
assert.equal(prepared.modalOpen, true);

const damage = await evaluate(`(async () => {
  const input = document.getElementById('scene-dice-formula');
  input.value = '2d6+4';
  document.querySelector('[data-scene-dice-action="roll"]').click();
  const started = Date.now();
  while (window.AleriaSceneDice.getEngineState().busy || !_sceneDicePendingRoll || _sceneDicePendingRoll.formula !== '2d6+4') {
    if (Date.now() - started > 30000) throw new Error('2d6+4 wurde nicht abgeschlossen.');
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return JSON.parse(JSON.stringify(_sceneDicePendingRoll));
})()`, 45000);

assert.equal(damage.dice.length, 2);
assert.equal(damage.modifier, 4);
assert.equal(damage.total, damage.keptDice.reduce((sum, value) => sum + value, 0) + 4);
assert.equal(damage.visualMode, '3d');

const advantage = await evaluate(`(async () => {
  const input = document.getElementById('scene-dice-formula');
  input.value = '2d20kh1+5';
  document.querySelector('[data-scene-dice-action="roll"]').click();
  const started = Date.now();
  while (window.AleriaSceneDice.getEngineState().busy || !_sceneDicePendingRoll || _sceneDicePendingRoll.formula !== '2d20kh1+5') {
    if (Date.now() - started > 30000) throw new Error('Vorteilswurf wurde nicht abgeschlossen.');
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return JSON.parse(JSON.stringify(_sceneDicePendingRoll));
})()`, 45000);

assert.equal(advantage.keptDice.length, 1);
assert.equal(advantage.droppedDice.length, 1);
assert.equal(advantage.total, advantage.keptDice[0] + 5);

const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await mkdir(dirname(screenshotPath), { recursive: true });
await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));

const collisionGuard = await evaluate(`(async () => {
  const first = window.AleriaSceneDice.roll('1d4', document.getElementById('scene-dice-stage'));
  const second = window.AleriaSceneDice.roll('1d4', document.getElementById('scene-dice-stage'));
  const outcomes = await Promise.allSettled([first, second]);
  return outcomes.map(outcome => ({ status: outcome.status, message: outcome.reason?.message || '' }));
})()`, 45000);

assert.equal(collisionGuard.filter(outcome => outcome.status === 'fulfilled').length, 1);
assert.equal(collisionGuard.filter(outcome => outcome.status === 'rejected').length, 1);
assert.match(collisionGuard.find(outcome => outcome.status === 'rejected').message, /bereits/);

await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
const mobileUi = await evaluate(`(async () => {
  window.dispatchEvent(new Event('resize'));
  await new Promise(resolve => setTimeout(resolve, 120));
  const body = document.querySelector('.scene-dice-body');
  const stage = document.querySelector('.scene-dice-stage-panel');
  const controls = document.querySelector('.scene-dice-controls');
  const formula = document.getElementById('scene-dice-formula');
  return {
    layout: getComputedStyle(body).display,
    scrollable: body.scrollHeight > body.clientHeight,
    stageBottom: Math.round(stage.getBoundingClientRect().bottom),
    controlsTop: Math.round(controls.getBoundingClientRect().top),
    formulaTop: Math.round(formula.getBoundingClientRect().top),
    canvasCount: document.querySelectorAll('#scene-dice-stage canvas').length
  };
})()`);

assert.equal(mobileUi.layout, 'flex');
assert.equal(mobileUi.scrollable, true);
assert.ok(mobileUi.controlsTop >= mobileUi.stageBottom - 1, 'Mobile Steuerung wird vom Canvas überdeckt.');
assert.ok(mobileUi.formulaTop > mobileUi.stageBottom, 'Mobile Würfelformel wird vom Canvas überdeckt.');
assert.ok(mobileUi.canvasCount >= 1);

const finalUi = await evaluate(`(() => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return {
    modalOpen: document.getElementById('scene-dice-overlay').classList.contains('active'),
    historyCount: window.AleriaSceneDice.getHistory().length,
    resultText: document.querySelector('[data-scene-dice-result]')?.textContent || ''
  };
})()`);

assert.equal(finalUi.modalOpen, false);
assert.ok(finalUi.historyCount >= 3);
assert.ok(finalUi.resultText.includes('2d20kh1+5'));

const diceAssetErrors = [
  ...failedRequests.map(item => item.url || item.requestId),
  ...errorResponses.map(item => `${item.status} ${item.url}`)
].filter(value => /dice-box|world\.|Dice-/i.test(String(value)));
const relevantRuntimeErrors = runtimeErrors.filter(error => /dice|scene-dice/i.test(JSON.stringify(error)));

assert.deepEqual(diceAssetErrors, [], `Dice-Asset-Fehler: ${diceAssetErrors.join(', ')}`);
assert.deepEqual(relevantRuntimeErrors, [], 'JavaScript-Fehler im Würfelsystem entdeckt.');

console.log(JSON.stringify({ prepared, damage, advantage, collisionGuard, mobileUi, finalUi, diceAssetErrors, screenshotPath }, null, 2));
socket.close();
