import { normalizeHouseProfile } from '../../domain/house-profile.js';
import { createCourtFamily } from './family-foundation.js';
import { COURT_EMBLEMS, CYNFARCH_LLAFNFOR } from './case-people.js';

export const HOUSE_LLAFNFOR_FAMILY = createCourtFamily({
  id: 'haus-llafnfor', title: 'Haus Llafnfor', emblem: COURT_EMBLEMS.llafnfor,
  houseProfile: normalizeHouseProfile({ rankId: 'knight', kingdom: 'Cenyr', county: 'Klaueninsel', barony: 'Talklaue', seat: '',
    folderPath: ['Cenyr', 'Klaueninsel', 'Talklaue', 'Caer Cryftlawd'],
    liegeHouseId: 'haus-dyfrgi-caer-cryftlawd', liegeHouseName: "Haus Dyfrgi O'Caer Cryftlawd" }),
  description: 'Ritterherrenfamilie im Gefolge der Dyfrgi von Caer Cryftlawd auf den Klaueninseln. Ihr Schwertfisch spießt eine Seeschlange auf. Cynfarch ist als Kapitän und Retter Gwrgans bekannt. Die Zuordnung bezeichnet seinen Dienstherrn und dessen Herrschaft, keinen neu erfundenen eigenen Familiensitz.',
  firstYear: '1694', roots: [CYNFARCH_LLAFNFOR.id], people: [CYNFARCH_LLAFNFOR],
  sourceNote: 'Nutzerauftrag vom 30.10.2026: Existenz vermerken und unter Dyfrgi einordnen; weitere Familie ausdrücklich nicht vervollständigen. Unbekanntes Gründerpaar, Wappenknoten und Zeitsprung bleiben erhalten.'
});
