import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const feature = new URL('../', import.meta.url);
const registryContext = { window: {} };
vm.runInNewContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);
const registry = ['haus-twyllod', 'haus-cwningod'].map(id => registryContext.window.HaeuserRegistry.byId(id));
const loader = readFileSync(new URL('assets/js/haeuser-loader.js', feature), 'utf8');

function load(search = '', hash = '') {
  const scripts = [], title = { textContent: '' };
  const root = { dataset: { defaultId: 'haeuser-vorlage' }, innerHTML: '', querySelector: () => title };
  const document = {
    currentScript: { src: 'https://aleria.example/Familien%20H%C3%A4user%20und%20Clans/assets/js/haeuser-loader.js' },
    querySelector: () => root,
    createElement: () => ({ dataset: {} }),
    head: { appendChild: script => scripts.push(script) },
  };
  const window = { HAEUSER_REGISTRY: registry, location: { search, hash, href: `https://aleria.example/haus.html${search}${hash}` } };
  vm.runInNewContext(loader, { window, document, URL, URLSearchParams });
  return { window, root, scripts, title };
}

test('canonical and documented legacy Cwingod URLs load the same actual house and tree data source', () => {
  const canonical = load('?haus=haus-cwningod', '#stammbaum');
  const alias = load('?haus=haus-cwingod', '#stammbaum');
  assert.equal(registryContext.window.HaeuserRegistry.byId('haus-cwingod').id, 'haus-cwningod');
  for (const result of [canonical, alias]) {
    assert.equal(result.window.HAEUSER_CONFIG.docId, 'haus-cwningod');
    assert.equal(result.root.dataset.haeuserId, 'haus-cwningod');
    assert.match(result.title.textContent, /Cwingod/);
    assert.equal(result.scripts.length, 1);
    assert.match(result.scripts[0].src, /Haus_Cwingod\/haus\.data\.js/);
    assert.doesNotMatch(result.scripts[0].src, /Twyllod/);
  }
  assert.equal(alias.scripts[0].src, canonical.scripts[0].src);
});

test('an explicit unknown household shows the existing missing-house state without loading a different family', () => {
  for (const query of ['?haus=haus-unbekannt', '?familie=haus-unbekannt', '?id=haus-unbekannt']) {
    const result = load(query);
    assert.equal(result.scripts.length, 0);
    assert.equal(result.window.HAEUSER_CONFIG, undefined);
    assert.match(result.root.innerHTML, /Haus nicht gefunden/);
    assert.match(result.root.innerHTML, /haus-unbekannt/);
  }
});

test('the route without an explicit ID keeps its established default behavior, including section fragments', () => {
  for (const hash of ['', '#stammbaum']) {
    const result = load('', hash);
    assert.equal(result.window.HAEUSER_CONFIG.docId, 'haus-twyllod');
    assert.equal(result.scripts.length, 1);
  }
});
