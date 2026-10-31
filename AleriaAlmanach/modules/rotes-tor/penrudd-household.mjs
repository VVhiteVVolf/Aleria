import { PENRUDD_APPEARANCES } from './penrudd-appearances.mjs';
import { TROETZLI_PEOPLE } from '../gwynthor-troetzli/troetzli-household.mjs';

/** Shared identities for the family chart and the inn's developing module. */
export const PENRUDD_MOTTO = 'Ein Platz am Feuer.';
export const PENRUDD_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Bannkreis Gwynthor/Penrudd.png';

export const PENRUDD_HOLDINGS = Object.freeze({
  mapPath: 'Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json',
  inn: Object.freeze({
    pinId: 'gwynthor-marking-080', title: 'Zum Roten Tor',
    location: 'Unmittelbar vor Gwynthors Nordtor',
    household: 'inn', managerId: 'carwyn-penrudd'
  }),
  farm: Object.freeze({
    pinId: 'gwynthor-marking-041', title: 'Penrudd-Hof',
    location: 'Nordnordöstlich des Gasthofs, nahe Owains Anwesen am nördlichen Weg',
    household: 'farm', managerId: 'tudur-penrudd', successorId: 'meurig-penrudd',
    supplies: Object.freeze(['Milch', 'Butter', 'einfacher Käse', 'Eier', 'Geflügel', 'saisonales Gemüse', 'Heu', 'Hafer']),
    livestock: 'Ein überschaubarer Milchviehbestand, einige Schafe sowie Hühner und Gänse; gelegentlich Schlachtvieh.',
    settlement: 'Beide Haushalte führen getrennte Kassen. Regelmäßige Lieferungen werden zu vereinbarten Preisen abgerechnet; Tierfutter, Transport und Verarbeitung bleiben echte Kosten. Schlachtvieh wird durch einen örtlichen Fleischer verarbeitet. Überschüsse gehen an weitere Abnehmer im Umland.',
    ownership: 'Die Familie bewirtschaftet den Hof; ein bestimmter Grundeigentümer oder Pachtvertrag ist bislang nicht festgelegt.'
  })
});

function member(key, givenName, sex, birth, role, household, bio, options = {}) {
  const appearance = PENRUDD_APPEARANCES[key];
  if (!appearance) throw new Error(`Aussehen für Penrudd fehlt: ${key}`);
  return Object.freeze({
    id: `${key}-penrudd`, worldPersonId: `person--haus-penrudd--${key}-penrudd`,
    name: options.spouse ? givenName : `${givenName} Penrudd`,
    sex, birth: String(birth), death: options.death ? String(options.death) : '',
    spouse: Boolean(options.spouse), household, role, bio,
    appearance: appearance.description, culture: appearance.culture,
    hairColor: !options.spouse && Number(birth) > 1674 ? 'braun' : appearance.hair,
    eyeColor: options.spouse ? appearance.eyes : 'braun',
    portraitAge: appearance.portraitAge || 1740-Number(birth),
    portrait: `./assets/rotes-tor/portraits/${key}.png`
  });
}

export const PENRUDD_PEOPLE = Object.freeze([
  member('madoc', 'Madoc', 'male', 1642, 'Früherer Wirt · Vater beider Brüder', 'historical',
    'Führte den bereits bestehenden Familiengasthof. Vater Gwilyms und Tudurs; die unbekannten Generationen vor ihm werden ausschließlich über den Zeitsprung überbrückt. Nicht als gesicherter Urheber der Torgeschichte festgelegt.', { death: 1718 }),
  member('nest', 'Nest', 'female', 1647, 'Frühere Wirtin · Mutter beider Brüder', 'historical',
    'Madocs Gemahlin und Mutter Gwilyms und Tudurs. Versorgte Haushalt und Gäste. Ihr Herkunftshaus ist nicht festgelegt.', { spouse: true, death: 1726 }),

  member('gwilym', 'Gwilym', 'male', 1670, 'Alter Wirt · älterer Familienzweig', 'inn',
    '70 Jahre. Älterer Sohn Madocs und Nests. Hat die Leitung an Carwyn abgegeben, begrüßt Stammgäste und erzählt die Geschichte vom roten Tor bei jeder Gelegenheit etwas anders. Bruder Tudurs, ohne Führungsaufgabe auf dessen Hof.'),
  member('enid', 'Enid', 'female', 1672, 'Altenteil · Vorräte und Einmachen', 'inn',
    '68 Jahre. Gwilyms Gemahlin. Kennt Lieferanten und alte Verpflichtungen, hilft beim Einmachen und behält den Vorratskeller im Blick. Ihr Herkunftshaus bleibt offen.', { spouse: true }),
  member('carwyn', 'Carwyn', 'male', 1694, 'Betreiber · Ausschank und Gäste', 'inn',
    '46 Jahre. Ältester Sohn Gwilyms und Enids. Geduldiger, praktischer Wirt; führt Ausschank, Gästeabsprachen und Einkauf. Vereinbart Lieferungen mit seinem Onkel Tudur und seinem Vetter Meurig.'),
  member('olwen', 'Olwen', 'female', 1697, 'Küche und Hauswirtschaft', 'inn',
    '43 Jahre. Carwyns Gemahlin. Herzlich zu Gästen, bestimmt im Küchenalltag. Führt Küche und Hauswirtschaft; eingeheiratet, ohne festgelegten Geburtsnamen.', { spouse: true }),
  member('aled', 'Aled', 'male', 1716, 'Stall und Wagenhof · nächste Generation', 'inn',
    '24 Jahre. Ältester Sohn Carwyns und Olwens. Verheiratet mit Cerys und Vater des kleinen Rhys. Führt Stall und Wagenhof, fährt zum Hof der Verwandten und kennt Zugtiere besser als die Absichten mancher Gäste.'),
  member('cerys', 'Cerys', 'female', 1718, 'Gästeversorgung und Familienhaushalt', 'inn',
    '22 Jahre. Aleds Gemahlin und Mutter von Rhys. Hilft bei Frühstück und Gästeversorgung; ihre Arbeit wird mit der Betreuung ihres kleinen Kindes abgestimmt. Herkunftsfamilie offen.', { spouse: true }),
  member('rhys', 'Rhys', 'male', 1738, 'Kleinkind · Gwilyms Urenkel', 'inn',
    '2 Jahre. Sohn Aleds und Cerys. Wächst im Familienhaushalt auf und hat keine Arbeitsaufgabe.'),
  member('mared', 'Mared', 'female', 1720, 'Empfang · Zimmer und Rechnungsbuch', 'inn',
    '20 Jahre. Unverheiratete Tochter Carwyns und Olwens. Aufmerksam und trockenhumorig; vergibt Zimmer und führt das Rechnungsbuch. Bei einer späteren Wegverheiratung würde sie den Betrieb verlassen.'),
  member('dewi', 'Dewi', 'male', 1727, 'Jüngster Sohn · kleine Hofdienste', 'inn',
    '13 Jahre. Jüngstes Kind Carwyns und Olwens. Hilft altersgemäß beim Wasserholen und mit kleinen Besorgungen im Hof. Kein vollwertiger Stallknecht; würde am liebsten mit jedem Fuhrmann mitreisen.'),
  member('hywel', 'Hywel', 'male', 1701, 'Keller · Lieferannahme und Instandhaltung', 'inn',
    '39 Jahre. Jüngerer Bruder Carwyns. Ruhiger Handwerker im Familienalltag; prüft Fässer und Lieferungen, hält kleine Schäden in Ordnung und betreut den Keller. Verheiratet mit Ffion.'),
  member('ffion', 'Ffion', 'female', 1704, 'Wäsche und Gästezimmer', 'inn',
    '36 Jahre. Hywels Gemahlin, Mutter Iwans und Eleris. Organisiert Wäsche und Zimmerpflege gemeinsam mit weiteren Bediensteten. Ihr Herkunftshaus bleibt unbekannt.', { spouse: true }),
  member('iwan', 'Iwan', 'male', 1730, 'Kind · Hywels Sohn', 'inn',
    '10 Jahre. Sohn Hywels und Ffions. Beobachtet gerne die Fuhrwerke; kleine Besorgungen ersetzen weder Unterricht noch freie Zeit.'),
  member('eleri', 'Eleri', 'female', 1734, 'Kind · Hywels Tochter', 'inn',
    '6 Jahre. Tochter Hywels und Ffions. Lebhaftes Familienkind ohne feste Arbeitsaufgabe.'),
  member('rhosyn', 'Rhosyn', 'female', 1705, 'Schankstube · Familienhilfe', 'inn',
    '35 Jahre. Jüngste Tochter Gwilyms und Enids, unverheiratet. Schlagfertig und selbstbewusst; arbeitet in der Schankstube und springt an arbeitsreichen Tagen am Empfang ein. Lebt aus eigener Entscheidung im Familienhaushalt.'),

  member('tudur', 'Tudur', 'male', 1674, 'Hofwirt · Gwilyms jüngerer Bruder', 'farm',
    '66 Jahre. Jüngerer Sohn Madocs und Nests. Bewirtschaftet mit seiner Familie den Penrudd-Hof nordnordöstlich der Herberge. Sachlich, wetterkundig und sparsamer mit Worten als Gwilym. Überlässt schwere Arbeit zunehmend seinem Sohn Meurig.'),
  member('bethan', 'Bethan', 'female', 1676, 'Hofhaushalt und Vorräte', 'farm',
    '64 Jahre. Tudurs Gemahlin. Führt den Hofhaushalt und achtet auf Vorräte, Saatgut und die Versorgung der Hofleute. Ihr Herkunftshaus bleibt offen.', { spouse: true }),
  member('meurig', 'Meurig', 'male', 1698, 'Hofnachfolge · Vieh und Feldarbeit', 'farm',
    '42 Jahre. Sohn Tudurs und Bethans, Vetter Carwyns. Verantwortet den täglichen Ablauf auf Weiden und Feldern. Führt die Lieferabsprachen fort, ohne den Gasthof mit kostenlosen Waren zu subventionieren.'),
  member('nia', 'Nia', 'female', 1700, 'Geflügel und Küchengarten', 'farm',
    '40 Jahre. Meurigs Gemahlin und Mutter Gethins, Lowris und Osians. Kümmert sich um Geflügel, Eier und saisonales Gemüse; Herkunftsfamilie nicht festgelegt.', { spouse: true }),
  member('gethin', 'Gethin', 'male', 1719, 'Fuhrwerk · Futter- und Warenlieferungen', 'farm',
    '21 Jahre. Ältester Sohn Meurigs und Nias, unverheiratet. Fährt Lieferungen zur Herberge und zu weiteren Abnehmern, hilft auf dem Feld und lernt die Viehwirtschaft seines Vaters.'),
  member('lowri', 'Lowri', 'female', 1724, 'Jugendliche · Ausbildung im Hofhaushalt', 'farm',
    '16 Jahre. Unverheiratete Tochter Meurigs und Nias. Lernt Gartenbau und Vorratshaltung, hilft unter Anleitung bei Geflügel und Milchverarbeitung. Keine alleinige Verantwortung für einen Arbeitsbereich.'),
  member('osian', 'Osian', 'male', 1729, 'Kind · Meurigs jüngster Sohn', 'farm',
    '11 Jahre. Jüngster Sohn Meurigs und Nias. Hilft altersgemäß mit kleinen Besorgungen und kennt die Tiere des Hofes beim Namen. Kein regulärer Knecht.'),
  member('eluned', 'Eluned', 'female', 1704, 'Milchkammer · Butter und einfacher Käse', 'farm',
    '36 Jahre. Unverheiratete Tochter Tudurs und Bethans, Schwester Meurigs. Führt die Milchkammer und stellt Butter sowie einfachen Käse her. Achtet darauf, dass Lieferungen frisch bleiben; es gibt keine magische Kühlung.'),
  TROETZLI_PEOPLE.esyllt,
]);

export const PENRUDD_MARRIAGES = Object.freeze([
  ['madoc-nest', 'madoc', 'nest', '1668', '1718'],
  ['gwilym-enid', 'gwilym', 'enid', '1692'],
  ['carwyn-olwen', 'carwyn', 'olwen', '1715'],
  ['aled-cerys', 'aled', 'cerys', '1737'],
  ['hywel-ffion', 'hywel', 'ffion', '1728'],
  ['tudur-bethan', 'tudur', 'bethan', '1696'],
  ['meurig-nia', 'meurig', 'nia', '1718']
].map(row => Object.freeze(row)));

export const PENRUDD_DESCENDANTS = Object.freeze([
  ['madoc-nest', ['gwilym', 'tudur']],
  ['gwilym-enid', ['carwyn', 'hywel', 'rhosyn']],
  ['carwyn-olwen', ['aled', 'mared', 'dewi']],
  ['aled-cerys', ['rhys']],
  ['hywel-ffion', ['iwan', 'eleri']],
  ['tudur-bethan', ['meurig', 'eluned', 'esyllt']],
  ['meurig-nia', ['gethin', 'lowri', 'osian']]
].map(([marriage, children]) => Object.freeze({ marriage, children: Object.freeze(children) })));
