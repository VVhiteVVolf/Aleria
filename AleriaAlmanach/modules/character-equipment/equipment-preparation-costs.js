const RESOURCES = Object.freeze([
  { id: 'action', name: 'Aktion' },
  { id: 'bonus-action', name: 'Bonusaktion' },
  { id: 'reaction', name: 'Reaktion' }
]);

export function normalizeEquipmentPreparationCosts(value = []) {
  if (!Array.isArray(value)) throw Error('Ausrüstungskosten benötigen eine Liste regulärer Ressourcen.');
  const amounts = new Map();
  for (const entry of value) {
    const resource = RESOURCES.find(resource => resource.id === entry?.resourceId);
    const amount = Number(entry?.amount);
    if (!resource || !Number.isSafeInteger(amount) || amount < 1 || amount > 6) {
      throw Error('Ausrüstungskosten benötigen gültige Aktionsressourcen und ganze Mengen von 1 bis 6.');
    }
    if (amounts.has(resource.id)) throw Error('Ausrüstungskosten dürfen dieselbe Ressource nicht doppelt enthalten.');
    amounts.set(resource.id, amount);
  }
  return RESOURCES.filter(resource => amounts.has(resource.id)).map(resource => ({
    resourceId: resource.id, name: resource.name, amount: amounts.get(resource.id), scope: 'comment'
  }));
}

export function getEquipmentPreparationCosts(equipment = null) {
  // Legacy equipment retains the existing one-bonus-action change rule.
  const authored = equipment?.armorRuleVersion === 2 ? normalizeEquipmentPreparationCosts(equipment.equipCosts || []) : [];
  const costs = new Map(authored.map(cost => [cost.resourceId, cost]));
  if (!costs.has('bonus-action')) costs.set('bonus-action', { resourceId: 'bonus-action', name: 'Bonusaktion', amount: 1, scope: 'comment' });
  return RESOURCES.flatMap(resource => costs.has(resource.id) ? [costs.get(resource.id)] : []);
}

export function describeEquipmentPreparationCosts(costs = []) {
  return costs.map(cost => `${cost.amount} ${RESOURCES.find(resource => resource.id === cost.resourceId)?.name || cost.name || cost.resourceId}`).join(' + ');
}
