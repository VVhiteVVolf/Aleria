import test from 'node:test';
import assert from 'node:assert/strict';
import { mountMapTerritoryNavigation } from '../modules/territory-navigation/map-territory-navigation.mjs';

test('explicit map article links mount without reading or modifying saved map state', () => {
  const inserted = [];
  const root = {
    getElementById: id => id === 'topbar' ? {} : { after: link => inserted.push(link) },
    createElement: tag => ({ tag, dataset: {}, attributes: {}, setAttribute(key, value) { this.attributes[key] = value; }, remove() { inserted.splice(inserted.indexOf(this), 1); } }),
  };
  const map = Object.freeze({ title: 'Leitheach', territoryHref: '/Kontinente/leitheach.html' });
  const unmount = mountMapTerritoryNavigation(map, root);
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].tag, 'a');
  assert.equal(inserted[0].href, map.territoryHref);
  assert.match(inserted[0].attributes['aria-label'], /Leitheach/);
  unmount();
  assert.equal(inserted.length, 0);
  assert.equal(mountMapTerritoryNavigation({ title: 'Unverknüpfte Karte' }, root), undefined);
  assert.equal(inserted.length, 0);
});
