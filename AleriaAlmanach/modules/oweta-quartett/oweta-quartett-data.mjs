export const OWETA_QUARTET_MEMBERS = Object.freeze([
  { id: 'vk0xAa3ZcEhVvGC1CzNq', name: 'Oweta Draig', role: 'Anführerin',
    portrait: '/Stammbäume/assets/images/portraits/haus-draig/oweta-draig.jpg' },
  { id: 'person--haus-wyrm--rianna-wyrm', name: 'Rianna Wyrm', role: 'Gefährtin',
    portrait: '/Stammbäume/assets/images/portraits/haus-wyrm/rianna-wyrm.jpg' },
  { id: 'person--haus-gafyr--lefraye-gafyr', name: 'Lefraye Gafyr', role: 'Gefährtin',
    portrait: '/Stammbäume/assets/images/portraits/haus-gafyr/lefraye-gafyr.jpg' },
  { id: 'Eka4z7TWpzEgx8KjhIzy', name: 'Caralyn Chwedonol', role: 'Gefährtin',
    portrait: '/Stammbäume/assets/images/portraits/haus-chwedlonol/caralyn-chwedlonol.jpg' }
]);

const biographyArt = '/AleriaAlmanach/assets/biographies/rianna-lefraye/2026-11-02/';
// These are existing personal companions, not new creatures or group property.
// An explicit travelling party excludes Caralyn's goldfish Eure Blubbrigkeit.
export const OWETA_QUARTET_COMPANIONS = Object.freeze([
  { id: 'companion-oweta-heulwen', name: 'Heulwen', species: 'Rhyfel', ownerId: OWETA_QUARTET_MEMBERS[0].id,
    ownerName: 'Oweta Draig', portrait: 'https://i.imgur.com/IQPGIq7.jpeg' },
  { id: 'companion-rianna-goldloeckchen', name: 'Goldlöckchen', species: 'Goldmähnen-Stute', ownerId: OWETA_QUARTET_MEMBERS[1].id,
    ownerName: 'Rianna Wyrm', portrait: `${biographyArt}goldloeckchen.png` },
  { id: 'companion-rianna-sir-fressbert', name: 'Sir Fressbert', species: 'Cenyric-Kater', ownerId: OWETA_QUARTET_MEMBERS[1].id,
    ownerName: 'Rianna Wyrm', portrait: `${biographyArt}sir-fressbert.png` },
  { id: 'companion-lefraye-thalena', name: 'Thalena', species: 'Farnschritt-Stute', ownerId: OWETA_QUARTET_MEMBERS[2].id,
    ownerName: 'Lefraye Gafyr', portrait: `${biographyArt}thalena.png` },
  { id: 'companion-lefraye-agravaine', name: 'Agravaine', species: 'Mwyalchen-Drossel', ownerId: OWETA_QUARTET_MEMBERS[2].id,
    ownerName: 'Lefraye Gafyr', portrait: `${biographyArt}agravaine-vain.png` },
  { id: 'companion-caralyn-eure-hufigkeit', name: 'Eure Hufigkeit', species: 'Rhyfel (vermutlich)', ownerId: OWETA_QUARTET_MEMBERS[3].id,
    ownerName: 'Caralyn Chwedonol', portrait: 'https://i.imgur.com/c69AFl9.png' }
]);

// One-time editorial grant inputs for the authoritative group account.
// The module's descriptive stock list stays empty, preventing a second stock.
export const OWETA_QUARTET_STARTER_STOCK = Object.freeze([
  { key: 'rationen', quantity: 12, image: '/AleriaAlmanach/assets/pendrwn-general-store/goods/rationen.png' },
  { key: 'wasserschlauch', quantity: 4 },
  { key: 'bettrolle', quantity: 4 },
  { key: 'zelt-klein', quantity: 2 },
  { key: 'kochgeschirr', quantity: 1 },
  { key: 'essbesteck', quantity: 4 },
  { key: 'feuerstein-stahl', quantity: 2 },
  { key: 'seil', quantity: 1 },
  { key: 'laterne', quantity: 1 },
  { key: 'lampenoel', quantity: 2 },
  { key: 'fackel', quantity: 6 },
  { key: 'verbandstoff', quantity: 2, image: '/AleriaAlmanach/assets/pendrwn-general-store/goods/verbandstoff.png' },
  { key: 'nadel-faden', quantity: 1 },
  { key: 'seife', quantity: 2 },
  { key: 'salzbeutel', quantity: 1, image: '/AleriaAlmanach/assets/pendrwn-general-store/goods/salzbeutel.png' },
  { key: 'wetzstein', quantity: 1 }
].map(item => ({ ...item, sourceKey: `standard:gemischtwarenhandler:${item.key}` })));
