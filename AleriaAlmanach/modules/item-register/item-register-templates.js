// Authoring features consume the same purchasable register templates.
export function collectRegisterTemplates(snapshot = {}) {
  return [...(snapshot.standards || []), ...(snapshot.offers || []).filter(item => item.moduleId || item.id?.startsWith('offer:'))]
    .filter(item => !item.archived && !['pferde', 'vieh'].includes(item.category));
}
