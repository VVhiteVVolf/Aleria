import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';

await import('../assets/js/pins/category-catalog.js');
await import('../assets/js/pins/pin-placeholder-images.js');

const placeholders = globalThis.KartoPinPlaceholders;
const testDirectory = dirname(fileURLToPath(import.meta.url));
const asset = name => `/Karten/assets/images/pin-placeholders/${name}.webp`;
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('pins without an image receive a stable project placeholder', () => {
  const pin = { id: 'gwynthor-markt', title: 'Markt von Gwynthor', x: 42, y: 17 };
  const first = placeholders.resolve(pin);
  const second = placeholders.resolve(pin);

  assert.equal(first.src, second.src);
  assert.equal(first.isPlaceholder, true);
  assert.equal(first.link, '');
  assert.ok(placeholders.sources.includes(first.src));
});

test('every configured placeholder exists in the project', () => {
  for(const source of placeholders.sources){
    const projectPath = resolve(testDirectory, '..', source.replace(/^\/Karten\//, ''));
    assert.equal(existsSync(projectPath), true, `${source} fehlt`);
  }
});

test('an explicit pin image and its link take precedence', () => {
  const result = placeholders.resolve({
    id: 'gwynthor-markt',
    img: '/eigene-bilder/markt.webp',
    imgLink: '/orte/gwynthor/markt',
    templateId: 'handel',
  });

  assert.deepEqual(result, {
    src: '/eigene-bilder/markt.webp',
    link: '/orte/gwynthor/markt',
    isPlaceholder: false,
  });
});

test('every settlement category has its own image regardless of its map-specific ID', () => {
  const categories = JSON.parse(read('../_template/data.json')).state.cats;
  const selected = categories.map(category => placeholders.select({ cat: 'custom-id', templateId: 'siedlung' }, { ...category, id: 'custom-id' }));
  assert.equal(categories.length, 20);
  assert.equal(new Set(selected).size, categories.length);
  assert.ok(selected.every(source => source.includes('/settlement-')));
  assert.equal(placeholders.select({}, { label: '  BRÜCKENSIEDLUNG ' }), asset('settlement-brueckensiedlung'));
  assert.equal(placeholders.select({}, { label: 'Brueckensiedlung' }), asset('settlement-brueckensiedlung'));
});

test('every actual stamp template has its own image, with specific templates taking priority', () => {
  const context = vm.createContext({ window: { KartoRuntime: {} } });
  vm.runInContext(read('../assets/js/pins/pin-templates.js'), context);
  const templates = context.window.PIN_TEMPLATES;
  assert.equal(templates.length, 14);
  for (const template of templates) {
    assert.equal(placeholders.select({ templateId: template.id }), asset(`template-${template.id}`));
    const expected = template.id === 'siedlung' ? 'settlement-hauptstadt' : `template-${template.id}`;
    assert.equal(placeholders.select({ templateId: template.id }, { label: 'Hauptstadt' }), asset(expected));
  }
});

test('changing category or template immediately changes the fallback without modifying the pin', () => {
  const pin = { id: 'one', cat: 'custom', templateId: 'siedlung', img: '', imgLink: '/stale-link' };
  const original = structuredClone(pin);
  assert.equal(placeholders.resolve(pin, { label: 'Hauptstadt' }).src, asset('settlement-hauptstadt'));
  assert.equal(placeholders.resolve(pin, { label: 'Taverne' }).src, asset('settlement-taverne'));
  assert.equal(placeholders.resolve({ ...pin, templateId: 'handwerk' }, { label: 'Taverne' }).src, asset('template-handwerk'));
  assert.deepEqual(pin, original);
  assert.equal(placeholders.resolve(pin).link, '');
});

test('saved built-in placeholders follow the current category and template too', () => {
  for (const img of [asset('default-siedlung'), asset('settlement-hauptstadt'), `https://example.test${asset('default-waldsiedlung')}?v=old`]) {
    assert.deepEqual(placeholders.resolve({ img, imgLink: '/stale', templateId: 'dungeon' }), {
      src: asset('template-dungeon'), link: '', isPlaceholder: true,
    });
  }
});

test('unknown templates and categories have a predictable square village fallback', () => {
  assert.equal(placeholders.select({ templateId: 'unknown' }, { label: 'Hafenfest' }), asset('template-siedlung'));
  assert.equal(placeholders.select({ templateId: 'unknown' }, { label: 'Hafensiedlung' }), asset('settlement-hafensiedlung'));
  assert.equal(placeholders.select({ id: 'one', title: 'A' }), placeholders.select({ id: 'two', title: 'B', x: 1 }));
});

test('smaller location categories and saved aliases choose their matching art', () => {
  for(const category of globalThis.KartoCategoryCatalog.definitions){
    const expected = asset(category.asset);
    assert.equal(placeholders.select({}, category), expected);
    for(const label of category.aliases){
      assert.equal(placeholders.select({templateId:'siedlung'}, {id:'map-specific',label}), expected);
    }
  }
  assert.equal(placeholders.select({}, {label:'Einfacher Hof'}), asset('location-bauernhof'));
  assert.equal(placeholders.select({templateId:'militaer'}, {label:'Mine'}), asset('template-militaer'));
});
