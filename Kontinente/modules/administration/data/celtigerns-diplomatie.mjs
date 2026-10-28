import { office as o, group as g, portrait as p } from '../administration-model.mjs';

export default {
  id: 'diplomatie', title: 'Diplomatie',
  intro: 'Der Herold wahrt Stimme, Rang und Zusagen der Grafschaft. Die Herolde der Vasallen führen ihre eigenen Kontakte und legen über Verpflichtungen gegenüber anderen Herrschaften Rechenschaft ab. Fünf gleichrangige Kernämter tragen die Facharbeit.',
  groups: [
    g('leitung', 'Heroldsamt der Grafschaft', 'leadership', [o('herold', 'Herold des Grafen', 'Cadfan Draig', p('draig', 'cadfan-draig'), 'Vertritt die Grafschaft mit gräflicher Vollmacht. Beaufsichtigt Gesandtschaften, verbindliche Zusagen, Anerkennungen und diplomatische Rangfragen.', { reportsTo: 'Graf von Celtigerns Wacht', authority: 'Verhandelt innerhalb des erteilten Mandats; grundsätzliche Bündnisse bleiben Entscheidung des Grafen.' })]),
    g('adjutantur', 'Adjutantur und Heroldskanzlei', 'adjutant', [o('adjutant', 'Adjutantin des Herolds', 'Branwen Draig', p('draig', 'branwen-gwefrydd'), 'Ordnet Audienzen, Reiseaufträge, Botenketten und Siegelumlauf. Koordiniert die Herolde der Vasallen und die fünf Fachämter.', { reportsTo: 'Herold des Grafen' })]),
    g('kern', 'Die fünf Kernämter des Herolds', 'core', [
      o('gesandtschaft', 'Gesandtschaftsmeisterin', 'Neala Wyrm', p('wyrm', 'neala-wylan'), 'Führt Missionen und Verhandlungsmandate. Stimmt Schutzbriefe, Geleit und Kontakte zu Nachbarhöfen ab.', { reportsTo: 'Herold des Grafen', connections: [{ area: 'militaer', label: 'Gesandtschaftsgeleit', description: 'Die militärische Führung stellt abgestimmten Schutz; das diplomatische Mandat bleibt beim Herold.' }] }),
      o('protokoll', 'Protokollmeister', 'Cadogan Sgrechiwr', p('sgrechiwr', 'cadogan-sgrechiwr'), 'Wahrt Rang, Anrede, Sitzordnung und Audienzregeln. Protokolliert Verhandlungsgänge und verhindert widersprüchliche öffentliche Zusagen.', { reportsTo: 'Herold des Grafen', connections: [{ area: 'unterhaltung', label: 'Hofzeremoniell', description: 'Stimmt Empfänge und Ehrungen mit der Unterhaltung ab.' }] }),
      o('vertraege', 'Vertragsmeister', 'Kamber Balchder', p('gelyn', 'kamber-balchder'), 'Führt Klauseln, Fristen, Sicherheiten und Gegensiegel. Prüft die Vollmacht der Unterzeichnenden und übergibt beglaubigte Fassungen an das Archiv.', { reportsTo: 'Herold des Grafen', connections: [{ area: 'gerichtsbarkeit', label: 'Rechtsprüfung', description: 'Die Justiz prüft strittige Rechtsfolgen und Zuständigkeiten.' }, { area: 'finanzen', label: 'Vertragliche Lasten', description: 'Finanzielle Verpflichtungen werden vor Abschluss mit der Kämmerei abgestimmt.' }] }),
      o('verbindung', 'Verbindungsmeister', 'Iestyn Swyll', '/Stammbäume/assets/images/published/haus-swyll/person-iestyn-swyll-r1.webp', 'Pflegt dauerhafte Verbindungen zu Burgen, Städten, Klöstern und Zünften. Nimmt Anliegen an und führt sie an die zuständigen Ämter weiter.', { reportsTo: 'Herold des Grafen', authority: 'Gleichrangiges Kernamt mit unmittelbarem Bericht an Cadfan.' }),
      o('zeichen', 'Wappen- und Zeichenmeisterin', 'Rhiannon Draenmelyn', p('draenmelyn', 'rhiannon-draenmelyn', 'png'), 'Bestätigt Wappen, Geleitzeichen und Siegelidentitäten. Verhindert falsche Anerkennung und gefälschte Vollmachten.', { reportsTo: 'Herold des Grafen', authority: 'Gleichrangiges Kernamt mit unmittelbarem Bericht an Cadfan.', connections: [{ area: 'spionage', label: 'Zeichenfälschung', description: 'Verdächtige Identitäten und gefälschte Zeichen gehen zur Ermittlung.' }] }),
    ], 'Gesandtschaft, Protokoll, Verträge, Verbindung und Zeichen stehen ausdrücklich auf derselben Ebene. Verbindung untersteht nicht dem Protokoll; Zeichen nicht dem Vertragsamt.'),
    g('sonder', 'Sonderrollen und Schreibgehilfen', 'special', [
      o('gareth', 'Schreibgehilfe der Verbindungsstube', 'Gareth Swyll', p('swyll', 'gareth-swyll', 'png'), 'Iestyn Swylls Sohn führt Abschriften, Eingangslisten und vorbereitete Antwortschreiben. Unterstützt die Verbindungsstube bei der geordneten Weitergabe von Anliegen.', { reportsTo: 'Iestyn Swyll · Verbindungsmeister', authority: 'Keine eigene Verhandlungs-, Siegel- oder Zeichnungsvollmacht.' }),
      o('grenzgesandter', 'Grenzgesandter', '', '', 'Schlichtet Fragen zu Weide-, Fluss-, Jagd- und Grenzrechten im erteilten Mandat.', { reportsTo: 'Gesandtschaftsmeisterin', connections: [{ area: 'gerichtsbarkeit', label: 'Grenzrecht', description: 'Nicht einvernehmlich lösbare Rechtsfragen gehen an die Justiz.' }] }),
    ]),
    g('dienste', 'Gesandtschaft und Kanzleidienste', 'service', [
      o('gesandte', 'Gesandte und Dolmetscher', '', '', 'Überbringen bevollmächtigte Botschaften, sichern Verständigung und halten sich an das erteilte Mandat.', { reportsTo: 'Gesandtschaftsmeisterin' }),
      o('schreiber', 'Audienz- und Urkundenschreiber', '', '', 'Protokollieren Gespräche, formulieren geprüfte Klauseln und führen Fristenbücher sowie Abschriften.', { reportsTo: 'Zuständiges Kernamt' }),
      o('siegel', 'Siegelwarte, Zeichenkundige und Boten', '', '', 'Verwahren Amtssiegel, prüfen Zeichen und überbringen versiegelte Nachrichten; Geleitsknechte schützen die Gesandten.', { reportsTo: 'Heroldskanzlei und zuständiges Kernamt' }),
    ]),
  ],
  sources: [{ label: 'Bisherige Heroldsordnung', href: '/Kontinente/modules/administration/content/diplomatie.html' }],
};
