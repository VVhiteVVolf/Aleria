// Recognize only untouched historical editor examples. A name alone never
// identifies an item type, a duplicate, or something that may be deleted.
const examples = [
  ['weapon', 'Hauptwaffe', 'Waffe', 'Beschreibe Material, Zustand und besondere Merkmale.'],
  ['armor', 'Rüstung / Schutz', 'Rüstung', 'Rüstung, Kleidung oder magischer Schutz.'],
  ['equipment', 'Reiseausrüstung', 'Ausrüstung', 'Werkzeuge, Vorrat oder nützliche Gegenstände.'],
  ['potions', 'Heil- oder Verbrauchsgut', 'Trinktur', 'Trank, Verband, Fokus oder anderer aufbrauchbarer Gegenstand.'],
  ['documents', 'Dokumente / Urkunden', 'Dokument', 'Passierschein, Brief, Vertrag, Siegel oder Lizenz.'],
  ['other', 'Persönlicher Gegenstand', 'Sonstiges', 'Erbstück, Andenken, Siegel oder wichtiger Besitz.']
];
const defaultAxes = [5, 3, 4, 2, 6, 5];

export function isInventoryPlaceholder(item = {}) {
  if (!examples.some(([category, name, type, description]) => item.category === category
    && item.name === name && item.type === type && item.description === description)) return false;
  if (item.combatDefinition || item.equipmentLink || item.creatureId || item.templateId || item.offerId
    || item.itemDbKey || item.originItemDbKey || item.purchase || item.valuation || item.houseArmor
    || item.equipped || item.image || item.tags || item.flavorText) return false;
  if (item.icon && item.icon !== '*') return false;
  if (Number(item.quantity ?? 1) !== 1 || (item.weight && item.weight !== 'Noch festlegen')) return false;
  if ((item.infoRows || []).some(row => row.value && row.value !== 'Noch festlegen')) return false;
  if ((item.attributes || []).length && (item.attributes.length !== defaultAxes.length
    || item.attributes.some((axis, index) => Number(axis.value) !== defaultAxes[index]))) return false;
  if (Object.values(item.value || {}).some(value => Number(value) > 0)) return false;
  return true;
}
