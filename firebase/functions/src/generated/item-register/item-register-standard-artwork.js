// Existing, independently verified inventory art. Identity is an exact standard
// ID; a similar name or an arbitrary provider item never establishes a match.
const sourceIds = [
  'rucksack', 'wasserschlauch', 'bettrolle', 'feuerstein-stahl', 'fackel', 'laterne', 'lampenoel', 'seil', 'kreide',
  'notizbuch', 'feder-tinte', 'seife', 'nadel-faden', 'kleidung-einfach', 'guertelbeutel', 'spiegel', 'kochgeschirr',
  'essbesteck', 'zelt-klein', 'signalpfeife', 'kraeutermoerser', 'holzkamm', 'leinentasche', 'holzloeffel', 'tonbecher',
  'holzschuessel', 'trinkschlauch-klein', 'leinenband', 'pergamentrolle', 'kieselsteinbeutel', 'holzpfeife', 'holznadel',
  'talgkerze', 'holzspielwuerfel', 'kraeutersaeckchen', 'wetzstein', 'holzfigur', 'stoffstreifen', 'wollmuetze',
  'lederflicken', 'holznadelspiel', 'tonlampe', 'holzstab'
];
export const STANDARD_TOOL_ARTWORK = Object.freeze(Object.fromEntries(sourceIds.map(id => [
  `standard:gemischtwarenhandler:${id}`, `/AleriaAlmanach/assets/pendrwn-general-store/goods/${id}.png`
])));
const MARKET_PLACEHOLDER = 'https://i.imgur.com/UbjFi5T.png';

export function resolveStandardItemImage(item = {}, image = item.image || '') {
  const current = String(image || '').trim();
  if (current && current !== MARKET_PLACEHOLDER) return current;
  // A pinned custom/unique definition is authoritative even if its historical
  // possession also carries the standard template from which it was derived.
  const id = item.definitionRef?.id || [item.id, item.templateId, item.itemDbKey, item.originItemDbKey, item.canonicalKey]
    .find(value => Object.hasOwn(STANDARD_TOOL_ARTWORK, value));
  return STANDARD_TOOL_ARTWORK[id] || current;
}
