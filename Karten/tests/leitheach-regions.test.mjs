import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { convertRenderedRegion, worldAnvilMarkerId } from '../modules/regions/world-anvil-geometry.mjs';
import { validateRegions } from '../modules/regions/region-model.mjs';

const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
const source = read('../Leitheach/sources/world-anvil.capture.json');
const images = read('../Leitheach/sources/images.manifest.json');
const maps = images.map(image => ({ image, data: read('../../' + image.output.replace(/Kartenbilder\/normal.webp$/, 'data.json')) }));

test('all seven supplied maps retain the 36 visible source borders and their marker IDs', () => {
  assert.equal(maps.length, 7);
  assert.equal(maps.reduce((count, { data }) => count + data.state.regions.length, 0), 36);
  for (const { image, data } of maps) {
    const capture = source.maps.find(map => map.image.width === image.width && map.image.height === image.height);
    assert.ok(capture);
    assert.doesNotThrow(() => validateRegions(data.state.regions));
    assert.deepEqual(new Set(data.state.regions.map(region => region.source.markerId)), new Set(capture.polygons.map(worldAnvilMarkerId)));
    assert.equal(data.state.dotSize, 80);
    assert.equal(data.state.lblSize, 50);
    assert.deepEqual(data.state.pins, []);
    assert.equal(data.state.regions.filter(region => region.kind === 'boundary').length,
      capture.polygons.filter(shape => shape.class.includes('marker-line')).length);
  }
  const main = maps.find(({ image }) => image.id === 'leitheach').data.state;
  assert.equal(new Set(main.regions.map(region => region.targetMapId)).size, 6);
  assert.ok(main.regions.every(region => region.targetMapId.startsWith('leitheach-tir-na-')));
});

test('Fancha uses the user-confirmed name and Sinsear preserves nested local territories', () => {
  const regions = maps.find(({ image }) => image.id === 'tir-na-sinsear').data.state.regions;
  const fancha = regions.find(region => region.source.markerId === '397f74eb-6a69-4e7a-9ef3-0b435b2ede97');
  assert.equal(fancha.name, 'Herrschaft Tir na Fancha');
  assert.equal(fancha.familyId, 'haus-na-mhuir');
  const parent = regions.find(region => region.familyId === 'haus-gallchobhair');
  for (const familyId of ['haus-cleir', 'haus-ghaiscioch', 'haus-dal-ceardaiocht']) {
    assert.equal(regions.find(region => region.familyId === familyId).parentId, parent.id);
  }
});

test('rendered SVG converts image offsets and viewBox origin without reversing Y or joining line sections', () => {
  const image = { width: 1000, height: 500, rect: { left: 100, top: 50, width: 500, height: 250 } };
  const shape = { class:'marker-line', d:'M10 20L110 70M160 95L210 120', svg: { viewBox:'10 20 200 100', rect:{ left:100,top:50,width:200,height:100 } } };
  assert.deepEqual(convertRenderedRegion(shape, image), { kind:'boundary', paths:[[[0,0],[.2,.2]],[[.3,.3],[.4,.4]]] });
  const circle = convertRenderedRegion({ class:'marker-circle',rect:{ left:200,top:100,width:50,height:50 } },image);
  assert.equal(circle.paths[0].length,48);
  assert.deepEqual(circle.paths[0][0],[.3,.3]);
});

test('the 24 supplied old articles remain archived byte for byte', () => {
  const articles = read('../Leitheach/sources/articles.manifest.json');
  assert.equal(articles.length,24);
  for (const article of articles) {
    const bytes = fs.readFileSync(new URL('../Leitheach/sources/' + article.file,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),article.sha256);
  }
});
