import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const context = vm.createContext({ window: {}, document: { addEventListener() {} } });
vm.runInContext(await readFile(new URL('../modules/module-editor/module-editor-character-inventory.js', import.meta.url), 'utf8'), context);
const evaluate = expression => JSON.parse(JSON.stringify(vm.runInContext(expression, context)));

test('an explicit empty attribute list remains empty for character, item and narrative animal after two saves', () => {
  context.input = { attributes: [], items: [{ id: 'animal-item', name: 'Unbenanntes Kaninchen', attributes: [],
    registerCategory: 'vieh', ownerCharacterId: 'lili', category: 'companion' }],
    companions: [{ id: 'animal-card', name: 'Unbenanntes Kaninchen', species: 'Kaninchen',
      inventoryItemId: 'animal-item', attributes: [], status: 'Nicht festgelegt' }] };
  const result = evaluate('sanitizeCharacterInventoryData(sanitizeCharacterInventoryData(input))');
  assert.deepEqual(result.attributes, []);
  assert.deepEqual(result.items[0].attributes, []);
  assert.deepEqual(result.companions[0].attributes, []);
  assert.equal(result.companions[0].inventoryItemId, 'animal-item');
  assert.equal(result.companions[0].status, 'Nicht festgelegt');
});

test('missing and invalid attribute data retain editor defaults; explicit authored values still normalize', () => {
  const defaults = [{ label: 'Vorgabe', value: 7 }];
  context.defaults = defaults;
  assert.deepEqual(evaluate('sanitizeCharacterInventoryAttributes(undefined, defaults)'), defaults);
  assert.deepEqual(evaluate('sanitizeCharacterInventoryAttributes(null, defaults)'), defaults);
  assert.deepEqual(evaluate('sanitizeCharacterInventoryAttributes("invalid", defaults)'), defaults);
  assert.deepEqual(evaluate('sanitizeCharacterInventoryAttributes([], defaults)'), []);
  assert.deepEqual(evaluate('sanitizeCharacterInventoryAttributes([{label:"Eigener Wert",value:99}], defaults)'),
    [{ label: 'Eigener Wert', value: 10 }]);
  assert.equal(evaluate('sanitizeCharacterInventoryCompanions([{name:"Neuer Gefährte"}])[0].attributes').length, 6);
});
