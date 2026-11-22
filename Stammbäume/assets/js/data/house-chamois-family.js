import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createMarriedAwayBranch, createParentages } from './family-record-builders.js';
import { sourceManagedFields } from './source-family-field-upgrade.js';
import { CHAMOIS_EMBLEM, CHAMOIS_ESTATE, CHAMOIS_FAMILY_ID, CHAMOIS_HOUSE_ID, CHAMOIS_NAME, CHAMOIS_OVERVIEW } from '../../../../shared/chamois/chamois-house.mjs';

const portraitRoot = 'assets/images/portraits/haus-chamois';
const regionRoot = 'assets/images/regions';
const sourceRevision = 8;
const base = createFounderTimeJumpPlaceholderHouseFamily({
  id: CHAMOIS_FAMILY_ID, title: CHAMOIS_NAME, emblem: CHAMOIS_EMBLEM,
  description: CHAMOIS_OVERVIEW,
  houseProfile: {
    rankId: 'knight-simple', seat: 'Gwynthor', barony: 'Llamreis Ankunft', county: 'Celtigerns Wacht', kingdom: 'Cenyr',
    liegeHouseId: 'house-gafyr', liegeHouseName: 'Haus Gafyr',
    regionEmblems: {
      seat: `${regionRoot}/gwynthor.png`, barony: `${regionRoot}/llamreis-ankunft.png`,
      county: `${regionRoot}/celtigerns-wacht.png`, kingdom: `${regionRoot}/koenigreich-cenyr.png`
    }
  },
  toYear: '1644', timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis Thalric'
});

function member(givenName, birth, hairColor, clothing, options = {}) {
  const id = `${givenName.toLowerCase()}-chamois`;
  const { sex = 'male', title = '', death = '', lineageRole = 'branch', portraitVersion = 1, sourcePortrait = false, notes = '' } = options;
  return createFamilyPerson({
    id, name: `${givenName} Chamois`, houseId: CHAMOIS_HOUSE_ID, sex, title, lineageRole, notes,
    birth: String(birth), death: death ? String(death) : '',
    portrait: `${portraitRoot}/${id}-v${portraitVersion}.${sourcePortrait ? 'png' : 'webp'}`,
    extensions: { appearance: { eyeColor: 'grün', hairColor, clothing } }
  });
}

const firena = member('Firena', 1641, 'grau', 'zivil', {
  sex: 'female', death: 1718, notes: 'Thalrics ältere Schwester heiratete im Alter von 26 Jahren in ein anderes Haus. In ihrer Stube bewahrte sie ein Buch mit Liedern aus ihrer Kindheit auf.'
});
const ancestor = member('Thalric', 1644, 'weiß', 'zivil', { death: 1732, lineageRole: 'mainline' });
const ellan = member('Ellan', 1650, 'weiß', 'zivil', {
  death: 1739, notes: 'Thalrics jüngerer Bruder starb 1739 mit 89 Jahren. Zu Lebzeiten erkannte Ellan seine Verwandten oft schon am Schritt im Flur.'
});
const firen = member('Firen', 1676, 'grau', 'Eigene Reiserüstung', {
  portraitVersion: 3, notes: 'Ellans Sohn zieht als fahrender Ritter von Hof zu Hof. Der Lebemann mag lange Abende am Wirtshaustisch und merkt sich jeden Wirt beim Namen. Über seinem eigenen Harnisch trägt er auf Reisen einen rostroten Mantel.'
});
const dyror = {
  ...member('Dyror', 1706, 'braun', 'Schlichte Gafyr-Rüstung', {
    portraitVersion: 3, notes: 'Dyror ist Firens Sohn aus einer Affäre. Er dient den Gafyr als Waffenknecht und trägt ihre schlichte Rüstung ohne Emblem.'
  }),
  name: 'Dyror', houseId: '', familyRole: 'bastard'
};
const abaelor = member('Abaelor', 1670, 'grau', 'Rüstung', { title: 'Oberhaupt', lineageRole: 'head', sourcePortrait: true });
const perwyn = member('Perwyn', 1670, 'grau', 'Rüstung', { sourcePortrait: true });
const gwaedric = member('Gwaedric', 1675, 'grau', 'zivil');
const uwchyr = member('Uwchyr', 1676, 'braun', 'zivil', { portraitVersion: 2 });

const helric = member('Helric', 1695, 'braun', 'Rüstung', {
  death: 1720, notes: 'Abaelors ältester Sohn verwahrte die Briefe seiner Brüder in einem Lederfutteral. Er fiel mit 25 Jahren im Großen Krieg.'
});
const lleuen = member('Lleuen', 1696, 'braun', 'zivil', { title: 'Erbe', lineageRole: 'mainline' });
const dyreth = member('Dyreth', 1699, 'braun', 'Rüstung', {
  death: 1720, notes: 'Dyreth pfiff auf langen Märschen immer dieselbe Melodie. Er fiel mit 21 Jahren im Großen Krieg.'
});
const iwrban = member('Iwrban', 1704, 'braun', 'zivil', {
  notes: 'Abaelors jüngster Sohn ist ledig. Für die Kinder der Familie schnitzt er Tiere aus Obstholz, die er wirklichen Tieren aus dem Bannkreis nachempfindet.'
});
const avelwen = member('Avelwen', 1721, 'braun', 'Rüstung', {
  sex: 'female', notes: 'Lleuens älteste Tochter ist Ritterin. Wegen ihrer Schönheit und ihres sicheren Auftretens nennt die Familie sie das Juwel der Chamois. Ihr entgeht selten, wer bei einer Gesellschaft übersehen wird.'
});
const neddor = member('Neddor', 1722, 'braun', 'Rüstung', { title: 'Erbe nach Lleuen', lineageRole: 'mainline', portraitVersion: 2 });
const cyran = member('Cyran', 1728, 'braun', 'Knappentracht', { sourcePortrait: true });

const brenae = member('Brenae', 1695, 'braun', 'Hofkleidung', {
  sex: 'female', notes: 'Perwyns älteste Tochter ist Hofdame. Sie weiß, wann sich bei Tisch eine heikle Bitte vorbringen lässt, und bewahrt die Briefe ihrer Schwestern in einer eigenen Lade.'
});
const rhewella = member('Rhewella', 1696, 'braun', 'Hofkleidung', {
  sex: 'female', notes: 'Jannwens Zwillingsschwester begleitet ihre Herrin als Hofdame auf Reisen. Von jedem Aufenthalt bringt sie ein neues Muster für ihre Stickarbeiten mit.'
});
const jannwen = member('Jannwen', 1696, 'braun', 'Hofkleidung', {
  sex: 'female', notes: 'Rhewellas Zwillingsschwester ist Hofdame. Bei Empfängen erinnert sie sich auch an die Namen der Gäste, die selten zu Wort kommen.'
});
const saithan = member('Saithan', 1697, 'braun', 'Rüstung', { portraitVersion: 2 });
const cyrban = member('Cyrban', 1722, 'braun', 'Rüstung', {
  notes: 'Saithans ältester Sohn markiert sich mit Kreide die Schritte auf den Hofplatten, wenn er eine neue Übung lernen will.'
});
const nerella = member('Nerella', 1724, 'braun', 'Rüstung', { sex: 'female', portraitVersion: 2 });
const peran = member('Peran', 1730, 'braun', 'Pagentracht', {
  portraitVersion: 2, notes: 'Saithans jüngster Sohn trägt Pagentracht. Er merkt sich den Weg zu einem Zimmer anhand der Stufen, die dorthin führen.'
});

const kyrban = member('Kyrban', 1701, 'braun', 'zivil');
const rhydeth = member('Rhydeth', 1704, 'braun', 'geistliches Gewand', {
  notes: 'Rhydeth ist Geistlicher der Alerischen Kirche. Im Winter liest er Kranken aus ihren Briefen vor. Seine kleine Leselupe trägt er dafür bei sich.'
});
const lleirys = member('Lleirys', 1707, 'braun', 'Hofkleidung', {
  sex: 'female', notes: 'Mit 33 ist Lleirys ledig und tritt am Hof der Gafyr als Bardin auf. Ihre Lieder sammelt sie in den Werkstätten und Küchen Gwynthors.'
});
const sairwen = member('Sairwen', 1727, 'braun', 'Knappentracht', { sex: 'female' });
const iwrwyn = member('Iwrwyn', 1733, 'braun', 'Pagentracht');

const thalyr = member('Thalyr', 1701, 'braun', 'Rüstung', {
  death: 1720, notes: 'Von Uwchyrs Sohn blieb eine Gämse, die er in den Deckel seiner Reisekiste geritzt hatte. Er fiel mit 19 Jahren im Großen Krieg.'
});
const uffyrena = member('Uffyrena', 1704, 'braun', 'zivil', { sex: 'female' });
const helygys = member('Helygys', 1708, 'braun', 'zivil', { sex: 'female' });

const founders = base.persons.map(person => createFamilyPerson({
  ...person, name: person.sex === 'female' ? 'Unbekannte Gründerin' : 'Unbekannter Gründer',
  title: '', status: 'dead', death: '',
  notes: 'Name und Lebensdaten der Gründerfigur sind nicht überliefert.'
}));
const founderMarriage = { ...base.partnerships[0], status: 'ended', certainty: 'unknown', notes: '' };
const earlyGeneration = [firena, ancestor, ellan];
const initialGap = base.timeJumps[0];
const gap = withUpdatedSourceFields({
  ...initialGap, childIds: earlyGeneration.map(person => person.id), fromYear: '', toYear: firena.birth,
  label: 'Nicht einzeln überlieferte Generationen bis zu Thalric und seinen Geschwistern',
  extensions: { preparedPlaceholder: false }
}, ['childIds', 'toYear', 'label'], { childIds: [[ancestor.id]], toYear: [initialGap.toYear], label: [initialGap.label] });

const families = [
  { person: firena, year: '1667', end: firena.death, children: [], marriedAway: true },
  { person: ancestor, year: '1669', end: ancestor.death, children: [abaelor, perwyn, gwaedric, uwchyr] },
  { person: ellan, year: '1675', end: ellan.death, previousMarriageFields: { status: ['active'], end: [''] }, children: [firen], continuingChild: firen },
  { person: abaelor, year: '1695', children: [helric, lleuen, dyreth, iwrban], continuingChild: lleuen },
  { person: perwyn, year: '1695', previousMarriageFields: { start: ['1698'] }, children: [brenae, rhewella, jannwen, saithan], continuingChild: saithan },
  { person: gwaedric, year: '1700', children: [kyrban, rhydeth, lleirys], continuingChild: kyrban },
  { person: uwchyr, year: '1701', previousMarriageFields: { start: ['1703'] }, children: [thalyr, uffyrena, helygys], alignChildGroup: true },
  { person: lleuen, year: '1721', previousMarriageFields: { start: ['1722'] }, children: [avelwen, neddor, cyran], alignChildGroup: true },
  { person: saithan, year: '1722', previousMarriageFields: { start: ['1724', '1723'] }, children: [cyrban, nerella, peran], alignChildGroup: true },
  { person: kyrban, year: '1726', children: [sairwen, iwrwyn], alignChildGroup: true },
  { person: brenae, year: '1729', children: [], marriedAway: true },
  { person: rhewella, year: '1733', children: [], marriedAway: true },
  { person: jannwen, year: '1737', children: [], marriedAway: true },
  { person: uffyrena, year: '1731', children: [], marriedAway: true },
  { person: helygys, year: '1736', children: [], marriedAway: true }
].map(({ person, year, end, children, marriedAway, alignChildGroup, continuingChild, previousMarriageFields }) => {
  const partner = createFamilyPerson({
    id: `partner-${person.id}`, name: 'Unbekannter Partner',
    worldPersonId: `person--${CHAMOIS_FAMILY_ID}--partner-${person.id}`,
    sex: marriedAway ? 'male' : 'female', houseId: '', familyRole: 'married',
    extensions: { portraitIntentionallyAbsent: true }
  });
  const marriage = createMarriage(`marriage-${person.id}`, person.id, partner.id, {
    start: year, end, status: end ? 'ended' : 'active',
    extensions: {
      minimumAgeAtMarriage: 25,
      ...(continuingChild ? {
        chartAlignParentPairOverChildPersonId: continuingChild.id,
        chartPackLeafSiblingBranchesBesideAlignedChild: true
      } : {}),
      ...(alignChildGroup ? { chartAlignChildGroupBelowParentPair: true } : {}),
      ...(person === saithan ? {
        registryManagedExtensionFields: ['chartAlignParentPairOverChildPersonId'],
        registryManagedExtensionFieldRevisions: { chartAlignParentPairOverChildPersonId: sourceRevision }
      } : {})
    }
  });
  return {
    person, partner, children, marriedAway,
    marriage: previousMarriageFields ? withUpdatedSourceFields(marriage, Object.keys(previousMarriageFields), previousMarriageFields) : marriage
  };
});

// Only replace former authored defaults when opening an earlier local copy.
function withUpdatedSourceFields(entity, fields, previousValues = {}) {
  return {
    ...entity,
    extensions: sourceManagedFields({ ...entity.extensions, registryManagedFieldPreviousValues: previousValues }, fields, sourceRevision)
  };
}

const previousPortrait = (person, version = 1) => [`${portraitRoot}/${person.id}-v${version}.webp`];
const previousPersonFields = {
  [ellan.id]: { death: [''], status: ['alive'], notes: ['Thalrics jüngerer Bruder. Ellan erkennt seine Verwandten oft schon am Schritt im Flur.'] },
  [firen.id]: { portrait: [...previousPortrait(firen), ...previousPortrait(firen, 2)], notes: ['Ellans Sohn gehört zur selben Generation wie Perwyn. Beim Brettspiel merkt er sich lieber die Züge seiner Gegner als den eigenen Gewinn.'] },
  [dyror.id]: { portrait: [...previousPortrait(dyror), ...previousPortrait(dyror, 2)] },
  [perwyn.id]: { birth: ['1673'] },
  [uwchyr.id]: { birth: ['1677'] },
  [lleuen.id]: { birth: ['1697'] },
  [saithan.id]: { birth: ['1699', '1698'] },
  [dyreth.id]: { portrait: previousPortrait(dyreth, 2) },
  [avelwen.id]: { birth: ['1722'], portrait: previousPortrait(avelwen, 2) },
  [neddor.id]: { birth: ['1723'], portrait: previousPortrait(neddor, 3) },
  [brenae.id]: { birth: ['1702'], portrait: previousPortrait(brenae, 2) },
  [rhewella.id]: { birth: ['1705'], portrait: previousPortrait(rhewella, 2), notes: ['Als Hofdame begleitet Rhewella ihre Herrin auf Reisen. Von jedem Aufenthalt bringt sie ein neues Muster für ihre Stickarbeiten mit.'] },
  [jannwen.id]: { birth: ['1710'], portrait: previousPortrait(jannwen, 2), notes: ['Perwyns jüngste Tochter ist Hofdame. Bei Empfängen erinnert sie sich auch an die Namen der Gäste, die selten zu Wort kommen.'] },
  [cyrban.id]: { birth: ['1723'], portrait: previousPortrait(cyrban, 2), notes: [`${cyrban.notes} Er kam im Jahr vor der Heirat seiner Eltern zur Welt.`] },
  [peran.id]: { portrait: previousPortrait(peran, 1) },
  [thalyr.id]: { birth: ['1700'], notes: ['Uwchyrs Sohn kam vor der Heirat seiner Eltern zur Welt. Von ihm blieb eine Gämse, die er in den Deckel seiner Reisekiste geritzt hatte. Er fiel mit 20 Jahren im Großen Krieg.'] }
};

const affairPartner = createFamilyPerson({
  id: 'partnerin-firen-chamois', name: 'Unbekannte Partnerin', sex: 'female',
  worldPersonId: `person--${CHAMOIS_FAMILY_ID}--partnerin-firen-chamois`, houseId: '', familyRole: 'affair',
  extensions: { portraitIntentionallyAbsent: true }
});
const firenAffair = createMarriage('affair-firen-chamois', firen.id, affairPartner.id, {
  type: 'affair', status: 'ended', start: '1705',
  extensions: { chartAlignParentPairOverChildPersonId: dyror.id }
});

const persons = [...founders, ...earlyGeneration, ...families.flatMap(({ partner, children }) => [partner, ...children]), affairPartner, dyror].map(person => {
  const previousValues = previousPersonFields[person.id];
  const updated = previousValues ? withUpdatedSourceFields(person, Object.keys(previousValues), previousValues) : person;
  if (person.id !== firen.id) return updated;
  return { ...updated, extensions: {
    ...updated.extensions, registryManagedExtensionFields: ['appearance'], registryManagedExtensionFieldRevisions: { appearance: sourceRevision }
  } };
});

const correctedParentages = new Set([thalyr.id, cyrban.id]);
const parentages = families.flatMap(({ marriage, children }) => createParentages(children.map(child => child.id), marriage.participantIds, marriage.id)).map(parentage => (
  correctedParentages.has(parentage.childId) ? withUpdatedSourceFields(parentage, ['legitimacy', 'notes']) : parentage
));

const outgoing = families.filter(({ marriedAway }) => marriedAway).map(({ person, marriage }) => ({
  person, marriage, houseId: `house-unbekannt-${person.id}`
}));

export const HOUSE_CHAMOIS_FAMILY = Object.freeze({
  ...base,
  houses: [...base.houses, ...outgoing.map(({ houseId }) => ({ id: houseId, name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' }))],
  persons,
  partnerships: [founderMarriage, ...families.map(({ marriage }) => marriage), firenAffair],
  parentages: [
    ...createParentages(earlyGeneration.map(person => person.id), founderMarriage.participantIds, founderMarriage.id, {
      type: 'claimed', certainty: 'unknown',
      notes: 'Überlieferter Familienzusammenhang über mehrere nicht einzeln bekannte Generationen.',
      extensions: { timeJumpId: gap.id }
    }),
    ...parentages,
    ...createParentages([dyror.id], firenAffair.participantIds, firenAffair.id, { legitimacy: 'illegitimate' })
  ],
  cadetBranches: outgoing.map(({ person, marriage, houseId }) => createMarriedAwayBranch({
    id: `wegverheiratet-${person.id}`, name: 'Unbekanntes Haus', parentPartnershipId: marriage.id,
    subtitle: 'Wegverheiratet', houseId, targetFamilyId: 'haus-unbekannt', crestFrame: 'iron',
    notes: 'Diese Linie wird im Stammbaum der Chamois nach der Heirat nicht weitergeführt.',
    extensions: { chartAlignBelowPartnership: true }
  })),
  timeJumps: [gap],
  lineage: { ...base.lineage, crestSubtitle: 'Ritterfamilie · Castell Chamois', crestFrame: 'silver' },
  view: { ...base.view, focusPersonId: ancestor.id, limitGenerations: false },
  extensions: {
    ...base.extensions, blankFamily: false, sourceRevision, chartLayoutPolicy: 'strict-v1',
    chartAlignLineageOriginOverPersonId: ancestor.id,
    seatPinId: CHAMOIS_ESTATE.pinId,
    sourceNote: 'Nutzerauftrag vom 22.11.2026. Ausbau der Geschwistergruppen, der Gefallenen von 1720 und der Wegheiraten. Thalrics Geschwister Firena und Ellan ergänzen die erste belegte Generation. Ellans Sohn Firen hat aus der ausdrücklich vorgegebenen Affäre den Sohn Dyror. Namen und Lebensjahre sind redaktionelle Ergänzungen nach dem Rheunwaith-Namensarchiv. Die gelieferten Porträts zeigen Abaelor, Cyran und Perwyn. Besitz und das künftige Lehen sind im Rollenspiel offen.'
  }
});
