import { createTerritoryData } from './territory-data.mjs?v=heraldry-20261022';

// Resolve primary registers from their owning pages without including child domains.
export function createTerritoryPageCatalog(pages, context) {
  const pagesById = new Map(pages.map(page => [page.id, page]));
  return (id, data) => {
    const source = pagesById.get(id);
    if (!source) throw new Error(`Unbekannte Herrschaftsseite: ${id}`);
    const domains = [...source.domains, ...(source.domainReferences || []).map(territoryId => {
      const domain = pagesById.get(territoryId)?.domains.find(entry => entry.territoryId === territoryId);
      if (!domain) throw new Error(`Fehlendes eigenes Ortsregister: ${territoryId}`);
      return domain;
    })];
    return createTerritoryData({ ...source, domains }, context, data);
  };
}
