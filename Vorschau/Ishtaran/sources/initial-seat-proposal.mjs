/** Working proposal authorized on 3 November 2026; never a canonical register. */
export const CITY_ASSIGNMENT_ROWS = [
  ['capital', 'Altasar', 'Nördliche Mitte', 'Sultanshauptstadt am größten Ortskreis der nördlichen Küste.'],
  ['large-01', 'Ildaran', 'Nordöstliche Halbinsel', 'Nördliche Küstenstadt der weiten nordöstlichen Halbinsel.'],
  ['large-02', 'Kargulan', 'Nordwestliches Hochland', 'Nordwestliche Küstenstadt am gebirgigen westlichen Landesteil.'],
  ['large-03', 'Ayseran', 'Östliche Küste', 'Große Stadt am östlichen Meeresarm.'],
  ['large-04', 'Orsakent', 'Westliche Küste', 'Westliche Küstenstadt unterhalb des nordwestlichen Hochlands.'],
  ['large-05', 'Belduran', 'Westliche Landesmitte', 'Stadt im offenen westlichen Mittelland.'],
  ['large-06', 'Kalduran', 'Östliches Seeland', 'Große Stadt am südöstlichen Ufer des großen Sees, nördlich des Gebirges.'],
  ['large-07', 'Kembaran', 'Östliches Waldland', 'Große Stadt im bewaldeten östlichen Landesteil.'],
  ['large-08', 'Torgasar', 'Südliche Landesmitte', 'Große Stadt südlich der mittleren Höhenzüge.'],
  ['small-01', 'Kersalan', 'Nordöstliche Küste', 'Kleine Herrschaft am äußersten nordöstlichen Küstenvorsprung.'],
  ['small-02', 'Altschar', 'Nordwestliche Bucht', 'Kleine Herrschaft an der Bucht östlich des nordwestlichen Hochlands.'],
  ['small-03', 'Bayrath', 'Mittlere Meeresenge', 'Kleine Herrschaft am östlichen Ufer der mittleren Meeresenge.'],
  ['small-04', 'Koyrath', 'Mittlere Meeresenge', 'Kleine Herrschaft am westlichen Ufer der mittleren Meeresenge.'],
  ['small-05', 'Arkulan', 'Östliche Landesmitte', 'Kleine Herrschaft am südöstlichen Auslauf des nördlichen Ostgebirges.'],
  ['small-06', 'Oryntar', 'Mittleres Hügelland', 'Kleine Herrschaft im Übergang zwischen mittleren Hügeln und Bergland.'],
  ['small-07', 'Börkent', 'Westliches Flusstal', 'Kleine Herrschaft im westlichen Tal südlich des Hochlands.'],
  ['small-08', 'Ilbarsen', 'Südwestliches Waldland', 'Kleine Herrschaft im bewaldeten südwestlichen Mittelland.'],
  ['small-09', 'Teldarak', 'Westlicher Gebirgsrand', 'Kleine Herrschaft am westlichen Gebirgsrand.'],
  ['small-10', 'Kutlakar', 'Südliches Flussland', 'Zerstörte Stadt im südlichen Flussland. Haus Kutlug wurde nach Belduran evakuiert.'],
  ['small-11', 'Taschuran', 'Südwestliches Becken', 'Kleine Herrschaft im südwestlichen Becken.'],
  ['small-12', 'Temrakan', 'Südöstliches Waldland', 'Kleine Herrschaft im südöstlichen Waldland.'],
];

// One leader per city. Capital extras first; other additional seats are optional.
export const HOUSE_SEAT_ROWS = [
  ['source-07', 'Sultan', 'capital'],
  ['pool-18', 'Tarkan', 'capital'], ['pool-08', 'Tarkan', 'capital'],
  ['source-01', 'Pascha', 'large-01'],
  ['pool-24', 'Tarkan', 'large-01'], ['pool-17', 'Tarkan', 'large-01'],
  ['source-03', 'Pascha', 'large-02'],
  ['pool-20', 'Tarkan', 'large-02'], ['pool-12', 'Tarkan', 'large-02'],
  ['source-08', 'Pascha', 'large-03'], ['pool-25', 'Tarkan', 'large-03'],
  ['source-04', 'Pascha', 'large-04'],
  ['source-11', 'Pascha', 'large-05'], ['pool-16', 'Tarkan', 'large-05'],
  ['pool-07', 'Pascha', 'large-06'],
  ['pool-06', 'Tarkan', 'large-06'], ['pool-19', 'Tarkan', 'large-06'],
  ['pool-21', 'Pascha', 'large-07'],
  ['source-09', 'Pascha', 'large-08'], ['pool-11', 'Tarkan', 'large-08'],
  ['source-06', 'Tarkan', 'small-01'], ['source-10', 'Tarkan', 'small-02'],
  ['source-02', 'Tarkan', 'small-03'], ['pool-05', 'Tarkan', 'small-04'],
  ['pool-15', 'Tarkan', 'small-05'], ['pool-09', 'Tarkan', 'small-06'],
  ['pool-01', 'Tarkan', 'small-07'], ['pool-04', 'Tarkan', 'small-08'],
  ['pool-02', 'Tarkan', 'small-09'], ['source-05', 'Tarkan', 'large-05'],
  ['pool-03', 'Tarkan', 'small-11'], ['pool-23', 'Tarkan', 'small-12'],
  ['pool-10', 'Tarkan', 'capital'], ['pool-13', 'Tarkan', 'large-03'],
  ['pool-14', 'Tarkan', 'large-04'], ['pool-22', 'Tarkan', 'large-08'], ['pool-26', 'Tarkan', 'large-07'],
];

export const DESTROYED_SEAT_IDS = ['small-10'];
export const HOUSE_DISPLACEMENTS = {
  'source-05': { displaced: true, originSeatId: 'small-10', refugeSeatId: 'large-05', markerTone: 'muted', displacementNote: 'Aus dem zerstörten Kutlakar nach Belduran evakuiert.' },
};

// Coastal house clusters need room for all three permitted families.
// The actual settlement point stays on the reviewed source-ring centre.
export const PIN_POSITIONS = { 'large-04': [9, 37.0796], 'large-03': [90, 24.0741] };

export const LABEL_POSITIONS = {
  capital: [44.69, 14.0], 'large-01': [68.29, 9.6], 'large-02': [12.22, 12.5],
  'large-03': [90.0, 28.4], 'large-04': [9.0, 41.2], 'large-05': [27.53, 41.3],
  'large-06': [70.34, 56.4], 'large-07': [83.35, 56.8], 'large-08': [50.74, 61.6],
  'small-01': [90.6, 17.2], 'small-02': [26.09, 29.4],
  'small-03': [63.5, 29.0], 'small-04': [40.5, 32.4], 'small-05': [71.06, 39.5],
  'small-06': [49.88, 42.6], 'small-07': [13.98, 49.9], 'small-08': [27.61, 67.8],
  'small-09': [7.8, 73.7], 'small-10': [31.4, 81.3], 'small-11': [15.14, 81.9],
  'small-12': [84.75, 85.2],
};
