import assert from 'node:assert/strict';

const mutableItemFields = ['id', 'instanceId', 'quantity', 'equipped', 'ownerCharacterId', 'ownerCharacterName',
  'acquiredAt', 'individualizedAt', 'usesCurrent', 'charges', 'durability', 'condition', 'itemDbKey', 'itemStorageMode'];

function updateDefinition(current, authored, preserve = mutableItemFields) {
  if (!authored) return structuredClone(current);
  const next = { ...structuredClone(current), ...structuredClone(authored) };
  for (const field of preserve) {
    if (Object.hasOwn(current, field)) next[field] = structuredClone(current[field]);
    else delete next[field];
  }
  return next;
}

export function buildEquipmentRelease(current, authored, revision) {
  const seen = new Map();
  for (const item of current.inventory?.items || []) {
    if (seen.has(item.id)) {
      const previous = seen.get(item.id);
      assert.equal(Number(previous.quantity), Number(item.quantity), `Ambiguous duplicate quantity: ${item.id}`);
      assert.equal(previous.equipmentLink?.combatEntryId, item.equipmentLink?.combatEntryId, `Ambiguous duplicate identity: ${item.id}`);
    } else seen.set(item.id, item);
  }
  const items = [...seen.values()].map(item => updateDefinition(item, authored.inventory.items.find(candidate => candidate.id === item.id)));
  const patch = { inventory: { ...structuredClone(current.inventory), items, revision },
    combatProfile: { ...structuredClone(current.combatProfile), revision } };
  for (const key of ['weapons', 'armorItems']) {
    patch.combatProfile[key] = (current.combatProfile[key] || []).map(item => updateDefinition(item,
      authored.combatProfile[key]?.find(candidate => candidate.id === item.id), ['id', 'inventoryItemId', 'equipped', 'ammunition', 'usesCurrent']));
  }
  return patch;
}

export function buildNewWolfshornSheet(current, authored, revision) {
  assert.equal(Object.keys(current.combatProfile || {}).length, 0, 'Existing combat sheet needs manual reconciliation');
  const placeholders = new Set(['Hauptwaffe', 'Rüstung / Schutz', 'Reiseausrüstung', 'Heil- oder Verbrauchsgut', 'Dokumente / Urkunden', 'Persönlicher Gegenstand']);
  assert.ok((current.inventory?.items || []).every(item => placeholders.has(item.name) && Number(item.quantity) === 1 && !item.equipmentLink), 'Inventory has real possessions');
  const inventory = { ...structuredClone(current.inventory), ...structuredClone(authored.inventory), revision };
  for (const key of ['money', 'moneyState', 'moneyNotice', 'portrait', 'portraitFit', 'portraitPosition', 'portraitFormat']) {
    if (Object.hasOwn(current.inventory || {}, key)) inventory[key] = structuredClone(current.inventory[key]);
  }
  return { combatProfile: { ...structuredClone(authored.combatProfile), revision }, inventory };
}
