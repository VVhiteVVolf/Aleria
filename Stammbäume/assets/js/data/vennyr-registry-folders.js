import { VENNYR_TERRITORIES, VENNYR_TERRITORIAL_HOUSES } from './vennyr-territorial-catalog.js';
import { VENNYR_PREPARED_LORDSHIPS } from './vennyr-lordship-preparation.js';

// Kategorien ergänzen; bestehende Familienpfade und genealogische Daten erhalten.
// Sitzordner ohne eigenes Stadtbanner verwenden das Wappen des belegten Haupthauses.
const seats = new Map();
for (const house of VENNYR_TERRITORIAL_HOUSES) {
  const key = house.folderPath.join('/');
  if (!seats.has(key) || house.mainHouse) seats.set(key, house);
}
export const VENNYR_REGISTRY_FOLDERS = Object.freeze([
  { path: ['Vennyr'], icon: 'assets/images/regions/vennyr.png', description: 'Historisches Königreich Vennyr. Die ehemaligen Lehensbindungen bleiben von den heutigen Herrschaften Fjordheims getrennt.' },
  ...VENNYR_TERRITORIES.map(t => ({path:['Vennyr',t.name],icon:t.emblemPath,description:`Grafschaft ${t.name} · ${t.mainHouseName} · Sitz ${t.seat}`})),
  ...[...seats.values()].map(h => {
    const named = VENNYR_PREPARED_LORDSHIPS.find(t => t.familyId === h.familyId);
    return {path:h.folderPath,icon:named?.banner || (h.seat === 'Lyndor' ? 'assets/images/regions/lyndor.png' : h.emblemPath),
      description:named ? `${named.type} ${named.name} · Sitz ${h.seat} · Haus ${h.name}` : `Sitz ${h.seat}. Kategoriezeichen: Wappen Haus ${h.name}; kein gesondertes Ortswappen.`,
      searchTerms:named ? [named.name,named.type,h.name] : []};
  }),
  {path:['Vennyr','Tir Gorllewin','Tir Brocair'],icon:'assets/images/regions/Vennyr/Tir Brocair.png',description:'Ritterfürstliche Herrschaft Tir Brocair · Haus Mochdaer · Sitz Gwyliau'},
  {path:['Vennyr','Blütenland','Baronie Hoyers Krone'],icon:'assets/images/regions/hoyers-krone.png',description:'Baronie Hoyers Krone · Haus Blodyn · Sitz Lyndor'}
].map(folder => Object.freeze({...folder,path:Object.freeze([...folder.path])})));
