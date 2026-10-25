import { HOUSE_MAC_ARD_CUMHAILL_FAMILY } from '../../data/house-mac-ard-cumhaill-family.js';
import { HOUSE_FIR_AN_GALLCHOBHAIR_FAMILY } from '../../data/house-fir-an-gallchobhair-family.js';
import { HOUSE_CHULAINN_FAMILY } from '../../data/house-chulainn-family.js';
import { HOUSE_AILELLA_FAMILY } from '../../data/house-ailella-family.js';
import { HOUSE_MORNA_FAMILY } from '../../data/house-morna-family.js';
import { HOUSE_DURTHACHT_FAMILY } from '../../data/house-durthacht-family.js';
import { HOUSE_UI_FAILL_DUIBHNE_FAMILY } from '../../data/house-ui-faill-duibhne-family.js';
import { HOUSE_RONAIN_FAMILY } from '../../data/house-ronain-family.js';
import { HOUSE_UI_ROCHRAIDE_FAMILY } from '../../data/house-ui-rochraide-family.js';
import { HOUSE_URQUHART_FAMILY } from '../../data/house-urquhart-family.js';
import { HOUSE_STWATCHN_FAMILY } from '../../data/house-stwatchn-family.js';
import { HOUSE_LACHLANN_FAMILY } from '../../data/house-lachlann-family.js';
import { HOUSE_TYLLUAN_FAMILY } from '../../data/house-tylluan-family.js';
import { HOUSE_EOGHAINN_FAMILY } from '../../data/house-eoghainn-family.js';
import { withLagaCounterpartUpgrade } from './laga-counterpart-upgrade.js';

function knownMarriage(source, personId, { localId = personId, stays = false, targetFamilyId = '' } = {}) {
  const family = withLagaCounterpartUpgrade(source);
  const person = family.persons.find(entry => entry.id === personId);
  const pair = family.partnerships.find(entry => entry.participantIds.includes(personId));
  const partner = family.persons.find(entry => entry.id === pair?.participantIds.find(id => id !== personId));
  if (!person || person.houseId !== 'house-laga' || !pair || !partner) {
    throw new Error(`Unvollständige belegte Lága-Verbindung: ${family.document.id}/${personId}.`);
  }
  return Object.freeze({
    sourceFamilyId: family.document.id, sourcePersonId: personId,
    person: { ...person, id: localId }, partner,
    // Die zwei Laoise behalten ihre unterschiedlichen Weltidentitäten. Nur in
    // dieser Akte braucht die ältere Ehe eine lokale, eindeutig referenzierbare ID.
    pair: { ...pair,
      id: localId === personId ? pair.id : 'marriage-laga-laoise-1125-diarmuid',
      participantIds: pair.participantIds.map(id => id === personId ? localId : id),
      extensions: { ...pair.extensions, lagaSourcePartnershipId: pair.id }
    },
    partnerHouse: family.houses.find(house => house.id === partner.houseId),
    stays, targetFamilyId: stays ? '' : targetFamilyId || family.document.id
  });
}

export const LAGA_KNOWN_LINKS = Object.freeze([
  knownMarriage(HOUSE_FIR_AN_GALLCHOBHAIR_FAMILY, 'laoise-laga', { localId: 'laoise-1125-laga' }),
  knownMarriage(HOUSE_MORNA_FAMILY, 'quilline-1275-laga'),
  knownMarriage(HOUSE_LACHLANN_FAMILY, 'meabhrog-1510-laga'),
  knownMarriage(HOUSE_TYLLUAN_FAMILY, 'clodagh-laga'),
  knownMarriage(HOUSE_STWATCHN_FAMILY, 'fiadh-1608-laga'),
  knownMarriage(HOUSE_MAC_ARD_CUMHAILL_FAMILY, 'laoise-laga'),
  knownMarriage(HOUSE_MORNA_FAMILY, 'maolmhuire-1626-laga'),
  knownMarriage(HOUSE_RONAIN_FAMILY, 'duibhseach-1650-laga'),
  knownMarriage(HOUSE_UI_ROCHRAIDE_FAMILY, 'fionnchu-laga'),
  knownMarriage(HOUSE_URQUHART_FAMILY, 'glaodhaich-1675-laga'),
  knownMarriage(HOUSE_DURTHACHT_FAMILY, 'lagaid-1689-laga', { stays: true }),
  knownMarriage(HOUSE_CHULAINN_FAMILY, 'lugaid-1690-laga', { stays: true }),
  knownMarriage(HOUSE_AILELLA_FAMILY, 'luibheas-founder-laga', { stays: true }),
  knownMarriage(HOUSE_UI_FAILL_DUIBHNE_FAMILY, 'seonaid-founder-laga'),
  knownMarriage(HOUSE_RONAIN_FAMILY, 'meadhbh-founder-laga')
]);

export const LAGA_KNOWN_WARDS = Object.freeze([
  [HOUSE_MORNA_FAMILY, 'ciara-1729-morna'],
  [HOUSE_RONAIN_FAMILY, 'artair-1721-ronain'],
  [HOUSE_EOGHAINN_FAMILY, 'ronan-1729-eoghainn']
].map(([family, personId]) => {
  const branch = family.cadetBranches.find(entry => entry.parentPersonId === personId
    && entry.targetFamilyId === 'haus-laga' && entry.linkType === 'ward-away');
  if (!branch) throw new Error(`Unbelegte Lága-Pflegschaft: ${personId}.`);
  const person = family.persons.find(entry => entry.id === personId);
  return Object.freeze({ person, house: family.houses.find(house => house.id === person.houseId),
    sourceFamilyId: family.document.id });
}));
