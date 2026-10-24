import { territoryChain, reviewedFief } from '../../../Stammbäume/assets/js/modules/albic-territories/fief-catalog.js';
import { getHouseRank } from '../../../Stammbäume/assets/js/domain/house-profile.js';

const familyHref = id => `/Stammbäume/Stammbaum.html?family=${id}&mode=view`;

export function clanCard(territory, registry, featured = false) {
  const record = registry.find(record => record.id === territory.familyId);
  const profile = record?.houseProfile || {};
  return { familyId: territory.familyId, name: territory.house,
    imageSrc: territory.crest, imageAlt: `Wappen ${territory.house}`, href: familyHref(territory.familyId),
    seat: territory.seat, rank: getHouseRank(profile.rankId).label,
    liege: profile.liegeHouseName || '', ...(featured ? { featured: true, featuredLabel: 'Herrschender Clan' } : {}) };
}

function hierarchy(territory, territories) {
  return [{ type: 'Sammlung', name: 'Kontinente', slug: 'kontinente' },
    { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
    ...territoryChain(territory, territories).map(t => ({ type: t.type, name: t.name, slug: t.id }))];
}

export function createFiefPage(territory, territories, registry) {
  const parent = territories.find(t => t.id === territory.parentId);
  const card = clanCard(territory, registry, true);
  const urban = territory.extent === 'urban';
  return { id: territory.id, title: territory.name, shortTitle: territory.name,
    type: territory.type, kicker: `${territory.type} · ${territory.house}`,
    parentHref: parent.href, parentLabel: parent.name, hierarchy: hierarchy(territory, territories),
    crestSrc: territory.banner || territory.crest,
    crestAlt: territory.bannerAlt || `Wappen ${territory.house}`,
    copy: { overview: [urban
      ? `${territory.name} ist die städtische Herrschaft des Clans in ${territory.seat}. Die Stadt ist zugleich der Sitz seines unmittelbaren Lehnsherrn; ein eigenes Landschaftsgebiet wird hierfür nicht abgegrenzt.`
      : `${territory.name} ist das Lehen der ${territory.house.replace(/^Clan /, '')} mit Sitz in ${territory.seat}. Es gehört zu ${parent.name}.`],
      history: [], culture: [], economy: [], defense: [],
      geography: territory.gloss ? [`${territory.name} bedeutet „${territory.gloss}“.`] : [] },
    infobox: [{ title: 'Herrschaft', rows: [
      { label: 'Typ', value: urban ? 'Städtische Laird-Herrschaft' : territory.type },
      { label: 'Herrschender Clan', value: territory.house, href: familyHref(territory.familyId) },
      { label: 'Rang', value: card.rank }, { label: 'Sitz', value: territory.seat },
      { label: 'Oberherrschaft', value: parent.name, href: parent.href },
    ] }],
    families: [{ title: 'Herrschender Clan', houses: [card] }],
    councilGroups: [], vassalGroups: [], domains: [], territoryLinks: [] };
}

export function reviewFiefPages(source, territories, registry, aliases) {
  const byId = new Map(territories.map(territory => [territory.id, territory]));
  const pages = source.pages.map(page => structuredClone(page));
  for (const territory of territories.filter(t => t.href && reviewedFief(t.id))) {
    if (!pages.some(page => page.id === territory.id)) {
      const page = createFiefPage(territory, territories, registry);
      page.map = structuredClone(pages.find(parent => parent.id === territory.parentId)?.map);
      pages.push(page);
    }
  }
  const rename = value => {
    if (typeof value === 'string') {
      for (const alias of aliases) value = value.replaceAll(alias.from, alias.to);
      return value;
    }
    if (Array.isArray(value)) return value.map(rename);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) =>
      // Stable routes and source IDs are never renamed.
      [key, /href|src|url|^id$|^slug$|^familyId$|^placeIds$/i.test(key) ? item : rename(item)]));
    return value;
  };
  return { ...source, pages: pages.map(original => {
    const page = rename(original), territory = byId.get(page.id);
    if (!territory) throw new Error(`Seite ohne Gebiet: ${page.id}`);
    const parent = byId.get(territory.parentId);
    if (!page.map) page.map = structuredClone(pages.find(p => p.id === territory.parentId)?.map);
    page.title = territory.name;
    if (page.type !== 'Fürstentum') page.shortTitle = territory.name;
    page.hierarchy = hierarchy(territory, territories);
    if (parent) { page.parentHref = parent.href; page.parentLabel = parent.name; }
    page.crestSrc = territory.banner || territory.crest;
    page.crestAlt = territory.bannerAlt || `Banner ${territory.name}`;
    page.territoryLinks = territories.filter(child => child.parentId === page.id && child.href && !child.pending).map(child => child.id);
    for (const group of page.infobox || []) for (const row of group.rows) {
      if (/^(Sitz|Hauptsitz|Stammsitz)$/.test(row.label)) row.value = territory.seat;
    }
    if (territory.gloss) {
      const explanation = `${territory.name} bedeutet „${territory.gloss}“.`;
      page.copy ||= {};
      page.copy.geography ||= [];
      if (!page.copy.geography.includes(explanation)) page.copy.geography.push(explanation);
    }
    // A newly added urban clan remains visible under its immediate liege.
    for (const child of territories.filter(t => t.parentId === page.id && t.familyId && reviewedFief(t.id))) {
      if (!page.families.flatMap(group => group.houses).some(house => house.familyId === child.familyId)) {
        let group = page.families.find(group => group.title === 'Unmittelbare Vasallen');
        if (!group) { group = { title: 'Unmittelbare Vasallen', houses: [] }; page.families.push(group); }
        group.houses.push(clanCard(child, registry));
      }
    }
    for (const group of page.families) for (const house of group.houses) {
      const home = territories.find(t => t.familyId === house.familyId && t.type !== 'Fürstentum');
      if (home?.seat) house.seat = home.seat;
    }
    return page;
  }) };
}
