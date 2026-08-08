import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadCharacterTabEventHarness() {
  const listeners = new Map();
  const context = vm.createContext({
    console,
    Set,
    window: {},
    document: {
      addEventListener(type, listener) {
        listeners.set(type, listener);
      }
    },
    cloneCharacterRecord(record) {
      return structuredClone(record);
    },
    renderCharSubtabs() {},
    renderCharGrid() {},
    renderCharPickerInForm() {},
    refreshAllModuleCastPickers() {},
    sanitizeCharacterInventoryData(value) { return value; }
  });
  const source = fs.readFileSync(
    new URL('../modules/characters/character-tabs.js', import.meta.url),
    'utf8'
  );
  vm.runInContext(`${source}\n;
    renderCharSubtabs = () => {};
    renderCharGrid = () => {};
    renderCharPickerInForm = () => {};
    refreshAllModuleCastPickers = () => {};
    globalThis.__setCharacters = value => { _characters = value; };
    globalThis.__getCharacters = () => _characters;
  `, context);
  return { context, listeners };
}

test('ein externer Teilbereichs-Patch löscht lokal weder Inventar noch Charakterbogen', () => {
  const { context, listeners } = loadCharacterTabEventHarness();
  context.__setCharacters([{
    id: 'gawain',
    name: 'Gawain Draig',
    inventory: { revision: 12, items: [{ id: 'sword' }] },
    combatProfile: { revision: 13, weapons: [{ id: 'sword' }] },
    imageSets: [{ id: 'standard', emotes: [] }]
  }]);

  listeners.get('aleria:character-saved')({
    detail: {
      record: {
        id: 'gawain',
        identity: { worldPersonId: 'person-gawain' },
        genealogy: { houseName: 'Draig' }
      }
    }
  });

  const [saved] = context.__getCharacters();
  assert.equal(saved.name, 'Gawain Draig');
  assert.equal(saved.inventory.revision, 12);
  assert.equal(saved.combatProfile.revision, 13);
  assert.equal(saved.identity.worldPersonId, 'person-gawain');
  assert.equal(saved.genealogy.houseName, 'Draig');
});
