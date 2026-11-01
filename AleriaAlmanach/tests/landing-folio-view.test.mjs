import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { normalizeLandingData } from '../modules/landing/landing-model.js';
import { renderGroupBody } from '../modules/landing/group-landing-view.js';
import { landingQuestJournalShell } from '../modules/landing/landing-quest-model.js';
import { LANDING_FOLIO_COVER, renderLandingFolioHeader, renderLandingFolioIndex, landingFolioIcon } from '../modules/landing/landing-folio-view.js';
import { html } from '../modules/landing/group-landing-markup.js';

// Use the HTML parser already installed with this repository's Firebase test
// tooling. Parse real elements and attributes rather than matching layout text.
const { parseFragment } = createRequire(new URL('../../firebase/package.json', import.meta.url))('parse5');
const attr = (node, name) => node.attrs?.find(attribute => attribute.name === name)?.value;
const nodes = root => (root.childNodes || []).flatMap(node => [node, ...nodes(node)]);
const withAttr = (root, name, value) => nodes(root).filter(node => attr(node, name) != null && (value == null || attr(node, name) === value));
const hasClass = (node, name) => (attr(node, 'class') || '').split(/\s+/).includes(name);
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
const entry = { id: 'test-crew', title: 'Testgemeinschaft', symbol: '/seal.png' };

test('cover URLs retain query parameters when the application image sanitizer already escapes HTML', () => {
  const safety = vm.createContext({ URL, window: { location: { href: 'https://example.test/' } } });
  vm.runInContext(readFileSync(new URL('../modules/core/content-safety.js', import.meta.url), 'utf8'), safety);
  const previous = globalThis.sanitizeImageSrc;
  globalThis.sanitizeImageSrc = safety.sanitizeImageSrc;
  try {
    const cover = '/cover.webp?palette=green&quality=80';
    const seal = '/seal.png?size=100&crop=face';
    const root = parseFragment(renderLandingFolioHeader({ title: 'Gemeinschaft', coverImage: cover, bannerImage: seal }));
    const images = nodes(root).filter(node => node.tagName === 'img');
    assert.equal(attr(images.find(node => hasClass(node, 'landing-folio-cover')), 'src'), cover);
    assert.equal(attr(images.find(node => hasClass(node, 'group-crest')), 'src'), seal);
  } finally {
    if (previous === undefined) delete globalThis.sanitizeImageSrc;
    else globalThis.sanitizeImageSrc = previous;
  }
});
const groupView = presentation => {
  const data = normalizeLandingData({ presentation, group: {}, title: 'Gemeinschaft' });
  return parseFragment(renderGroupBody(data, entry, 3, [], [], null, {
    journal: landingQuestJournalShell(entry.id), quests: '<section data-local-planning></section>', notes: '', events: '', info: '', map: ''
  }));
};

function rendererContext() {
  const listeners = new Map();
  const document = { addEventListener(type, callback) { (listeners.get(type) || listeners.set(type, []).get(type)).push(callback); }, querySelectorAll() { return []; } };
  const context = vm.createContext({ console, document, escapeHtml: html, sanitizeLandingData: normalizeLandingData,
    buildNav: () => '<nav data-page-navigation></nav>', sanitizeImageSrc: source => source || '',
    sanitizeHref: source => source || '', getInitialChar: value => value?.slice(0, 1) || '*',
    normalizeSearchText: value => String(value).toLowerCase(), moduleEntries: [],
    AleriaLandingModel: { renderLandingFolioHeader, renderLandingFolioIndex, landingFolioIcon, landingQuestJournalShell } });
  vm.runInContext(readFileSync(new URL('../modules/landing/landing-renderer.js', import.meta.url), 'utf8'), context);
  return { context, listeners };
}
const normalData = presentation => normalizeLandingData({ presentation, title: 'Unsere Wege', coverImage: '/cover.png', bannerImage: '/seal.png',
  members: [{ id: 'member', name: 'Testfigur' }], quests: [{ id: 'local', title: 'Eigenes Vorhaben', moduleId: 'quest-module' }],
  notes: [{ id: 'note', title: 'Chronikeintrag', text: 'Ein Weg beginnt.' }], mapLink: 'https://example.test/map', mapImage: '/map.png' });

test('existing groups keep their classic presentation unless they explicitly select the folio', () => {
  for (const presentation of [undefined, 'classic', 'unknown']) {
    const root = groupView(presentation);
    assert.equal(nodes(root).some(node => hasClass(node, 'landing-folio')), false);
    assert.equal(withAttr(root, 'data-group-region', 'clock').length, 1);
    assert.equal(withAttr(root, 'data-group-tab').length, 6);
  }
  assert.equal(nodes(groupView('folio')).some(node => hasClass(node, 'landing-folio')), true);
});

test('group folios preserve one live clock, six accessible tabs and both reward and journal mount points', () => {
  const root = groupView('folio');
  assert.equal(withAttr(root, 'data-group-region', 'clock').length, 1);
  for (const region of ['summary', 'roster', 'inventory', 'scene', 'error']) assert.equal(withAttr(root, 'data-group-region', region).length, 1);
  const keys = ['roster', 'scene', 'quests', 'inventory', 'notes', 'map'];
  const tabs = withAttr(root, 'data-group-tab');
  assert.deepEqual(tabs.map(tab => attr(tab, 'data-group-tab')), keys);
  const ids = nodes(root).filter(node => attr(node, 'id')).map(node => attr(node, 'id'));
  assert.equal(new Set(ids).size, ids.length);
  for (const tab of tabs) {
    const key = attr(tab, 'data-group-tab');
    const [panel] = withAttr(root, 'data-group-tab-panel', key);
    assert.ok(panel);
    assert.equal(attr(tab, 'role'), 'tab');
    assert.equal(attr(panel, 'role'), 'tabpanel');
    assert.equal(attr(tab, 'aria-controls'), attr(panel, 'id'));
    assert.equal(attr(panel, 'aria-labelledby'), attr(tab, 'id'));
    assert.equal(attr(tab, 'aria-selected'), String(key === 'roster'));
    assert.equal(attr(panel, 'hidden') != null, key !== 'roster');
  }
  const [quests] = withAttr(root, 'data-group-tab-panel', 'quests');
  assert.equal(withAttr(quests, 'data-landing-quest-journal').length, 1);
  assert.equal(withAttr(quests, 'data-landing-quest-content').length, 1);
  assert.equal(withAttr(quests, 'data-local-planning').length, 1);
  const [inventory] = withAttr(root, 'data-group-tab-panel', 'inventory');
  assert.equal(withAttr(inventory, 'data-group-quest-account').length, 1);
  for (const action of ['settings', 'select', 'guest', 'hierarchy', 'scene', 'inventory', 'register', 'map']) assert.ok(withAttr(root, 'data-group-action', action).length);
});

test('folio headers escape text and image attributes and reject executable image schemes', () => {
  const title = '"><script>alert(1)</script>& Gefährten';
  const subtitle = '<img src=x onerror=alert(1)>';
  const image = 'https://example.test/portrait.png?title=" onerror="bad&x=1';
  const root = parseFragment(renderLandingFolioHeader({ title, subtitle, coverImage: image, bannerImage: image }));
  assert.equal(text(nodes(root).find(node => node.tagName === 'h2')), title);
  assert.equal(text(nodes(root).find(node => node.tagName === 'p')), subtitle);
  assert.equal(nodes(root).filter(node => node.tagName === 'script').length, 0);
  const images = nodes(root).filter(node => node.tagName === 'img');
  assert.equal(images.length, 2);
  assert.ok(images.every(node => attr(node, 'src') === image));
  assert.ok(nodes(root).every(node => !(node.attrs || []).some(attribute => /^on/i.test(attribute.name))));
  const rejected = parseFragment(renderLandingFolioHeader({ title, coverImage: 'javascript:alert(1)', bannerImage: 'data:text/html,<script>bad</script>' }));
  assert.equal(nodes(rejected).filter(node => node.tagName === 'img').length, 0);
});

test('cover artwork and the personal seal use separate sources with a neutral cover fallback', () => {
  const render = data => nodes(parseFragment(renderLandingFolioHeader(data, { symbol: '/entry-seal.png' }))).filter(node => node.tagName === 'img');
  const selected = render({ title: 'Reise', coverImage: '/own-cover.png', bannerImage: '/own-seal.png' });
  assert.equal(attr(selected.find(node => hasClass(node, 'landing-folio-cover')), 'src'), '/own-cover.png');
  assert.equal(attr(selected.find(node => hasClass(node, 'group-crest')), 'src'), '/own-seal.png');
  const fallback = render({ title: 'Reise' });
  assert.equal(attr(fallback.find(node => hasClass(node, 'landing-folio-cover')), 'src'), LANDING_FOLIO_COVER);
  assert.equal(attr(fallback.find(node => hasClass(node, 'group-crest')), 'src'), '/entry-seal.png');
});

test('ordinary folio pages expose real chapter targets while retaining planning, maps and editing actions', () => {
  const { context } = rendererContext();
  for (const presentation of [undefined, 'classic']) {
    const root = parseFragment(context.buildLandingPage({ landing: normalData(presentation) }, entry, 0, 1));
    assert.equal(nodes(root).some(node => hasClass(node, 'landing-folio')), false);
  }
  const root = parseFragment(context.buildLandingPage({ landing: normalData('folio') }, { ...entry, subtitle: 'Die vorhandene Einleitung des Moduls.' }, 0, 1));
  assert.ok(text(root).includes('Die vorhandene Einleitung des Moduls.'));
  assert.equal(withAttr(root, 'data-page-navigation').length, 1);
  const indexLinks = withAttr(root, 'data-landing-action', 'jump-section');
  assert.equal(indexLinks.length, 4);
  for (const link of indexLinks) {
    const matches = withAttr(root, 'data-landing-section', attr(link, 'data-landing-section-target'));
    assert.equal(matches.length, 1);
    assert.equal(attr(matches[0], 'tabindex'), '-1');
  }
  assert.equal(withAttr(root, 'data-landing-quest-journal').length, 1);
  assert.equal(withAttr(root, 'data-landing-quest-content').length, 1);
  assert.equal(withAttr(root, 'data-quest-id', 'local').filter(node => node.tagName === 'article').length, 1);
  for (const action of ['filter-quests', 'edit-quest', 'complete-quest', 'delete-quest', 'open-quest-module', 'edit-note', 'delete-note', 'open-map-link', 'edit-settings']) assert.ok(withAttr(root, 'data-landing-action', action).length, `missing ${action}`);
  assert.ok(withAttr(root, 'data-module-id', 'quest-module').length);
  assert.ok(withAttr(root, 'data-note-id', 'note').length);
  assert.equal(withAttr(root, 'data-group-region', 'clock').length, 0);
});

test('chapter buttons scroll and focus the rendered target, respecting reduced motion', () => {
  for (const reducedMotion of [false, true]) {
    const { context, listeners } = rendererContext();
    context.matchMedia = () => ({ matches: reducedMotion });
    const calls = [];
    const section = { scrollIntoView: options => calls.push(['scroll', options.behavior, options.block]), focus: options => calls.push(['focus', options.preventScroll]) };
    const page = { querySelector(selector) { assert.equal(selector, '[data-landing-section="adventures"]'); return section; } };
    const trigger = { dataset: { landingAction: 'jump-section', landingSectionTarget: 'adventures' }, closest: selector => selector === '.landing-page' ? page : null };
    const target = { closest: selector => selector === '[data-landing-action]' ? trigger : null };
    for (const listener of listeners.get('click')) listener({ target, preventDefault() {} });
    assert.deepEqual(calls, [['scroll', reducedMotion ? 'auto' : 'smooth', 'start'], ['focus', true]]);
  }
});
