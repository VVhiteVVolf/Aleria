// Shared authoring contract: a scene item becomes the same inventory record on pickup.
export const SCENE_ITEM_KINDS = Object.freeze({ weapon: 'Waffe', armor: 'Rüstung', potions: 'Verbrauchsgut', artifact: 'Artefakt', equipment: 'Ausrüstung', documents: 'Dokument' });
export const SCENE_ITEM_AXES = Object.freeze(['Schaden', 'Schutz', 'Wert', 'Seltenheit', 'Zuverlässigkeit', 'Handhabung']);
const clean = (value, max = 160) => String(value ?? '').trim().slice(0, max);
const number = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const categoryMap = { waffen: 'weapon', ruestungen: 'armor', alchemie: 'potions', speisen: 'potions', getraenke: 'potions', arkanes: 'artifact' };

export function sceneItemDraftFromTemplate(template = {}) {
  const definition = template.combatDefinition || {};
  return { template: template.id || '', moduleId: template.moduleId || '', sourceRevision: template.sourceRevision || '',
    name: template.title || template.name || '', image: template.image || '', description: template.description || template.details || '',
    category: definition.kind || categoryMap[template.category] || 'equipment', type: template.type || '',
    priceMin: template.priceRange?.minCopper ?? '', priceMax: template.priceRange?.maxCopper ?? '',
    info: (template.infoRows || []).map(row => `${row.label}: ${row.value}`).join('\n'),
    attributes: SCENE_ITEM_AXES.map(label => ({ label, value: Number(template.attributes?.find(row => row.label === label)?.value) || 0 })),
    damageFormula: definition.damageFormula || '', damageType: definition.damageType || 'Hieb',
    attackBonus: definition.attackBonus || 0, damageBonus: definition.damageBonus || 0,
    baseArmorClass: definition.baseArmorClass ?? 10, armorClassBonus: definition.armorClassBonus || 0,
    properties: definition.properties || '', weight: template.weight || '' };
}

export function buildSceneItemDefinition(draft = {}, template = null, identity = 'preview') {
  const name = clean(draft.name), description = clean(draft.description, 1800);
  if (!name || !description) throw new Error('Bitte Name und Kurzbeschreibung des Gegenstands ergänzen.');
  const image = clean(draft.image, 2000);
  if (image && !/^https?:\/\//i.test(image) && image !== template?.image) throw new Error('Bitte einen gültigen HTTP-Bildlink verwenden.');
  const category = Object.hasOwn(SCENE_ITEM_KINDS, draft.category) ? draft.category : 'equipment';
  let combatDefinition = template?.combatDefinition?.kind === category ? JSON.parse(JSON.stringify(template.combatDefinition)) : null;
  if (category === 'weapon' || category === 'armor') {
    combatDefinition = { ...combatDefinition, kind: category, properties: clean(draft.properties, 800) };
    if (category === 'weapon') {
      const formula = clean(draft.damageFormula || combatDefinition.damageFormula || '1d4').replace(/w/gi, 'd');
      if (!/^\d{1,2}d\d{1,3}(?:\s*[+-]\s*\d{1,3})?$/.test(formula)) throw new Error('Schaden bitte als Würfelformel angeben, z. B. 1W8.');
      Object.assign(combatDefinition, { damageFormula: formula, damageType: clean(draft.damageType || 'Hieb'),
        attackBonus: number(draft.attackBonus, -10, 10), damageBonus: number(draft.damageBonus, -20, 20) });
    } else Object.assign(combatDefinition, { baseArmorClass: number(draft.baseArmorClass ?? 10, 0, 30), armorClassBonus: number(draft.armorClassBonus, -10, 10) });
  }
  const hasPrice = [draft.priceMin, draft.priceMax].some(value => value != null && value !== '') || !!template?.priceRange;
  const min = number(draft.priceMin === '' ? template?.priceRange?.minCopper : draft.priceMin ?? template?.priceRange?.minCopper, 0, 1e9);
  const max = number(draft.priceMax === '' ? min : draft.priceMax ?? template?.priceRange?.maxCopper ?? min, 0, 1e9);
  return { id: `item:${identity}`, instanceId: `item:${identity}`, name, description, image, quantity: '1', equipped: false,
    templateId: template?.templateId || template?.id || '', offerId: template?.section === 'offer' ? template.id : '',
    category, registerCategory: { weapon: 'waffen', armor: 'ruestungen', potions: 'alchemie', artifact: 'arkanes', equipment: 'werkzeuge', documents: 'sonstiges' }[category],
    type: clean(draft.type || SCENE_ITEM_KINDS[category]), weight: clean(draft.weight),
    valuation: hasPrice ? { minCopper: Math.round(Math.min(min, max) * 100) / 100, maxCopper: Math.round(Math.max(min, max) * 100) / 100 } : null,
    valuationNote: clean(draft.valuationNote || (template ? 'Nach Registervorlage; durch die Spielleitung angepasst.' : 'Handelswert der Spielleitung.'), 500),
    infoRows: clean(draft.info, 4000).split('\n').filter(Boolean).slice(0, 16).map(line => {
      const split = line.indexOf(':'); return { label: split > 0 ? clean(line.slice(0, split), 80) : 'Wirkung', value: clean(split > 0 ? line.slice(split + 1) : line, 500) };
    }),
    attributes: SCENE_ITEM_AXES.map(label => ({ label, value: number(draft.attributes?.find(row => row.label === label)?.value, 0, 10) })),
    combatDefinition, inventoryUseMode: category === 'potions' ? 'consume' : 'use' };
}
