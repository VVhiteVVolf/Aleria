// Bestätigte Familienangaben und Nutzerauftrag vom 29. Oktober 2026.
const portrait = (house, person) => `../Stammbäume/assets/images/portraits/haus-${house}/${person}.jpg`;
const personLink = person => `../Stammbäume/Stammbaum.html?family=haus-balchder&mode=view&person=${person}`;
const houseCrest = '../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-balchder.png';
const connection = (name, detail, house, person) => ({ type: 'connection', name, detail, image: portrait(house, person), imageFormat: 'portrait' });

export const KAMBER_BALCHDER_BIOGRAPHY = {
  schema: 'aleria.biography-module', schemaVersion: 1,
  stats: [
    { label: 'Name', value: 'Kamber Balchder' },
    { label: 'Geboren', value: '1700' },
    { label: 'Haus', value: 'Haus Balchder' },
    { label: 'Amt', value: 'Vertragsmeister der Grafschaft Celtigerns Wacht' },
    { label: 'Untersteht', value: 'Cadfan Draig · Herold des Grafen' },
    { label: 'Ausbildung', value: 'Uchelwyr' },
    { label: 'Eltern', value: 'Dalvin Balchder und Iseult Caerlaen' },
    { label: 'Ehefrau', value: 'Senara Gelyn' },
    { label: 'Kinder', value: 'Blodwen und Rice Balchder' },
    { label: 'Reittier', value: 'Silberwind · Rhyfel · Schimmel' }
  ],
  biography: {
    biographyTitle: 'Kamber Balchder · Sorgfalt und Augenmaß',
    biographyText: '<p><strong>Kamber Balchder</strong> führt als Vertragsmeister die Klauseln, Fristen und Sicherheiten der Grafschaft Celtigerns Wacht. Der Sohn von <strong>Dalvin Balchder</strong> und <strong>Iseult Caerlaen</strong> arbeitet akribisch: Er vergleicht Fassungen, prüft Vollmachten und hält fest, welche Zusage tatsächlich erteilt wurde. Ein ordentliches Schriftstück ist für ihn erst dann brauchbar, wenn seine Bestimmungen auch im Alltag tragen.</p><p>Sein Denken ist <strong>empirisch und pragmatisch</strong>. Kamber zieht überprüfbare Angaben, vorhandene Belege und beobachtete Folgen einer gefälligen Behauptung vor. Taucht ein Widerspruch auf, geht er ihm nach; zeigt die Erfahrung, dass eine Regelung nicht funktioniert, sucht er eine bessere Lösung. Gründlichkeit ist für ihn ein Mittel, spätere Schwierigkeiten zu vermeiden.</p><p>Seine Genauigkeit hindert ihn nicht daran, mit Menschen umzugehen. Er hört zu, fragt verständlich nach und bemerkt, wenn hinter einem Einwand eine Sorge oder ein Missverständnis steckt. Bei einer strittigen Formulierung kann er sachlich bleiben und zugleich darauf achten, dass sein Gegenüber sich ernst genommen fühlt. So verbindet er das genaue Lesen eines Vertrages mit dem Gespür dafür, was die Beteiligten überhaupt miteinander vereinbaren wollen.</p>',
    abilitiesTitle: 'Persönlichkeit',
    abilities: [
      { title: 'Akribisch', detail: 'Vergleicht Abschriften und Belege, verfolgt Fristen und prüft auch unscheinbare Einzelheiten.', icon: '../IconOrdner/Traits%20Icon/Diligent.png' },
      { title: 'Empirisch und pragmatisch', detail: 'Fragt nach überprüfbaren Grundlagen und nach den praktischen Folgen einer Vereinbarung. Neue Erkenntnisse können sein Urteil verändern.', icon: '../IconOrdner/Traits%20Icon/Scholar.png' },
      { title: 'Zwischenmenschliches Geschick', detail: 'Kann zuhören, Bedenken erkennen und schwierige Sachverhalte so erklären, dass ein Gespräch weiterkommt.', icon: '../IconOrdner/Traits%20Icon/Gregarious.png' },
      { title: 'Schwäche für gutes Essen', detail: 'Ein gelungenes Essen verführt ihn leicht zu einer weiteren Portion. Seiner körperlichen Fitness ist das wenig zuträglich.', icon: '../IconOrdner/Traits%20Icon/Gluttonous.png' }
    ],
    historyTitle: 'Familie, Ausbildung und heutiger Dienst',
    historyText: '<p>Kamber wurde <strong>1700</strong> geboren. Er ist mit <strong>Senara Gelyn</strong> verheiratet; ihre Tochter <strong>Blodwen</strong> wurde 1722, ihr Sohn <strong>Rice</strong> 1728 geboren. Beide helfen inzwischen unter seiner unmittelbaren Anleitung in der Vertragsstube: Blodwen als Schreibergehilfin, Rice als Laufbursche.</p><p>Kamber ist als <strong>Uchelwyr</strong> ausgebildet. Sein heutiger Alltag verlangt vor allem Sorgfalt am Schreibtisch und im Gespräch. Körperlich ist er weniger fit, als man es von einem Ritter erwarten könnte. Gutes Essen ist seine erkennbare Schwäche, regelmäßige kämpferische Übung bestimmt sein Leben nicht. Sein letzter wirklicher Kampf liegt vermutlich sehr lange zurück, sofern er überhaupt je einen bestritten hat. Ein konkreter Kampfeinsatz ist nicht belegt.</p>',
    worksTitle: 'Aufgaben in der Vertragsstube',
    works: [
      'Vertragsprüfung · Klauseln, Fristen, Sicherheiten und Gegensiegel sorgfältig vergleichen und auf praktische Umsetzbarkeit prüfen.',
      'Vollmachten · Prüfen, ob Unterzeichnende die jeweilige Zusage verbindlich erteilen dürfen.',
      'Abstimmung · Strittige Rechtsfolgen mit der Gerichtsbarkeit und finanzielle Verpflichtungen mit der Kämmerei klären.',
      'Kanzleiarbeit · Blodwens Abschriften und Rices Botengänge anleiten; geprüfte Fassungen geordnet an das Archiv übergeben.'
    ],
    extraSections: [{ title: 'Silberwind', position: 'afterWorks', mode: 'text', text: '<p>Kamber reitet <strong>Silberwind</strong>, einen <strong>Rhyfel-Schimmel</strong>. Das Pferd ist sein persönliches Reittier. Sein Name und seine Rasse sind bekannt; Alter, Herkunft und frühere Einsätze sind bisher nicht überliefert. Silberwinds Existenz sagt deshalb ebenso wenig über frühere Kämpfe aus wie Kambers ritterliche Ausbildung.</p>' }],
    connectionsTitle: 'Familie und Dienst',
    connections: [
      connection('Senara Gelyn', 'Ehefrau und Mutter von Blodwen und Rice.', 'gelyn', 'senara-gelyn'),
      connection('Blodwen Balchder', 'Tochter · Schreibergehilfin unter seiner unmittelbaren Anleitung.', 'balchder', 'blodwen-balchder'),
      connection('Rice Balchder', 'Sohn · Laufbursche der Vertragsstube unter seiner unmittelbaren Anleitung.', 'balchder', 'rice-balchder'),
      connection('Cadfan Draig', 'Herold des Grafen und Kambers Amtsvorgesetzter.', 'draig', 'cadfan-draig'),
      { type: 'connection', name: 'Silberwind', detail: 'Persönliches Reittier · Rhyfel-Schimmel.', image: '../AleriaAlmanach/assets/companions/haus-balchder/silberwind.png', imageFormat: 'portrait' }
    ],
    documentsTitle: 'Familienakte und Rasseprofil',
    documents: [
      { title: 'Haus Balchder', text: 'Familienakte mit Eltern, Ehe und Kindern.', link: personLink('kamber-balchder'), icon: houseCrest },
      { title: 'Silberwind · Rhyfel', text: 'Das tatsächlich vorhandene Rasseprofil seines Reittiers.', link: '../Bestiarium/tiere/pferde/rhyfel/index.html', icon: '../Bestiarium/assets/icons/pferde.webp' }
    ]
  }
};

export const BLODWEN_BALCHDER_BIOGRAPHY = {
  schema: 'aleria.biography-module', schemaVersion: 1,
  stats: [
    { label: 'Name', value: 'Blodwen Balchder' }, { label: 'Geboren', value: '1722' },
    { label: 'Haus', value: 'Haus Balchder' }, { label: 'Eltern', value: 'Kamber Balchder und Senara Gelyn' },
    { label: 'Geschwister', value: 'Rice Balchder' }, { label: 'Aufgabe', value: 'Schreibergehilfin der Vertragsstube' },
    { label: 'Untersteht', value: 'Kamber Balchder · Vertragsmeister' }
  ],
  biography: {
    biographyTitle: 'Blodwen Balchder',
    biographyText: '<p><strong>Blodwen Balchder</strong>, geboren <strong>1722</strong>, ist die Tochter von <strong>Kamber Balchder</strong> und <strong>Senara Gelyn</strong>. Ihr jüngerer Bruder heißt <strong>Rice</strong>.</p><p>Sie arbeitet als <strong>Schreibergehilfin</strong> unter ihrem Vater in der Vertragsstube. Sie fertigt Abschriften an, ordnet Schriftstücke und überträgt von Kamber geprüfte Angaben in die Listen der Stube. Die inhaltliche Prüfung und Freigabe bleiben bei ihrem Vater; eine eigene Verhandlungs- oder Zeichnungsvollmacht besitzt sie durch diese Aufgabe nicht.</p>',
    worksTitle: 'Aufgaben',
    works: ['Abschriften nach den geprüften Vorlagen ihres Vaters anfertigen.', 'Vertragsunterlagen und zugehörige Belege geordnet ablegen.', 'Vorgegebene Fristen und Eingänge in die Listen der Vertragsstube übertragen.'],
    connectionsTitle: 'Familie',
    connections: [connection('Kamber Balchder', 'Vater und unmittelbarer Vorgesetzter in der Vertragsstube.', 'gelyn', 'kamber-balchder'), connection('Senara Gelyn', 'Mutter.', 'gelyn', 'senara-gelyn'), connection('Rice Balchder', 'Jüngerer Bruder · Laufbursche unter Kamber.', 'balchder', 'rice-balchder')],
    documentsTitle: 'Familienakte',
    documents: [{ title: 'Familienakte', text: 'Die belegte Familie Balchder.', link: personLink('blodwen-balchder'), icon: houseCrest }]
  }
};

export const RICE_BALCHDER_BIOGRAPHY = {
  schema: 'aleria.biography-module', schemaVersion: 1,
  stats: [
    { label: 'Name', value: 'Rice Balchder' }, { label: 'Geboren', value: '1728' },
    { label: 'Haus', value: 'Haus Balchder' }, { label: 'Eltern', value: 'Kamber Balchder und Senara Gelyn' },
    { label: 'Geschwister', value: 'Blodwen Balchder' }, { label: 'Aufgabe', value: 'Laufbursche der Vertragsstube' },
    { label: 'Untersteht', value: 'Kamber Balchder · Vertragsmeister' }
  ],
  biography: {
    biographyTitle: 'Rice Balchder',
    biographyText: '<p><strong>Rice Balchder</strong> wurde <strong>1728</strong> geboren. Er ist der Sohn von <strong>Kamber Balchder</strong> und <strong>Senara Gelyn</strong> sowie der jüngere Bruder von <strong>Blodwen</strong>.</p><p>Als <strong>Laufbursche der Vertragsstube</strong> erledigt er die von seinem Vater aufgetragenen Botengänge und kleinen Besorgungen. Er bringt Schriftstücke an die benannten Empfänger und kehrt mit Antworten oder Empfangsbestätigungen zu Kamber zurück. Sein Dienst umfasst örtliche Wege nach Anweisung; eigene Verhandlungen oder gefährliche Fernkurieraufträge sind damit nicht verbunden.</p>',
    worksTitle: 'Aufgaben',
    works: ['Aufgetragene Schriftstücke an die ausdrücklich benannten Empfänger bringen.', 'Antworten und Empfangsbestätigungen zu Kamber zurücktragen.', 'Kleine Besorgungen für die Vertragsstube nach Anweisung erledigen.'],
    connectionsTitle: 'Familie',
    connections: [connection('Kamber Balchder', 'Vater und unmittelbarer Auftraggeber seiner Botengänge.', 'gelyn', 'kamber-balchder'), connection('Senara Gelyn', 'Mutter.', 'gelyn', 'senara-gelyn'), connection('Blodwen Balchder', 'Ältere Schwester · Schreibergehilfin unter Kamber.', 'balchder', 'blodwen-balchder')],
    documentsTitle: 'Familienakte',
    documents: [{ title: 'Familienakte', text: 'Die belegte Familie Balchder.', link: personLink('rice-balchder'), icon: houseCrest }]
  }
};
