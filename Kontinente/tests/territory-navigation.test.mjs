import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import counties from '../modules/cenyr-navigation/counties.source.json' with { type: 'json' };
import { renderCenyrCounties } from '../modules/cenyr-navigation/counties.mjs';
import { territoryHref } from '../modules/territory-page/territory-reference.mjs';
import { territoryNavigationMarkup } from '../modules/territory-page/territory-navigation-template.mjs';
import { resolveDirectoryView } from '../modules/territory-directory/directory-view.mjs';

const root = new URL('../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const context = { window: {} };
vm.runInNewContext(read('Kontinente/kontinente.registry.js'), context);
const registry = Array.from(context.window.KONTINENTE_REGISTRY);

test('all registered continent, country and territory resources exist and identities are unique', () => {
  assert.equal(new Set(registry.map(entry => entry.id)).size, registry.length);
  for (const entry of registry) {
    for (const key of ['page', 'data', 'contentSource']) {
      if (!entry[key]) continue;
      const target = new URL(entry[key], new URL('Kontinente/', root));
      target.search = ''; target.hash = '';
      assert.ok(fs.existsSync(target), `${entry.id}/${key}: ${entry[key]}`);
    }
  }
});

test('Cenyr has exactly nine immediate county destinations, resolved by stable identity', () => {
  assert.equal(counties.length, 9);
  assert.equal(new Set(counties.map(c => c.id)).size, 9);
  const markup = renderCenyrCounties(registry);
  assert.equal(markup, renderCenyrCounties([...registry].reverse()), 'Registry order cannot change destinations');
  for (const county of counties) {
    const entry = registry.find(entry => entry.id === county.id);
    assert.equal(entry.type, 'Grafschaft');
    assert.equal(entry.hierarchy.length, 4);
    assert.equal(entry.hierarchy[2].slug, 'cenyr');
    assert.ok(read('Kontinente/' + entry.page).includes(`data-default-id="${entry.id}"`), county.id);
    assert.ok(fs.existsSync(new URL('Stammbäume/assets/images/regions/' + county.banner + '.png', root)));
    assert.ok(markup.includes(`href="${territoryHref(county.id, registry)}" data-territory-id="${county.id}"`));
  }
  assert.equal(territoryHref('unknown', registry), '', 'No unrelated kingdom fallback');
  assert.throws(() => renderCenyrCounties(registry.filter(e => e.id !== counties[8].id)), /fehlt/);
});

test('the actual Cenyr page contains the current single generated navigation, including Tal der Milane', () => {
  const html = read('Kontinente/Estryll/Königreich Cenyr/Königreich von Cenyr.html');
  const block = html.match(/<!-- cenyr-counties:start -->\n([\s\S]*?)\n<!-- cenyr-counties:end -->/)[1];
  assert.equal(block, renderCenyrCounties(registry));
  assert.equal((block.match(/data-territory-id=/g) || []).length, 9);
  assert.doesNotMatch(block, /<table|onclick|oninput|onchange/);
  assert.match(block, /href="[^"\n]*Grafschaft Tal der Milane\/Grafschaft Tal der Milane.html" data-territory-id="grafschaft-tal-der-milane"/);
});

test('shared territorial navigation escapes labels, links and optional heraldry', () => {
  const markup = territoryNavigationMarkup([{ id: 'one', title: '<Name>', href: '/?a=1&b="2"', seat: 'A & B', imageSrc: '/banner.png', imageAlt: '"Banner"', crestSrc: '/crest.png', crestAlt: '<Crest>', house: '<House>' }]);
  assert.match(markup, /&lt;Name&gt;/);
  assert.match(markup, /href="\/\?a=1&amp;b=&quot;2&quot;"/);
  assert.match(markup, /Sitz: A &amp; B/);
  assert.match(markup, /territory-navigation-crest/);
  assert.doesNotMatch(markup, /<House>|<Name>|<Crest>/);
  const minimal = territoryNavigationMarkup([{ title: 'Name', href: '/page.html' }]);
  assert.doesNotMatch(minimal, /<img|Sitz:|territory-navigation-owner/);
});

for (const count of [1, 7, 8, 10, 11, 50]) {
  test(`${count} houses: automatic default and explicit view choices`, () => {
    assert.equal(resolveDirectoryView(count), count > 10 ? 'list' : 'cards');
    assert.equal(resolveDirectoryView(count, 'list'), 'list');
    assert.equal(resolveDirectoryView(count, 'cards'), 'cards');
    assert.equal(resolveDirectoryView(count, 'obsolete'), count > 10 ? 'list' : 'cards');
  });
}
