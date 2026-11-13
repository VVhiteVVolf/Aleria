import { KYRIA_STUD_ASSIGNMENT } from './caeffyn-aurdden-marriage.js';
// Authored roster shared by genealogy, house content and the jeweller projection.
// Bank relatives deliberately have no commissioned portraits or shop employment.
const FAMILY_ID = 'haus-aurdden';
const PORTRAIT_ROOT = 'assets/images/portraits/haus-aurdden';

function member(id, name, sex, birth, title, notes, options = {}) {
  const { death = '', branch = 'juwelier', spouse = false, shopEmployee = false, portrait = true, ...extra } = options;
  return Object.freeze({ id, name, sex, birth: String(birth), death,
    age: (death ? Number(death) : 1740) - Number(birth), title, notes, branch, spouse, shopEmployee,
    worldPersonId: `person--${FAMILY_ID}--${id}`,
    portrait: typeof portrait === 'string' ? portrait : portrait ? `${PORTRAIT_ROOT}/${id}.png` : '', portraitNeeded: !!portrait,
    ...extra });
}

export const AURDDEN_FAMILY_PEOPLE = Object.freeze([
  member('heledric-aurdden', 'Heledric Aurdden', 'male', 1636, 'Früher Goldschmied der Aurdden',
    'Älteste namentlich ausgearbeitete Generation nach der Überlieferungslücke. Ehemann Lleirwens und Vater Iwrwyns und Oeneths. Seine Söhne begründeten die heute getrennten Juwelier- und Bankzweige.', { death: '1728' }),
  member('lleirwen-spouse-aurdden', 'Lleirwen', 'female', 1640, 'Gemahlin Heledrics',
    'Gemahlin Heledrics und Mutter Iwrwyns und Oeneths. Gehört zur ältesten namentlich ausgearbeiteten Generation. Ihr Herkunftshaus ist nicht festgelegt.', { death: '1731', spouse: true }),
  member('iwrwyn-aurdden', 'Iwrwyn Aurdden', 'male', 1662, 'Verstorbener Vater der drei Juweliersbrüder',
    'Älterer Sohn Heledrics und Lleirwens. Führte mit Brenella den Juwelierzweig; Vater Kyrwyns, Cyrwens, Thalans, Lleirenas und Saithens. Starb 1736, vor seiner Gemahlin.', { death: '1736' }),
  member('brenella-spouse-aurdden', 'Brenella', 'female', 1664, 'Verstorbene Mutter der fünf Geschwister',
    'Gemahlin Iwrwyns und Mutter der drei Brüder und ihrer beiden Schwestern. Starb 1737. Ihr Herkunftshaus ist nicht festgelegt.', { death: '1737', spouse: true }),
  member('kyrwyn-aurdden', 'Kyrwyn Aurdden', 'male', 1685, 'Ältester Bruder · Leitung und Entwurf',
    '55 Jahre. Ältester der drei Brüder, die Gwynthors vornehmsten Juwelier gemeinsam führen. Goldschmied und verantwortlicher Entwerfer für große Loer-Aufträge; mit Avelena verheiratet, Vater von vier Töchtern.', { shopEmployee: true, lineageRole: 'head' }),
  member('cyrwen-aurdden', 'Cyrwen Aurdden', 'female', 1687, 'Wegverheiratete Schwester',
    '53 Jahre. Schwester Kyrwyns, Thalans, Lleirenas und Saithens. An einen unbekannten Ehemann in ein unbekanntes Haus wegverheiratet. Sie arbeitet nicht im Juwelier; Kinder und heutiger Wohnort sind nicht ausgearbeitet.', { marriedAway: true }),
  member('thalan-aurdden', 'Thalan Aurdden', 'male', 1689, 'Zweiter Bruder · Edelsteine und Werkstatt',
    '51 Jahre. Führt die Werkstatt und verantwortet Edelsteinprüfung, Schliff und Fassung. Ehemann Firwens, Vater von zwei Söhnen und einer Tochter. Führt denselben Laden wie seine Brüder.', { shopEmployee: true, lineageRole: 'head' }),
  member('lleirena-aurdden', 'Lleirena Aurdden', 'female', 1692, 'Wegverheiratete Schwester',
    '48 Jahre. Schwester der drei Juweliersbrüder und Cyrwens. An einen unbekannten Ehemann in ein unbekanntes Haus wegverheiratet. Sie besitzt keine Ladenaufgabe; Kinder und heutiger Wohnort bleiben offen.', { marriedAway: true }),
  member('saithen-aurdden', 'Saithen Aurdden', 'male', 1694, 'Jüngster Bruder · Verkauf und Sonderaufträge',
    '46 Jahre. Führt Beratung, Verkauf und die Abstimmung besonderer Kundenwünsche. Mit Perdella verheiratet und Vater von sechs ehelichen Kindern. Aus einer früheren Affäre mit einer unbekannten Frau stammt außerdem sein 22-jähriger Sohn Cyrion.', { shopEmployee: true, lineageRole: 'head' }),
  member('avelena-spouse-aurdden', 'Avelena', 'female', 1688, 'Kundenbetreuung und Auftragsbücher',
    '52 Jahre. Ehefrau Kyrwyns und Mutter Avelins, Iwrias, Dyrwens und Saithwens. Betreut diskrete Kundentermine und die Auftragsbücher. Ihre Herkunftsfamilie ist nicht festgelegt.', { spouse: true, shopEmployee: true }),
  member('firwen-spouse-aurdden', 'Firwen', 'female', 1691, 'Warenprüfung und Präsentation',
    '49 Jahre. Ehefrau Thalans und Mutter Kyrans, Gwaedens und Janeths. Prüft die fertigen Arbeiten vor der Präsentation und betreut die geordnete Warenübergabe. Herkunftshaus und Mädchenname bleiben offen.', { spouse: true, shopEmployee: true }),
  member('perdella-spouse-aurdden', 'Perdella', 'female', 1696, 'Privatkunden und Hausorganisation',
    '44 Jahre. Ehefrau Saithens und Mutter seiner sechs ehelichen Kinder. Betreut Privatkundschaft, Termine und die Organisation des Juwelierhauses. Ihre Herkunftsfamilie ist nicht festgelegt.', { spouse: true, shopEmployee: true }),
  member('avelin-aurdden', 'Avelin Aurdden', 'female', 1713, 'An Aeron Loer wegverlobt',
    '27 Jahre. Älteste Tochter Kyrwyns und Avelenas. Mit dem 28-jährigen Aeron Loer verlobt und für ihren künftigen Haushalt an Haus Loer gebunden. Die Ehe ist noch nicht geschlossen; Avelin hat keine Aufgabe im Juwelier.', { engagedAway: true }),
  member('iwria-aurdden', 'Iwria Aurdden', 'female', 1716, 'Goldschmiedin · Feinarbeit',
    '24 Jahre. Zweite Tochter Kyrwyns und Avelenas. Arbeitet an feinen Goldarbeiten und Oberflächen. Unverheiratet und ohne Verlobung.', { shopEmployee: true }),
  member('dyrwen-aurdden', 'Dyrwen Aurdden', 'female', 1720, 'Schmuckberatung und Präsentation',
    '20 Jahre. Dritte Tochter Kyrwyns und Avelenas. Berät zu tragbarem Schmuck und richtet die Präsentation fertiger Arbeiten. Unverheiratet und ohne Verlobung.', { shopEmployee: true }),
  member('saithwen-aurdden', 'Saithwen Aurdden', 'female', 1726, 'Jüngste Tochter Kyrwyns',
    '14 Jahre. Jüngste Tochter Kyrwyns und Avelenas. Lernt im Familienhaushalt und darf die handwerkliche Ausbildung beobachten; sie besitzt keinen eigenständigen Ladenposten. Unverheiratet und ohne Verlobung.'),
  member('kyran-aurdden', 'Kyran Aurdden', 'male', 1716, 'Edelsteinschleifer',
    '24 Jahre. Älterer Sohn Thalans und Firwens. Arbeitet im Edelsteinschliff unter seinem Vater. Unverheiratet und ohne Verlobung.', { shopEmployee: true }),
  member('gwaeden-aurdden', 'Gwaeden Aurdden', 'male', 1719, 'Silber- und Fassungsarbeiten',
    '21 Jahre. Jüngerer Sohn Thalans und Firwens. Bearbeitet Silber und fertigt Fassungen in der Werkstatt. Unverheiratet und ohne Verlobung.', { shopEmployee: true }),
  member('janeth-aurdden', 'Janeth Aurdden', 'female', 1724, 'Goldschmiedelehrling',
    '16 Jahre. Tochter Thalans und Firwens. Lernt unter Aufsicht die Grundlagen der Goldschmiede und Warenpflege. Unverheiratet und ohne Verlobung.', { shopEmployee: true }),
  member('oenric-aurdden', 'Oenric Aurdden', 'male', 1718, 'Sonderanfertigungen · Geselle',
    '22 Jahre. Ältestes eheliches Kind Saithens und Perdellas. Arbeitet als Geselle an Sonderanfertigungen. Unverheiratet und ohne Verlobung.', { shopEmployee: true }),
  member('helygen-aurdden', 'Helygen Aurdden', 'female', 1721, 'Perlen und Kettenarbeiten',
    '19 Jahre. Zweites Kind Saithens und Perdellas. Arbeitet an Perlschmuck, feinen Ketten und Verschlüssen. Unverheiratet und ohne Verlobung.', { shopEmployee: true }),
  member('thalric-aurdden', 'Thalric Aurdden', 'male', 1723, 'Fassungslehrling',
    '17 Jahre. Drittes Kind Saithens und Perdellas. Lernt Fassungsarbeiten unter Thalan und Gwaeden. Unverheiratet und ohne Verlobung.', { shopEmployee: true }),
  member('nerella-aurdden', 'Nerella Aurdden', 'female', 1726, 'Tochter Saithens und Perdellas',
    '14 Jahre. Viertes Kind Saithens und Perdellas. Lernt im Familienhaushalt; kein eigenständiger Ladenposten. Unverheiratet und ohne Verlobung.'),
  member('iwrin-aurdden', 'Iwrin Aurdden', 'female', 1728, 'Jüngere Tochter Saithens',
    '12 Jahre. Fünftes Kind Saithens und Perdellas. Ihre Ausbildung steht am Anfang; keine Ladenanstellung. Unverheiratet und ohne Verlobung.'),
  member('firian-aurdden', 'Firian Aurdden', 'male', 1730, 'Jüngstes Kind Saithens',
    '10 Jahre. Jüngstes Kind Saithens und Perdellas. Lebt im Familienhaushalt und hat keine Ladenaufgabe. Unverheiratet und ohne Verlobung.'),
  member('cyrion-aurdden-bastard', 'Cyrion', 'male', 1718, 'Unehelicher Sohn Saithens',
    '22 Jahre. Saithens unehelicher Sohn aus einer Affäre mit einer unbekannten Frau. Kein Angehöriger der ehelichen Kinderschar Perdellas, kein Familiennachname und keine Tätigkeit im Juwelier. Unverheiratet und ohne Verlobung.', { bastard: true, hair: 'dunkelbraun' }),
  member('oeneth-aurdden', 'Oeneth Aurdden', 'male', 1665, 'Verstorbener Begründer des Bankzweigs',
    'Jüngerer Sohn Heledrics und Lleirwens und Bruder Iwrwyns. Führte mit Rhewae den Bankzweig der Familie. Vater Pereths; keine Leitung der Roten Bank und kein Münzprägerecht.', { death: '1738', branch: 'bank', portrait: false }),
  member('rhewae-spouse-aurdden', 'Rhewae', 'female', 1666, 'Verstorbene Gemahlin Oeneths',
    'Gemahlin Oeneths und Mutter Pereths. Gehört zum gesonderten Bankzweig. Ihr Herkunftshaus ist nicht festgelegt.', { death: '1739', spouse: true, branch: 'bank', portrait: false }),
  member('pereth-aurdden', 'Pereth Aurdden', 'male', 1688, 'Vetter der Juweliersbrüder · Bankgeschäft',
    '52 Jahre. Sohn Oeneths und Rhewaes, erster Vetter Kyrwyns, Thalans und Saithens. Führt das eigene Bankgeschäft des Aurdden-Zweigs mit seiner Ehefrau Uffyria. Kein Schmuckverkauf, keine Leitung der Roten Bank und kein eigenes Münzprägerecht.', { branch: 'bank', portrait: false }),
  member('uffyria-spouse-aurdden', 'Uffyria', 'female', 1690, 'Bankzweig · Bücher und Korrespondenz',
    '50 Jahre. Ehefrau Pereths und Mutter Ellrics, Kyrias und Neddans. Betreut Bücher und Korrespondenz im Bankzweig. Kein Ladenposten im Juwelier; ihr Herkunftshaus bleibt offen.', { spouse: true, branch: 'bank', portrait: false }),
  member('ellric-aurdden', 'Ellric Aurdden', 'male', 1716, 'Bankzweig · Kontor und Abrechnung',
    '24 Jahre. Ältestes Kind Pereths und Uffyrias. Unterstützt Kontor und Abrechnung des Bankzweigs. Kein Juwelierposten; unverheiratet und ohne Verlobung.', { branch: 'bank', portrait: false }),
  member('kyria-aurdden', 'Kyria Aurdden', 'female', 1721, KYRIA_STUD_ASSIGNMENT.title,
    KYRIA_STUD_ASSIGNMENT.notes, KYRIA_STUD_ASSIGNMENT),
  member('neddan-aurdden', 'Neddan Aurdden', 'male', 1728, 'Jüngstes Kind des Bankvetters',
    '12 Jahre. Jüngster Sohn Pereths und Uffyrias. Lebt im Haushalt des Bankzweigs und besitzt weder Bankamt noch Juwelierposten. Unverheiratet und ohne Verlobung.', { branch: 'bank', portrait: false })
]);

export const AURDDEN_GUARDS = Object.freeze([
  member('hjalrik-stenholm', 'Hjalrik Stenholm', 'male', 1706, 'Aldrimarischer Söldner · Ladenwache',
    '34 Jahre. Blonder Söldner aus Aldrimar, für den Schutz des Verkaufsraums und den Zugang zum Juwelier angestellt. Nicht mit den Aurdden verwandt.', { branch: 'wache', shopEmployee: true, hair: 'blond' }),
  member('bjarne-haldsvik', 'Bjarne Haldsvik', 'male', 1699, 'Aldrimarischer Söldner · Ladenwache',
    '41 Jahre. Blonder Söldner aus Aldrimar, übernimmt wechselnde Wache und den Schutz bei Warenübergaben. Eigenständige Figur und kein Angehöriger der Juwelierfamilie.', { branch: 'wache', shopEmployee: true, hair: 'blond' })
].map(person => Object.freeze({ ...person, worldPersonId: `person--aurdden-wachen--${person.id}` })));

export const AURDDEN_PORTRAIT_PEOPLE = Object.freeze([...AURDDEN_FAMILY_PEOPLE, ...AURDDEN_GUARDS].filter(person => person.portraitNeeded));
