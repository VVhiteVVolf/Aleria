import { itemDefinitionRegistry } from './item-definition-registry.js';
import { AUTHORED_ITEMS } from './authored-item-catalog.js';
import { itemDefinitionFromTemplate, definitionTemplate, itemDefinitionKey, normalizeItemDefinitionRef } from './item-definition-model.js';

let api = null, unsubscribe = null;
let heads = [], status = 'offline', error = '';
const listeners = new Set(), pending = new Map();
function changed() {
  for (const listener of listeners) listener(snapshot());
  if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent('aleria:item-definitions-changed'));
}
function snapshot() {
  const available = new Map(AUTHORED_ITEMS.map(itemDefinitionFromTemplate).filter(Boolean).map(d=>[d.id,d]));
  for (const definition of heads) available.set(definition.id,definition);
  return { templates: [...available.values()].map(definitionTemplate), status, error };
}
function addHeads(definitions) {
  itemDefinitionRegistry.add(definitions);
  const byId = new Map(heads.map(definition => [definition.id, definition]));
  for (const definition of definitions) byId.set(definition.id, definition);
  heads = [...byId.values()];
  changed();
}
export const itemDefinitionStore = Object.freeze({
  snapshot,
  connect(nextApi) {
    if (api === nextApi && unsubscribe) return;
    unsubscribe?.(); unsubscribe = null; api = nextApi;
    if (!api?.subscribe) { status = 'offline'; changed(); return; }
    status = 'loading'; error = '';
    unsubscribe = api.subscribe((definitions, metadata = {}) => {
      itemDefinitionRegistry.add(definitions);
      heads = definitions;
      status = metadata.fromCache ? 'offline' : 'live'; error = ''; changed();
    }, failure => { status = 'error'; error = failure.message || 'Itemdefinitionen konnten nicht geladen werden.'; changed(); });
  },
  registerTemplates(templates) {
    const definitions = templates.filter(template => ['standard', 'regional'].includes(template.section) || template.definitionDerived)
      .map(itemDefinitionFromTemplate).filter(Boolean);
    itemDefinitionRegistry.add(definitions);
  },
  async ensureVersions(records = []) {
    if (!api?.loadVersions) return;
    const missing = new Map();
    for (const record of records) for (const item of record.inventory?.items || record.items || []) {
      const ref = normalizeItemDefinitionRef(item.definitionRef);
      if (ref && !itemDefinitionRegistry.get(ref)) missing.set(itemDefinitionKey(ref), ref);
    }
    const fresh = [...missing].filter(([key]) => !pending.has(key));
    if (fresh.length) {
      const loading = api.loadVersions(fresh.map(([, ref]) => ref)).then(definitions => {
        itemDefinitionRegistry.add(definitions, { current: false }); changed();
      }).finally(() => { for (const [key] of fresh) pending.delete(key); });
      for (const [key] of fresh) pending.set(key, loading);
    }
    await Promise.all([...missing.keys()].map(key => pending.get(key)).filter(Boolean));
  },
  async save(input) {
    if (!api?.commit) throw Error('Die gemeinsame Itemverwaltung ist noch nicht verbunden.');
    const result = await api.commit(input);
    if (result.definition) addHeads([result.definition]);
    return result;
  },
  async trade(input) { if (!api?.trade) throw Error('Der Handel ist noch nicht verbunden.'); return api.trade(input); },
  async award(input) { if (!api?.award) throw Error('Die Belohnungsverwaltung ist noch nicht verbunden.'); return api.award(input); },
  async migrate(input) { if (!api?.migrate) throw Error('Die Bestandsübernahme ist noch nicht verbunden.'); return api.migrate(input); },
  async characters() { if (!api?.characters) return []; return api.characters(); },
  async record(kind, id) { if (!api?.record) throw Error('Die Inventarquelle ist noch nicht verbunden.'); return api.record(kind, id); },
  async access() { if (!api?.access) throw Error('Die Anmeldung ist noch nicht verfügbar.'); return api.access(); },
  subscribe(listener) { listeners.add(listener); listener(snapshot()); return () => listeners.delete(listener); }
});
