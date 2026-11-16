export const SCHWARZFISCH_TROOPS = [
  { numeral: 'I', id: 'hechte', name: 'Schwarze Hechte' },
  { numeral: 'II', id: 'lachse', name: 'Schwarze Lachse' },
  { numeral: 'III', id: 'aale', name: 'Schwarze Aale' },
  { numeral: 'IV', id: 'barsche', name: 'Schwarze Barsche' },
  { numeral: 'V', id: 'welse', name: 'Schwarze Welse' },
  { numeral: 'VI', id: 'zander', name: 'Schwarze Zander' },
  { numeral: 'VII', id: 'forellen', name: 'Schwarze Forellen' },
  { numeral: 'VIII', id: 'rochen', name: 'Schwarze Rochen' },
  { numeral: 'IX', id: 'karpfen', name: 'Schwarze Karpfen' },
  { numeral: 'X', id: 'stoere', name: 'Schwarze Störe' }
].map(troop => ({ ...troop, emblem: `./assets/schwarzfische/crests/trupp-${troop.id}-v1.png` }));
