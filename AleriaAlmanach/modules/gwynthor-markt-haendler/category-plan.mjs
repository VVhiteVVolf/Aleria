import assert from 'node:assert/strict';
import { MARKET_CHARACTERS } from './characters.mjs';

// Preserve the existing REST values and all unrelated register configuration.
// assignedTab is export metadata; the live register reads config.map instead.
export function buildMarketCategoryWrite(configDocument) {
  assert(configDocument?.name?.endsWith('/documents/char_tabs/config') && configDocument.updateTime, 'Bestehende Registerkonfiguration mit CAS-Version fehlt.');
  assert(configDocument.fields?.tabs?.arrayValue?.values?.some(value => value.stringValue === 'Gwynthor'), 'Vorhandener Gwynthor-Reiter fehlt.');
  const group = configDocument.fields?.map?.mapValue?.fields?.Gwynthor;
  assert(group?.arrayValue, 'Bestehende Gwynthor-Mitgliedsliste fehlt.');
  const values = group.arrayValue.values || [];
  assert(values.every(value => typeof value.stringValue === 'string' && Object.keys(value).length === 1), 'Ungültige Gwynthor-Mitgliedschaft.');
  const additions = MARKET_CHARACTERS.filter(person => !values.some(value => value.stringValue === person.id));
  if (!additions.length) return null;
  return {
    update: { name: configDocument.name, fields: { map: { mapValue: { fields: {
      Gwynthor: { arrayValue: { values: [...structuredClone(values), ...additions.map(person => ({ stringValue: person.id }))] } }
    } } } } },
    updateMask: { fieldPaths: ['map.Gwynthor'] }, currentDocument: { updateTime: configDocument.updateTime }
  };
}

export function assertMarketCategoryReadBack(before, after) {
  const expected = structuredClone(before.fields);
  const write = buildMarketCategoryWrite(before);
  if (write) expected.map.mapValue.fields.Gwynthor = write.update.fields.map.mapValue.fields.Gwynthor;
  assert.deepEqual(after?.fields, expected, 'Unbeteiligte Registerkonfiguration oder Gwynthor-Zuordnung verändert.');
  return true;
}
