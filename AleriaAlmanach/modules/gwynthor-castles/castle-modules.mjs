import { CASTLE_HOUSES, CASTLE_AREAS, CASTLE_ASSET_ROOT } from './castle-houses.mjs';
import { GAFYR_ROOMS } from './gafyr-rooms.mjs';
import { SAETHWYR_ROOMS } from './saethwyr-rooms.mjs';
import { WYRM_ROOMS } from './wyrm-rooms.mjs';

const roomsByHouse = Object.freeze({ gafyr: GAFYR_ROOMS, saethwyr: SAETHWYR_ROOMS, wyrm: WYRM_ROOMS });
export const castleRooms = houseId => roomsByHouse[houseId] || [];
export const castleImage = (houseId, roomId) => `${CASTLE_ASSET_ROOT}/${houseId}/${roomId}-v1.png`;
const paragraphs = lines => lines.map(line => `<p>${line}</p>`).join('');

function scenePage(house, room) {
  return { schemaVersion: 1, pageTitle: room.title, commentThreadKey: `${house.id}-${room.id}`,
    sessionPage: true, image: castleImage(house.id, room.id), imageWidth: 28, imageTall: true,
    imageFit: 'contain', imagePosition: 'center top', sessionIntro: paragraphs(room.intro),
    sessionLocation: `${house.title} · ${room.title}`, sessionStatus: 'active', sessionParticipants: [],
    sessionHint: 'Beginne eine Begegnung oder setze das gemeinsame Spiel an diesem Ort fort.',
    sessionEmptyTitle: room.title, sessionEmptyText: 'Hier kann eine neue Szene beginnen.',
    sessionDateAleria: { year: null, month: null, day: null } };
}

export function buildCastleModule(house, areaId) {
  const area = CASTLE_AREAS.find(row => row.id === areaId);
  if (!area) throw Error(`Unbekannter Burgbereich: ${areaId}`);
  const rooms = castleRooms(house.id).filter(room => room.area === areaId);
  if (!rooms.length) throw Error(`Leerer Burgbereich: ${house.id}/${areaId}`);
  const pages = rooms.map(room => scenePage(house, room));
  return { id: `castell-${house.id}-${area.id}`, title: `${house.title} – ${area.title}`,
    subtitle: area.subtitle, type: 'Interaktive Szene', category: house.title,
    image: pages[0].image, previewImage: pages[0].image, symbol: house.symbol, icon: '',
    stamp: 'Celtigerns Wacht · Gwynthor · Aleria', moduleWidth: 100, moduleHeight: 100,
    schemaVersion: 1, multipage: true, appendCommentsPage: false, enablePageComments: true,
    sessionCast: [], sessionCastDetails: [], pages };
}

export function buildCastleRegistrations() {
  return CASTLE_HOUSES.flatMap(house => CASTLE_AREAS
    .filter(area => castleRooms(house.id).some(room => room.area === area.id))
    .map(area => ({ tab: 'Völker & Kulturen', path: [...house.path], description: `${house.location} · ${house.character}`,
      icon: house.symbol, entry: buildCastleModule(house, area.id) })));
}
