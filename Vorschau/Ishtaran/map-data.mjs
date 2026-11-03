import { HOUSES } from './house-data.mjs';
import { SETTLEMENTS } from './territory-data.mjs';

/** Original map images; editable draft markers remain separate overlays. */
export const MAP_VARIANTS = [
  { id: 'normal', number: 1, short: 'Normalkarte', file: 'Ishtaran (Normal).png', map: 'assets/maps/ishtaran-normal.webp', imageSize: [4096, 2349], bakedNames: false },
  { id: 'regions', number: 2, short: 'Regionenkarte', file: 'Ishtaran Regionen.png', map: 'assets/maps/ishtaran-regions.webp', imageSize: [4096, 2349], bakedNames: false },
];

export function createMapProposal(placements, variant = MAP_VARIANTS[0]) {
  const settlements = SETTLEMENTS.map(city => ({ ...city,
    name: city.destroyed ? `${city.name} · zerstört` : city.name,
    placementDisabled: Boolean(city.destroyed),
    disabledReason: city.destroyed ? `${city.name} ist zerstört und nimmt keine Häuser auf.` : null,
    label: city.tier === 'capital' ? [city.point[0], Math.max(1, city.point[1] - 6.5)] : city.label,
  }));
  return { ...variant, clans: HOUSES.map(house => ({ ...house, seat: placements[house.id], markerNote: house.displacementNote || null })), settlements };
}
