import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildCastleRegistrations, castleRooms } from '../modules/gwynthor-castles/castle-modules.mjs';
import { CASTLE_HOUSES } from '../modules/gwynthor-castles/castle-houses.mjs';
import { CASTLE_ART } from '../modules/gwynthor-castles/castle-art.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { GWYNTHOR_CITY_PATH } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';

const root = new URL('../../', import.meta.url), registrations = buildCastleRegistrations();
const json = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));

test('three castles offer the requested communal areas, with a separate Saethwyr port and no private quarters', () => {
  assert.equal(registrations.length, 10);
  assert.deepEqual(CASTLE_HOUSES.map(house => [house.id, castleRooms(house.id).length]), [['gafyr', 9], ['saethwyr', 10], ['wyrm', 10]]);
  for (const house of CASTLE_HOUSES) {
    const own = registrations.filter(row => row.entry.id.startsWith(`castell-${house.id}-`));
    assert.deepEqual(own.map(row => row.entry.pages.length), house.id === 'saethwyr' ? [4, 2, 3, 1] : house.id === 'wyrm' ? [5, 2, 3] : [4, 2, 3]);
    assert(own.every(row => JSON.stringify(row.path) === JSON.stringify([...GWYNTHOR_CITY_PATH, house.title])));
    const titles = own.flatMap(row => row.entry.pages.map(page => page.pageTitle));
    for (const expected of ['Thronsaal', 'Gemeinsamer Esssaal', 'Ratssaal', 'Amtskammer', 'Übungsplatz']) assert(titles.some(title => title.includes(expected)), `${house.id}: ${expected}`);
    assert(!titles.some(title => /Gemach|Schlaf|Wohntrakt|Privatgem|Verlies/.test(title)));
  }
  const port = registrations.find(row => row.entry.id === 'castell-saethwyr-burghafen');
  assert(port.entry.pages[0].sessionPage);
  assert.match(port.entry.pages[0].sessionLocation, /Saethwyr.*Port/);
  assert(registrations.find(row => row.entry.id === 'castell-wyrm-innenhof').entry.pages.some(page => /Zugbrücke/.test(page.pageTitle)));
});

test('29 independent scene threads retain empty dates and do not assign characters, resources or personal property', () => {
  const threads = [];
  for (const { entry } of registrations) {
    assert.equal(entry.appendCommentsPage, false); assert.equal(entry.enablePageComments, true);
    assert.deepEqual(entry.sessionCast, []); assert.deepEqual(entry.sessionCastDetails, []);
    for (const page of entry.pages) {
      assert.equal(page.sessionPage, true); assert.deepEqual(page.sessionParticipants, []);
      assert.deepEqual(page.sessionDateAleria, { year: null, month: null, day: null });
      assert(page.sessionIntro.length > 300); assert(!('inventory' in page));
      threads.push(`${entry.id}::session:${page.commentThreadKey}`);
    }
  }
  assert.equal(threads.length, 29); assert.equal(new Set(threads).size, 29);
  assert.deepEqual(buildCastleRegistrations(), registrations);
});

test('registered castle scenes inherit responsive cover at the published column width', async () => {
  const source = await readFile(new URL('../modules/gwynthor-castles/castle-data.js', import.meta.url), 'utf8');
  const context = { SECTIONS: [] };
  vm.runInNewContext(source, context);
  const pages = context.SECTIONS.flatMap(section => section.entries.flatMap(entry => entry.pages));
  assert.equal(pages.length, 29);
  for (const page of pages) {
    assert.equal(page.imageWidth, 28, page.commentThreadKey);
    assert.equal(page.imageFit, undefined, page.commentThreadKey);
    assert.equal(page.imagePosition, undefined, page.commentThreadKey);
  }
});

test('archive registration preserves existing edited modules, neighboring scenes and stable identities on repeated registration', () => {
  const edited = { ...registrations[0].entry, subtitle: 'Persönliche Redaktion', pages: [{ commentThreadKey: 'bestehende-szene', sessionDateAleria: { year: 1740, month: 3, day: 2 } }] };
  const neighbor = { id: 'castell-draig-existing', pages: [{ commentThreadKey: 'unveraendert' }] };
  const context = { SECTIONS: [{ tab: 'Völker & Kulturen', path: ['Vorhanden'], entries: [edited, neighbor] }] };
  const source = renderArchiveSectionRegistration('registerTestCastles', registrations, 'test');
  vm.runInNewContext(source, context); vm.runInNewContext(source, context);
  const all = context.SECTIONS.flatMap(section => section.entries);
  assert.equal(all.length, 11); assert.strictEqual(all.find(entry => entry.id === edited.id), edited);
  assert.strictEqual(context.SECTIONS[0].entries[0], neighbor);
  assert.equal(edited.pages[0].commentThreadKey, 'bestehende-szene');
  assert.equal(edited.pages[0].sessionDateAleria.year, 1740);
});

test('the scene sources and actual crest references distinguish flat Gafyr, south-bank Wyrm and harbor Saethwyr', () => {
  const [gafyr, saethwyr, wyrm] = CASTLE_HOUSES;
  assert.match(gafyr.architecture, /FLAT.*city.*mountains.*BEHIND/s);
  assert.match(gafyr.heraldry, /TWO mirrored golden horned goats/);
  assert.match(saethwyr.heraldry, /BLACK.*dragon.*WAVES/);
  assert.match(wyrm.architecture, /SOUTH BANK.*FINAL SHORT SPAN.*DRAWBRIDGE/s);
  assert.match(wyrm.heraldry, /BLACK.*GOLD.*RED/);
  const combined = JSON.stringify(registrations);
  assert.match(combined, /ebenen Stadtgrund|ebenem Stadtgrund/);
  assert.match(combined, /südlichen Ufer/); assert.match(combined, /eigene[nr]? Port/);
  for (const art of CASTLE_ART) {
    assert.equal(art.references.length, 2);
    assert(art.references[0].endsWith('kyrwyn-experimental-v3.png'));
    assert(art.references[1].endsWith(`haus-${art.house}.png`));
  }
});

test('every scene image has an immutable original, actual prompt receipt, matching hash and 2:3 PNG', async () => {
  const manifest = await json('AleriaAlmanach/assets/gwynthor-castles/manifest.json');
  const receipts = await json('AleriaAlmanach/docs/art/gwynthor-castles-20261114/generation-receipts.json');
  assert.equal(manifest.active.length, 29); assert.equal(receipts.images.length, 29);
  for (const art of CASTLE_ART) {
    const active = manifest.active.find(image => image.key === art.id);
    assert.equal(active.path, art.destination);
    const record = manifest.images.find(image => image.key === art.id && image.path === active.path);
    const receipt = receipts.images.find(image => image.key === art.id && image.version === record.version);
    assert.equal(receipt.prompt, art.prompt); assert.deepEqual(receipt.references, art.references);
    const [bytes, original] = await Promise.all([record.path, record.original].map(path => readFile(new URL(path, root))));
    assert(bytes.equals(original), art.id);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256);
    assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.equal(record.width * 3, record.height * 2);
  }
});

test('runtime images and generated modules publish while authoring prompts and original receipts remain source archives', () => {
  assert(shouldPublish('AleriaAlmanach/modules/gwynthor-castles/castle-data.js'));
  for (const art of CASTLE_ART) assert(shouldPublish(art.destination));
  for (const name of ['image-prompts.json', 'generation-receipts.json', 'module-import.json', 'originals/gafyr-burghof-v1.png']) {
    assert.equal(shouldPublish(`AleriaAlmanach/docs/art/gwynthor-castles-20261114/${name}`), false);
  }
  for (const name of ['castle-art', 'castle-houses', 'castle-modules', 'gafyr-rooms', 'saethwyr-rooms', 'wyrm-rooms']) {
    assert.equal(shouldPublish(`AleriaAlmanach/modules/gwynthor-castles/${name}.mjs`), false);
  }
});
