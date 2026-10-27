import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { variants } from '../Uathneach/variants.mjs';
import { clans } from '../Uathneach/clans.mjs';
import { previewAsset } from '../Uathneach/preview-assets.mjs';
import { warriors } from '../Uathneach/warrior-data.mjs';
import { renderClanDossier, renderClanWarriorGallery } from '../Uathneach/clan-warriors.mjs';
import { clanLineage } from '../Uathneach/clan-hierarchy.mjs';

const root = new URL('../Uathneach/', import.meta.url);

test('the shared preview resolves all local module, stylesheet and image references', async () => {
  const files = (await readdir(root)).filter(name => /\.(?:mjs|css|html)$/.test(name));
  let imageCount = 0;
  for (const name of files) {
    const source = await readFile(new URL(name, root), 'utf8');
    for (const match of source.matchAll(/(?:from\s+['"]|(?:src|href)="|url\(['"]?)(\.\.?\/[^'"\s)]+|assets\/[^'"\s)]+|[\w-]+\.(?:mjs|css))/g)) {
      const target = previewAsset(match[1]);
      assert.ok((await stat(new URL(target, root))).isFile(), `${name}: ${target}`);
    }
    for (const match of source.matchAll(/['"](assets\/[^'"]+)['"]/g)) {
      const target = previewAsset(match[1]);
      assert.ok((await stat(new URL(target, root))).isFile(), `${name}: ${target}`);
      imageCount++;
    }
    assert.ok(!source.includes('file:///') && !source.includes('127.0.0.1'), name);
  }
  assert.ok(imageCount >= 7, 'map and regional artwork references are actually checked');
  for (const clan of clans) {
    assert.ok((await stat(new URL(previewAsset('assets/' + clan.crest), root))).isFile(), clan.name);
  }
  assert.equal(clans.length, 26);
  const html = await readFile(new URL('index.html', root), 'utf8');
  assert.match(html, /noindex,nofollow/);
  assert.match(html, /Temporärer Entwurf/);
});

test('all three variants retain their clan assignments and distinct editable drafts', () => {
  assert.equal(variants.length, 3);
  assert.deepEqual(variants.map(variant => variant.regions.length), [7, 7, 6]);
  assert.equal(new Set(variants.map(variant => variant.id)).size, 3);
  const copy = structuredClone(variants[0]);
  copy.regions[0].name = 'Entwurf';
  assert.notEqual(variants[0].regions[0].name, copy.regions[0].name);
});

test('every confirmed Uathneach clan resolves to its own illustration and real Albic class', async () => {
  const source=JSON.parse(await readFile(new URL('../../Stammbäume/assets/js/data/uathneach-territories.source.json',import.meta.url),'utf8'));
  assert.deepEqual(warriors.map(w=>[w.id,w.name]),source.clans.map(c=>[c.id,c.name]));
  for(const warrior of warriors){
    const profile=JSON.parse(await readFile(new URL(`../../Klassenordner/Alben/${warrior.classId}/klasse.json`,import.meta.url),'utf8'));
    assert.equal(warrior.className,profile.name,warrior.id);
    for(const asset of [warrior.image,warrior.fullsize,...(warrior.bestiary?[warrior.bestiary]:[])]){
      const target=asset.startsWith('/')?new URL(asset.slice(1),new URL('../../',root)):new URL(asset,root);
      assert.ok((await stat(target)).isFile(),asset);
    }
    assert.equal(previewAsset(warrior.fullsize),warrior.fullsize,'production PNG must not become a legacy WebP alias');
  }
});

test('clan dossiers keep the selected variant facts while sharing one warrior per clan', () => {
  const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
  for(const variant of variants){
    const snapshot=JSON.stringify(variant);
    const gallery=renderClanWarriorGallery(variant.clans,escape);
    assert.equal((gallery.match(/data-action="show-clan"/g)||[]).length,26);
    for(const clan of variant.clans){
      const place=variant.settlements.find(p=>p.id===clan.seat),region=variant.regions.find(r=>r.id===place.region),path=clanLineage(variant,clan.id);
      const html=renderClanDossier({clan,variant,place,region,path,liege:path.at(-2)},escape);
      assert.match(html,/id="clan-detail-title"/);
      assert.ok(html.includes(`references/${warriors.find(w=>w.id===clan.id).familyId}/krieger.png`));
      assert.ok(html.includes(escape(place.name)));
      assert.ok(html.includes('#klasse-alben-'));
      assert.ok(!html.includes('data-action="select-from-dialog"'));
    }
    assert.equal(JSON.stringify(variant),snapshot,'rendering cannot change archive placements');
  }
});
