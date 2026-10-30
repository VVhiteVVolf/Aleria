import { normalizeHouseProfile } from '../../domain/house-profile.js';
import { createCourtFamily } from './family-foundation.js';
import { VALERIANO_FALTO } from './case-people.js';

export const HOUSE_FALTO_FAMILY = createCourtFamily({
  id: 'haus-falto', title: 'Haus Falto',
  houseProfile: normalizeHouseProfile({ rankId: 'magnarian', kingdom: 'Venalys', secondarySeats: ['Gwynthor'],
    liegeHouseId: 'haus-vinicius', liegeHouseName: 'Haus Vinicius', folderPath: ['Venalys'] }),
  description: 'Venalysisches Magnarierhaus unter Vinicius, seit Jahrhunderten in Gwynthor vertreten. Bankwesen, Kaufmannschaft und Handelsflotte; zwei örtliche Fortuna-Ratssitze und Leitung der Blauen Bank. Valeriano ist der ausgearbeitete Gildenfürsprecher. Hauswappen, Stammhaus und weitere Angehörige bleiben unbestimmt; das Gildenzeichen wird nicht als Falto-Wappen ausgegeben.',
  firstYear: '1702', roots: [VALERIANO_FALTO.id], people: [VALERIANO_FALTO],
  additionalPlacements: [{
    id: 'falto-gwynthor-presence',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'],
    houseProfile: normalizeHouseProfile({ rankId: 'magnarian', kingdom: 'Cenyr', county: 'Celtigerns Wacht',
      barony: 'Llamreis Ankunft', seat: 'Gwynthor', liegeHouseId: 'haus-vinicius', liegeHouseName: 'Haus Vinicius' }),
    notes: 'Örtliche Vertretung desselben venalysischen Hauses; keine zweite Familie und kein neuer cenyrischer Adelstitel.'
  }],
  sourceNote: 'Institutionelle Falto-Quelle: modules/markt-der-fortuna-gwynthor/fortuna-factions.mjs. Nutzerauftrag vom 30.10.2026 ergänzt Valeriano, 38, Venalys-Ausbildung und hellblaue Familienmerkmale. Weitere Hausgeschichte und ein eigenes Wappen werden nicht erfunden.'
});
