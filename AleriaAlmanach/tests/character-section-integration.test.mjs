import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadCharacterTabEventHarness() {
  const listeners = new Map();
  const inventoryUpdates = [], status = { textContent: '' };
  const context = vm.createContext({
    console,
    Set,
    window: {},
    _editingChar: null,
    _characterInventoryEditMode: false,
    setCharacterInventoryProfileData(inventory, options) { inventoryUpdates.push({ inventory: structuredClone(inventory), ...options }); },
    document: {
      addEventListener(type, listener) {
        listeners.set(type, listener);
      },
      getElementById() { return status; }
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
  return { context, listeners, inventoryUpdates, status };
}

test('ein externer Teilbereichs-Patch löscht lokal weder Inventar noch Charakterbogen', () => {
  const { context, listeners } = loadCharacterTabEventHarness();
  context.__setCharacters([{
    id: 'gawain',
    name: 'Gawain Draig',
    portrait: '',
    inventory: { revision: 12, items: [{ id: 'sword' }] },
    combatProfile: { revision: 13, weapons: [{ id: 'sword' }] },
    imageSets: [{ id: 'standard', emotes: [] }]
  }]);

  listeners.get('aleria:character-saved')({
    detail: {
      record: {
        id: 'gawain',
        portrait: 'https://i.imgur.com/DpqoWhn.png',
        identity: { worldPersonId: 'person-gawain' },
        genealogy: { houseName: 'Draig' }
      }
    }
  });

  const [saved] = context.__getCharacters();
  assert.equal(saved.name, 'Gawain Draig');
  assert.equal(saved.portrait, 'https://i.imgur.com/DpqoWhn.png');
  assert.equal(saved.inventory.revision, 12);
  assert.equal(saved.combatProfile.revision, 13);
  assert.equal(saved.identity.worldPersonId, 'person-gawain');
  assert.equal(saved.genealogy.houseName, 'Draig');
});

test('ein bestätigter Kauf aktualisiert den offenen Geldbeutel auch vor dem identischen Registersnapshot', () => {
  const { context, listeners, inventoryUpdates } = loadCharacterTabEventHarness();
  const before = { id: 'buyer', name: 'Käuferin', inventory: { revision: 1, moneyState: { totalCopper: 12400 }, items: [] } };
  const after = { ...before, inventory: { revision: 2, moneyState: { totalCopper: 8150 }, items: [{ id: 'dress', name: 'Rosenquarz' }] } };
  context.__setCharacters([before]); context._editingChar = 'buyer';
  listeners.get('aleria:character-saved')({ detail: { record: after } });
  assert.equal(inventoryUpdates.length, 1);
  assert.equal(inventoryUpdates[0].inventory.moneyState.totalCopper, 8150);
  assert.equal(inventoryUpdates[0].render, true);
  listeners.get('aleria:item-register-records')({ detail: { charactersReady: true, characters: [after] } });
  assert.equal(inventoryUpdates.length, 1, 'Ein identischer späterer Snapshot muss den bestätigten Bogen nicht nochmals zeichnen.');
});

test('eine externe Abbuchung überschreibt keinen geöffneten Inventarentwurf und warnt vor erneutem Speichern', () => {
  const { context, listeners, inventoryUpdates, status } = loadCharacterTabEventHarness();
  context.__setCharacters([{ id: 'buyer', inventory: { revision: 1, moneyState: { totalCopper: 12400 } } }]);
  context._editingChar = 'buyer'; context._characterInventoryEditMode = true;
  listeners.get('aleria:character-saved')({ detail: { record: { id: 'buyer', inventory: { revision: 2, moneyState: { totalCopper: 8150 } } } } });
  assert.equal(inventoryUpdates.length, 0);
  assert.match(status.textContent, /anderswo geändert/);
  assert.equal(context.__getCharacters()[0].inventory.moneyState.totalCopper, 8150);
});
