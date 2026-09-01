import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const devtoolsPort = Number(process.argv[2] || 9223);
const targetUrl = process.argv[3] || 'http://127.0.0.1:4173/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis';
const screenshotPath = process.argv[4] || '';
const targets = await (await fetch(`http://127.0.0.1:${devtoolsPort}/json/list`)).json();
const page = targets.find(target => target.type === 'page' && target.url === 'about:blank') || targets.find(target => target.type === 'page');
assert.ok(page?.webSocketDebuggerUrl, 'Keine steuerbare Browserseite gefunden.');

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let sequence = 0;
const pending = new Map();
const eventWaiters = new Map();
const browserErrors = [];

socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const waiter = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) waiter?.reject(new Error(message.error.message));
    else waiter?.resolve(message.result);
    return;
  }
  if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails.text || 'Unbekannte Laufzeitausnahme');
  const waiters = eventWaiters.get(message.method) || [];
  eventWaiters.delete(message.method);
  waiters.forEach(resolve => resolve(message.params));
});

function command(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

function waitForEvent(method) {
  return new Promise(resolve => eventWaiters.set(method, [...(eventWaiters.get(method) || []), resolve]));
}

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Auswertung im Browser fehlgeschlagen.');
  return result.result.value;
}

await command('Page.enable');
await command('Runtime.enable');
await command('Emulation.setDeviceMetricsOverride', { width: 1720, height: 1050, deviceScaleFactor: 1, mobile: false });
const loaded = waitForEvent('Page.loadEventFired');
await command('Page.navigate', { url: targetUrl });
await loaded;
await new Promise(resolve => setTimeout(resolve, 1500));

const initialLayers = await evaluate(`(() => ({
  normal: document.getElementById('lb-normal').classList.contains('on'),
  normalOpacity: getComputedStyle(document.getElementById('ln')).opacity,
  normalWidth: document.getElementById('ln').naturalWidth,
  regionsOpacity: getComputedStyle(document.getElementById('lr')).opacity,
  markersOpacity: getComputedStyle(document.getElementById('lm')).opacity,
  pinsDisplay: getComputedStyle(document.getElementById('pl')).display
}))()`);
assert.equal(initialLayers.normal, true);
assert.equal(initialLayers.normalOpacity, '1');
assert.ok(initialLayers.normalWidth > 0, 'Das normale Kartenbild muss geladen sein.');
assert.equal(initialLayers.regionsOpacity, '0');
assert.equal(initialLayers.markersOpacity, '0');
assert.equal(initialLayers.pinsDisplay, 'none');

const layerSwitch = await evaluate(`(async () => {
  document.getElementById('lb-pins').click();
  await new Promise(resolve => setTimeout(resolve, 600));
  const enabled = {
    button: document.getElementById('lb-pins').classList.contains('on'),
    opacity: getComputedStyle(document.getElementById('lm')).opacity,
    pins: getComputedStyle(document.getElementById('pl')).display
  };
  document.getElementById('lb-normal').click();
  await new Promise(resolve => setTimeout(resolve, 600));
  const reset = {
    button: document.getElementById('lb-pins').classList.contains('on'),
    opacity: getComputedStyle(document.getElementById('lm')).opacity,
    pins: getComputedStyle(document.getElementById('pl')).display
  };
  return { enabled, reset };
})()`);
assert.equal(layerSwitch.enabled.button, true);
assert.ok(Number(layerSwitch.enabled.opacity) > .99);
assert.equal(layerSwitch.enabled.pins, 'block');
assert.deepEqual(layerSwitch.reset, { button: false, opacity: '0', pins: 'none' });

const editorResult = await evaluate(`(() => {
  document.getElementById('btn-edit').click();
  const pin = { id: 'codex-smoke-pin', x: .5, y: .5, title: 'Prüfpin', cat: KartoRuntime.firstCategoryId(), table: [], text: '', secret: false };
  KartoRuntime.state().pins.push(pin);
  KartoRuntime.renderPins();
  KartoPinEditor.open(pin.id);
  const input = document.getElementById('sb-title-inp');
  input.value = 'Nur im Entwurf';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return {
    stateTitle: KartoRuntime.state().pins.find(item => item.id === pin.id).title,
    previewTitle: document.querySelector('.editor-preview-card .sv-title')?.textContent,
    dirty: document.getElementById('sb-editor-status')?.classList.contains('is-dirty'),
    publishVisible: !document.getElementById('sb-publish')?.hidden,
    tabs: document.querySelectorAll('.pin-editor-tab').length,
  };
})()`);
assert.deepEqual(editorResult, {
  stateTitle: 'Prüfpin',
  previewTitle: 'Nur im Entwurf',
  dirty: true,
  publishVisible: true,
  tabs: 5,
});

if (screenshotPath) {
  await new Promise(resolve => setTimeout(resolve, 400));
  const shot = await command('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile(screenshotPath, Buffer.from(shot.data, 'base64'));
}

const mediaResult = await evaluate(`(() => {
  KartoPinEditor.openMedia('marker');
  return {
    open: document.querySelector('.karto-media-library')?.classList.contains('is-open'),
    cards: document.querySelectorAll('.karto-media-card').length,
    count: document.querySelector('[data-media-role="count"]')?.textContent,
    cardHeight: Math.round(document.querySelector('.karto-media-card')?.getBoundingClientRect().height || 0),
    thumbHeight: Math.round(document.querySelector('.karto-media-thumb')?.getBoundingClientRect().height || 0),
  };
})()`);
assert.equal(mediaResult.open, true);
assert.equal(mediaResult.cards, 48);
assert.match(mediaResult.count, /von \d+ Bildern/);

if (screenshotPath) {
  await new Promise(resolve => setTimeout(resolve, 250));
  const mediaShot = await command('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile(screenshotPath.replace(/\.png$/i, '-media.png'), Buffer.from(mediaShot.data, 'base64'));
}

const editorLifecycle = await evaluate(`(async () => {
  KartoMediaLibrary.close();
  KartoPinEditor.close({ discard: true });
  const afterCancel = KartoRuntime.state().pins.find(item => item.id === 'codex-smoke-pin')?.title;
  KartoPinEditor.open('codex-smoke-pin');
  const input = document.getElementById('sb-title-inp');
  input.value = 'Übernommener Prüfpin';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  KartoPinEditor.save({ openDetail: false });
  const afterCommit = KartoRuntime.state().pins.find(item => item.id === 'codex-smoke-pin')?.title;
  KartoRuntime.state().pins = KartoRuntime.state().pins.filter(item => item.id !== 'codex-smoke-pin');
  await KartoRuntime.flushSave();
  return { afterCancel, afterCommit, editorOpen: KartoPinEditor.isOpen() };
})()`);
assert.deepEqual(editorLifecycle, { afterCancel: 'Prüfpin', afterCommit: 'Übernommener Prüfpin', editorOpen: false });
assert.deepEqual(browserErrors, [], `Browserfehler: ${browserErrors.join('; ')}`);

socket.close();
console.log(JSON.stringify({ initialLayers, layerSwitch, editorResult, mediaResult, editorLifecycle }, null, 2));
