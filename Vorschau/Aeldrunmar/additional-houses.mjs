import source from '../../shared/accepted-realms/data/aeldrunmar-tharn-houses.source.json' with { type: 'json' };

// New authored houses share their identity, heraldry and equipment with the
// canonical register. The workbench retains its own relative asset references.
export const additionalHouses = Object.freeze(source.houses.map(h => Object.freeze({
  ...h, rank: 'vassal', sourceSeat: h.seatId, sourceFolder: 'Earltum der Tharn',
  role: h.rank + ' · Maritimes Vasallenhaus der Tharn',
  source: 'Zusätzliches Haus · Nutzerauftrag vom 2. November 2026',
  placementNote: 'Unmittelbares Vasallenhaus der Tharn mit Sitz in Trentmorath.',
  crest: `assets/crests/${h.id}.webp`, fullsize: `assets/production/${h.id}.png`,
})));

export const additionalWarriorDirections = Object.freeze(source.houses.map(h => Object.freeze({
  id: h.id, classId: h.warrior.classId, horseColour: null,
  design: h.warrior.equipment, equipment: h.warrior.equipment, reason: h.warrior.reason,
})));

export const additionalInitialPlacements = Object.freeze(Object.fromEntries(source.houses.map(h => [h.id, h.seatId])));
