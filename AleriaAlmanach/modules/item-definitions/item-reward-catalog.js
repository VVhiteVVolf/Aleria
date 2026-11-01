import { itemDefinitionRegistry } from './item-definition-registry.js';
let pending;
// One canonical reward catalogue for notice boards and quests. Definitions stay
// deduplicated in the existing catalogue and are registered as pinned versions.
export function loadItemRewardCatalog() {
  return pending ||= fetch(new URL('../../../Anzeigetafeln/assets/data/notice-reward-catalog.json', import.meta.url), { cache: 'no-cache' }).then(response => {
    if (!response.ok) throw Error('Das Güterverzeichnis ist nicht erreichbar.');
    return response.json();
  }).then(data => {
    if (!Array.isArray(data.items) || !Array.isArray(data.definitions)) throw Error('Das Güterverzeichnis ist unvollständig.');
    itemDefinitionRegistry.add(data.definitions, { current: false });
    return data.items;
  }).catch(error => { pending = null; throw error; });
}
