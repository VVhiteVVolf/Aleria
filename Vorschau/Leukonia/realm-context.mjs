import { IMPERIAL_TERRITORIAL_RULES, IMPERIAL_APPOINTMENT_PROPOSALS } from './imperial-territorial-rules.mjs';

/** Active user amendments take precedence over the retained earlier source account. */
export const REALM_CONTEXT = {
  title: 'Leukonia',
  subtitle: 'Provinz des Kaiserreiches Argentum',
  empireTitle: 'Kaiserreich Argentum',
  introduction: 'Leukonia ist eine der drei großen Provinzen des Silbernen Kaiserreiches. Seine zunächst lockeren Stadtstaaten wurden von Shirazad und Phalantia bedrängt und tyrannisiert, ehe Zuwanderer und Befreier aus dem älteren Vardentia ihre Fremdherrschaft brachen.',
  summary: 'Die gemeinsame Geschichte beginnt im östlichen Vardentia. Von dort wanderten Menschen nach Leukonia und befreiten dessen Stadtstaaten. Nach der späteren Zugehörigkeit zum Alerischen Kaiserreich gingen Vardentia und Leukonia nach dessen Zerfall im Kaiserreich Argentum auf.',
  scope: 'Lokaler Arbeitsentwurf · Leukonia mit fünf aktiven Festlandarchonaten und 26 Orten. Die südliche Insel bleibt vorerst ausgenommen.',
  history: [
    {
      id: 'proto-alben',
      title: 'Die ersten Menschen und ihre Reiche',
      text: 'Die Alben beziehungsweise Proto-Alben sind die ersten Menschen Alerias. Aus ihnen entstanden albische Fürstentümer. Einige Gruppen lösten sich früh als eigenständige Königreiche und Volksgruppen, während andere näher am albischen König blieben.',
    },
    {
      id: 'albath-argonath',
      title: 'Albath und Argonath',
      text: 'Albath, die sogenannten Weißalben, und Argonath gehören zum frühen albischen Erbe Argentums. Außerhalb des Königreiches der Alben entwickelten sie eigene Kulturen und Sprachen. Im östlichen Vardentia wuchs der ältere Ausgangsraum heran; von hier wanderten später Menschen nach Leukonia.',
    },
    {
      id: 'leukonia-silverant',
      title: 'Vardentia und die Befreiung Leukonias',
      text: 'Im Osten blühte Vardentia auf. Von dort wanderten Menschen nach Westen in das heutige Leukonia. Dort bestanden lose verbundene Stadtstaaten, die von Shirazad und Phalantia tyrannisiert wurden. Die Vardentier befreiten diese Städte und ließen sich in ihrem Land nieder. Später gehörten beide Länder zum Alerischen Kaiserreich.',
    },
    {
      id: 'argentum',
      title: 'Das Silberne Kaiserreich',
      text: 'Nach dem Zerfall des großen Alerischen Kaiserreiches ergriff Vardentia die Initiative zur Bildung einer neuen imperialen Ordnung. Vardentia und das zuvor befreite Leukonia gingen im Kaiserreich Argentum auf. Das Silberne Kaiserreich etablierte sich im entstandenen Machtvakuum rasch als Großmacht.',
    },
    {
      id: 'tlapatlan',
      title: 'Die Inseln der Tlapanui',
      text: 'Die Vorfahren der Tlapanui stammen aus Sundara. Das freundliche, recht friedvolle Inselvolk nannte sein Land Tlapatlan und betrieb seit jeher Handel mit seinen Nachbarn. Seine kulturellen Vorbilder sind Rapa Nui sowie indigene Azteken und Maya.',
    },
    {
      id: 'calidaria',
      title: 'Von Tlapatlan zu Calidaria',
      text: 'Für Waren, die auf Tlapatlan nicht zugänglich waren, ließen sich die Tlapanui vom Kaiserreich annektieren. Das Reich benannte das Archipel in Calidaria um. Mit der Zeit wurden die Inseln integriert; heute besteht dort ein Mischvolk aus Argentern und Tlapanui.',
    },
  ],
  provinces: [
    { id: 'leukonia', name: 'Leukonia', text: 'Aus lockeren Stadtstaaten hervorgegangen, die von Vardentiern von der Tyrannei Shirazads und Phalantias befreit wurden. Diese Großprovinz bildet den Schwerpunkt der Vorbereitung.' },
    { id: 'silverant', name: 'Vardentia', text: 'Der ältere östliche Ausgangsraum. Von hier kamen die Zuwanderer und Befreier Leukonias; nach dem Zerfall des alten Reiches ging von hier die Bildung Argentums aus.' },
    { id: 'calidaria', name: 'Calidaria', text: 'Das vom Reich umbenannte Archipel hieß bei den Tlapanui Tlapatlan. Heute leben dort Argenter und Tlapanui als Mischvolk.' },
  ],
  government: {
    title: 'Kaiseramt und Senat',
    text: 'Argentum besitzt ein imperiales System und wird von einem Kaiser regiert, gegenwärtig einer Kaiserin. Ein Senat vereint wichtige Posten des Reiches. Das frühere höchste politische Amt des Konsuls wurde wegen der Monarchie abgeschafft.',
    senateNote: 'Die drei Prokonsule besitzen automatisch hohe Senatssitze. Auch die Archone sind automatisch Senatoren. Die Gesamtzahl des Senats ist noch nicht festgelegt.',
  },
  administration: {
    chain: [
      { title: 'Kaiseramt', text: 'An der Spitze des Reiches steht gegenwärtig eine Kaiserin.' },
      { title: 'Prokonsul · Großprovinz', text: 'Drei Prokonsule regieren Leukonia, Vardentia und Calidaria. Ihnen unterstehen die Archone ihrer Provinz.' },
      { title: 'Archon · Archonat', text: 'Ein Archon ist ein sesshafter Adliger seiner großen Region innerhalb der Großprovinz. Sein Adelsrang entspricht dem eines Grafen; die örtliche Ausübung von Aufgaben kann er Familien übertragen.' },
    ],
    localPosts: [
      { title: 'Präfekt', text: 'Verwaltet eine größere Region. Der Vergleich mit Baron oder Ritterfürst beschreibt seine Stellung; es handelt sich um ein staatliches Amt.' },
      { title: 'Magistrat', text: 'Regiert eine einzelne Stadt und ihren Bannkreis als staatlicher Amtsträger.' },
    ],
    appointments: 'Präfekt und Magistrat sind nicht erblich. Der Archon entscheidet über Fortführung oder Neuvergabe; der Kaiser kann auf bestimmten Amtsführungen insistieren. Beauftragte Familien erhalten ihre Befugnisse aus dem Amt, während ihr Familienrang davon getrennt bleibt.',
    note: 'Unter dem Archon bestehen keine weiteren Adelsränge. Präfekt und Magistrat sind Verwaltungsposten; eine feste Weisungskette zwischen diesen beiden Ämtern ist nicht festgelegt. Der Größenvergleich von Provinzen mit Grafschaften bleibt neben den drei Großprovinzen und ihren Archonaten begrifflich offen.',
  },
  territorialRules: IMPERIAL_TERRITORIAL_RULES,
  appointmentProposals: IMPERIAL_APPOINTMENT_PROPOSALS,
  nobility: [
    { id: 'archon', title: 'Archon', role: 'Adliger einer Region im Rang eines Grafen.', type: 'Adelsrang', note: 'Kontrolliert ein Archonat, untersteht dem Prokonsul und ist automatisch Senator.' },
  ],
  offices: [
    { id: 'prokonsul', title: 'Prokonsul', role: 'Gouverneur einer gesamten Großprovinz.', type: 'Staatsamt', note: 'Drei Sitze: Leukonia, Vardentia und Calidaria. Automatischer hoher Senatssitz; oft mit einem weiteren Amt verbunden.' },
    { id: 'legat', title: 'Legat', role: 'Oberster militärischer Führer und Marschall des Reiches.', type: 'Staatsamt', note: '' },
    { id: 'quaestor', title: 'Quästor', role: 'Oberster Verwalter und Kämmerer.', type: 'Staatsamt', note: 'Jedem Quästor sind genau fünf Aedile zugeordnet. Auch der Nauticus steht unter ihm.' },
    { id: 'praetor', title: 'Prätor', role: 'Oberster Vorsteher der Justiz und Justiziar.', type: 'Staatsamt', note: 'Leitet zugleich die Judikatur des Othorin.' },
    { id: 'magus', title: 'Magus', role: 'Oberster Magier oder Zauberer.', type: 'Staatsamt', note: '' },
    { id: 'pontifex', title: 'Pontifex', role: 'Ranghöchster Geistlicher der staatseigenen Celestischen Synode.', type: 'Staatsamt', note: '' },
    { id: 'herold', title: 'Herold', role: 'Oberster Würdenträger des Reiches.', type: 'Staatsamt', note: '' },
    { id: 'speculatores', title: 'Speculatores', role: 'Oberster Verantwortlicher für Geheimhaltung und Spionage.', type: 'Staatsamt', note: '' },
    { id: 'artifex', title: 'Artifex', role: 'Oberster Verantwortlicher für Bildung, Kultur und Unterhaltung.', type: 'Staatsamt', note: 'Die Kaiserliche Universität untersteht diesem Amt.' },
    { id: 'aedil', title: 'Aedil', role: 'Sonderrang der Verwaltung unter dem Quästor.', type: 'Verwaltungsamt', note: 'Genau fünf Aedile je Quästor. Die Aedilsposten bilden die höchsten Posten von Avrum Divanas.' },
    { id: 'volkstribun', title: 'Volkstribun', role: 'Vom Volk gewählter Repräsentant des gesamten Volkes.', type: 'Volksvertretung', note: 'Einmaliges jährliches Vetorecht. Reichweite und Wirkungsdauer sind noch nicht festgelegt.' },
    { id: 'nauticus', title: 'Nauticus', role: 'Oberster Verantwortlicher für Seefahrt und Außenhandel, Handel und Häfen.', type: 'Staatsamt', note: 'Wichtiger Posten unter dem Quästor.' },
    { id: 'honor-custus', title: 'Honor Custus', role: 'Sonderposten für die Liktorengarde, die Leibgarde der kaiserlichen Familie.', type: 'Sonderamt', note: 'Die Garde untersteht allein dem Kaiseramt. Legat und Quästor besitzen keine Befehlsgewalt über sie; auch das abgeschaffte Konsulamt begründet keine solche Gewalt.' },
  ],
  institutions: [
    { id: 'judikatur-des-othorin', name: 'Judikatur des Othorin', kind: 'Kaiserliche Judikative', description: 'Verantwortet das Justizsystem des Reiches.', leadership: 'Die Leitung ist zugleich der Prätor des Kaisers.' },
    { id: 'hetaeren-der-lytheris', name: 'Hetären der Lytheris', kind: 'Klerikale Institution', description: 'Priesterschaft der Lytheris für Unterhaltung und Prostitution im klerikalen Sinne sowie deren Organisation im Land.', leadership: 'Die oberste geistliche Priesterin der Lytheris leitet das Institut.' },
    { id: 'forum-des-tharistos', name: 'Forum des Tharistos', kind: 'Kaiserliche Handelskammer', description: 'Die Regulierung orientiert sich an dieser Handelskammer.', leadership: 'Die Leitung ist zugleich der Quästor beziehungsweise Kämmerer des Kaisers.' },
    { id: 'kaiserliche-universitaet', name: 'Kaiserliche Universität', kind: 'Akademische Institution', description: 'Die akademische Institution des Reiches.', leadership: 'Sie untersteht dem Artifex.' },
    { id: 'venaim-rogare-thedros', name: 'Venaim Rogare Thedros', kind: 'Klerikale Institution', description: 'Verantwortet die kaiserliche Resozialisierung und das Sozialsystem.', leadership: 'Leitung durch den höchsten Geistlichen des Thedros.' },
    { id: 'sepulcretum-kharos', name: 'Sepulcretum Kharos', kind: 'Klerikales Bestattungsinstitut', description: 'Das Bestattungsinstitut des Reiches.', leadership: 'Leitung durch den obersten Geistlichen des Kharos.' },
    { id: 'mardrans-contubernium', name: 'Mardrans Contubernium', kind: 'Militärische Institution', description: 'Militärsystem, Wehrpflicht, Einbürgerung, Dienst, Pensionierung und Legionssystem.', leadership: 'Der Legat führt den höchsten Rang.' },
    { id: 'avrum-divanas', name: 'Avrum Divanas', kind: 'Wirtschaftliche Institution', description: 'Verantwortet Wirtschaft sowie Agrar- und Viehsystem.', leadership: 'Die höchsten Posten sind die Aedilsposten.' },
    { id: 'auspicium-ordeus', name: 'Auspicium Ordeus', kind: 'Klerikale Institution', description: 'Zeremonien, Krönung, Salbung und Auspizien.', leadership: 'Leitung durch den obersten Priester des Ordeus.' },
    { id: 'orbus-qui-mariella', name: 'Orbus qui Mariella', kind: 'Karitatives Waiseninstitut', description: 'Waisenheim der Mariella und karitative Arbeit.', leadership: 'Leitung durch den obersten Priester der Mariella.' },
  ],
  military: [
    { id: 'legio', name: 'Legio', description: 'Eine Legion mit 4.000 bis 6.000 Mann.' },
    { id: 'exerte', name: 'Exerte', description: 'Das Aufgebot eines Archonats.' },
    { id: 'kohorte', name: 'Kohorte', description: 'Das Aufgebot einer Stadt.' },
    { id: 'zenturie', name: 'Zenturie', description: 'Das Aufgebot einer kleinen Stadt oder Siedlung.' },
    { id: 'manipel', name: 'Manipel', description: 'Eine Einheit innerhalb einer Zenturie mit 20 bis 40 Mann.' },
    { id: 'turma', name: 'Turma', description: 'Eine irreguläre Einheit, oft das Gefolge eines Prinzen oder eine Freischärlertruppe aus Hilfstruppen.' },
  ],
  religion: {
    title: 'Celestische Synode',
    text: 'Die Celestische Synode ist die Staatsreligion Argentums. Es besteht Religionsfreiheit; Missionierung ist unerwünscht.',
  },
  notes: [
    'Gesellschaftliche Kaste, Adelsrang, Staatsamt und militärischer Verband werden getrennt geführt. Aus der Kaste allein folgt keine Amtsgewalt.',
    'Präfekt und Magistrat sind lokale Verwaltungsposten; die dreizehn aufgeführten Reichsposten und der Archon als Adelsrang bilden die vierzehn ausdrücklich beschriebenen Posten.',
    'Die sieben aufgezählten Militärentwürfe sind bestätigt. Sie besitzen noch keine festgelegten Klassennamen.',
    'Die aktive Vorbereitung umfasst fünf Festlandarchonate und 26 Orte. Apinia, Bolar, Lex, Orania, Pelagia und Tremelia bleiben die sechs Archonhäuser; Bolars regionale Zuordnung bleibt offen. Mede beherrscht Caldessara als kaiserliche Domäne.',
    'Zuerst entstehen die sieben Klassentypen, danach 39 Hausfiguren: sieben bestehende Häuser einschließlich Mede und 32 neue Häuser. Die 32 neuen Hauswappen folgen aus 26 Orten plus sechs weiteren Wappen.',
    'Die südliche Insel bleibt im gelieferten Kartenbild sichtbar, gehört aber vorerst nicht zur aktiven Leukonia-Vorbereitung. Ihre Zugehörigkeit ist offen; sie ist kein sechstes aktives Archonat.',
  ],
  openQuestions: [
    'Die Größenanalogie Provinz ungefähr Grafschaft ist gegenüber den drei Großprovinzen und ihren Archonaten noch begrifflich zu präzisieren.',
    'Die fünf Festlandarchonate tragen noch geografische Arbeitsnamen. Bolars regionale Zuordnung bleibt offen.',
    'Die Gesamtzahl des Senats und Amtszeiten sind offen. Die ergänzenden Ernennungsverfahren sind als Vorschläge zur Ausgestaltung getrennt von den bestätigten Territorialregeln ausgewiesen.',
    'Die sieben aufgezählten Klassentypen sind inzwischen bestätigt; ihre Klassennamen sind noch offen.',
  ],
};
