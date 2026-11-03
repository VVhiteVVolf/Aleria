import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_CONTENT as content } from '../Estryll/Cenyr/Silberinsel/Haus_Hamnett/haus.content.mjs';
import { HOUSE_BIOGRAPHY as biography } from '../Estryll/Cenyr/Silberinsel/Haus_Hamnett/haus.biography.mjs';
import { getPatrickBiographyPersonFields } from '../../AleriaAlmanach/modules/patrick-biographies/biography-source.mjs';

const feature = new URL('../', import.meta.url), root = new URL('../../', import.meta.url);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const pageContext = { window: {} };
vm.runInNewContext(readFileSync(new URL('../Estryll/Cenyr/Silberinsel/Haus_Hamnett/haus.data.js', import.meta.url), 'utf8'), pageContext);
const page = pageContext.window.HAEUSER_DATA;

test('Hamnett retains its known Silberinsel origin and Gwen identity without inventing a seat, lord or founder', () => {
  const family = FAMILY_REGISTRY.find(row => row.id === 'haus-hamnett');
  assert.equal(family.houseProfile.rankId, 'commoner');
  assert.equal(family.houseProfile.county, 'Silberinsel');
  for (const key of ['seat', 'barony', 'liegeHouseId', 'liegeHouseName']) assert.equal(family.houseProfile[key], '');
  assert.equal(content.parentHouseId, ''); assert.equal(content.currentHead, ''); assert.equal(content.founder, null);
  assert.equal(content.profile.seat, ''); assert.equal(content.profile.liege, '');
  assert.equal(content.profile.wealth, 'Wohlhabend');
  assert.match(content.sections.history, /Seit Generationen/);
  assert.match(content.sections.holdings, /Reliefs, Ornament-Schnitzerei und Bildhauerarbeiten/);
  assert.ok(content.hierarchy.every(entry => !/Llanvane|Gwynthor/.test(entry.name)));
  const gwen = family.family.persons.find(person => person.id === 'unknown-cadogan-spouse');
  assert.equal(gwen.name, 'Gwen Hamnett');
  assert.equal(gwen.worldPersonId, 'person--family-tree--unknown-cadogan-spouse');
  assert.equal(content.figures[0].id, gwen.id); assert.equal(content.figures[0].role, 'Malerin');
  assert.equal(content.figures[0].image, getPatrickBiographyPersonFields('unknown-cadogan-spouse').portrait);
  assert.equal(content.figures[0].image, 'https://dieweltvonaleria.netlify.app/AleriaAlmanach/assets/biographies/patrick-20261103/originals/gwen-hamnett.jpeg');
  assert.match(content.sections.overview, /lebt als Malerin in Gwynthor/);
  assert.match(page.familyTreeEmbed.src, /family=haus-hamnett&mode=view/);
});

test('the latest selected hammer and chisel are the sole active crest and every interface uses the same local house figure', () => {
  const crest = readFileSync(new URL(content.images.crest, feature));
  assert.equal(hash(crest), 'edd5b46c436324e4ef726e9a8ad8f2f7fa5ee628a36ac1294937955fb1d15a95');
  assert.match(content.biographySummary.character, /Hammer und Meißel/);
  assert.match(content.biographySummary.character, /Dunkelblau, Elfenbein und Gold/);
  assert.doesNotMatch(content.biographySummary.character, /Palette|Büste/);
  const scene = new URL(content.images.scene, feature);
  assert.ok(existsSync(scene));
  const bytes = readFileSync(scene);
  assert.equal(bytes.readUInt32BE(16), 1024); assert.equal(bytes.readUInt32BE(20), 1536);
  const bioImage = new URL(biography.image, new URL('Stammbäume/', root));
  assert.equal(hash(readFileSync(bioImage)), hash(bytes));
  const gallery = JSON.parse(readFileSync(new URL('Gallerien/krieger/data/catalog.json', root), 'utf8'));
  const house = gallery.houses.find(row => row.id === 'haus-hamnett');
  assert.ok(house?.illustrationIds.length);
  const illustration = gallery.illustrations.find(row => row.houseIds.includes('haus-hamnett') && row.image.endsWith('Haus_Hamnett/assets/hausdarstellung-2026-11-03.png'));
  assert.ok(illustration);
  assert.equal(hash(readFileSync(new URL(illustration.image, root))), '4211d776a51f0f0c3335735f2d375539e914725b52d92801d14164324ca9f24b');
});

test('the real Silberinsel card opens the small Hamnett page without assigning it to Llanvane or Neidr vassalage', async () => {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(new URL('Kontinente/assets/js/herrschaft-data.js', root), 'utf8'), context);
  const previous = globalThis.ALERIA_HERRSCHAFT_DATA;
  let territory;
  try {
    globalThis.ALERIA_HERRSCHAFT_DATA = context.window.ALERIA_HERRSCHAFT_DATA;
    territory = (await import('../../Kontinente/Estryll/Königreich Cenyr/Grafschaft Silberinsel/grafschaft.data.mjs')).default;
  } finally {
    if (previous === undefined) delete globalThis.ALERIA_HERRSCHAFT_DATA;
    else globalThis.ALERIA_HERRSCHAFT_DATA = previous;
  }
  const cards = territory.view.familySections.flatMap(section => section.cards).filter(card => card.id === 'haus-hamnett');
  assert.equal(cards.length, 1);
  assert.equal(cards[0].seat, ''); assert.equal(cards[0].liege, '');
  const link = new URL(cards[0].href, 'https://aleria.example/');
  assert.equal(link.searchParams.get('haus'), 'haus-hamnett');
  assert.match(link.pathname, /kleinehaeuser\.html$/);
});
