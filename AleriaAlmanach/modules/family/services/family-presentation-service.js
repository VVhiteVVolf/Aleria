// Resolves display metadata from the Aleria genealogy without knowing the renderer.

(function installFamilyPresentationService(global) {
  'use strict';

  function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asText(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function getId(value) {
    return asText(value);
  }

  function buildLifeLine(life = {}) {
    const birth = asText(life.birth);
    const death = asText(life.death);
    if (birth || death) return `${birth ? `* ${birth}` : ''}${birth && death ? ' · ' : ''}${death ? `† ${death}` : ''}`;
    const labels = { alive: 'Lebend', dead: 'Verstorben', missing: 'Verschollen', undead: 'Untot' };
    return labels[asText(life.status)] || '';
  }

  function createProjector(genealogy = {}) {
    const fantasy = isRecord(genealogy.fantasy) ? genealogy.fantasy : {};
    const houses = new Map(asArray(fantasy.houses).map(house => [getId(house?.id), asText(house?.name)]));
    const lineages = new Map(asArray(fantasy.lineages).map(lineage => [getId(lineage?.id), asText(lineage?.name)]));
    const titles = new Map(asArray(fantasy.titles).map(title => [getId(title?.id), asText(title?.name)]));
    const bloodlines = new Map(asArray(fantasy.bloodlines).map(bloodline => [getId(bloodline?.id), asText(bloodline?.name)]));
    const personMeta = new Map();

    function add(personId, field, value) {
      const id = getId(personId);
      const label = asText(value);
      if (!id || !label) return;
      if (!personMeta.has(id)) personMeta.set(id, { houses: [], lineages: [], titles: [], bloodlines: [], succession: [] });
      const values = personMeta.get(id)[field];
      if (!values.includes(label)) values.push(label);
    }

    asArray(fantasy.houseAffiliations).forEach(affiliation => {
      if (affiliation?.status === 'former') return;
      add(affiliation?.personId, 'houses', houses.get(getId(affiliation?.houseId)));
      add(affiliation?.personId, 'lineages', lineages.get(getId(affiliation?.lineageId)));
    });
    asArray(fantasy.titleHoldings).forEach(holding => {
      if (holding?.status === 'former') return;
      add(holding?.personId, 'titles', titles.get(getId(holding?.titleId)));
    });
    asArray(fantasy.claims).forEach(claim => {
      if (claim?.status === 'denied' || claim?.status === 'renounced') return;
      const title = titles.get(getId(claim?.titleId));
      add(claim?.personId, 'titles', title ? `Anspruch: ${title}` : 'Titelanspruch');
    });
    asArray(fantasy.bloodlineLinks).forEach(link => {
      add(link?.personId, 'bloodlines', bloodlines.get(getId(link?.bloodlineId)));
    });
    asArray(fantasy.successionDecisions).forEach(decision => {
      const rank = Number(decision?.rank);
      const label = Number.isFinite(rank) && rank > 0
        ? `Erbfolge ${rank}`
        : decision?.status === 'heir' ? 'Erbe' : '';
      add(decision?.personId, 'succession', label);
    });

    return Object.freeze({
      get(person = {}) {
        const meta = personMeta.get(getId(person.id)) || {};
        const contextLine = [
          asArray(meta.titles)[0],
          asArray(meta.houses)[0],
          asArray(meta.lineages)[0],
          asArray(meta.succession)[0],
          asArray(meta.bloodlines)[0]
        ].map(asText).filter(Boolean).join(' · ');
        return Object.freeze({
          contextLine,
          lifeLine: buildLifeLine(isRecord(person.life) ? person.life : {})
        });
      }
    });
  }

  const currentApi = isRecord(global.AleriaFamily) ? global.AleriaFamily : {};
  const currentServices = isRecord(currentApi.services) ? currentApi.services : {};
  global.AleriaFamily = Object.freeze({
    apiVersion: currentApi.apiVersion || 1,
    schema: currentApi.schema || 'aleria.family',
    schemaVersion: currentApi.schemaVersion || 2,
    ...currentApi,
    services: Object.freeze({
      ...currentServices,
      presentation: Object.freeze({ createProjector })
    })
  });
})(globalThis);
