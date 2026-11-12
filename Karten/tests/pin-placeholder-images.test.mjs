import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';
import { FLEISCHSAMMLER_LOCALITIES, FLEISCHSAMMLER_MAP_ID } from '../../Stammbäume/assets/js/data/gwynthor-fleischsammler/localities.mjs';

await import('../assets/js/pins/category-catalog.js');
await import('../assets/js/pins/pin-template-catalog.js');
await import('../assets/js/pins/pin-table-presets.js');
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
  vm.runInContext(read('../assets/js/pins/pin-template-catalog.js'), context);
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

test('matching template families use the specific location artwork for every category and alias', () => {
  for(const category of KartoCategoryCatalog.definitions){
    const templateId = KartoPinTablePresets.forCategory(category).templateId;
    const pin = {templateId, table:KartoPinTablePresets.createTable(templateId,category)};
    const original = structuredClone(pin);
    assert.equal(placeholders.resolve(pin,category).src,asset(category.asset),category.label);
    for(const label of category.aliases){
      assert.equal(placeholders.resolve(pin,{id:'custom-category',label}).src,asset(category.asset),label);
    }
    assert.deepEqual(pin,original);
  }
});

test('previously saved generic artwork is corrected while uploaded images and links stay intact', () => {
  const category = {label:'Mine'};
  for(const img of ['',asset('template-handwerk'),asset('default-siedlung')]){
    assert.equal(placeholders.resolve({templateId:'handwerk',img},category).src,asset('location-mine'));
  }
  assert.deepEqual(placeholders.resolve({templateId:'handwerk',img:'/my-mine.jpg',imgLink:'/my-mine'},category),{
    src:'/my-mine.jpg',link:'/my-mine',isPlaceholder:false,
  });
  assert.equal(placeholders.resolve({templateId:'militaer'},category).src,asset('template-militaer'));
});

test('every imported Gwynthor pin uses its reviewed location motif without changing map data', () => {
  const state = JSON.parse(read('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json')).state;
  const inventory = JSON.parse(read('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/markings.inventory.json'));
  const source = JSON.parse(read('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/fleischsammler-localities.source.json'));
  const pert = JSON.parse(read('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/pert-maesglas.source.json'));
  assert.equal(pert.pinId, 'gwynthor-marking-157');
  assert.equal(pert.originalPin.id, pert.pinId);
  assert.equal(source.mapId, FLEISCHSAMMLER_MAP_ID);
  assert.equal(source.locations.length, 7);
  assert.equal(new Set(source.locations.map(location => location.pinId)).size, 7);
  assert.deepEqual(source.locations.map(location => location.pinId).sort(), FLEISCHSAMMLER_LOCALITIES.map(location => location.pinId).sort());
  const original = structuredClone(state);
  const imported = state.pins.filter(pin => pin.id.startsWith('gwynthor-marking-'));
  assert.equal(imported.length,158);
  let unchangedMotifs = 0;
  for(const pin of imported){
    const marking = inventory.markings.find(item => item.id === pin.id);
    const profile = source.locations.find(location => location.pinId === pin.id);
    let category = { id: marking.categoryId };
    if (profile) {
      // Keep the historical symbol inventory intact. Only the seven declared
      // authored places may use their reviewed, more specific current motif.
      assert.equal(profile.originalTitle, marking.title, pin.id);
      assert.deepEqual([pin.x, pin.y], profile.position, pin.id);
      assert.equal(pin.title, profile.patch.title, pin.id);
      assert.equal(pin.cat, profile.patch.cat, pin.id);
      assert.equal(pin.templateId, profile.patch.templateId, pin.id);
      // Older maps retain local IDs for Heim/Einfacher Hof. Their unchanged
      // category labels resolve through the shared catalog's existing aliases.
      category = state.cats.find(item => item.id === profile.patch.cat);
      assert.ok(category, pin.id);
      assert.ok(KartoCategoryCatalog.definition(category), pin.id);
    } else unchangedMotifs++;
    // A later authored farm has its own image. Verify its retained original
    // only for this historical import-motif contract; the Pert tests verify
    // the actual current farm, images, table, links and all foreign pin data.
    const motifPin = pin.id === pert.pinId ? pert.originalPin : pin;
    if (pin.id === pert.pinId) assert.deepEqual([pin.x, pin.y], pert.position, pin.id);
    const expected = KartoCategoryCatalog.placeholder(category);
    assert.equal(placeholders.resolve(motifPin,state.cats.find(cat => cat.id === motifPin.cat)).src,expected,pin.id);
  }
  assert.equal(unchangedMotifs, 151, 'Every other imported pin retains its exact historical motif');
  assert.deepEqual(state,original);
});
