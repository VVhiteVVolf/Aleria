import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { FONTANI_PEOPLE } from '../../../../AleriaAlmanach/modules/gwynthor-bathhouse/bathhouse-people.mjs';

const emblem = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Fontani.png';
const marriageId = 'marriage-cassiano-livia-fontani';
const parents = ['cassiano-fontani', 'livia-fontani'];

export const HOUSE_FONTANI_FAMILY = Object.freeze({
  schema: 'aleria.family-tree', schemaVersion: 1,
  document: { id: 'haus-fontani', title: 'Haus Fontani', motto: 'Aqua et Quies · Wasser und Ruhe', emblem,
    description: 'Kleine argentische Bürgerfamilie in Gwynthor. Seit mehreren Generationen betreibt sie das von ihren Vorfahren nach argentischer Baukunst errichtete Badehaus. Der Stammbaum zeigt vorerst nur Cassiano, Livia und Terenzio; ältere Angehörige sind noch nicht einzeln ausgearbeitet.',
    houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'],
      { rankId: 'commoner', liegeHouseId: 'house-draig', liegeHouseName: 'Haus Draig' }) },
  houses: [{ id: 'house-fontani', name: 'Haus Fontani', status: 'active', emblem }],
  persons: FONTANI_PEOPLE.map(p => createFamilyPerson({ id: p.id, worldPersonId: p.worldPersonId,
    name: p.name, sex: p.sex, birth: p.birth, houseId: p.maidenHouseUnknown ? '' : 'house-fontani',
    familyRole: p.maidenHouseUnknown ? 'married' : 'core', title: p.role, notes: p.bio,
    portrait: `../AleriaAlmanach/${p.portrait.slice(2)}`,
    extensions: { registryManagedFields: ['title', 'notes', 'portrait'] } })),
  partnerships: [createMarriage(marriageId, ...parents, { start: '1714' })],
  parentages: createParentages(['terenzio-fontani'], parents, marriageId),
  cadetBranches: [], timeJumps: [],
  lineage: { founderPartnershipId: marriageId, houseId: 'house-fontani', crestSubtitle: 'Argentische Badekunst in Gwynthor',
    crestEmblemScale: 0.86, crestFrame: 'iron', crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' } },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: { focusPersonId: 'cassiano-fontani', orientation: 'vertical', ancestorDepth: 4, descendantDepth: 4, limitGenerations: false, showSiblings: true },
  extensions: { blankFamily: false, sourceRevision: 1,
    sourceNote: 'Lokaler Badehaus-Entwurf vom 17.10.2026. Der Darstellungsbeginn beim heutigen Ehepaar behauptet keine Betriebsgründung durch Cassiano. Er kam selbst aus Argentum zu seiner bereits in Gwynthor ansässigen Familie. Livias Herkunftshaus bleibt offen; frühere Generationen werden nicht erfunden.' }
});
