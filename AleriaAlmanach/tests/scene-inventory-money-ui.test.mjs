import test from 'node:test';
import assert from 'node:assert/strict';
import { sceneInventoryPeople, mountSceneInventoryPeople, disposeSceneInventoryPeople } from '../modules/scene-inventory/scene-inventory-people.js';
import { formatSceneInventoryMoney, renderSceneInventoryMoneyPreview, refreshSceneInventoryMoneyPreview } from '../modules/scene-inventory/scene-inventory-money-ui.js';

const figure = (id, name, minor = 0) => ({ id, name, inventory: { moneyState: { totalCopper: minor / 100 } } });

test('scene participants precede the archive while every saved nonarchived figure remains searchable', () => {
  const characters = [figure('archive', 'Aeron'), figure('speaker', 'Zoe'), figure('cast', 'Ylva'),
    { ...figure('old', 'Archiviert'), archived: true }];
  const { accounts, sceneIds } = sceneInventoryPeople({ characters, entry: { sessionCast: ['cast'] }, comments: [{ characterId: 'speaker' }] });
  assert.deepEqual(accounts.map(account => account.id), ['cast', 'speaker', 'archive']);
  assert.deepEqual([...sceneIds].sort(), ['cast', 'speaker']);
  assert.equal(accounts[2].inScene, false);
  assert.equal(accounts.some(account => account.id === 'old'), false);
});

test('picker context reuses aliases and ignores stale identities or narrator prose', () => {
  const characters = [{ ...figure('g', 'Gawain'), aliases: 'Der Ritter, Sir Gawain' }, figure('y', 'Ylva')];
  const result = sceneInventoryPeople({ characters, comments: [{ charName: 'Sir Gawain' },
    { characterId: 'stale', charName: 'Ylva' }, { narrator: true, charName: 'Ylva', text: 'Ylva zählt Geld.' }] });
  assert.deepEqual([...result.sceneIds], ['g']);
});

test('money preview converts one copper to ninety Pfennig and ten Pfennig change without touching inventories', () => {
  const giver = figure('g', 'Gawain', 100), receiver = figure('r', 'Rianna', 0);
  const before = structuredClone([giver, receiver]);
  const output = renderSceneInventoryMoneyPreview(giver, receiver, { currency: 'pfennig', quantity: '90', targetKind: 'character' });
  assert.match(output, /1 Kupfer<\/span><b[^>]*>−<\/b><span>90 Eisenpfennig<\/span><b[^>]*>=<\/b><strong>10 Eisenpfennig/);
  assert.match(output, /<dt>Kupfer<\/dt><dd>0,9<\/dd>/);
  assert.match(output, /Rianna: 0 Eisenpfennig → <strong>90 Eisenpfennig/);
  assert.deepEqual([giver, receiver], before);
});

test('sink preview needs no receiver and renders only inventory bookkeeping', () => {
  const output = renderSceneInventoryMoneyPreview(figure('g', 'Gawain', 100), null, { currency: 'pfennig', quantity: '90', targetKind: 'sink' });
  assert.match(output, /Ausgeben · Bank: Der Betrag wird aus dem Inventar ausgebucht/);
  assert.doesNotMatch(output, /Empfänger|<img|flavour|Transaktionsicon/i);
  assert.equal(formatSceneInventoryMoney(0), '0 Eisenpfennig');
  assert.equal(formatSceneInventoryMoney(101), '1 Kupfer · 1 Eisenpfennig');
});

test('invalid amount or insufficient balance shows a clear preview error and escapes figure names', () => {
  const giver = figure('g', '<img src=x onerror=bad()>', 100);
  for (const quantity of ['0', '0.5', '101']) {
    const output = renderSceneInventoryMoneyPreview(giver, null, { currency: 'pfennig', quantity, targetKind: 'sink' });
    assert.match(output, /scene-money-preview-error/);
    assert.doesNotMatch(output, /<img/);
    assert.match(output, /&lt;img/);
  }
});

test('an unresolved booking keeps its retry active and does not revalidate an already spent balance', () => {
  const target = { innerHTML: '' }, submit = { disabled: true, textContent: '' };
  const inputs = { '#scene-transfer-kind': { value: 'money' }, '#scene-transfer-currency': { value: 'pfennig' },
    '#scene-transfer-money-amount': { value: '90' }, '#scene-transfer-money-mode': { value: 'sink' },
    '[data-scene-money-preview]': target, '[data-scene-inventory-action="submit"]': submit };
  const overlay = { dataset: { sceneInventoryLocked: 'true', sceneMoneyPending: 'true', sceneMoneySubmitting: 'false' },
    querySelector: selector => inputs[selector], querySelectorAll: () => [] };
  refreshSceneInventoryMoneyPreview(overlay, { giver: figure('g', 'Gawain', 0) });
  assert.match(target.innerHTML, /Offene Buchung über <strong>90 Eisenpfennig/);
  assert.doesNotMatch(target.innerHTML, /nicht genug Geld|preview-error/);
  assert.equal(submit.disabled, false);
  assert.equal(submit.textContent, 'Offene Buchung prüfen');
  overlay.dataset.sceneMoneySubmitting = 'true';
  refreshSceneInventoryMoneyPreview(overlay, { giver: figure('g', 'Gawain', 0) });
  assert.equal(submit.disabled, true);
});

test('normal submit requires a valid amount and wallet while sink needs no receiver', () => {
  const target = { innerHTML: '' }, submit = { disabled: false }, inputs = {
    '#scene-transfer-kind': { value: 'money' }, '#scene-transfer-currency': { value: 'pfennig' },
    '#scene-transfer-money-amount': { value: '90' }, '#scene-transfer-money-mode': { value: 'character' },
    '[data-scene-money-preview]': target, '[data-scene-inventory-action="submit"]': submit };
  const overlay = { dataset: {}, querySelector: selector => inputs[selector], querySelectorAll: () => [] };
  const giver = figure('g', 'Gawain', 100), receiver = figure('r', 'Rianna');
  for (const balance of [0, 89]) {
    refreshSceneInventoryMoneyPreview(overlay, { giver: figure('g', 'Gawain', balance), receiver });
    assert.equal(submit.disabled, true);
  }
  refreshSceneInventoryMoneyPreview(overlay, { giver, receiver }); assert.equal(submit.disabled, false);
  refreshSceneInventoryMoneyPreview(overlay, { giver, receiver: giver }); assert.equal(submit.disabled, true);
  refreshSceneInventoryMoneyPreview(overlay, { giver, receiver: null }); assert.equal(submit.disabled, true);
  inputs['#scene-transfer-money-mode'].value = 'sink';
  refreshSceneInventoryMoneyPreview(overlay, { giver, receiver: null }); assert.equal(submit.disabled, false);
  overlay.dataset.sceneInventoryLocked = 'true';
  refreshSceneInventoryMoneyPreview(overlay, { giver, receiver: null }); assert.equal(submit.disabled, true);
});

test('an empty scene starts in the full archive and disables only its empty scene filter', () => {
  const field = () => ({ value: '' }), slot = () => ({ dataset: {}, innerHTML: '' });
  const targets = { '#scene-transfer-giver': field(), '#scene-transfer-receiver': field(),
    '[data-scene-inventory-picker="giver"]': slot(), '[data-scene-inventory-picker="receiver"]': slot() };
  const button = scope => ({ dataset: { sceneInventoryScope: scope }, attributes: {}, disabled: false,
    setAttribute(name, value) { this.attributes[name] = value; }, querySelector: () => ({ textContent: '' }) });
  const scene = button('scene'), all = button('all');
  const overlay = { dataset: {}, classList: { contains: () => true }, addEventListener() {},
    querySelector: selector => targets[selector], querySelectorAll: selector => selector === '[data-scene-inventory-scope]' ? [scene, all] : [] };
  mountSceneInventoryPeople(overlay, { characters: [figure('g', 'Gawain'), figure('r', 'Rianna')] });
  assert.equal(all.attributes['aria-pressed'], 'true'); assert.equal(all.disabled, false);
  assert.equal(scene.attributes['aria-pressed'], 'false'); assert.equal(scene.disabled, true);
  assert.equal(targets['#scene-transfer-giver'].value, 'g');
  assert.equal(targets['#scene-transfer-receiver'].value, 'r');
  disposeSceneInventoryPeople(overlay);
});
