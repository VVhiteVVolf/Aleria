import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { setMaxListeners } from 'node:events';
import test from 'node:test';
import vm from 'node:vm';
import { createLoadingScreenSound } from '../modules/loading-screen/loading-screen-sound.js';
import { LOADING_SCREEN_RIGS, mountLoadingScreenWalk } from '../modules/loading-screen/loading-screen-walk.js';
import { mountLoadingScreenBanter } from '../modules/loading-screen/loading-screen-banter.js';
import { OWETAS_COURTYARD, mountLoadingScreenCourtyard } from '../modules/loading-screen/loading-screen-courtyard.js';
import { LOADING_SCREEN_JOURNEYS } from '../modules/loading-screen/loading-screen-journey.js';
import { HEROLDS_COUNCIL } from '../modules/loading-screen/loading-screen-council.js';
import { chooseLoadingScreenScene, LOADING_SCREEN_SCENES } from '../modules/loading-screen/loading-screen-scenes.js';
import { LOADING_SCREEN_QUOTES } from '../modules/loading-screen/loading-screen-quotes.js';

const source = readFileSync(new URL('../modules/loading-screen/loading-screen.js', import.meta.url), 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));
class Controller extends AbortController { constructor() { super(); setMaxListeners(30, this.signal); } }

function screen({ reducedMotion = false, withSound = false, deferSound = false,
  withTravellers = false, deferJourney = false, hidden = false } = {}) {
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
  const root = node();
  if (withSound) root.dataset.loadingSound = 'music.mp3';
  root.hidden = true;
  const content = node();
  const target = node(); target.parent = content;
  content.querySelector = () => target;
  const names = ['status', 'detail', 'hint', 'recovery', 'enter', 'pause', 'continue', 'progress', 'sound', 'sound-control'];
  const fields = Object.fromEntries(names.map(name => [name, node(['enter', 'pause', 'continue', 'sound'].includes(name) ? { loadingAction: name } : {})]));
  const steps = ['shell', 'modules'].map(name => node({ loadingStep: name }));
  for (const field of [...Object.values(fields), ...steps]) field.parent = root;
  root.querySelector = selector => selector === '[data-loading-scene]' ? withTravellers ? {} : null : selector === 'progress' ? fields.progress
    : fields[selector.match(/data-loading-(?:action="([^"]+)"|([^\]]+))/)?.slice(1).find(Boolean)] ?? null;
  root.querySelectorAll = selector => selector === 'button' ? [fields.pause, fields.sound, fields.enter, fields.continue] : steps;
  document.readyState = 'loading';
  document.hidden = hidden;
  document.documentElement = node();
  document.querySelector = selector => selector === '[data-loading-screen]' ? root : content;
  document.activeElement = node();
  window.matchMedia = () => ({ matches: reducedMotion });
  window.setTimeout = (fn, delay) => { const id = ++timerId; timers.set(id, { fn, delay }); return id; };
  window.clearTimeout = id => timers.delete(id);
  window.location = { reload() { window.reloaded = true; } };
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
  let journeyImports = 0, journeyMounts = 0, journeyActive, finishJourney;
  const loadJourneyModule = () => new Promise(resolve => {
    journeyImports++;
    finishJourney = () => resolve({ mountLoadingScreenScene() {
      journeyMounts++;
      return { setActive(active) { journeyActive = active; } };
    } });
    if (!deferJourney) finishJourney();
  });
  const context = vm.createContext({ window, document, AbortController: Controller, console, loadSoundModule, loadJourneyModule });
  let runnable = withSound ? source.replace(/import\('\.\/loading-screen-sound\.js\?[^']+'\)/, 'loadSoundModule()') : source;
  runnable = runnable.replace(/import\('\.\/loading-screen-scenes\.js\?[^']+'\)/, 'loadJourneyModule()');
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
  return { window, document, root, content, fields, target, emit, mount, click, tick, ready, timers, soundtrack,
    journeyImports: () => journeyImports, journeyMounts: () => journeyMounts, journeyActive: () => journeyActive,
    finishJourney: () => finishJourney(), finishSound: () => finishSound() };
}

test('the loading screen waits for archive and first module settlement and only exits on user input', async () => {
  const ui = screen(); ui.mount(); await settle();
  assert.equal(ui.content.inert, true);
  assert.equal(ui.fields.enter.disabled, true);
  ui.click(); assert.notEqual(ui.root.dataset.state, 'leaving');
  ui.ready();
  assert.equal(ui.fields.progress.value, 2); assert.equal(ui.fields.progress.max, 2);
  assert.equal(ui.root.dataset.state, 'ready');
  assert.equal(ui.root.removed, undefined);
  ui.click(); assert.equal(ui.root.dataset.state, 'leaving');
  ui.tick(220);
  assert.equal(ui.content.inert, false);
  assert.equal(ui.content.getAttribute('aria-hidden'), null);
  assert.equal(ui.root.removed, true);
  assert.equal(ui.document.activeElement, ui.target);
  assert.equal(Object.hasOwn(ui.document.documentElement.dataset, 'almanachLoading'), false);
});

test('early readiness signals and repeated signals cannot be lost or count twice', async () => {
  const ui = screen(); ui.ready(); ui.mount(); await settle();
  assert.equal(ui.fields.progress.value, 2);
  ui.ready(); assert.equal(ui.fields.progress.value, 2);
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
  ui.click(ui.fields.continue); ui.tick(220);
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

test('offline settlement remains explicit and does not deadlock the application', async () => {
  const ui = screen(); ui.mount(); await settle(); ui.ready(true);
  assert.equal(ui.root.dataset.state, 'ready');
  assert.match(ui.fields.detail.textContent, /Online-Daten/);
});

test('entry is ready before window.load and optional figure or creature events', async () => {
  const ui = screen(); ui.mount(); await settle();
  ui.emit(ui.window, 'almanach:app-ready');
  assert.equal(ui.fields.progress.value, 1); assert.equal(ui.fields.enter.disabled, true);
  ui.emit(ui.document, 'aleria:characters-changed'); ui.emit(ui.document, 'aleria:creatures-changed');
  assert.equal(ui.fields.progress.value, 1);
  ui.emit(ui.window, 'almanach:initial-modules-settled', { offline: false });
  assert.equal(ui.document.readyState, 'interactive');
  assert.equal(ui.fields.progress.value, 2); assert.equal(ui.fields.enter.disabled, false);
  ui.click(); ui.tick(220); assert.equal(ui.content.inert, false);
});

test('a pending journey cannot block entry or mount after the dialog has closed', async () => {
  const ui = screen({ withTravellers: true, deferJourney: true }); ui.mount(); await settle();
  assert.equal(ui.journeyImports(), 1);
  ui.emit(ui.window, 'almanach:app-ready'); ui.emit(ui.window, 'almanach:initial-modules-settled');
  assert.equal(ui.root.dataset.state, 'ready'); assert.equal(ui.fields.enter.disabled, false);
  ui.click(); ui.tick(220); assert.equal(ui.root.removed, true);
  ui.finishJourney(); await settle(); assert.equal(ui.journeyMounts(), 0);
});

test('reduced motion mounts the scene paused until explicitly resumed', async () => {
  const ui = screen({ reducedMotion: true, withTravellers: true }); ui.mount(); await settle();
  assert.equal(ui.journeyMounts(), 1); assert.equal(ui.journeyActive(), false);
  assert.equal(ui.root.dataset.motion, 'paused');
  ui.click(ui.fields.pause); await settle();
  assert.equal(ui.journeyMounts(), 1); assert.equal(ui.journeyActive(), true);
  assert.equal(ui.root.dataset.motion, 'playing');
});

test('hidden tabs pause movement without changing the users animation choice', async () => {
  const ui = screen({ hidden: true, withTravellers: true }); ui.mount(); await settle();
  assert.equal(ui.journeyActive(), false); assert.equal(ui.root.dataset.visibility, 'hidden'); assert.equal(ui.root.dataset.motion, 'playing');
  ui.document.hidden = false; ui.emit(ui.document, 'visibilitychange'); await settle();
  assert.equal(ui.journeyActive(), true); assert.equal(ui.root.dataset.visibility, 'visible');
  ui.click(ui.fields.pause); ui.document.hidden = true; ui.emit(ui.document, 'visibilitychange');
  ui.document.hidden = false; ui.emit(ui.document, 'visibilitychange');
  assert.equal(ui.journeyActive(), false);
  assert.equal(ui.root.dataset.motion, 'paused');
});

test('each dialogue scene uses its own cast, with quiet gaps and cancellable gestures', () => {
  for (const variant of LOADING_SCREEN_SCENES.filter(({ cast }) => cast)) {
    const { window, tick, timers } = screen();
    const controller = new AbortController();
    const speaker = {}, line = {};
    const bubble = { hidden: true, dataset: {}, style: new Map(), querySelector(selector) {
      return selector === '[data-banter-speaker]' ? speaker : line;
    } };
    bubble.style.setProperty = bubble.style.set.bind(bubble.style);
    let animatedSpeaker;
    const chatter = mountLoadingScreenBanter({ querySelector: () => bubble },
      { variant, signal: controller.signal, environment: window, showSpeaker: quote => { animatedSpeaker = quote?.speaker; } });
    const quotes = LOADING_SCREEN_QUOTES[variant.id];
    const dialogue = variant.opening ? [variant.opening, ...quotes] : quotes;
    const names = new Map(variant.cast);
    assert.deepEqual(new Set(quotes.map(quote => quote.speaker)), new Set(names.keys()));
    const scripted = variant.dialogueOrigin === 'scripted';
    if (scripted) {
      assert(quotes.every(quote => !quote.source));
      if (variant.id === 'wolfshorn') {
        assert.deepEqual(quotes.map(quote => quote.speaker), ['duncan', 'gawain', 'freki', 'ylva']);
        assert.equal(quotes[2].lookAt, 'ylva');
      } else {
        assert.equal(variant.id, 'tiefenwyrm');
        assert.deepEqual(quotes.map(quote => quote.speaker), ['idwal', 'talon', 'trevor']);
        assert.match(quotes[0].text, /verbrüht/);
      }
    } else {
      assert.equal(new Set(quotes.map(quote => quote.source.thread)).size, 1);
    }
    if (variant.kind === 'council') {
      assert(quotes.every(quote => quote.source.thread === 'castell-draig-ratsfluegel::session:ratsfluegel-herold'));
      assert.match(variant.opening.text, /Trahern hat Cadogan gerade den Hut vom Kopf geschlagen/);
      assert.equal(variant.opening.source.thread, quotes[0].source.thread);
      assert.match(quotes[1].text, /Amtsenthebung/);
      assert.match(quotes.at(-1).text, /Mittagessen/);
    }
    chatter.setActive(true);
    for (const [index, quote] of dialogue.entries()) {
      if (!scripted) {
        assert.match(quote.source.comment, /^\w[\w-]+$/);
        assert.ok(quote.source.thread);
      }
      tick(index === 0 ? 1250 : 1400);
      assert.equal(bubble.hidden, false);
      assert.equal(bubble.dataset.speaker, quote.speaker);
      assert.equal(animatedSpeaker, quote.speaker);
      assert.equal(Object.hasOwn(bubble.dataset, 'banterContext'), quote === variant.opening);
      assert.equal(speaker.textContent, names.get(quote.speaker) ?? '');
      assert.equal(line.textContent, quote.text);
      const timer = [...timers.values()].find(({ delay }) => delay !== 15000);
      assert.ok(timer.delay >= 4400);
      tick(timer.delay);
      assert.equal(bubble.hidden, true);
      assert.equal(animatedSpeaker, undefined);
    }
    chatter.setActive(false);
    assert.ok([...timers.values()].every(timer => timer.delay === 15000));
    chatter.setActive(true); tick(1250);
    assert.equal(bubble.hidden, false);
    assert.equal(line.textContent, dialogue[0].text);
    chatter.setActive(false);
    chatter.setActive(true); tick(1250);
    assert.equal(line.textContent, dialogue[0].text, 'resuming repeats the interrupted line');
    controller.abort();
    assert.equal(bubble.hidden, true);
    assert.equal(animatedSpeaker, undefined);
    assert.ok([...timers.values()].every(timer => timer.delay === 15000));
  }
});

test('all nine scenes can be chosen, and a reload in the same tab avoids an immediate repeat', () => {
  const ids = ['owetas-quartett', 'wolfshorn', 'tiefenwyrm', 'heroldsrat',
    'trahern-tal', 'versunkene-strand', 'steffan-musterung', 'fenrir-freya-weglager', 'landtroll-bruecke'];
  const draws = ids.map((_, index) => (index + .5) / ids.length);
  assert.deepEqual(draws.map(value => chooseLoadingScreenScene({ random: () => value }).id), ids);
  let previous;
  const storage = { getItem: () => previous, setItem: (_, id) => { previous = id; } };
  const draw = value => chooseLoadingScreenScene({ storage, random: () => value }).id;
  assert.deepEqual([draw(0), draw(0), draw(.99), draw(.99)],
    ['owetas-quartett', 'wolfshorn', 'landtroll-bruecke', 'fenrir-freya-weglager']);
  const unavailable = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(chooseLoadingScreenScene({ storage: unavailable, random: () => 0 }).id, ids[0]);
});

test('each vignette uses a single illustration with matching renditions and no dialogue', () => {
  const manifest = JSON.parse(readFileSync(new URL('../public/assets/loading-screen/ruhige-szenen-v1-manifest.json', import.meta.url), 'utf8'));
  const variants = LOADING_SCREEN_SCENES.filter(({ kind }) => kind === 'vignette');
  assert.deepEqual(new Set(Object.keys(manifest.scenes)), new Set(variants.map(({ id }) => id)));
  for (const { id, picture, cast } of variants) {
    const { source: original, assets } = manifest.scenes[id];
    assert.equal(cast, undefined);
    assert.equal(LOADING_SCREEN_QUOTES[id], undefined);
    assert.deepEqual(original.size, [1672, 941]);
    assert.deepEqual(assets.map(({ file }) => file.split('/').at(-1)), [
      `${picture}-desktop.avif`, `${picture}-mobile.avif`, `${picture}-fallback.webp`
    ]);
    for (const { size: [width, height] } of assets) {
      assert.ok(Math.abs(height - width * 9 / 16) <= 1);
    }
    verifyAssets([original, ...assets]);
  }
});

test('Owetas Quartett keeps the stage still while a single speaker gestures', () => {
  const picture = {};
  const figures = [];
  const style = { setProperty() {} };
  const art = {
    ownerDocument: { createElement: () => ({
      dataset: {}, style, removeAttribute() { delete this.dataset.speaking; }
    }) },
    style,
    append(figure) { figures.push(figure); },
    replaceChildren(...children) { assert.deepEqual(children, [picture]); }
  };
  const showSpeaker = mountLoadingScreenCourtyard({}, art, OWETAS_COURTYARD, {
    createPicture(name, width, height) {
      assert.equal(name, 'oweta-courtyard-plate-v10');
      assert.deepEqual([width, height], [1536, 1024]);
      return picture;
    },
    assetUrl: name => name
  });
  assert.deepEqual(LOADING_SCREEN_SCENES[0], OWETAS_COURTYARD);
  assert.equal(picture.className, 'almanach-loading__courtyard');
  const positions = new Map();
  const bubble = { style: { setProperty(key, value) { positions.set(key, value); } } };
  const anchors = OWETAS_COURTYARD.cast.map(([speaker]) => {
    showSpeaker({ speaker }, bubble);
    assert.deepEqual(figures.filter(figure => Object.hasOwn(figure.dataset, 'speaking'))
      .map(figure => figure.dataset.courtyardPerson), [speaker]);
    return Number.parseFloat(positions.get('--courtyard-speaker-x'));
  });
  showSpeaker(null, bubble);
  assert(figures.every(figure => !Object.hasOwn(figure.dataset, 'speaking')));
  assert(anchors.every((position, index) => position > (anchors[index - 1] ?? 0) && position < 100));
  const ending = LOADING_SCREEN_QUOTES[OWETAS_COURTYARD.id].slice(-3);
  assert(ending.every(({ speaker, source }) => speaker === 'oweta' && source.segment === 7));
  assert.match(ending.map(({ text }) => text).join(' '), /kurze Rast.+Unterlagen gemeinsam.+welche Fragen/);
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
  ui.tick(220);
  assert.equal(ui.root.removed, true);
});

test('a delayed music module goes straight to entry cleanup after the loading dialog was removed', async () => {
  const ui = screen({ withSound: true, deferSound: true }); ui.mount(); await settle(); ui.ready();
  ui.click(); ui.tick(220);
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

test('soundtrack has no eager source and a known autoplay prohibition avoids requesting it', async () => {
  const env = soundEnvironment();
  env.platform.navigator = { getAutoplayPolicy: () => 'disallowed', userActivation: { isActive: false } };
  assert.equal(env.audio.preload, 'none'); assert.equal(env.audio.src, undefined);
  assert.equal(await env.sound.tryAutoplay(), false);
  assert.equal(env.audio.src, undefined); assert.equal(env.audio.playCalls, undefined);
  assert.equal(env.button.disabled, false);
  env.platform.navigator.userActivation.isActive = true;
  await env.sound.toggle();
  assert.equal(env.audio.src, 'music.mp3'); assert.equal(env.audio.playCalls, 1);
  assert.equal(env.audio.paused, false); env.sound.destroy();
});

test('unknown-policy autoplay still starts when allowed and releases its source after a blocked attempt', async () => {
  const env = soundEnvironment(); env.audio.blocked = true;
  await env.sound.tryAutoplay();
  assert.equal(env.audio.src, ''); assert.equal(env.audio.released, true); assert.equal(env.audio.playCalls, 1);
  env.audio.blocked = false; await env.sound.toggle();
  assert.equal(env.audio.src, 'music.mp3'); assert.equal(env.audio.playCalls, 2);
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

test('manual muting during a pending play request survives its late success and further gestures', async () => {
  const env = soundEnvironment(); let finishPlay, calls = 0;
  env.audio.play = () => { calls++; return new Promise(resolve => { finishPlay = () => { env.audio.paused = false; resolve(); }; }); };
  const starting = env.sound.tryAutoplay();
  await env.sound.toggle(); finishPlay(); await starting;
  assert.equal(env.audio.paused, true); assert.equal(env.button.attrs.get('data-sound-state'), 'muted');
  assert.equal(await env.sound.tryAutoplay(), false); assert.equal(calls, 1);
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
  const manifest = JSON.parse(readFileSync(new URL('../public/assets/loading-screen/journey-v6-manifest.json', import.meta.url), 'utf8'));
  assert.deepEqual(LOADING_SCREEN_JOURNEYS.map(({ cast }) => cast.map(([id]) => id)),
    [['duncan', 'gawain', 'ylva', 'freki']]);
  assert.match(css, /steps\(4, jump-none\)/);
  assert.doesNotMatch(source, /loading-screen-walk/);
  for (const { id, cast } of LOADING_SCREEN_JOURNEYS) {
    const { panorama, atlas } = manifest.groups[id];
    assert.deepEqual(atlas.order, cast.map(([id]) => id));
    assert.equal(atlas.columns, 4);
    assert.deepEqual(atlas.asset.size, [atlas.columns * atlas.cell, atlas.rows * atlas.cell]);
    for (const asset of panorama.assets) assert.equal(asset.size[0], asset.size[1] * 4);
    verifyAssets([panorama.source, ...panorama.assets, ...atlas.sources, atlas.asset]);
  }
  const { room, atlas } = manifest.council;
  assert.deepEqual(atlas.order, HEROLDS_COUNCIL.cast.map(([person]) => person));
  assert.equal(atlas.rows, atlas.order.length);
  assert(atlas.sources.some(item => item.file.endsWith('/cadogan-hut-gesten-v6.png')));
  assert.equal(atlas.columns, 4);
  assert.deepEqual(atlas.asset.size, [atlas.columns * atlas.cell, atlas.rows * atlas.cell]);
  for (const asset of room.assets) assert.equal(asset.size[0] * 3, asset.size[1] * 4);
  verifyAssets([room.source, ...room.assets, ...atlas.sources, atlas.asset]);
  const courtyard = JSON.parse(readFileSync(new URL('../public/assets/loading-screen/oweta-courtyard-v8-manifest.json', import.meta.url), 'utf8'));
  assert.deepEqual(courtyard.source.size, [1536, 1024]);
  assert.equal(courtyard.assets.length, 3);
  for (const asset of courtyard.assets) assert.equal(asset.size[0] * 2, asset.size[1] * 3);
  verifyAssets([courtyard.source, ...courtyard.assets]);
  const chase = JSON.parse(readFileSync(new URL('../public/assets/loading-screen/rosenflucht-v11-manifest.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(chase.chase.actors), ['idwal', 'trevor', 'pyderi']);
  for (const atlas of Object.values(chase.chase.actors)) {
    assert.equal(atlas.columns, 4);
    assert.equal(atlas.order.flat().length, 8);
    assert.deepEqual(atlas.asset.size, [atlas.cell * 4, atlas.cell * 2]);
  }
  for (const pair of [chase.courtyard, chase.chase.garden, chase.chase.hedge, ...Object.values(chase.chase.actors)]) {
    verifyAssets([pair.source, pair.asset]);
  }
  for (const painting of Object.values(chase.paintings)) verifyAssets([painting.source, ...painting.assets]);
  assert.doesNotMatch(html + css, /highland-road-v5|travellers-stride-v5/);
  assert.doesNotMatch(html + css, /(?:travellers|gawain|freya|guinevere|fenrir|gaul)-walk-v[12]\.webp/);
  assert.doesNotMatch(css, /journey-body/);
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

function verifyAssets(assets) {
  for (const asset of assets) {
    const bytes = readFileSync(new URL(`../${asset.file}`, import.meta.url));
    assert.equal(bytes.length, asset.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  }
}

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

test('travellers keep static poses until their own complete rig is ready; failed parts keep the fallback', async () => {
  const previousDocument = globalThis.document, previousImage = globalThis.Image;
  const requests = [];
  globalThis.Image = class {
    set src(value) { this.source = value; requests.push(this); }
    removeAttribute() { this.released = true; }
  };
  const node = () => ({ attrs: {}, style: {}, children: [], setAttribute(key, value) { this.attrs[key] = value; }, append(child) { this.children.push(child); } });
  globalThis.document = { createElementNS: () => node() };
  const actor = name => ({ dataset: { loadingTraveller: name }, children: ['static pose'], replaceChildren(child) { this.children = [child]; } });
  const actors = [actor('gawain'), actor('freya')], root = { querySelectorAll: () => actors };
  try {
    const mounted = mountLoadingScreenWalk(root);
    assert.equal(requests.length, 6); assert.deepEqual(actors[0].children, ['static pose']);
    requests.filter(image => image.source.includes('gawain')).forEach(image => image.onload());
    await settle();
    assert.equal(actors[0].dataset.rig, 'true'); assert.deepEqual(actors[1].children, ['static pose']);
    requests.filter(image => image.source.includes('freya')).forEach((image, index) => index ? image.onload() : image.onerror());
    await mounted;
    assert.equal(actors[1].dataset.rig, undefined); assert.deepEqual(actors[1].children, ['static pose']);
  } finally { globalThis.document = previousDocument; globalThis.Image = previousImage; }
});

test('leaving the loading screen cancels pending rig images and prevents a late DOM replacement', async () => {
  const previousImage = globalThis.Image, requests = [], controller = new AbortController();
  globalThis.Image = class { set src(value) { requests.push(this); } removeAttribute() { this.released = true; } };
  const actor = { dataset: { loadingTraveller: 'gawain' }, replaceChildren() { throw Error('must retain static pose'); } };
  try {
    const mounted = mountLoadingScreenWalk({ querySelectorAll: () => [actor] }, { signal: controller.signal });
    controller.abort(); await mounted;
    assert.equal(actor.dataset.rig, undefined); assert.equal(requests.length, 3);
    assert.ok(requests.every(image => image.released));
  } finally { globalThis.Image = previousImage; }
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
