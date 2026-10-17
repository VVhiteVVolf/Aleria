import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { GOFRANN_PEOPLE, GOFRANN_MARRIAGES, gofrannPerson } from '../modules/gofrann-schmiede/gofrann-people.mjs';
import { buildGofrannModule } from '../modules/gofrann-schmiede/gofrann-module.mjs';
import { GOFRANN_STANDARD_ITEMS } from '../modules/gofrann-schmiede/gofrann-catalog.mjs';
import { GOFRANN_PRODUCTS, GOFRANN_OWN_CATEGORIES } from '../modules/gofrann-schmiede/gofrann-products.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { HOUSE_GOFRANN_FAMILY as family } from '../../Stammbäume/assets/js/data/gofrann-family-records.js';
import { HOUSE_TLAWD_FAMILY as tlawd } from '../../Stammbäume/assets/js/data/house-tlawd-family.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { assertMirroredCrossFamilyBatch } from '../../Stammbäume/assets/js/modules/family-sync/cross-family-sync-invariant.js';
import { auditFamilyChartLayoutPolicy } from '../../Stammbäume/assets/js/adapters/family-chart-layout-policy.js';

const entry = buildGofrannModule();

test('Gofrann starts with unknown founders, the house knot and one serial gap', () => {
  assertValidFamily(family); assertValidFamily(tlawd);
  const record = FAMILY_REGISTRY.find(r => r.id === 'haus-gofrann');
  assert.equal(record.type, 'commoner');
  assert.ok(record.folderPath.includes('Gwynthor'));
  assert.equal(family.persons.length, 24);
  const founders = family.partnerships.find(p => p.id === family.lineage.founderPartnershipId);
  assert.deepEqual(founders.participantIds.map(id => family.persons.find(p => p.id === id).name), ['Unbekannter Gründer','Unbekannte Gründerin']);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.timeJumps[0].parentPartnershipId, founders.id);
  assert.deepEqual(family.timeJumps[0].childIds, ['edern-gofrann','caradfan-gofrann']);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  assert.equal(family.lineage.crestFrame, 'iron');
  assert.equal(family.extensions.publication.allowed, true);
});

test('both old masters are cousins, with plausible dates and exact portrait ages', () => {
  assert.equal(gofrannPerson('gethin').portraitAge, 71);
  assert.equal(gofrannPerson('bleddyn').portraitAge, 68);
  for (const [child, father] of [['gethin','edern'],['bleddyn','caradfan']]) {
    const parentage = family.parentages.find(p => p.childId === gofrannPerson(child).id);
    assert.ok(parentage.parentIds.includes(gofrannPerson(father).id));
  }
  for (const p of GOFRANN_PEOPLE) {
    assert.equal(p.portraitAge, Number(p.death || 1740) - Number(p.birth), p.key);
    assert.equal(p.age,p.portraitAge,p.key);
  }
  for (const marriage of GOFRANN_MARRIAGES) {
    for (const childKey of marriage.children) {
      const child = gofrannPerson(childKey);
      for (const key of marriage.keys) {
        const parent = gofrannPerson(key);
        assert.ok(Number(child.birth) - Number(parent.birth) >= 18, `${key} / ${childKey}`);
        assert.ok(!parent.death || Number(parent.death) >= Number(child.birth), key);
      }
    }
  }
});

test('existing spouses keep world identities and the continuation follows the husband', () => {
  assertMirroredCrossFamilyBatch([{family},{family:tlawd}]);
  for (const [id, world] of [['einion','person--family-tree--einion'],['ulaena','person--family-tree--ulaena']]) {
    assert.equal(family.persons.find(p => p.id === id).worldPersonId, world);
    assert.equal(tlawd.persons.find(p => p.id === id).worldPersonId, world);
  }
  assert.ok(family.cadetBranches.some(b => b.parentPartnershipId === 'marriage-lludd-ulaena' && b.targetFamilyId === 'haus-tlawd'));
  assert.ok(tlawd.cadetBranches.some(b => b.parentPartnershipId === 'marriage-renfri-einion' && b.targetFamilyId === 'haus-gofrann'));
  for (const key of ['cynlas','eluned']) {
    assert.ok(family.persons.some(p => p.id === gofrannPerson(key).id));
    assert.ok(!tlawd.persons.some(p => p.id === gofrannPerson(key).id));
  }
  const children = tlawd.parentages.filter(p => p.partnershipId === 'marriage-lludd-ulaena').map(p => p.childId);
  assert.equal(children.length, 2);
  assert.ok(children.every(id => !family.persons.some(p => p.id === id)));
  assert.equal(family.partnerships.find(p => p.id === 'marriage-lludd-ulaena').start, '');
});

test('staff tabs have individual posts, including vacancies, with no small children or deceased staff', () => {
  const hierarchy = entry.pages[3].hierarchy;
  assert.equal(hierarchy.treeDisplayMode, 'tabs');
  assert.deepEqual(hierarchy.trees.map(t => t.label), ['Handwerk','Verkauf','Organisation & Logistik']);
  const nodes = hierarchy.trees.flatMap(t => t.levels.flatMap(l => l.nodes));
  assert.equal(nodes.length, 26);
  assert.equal(new Set(nodes.map(n => n.id)).size, 26);
  assert.equal(nodes.filter(n => n.portrait).length, 14);
  assert.equal(nodes.filter(n => !n.portrait).length, 12);
  assert.ok(!nodes.some(n => /gofrann-person-(edern|caradfan|ulaena|lludd|rhoswen|neryn)$/.test(n.id)));
});

test('standard weapons and armour retain register prices beside the five own ranges', () => {
  const catalog = entry.pages[4].tradeCatalog;
  assert.equal(catalog.categories.length,7);
  assert.equal(catalog.items.length,71);
  const offers = buildModuleOffers([entry]);
  assert.equal(offers.length,71);
  for (const item of GOFRANN_STANDARD_ITEMS) {
    const offer = offers.find(o => o.title === item.title);
    assert.equal(offer.priceRange.minCopper, item.priceRange.minCopper, item.id);
    assert.equal(offer.priceRange.maxCopper, item.priceRange.maxCopper, item.id);
    assert.equal(offer.image, item.image, item.id);
  }
});

test('own products separate weapons, undecorated torso armour, blank shields and six special commissions', () => {
  const counts=GOFRANN_OWN_CATEGORIES.map(c=>GOFRANN_PRODUCTS.filter(p=>p.category===c.id).length);
  assert.deepEqual(counts,[18,7,4,3,3]);
  assert.equal(new Set(GOFRANN_PRODUCTS.map(p=>p.key)).size,35);
  assert.ok(GOFRANN_PRODUCTS.every(p=>Number.isFinite(p.price)&&p.price>0&&p.description.length>=2));
  assert.ok(GOFRANN_PRODUCTS.filter(p=>p.kind!=='weapon').every(p=>!p.makerMark));
  assert.ok(GOFRANN_PRODUCTS.filter(p=>p.kind==='weapon').every(p=>p.makerMark));
  assert.ok(['speer','hellebarde','kettenmorgenstern'].every(key=>GOFRANN_PRODUCTS.some(p=>p.key===key)));
  for(const key of ['tenebron-schwert','tenebron-plattenharnisch']) {
    const p=GOFRANN_PRODUCTS.find(p=>p.key===key);
    assert.equal(p.materialReference,'tenebron');
    assert.match(p.description.join(' '),/Tenebrium und Kohlenstoff/);
    assert.match(p.description.join(' '),/nicht|keine/);
  }
  const items=entry.pages[4].tradeCatalog.items.filter(i=>i.id.startsWith('gofrann:'));
  assert.equal(items.length,35);
  assert.ok(items.every(i=>i.attributes.length===0&&!i.combatDefinition));
});

test('nine content pages, services and rooms are complete and all project artwork exists', async () => {
  assert.equal(entry.pages.length, 9);
  assert.equal(entry.pages[5].guildServices.services.length, 9);
  assert.equal(entry.pages.filter(p => p.sessionPage).length, 3);
  assert.equal(entry.previewImage, entry.pages[0].image);
  const images = new Set();
  const collect = value => {
    if (typeof value === 'string' && /^(\.\/assets\/gofrann-schmiede\/|\.\.\/IconOrdner\/|\.\.\/Stammbäume\/assets\/)/.test(value)) images.add(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  };
  collect(entry); collect(GOFRANN_PEOPLE.map(p => p.portrait));
  for (const image of images) await access(new URL(`../${image}`, import.meta.url));
  const results = JSON.parse(await readFile(new URL('../assets/gofrann-schmiede/image-results.json', import.meta.url),'utf8'));
  assert.equal(results.images.length, 31);
  const items=JSON.parse(await readFile(new URL('../assets/gofrann-schmiede/items/image-results.json',import.meta.url),'utf8'));
  assert.equal(items.images.length,35);
});
