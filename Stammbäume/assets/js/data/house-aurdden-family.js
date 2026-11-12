import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createMarriedAwayBranch, createParentages } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { AURDDEN_FAMILY_PEOPLE } from './aurdden-people.js';
import { AURDDEN_EMBLEM, AURDDEN_HOUSE_ID, AURDDEN_AERON_LOER, createAurddenPerson, createAurddenLoerEngagement } from './aurdden-loer-engagement.js';

const base = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-aurdden', title: 'Familie Aurdden', emblem: AURDDEN_EMBLEM,
  houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], {
    rankId: 'commoner', liegeHouseId: 'house-loer', liegeHouseName: 'Haus Loer'
  }),
  description: 'Wohlhabende Gwynthorer Goldschmiede-, Juwelier- und Bankfamilie im unmittelbaren Dienst der Loer. Drei Brüder führen Gwynthors vornehmsten Juwelier, ihr erster Vetter den gesonderten Bankzweig.',
  toYear: '1636', timeJumpLabel: 'Nicht einzeln bekannte Generationen bis Heledric Aurdden', pendingDescendantReview: false
});

const couples = {
  grandparents: ['heledric-aurdden', 'lleirwen-spouse-aurdden'],
  parents: ['iwrwyn-aurdden', 'brenella-spouse-aurdden'],
  uncle: ['oeneth-aurdden', 'rhewae-spouse-aurdden'],
  eldest: ['kyrwyn-aurdden', 'avelena-spouse-aurdden'],
  second: ['thalan-aurdden', 'firwen-spouse-aurdden'],
  youngest: ['saithen-aurdden', 'perdella-spouse-aurdden'],
  cousin: ['pereth-aurdden', 'uffyria-spouse-aurdden'],
  cyrwen: ['cyrwen-aurdden', 'unknown-cyrwen-aurdden-husband'],
  lleirena: ['lleirena-aurdden', 'unknown-lleirena-aurdden-husband'],
  affair: ['saithen-aurdden', 'unknown-cyrion-mother']
};
const marriage = (key, options = {}) => createMarriage(`marriage-aurdden-${key}`, ...couples[key], options);
const ended = (start, end) => ({ start, end, status: 'ended' });
const grandparents = marriage('grandparents', { ...ended('1660', '1728'), extensions: { chartAlignParentPairOverChildPersonId: 'iwrwyn-aurdden', chartPackLeafSiblingBranchesBesideAlignedChild: true } });
const parents = marriage('parents', { ...ended('1683', '1736') });
const uncle = marriage('uncle', { ...ended('1686', '1738'), extensions: { chartAlignParentPairOverChildPersonId: 'pereth-aurdden' } });
const eldest = marriage('eldest', { start: '1711', extensions: { chartAlignChildGroupBelowParentPair: true } });
const second = marriage('second', { start: '1714', extensions: { chartAlignChildGroupBelowParentPair: true } });
const youngest = marriage('youngest', { start: '1716', extensions: { chartAlignPartnerOverChildrenPersonId: 'perdella-spouse-aurdden' } });
const cousin = marriage('cousin', { start: '1714', extensions: { chartAlignChildGroupBelowParentPair: true } });
const cyrwen = marriage('cyrwen', { notes: 'Wegverheiratet; Name, Herkunft, Lebensdaten des Ehemanns und Ehejahr sind nicht festgelegt.' });
const lleirena = marriage('lleirena', { notes: 'Wegverheiratet; Name, Herkunft, Lebensdaten des Ehemanns und Ehejahr sind nicht festgelegt.' });
const affair = createMarriage('affair-saithen-unknown-cyrion-mother', ...couples.affair, {
  type: 'affair', status: 'ended', start: '', end: '',
  notes: 'Frühere Affäre Saithens mit einer unbekannten Frau; aus ihr stammt Cyrion, geboren 1718. Kein Name, Beruf, weiterer Lebensstatus oder Beziehungszeitraum der Mutter festgelegt.',
  extensions: { chartAlignPartnerOverChildrenPersonId: 'unknown-cyrion-mother' }
});
const unknown = (id, name, sex, familyRole = 'married') => createFamilyPerson({
  id, name, sex, status: 'unknown', birth: '', death: '', houseId: '', familyRole,
  worldPersonId: `person--haus-aurdden--${id}`, portrait: '',
  notes: 'Unbenannte Person; Name, Herkunft und Lebensdaten bleiben offen.',
  extensions: { authoredSource: 'aurdden-20261109', portraitIntentionallyAbsent: true }
});

export const HOUSE_AURDDEN_FAMILY = Object.freeze({
  ...base,
  houses: [...base.houses,
    { id: 'house-loer', name: 'Haus Loer', motto: '', emblem: 'assets/images/houses/Llamreis Ankunft/haus-loer.png', status: 'active' },
    { id: 'house-unknown-cyrwen-aurdden', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unknown-lleirena-aurdden', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' }
  ],
  persons: [
    ...base.persons.map(person => createFamilyPerson({ ...person,
      name: person.sex === 'male' ? 'Unbekannter Gründer' : 'Unbekannte Gründerin',
      worldPersonId: `person--haus-aurdden--${person.id}`,
      notes: 'Unbekannte historische Gründerfigur vor der seriellen Überlieferungslücke; keine direkten Eltern der namentlich ausgearbeiteten Generation.',
      extensions: { portraitIntentionallyAbsent: true }
    })),
    ...AURDDEN_FAMILY_PEOPLE.map(source => {
      const person = createAurddenPerson(source);
      return person.id === 'saithen-aurdden' ? { ...person, extensions: { ...person.extensions,
        chartCenterBetweenPartnerPersonIds: ['perdella-spouse-aurdden', 'unknown-cyrion-mother']
      } } : person;
    }),
    unknown('unknown-cyrwen-aurdden-husband', 'Unbekannter Ehemann Cyrwens', 'male'),
    unknown('unknown-lleirena-aurdden-husband', 'Unbekannter Ehemann Lleirenas', 'male'),
    unknown('unknown-cyrion-mother', 'Unbekannte Mutter Cyrions', 'female', 'affair'),
    AURDDEN_AERON_LOER
  ],
  partnerships: [
    { ...base.partnerships[0], status: 'ended', certainty: 'unknown', notes: 'Unbekanntes historisches Gründerpaar; kein erfundenes Ehejahr.' },
    grandparents, parents, uncle, eldest, second, youngest, cousin, cyrwen, lleirena, affair,
    createAurddenLoerEngagement('haus-loer')
  ],
  parentages: [
    ...createParentages(['heledric-aurdden'], base.partnerships[0].participantIds, base.lineage.founderPartnershipId, {
      type: 'claimed', certainty: 'unknown', notes: 'Familienkontinuität über mehrere unbekannte Generationen; keine direkte biologische Elternschaft.', extensions: { timeJumpId: base.timeJumps[0].id }
    }),
    ...createParentages(['iwrwyn-aurdden', 'oeneth-aurdden'], couples.grandparents, grandparents.id),
    ...createParentages(['kyrwyn-aurdden', 'cyrwen-aurdden', 'thalan-aurdden', 'lleirena-aurdden', 'saithen-aurdden'], couples.parents, parents.id),
    ...createParentages(['pereth-aurdden'], couples.uncle, uncle.id),
    ...createParentages(['avelin-aurdden', 'iwria-aurdden', 'dyrwen-aurdden', 'saithwen-aurdden'], couples.eldest, eldest.id),
    ...createParentages(['kyran-aurdden', 'gwaeden-aurdden', 'janeth-aurdden'], couples.second, second.id),
    ...createParentages(['oenric-aurdden', 'helygen-aurdden', 'thalric-aurdden', 'nerella-aurdden', 'iwrin-aurdden', 'firian-aurdden'], couples.youngest, youngest.id),
    ...createParentages(['cyrion-aurdden-bastard'], couples.affair, affair.id, { legitimacy: 'illegitimate' }),
    ...createParentages(['ellric-aurdden', 'kyria-aurdden', 'neddan-aurdden'], couples.cousin, cousin.id)
  ],
  cadetBranches: [
    createMarriedAwayBranch({ id: 'married-away-cyrwen-aurdden', name: 'Unbekanntes Haus', parentPartnershipId: cyrwen.id,
      houseId: 'house-unknown-cyrwen-aurdden', targetFamilyId: 'haus-unbekannt', notes: 'Cyrwen ist wegverheiratet und besitzt keine Ladenaufgabe.', extensions: { chartAlignBelowPartnership: true } }),
    createMarriedAwayBranch({ id: 'married-away-lleirena-aurdden', name: 'Unbekanntes Haus', parentPartnershipId: lleirena.id,
      houseId: 'house-unknown-lleirena-aurdden', targetFamilyId: 'haus-unbekannt', notes: 'Lleirena ist wegverheiratet und besitzt keine Ladenaufgabe.', extensions: { chartAlignBelowPartnership: true } })
  ],
  timeJumps: [{ ...base.timeJumps[0], childIds: ['heledric-aurdden'], extensions: { preparedPlaceholder: false } }],
  lineage: { ...base.lineage, crestSubtitle: 'Goldschmiede, Juweliere und Bankiers · im Dienst der Loer' },
  view: { ...base.view, limitGenerations: false, focusPersonId: 'kyrwyn-aurdden' },
  extensions: { ...base.extensions, blankFamily: false, preparedTimeJump: false, sourceRevision: 1,
    chartLayoutPolicy: 'strict-v1', chartAlignLineageOriginOverPersonId: 'heledric-aurdden',
    authoredOn: '2026-11-09',
    sourceNote: 'Ausarbeitung der bereits veröffentlichten Aurdden auf ausdrücklichen Nutzerauftrag vom 9. November 2026. Dienst, Gewinnbeteiligung, Loer-Rohstoffe und häufige historische Ehen stammen aus dem bestehenden Modul der Klingenden Münze; die Aurdden besitzen kein Münzprägerecht und leiten nicht die Rote Bank. Namen, Lebensdaten und aktuelle Familienglieder sind autorisierte neue Ausgestaltung. Unbekannte Gründer, Hausknoten und serieller Zeitsprung vor Heledric; vier konkrete Generationen. Drei Brüder im Alter 55/51/46 mit insgesamt dreizehn ehelichen Kindern und Saithens unehelichem Sohn Cyrion. Zwei Schwestern sind an unbekannte Männer wegverheiratet. Nur Avelin ist mit dem bestehenden, zuvor unverheirateten und unverlobten Aeron Loer verlobt, beidseitig unter derselben Welt- und Verbindungskennung. Keine weiteren Loer-Ehen erzwungen. Der Bankzweig führt über Iwrwyns Bruder Oeneth zu dem echten ersten Vetter Pereth und dessen drei ungebundenen Kindern; für diese sieben Bankangehörigen keine Porträts erstellt. Keine Adelserhebung, keine erfundenen historischen Zwischenahnen und keine unbekannten Angehörigen benannt.'
  }
});
