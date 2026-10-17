import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { RHWYD_PEOPLE, RHWYD_MOTTO } from '../../../../AleriaAlmanach/modules/kleiner-durst/durst-people.mjs';
const emblem = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Rhwyd.png';
const base = createFounderTimeJumpPlaceholderHouseFamily({ id: 'haus-rhwyd', title: 'Haus Rhwyd', emblem,
  houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], { rankId: 'commoner', liegeHouseId: 'house-draig', liegeHouseName: 'Haus Draig' }),
  toYear: '1666', timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis Gethin',
  description: 'Arme, überschuldete Gwynthorer Wirtsfamilie des Kleinen Dursts direkt an den Docks. Vier der fünf Söhne Gethins und Efas fielen 1720; der jüngste, Iorwerth, führt die Kneipe heute mit seiner Mutter. Meleri, Nia und Dewi gehören zum kleinen lebenden Familienkreis.' });
const founders = base.persons.map((p, i) => createFamilyPerson({ ...p, name: i ? 'Unbekannte Gründerin' : 'Unbekannter Gründer' }));
const parentMarriage = createMarriage('marriage-gethin-efa-rhwyd', 'gethin-rhwyd', 'efa-rhwyd', { start: '1687', end: '1728', status: 'ended' });
const currentMarriage = createMarriage('marriage-iorwerth-nia-rhwyd', 'iorwerth-rhwyd', 'nia-rhwyd', { start: '1725' });
export const HOUSE_RHWYD_FAMILY = Object.freeze({
  ...base, document: { ...base.document, motto: RHWYD_MOTTO }, houses: [{ ...base.houses[0], motto: RHWYD_MOTTO }],
  persons: [...founders, ...RHWYD_PEOPLE.map(p => createFamilyPerson({ id: p.id, worldPersonId: p.worldPersonId,
    name: p.name, sex: p.sex, birth: p.birth, death: p.death, houseId: p.unknownOrigin ? '' : 'house-rhwyd',
    familyRole: p.unknownOrigin ? 'married' : 'core', title: p.role, notes: p.bio,
    portrait: `../AleriaAlmanach/${p.portrait.slice(2)}`, extensions: { registryManagedFields: ['name', 'title', 'notes', 'portrait'], portraitAge: p.portraitAge || 1740 - Number(p.birth) } }))],
  partnerships: [{ ...base.partnerships[0], status: 'ended', certainty: 'unknown' }, parentMarriage, currentMarriage],
  parentages: [
    ...createParentages(['gethin-rhwyd'], founders.map(p => p.id), base.lineage.founderPartnershipId, { type: 'claimed', certainty: 'unknown', notes: 'Zugehörigkeit über nicht einzeln bekannte Generationen, keine unmittelbare Elternschaft.', extensions: { timeJumpId: base.timeJumps[0].id } }),
    ...createParentages(['aled', 'carwyn', 'hywel', 'dafydd', 'iorwerth', 'meleri'].map(key => `${key}-rhwyd`), parentMarriage.participantIds, parentMarriage.id),
    ...createParentages(['dewi-rhwyd'], currentMarriage.participantIds, currentMarriage.id)
  ],
  timeJumps: [{ ...base.timeJumps[0], childIds: ['gethin-rhwyd'], extensions: { preparedPlaceholder: false } }],
  lineage: { ...base.lineage, crestSubtitle: 'Zum Kleinen Durst · Gwynthors Docks' },
  view: { ...base.view, focusPersonId: 'iorwerth-rhwyd', limitGenerations: false },
  extensions: { ...base.extensions, blankFamily: false, preparedTimeJump: true, pendingDescendantReview: false, sourceRevision: 1,
    sourceNote: 'Nutzerauftrag vom 17.10.2026. Genau fünf Söhne: vier ältere 1720 gefallen, Iorwerth damals 15. Zusätzlich seine unverheiratete Schwester. Unbekanntes Gründerpaar → Hausverknüpfung → serieller Zeitsprung → Gethin und Efa → Kinder → Iorwerth und Nia → Dewi. Keine erfundenen Ehepartner oder Nachkommen der gefallenen Brüder. Carys und Bram sind keine Familienmitglieder.' }
});
