import { structure, territories, territoriesById, clansById, settlementsById, regionsById,
  territoryAncestors, familyHref } from '../../../Stammbäume/assets/js/data/uathneach-territorial-catalog.js';
import { markers } from '../../../Karten/Uathneach/places.mjs';

const map = { title: 'Karte des Fürstentums Uathneach', imageSrc: '/Karten/Uathneach/Kartenbilder/regionen.webp',
  imageAlt: 'Uathneach mit den sieben Gebieten der freigegebenen Gliederung', href: '/Karten/karte.html?map=uathneach' };
const rank = { 'ard-tiarna': 'Ard Tiarna · Fürstenclan', 'mor-tiarna': 'Mor-Tiarna-Clan',
  'dun-tiarna': 'Dún-Tiarna-Clan', laird: 'Laird-Clan', unknown: 'Offen' };
const family = (clan, featured = false) => ({ familyId: clan.familyId, name: clan.name, imageSrc: clan.crest, imageAlt: `Wappen ${clan.name}`,
  href: familyHref(clan), seat: settlementsById.get(clan.seat).name, liege: clansById.get(clan.liege)?.name || '',
  rank: rank[clan.rankId], featured, ...(featured ? { featuredLabel: rank[clan.rankId] } : {}) });
const paragraphs = (territory, clan) => {
  if (territory.type === 'Fürstentum') return [
    'Uathneach ist ein albisches Fürstentum unter den Mac Ard’Lága. Die Fürsten führen den Titel Ard Tiarna und residieren in Dunnean an der nördlichen Küste.',
    'Die fürstliche Domäne Tir na Láimhe und sechs Oberherrschaften gliedern das Land. Unter den Mor Tiarna stehen die Dún Tiarna mit ihren eigenen Lehen sowie die örtlichen Lairds.',
  ];
  const overview = [`${territory.name} wird von den ${clan.name} mit Sitz in ${territory.seat} geführt.`];
  const liege = clansById.get(clan.liege);
  if (liege) overview.push(`Die ${clan.name} dienen unmittelbar den ${liege.name}.`);
  if (territory.id === 'uathneach-tir-na-laimhe') overview.push('Broch an Reithe ist das Sonderlehen der Ua Muirin. Obwohl der Broch innerhalb der westlichen Kartenfläche von Tir na Taoide liegt, dient sein Clan unmittelbar den Mac Ard’Lága.');
  if (territory.id === 'uathneach-tir-na-taoide') overview.push('Broch an Reithe liegt in dieser Küstenlandschaft, ist als fürstliches Sonderlehen der Ua Muirin jedoch unmittelbar den Mac Ard’Lága unterstellt.');
  return overview;
};

export const pages = territories.map(territory => {
  const clan = clansById.get(territory.rulerId), parent = territoriesById.get(territory.parentId);
  const isRoot = territory.type === 'Fürstentum';
  // The Lága hold both the principality and its core domain. Their six Mor
  // Tiarna belong on the realm page, not in the core domain's local register.
  const children = isRoot ? structure.clans.filter(c => c.rankId === 'mor-tiarna') : structure.clans.filter(c =>
    c.liege === clan.id && (territory.type === 'Herrschaft' || c.regionId === territory.id));
  const groups = [ { title: isRoot ? 'Fürstenclan' : 'Herrschender Clan', houses: [family(clan, true)] } ];
  for (const [label, predicate] of [
    ['Mor Tiarna', c => c.rankId === 'mor-tiarna'], ['Dún Tiarna', c => c.rankId === 'dun-tiarna'],
    ['Örtliche Lairds', c => c.rankId === 'laird'], ['Weitere örtliche Clans', c => c.rankId === 'unknown'],
  ]) {
    const houses = children.filter(predicate).map(c => family(c));
    if (houses.length) groups.push({ title: label, houses });
  }
  const own = markers.filter(place => place.territoryId === territory.id);
  const region = regionsById.get(territory.id);
  return {
    id: territory.id, title: territory.name, shortTitle: isRoot ? 'Uathneach' : territory.name,
    type: territory.type, kicker: `${territory.type} · ${clan.name}`,
    parentHref: parent?.href || '/Kontinente/Alben/Der Schild von Ailith.html',
    parentLabel: parent?.name || 'Der Schild von Ailith',
    hierarchy: [{ type: 'Sammlung', name: 'Kontinente', slug: 'kontinente' }, { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
      ...territoryAncestors(territory).map(t => ({ type: t.type, name: t.name, slug: t.id }))],
    aliases: isRoot ? ['uathneach'] : [], crestSrc: territory.banner || clan.crest,
    crestAlt: territory.bannerAlt || `Wappen ${clan.name}`, map,
    copy: { overview: paragraphs(territory, clan), history: [], culture: [], economy: [], defense: [],
      geography: region ? [region.geography, `${region.name} bedeutet „${region.meaning}“.`] : [] },
    infobox: [{ title: 'Herrschaft', rows: [
      { label: 'Typ', value: territory.type }, { label: 'Herrschender Clan', value: clan.name, href: familyHref(clan) },
      { label: 'Rang', value: rank[clan.rankId] }, { label: 'Sitz', value: territory.seat },
      ...(parent ? [{ label: 'Oberherrschaft', value: parent.name, href: parent.href }] : []),
    ] }], families: groups, councilGroups: [], vassalGroups: [],
    domains: own.length ? [{ territoryId: territory.id, title: territory.name,
      sections: [...new Set(own.map(p => p.category))].map(category => ({ title: category, placeIds: own.filter(p => p.category === category).map(p => p.id) })) }] : [],
    territoryLinks: territories.filter(t => t.parentId === territory.id).map(t => t.id),
  };
});
