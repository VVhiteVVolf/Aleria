import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { standardItemToTradeItem, fixedTradePrice } from '../trade-catalog/standard-goods-conversion.mjs';
import { ARKANEUM_SPECIALS } from './arkaneum-specials.mjs';
import { ARKANEUM_STANDARD_SELECTION } from './arkaneum-standard-selection.mjs';

const standards = new Map(STANDARD_ITEMS.map(item => [item.id, item]));
export const ARKANEUM_ARCANE_BASICS = Object.freeze([
  'standard:alchemist:manatrank', 'standard:alchemist:heiltrank',
  'standard:arkanist:seelenstein', 'standard:arkanist:tenebrium-ketten',
  'standard:arkanist:zaubergrimoire', 'standard:arkanist:zauberstein'
]);
const defaults = Object.freeze({ status: 'available', imageFit: 'contain', imagePosition: 'center', imageHeight: 280,
  imageFormat: 'square', descriptionTitle: 'Die Ware', featuresTitle: 'Lieferumfang', originTitle: 'Herkunft',
  usageTitle: 'Verwendung', priceTitle: 'Preis', priceFill: 35, priceOptions: [], conditionsTitle: 'Hinweise' });
function standard(id, department) {
  const item = standards.get(id);
  if (!item) throw new Error(`Arkaneum: Standardgut fehlt: ${id}`);
  const result = standardItemToTradeItem(item, { defaults, idPrefix: 'arkaneum-standard' });
  const isGem = item.tags.includes('Edel- & Schmucksteine');
  return { ...result, ...(id.endsWith(':tenebrium-ketten') ? { title: 'Tenebrit-Ketten' } : {}), category: department === 'alchemie' ? (item.tags.includes('Gewöhnliche Zutaten') ? 'zutaten' : 'labor') :
    ARKANEUM_ARCANE_BASICS.includes(id) ? 'grundbedarf' : isGem ? 'steine' : 'rohlinge',
    badge: isGem ? 'Unverzauberter Schmuckstein' : 'Standardsortiment',
    origin: department === 'alchemie' && item.tags.includes('Gewöhnliche Zutaten')
      ? 'Kräutergarten und gewöhnliche Zukäufe; Rhydian prüft die Ansätze.' : 'Gewöhnlicher Fachhandel; Nauthagerd prüft Lieferung und Bestand.',
    conditions: id.endsWith(':seelenstein') ? 'Gewöhnlicher Seelenstein; kein schwarzer Seelenstein. Besatz und Qualität bestimmen den Preis innerhalb der angegebenen Spanne.' :
      department === 'alchemie' ? 'Nach Ladenbestand. Zubehör, das im Lieferumfang nicht genannt ist, wird gesondert berechnet.' :
        ARKANEUM_ARCANE_BASICS.includes(id) ? 'Nach Qualität und Ladenbestand. Lieferumfang vor der Übergabe prüfen.' :
          'Unverzaubert. Die Rohlinge und Schmucksteine enthalten keine gespeicherte Magicka oder Seele.',
    usageTags: item.tags, priceNote: 'Preis für die angegebene Menge.' };
}
function special(item) {
  const canonical = item.standardId ? standard(item.standardId, item.department) : null;
  return { ...defaults, ...(canonical || fixedTradePrice(`${item.price.min} Kupfertaler`)),
    id: `arkaneum-eigen-${item.id}`, category: 'eigenes', title: item.name, subtitle: item.department === 'alchemie' ? 'Besondere Alchemie' : 'Besondere arkane Ware',
    image: item.image, unit: item.unit, description: `<p>${item.desc}</p>`, features: [item.unit],
    badge: 'Eigenes Sortiment', origin: /band-1/.test(item.id) ? 'Lehrwerk der Magiergilde; über den Buchhandel beschafft. Herluin gehört der Gilde nicht mehr an.' :
      item.id === 'tenebrit-splitterbombe' ? 'Herluins eigener Laborentwurf; fest versiegelte Einzelstücke.' :
      item.department === 'alchemie' ? 'Wechselnde Einzelbeschaffung; getrennt vom gewöhnlichen Garten- und Laborbedarf verwahrt.' : 'Herluins Werkstatt; einzeln ausgeführte Verzauberung.',
    usageTags: item.department === 'alchemie' ? ['Besonderer Laborbedarf'] : ['Arkanes'],
    conditions: item.id === 'frostgarngift' ? 'Frostgarn: Garnspinnenlinie aus Tundren und kühlen Hochgebirgen; lähmendes Gift. Nur versiegelt, nach Beschaffung.' :
      item.id === 'rotglyphen-pfeilspitzen' ? 'Fünf Spitzen ohne Schäfte. Jede Ladung ist einmalig; Befiederung, Montage und Nachladen sind nicht enthalten.' :
      'Kleine wechselnde Bestände. Wirkung und Lieferumfang werden vor Übergabe erläutert.',
    priceNote: 'Preis für den angegebenen Lieferumfang.' };
}

export function buildArkaneumCatalog(department, own = false) {
  const alchemy = department === 'alchemie';
  const selected = ARKANEUM_STANDARD_SELECTION[department].map(id => `standard:${alchemy ? 'alchemist' : 'arkanist'}:${id}`);
  const items = own ? ARKANEUM_SPECIALS.filter(item => item.department === department).map(special) :
    [...(!alchemy ? ARKANEUM_ARCANE_BASICS : []), ...selected].map(id => standard(id, department));
  return { title: 'Güterregister', subtitle: `${own ? 'Eigenes Sortiment' : 'Standardsortiment'} · ${alchemy ? 'Alchemie' : 'Arkanes'}`,
    headerIcon: './assets/herluin-lothaire/module-art/ladenschild.png',
    categories: own ? [{ id: 'eigenes', label: alchemy ? 'Besondere Alchemie & Ansätze' : 'Besondere arkane Waren' }] :
      alchemy ? [{ id: 'zutaten', label: 'Gewöhnliche Zutaten' }, { id: 'labor', label: 'Laborzubehör' }] :
        [{ id: 'grundbedarf', label: 'Arkaner Grundbedarf' }, { id: 'rohlinge', label: 'Unverzaubertes Zubehör' }, { id: 'steine', label: 'Edel- & Schmucksteine' }],
    allLabel: 'Das ganze Sortiment', searchPlaceholder: 'Ware oder Material suchen …',
    noteIcon: alchemy ? '⚗' : '✦', noteTitle: own ? 'Aus Herluins besonderem Schrank' : alchemy ? 'Kräuter und Handwerkszeug' : 'Rohling und Verzauberung',
    noteText: own ? 'Seltene Zutaten und einzelne Werkstücke werden gesondert verwahrt. Die Lehrbücher stammen aus dem Buchhandel; ihr Verkauf bedeutet keine Zugehörigkeit des Arkaneums zur Magiergilde.' :
      alchemy ? 'Gewöhnliche Zutaten wachsen zum Teil im Hinterhof. Geräte und Verbrauchsmaterial werden zugekauft. Seltene Blutansätze, Gifte und Bomben stehen im eigenen Sortiment.' :
        'Die Arbeitsrohlinge und Schmucksteine sind unverzaubert. Heil- und Manatrank, gewöhnlicher Seelenstein, Tenebrit-Ketten, Grimoire und Zauberstein bilden den arkanen Grundbedarf. Schwarze Seelensteine werden hier nicht geführt.',
    items, footerCards: [] };
}
