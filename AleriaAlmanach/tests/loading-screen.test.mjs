import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { setMaxListeners } from 'node:events';
import test from 'node:test';
import vm from 'node:vm';
import { createLoadingScreenSound } from '../modules/loading-screen/loading-screen-sound.js';
import { LOADING_SCREEN_RIGS } from '../modules/loading-screen/loading-screen-walk.js';

const source = readFileSync(new URL('../modules/loading-screen/loading-screen.js', import.meta.url), 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));
class Controller extends AbortController { constructor() { super(); setMaxListeners(30, this.signal); } }

function screen({ reducedMotion = false, artFails = false, withSound = false, deferSound = false } = {}) {
  const window = new EventTarget();
  const document = new EventTarget();
  const timers = new Map();
  let timerId = 0;
  function node(dataset = {}) {
    const element = new EventTarget();
    Object.assign(element, { dataset, hidden: false, disabled: false, inert: false, attrs: new Map(), textContent: '' });
    element.setAttribute = (key, value) => element.attrs.set(key, String(value));
    element.getAttribute = key => element.attrs.get(key) ?? null;
    element.removeAttribute = key => element.attrs.delete(key);
    element.contains = target => target === element || target?.parent === element;
    element.closest = selector => selector === '[data-loading-action]' && dataset.loadingAction ? element
      : selector === 'button' && dataset.loadingAction ? element : null;
    element.focus = () => { document.activeElement = element; };
    element.matches = () => true;
    element.remove = () => { element.removed = true; };
    return element;
  }
  const root = node({ loadingImages: 'one.webp two.webp' });
  if (withSound) root.dataset.loadingSound = 'music.mp3';
  root.hidden = true;
  const content = node();
  const target = node(); target.parent = content;
  content.querySelector = () => target;
  const names = ['status', 'detail', 'hint', 'recovery', 'enter', 'pause', 'continue', 'progress', 'sound', 'sound-control'];
  const fields = Object.fromEntries(names.map(name => [name, node(['enter', 'pause', 'continue', 'sound'].includes(name) ? { loadingAction: name } : {})]));
  const steps = ['page', 'shell', 'modules', 'characters', 'creatures', 'art'].map(name => node({ loadingStep: name }));
  for (const field of [...Object.values(fields), ...steps]) field.parent = root;
  root.querySelector = selector => selector === 'progress' ? fields.progress
    : fields[selector.match(/data-loading-(?:action="([^"]+)"|([^\]]+))/)?.slice(1).find(Boolean)] ?? null;
  root.querySelectorAll = selector => selector === 'button' ? [fields.pause, fields.sound, fields.enter, fields.continue] : steps;
  document.readyState = 'loading';
  document.documentElement = node();
  document.querySelector = selector => selector === '[data-loading-screen]' ? root : content;
  document.activeElement = node();
  window.matchMedia = () => ({ matches: reducedMotion });
  window.setTimeout = (fn, delay) => { const id = ++timerId; timers.set(id, { fn, delay }); return id; };
  window.clearTimeout = id => timers.delete(id);
  window.location = { reload() { window.reloaded = true; } };
  class Image { set src(value) { queueMicrotask(() => artFails ? this.onerror() : this.onload()); } }
  const soundtrack = { starts: 0, toggles: 0, entries: 0,
    tryAutoplay() { this.starts += 1; }, toggle() { this.toggles += 1; }, enterAlmanach() { this.entries += 1; }
  };
  let finishSound;
  const loadSoundModule = () => new Promise(resolve => {
    finishSound = () => resolve({ createLoadingScreenSound: options => {
      assert.equal(options.control, fields['sound-control']);
      return soundtrack;
    } });
    if (!deferSound) finishSound();
  });
  const context = vm.createContext({ window, document, AbortController: Controller, Image, console, loadSoundModule });
  const runnable = withSound ? source.replace(/import\('\.\/loading-screen-sound\.js\?[^']+'\)/, 'loadSoundModule()') : source;
  vm.runInContext(runnable, context);
  function emit(where, type, detail) { where.dispatchEvent(new CustomEvent(type, { detail })); }
  function mount() { document.readyState = 'interactive'; emit(document, 'readystatechange'); }
  function click(field = root) { const event = new Event('click'); Object.defineProperty(event, 'target', { value: field }); root.dispatchEvent(event); }
  function tick(delay) { for (const [id, timer] of [...timers]) if (timer.delay === delay) { timers.delete(id); timer.fn(); } }
  function ready(offline = false) {
    document.readyState = 'complete';
    emit(window, 'load'); emit(window, 'almanach:app-ready');
    emit(window, 'almanach:initial-modules-settled', { offline });
    emit(document, 'aleria:characters-changed'); emit(document, 'aleria:creatures-changed');
  }
  return { window, document, root, content, fields, target, emit, mount, click, tick, ready, timers, soundtrack, finishSound: () => finishSound() };
}

test('the loading screen waits for all real milestones and only exits on user input', async () => {
  const ui = screen(); ui.mount(); await settle();
  assert.equal(ui.content.inert, true);
  assert.equal(ui.fields.enter.disabled, true);
  ui.click(); assert.notEqual(ui.root.dataset.state, 'leaving');
  ui.ready();
  assert.equal(ui.fields.progress.value, 6);
  assert.equal(ui.root.dataset.state, 'ready');
  assert.equal(ui.root.removed, undefined);
  ui.click(); assert.equal(ui.root.dataset.state, 'leaving');
  ui.tick(380);
  assert.equal(ui.content.inert, false);
  assert.equal(ui.content.getAttribute('aria-hidden'), null);
  assert.equal(ui.root.removed, true);
  assert.equal(ui.document.activeElement, ui.target);
  assert.equal(Object.hasOwn(ui.document.documentElement.dataset, 'almanachLoading'), false);
});

test('early readiness signals and repeated signals cannot be lost or count twice', async () => {
  const ui = screen(); ui.ready(); ui.mount(); await settle();
  assert.equal(ui.fields.progress.value, 6);
  ui.ready(); assert.equal(ui.fields.progress.value, 6);
});

test('pause does not dismiss the ready screen, and reduced motion starts paused', async () => {
  const ui = screen({ reducedMotion: true }); ui.mount(); await settle(); ui.ready();
  assert.equal(ui.root.dataset.motion, 'paused');
  ui.click(ui.fields.pause);
  assert.equal(ui.root.dataset.motion, 'playing');
  assert.equal(ui.root.dataset.state, 'ready');
});

test('a slow connection never claims completion, but permits explicit entry after local startup', async () => {
  const ui = screen(); ui.mount(); await settle(); ui.tick(15000);
  assert.equal(ui.root.dataset.state, 'slow');
  assert.equal(ui.fields.continue.hidden, true);
  assert.equal(ui.fields.enter.disabled, true);
  ui.emit(ui.window, 'almanach:app-ready');
  assert.equal(ui.fields.continue.hidden, false);
  ui.click(ui.fields.continue); ui.tick(380);
  assert.equal(ui.content.inert, false);
});

test('startup errors offer recovery and do not masquerade as a successful load', async () => {
  const ui = screen(); ui.mount(); await settle(); ui.ready();
  ui.emit(ui.window, 'almanach:startup-error');
  assert.equal(ui.root.dataset.state, 'error');
  assert.equal(ui.fields.enter.disabled, true);
  assert.equal(ui.fields.recovery.hidden, false);
  assert.equal(ui.fields.continue.hidden, true);
  ui.click(); assert.equal(ui.root.removed, undefined);
});

test('offline data and decorative image errors do not deadlock the application', async () => {
  const ui = screen({ artFails: true }); ui.mount(); await settle(); ui.ready(true);
  assert.equal(ui.root.dataset.state, 'ready');
  assert.match(ui.fields.detail.textContent, /Online-Daten/);
});

test('sound starts on mounting, retries on loading interactions, and receives the entry stop without restarting', async () => {
  const ui = screen({ withSound: true }); ui.mount(); await settle();
  assert.equal(ui.soundtrack.starts, 1);
  ui.click();
  assert.equal(ui.soundtrack.starts, 2);
  assert.equal(ui.soundtrack.entries, 0);
  ui.click(ui.fields.sound);
  assert.equal(ui.soundtrack.toggles, 1);
  assert.equal(ui.soundtrack.starts, 2);
  assert.notEqual(ui.root.dataset.state, 'leaving');
  ui.ready(); ui.click();
  assert.equal(ui.soundtrack.starts, 2);
  assert.equal(ui.soundtrack.entries, 1);
  ui.tick(380);
  assert.equal(ui.root.removed, true);
});

test('a delayed music module goes straight to entry cleanup after the loading dialog was removed', async () => {
  const ui = screen({ withSound: true, deferSound: true }); ui.mount(); await settle(); ui.ready();
  ui.click(); ui.tick(380);
  assert.equal(ui.root.removed, true);
  ui.finishSound(); await settle();
  assert.equal(ui.soundtrack.entries, 1);
  assert.equal(ui.soundtrack.starts, 0);
});

test('a delayed music module does not start after navigating away', async () => {
  const ui = screen({ withSound: true, deferSound: true }); ui.mount(); await settle();
  ui.emit(ui.window, 'pagehide'); ui.finishSound(); await settle();
  assert.equal(ui.soundtrack.starts, 0);
  assert.equal(ui.soundtrack.entries, 0);
});

function soundEnvironment() {
  const platform = new EventTarget();
  const frames = new Map(); const timers = new Map();
  let now = 0; let id = 0; let audio;
  class Audio extends EventTarget {
    constructor(src) { super(); this.src = src; this.volume = 1; this.paused = true; audio = this; }
    async play() { this.playCalls = (this.playCalls || 0) + 1; if (this.blocked) throw new Error('NotAllowedError'); this.paused = false; }
    pause() { this.paused = true; }
    removeAttribute() { this.src = ''; }
    load() { this.released = true; }
  }
  Object.assign(platform, { Audio, performance: { now: () => now },
    requestAnimationFrame(fn) { const key = ++id; frames.set(key, fn); return key; },
    cancelAnimationFrame(key) { frames.delete(key); },
    setTimeout(fn, delay) { const key = ++id; timers.set(key, { at: now + delay, fn }); return key; },
    clearTimeout(key) { timers.delete(key); }
  });
  function element() {
    const node = new EventTarget();
    Object.assign(node, { children: [], attrs: new Map(), textContent: '', disabled: false });
    node.setAttribute = (name, value) => node.attrs.set(name, value);
    node.remove = () => {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
      node.parent = null;
    };
    node.append = child => { child.remove(); node.children.push(child); child.parent = node; };
    return node;
  }
  const document = { body: element(), createElement: element };
  platform.document = document;
  const button = element();
  button.textContent = 'existing SVG icon';
  const control = element(); control.append(button);
  const sound = createLoadingScreenSound({ button, control, src: 'music.mp3' }, platform);
  function advance(ms, renderFrames = true) {
    now += ms;
    if (renderFrames) for (const [key, fn] of [...frames]) { frames.delete(key); fn(now); }
    for (const [key, timer] of [...timers]) if (timer.at <= now) { timers.delete(key); timer.fn(); }
  }
  return { platform, document, audio, button, control, sound, advance };
}

test('blocked autoplay leaves a working music button and can start after a gesture', async () => {
  const env = soundEnvironment(); env.audio.blocked = true;
  assert.equal(await env.sound.tryAutoplay(), false);
  assert.equal(env.button.disabled, false);
  assert.match(env.button.attrs.get('aria-label'), /einschalten/);
  env.audio.blocked = false; env.sound.toggle(); await settle(); env.advance(6000);
  assert.equal(env.audio.paused, false);
  assert.equal(env.audio.volume, .55);
  env.sound.destroy();
});

test('autoplay fades in slowly from silence, and repeated interactions do not restart it', async () => {
  const env = soundEnvironment(); await env.sound.tryAutoplay();
  assert.equal(env.audio.volume, 0);
  assert.equal(env.audio.paused, false);
  env.advance(1000);
  assert.ok(env.audio.volume > 0 && env.audio.volume < .05);
  const quietVolume = env.audio.volume;
  await env.sound.tryAutoplay();
  assert.equal(env.audio.playCalls, 1);
  assert.equal(env.audio.volume, quietVolume);
  env.advance(2000);
  assert.equal(env.audio.volume, .275);
  env.advance(3000);
  assert.equal(env.audio.volume, .55);
  env.sound.destroy();
});

test('automatic gesture retries respect manual muting, while the music button can resume', async () => {
  const env = soundEnvironment(); env.audio.blocked = true;
  await env.sound.tryAutoplay(); env.audio.blocked = false;
  await env.sound.tryAutoplay(); env.advance(6000);
  assert.equal(env.audio.paused, false);
  const stopping = env.sound.toggle(); env.advance(1800); await stopping;
  assert.equal(env.audio.paused, true);
  await env.sound.tryAutoplay();
  assert.equal(env.audio.paused, true);
  assert.equal(env.audio.playCalls, 2);
  env.sound.toggle(); await settle();
  assert.equal(env.audio.paused, false);
  assert.equal(env.audio.volume, 0);
  env.sound.destroy();
});

test('a browser pause resets the music control and allows a new user gesture to resume it', async () => {
  const env = soundEnvironment(); await env.sound.tryAutoplay(); env.advance(2000);
  env.audio.paused = true; env.audio.dispatchEvent(new Event('pause'));
  assert.match(env.button.attrs.get('aria-label'), /einschalten/);
  assert.equal(env.audio.volume, 0);
  await env.sound.tryAutoplay(); env.advance(6000);
  assert.equal(env.audio.paused, false);
  assert.equal(env.audio.volume, .55);
  env.sound.destroy();
});

test('manual switching fades the actual soundtrack and keeps it available for resuming', async () => {
  const env = soundEnvironment(); await env.sound.tryAutoplay(); env.advance(6000);
  const ending = env.sound.toggle();
  env.advance(900);
  assert.ok(env.audio.volume > 0 && env.audio.volume < .55);
  assert.equal(env.audio.paused, false);
  env.advance(900); await ending;
  assert.equal(env.audio.volume, 0);
  assert.equal(env.audio.paused, true);
  assert.equal(env.audio.released, undefined);
  assert.equal(env.audio.src, 'music.mp3');
  env.sound.destroy();
});

test('entry fades the soundtrack automatically and removes the icon together with its media resources', async () => {
  const env = soundEnvironment();
  const loading = env.document.createElement('section'); loading.append(env.control);
  await env.sound.tryAutoplay(); env.advance(2000);
  const volume = env.audio.volume;
  const ending = env.sound.enterAlmanach(); env.sound.enterAlmanach();
  assert.equal(env.audio.paused, false);
  assert.equal(env.audio.volume, volume);
  assert.equal(env.audio.playCalls, 1);
  assert.equal(loading.children[0], env.control);
  assert.equal(env.document.body.children.length, 0, 'the loading control must never float over the Almanach');
  env.advance(900);
  assert.ok(env.audio.volume > 0 && env.audio.volume < volume);
  assert.equal(env.audio.paused, false);
  env.advance(900); await ending;
  assert.equal(env.audio.paused, true);
  assert.equal(env.audio.volume, 0);
  assert.equal(env.button.attrs.get('aria-pressed'), 'false');
  assert.equal(env.button.attrs.get('data-sound-state'), 'muted');
  assert.match(env.button.attrs.get('aria-label'), /einschalten/);
  assert.equal(env.button.textContent, 'existing SVG icon');
  assert.equal(env.button.disabled, true);
  assert.equal(loading.children.length, 0);
  assert.equal(env.audio.released, true);
  assert.equal(env.audio.src, '');
  await env.sound.toggle(); await env.sound.tryAutoplay();
  assert.equal(env.audio.paused, true);
  env.platform.dispatchEvent(new Event('pagehide'));
  assert.equal(env.audio.paused, true);
  assert.equal(env.audio.released, true);
  assert.equal(env.document.body.children.length, 0);
  env.button.dispatchEvent(new Event('click'));
  assert.equal(env.audio.playCalls, 1);
});

test('entry never starts previously blocked or manually muted music', async () => {
  for (const muted of [false, true]) {
    const env = soundEnvironment(); env.audio.blocked = true; await env.sound.tryAutoplay();
    env.audio.blocked = false;
    if (muted) { await env.sound.toggle(); const ending = env.sound.toggle(); env.advance(1800); await ending; }
    const playCalls = env.audio.playCalls;
    await env.sound.enterAlmanach(); await env.sound.tryAutoplay();
    assert.equal(env.audio.paused, true);
    assert.equal(env.audio.playCalls, playCalls);
    env.sound.destroy();
  }
});

test('entry during a pending autoplay request cancels it without late playback', async () => {
  const env = soundEnvironment();
  let finishPlay;
  env.audio.play = () => new Promise(resolve => { finishPlay = () => { env.audio.paused = false; resolve(); }; });
  const starting = env.sound.tryAutoplay();
  await env.sound.enterAlmanach(); finishPlay(); await starting;
  assert.equal(env.audio.paused, true);
  assert.equal(env.audio.volume, 0);
  assert.equal(env.button.attrs.get('data-sound-state'), 'muted');
  env.sound.destroy();
});

test('re-enabling during manual fade-out cancels the old stop without cutting or resetting playback', async () => {
  const env = soundEnvironment(); await env.sound.tryAutoplay(); env.advance(6000);
  const stopping = env.sound.toggle(); env.advance(900);
  const volume = env.audio.volume;
  await env.sound.toggle(); await stopping;
  assert.equal(env.audio.paused, false);
  assert.equal(env.audio.volume, volume);
  env.advance(6000);
  assert.equal(env.audio.volume, .55);
  env.sound.destroy();
});

test('entry stops the soundtrack even if a background tab suspends animation frames', async () => {
  const env = soundEnvironment(); await env.sound.tryAutoplay(); env.advance(6000);
  const ending = env.sound.enterAlmanach(); env.advance(1850, false); await ending;
  assert.equal(env.audio.paused, true);
  assert.equal(env.audio.volume, 0);
  env.sound.destroy();
});

test('page navigation stops music immediately, including during a fade', async () => {
  const env = soundEnvironment(); await env.sound.tryAutoplay(); env.advance(6000);
  env.sound.toggle(); env.platform.dispatchEvent(new Event('pagehide')); await settle();
  assert.equal(env.audio.paused, true);
  assert.equal(env.audio.released, true);
});

test('a pending play request cannot start music after navigation cleanup', async () => {
  const env = soundEnvironment();
  let finishPlay;
  env.audio.play = () => new Promise(resolve => { finishPlay = () => { env.audio.paused = false; resolve(); }; });
  const starting = env.sound.tryAutoplay();
  env.sound.destroy(); finishPlay(); await starting;
  assert.equal(env.audio.paused, true);
  assert.equal(env.audio.volume, 0);
  assert.equal(env.audio.released, true);
});

test('every live graphic and soundtrack exists, and rejected frame atlases are not referenced', () => {
  const html = readFileSync(new URL('../AleriaAlmanach.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../modules/loading-screen/loading-screen.css', import.meta.url), 'utf8');
  const files = new Set(html.match(/\.\/public\/assets\/loading-screen\/[^" ]+/g));
  for (const path of files) assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);
  assert.doesNotMatch(html + css, /(?:travellers|gawain|freya|guinevere|fenrir|gaul)-walk-v[12]\.webp/);
  assert.doesNotMatch(css, /journey-body|steps\(1/);
  assert.deepEqual(Object.keys(LOADING_SCREEN_RIGS).sort(), ['fenrir', 'freya', 'gawain', 'guinevere']);
  assert.doesNotMatch(html + css, /gaul/i);
  for (const rig of Object.values(LOADING_SCREEN_RIGS)) {
    assert.ok(existsSync(new URL(`../public/assets/loading-screen/${rig.body}`, import.meta.url)));
    for (const part of rig.parts) assert.ok(part.joint[1] < 190, 'the whole leg must move from the hip');
    for (const part of rig.parts) assert.ok(existsSync(new URL(`../public/assets/loading-screen/${part.file}`, import.meta.url)));
  }
  const walk = readFileSync(new URL('../modules/loading-screen/loading-screen-walk.js', import.meta.url), 'utf8');
  assert.doesNotMatch(walk, /clipPath|<mask|createElementNS\([^)]*mask/);
});

test('each human leg crosses from behind the other leg to in front during a full stride', () => {
  function footX(part, degrees) {
    const angle = degrees * Math.PI / 180;
    const x = 32 - part.anchor[0];
    const y = 86 - part.anchor[1];
    return part.joint[0] + x * Math.cos(angle) - y * Math.sin(angle);
  }
  for (const [name, rig] of Object.entries(LOADING_SCREEN_RIGS)) {
    const [far, near] = rig.parts;
    assert.ok(footX(far, 30) < footX(near, -30), `${name}: first contact`);
    assert.ok(footX(far, -30) > footX(near, 30), `${name}: opposite contact must cross`);
  }
});

test('startup readiness is emitted after rendering, and a failed startup only emits an error', async () => {
  const startup = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  for (const failed of [false, true]) {
    const events = []; let rendered = false;
    const context = vm.createContext({ CustomEvent, console: { error() {} },
      document: { readyState: 'complete' },
      window: { addEventListener() {}, dispatchEvent(event) { events.push([event.type, rendered]); } },
      clearTransientSearchInputsAfterBrowserRestore() {},
      initPage() { if (failed) throw new Error('startup'); rendered = true; }
    });
    vm.runInContext(startup, context);
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(events, [[failed ? 'almanach:startup-error' : 'almanach:app-ready', !failed]]);
  }
});
