// Qualitative shop comparisons on the existing 1–10 scale, never combat rules.
// Order: damage, penetration, speed, reach, handling, versatility.
const axes = Object.freeze(['damage', 'penetration', 'speed', 'reach', 'handling', 'versatility']);
const profiles = Object.freeze({
  degen: [5, 5, 8, 6, 7, 6],
  rapier: [5, 5, 8, 8, 5, 5],
  saebel: [5, 4, 8, 6, 8, 8],
  dolch: [3, 3, 10, 2, 10, 8],
  kurzschwert: [4, 4, 9, 4, 9, 7],
  parierdolch: [3, 3, 8, 2, 8, 9],
  kampfklauen: [3, 2, 9, 1, 6, 4],
  handaxt: [4, 5, 6, 3, 8, 8],
  enteraxt: [4, 5, 6, 3, 7, 9],
  'einhand-kriegshammer': [6, 8, 5, 4, 7, 7],
  rabenschnabel: [5, 9, 5, 4, 6, 5],
  speer: [5, 5, 6, 8, 8, 9],
  partisane: [7, 6, 4, 10, 4, 7],
  glefe: [7, 5, 4, 10, 4, 6],
  harpunenspeer: [4, 4, 5, 7, 6, 8],
  kampfstab: [5, 2, 7, 7, 9, 9],
  'schwere-armbrust': [7, 9, 2, 10, 5, 3],
  handarmbrust: [4, 5, 4, 5, 7, 5],
  peitsche: [3, 1, 7, 9, 3, 8],
  schleuder: [3, 2, 6, 5, 6, 6],
  khopesh: [5, 4, 5, 4, 5, 7],
  shamshir: [5, 3, 8, 6, 7, 6],
  kukri: [4, 4, 7, 2, 8, 7],
  chakram: [4, 3, 6, 6, 3, 3],
  katana: [6, 5, 7, 7, 6, 8],
  wakizashi: [4, 3, 9, 4, 8, 7],
  tanto: [3, 3, 9, 2, 9, 6],
  nodachi: [9, 6, 3, 9, 2, 4],
  naginata: [7, 4, 5, 10, 4, 7],
  jian: [5, 4, 8, 6, 6, 7],
  dao: [5, 4, 7, 5, 8, 7],
  yari: [6, 6, 5, 9, 6, 7],
  tonfa: [4, 2, 8, 2, 8, 8],
  nunchaku: [4, 4, 8, 3, 3, 6],
  wurfstern: [3, 2, 9, 4, 6, 2]
});

export const WEAPON_STANDARD_DISPLAY_AXES = axes;
export const WEAPON_STANDARD_DISPLAY_IDS = Object.freeze(Object.keys(profiles));
export function getWeaponStandardDisplayProfile(id) {
  const values = profiles[id];
  if (!values) throw Error(`Missing authored weapon display profile: ${id}`);
  return Object.fromEntries(axes.map((axis, index) => [axis, values[index]]));
}
