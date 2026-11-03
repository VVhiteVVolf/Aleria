import { HOUSE_SIGNET_HOUSES } from './house-ring-houses.mjs';
import { HOUSE_RING_ARTWORK } from './house-ring-artwork.mjs';

export function buildHouseSignetItems({ publishedArtwork = true } = {}) {
  return HOUSE_SIGNET_HOUSES.map(house => ({
    id: `house-signet:${house.id}`, canonicalKey: `house-signet:${house.id}`,
    title: `${house.name.replace(/^(?:Haus|Clan|Sept) /, '').split(' O\'')[0]}-Siegelring`,
    category: 'sonstiges', type: 'Siegelring', section: 'definition',
    image: publishedArtwork ? HOUSE_RING_ARTWORK[house.image]?.url || house.image : house.image,
    description: `Persönlicher Siegelring mit dem überlieferten Emblem von ${house.name}. Er kennzeichnet die Zugehörigkeit zu diesem Haus und trägt dessen Siegel.`,
    aliases: [], tags: ['Siegelring', 'Hauszugehörigkeit', house.name],
    stackable: false, combatDefinition: null, mechanicsStatus: 'narrative', inventoryUseMode: 'use',
    priceRange: null, stock: null, attributes: [], infoRows: [{ label: 'Haus', value: house.name }],
    sourceRefs: [{ kind: 'house-signet', familyId: house.id, sourcePage: `Stammbäume/Stammbaum.html?family=${house.id}` }]
  }));
}
