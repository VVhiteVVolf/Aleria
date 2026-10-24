import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { convertRenderedRegion, worldAnvilMarkerId } from '../modules/regions/world-anvil-geometry.mjs';
import { validateRegions } from '../modules/regions/region-model.mjs';
import { assertRenderedRegionAlignment, connectedTerritory, territoryAtPoint } from '../Leitheach/region-import.mjs';
import { worldAnvilDescription, worldAnvilPlaceTitle } from '../modules/territory-places/world-anvil-description.mjs';

const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
const source = read('../Leitheach/sources/maps-20261024.capture.json');
const markerCapture = read('../Leitheach/sources/markers-20261024.capture.json');
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
    assert.ok(data.state.pins.length > 0);
    assert.equal(data.state.showMarkers, true);
    assert.ok(data.state.pins.every(pin => pin.pinMarker && fs.existsSync(new URL('../..' + pin.pinMarker, import.meta.url))));
    assert.equal(data.state.regions.filter(region => region.kind === 'boundary').length,
      capture.polygons.filter(shape => shape.class.includes('marker-line')).length);
  }
  const main = maps.find(({ image }) => image.id === 'leitheach').data.state;
  assert.equal(new Set(main.regions.map(region => region.targetMapId)).size, 6);
  assert.ok(main.regions.every(region => region.targetMapId.startsWith('leitheach-tir-na-')));
});

test('every marker is accounted for, and source coordinates match the independently rendered map', () => {
  const coverage = read('../Leitheach/sources/import-coverage.json');
  assert.equal(coverage.markers.length, 324);
  assert.equal(coverage.markers.filter(marker => marker.role === 'submap-link').length, 6);
  assert.equal(maps.reduce((n, {data}) => n + data.state.pins.length, 0), 318);
  const expectedCounts = { leitheach:14, 'tir-na-sinsear':56, 'tir-na-sleagh':48, 'tir-na-sruth':47,
    'tir-na-gortanna':72, 'tir-na-tonn':38, 'tir-na-comhchuibhis':43 };
  for (const {image,data} of maps) {
    assert.equal(data.state.pins.length, expectedCounts[image.id]);
    const capture = source.maps.find(map => map.image.width === image.width && map.image.height === image.height);
    for (const pin of data.state.pins) {
      const raw = markerCapture.markers.find(marker => marker.id === pin.id);
      assert.equal(pin.sourceRef.markerId, raw.id);
      assert.equal(pin.x, Number(raw.x) / image.width);
      assert.equal(pin.y, 1 - Number(raw.y) / image.height);
      assert.equal(pin.text, worldAnvilDescription(raw.description));
      if (worldAnvilPlaceTitle(raw)) assert.equal(pin.title, worldAnvilPlaceTitle(raw));
      else assert.ok(pin.sourceRef.missing.includes('Name fehlt'));
      const dom = capture.pins.find(marker => marker.class.includes('marker-' + raw.id));
      const margin = name => Number(dom.style.match(new RegExp(name + ':\\s*(-?[\\d.]+)px'))?.[1] || 0);
      const anchor = [dom.rect.left - margin('margin-left'), dom.rect.top - margin('margin-top')];
      const rendered = [capture.image.rect.left + pin.x * capture.image.rect.width,
        capture.image.rect.top + pin.y * capture.image.rect.height];
      assert.ok(anchor.every((value,i) => Math.abs(value-rendered[i]) < 2), 'Sichtbare Quellenposition: ' + raw.id);
      assert.ok(data.state.dominions.some(d => d.id === pin.dominionId));
    }
  }
});

test('fresh SVG bounds reject stale zoom geometry and retain all line labels', () => {
  for (const capture of source.maps) for (const shape of capture.polygons) assert.doesNotThrow(() => assertRenderedRegionAlignment(shape));
  const shape = structuredClone(source.maps[0].polygons[0]);
  shape.svg.rect.left += 50;
  assert.throws(() => assertRenderedRegionAlignment(shape), /SVG und Kartenstand/);
  for (const {data} of maps) for (const region of data.state.regions.filter(r => r.kind === 'boundary' && r.familyId)) {
    assert.ok(region.labelPosition);
    assert.equal(region.showLabel, true);
  }
});

test('documented clan seats and boundary settlements keep explicit ownership', () => {
  const sinsear = maps.find(({image}) => image.id === 'tir-na-sinsear').data.state;
  for (const title of ['Buarstrath','Uisgebail','Talamhgius','Mòindair']) {
    assert.equal(sinsear.pins.find(pin => pin.title === title).dominionId, 'leitheach-herrschaft-ghaiscioch');
  }
  assert.deepEqual(sinsear.pins.find(pin => pin.title === 'Cairn Fàire').residentFamilyIds, ['haus-cleir']);
  const sleagh = maps.find(({image}) => image.id === 'tir-na-sleagh').data.state;
  assert.equal(sleagh.pins.find(pin => pin.title === 'Senanbail').dominionId, 'leitheach-herrschaft-eirce');
  assert.equal(sleagh.pins.find(pin => pin.title === 'Mârbail').dominionId, 'leitheach-herrschaft-fiachrach');
  assert.equal(sleagh.pins.find(pin => pin.title === 'Capallachadh').dominionId, 'leitheach-tir-na-sleagh');
});

test('crossing clan connections assign their connected settlements rather than an invented enclosed area', () => {
  const state = maps.find(({image}) => image.id === 'tir-na-comhchuibhis').data.state;
  const blar = state.pins.filter(pin => pin.dominionId === 'leitheach-herrschaft-nic-blar');
  assert.equal(blar.length, 9);
  assert.ok(blar.every(pin => pin.sourceRef.assignment === 'source-clan-connection'));
  const line = { kind:'boundary',dominionId:'clan',paths:[[[.1,.1],[.9,.9],[.1,.9],[.9,.1]]], source:{markerId:'old-line'} };
  assert.equal(territoryAtPoint([.5,.3],[line],'parent'),'parent');
  assert.equal(connectedTerritory([.1,.1],[line],[4096,2085],52),line);
  assert.equal(connectedTerritory([.5,.3],[line],[4096,2085],52),undefined);
});

test('BBCode headings, paragraphs and links retain the complete source wording', () => {
  assert.equal(worldAnvilDescription('[b][h1]Burg[/h1][/b][quote]Erster Absatz.\n\nZweiter Absatz.[/quote]'), 'Burg\n\nErster Absatz.\n\nZweiter Absatz.');
  assert.equal(worldAnvilDescription('[url=https://example.org]Quelle[/url] &amp; [b]Text[/b]'), '[Quelle](https://example.org) & **Text**');
  const words = text => text.replace(/\[[^\]]*\]|\*/g,'').replace(/\s+/g,' ').trim();
  for (const raw of markerCapture.markers.filter(m=>m.description)) {
    assert.equal(words(worldAnvilDescription(raw.description)),words(raw.description));
  }
});

test('Fancha uses the user-confirmed name and Sinsear preserves nested local territories', () => {
  const regions = maps.find(({ image }) => image.id === 'tir-na-sinsear').data.state.regions;
  const fancha = regions.find(region => region.source.markerId === '397f74eb-6a69-4e7a-9ef3-0b435b2ede97');
  assert.equal(fancha.name, 'Tir na Fancha');
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
