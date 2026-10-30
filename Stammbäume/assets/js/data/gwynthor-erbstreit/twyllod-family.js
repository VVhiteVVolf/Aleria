import { normalizeHouseProfile } from '../../domain/house-profile.js';
import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';
import { createCourtFamily } from './family-foundation.js';
import { COURT_EMBLEMS, EIFION_TWYLLOD, LLEUCU_SWYLL, LLEUCU_SECOND_MARRIAGE, TWYLLOD_CHILDREN, TWYLLOD_CHILD_PARENTAGES } from './case-people.js';
import { TWYLLOD_FARM_PEOPLE, TWYLLOD_FARM_MARRIAGES, TWYLLOD_FARM_PARENTAGES } from './twyllod-farm.js';
import { TWYLLOD_BIOGRAPHY } from './twyllod-biography.js';

const parents = ['cynwrig-twyllod', 'morfudd-spouse-twyllod'];
const arian = 'arian-twyllod';
const eithne = 'eithne-glendower-mother';
const unknownFather = 'unknown-biological-father-glendower';
const glendower = 'glendower-o-cenyr';
const forcedOrigin = 'forced-eithne-unknown-glendower-origin';
const source = 'CharakterDatenbank/records/unzugeordnet/unassigned/glendower-o-cenyr--glendower-o-cenyr/character.json';

export const HOUSE_TWYLLOD_FAMILY = createCourtFamily({
  id: 'haus-twyllod', title: 'Familie Twyllod', emblem: COURT_EMBLEMS.twyllod,
  houseProfile: normalizeHouseProfile({ rankId: 'commoner', kingdom: 'Cenyr', county: 'Celtigerns Wacht',
    barony: 'Llamreis Ankunft', seat: 'Twyllod-Hof', folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Bannkreis Gwynthor'] }),
  description: 'Gewöhnliche einheimische Fischerfamilie aus Gwynthors Bannkreis. Arian Twyllod ist aus Glendower O’Cenyrs Biografie belegt. Sein jüngerer Bruder Eifion arbeitete sich zum Schiffskapitän hoch und heiratete die anerkannte Witwe Lleucu Swyll. Die Familie hat keinen geschönten gemeinsamen Hintergrund: Ihre Ausstoßung Eithnes und Zweifel an deren Schilderung bleiben Teil der Vorgeschichte.',
  firstYear: '1665', roots: [parents[0]],
  sourceRevision: 2, biography: TWYLLOD_BIOGRAPHY,
  people: [
    createFamilyPerson({ id: parents[0], name: 'Cynwrig Twyllod', sex: 'male', birth: '1665', houseId: 'house-twyllod', lineageRole: 'head', title: 'Alter Küstenfischer', notes: 'Vater Arians und Eifions. Die Familiengeschichte umfasst die Ausstoßung Eithnes; individuelle damalige Aussagen werden nicht erfunden.' }),
    createFamilyPerson({ id: parents[1], name: 'Morfudd', sex: 'female', birth: '1668', houseId: '', familyRole: 'married', title: 'Mutter Arians und Eifions', notes: 'Führte den einfachen Fischerhaushalt. Die Verantwortung einzelner Familienmitglieder im Fall Eithne bleibt offen.' }),
    createFamilyPerson({ id: arian, name: 'Arian Twyllod', sex: 'male', birth: '1690', houseId: 'house-twyllod', title: 'Fischer · später auf kriminellen Wegen', notes: 'Eithnes Ehemann, nicht Glendowers biologischer Vater. Hielt das Kind zunächst für sein eigenes; nach Eithnes Offenlegung der erlittenen Vergewaltigung verließ er sie im Zorn. Seine Familie verstieß sie und zweifelte zum Teil ihre Schilderung an. Später geriet Arian auf kriminelle Wege. Sein heutiger Aufenthaltsort und ein Todesdatum sind nicht belegt.', extensions: { sourceCharacterRecord: source } }),
    createFamilyPerson({ id: eithne, name: 'Eithne', sex: 'female', birth: '1691', death: '1730', houseId: '', familyRole: 'married', title: 'Fischersmagd · Glendowers Mutter', notes: 'Die Vorgeschichte folgt Glendowers bestehender Biografie. Nach dem Übergriff eines Unbekannten brachte sie Glendower zur Welt. Lebte nach Arians Weggang von Hilfe und wechselnder Arbeit; ließ ihren fünfjährigen Sohn an einer Kirche zurück. Wurde später von ihm im Bordell erkannt und getötet. Das Geburtsjahr ist eine neue passende Ausarbeitung; der Tod 1730 folgt Glendowers Alter 17 beim Urteil.', extensions: { sourceCharacterRecord: source } }),
    createFamilyPerson({ id: unknownFather, name: 'Unbekannter leiblicher Vater Glendowers', sex: 'male', houseId: '', status: 'unknown', familyRole: 'forced', notes: 'Identität unbekannt. Keine erfundene Affäre oder freiwillige Partnerschaft mit Eithne anlegen.' }),
    createFamilyPerson({ id: glendower, worldPersonId: 'person--glendower-o-cenyr', name: "Glendower O'Cenyr", sex: 'male', birth: '1713', houseId: '',
      portrait: 'https://i.imgur.com/vSRYHg1.png',
      title: 'Paladin · Eithnes Sohn · kein leiblicher Twyllod', notes: '27 Jahre. Eithnes Sohn, leiblicher Vater unbekannt; kein biologischer Twyllod. Arian hielt ihn zunächst für sein Kind und verließ Eithne nach ihrer Offenlegung. Mit fünf von der Mutter zurückgelassen, von Gwalchgwyn Saethwyr ins Waisenheim gebracht; mit dreizehn Bootsjunge. Tötete später seine Mutter, verlor dabei ein Auge und wurde mit siebzehn vor Meurig, Odyar und Gwalchgwyn gerichtet. Nach zehn Jahren Buße heute Paladin im Stab des Patriarchen. Die bestehende Charakterakte, Online-ID, Weihe und Bußgeschichte bleiben erhalten. Die gestrichelte Stieflinie bezeichnet Arians anfängliche soziale Vaterstellung und keine leibliche Abstammung.',
      extensions: { sourceCharacterRecord: source, existingCharacterId: 'glendower-o-cenyr', relationshipToTwyllod: 'mother-married-to-arian; no-biological-descent', registryManagedFields: ['portrait', 'title', 'notes'] } }),
    ...TWYLLOD_FARM_PEOPLE,
    EIFION_TWYLLOD, { ...LLEUCU_SWYLL, familyRole: 'married' }, ...TWYLLOD_CHILDREN
  ],
  partnerships: [
    createMarriage('marriage-cynwrig-morfudd-twyllod', ...parents),
    createMarriage('marriage-arian-eithne-twyllod', arian, eithne, { start: '1711', end: '1713', status: 'ended', notes: 'Arian verließ Eithne nach Glendowers Geburt. Keine belegte förmliche Scheidung behaupten.' }),
    createMarriage(forcedOrigin, unknownFather, eithne, { type: 'forced', status: 'ended', notes: 'Eithne erlitt einen Übergriff durch einen Unbekannten. Dieser Herkunftseintrag bezeichnet ausdrücklich keine Ehe, Affäre oder freiwillige Verbindung; er ordnet allein Glendowers leibliche Herkunft korrekt zu.' }),
    LLEUCU_SECOND_MARRIAGE,
    ...TWYLLOD_FARM_MARRIAGES
  ],
  parentages: [
    ...createParentages([arian, 'meirion-twyllod', EIFION_TWYLLOD.id], parents, 'marriage-cynwrig-morfudd-twyllod'),
    ...createParentages([glendower], [eithne, unknownFather], forcedOrigin, { legitimacy: 'unknown', notes: 'Biologische Herkunft aus der bestehenden Glendower-Biografie. Arian wird ausdrücklich nicht als biologischer Vater eingetragen.' }),
    ...createParentages([glendower], [arian, eithne], 'marriage-arian-eithne-twyllod', {
      idPrefix: 'social-parentage', type: 'step', legitimacy: 'unknown',
      notes: 'Arian ist allein sozialer Vater, Eithne die leibliche Mutter. Gestrichelte Darstellung des damaligen Haushalts; keine Anerkennung oder Adoption erfunden. Die eigene biologische Herkunft bleibt als getrennte Elternschaft vollständig erhalten.',
      extensions: { chartPrimaryParentage: true, socialFatherOnly: arian }
    }),
    ...TWYLLOD_FARM_PARENTAGES,
    ...TWYLLOD_CHILD_PARENTAGES
  ],
  houses: [{ id: 'house-swyll', name: 'Haus Swyll', emblem: COURT_EMBLEMS.swyll, status: 'active' }],
  sourceNote: `Autorenauftrag vom 30.10.2026; Arian, Eithne und Glendowers Vorgeschichte aus ${source}. Twyllod wurde zuvor nur erwähnt, nicht als eigenes Register geführt. Die neue Verwandtschaft und passenden Lebensdaten werden als heutige Ausarbeitung ergänzt. Keine Live-Daten schreiben.`
});
