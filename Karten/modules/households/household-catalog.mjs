import { createHouseholdIndex } from './household-model.mjs';

export function createCatalogLoader(fetcher = fetch) {
  let pending;
  return () => pending ||= fetcher(new URL('./households.generated.json', import.meta.url))
    .then(response => { if (!response.ok) throw new Error('Wappenregister konnte nicht geladen werden.'); return response.json(); })
    .then(catalog => { if (catalog.schemaVersion !== 1) throw new Error('Unbekanntes Wappenregister.'); return createHouseholdIndex(catalog); })
    .catch(error => { pending = null; throw error; });
}
