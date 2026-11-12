import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { COEDDU_CRAIGDDU_MARRIAGE } from './coeddu-craigddu-marriage.js';
import { LLYWELYN_COEDDU_BIOGRAPHY } from './person-biographies/llywelyn-coeddu.js';
import { BRENRIC_COEDDU_BIOGRAPHY } from './person-biographies/brenric-coeddu.js';
import { withEleganzCoedduLink } from './eleganz-family-links.js';
import { COEDDU_PORTRAITS } from './house-coeddu-portraits.js';
import { preserveSourceMetadataBoundaries, withSourceFamilyFieldUpgrade } from './source-family-field-upgrade.js';

const HOUSE_ID = 'house-coeddu';
const EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Coeddu.png';
const BASE = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-coeddu', title: 'Haus Coeddu', emblem: EMBLEM,
  houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.coeddu,
  description: 'Kriegerisches Bürgerhaus aus Gwynthor mit einer beliebten Waffenschmiede. Die Coeddu dienen Haus Draig seit Generationen als Wachen, Waffenknechte und vereinzelt als Ritter. Brenric ist Veteran des Großen Krieges und heute Kriegswart der Aufklärung; sein Sohn Llywelyn dient als Waffenknecht.',
  toYear: '1682', timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis Brenric',
  pendingDescendantReview: false
});
const PARENTS = ['brenric-coeddu', 'gweneth-coeddu'];
const SIBLINGS = ['rhydian-coeddu', 'llywelyn-coeddu', 'maelwen-coeddu', 'thalor-coeddu'];

function member(id, name, sex, birth, options = {}) {
  return createFamilyPerson({ id, name, sex, birth, houseId: HOUSE_ID, ...options });
}

const COEDDU_SOURCE_FAMILY = withEleganzCoedduLink({
  ...BASE,
  houses: [
    ...BASE.houses,
    { id: 'house-craigddu', name: 'Haus Craigddu', motto: '', emblem: 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Craigddu.png', status: 'active' }
  ],
  persons: [
    ...BASE.persons.map((person, index) => ({
      ...person, name: index ? 'Unbekannte Gründerin' : 'Unbekannter Gründer', birth: '', death: '',
      notes: 'Historischer Ursprung der Familie; Name, Lebensdaten und dazwischenliegende Generationen sind unbekannt.'
    })),
    member('brenric-coeddu', 'Brenric Coeddu', 'male', '1682', {
      title: 'Waffenknecht im Ruhestand · Veteran des Großen Krieges', lineageRole: 'mainline',
      notes: 'Diente im Großen Krieg unter Sir Maredudd. Wiederkehrende Gelenkbeschwerden, besonders am Fuß, führten zu seinem Ruhestand. Vater von Rhydian, Llywelyn, Maelwen und Thalor.',
      extensions: { biographyModule: BRENRIC_COEDDU_BIOGRAPHY, registryManagedFieldPreviousValues: {
        portrait: ['', 'assets/images/placeholders/male.png'],
        title: ['Waffenknecht im Ruhestand · Veteran des Großen Krieges'],
        notes: ['Diente im Großen Krieg unter Sir Maredudd. Wiederkehrende Gelenkbeschwerden, besonders am Fuß, führten zu seinem Ruhestand. Vater von Rhydian, Llywelyn, Maelwen und Thalor.']
      } }
    }),
    member('gweneth-coeddu', 'Gweneth', 'female', '1686', { familyRole: 'married', notes: 'Ehefrau Brenrics und Mutter der vier Geschwister.' }),
    member('rhydian-coeddu', 'Rhydian Coeddu', 'male', '1707'),
    createFamilyPerson({
      ...COEDDU_CRAIGDDU_MARRIAGE.husband, lineageRole: 'mainline',
      notes: 'Dreißigjähriger, pflichtbewusster und gemütlicher Waffenknecht. Ehemann Catrins, Vater Ellians und bester Freund Hywels.',
      extensions: { biographyModule: LLYWELYN_COEDDU_BIOGRAPHY }
    }),
    member('maelwen-coeddu', 'Maelwen Coeddu', 'female', '1713'),
    member('thalor-coeddu', 'Thalor Coeddu', 'male', '1716'),
    createFamilyPerson({ ...COEDDU_CRAIGDDU_MARRIAGE.wife, familyRole: 'married' }),
    member('ellian-coeddu', 'Ellian Coeddu', 'male', '1735', { lineageRole: 'mainline', notes: 'Junger Sohn Llywelyns und Catrins; im Jahr 1740 fünf Jahre alt.' })
  ],
  partnerships: [
    ...BASE.partnerships.map(partnership => ({ ...partnership, status: 'ended', certainty: 'unknown' })),
    createMarriage('marriage-brenric-gweneth-coeddu', ...PARENTS),
    createMarriage(COEDDU_CRAIGDDU_MARRIAGE.linkId, 'llywelyn-coeddu', 'catrin-craigddu', {
      extensions: { crossFamilyRelationship: { linkId: COEDDU_CRAIGDDU_MARRIAGE.linkId, counterpartFamilyId: 'craigddu' } }
    })
  ],
  parentages: [
    ...createParentages(['brenric-coeddu'], BASE.partnerships[0].participantIds, BASE.lineage.founderPartnershipId, {
      type: 'claimed', certainty: 'unknown',
      notes: 'Tradierte Abstammung über nicht einzeln überlieferte Generationen; keine unmittelbare Elternschaft.',
      extensions: { timeJumpId: BASE.timeJumps[0].id }
    }),
    ...createParentages(SIBLINGS, PARENTS, 'marriage-brenric-gweneth-coeddu'),
    ...createParentages(['ellian-coeddu'], ['llywelyn-coeddu', 'catrin-craigddu'], COEDDU_CRAIGDDU_MARRIAGE.linkId)
  ],
  timeJumps: [{
    ...BASE.timeJumps[0], childIds: ['brenric-coeddu'], fromYear: '',
    extensions: { preparedPlaceholder: false }
  }],
  view: { ...BASE.view, limitGenerations: false },
  extensions: {
    blankFamily: false, sourceRevision: 2,
    registryManagedDocumentFields: ['description'],
    registryManagedDocumentFieldRevisions: { description: 6 },
    sourceNote: 'Benutzervorgaben vom 27.09.2026. Llywelyn ist 1740 dreißig Jahre alt; Catrin, ihre Lebensdaten und die Ehe stammen aus der bestehenden Craigddu-Akte. Ergänzte Namen Brenric, Gweneth, Rhydian, Maelwen, Thalor und Ellian folgen dem Rheunwaith-Namensarchiv. Ihre Lebensjahre sind erzählerische Ergänzungen. Der historische Ursprung bleibt ausdrücklich unbekannt.'
  }
});

// The new personal office changes neither the family's commoner rank nor its graph.
export const HOUSE_COEDDU_FAMILY = Object.freeze(withSourceFamilyFieldUpgrade(
  preserveSourceMetadataBoundaries(COEDDU_SOURCE_FAMILY),
  { revision: 6, collections: { persons: {
    'brenric-coeddu': {
      portrait: COEDDU_PORTRAITS['brenric-coeddu'],
      title: 'Kriegswart der Aufklärung · Ritter im Dienst von Haus Draig',
      notes: 'Veteran des Großen Krieges unter Sir Maredudd. Wegen wiederkehrender Gelenk- und Fußbeschwerden zog er sich aus dem Felddienst zurück. Heute ist er persönlicher Ritter im Dienst der Draigs und Kriegswart der Aufklärung: Er wertet Meldungen aus, führt Lagekarten und ordnet Boten- sowie Signalberichte unter Sir Maredudd und in Abstimmung mit Efael. Vater von Rhydian, Llywelyn, Maelwen und Thalor.'
    }
  } } },
  { inventory: 'assets/images/portraits/haus-coeddu/portrait-sources.json', marker: 'fatherPortraitInventory' }
));
