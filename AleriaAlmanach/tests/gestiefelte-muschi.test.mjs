import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { buildMuschiPackage } from '../modules/gestiefelte-muschi/muschi-package.mjs';
import { MUSCHI_PEOPLE, MUSCHI_PETS } from '../modules/gestiefelte-muschi/muschi-people.mjs';
import { MUSCHI_RARITIES } from '../modules/gestiefelte-muschi/muschi-goods.mjs';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { resolveCreatureBestiaryReference } from '../modules/creatures/creature-bestiary-reference.js';
import { planMuschiCharacters } from '../modules/gestiefelte-muschi/muschi-characters.mjs';
const root = new URL('../../', import.meta.url);
const entry = await buildMuschiPackage();

test('rare bottles have finite four/five-bottle stocks and four-to-tenfold prices', () => {
  const items = entry.pages[3].tradeCatalog.items;
  assert.equal(new Set(items.map(i => i.id)).size, items.length);
  assert.equal(entry.pages[3].tradeCatalog.categories.length, 4);
  assert.equal(items.filter(i => i.category === 'brevanor').length, 5);
  assert.equal(MUSCHI_RARITIES.reduce((sum, r) => sum + r.stock, 0), 22);
  for (const r of MUSCHI_RARITIES) {
    assert.ok([4, 5].includes(r.stock)); assert.ok(r.multiple >= 4 && r.multiple <= 10);
    const item = items.find(i => i.id === r.id);
    assert.equal(Number(item.priceMin.replaceAll('.', '').replace(',', '.')), r.base * r.multiple);
    assert.ok(item.features.some(f => f.includes(`${r.stock} Flaschen`)));
    assert.match(item.conditions, /keine Nachbeschaffung/);
    assert.equal(item.priceOptions.length, 0);
  }
  assert.equal(items.some(i => ['speisen', 'hauskarte', 'food'].includes(i.category)), false);
  assert.ok(items.some(i => /Rosenstolz/.test(i.title)));
  assert.ok(items.some(i => /Penderyn/.test(i.title)));
  assert.ok(items.some(i => /Hellwacht/.test(i.title)));
});

test('adults, retainers, pets and reserved writing space follow the brief', () => {
  assert.equal(MUSCHI_PEOPLE.length, 15);
  assert.equal(new Set(MUSCHI_PEOPLE.map(p => p.worldPersonId)).size, 15);
  assert.ok(MUSCHI_PEOPLE.every(p => p.age >= 24));
  const retained = MUSCHI_PEOPLE.filter(p => p.retained);
  assert.equal(retained.length, 4); assert.ok(retained.every(p => p.age < 50));
  assert.equal(retained.filter(p => p.sex === 'female').length, 2);
  assert.ok(MUSCHI_PEOPLE.filter(p => p.key !== 'helviane').every(p => !p.name.includes(' ')));
  assert.deepEqual(entry.pages[2].hierarchy.trees.map(t => t.label), ['Führung & Logistik', 'Ausschank', 'Gesellschaft & Unterhaltung', 'Sicherheit', 'Tiere']);
  assert.equal(entry.pages[2].hierarchy.trees.find(t => t.id === 'sicherheit').levels[1].nodes.length, 6);
  assert.equal(entry.pages[5].guestRegister.sections.flatMap(s => s.guests).length, 32);
  for (const cat of MUSCHI_PETS.filter(p => p.species === 'Samtlicht')) assert.deepEqual(resolveCreatureBestiaryReference(cat), cat.bestiaryReference);
  assert.equal(resolveCreatureBestiaryReference(MUSCHI_PETS.find(p => p.species === 'Pudel')), null);
  assert.equal(entry.pages.filter(p => p.sessionPage).length, 4);
  assert.equal(new Set(entry.pages.map(p => p.commentThreadKey)).size, entry.pages.length);
});

test('Brevanor receives heraldry records without invented family members', () => {
  const bielle = FAMILY_REGISTRY.filter(f => f.id === 'haus-bielle');
  const desele = FAMILY_REGISTRY.filter(f => f.id === 'haus-desele');
  assert.equal(bielle.length, 1); assert.equal(desele.length, 1);
  for (const record of [...bielle, ...desele]) { assert.deepEqual([...record.folderPath], ['Brevanor']); assert.equal(record.family.partnerships.length, 0); }
  assert.equal(bielle[0].family.persons.length, 0);
  assert.equal(desele[0].family.persons.length, 1);
  assert.equal(desele[0].family.persons[0].worldPersonId, MUSCHI_PEOPLE[0].worldPersonId);
});

test('generated registration is idempotent and all selected art resolves locally', async () => {
  const code = await readFile(new URL('../modules/gestiefelte-muschi/muschi-data.js', import.meta.url), 'utf8');
  const context = vm.createContext({ SECTIONS: [] });
  vm.runInContext(code, context); vm.runInContext(code, context);
  assert.equal(context.SECTIONS.flatMap(s => s.entries).filter(e => e.id === entry.id).length, 1);
  const manifest = JSON.parse(await readFile(new URL('../assets/gestiefelte-muschi/image-prompts.json', import.meta.url), 'utf8'));
  for (const job of manifest.entries) await access(new URL(job.destination, root));
  const localImages = new Set();
  const collectImages = value => {
    if (typeof value === 'string' && /^\.\.?\//.test(value) && /\.(png|webp|jpe?g|svg)$/i.test(value)) localImages.add(value);
    else if (value && typeof value === 'object') Object.values(value).forEach(collectImages);
  };
  collectImages(entry);
  for (const path of localImages) await access(new URL(path, new URL('AleriaAlmanach/', root)));
  assert.equal(manifest.entries.length, 41);
  assert.equal(manifest.entries.find(j => j.id === 'schild').destination.endsWith('schild-v2.png'), true);
});

test('later character publication preserves existing profiles and live resources', () => {
  const initial = planMuschiCharacters();
  assert.equal(initial.entries.length, 15);
  assert.equal(new Set(initial.entries.map(e => e.id)).size, 15);
  const existing = { ...initial.entries[0].data, id: 'existing-online-id', portrait: 'personal-portrait.png', bio: 'Eigene Fassung', resources: { hp: 7 } };
  const before = structuredClone(existing);
  const planned = planMuschiCharacters([existing]);
  const owner = planned.entries.find(e => e.key === 'helviane');
  assert.equal(owner.id, existing.id); assert.equal(owner.create, false);
  assert.deepEqual(existing, before);
  assert.ok(!owner.patch || Object.keys(owner.patch).every(key => ['genealogy', 'updatedAt'].includes(key)));
});
