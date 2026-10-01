import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { verifyMapSearch, verifyMapViewSettings } from './map-search-view-browser.mjs';

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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Auswertung im Browser fehlgeschlagen.');
  return result.result.value;
}

await command('Page.enable');
await command('Network.enable');
await command('Network.setCacheDisabled', { cacheDisabled: true });
await command('Network.setBypassServiceWorker', { bypass: true });
await command('Runtime.enable');
await command('Page.bringToFront');
await command('Emulation.setDeviceMetricsOverride', { width: 1720, height: 1050, deviceScaleFactor: 1, mobile: false });
const loaded = waitForEvent('Page.loadEventFired');
await command('Page.navigate', { url: targetUrl });
await loaded;
await new Promise(resolve => setTimeout(resolve, 1500));

// Large raster maps can defer compositor animation frames in headless Chrome.
// These assertions test layer state; transition timing is not under test.
await evaluate(`document.querySelectorAll('.ml, #pl').forEach(element => { element.style.transition = 'none'; })`);

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

const searchResult = await verifyMapSearch({ command, evaluate });

const editorResult = await evaluate(`(async () => {
  document.getElementById('btn-edit').click();
  const pin = { id: 'codex-smoke-pin', x: .5, y: .5, title: 'Prüfpin', cat: KartoRuntime.firstCategoryId(), table: [], text: '', secret: false };
  KartoRuntime.state().pins.push(pin);
  KartoRuntime.renderPins();
  KartoPinEditor.open(pin.id);
  const input = document.getElementById('sb-title-inp');
  input.value = 'Nur im Entwurf';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await new Promise(resolve => requestAnimationFrame(resolve));
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

const previewEfficiency = await evaluate(`(async () => {
  const image = document.querySelector('.editor-preview-card .sv-location-image');
  const field = document.getElementById('sb-title-inp');
  const originalRender = KartoRuntime.renderEditorPreview;
  let renders = 0;
  KartoRuntime.renderEditorPreview = (...args) => { renders++; return originalRender(...args); };
  for(let index = 0; index < 30; index++) {
    field.value = 'Entwurf ' + index;
    field.dispatchEvent(new Event('input', {bubbles:true}));
  }
  await new Promise(resolve => requestAnimationFrame(resolve));
  KartoRuntime.renderEditorPreview = originalRender;
  return {renders, sameImage:image === document.querySelector('.editor-preview-card .sv-location-image'),
    title:document.querySelector('.editor-preview-card .sv-title').textContent,
    original:KartoRuntime.state().pins.find(pin => pin.id === 'codex-smoke-pin').title};
})()`);
assert.deepEqual(previewEfficiency, {renders:1, sameImage:true, title:'Entwurf 29', original:'Prüfpin'});

const placeholderResult = await evaluate(`(async () => {
  const change = (id, value) => {
    const field = document.getElementById(id);
    field.value = value;
    field.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const sources = () => ({
    card: document.querySelector('.editor-preview-card .sv-location-image')?.getAttribute('src'),
    media: document.querySelector('[data-media-preview="img"] img')?.getAttribute('src'),
  });
  const harbor = [...document.getElementById('sb-cat').options].find(option => option.textContent === 'Hafensiedlung');
  change('sb-cat', harbor.value);
  const category = sources();
  const mine = [...document.getElementById('sb-cat').options].find(option => option.textContent === 'Mine');
  change('sb-cat', mine.value);
  const location = sources();
  change('sb-tpl-sel', 'handwerk');
  const matchingTemplate = sources();
  change('sb-tpl-sel', 'militaer');
  const template = sources();
  change('sb-img', '/Karten/assets/icons/welt/bardensiedlung.png');
  change('sb-cat', KartoRuntime.firstCategoryId());
  const own = sources();
  change('sb-img', '');
  const cleared = sources();
  change('sb-tpl-sel', 'siedlung');
  const settlement = sources();
  const selectedTemplate = document.getElementById('sb-tpl-sel').value;
  change('sb-cat', mine.value);
  const locationFields = [...document.querySelectorAll('#sb-tbl [data-c="k"]')].map(input => input.value);
  change('sb-cat', KartoRuntime.firstCategoryId());
  const settlementFields = [...document.querySelectorAll('#sb-tbl [data-c="k"]')].map(input => input.value);
  const card = document.querySelector('.editor-preview-card');
  const heights = [card.querySelector('.sv-img-wrap'), card.querySelector('.sv-table')].map(element => element.getBoundingClientRect().height);
  const dimensions = [];
  for (const src of KartoPinPlaceholders.sources) {
    const image = new Image();
    image.src = src;
    await image.decode();
    dimensions.push({ src, width: image.naturalWidth, height: image.naturalHeight });
  }
  return { category, location, matchingTemplate, template, own, cleared, settlement, dimensions, selectedTemplate, locationFields, settlementFields, heights,
    storedImage: KartoRuntime.state().pins.find(pin => pin.id === 'codex-smoke-pin').img || '' };
})()`);
const expectedImage = name => `/Karten/assets/images/pin-placeholders/${name}.webp`;
for (const [step, name] of [['category', 'settlement-hafensiedlung'], ['location', 'location-mine'], ['matchingTemplate', 'location-mine'], ['template', 'template-militaer'], ['cleared', 'template-militaer'], ['settlement', 'settlement-hauptstadt']]) {
  assert.deepEqual(placeholderResult[step], { card: expectedImage(name), media: expectedImage(name) });
}
assert.deepEqual(placeholderResult.own, { card: '/Karten/assets/icons/welt/bardensiedlung.png', media: '/Karten/assets/icons/welt/bardensiedlung.png' });
assert.equal(placeholderResult.storedImage, '');
assert.equal(placeholderResult.selectedTemplate, 'siedlung');
assert.ok(placeholderResult.locationFields.includes('Abbauweise'));
assert.ok(placeholderResult.settlementFields.includes('Bevölkerung'));
assert.ok(Math.abs(placeholderResult.heights[0] - placeholderResult.heights[1]) < 1);
const promptSets = await Promise.all(['generation-prompts.json', 'location-generation-prompts.json', 'symbol-types-generation-prompts.json']
  .map(name => readFile(new URL(`../assets/images/pin-placeholders/${name}`, import.meta.url), 'utf8').then(JSON.parse)));
assert.equal(placeholderResult.dimensions.length, promptSets.reduce((sum, set) => sum + set.jobs.length, 0));
assert.ok(placeholderResult.dimensions.every(image => image.width > 0 && image.width === image.height));

const previewChanges = await evaluate(`(async () => {
  const change = (id,value) => { const field=document.getElementById(id); field.value=value; field.dispatchEvent(new Event('change',{bubbles:true})); };
  change('sb-img','/Karten/assets/images/pin-placeholders/location-mine.webp');
  const image = document.querySelector('.editor-preview-card .sv-location-image');
  image.dispatchEvent(new Event('error'));
  change('sb-title-inp','Bild bleibt geladen');
  const errorPreserved = image.hidden;
  change('sb-cat',[...document.getElementById('sb-cat').options].find(option=>option.textContent==='Mine').value);
  const errorCleared = !image.hidden && document.querySelector('.editor-preview-card .sv-img-ph').hidden;
  change('sb-text','**Beschreibung** mit Text');
  const description = document.querySelector('.editor-preview-card .sv-text strong')?.textContent;
  change('sb-text','');
  return {sameImage:image===document.querySelector('.editor-preview-card .sv-location-image'),errorPreserved,errorCleared,description,
    descriptionRemoved:!document.querySelector('.editor-preview-card .sv-lore')};
})()`);
assert.deepEqual(previewChanges,{sameImage:true,errorPreserved:true,errorCleared:true,description:'Beschreibung',descriptionRemoved:true});

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

const viewSettingsResult = await verifyMapViewSettings({ command, evaluate });
await evaluate('if(!KartoRuntime.isEditMode()) document.getElementById("btn-edit").click();');
await command('Emulation.setDeviceMetricsOverride', {width:640,height:900,deviceScaleFactor:1,mobile:false});
const mobilePreview = await evaluate(`(async () => {
  const pins=KartoRuntime.state().pins;
  const before=JSON.stringify(pins);
  KartoPinEditor.open(pins[0].id);
  const originalRender=KartoRuntime.renderEditorPreview;
  let renders=0;
  KartoRuntime.renderEditorPreview=(...args)=>{renders++;return originalRender(...args);};
  const field=document.getElementById('sb-title-inp');
  field.value='Mobile Vorschau';
  field.dispatchEvent(new Event('input',{bubbles:true}));
  await new Promise(resolve=>requestAnimationFrame(resolve));
  const hiddenRenders=renders;
  KartoPinEditor.togglePreview();
  const title=document.querySelector('.editor-preview-card .sv-title').textContent;
  const shown=getComputedStyle(document.getElementById('sb-preview')).display!=='none';
  KartoPinEditor.close({discard:true});
  KartoPinEditor.open(pins[0].id);
  document.getElementById('sb-title-inp').value='Verworfene Vorschau';
  document.getElementById('sb-title-inp').dispatchEvent(new Event('input',{bubbles:true}));
  KartoPinEditor.close({discard:true});
  KartoPinEditor.open(pins[1].id);
  await new Promise(resolve=>requestAnimationFrame(resolve));
  const nextTitle=document.querySelector('.editor-preview-card .sv-title').textContent;
  KartoPinEditor.close({discard:true});
  KartoRuntime.renderEditorPreview=originalRender;
  return {hiddenRenders,title,shown,nextTitle,expectedNext:pins[1].title,unchanged:before===JSON.stringify(pins)};
})()`);
assert.equal(mobilePreview.hiddenRenders,0);
assert.equal(mobilePreview.title,'Mobile Vorschau');
assert.equal(mobilePreview.shown,true);
assert.equal(mobilePreview.nextTitle,mobilePreview.expectedNext);
assert.equal(mobilePreview.unchanged,true);
assert.deepEqual(browserErrors, [], `Browserfehler: ${browserErrors.join('; ')}`);

socket.close();
console.log(JSON.stringify({ initialLayers, layerSwitch, searchResult, viewSettingsResult, editorResult, mediaResult, editorLifecycle }, null, 2));
