// A small editorial pocket loadout, not house wealth or an automatic class grant.
import { GWYNTHOR_EQUIPMENT_ARTWORK } from './equipment-artwork.mjs';

const general = key => `standard:gemischtwarenhandler:${key}`;
export const KNIGHT_STARTING_POSSESSIONS = Object.freeze({
  'caralyn-chwedlonol': { key: 'caralyn-chwedlonol', moneyCopper: 680,
    rationale: 'Kleine persönliche Barschaft einer jungen Morwyr aus einem Küstenritterhaus; praktische Dinge für Dienst und Reisen.',
    items: ['signalpfeife', 'wasserschlauch', 'nadel-faden'].map(key => ({ templateId: general(key), quantity: 1 })) },
  'rianna-wyrm': { key: 'rianna-wyrm', moneyCopper: 1840,
    rationale: 'Gut versorgte Tochter des wohlhabenden Hauses Wyrm mit Freude an Schmuck und gepflegtem Auftreten; persönliche Barschaft, kein Hausvermögen.',
    items: ['spiegel', 'holzkamm'].map(key => ({ templateId: general(key), quantity: 1 }))
      .concat({ templateId: 'standard:arkanist:unverzauberter-ring', quantity: 1 }) },
  'lefraye-gafyr': { key: 'lefraye-gafyr', moneyCopper: 760,
    rationale: 'Solide, genügsame Barschaft für eine junge Helwyr; leeres Notizbuch und Schreibzeug passen zu Geschichte und Beobachtung, Feuerstahl zur Wildnis.',
    items: ['notizbuch', 'feder-tinte', 'feuerstein-stahl'].map(key => ({ templateId: general(key), quantity: 1 })) },
  'oweta-draig': { key: 'oweta-draig', moneyCopper: 1250,
    rationale: 'Gut versorgte, praktisch veranlagte junge Draig-Ritterin; Pflegezeug für unterwegs und eine kleine Zinnfigur nach ihrer belegten Sammlung.',
    items: ['wetzstein', 'nadel-faden'].map(key => ({ templateId: general(key), quantity: 1 }))
      .concat({ templateId: 'gwynthor-seven:oweta-zinnritter', quantity: 1 }) }
});

export function buildKnightStartingItems({ publishedArtwork = true } = {}) {
  const image = '/AleriaAlmanach/assets/gwynthor-seven/items/oweta-zinnritter-v1.png';
  return [{ id: 'gwynthor-seven:oweta-zinnritter', canonicalKey: 'gwynthor-seven:oweta-zinnritter',
    title: 'Kleiner Zinnritter', category: 'sonstiges', type: 'Zinnfigur', section: 'standard',
    image: publishedArtwork ? GWYNTHOR_EQUIPMENT_ARTWORK[image]?.url || image : image,
    description: 'Eine kleine, silbrig matte Zinnfigur eines gerüsteten Ritters auf einem Metallfüßchen. Als einzelnes Reiseandenken passend zu Owetas Sammlung von Zinnsoldaten. Gewöhnliches Spielzeug ohne magische Wirkung.',
    aliases: [], tags: ['Zinnfigur', 'Spielzeug', 'Persönlicher Gegenstand'], priceRange: null, stock: null,
    combatDefinition: null, attributes: [], infoRows: [], inventoryUseMode: 'use', mechanicsStatus: 'narrative',
    sourceRefs: [{ kind: 'authored-equipment', sourceId: 'oweta-zinnritter',
      sourcePage: 'AleriaAlmanach/modules/castell-draig-rooms/room-pages.mjs' }],
    hiddenMeta: { origin: 'Ergänzender Autorenauftrag · Startbesitz 02.11.2026' } }];
}
