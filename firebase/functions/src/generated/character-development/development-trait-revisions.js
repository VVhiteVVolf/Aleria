import { DEVELOPMENT_TRAITS } from './development-traits.js';
import { PREVIOUS_DEVELOPMENT_TRAITS } from './development-trait-revision-source.js';
import { getDevelopmentTraitId } from './development-entry-reference.js';

const current = new Map(DEVELOPMENT_TRAITS.map(entry => [entry.id, entry]));
const previous = new Map(PREVIOUS_DEVELOPMENT_TRAITS.map(entry => [entry.id, entry]));
const fields = ['name', 'type', 'description', 'appliesWhen', 'trigger', 'target', 'duration', 'stacking',
  'tags', 'limitations', 'aiInstructions', 'priority', 'mechanics', 'triggerRules'];
const signature = entry => JSON.stringify(fields.map(field => entry[field]));
const normalized = new WeakMap();

const completeSignature = value => {
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return `[${value.map(completeSignature).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort()
    .map(key => `${JSON.stringify(key)}:${completeSignature(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
};

// Editorial replay requires a complete source copy, including icon, cost and
// every extra field. Runtime normalization deliberately has a different scope.
export function isExactDevelopmentTraitCatalogCopy(value, id = value?.id, project = entry => entry) {
  const matches = entry => entry && completeSignature(value) === completeSignature(project(entry));
  return Boolean(matches(current.get(id)) || matches(previous.get(id)));
}

// Catalog IDs alone are insufficient: personal variants keep their own rules.
// Original definitions remain in the immutable manifest, while stored identity,
// active state, personal icon and every unrelated profile field are preserved.
export function reconcileDevelopmentTraitRevision(entry, normalize) {
  const id = getDevelopmentTraitId(entry);
  if (!previous.has(id)) return entry;
  let catalog = normalized.get(normalize);
  if (!catalog) {
    catalog = new Map([...previous].map(([key, value]) => [key, {
      before: signature(normalize(value)), after: normalize(current.get(key))
    }]));
    normalized.set(normalize, catalog);
  }
  const revision = catalog.get(id);
  if (signature(entry) !== revision.before) return entry;
  return { ...entry, ...Object.fromEntries(fields.map(field => [field, structuredClone(revision.after[field])])) };
}
