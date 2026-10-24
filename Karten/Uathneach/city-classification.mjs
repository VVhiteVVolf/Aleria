// The overview depicts urban seats. A drawing's tower, harbour or surrounding
// woodland does not turn the whole city into a specialised small settlement.
const cityIcon = '/Karten/assets/icons/welt/stadt.png';
const definitions = Object.freeze([
  { id: 'mmflrbzxydg7', label: 'Hauptstadt', color: '#a54430', marker: cityIcon },
  { id: 'uathneach-grosse-stadt', label: 'Große Stadt', color: '#8a6334', marker: cityIcon },
  { id: 'mmflwdjfl6ah', label: 'Normal große Stadt', color: '#6b7747', marker: cityIcon },
  { id: 'uathneach-kleine-stadt', label: 'Kleine Stadt', color: '#6e8069', marker: cityIcon },
  { id: 'uathneach-burgstadt', label: 'Burgstadt', color: '#79617e', marker: '/Karten/assets/icons/welt/burgsiedlung.png' },
  { id: 'uathneach-stadt-offen', label: 'Stadt · Größe offen', color: '#777267', marker: cityIcon },
].map(Object.freeze));
const byLabel = new Map(definitions.map(definition => [definition.label, definition]));
const byId = new Map(definitions.map(definition => [definition.id, definition]));
const rankOrder = ['ard-tiarna', 'mor-tiarna', 'dun-tiarna', 'laird'];

export function classifyCity(place, clans) {
  const residents = clans.filter(clan => clan.seat === place.id);
  const ranked = residents.filter(clan => rankOrder.includes(clan.rankId))
    .sort((a, b) => rankOrder.indexOf(a.rankId) - rankOrder.indexOf(b.rankId));
  const ruler = ranked[0];
  if (!ruler) return { type: 'Stadt · Größe offen', role: 'Clansitz', size: 'Offen – Clanrang noch nicht festgelegt', pending: true };
  if (ruler.rankId === 'ard-tiarna') return { type: 'Hauptstadt', role: 'Fürstenhauptstadt', size: 'Hauptstadt', pending: false };
  if (ruler.rankId === 'mor-tiarna') return { type: 'Große Stadt', role: 'Regionshauptstadt', size: 'Groß', pending: false };
  if (ruler.rankId === 'dun-tiarna') return { type: 'Normal große Stadt', role: 'Hauptort des Dún-Tiarna-Lehens', size: 'Normal groß', pending: false };
  return { type: place.cityForm === 'burgstadt' ? 'Burgstadt' : 'Kleine Stadt',
    role: 'Laird-Sitz', size: 'Klein', pending: false };
}

export function cityDefinition(type) {
  const definition = byLabel.get(type);
  if (!definition) throw new Error(`Unbekannte Uathneach-Stadtart: ${type}`);
  return definition;
}

// Map-specific categories are supported by the shared editor. Keep this urban
// overview's filters local instead of renaming or migrating other maps' types.
export function cityCategoryCatalog() {
  return Object.freeze({ definition: category => byId.get(category.id) || byLabel.get(category.label) });
}

export function cityCategories(markers) {
  const used = new Set(markers.map(marker => marker.category));
  return definitions.filter(definition => used.has(definition.label)).map(definition => ({ ...definition }));
}
