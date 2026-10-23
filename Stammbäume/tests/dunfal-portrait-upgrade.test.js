import test from 'node:test';
import assert from 'node:assert/strict';
import { getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { HOUSE_CHULAINN_FAMILY } from '../assets/js/data/house-chulainn-family.js';
import { HOUSE_NUADAT_FAMILY } from '../assets/js/data/house-nuadat-family.js';
import { withDunfalPortraitUpgrade, TADG_NUADAT_PORTRAIT } from '../assets/js/data/dunfal-portrait-upgrade.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';

for (const source of [HOUSE_CHULAINN_FAMILY, HOUSE_NUADAT_FAMILY]) {
  test(`${source.document.id}: Tadgs portrait refresh preserves identity and every genealogical relation`, () => {
    const next = withDunfalPortraitUpgrade(source);
    for (const key of ['document','lineage','partnerships','parentages','houses','cadetBranches','timeJumps','view']) {
      if (key === 'document') assert.deepEqual(next.document,source.document);
      else assert.deepEqual(next[key]?.map ? next[key].map(({extensions,...record})=>record) : next[key], source[key]?.map ? source[key].map(({extensions,...record})=>record) : source[key]);
    }
    for (const person of next.persons) {
      const previous = source.persons.find(entry=>entry.id===person.id);
      const {extensions,portrait,...identity} = person;
      const {extensions:oldExtensions,portrait:oldPortrait,...oldIdentity} = previous;
      assert.deepEqual(identity,oldIdentity);
      assert.equal(portrait,person.id==='tadg-1663-nuadat'?TADG_NUADAT_PORTRAIT:oldPortrait);
    }
    assert.equal(withDunfalPortraitUpgrade(next),next);
    const registered = getRegisteredFamily(source.document.id).family;
    const local = structuredClone(source);
    local.document.title = 'Eigener Titel';
    const upgraded = resolveRegisteredFamilyUpgrade(registered,local);
    assert.equal(upgraded.persons.find(person=>person.id==='tadg-1663-nuadat').portrait,TADG_NUADAT_PORTRAIT);
    assert.equal(upgraded.document.title,'Eigener Titel');
  });
}
