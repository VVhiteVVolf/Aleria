import { normalizeHouseProfile } from '../../domain/house-profile.js';
import { createCourtFamily } from './family-foundation.js';
import { VALERIANO_FALTO } from './case-people.js';

const family = createCourtFamily({
  id: 'haus-falto', title: 'Haus Falto', emblem: 'assets/images/houses/Venalys/haus-falto.png',
  houseProfile: normalizeHouseProfile({ rankId: 'magnarian', kingdom: 'Venalys', secondarySeats: ['Gwynthor'],
    liegeHouseId: 'haus-vinicius', liegeHouseName: 'Haus Vinicius', folderPath: ['Venalys'],
    regionEmblems: { kingdom: 'assets/images/regions/venalys.png' } }),
  description: 'In Venalys sesshaftes Magnarierhaus unter Vinicius mit einer seit Jahrhunderten bestehenden örtlichen Vertretung in Gwynthor. Bankwesen, Kaufmannschaft und Handelsflotte; zwei örtliche Fortuna-Ratssitze und Leitung der Blauen Bank. Valeriano ist der ausgearbeitete Gildenfürsprecher. Das eigene Hauswappen zeigt ein goldenes Handelsschiff mit elfenbeinfarbenem Segel über drei goldenen Münzen auf tiefblauem Grund, umschlossen von einem goldenen Lorbeerrahmen. Schiff und Münzen stehen für Fernhandel, Flotte und Bankwesen; das Wappen ist kein Gildenzeichen. Der genaue Stammsitz innerhalb Venalys und weitere Angehörige bleiben unbestimmt.',
  firstYear: '1702', roots: [VALERIANO_FALTO.id], people: [VALERIANO_FALTO],
  sourceRevision: 2,
  sourceNote: 'Institutionelle Falto-Quelle: modules/markt-der-fortuna-gwynthor/fortuna-factions.mjs. Nutzerauftrag vom 30.10.2026 ergänzt Valeriano, 38, Venalys-Ausbildung und hellblaue Familienmerkmale. Nutzerkorrektur vom 31.10.2026: Das Haus ist in Venalys sesshaft und wird ausschließlich dort einsortiert; Gwynthor bleibt örtliche Vertretung. Das neue eigenständige Hauswappen ist eine autorisierte Ausarbeitung aus Handelsflotte und Bankwesen; keine neue Gründungslegende oder weitere Verwandtschaft ergänzen.'
});

export const HOUSE_FALTO_FAMILY = Object.freeze({
  ...family,
  houses: family.houses.map(house => ({ ...house, extensions: {
    ...house.extensions, registryManagedFields: ['emblem'], registryManagedFieldRevisions: { emblem: 2 }
  } })),
  extensions: { ...family.extensions, registryManagedEntitySourceRevision: 1,
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedDocumentFieldRevisions: { emblem: 2, description: 2 },
    registryManagedHouseProfileFields: ['kingdom', 'county', 'barony', 'seat', 'folderPath', 'secondarySeats', 'regionEmblems'],
    registryManagedHouseProfileFieldRevisions: { kingdom: 2, county: 2, barony: 2, seat: 2, folderPath: 2, secondarySeats: 2, regionEmblems: 2 },
    registryManagedRecordFields: ['folderPath'],
    registryManagedExtensionFields: ['registryAdditionalPlacements']
  }
});
