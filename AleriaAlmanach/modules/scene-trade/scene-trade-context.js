// The module store owns visibility and persistence. Cache its effective source
// snapshot on demand; search/input handling never clones the global module tree.
const permitted = section => !['Test', 'Familien'].includes(section?.tab || section?.key);
const usable = entry => entry?.id && !entry.hidden && !entry.archived && !entry.isTemplate;
const pathOf = section => Array.isArray(section?.path) ? section.path.map(String) : [];
const prefix = (parent, child) => parent.length <= child.length && parent.every((part, index) => part === child[index]);

export function createSceneTradeModuleSource({ readSections, readEntries = () => [], events } = {}) {
  let cached = null;
  const invalidate = () => { cached = null; };
  events?.addEventListener?.('almanach:modules-changed', invalidate);
  return Object.freeze({
    load() {
      if (cached) return cached;
      const sourceSections = readSections?.();
      const sections = (sourceSections || []).filter(permitted);
      const entries = [...new Map((Array.isArray(sourceSections) ? sections.flatMap(section => section.entries || []) : readEntries())
        .filter(usable).map(entry => [entry.id, entry])).values()];
      cached = Object.freeze({ sections: Object.freeze(sections), entries: Object.freeze(entries) });
      return cached;
    },
    invalidate,
    dispose() { events?.removeEventListener?.('almanach:modules-changed', invalidate); cached = null; }
  });
}
let browserSource;
export function readSceneTradeModules() {
  browserSource ||= createSceneTradeModuleSource({ readSections: () => globalThis.getValidSections?.() ?? null,
    readEntries: () => globalThis.itemDbGetModuleEntries?.() || [], events: globalThis.window });
  return browserSource.load();
}

export function resolveSceneTradeContext({ threadId = '', moduleId = '', entry = null, section = null,
  entries = [], sections = [], providers = [], ancestorModuleIds = [], ancestors = [] } = {}) {
  const id = String(threadId.split('::')[0] || moduleId || entry?.id || '');
  const byId = new Map(entries.filter(usable).map(value => [value.id, value]));
  if (usable(entry) && entry.id === id) byId.set(id, entry);
  for (const ancestor of ancestors.filter(usable)) if (!byId.has(ancestor.id)) byId.set(ancestor.id, ancestor);
  const ancestry = [], seen = new Set();
  const add = value => { if (usable(value) && !seen.has(value.id)) { seen.add(value.id); ancestry.push(value); } };
  add(byId.get(id));
  const merchantIds = new Set(providers.map(provider => provider.id));
  if (merchantIds.has(`module:${id}`)) return { moduleId: id, entry: byId.get(id) || null, ancestry,
    merchantId: `module:${id}`, reason: 'current-module', candidates: [] };
  // Explicit lineage is ordered nearest first by its owner. Cycles/duplicates
  // cannot turn it into an unbounded walk or select an unrelated merchant.
  for (const ancestorId of [...ancestorModuleIds, ...ancestors.map(value => value?.id)]) {
    const ancestor = byId.get(String(ancestorId || ''));
    if (!ancestor || seen.has(ancestor.id)) continue;
    add(ancestor);
    if (merchantIds.has(`module:${ancestor.id}`)) return { moduleId: id, entry: byId.get(id) || null, ancestry,
      merchantId: `module:${ancestor.id}`, reason: 'ancestor-module', candidates: [] };
  }
  const current = section || sections.find(value => value.entries?.some(value => value.id === id));
  if (current && permitted(current)) {
    const currentPath = pathOf(current), tab = current.tab || current.key;
    const levels = new Map();
    for (const candidateSection of sections.filter(permitted)) {
      const candidatePath = pathOf(candidateSection);
      if ((candidateSection.tab || candidateSection.key) !== tab || !prefix(candidatePath, currentPath)) continue;
      const depth = candidatePath.length;
      const candidates = levels.get(depth) || new Map();
      for (const value of candidateSection.entries || []) if (usable(value) && merchantIds.has(`module:${value.id}`)) candidates.set(value.id, value);
      levels.set(depth, candidates);
    }
    for (const depth of [...levels.keys()].sort((first, second) => second - first)) {
      const candidates = [...levels.get(depth).values()];
      if (!candidates.length) continue;
      if (candidates.length === 1) {
        add(candidates[0]);
        return { moduleId: id, entry: byId.get(id) || null, ancestry, merchantId: `module:${candidates[0].id}`, reason: 'nearest-section', candidates: [] };
      }
      return { moduleId: id, entry: byId.get(id) || null, ancestry, merchantId: '', reason: 'ambiguous-nearest-section',
        candidates: candidates.map(value => `module:${value.id}`).sort() };
    }
  }
  return { moduleId: id, entry: byId.get(id) || null, ancestry, merchantId: '', reason: 'no-contextual-merchant', candidates: [] };
}
