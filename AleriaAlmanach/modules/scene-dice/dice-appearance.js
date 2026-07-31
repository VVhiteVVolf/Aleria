const DICE_APPEARANCE = Object.freeze([
  Object.freeze({ sides: 4, color: '#9f3f3b', label: 'Karmin' }),
  Object.freeze({ sides: 6, color: '#356f91', label: 'Fjordblau' }),
  Object.freeze({ sides: 8, color: '#4e7b4a', label: 'Waldgrün' }),
  Object.freeze({ sides: 10, color: '#76528c', label: 'Amethyst' }),
  Object.freeze({ sides: 12, color: '#b06a2c', label: 'Kupfer' }),
  Object.freeze({ sides: 20, color: '#a78324', label: 'Altgold' }),
  Object.freeze({ sides: 100, color: '#2f7f78', label: 'Tiefsee' })
]);

const APPEARANCE_BY_SIDES = new Map(DICE_APPEARANCE.map(item => [item.sides, item]));

export function getDiceAppearance(sides) {
  return APPEARANCE_BY_SIDES.get(Number(sides)) || APPEARANCE_BY_SIDES.get(20);
}

export function getDiceAppearances() {
  return DICE_APPEARANCE.map(item => ({ ...item }));
}

export function applyDiceAppearance(notations) {
  return (Array.isArray(notations) ? notations : [notations]).map(notation => ({
    ...notation,
    themeColor: getDiceAppearance(notation?.sides).color
  }));
}
