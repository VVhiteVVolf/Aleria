import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const FFALS_EMBLEM = 'assets/images/houses/Venalys/Ffals/ffals-emblem.png';
export const FFALS_HOUSE_ID = 'house-ffals';

const base = createFounderPlaceholderHouseFamily({
  id: 'haus-ffals', title: 'Familie Ffals', emblem: FFALS_EMBLEM,
  houseProfile: createHouseProfileFromFolderPath(['Venalys'], {
    rankId: 'commoner', seat: 'Venalys',
    regionEmblems: { kingdom: 'assets/images/regions/venalys.png' }
  }),
  description: 'Die tatsächliche Familie Ffals: Händler von der Silberinsel, heute in Venalys. Der verwandte Gwynthorer Juwelierzweig ist ohne Nachkommen erloschen; der genaue Verwandtschaftsgrad bleibt offen.'
});

const member = (id, name, sex, title, notes, options = {}) => createFamilyPerson({
  id, name, sex, title, notes, status: options.status || 'alive',
  worldPersonId: `person--haus-ffals--${id}`,
  houseId: options.married ? '' : FFALS_HOUSE_ID,
  familyRole: options.married ? 'married' : 'core',
  lineageRole: options.head ? 'head' : 'branch',
  portrait: '', birth: '', death: '',
  extensions: { authoredSource: 'ffals-real-family-20261109', portraitIntentionallyAbsent: true }
});

const alwynId = 'alwyn-ffals-echt';
const brynId = 'bryn-ffals-echt';
const wifeId = 'unbenannte-gemahlin-alwyn-ffals';
const marriage = createMarriage('marriage-alwyn-ffals-unbenannte-gemahlin', alwynId, wifeId, {
  status: 'ended', notes: 'Die Gemahlin ist verstorben. Name, Herkunft und Lebensdaten sowie Ehe- und Todesjahr sind nicht überliefert.',
  extensions: { chartAlignChildGroupBelowParentPair: true }
});

export const HOUSE_FFALS_FAMILY = Object.freeze({
  ...base,
  persons: [
    ...base.persons.map(person => createFamilyPerson({
      ...person,
      name: person.sex === 'male' ? 'Unbekannter Vater' : 'Unbekannte Mutter',
      title: 'Eltern der Brüder · nicht benannt', status: 'unknown', tags: [],
      worldPersonId: `person--haus-ffals--${person.id}`,
      notes: 'Gemeinsamer Elternplatzhalter für Alwyn und dessen jüngeren Bruder. Namen, Lebensdaten und weitere Familiengeschichte sind nicht überliefert; dies sind keine benannten historischen Gründer.',
      extensions: { authoredSource: 'ffals-real-family-20261109', unresearchedParentPlaceholder: true, portraitIntentionallyAbsent: true }
    })),
    member(alwynId, 'Alwyn Ffals', 'male', 'Händler von der Silberinsel',
      'Verwitweter Händler von der Silberinsel. Nach dem Tod seiner Frau zog er mit seinen beiden bereits erwachsenen Kindern und seinem jüngeren Bruder nach Venalys. Die Lebensdaten und der Zeitpunkt dieses Umzugs sind nicht benannt.', { head: true }),
    member(wifeId, 'Unbenannte Gemahlin Alwyns', 'female', 'Alwyns verstorbene Gemahlin',
      'Verstorbene Ehefrau Alwyns und Mutter seiner beiden Kinder. Ihr Name, ihre Herkunft und ihre Lebensdaten bleiben offen. Ihr Tod liegt vor dem Umzug der Familie nach Venalys.', { married: true, status: 'dead' }),
    member(brynId, 'Bryn Ffals', 'male', 'Alwyns jüngerer Bruder',
      'Jüngerer Bruder Alwyns. Zog gemeinsam mit Alwyn und dessen zwei Kindern von der Silberinsel nach Venalys. Beruf, Familienstand und Lebensdaten sind nicht benannt.'),
    member('seren-ffals-echt', 'Seren Ffals', 'female', 'Erwachsene Tochter Alwyns',
      'Alwyns bereits erwachsene Tochter. Zog nach dem Tod ihrer Mutter mit ihrem Vater, ihrem Bruder und ihrem Onkel nach Venalys. Beruf, Familienstand und Lebensdaten sind nicht benannt.'),
    member('rhun-ffals-echt', 'Rhun Ffals', 'male', 'Erwachsener Sohn Alwyns',
      'Alwyns bereits erwachsener Sohn. Zog nach dem Tod seiner Mutter mit seinem Vater, seiner Schwester und seinem Onkel nach Venalys. Beruf, Familienstand und Lebensdaten sind nicht benannt.')
  ],
  partnerships: [
    { ...base.partnerships[0], type: 'union', certainty: 'unknown', status: 'unknown',
      notes: 'Allgemeiner Verbindungsplatzhalter für die nicht benannten Eltern der Brüder; eine Eheschließung, deren Zeitpunkt und weitere Lebensgeschichte sind nicht belegt.',
      extensions: { registryManagedFields: ['type', 'notes'], registryManagedSourceRevision: 2 } },
    marriage
  ],
  parentages: [
    ...createParentages([alwynId, brynId], base.partnerships[0].participantIds, base.partnerships[0].id, {
      certainty: 'unknown', legitimacy: 'unknown',
      notes: 'Die Geschwisterschaft der Brüder ist belegt; die Eltern sind nicht benannt und werden ausschließlich als gemeinsamer Platzhalter dargestellt.'
    }),
    ...createParentages(['seren-ffals-echt', 'rhun-ffals-echt'], [alwynId, wifeId], marriage.id, {
      legitimacy: 'unknown', notes: 'Zwei bereits erwachsene Kinder Alwyns und seiner verstorbenen Gemahlin; keine Lebensdaten ergänzt.'
    })
  ],
  lineage: { ...base.lineage, crestSubtitle: 'Händlerfamilie · Silberinsel → Venalys' },
  view: { ...base.view, focusPersonId: alwynId, limitGenerations: false },
  extensions: {
    ...base.extensions, blankFamily: false, sourceRevision: 2, chartLayoutPolicy: 'strict-v1',
    authoredOn: '2026-11-09',
    sourceNote: 'Nutzerquelle vom 9. November 2026. Schreibweise Ffals folgt dem mehrfachen Erzähltext und den beschrifteten Karten; Fflas bleibt eine Quellschreibvariante. Die Namen Seren, Rhun und Bryn sowie ihre Rollen als Tochter, Sohn und jüngerer Bruder wurden aus den Kartenbeschriftungen und der beschriebenen Familienkonstellation zusammengeführt. Namen unbekannter Angehöriger, Lebensdaten und die genaue Verbindung zum erloschenen Gwynthorer Zweig bleiben offen. Für diese Familienakte wurden keine Personenporträts erstellt oder übernommen.'
  }
});
