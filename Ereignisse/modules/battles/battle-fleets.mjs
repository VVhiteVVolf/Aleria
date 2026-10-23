// Die Quelle nennt gemischte Flotten, aber keine Schiffsliste je Bauart.
// Diese Modelle und ihre Verteilung dienen ausschließlich der Illustration.
export const SHIP_MODELS = Object.freeze({
  'green-flag': { file: 'gruen-flaggschiff.webp', label: 'Grünes Flaggschiff', size: 77 },
  'red-flag': { file: 'rot-flaggschiff.webp', label: 'Rotes Flaggschiff', size: 77 },
  'green-heavy': { file: 'gruen-enterschiff.webp', label: 'Schweres Enterschiff', size: 64 },
  'red-archer': { file: 'rot-bogenschiff.webp', label: 'Bogenschiff', size: 61 },
  'green-swift': { file: 'gruen-langschiff.webp', label: 'Leichtes Langschiff', size: 56 },
  'red-swift': { file: 'rot-langschiff.webp', label: 'Leichtes Langschiff', size: 56 }
});
export const BATTLE_GROUPS = Object.freeze([
  { id: 'green-center', side: 'green', name: 'Hrolfr Frostauge', role: 'Grünes Zentrum', count: 12, leader: 0 },
  { id: 'green-north', side: 'green', name: 'Hallvard Wellensänger', role: 'Bewegliche Langschiffe', count: 9, leader: 12 },
  { id: 'green-south', side: 'green', name: 'Fenrir Wellenschild', role: 'Gegenflanke zu Detlaff', count: 9, leader: 21 },
  { id: 'red-center', side: 'red', name: 'Raveld Blutstahl', role: 'Rotes Zentrum', count: 15, leader: 0 },
  { id: 'red-north', side: 'red', name: 'Ragnar Silberblut', role: 'Roter Flankenverband', count: 6, leader: 15 },
  { id: 'red-south', side: 'red', name: 'Detlaff Schwarzblut', role: 'Gegenflanke zu Fenrir', count: 6, leader: 21 }
].map(Object.freeze));
const redLosses = new Set([0,1,2,3,4,5,6,7,8,9,10,15,16,17,21,22]);
const greenLosses = new Set([2,3,6,9,13,16,23,27]);
function makeSide(side) {
  let index = 0;
  return BATTLE_GROUPS.filter(group => group.side === side).flatMap(group => Array.from({length:group.count}, (_, slot) => {
    const id = index++, flagship = id === group.leader;
    const model = flagship ? `${side}-flag` : side === 'green' ? group.id.endsWith('center') ? 'green-heavy' : 'green-swift'
      : group.id.endsWith('center') || slot % 3 === 0 ? 'red-archer' : 'red-swift';
    const lost = (side === 'green' ? greenLosses : redLosses).has(id);
    const lossStart = side === 'red' && id === 0 ? 2.93 : side === 'red' && id === 15 ? 1.52
      : side === 'red' && id === 21 ? 3.12 : side === 'green' ? 1.4 + id % 5 * .6 : 3.3 + id % 5 * .23;
    const seed=((id*73+(side==='green'?29:53))%101)/101;
    const bearing=slot*2.399963+(side==='green'?.35:1.15),radius=Math.sqrt(slot/Math.max(1,group.count-1));
    return Object.freeze({ id:`${side}-${id}`, side, index:id, group:group.id, slot, flagship, model, lost,seed,
      commander: flagship ? group.name : null, lossStart,
      lossMode: side === 'red' && id !== 0 && id % 3 === 1 ? 'captured' : 'sunk',
      offsetX:slot===0?(side==='green'?23:-23):Math.cos(bearing)*radius*(group.id.endsWith('center')?81:65),
      offsetY:slot===0?0:Math.sin(bearing)*radius*(group.id.endsWith('center')?98:70) });
  }));
}
export const BATTLE_SHIPS = Object.freeze([...makeSide('green'), ...makeSide('red')]);
