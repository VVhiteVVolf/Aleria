import { GLANNADEOR_SAGA, GLANNADEOR_LAMENT } from '../../../shared/urgren/glannadeor-lore.mjs';

const paragraph = text => ({ type: 'paragraph', text });
const section = (id, title, ...texts) => ({ id, title, blocks: texts.map(paragraph) });
const image = (src, alt, caption) => ({ src, width: 1024, height: 1536, alt, ...(caption ? { caption } : {}) });
const plate = 'assets/predators/urgren/madruach-v1.png';
const myth = 'assets/predators/urgren/urgren-mythos-v1.png';

export function buildUrgrenOverview() {
  return {
    id: 'urgren', title: 'Urgren', subtitle: 'Die verfluchten Bären', classification: 'Verderbte Bärenlinien · Ursine Raubtiere', folio: 'R-03-U',
    lead: 'Urgren sind Bärenlinien, deren ursprüngliches Wesen durch einen uralten Fluch verdorben wurde. In ihnen verbindet sich die gewaltige Kraft des Bären mit finsterer, unerbittlicher Böswilligkeit. Was die Warge für die Wölfe sind, sind die Urgren für die Bären.',
    quote: 'Ich gab dem Unheil einen neuen Leib und nannte das Land geheilt.', quoteAttribution: 'Fear Doirich in der Sage von Glannadeor',
    icon: { src: '../../../../assets/icons/raubtiere.webp', width: 512, height: 512, alt: '' },
    hero: image('../../../../' + myth, 'Symbolische Szene: befreiter Brannoc, dunkler Menschenbär und der unterirdische Ahnenbaum', 'Mythische Bildtafel · Der Fluch, sein neuer Träger und der Baum ohne Morgen'),
    sections: [
      section('einfuehrung', 'Urgr und Urgren', 'Ein einzelnes Wesen heißt Urgr, die Mehrzahl lautet Urgren. Der Name bezeichnet die verfluchten Bärenlinien gemeinsam. Madrúach ist die erste hier beschriebene Linie; ihre Herkunft wird auf Madra Rua zurückgeführt.'),
      section('baer-und-urgr', 'Der Bär und sein verdorbenes Gegenstück', 'Gewöhnliche Bären handeln aus Hunger, Revierdruck, dem Schutz ihrer Jungen und den Bedürfnissen ihres Lebensraums. Auch ein gefährlicher oder menschenfressender Bär wird dadurch allein nicht zum Urgr.', 'Beim Urgr betrifft die Verderbnis Körper und Wesen. Seine Feindseligkeit kann über Nahrungssuche und unmittelbare Bedrohung hinausgehen. Wie beim Unterschied zwischen Wolf und Warg werden erinnerte Kränkungen, bewusste Grausamkeit und die absichtliche Wahl menschlicher Opfer zum Kennzeichen der Überlieferung.'),
      { id: 'sage', title: GLANNADEOR_SAGA.title, blocks: [paragraph(GLANNADEOR_SAGA.chronology), ...GLANNADEOR_SAGA.chapters.flatMap(chapter => [{ type: 'subheading', text: chapter.title }, ...chapter.paragraphs.map(paragraph)])] },
      section('ueberlieferung', 'Was die Sage bewahrt', 'Tír na nDoirí bedeutet Land der Eichenhaine und bezeichnet in dieser Überlieferung die Landschaft des späteren Celtigerns Wacht innerhalb des alten Oseneach. Dún Áinmardh liegt am Ort des heutigen Gwynthor. Glannadeor und der Ahnenbaum gehören zur Ursprungssage der Madrúach.', 'Der Cormac Ui Talamh dieser frühantiken Erzählung ist ein Namensvetter der späteren überlieferten Fürsten. Seine sieben Söhne, die unbenannte Tochter sowie Fear Doirich und dessen Sohn werden hier als Gestalten der Sage geführt.', 'Der Eid beschreibt die besondere Fluchübertragung dieser Erzählung. Daraus folgt keine allgemeine druidische Kunst, mit der sich jeder Fluch beliebig auf andere übertragen ließe. Die Herkunft anderer Urgrenlinien bleibt offen.'),
      section('klagelied', 'Unter Eichen, unter Stein', 'Das Klagelied von Glannadeor erzählt dieselbe Geschichte in achtzehn Strophen, mit wiederkehrendem Kehrvers und einer letzten Klage des Vaters. Es eignet sich für eine langsame, vom irischen Erzähl- und Klagelied angeregte Ballade.', GLANNADEOR_LAMENT.chorus.join(' / '))
    ],
    furtherReading: [
      { title: 'Das vollständige Klagelied', href: './klagelied.html', description: 'Alle Strophen, Kehrverse und Hinweise für den Vortrag.' },
      { title: 'Liedtext als Textdatei', href: './unter-eichen-unter-stein.txt', description: 'Zum eigenen Vertonen und Weiterbearbeiten.' },
      { title: 'Der Eid von Glannadeor · Rollenheft', href: '/AleriaAlmanach/assets/gwynthor-theater/productions/der-eid-von-glannadeor/rollenheft.html', description: 'Die Gwynthorer Bühnenfassung in fünf Aufzügen mit bestehendem Ensemble.' }
    ],
    comparison: { eyebrow: 'Bestimmungshilfe', title: 'Bär oder Urgr?', intro: 'Körpergröße und Angriffslust allein erlauben keine sichere Einordnung. Die alten Berichte achten auf das Wesen hinter der Gewalt.', columns: [
      { kicker: 'Natürliche Linien', title: 'Bären', points: ['Bleiben Teil der natürlichen Ordnung', 'Hunger, Revier und Nachwuchsschutz erklären ihr Verhalten', 'Aggressivität ist für sich kein Fluchzeichen'] },
      { kicker: 'Verderbte Linien', title: 'Urgren', points: ['Durch Fluch oder uralte Verderbnis gezeichnet', 'Bewusste Böswilligkeit über unmittelbare Not hinaus', 'Bei Madrúach eine verstörend menschenähnliche Visage'] }
    ] },
    atlas: { title: 'Register der Urgren', intro: 'Die erste ausgearbeitete Linie ist Madrúach. Weitere Linien sind damit weder benannt noch vorweggenommen.', groups: [{ id: 'urgren', title: 'Madrúach', kicker: 'Erste erschlossene Urgrenlinie', description: 'Die selten gesichteten Menschenbären der Berge Celtigerns Wachts.', entries: [{ id: 'madruach', title: 'Madrúach', region: 'Estryll · Berge Celtigerns Wachts', description: 'Gewaltige, zottige Urgren mit menschlicher Visage, deren Sage auf Madra Rua und den Eid von Glannadeor zurückführt.', status: 'Dossier verfügbar', href: '../madruach/index.html', image: image('../../../../' + plate, 'Vollständiger Madrúach-Urgr auf vier Pranken mit menschlicher Visage') }] }] }
  };
}

export function buildMadruachProfile() {
  return {
    id: 'madruach', name: 'Madrúach', classification: 'Urgr · Verfluchte Bärenlinie des Madra Rua', continent: 'Estryll', region: 'Berge Celtigerns Wachts', folio: 'R-U01',
    quote: 'Was ich hier gewinne, soll an mir bleiben.', quoteAttribution: 'Madra Ruas Eid in der Sage von Glannadeor',
    summary: 'Madrúach sind gewaltige Urgren der Berge Celtigerns Wachts. Ihre schmutzig verfilzten Bärenleiber tragen eine verstörend menschliche Visage. Seltene Berichte erzählen von Hinterhalten auf Wanderer; ihre Ursprungssage führt die Linie auf den verfluchten Krieger Madra Rua zurück.',
    icon: image('../../../../' + plate, 'Madrúach-Urgr'), hero: image('../../../../' + plate, 'Ein massiger Madrúach mit menschlicher Stirn und Nase, verfilztem Bartfell und vier kräftigen Bärenpranken', 'Neue Kreaturentafel · Madrúach, erste beschriebene Urgrenlinie'),
    group: { id: 'baeren', title: 'Bären', subgroupId: 'urgren' }, subgroup: { id: 'urgren', title: 'Urgren' },
    facts: [
      { label: 'Gattung', value: 'Urgr · Mehrzahl Urgren' }, { label: 'Linie', value: 'Madrúach · nach Madra Rua' },
      { label: 'Vorkommen', value: 'Berge Celtigerns Wachts; seltene Sichtungen' }, { label: 'Gestalt', value: 'Gewaltiger Bärenleib mit menschlicher Visage' },
      { label: 'Verhalten', value: 'Arglistig, böswillig und gefährlich für Wanderer' }, { label: 'Ursprungssage', value: 'Der Eid von Glannadeor' },
      { label: 'Nahrung', value: 'Gerissene Tiere; auch Menschen als Opfer überliefert' }, { label: 'Zähmung', value: 'Keine verlässliche Bindung überliefert' }
    ],
    metrics: { labels: ['Gefahr', 'Zähmbarkeit', 'Intelligenz', 'Körperkraft', 'Sozialverhalten', 'Ausdauer'], values: [10, 1, 8, 10, 1, 8], source: 'Aus dem Arttext abgeleitete Feldbewertung' },
    sections: [
      section('einfuehrung', 'Die Menschenbären der Berge', 'Madrúach bezeichnet diese besondere Linie innerhalb der Urgren. Ein Tier ist ein Madrúach-Urgr; gemeinsam werden sie Madrúach-Urgren genannt. Der Name ist eine albische Verschleifung von Madra Rua.', 'Heute gibt es kaum noch Sichtungen. Die Berichte verorten die Wesen in den Bergen Celtigerns Wachts, wo sie Reisende beobachten und arglosen Wanderern auflauern.'),
      section('erscheinung', 'Ein Gesicht, das sich erinnert', 'Der Körper bleibt bärenartig: gewaltige Schultern, schwerer Rumpf, kräftige lange Vorderläufe und vier mit großen Krallen bewehrte Pranken. Das ungepflegte graubraune Fell hängt in dichten, schmutzigen und verfilzten Strähnen am Leib.', 'Stirn, Brauen und Nase wirken erschreckend menschlich. Das zottige Haar um Kiefer und Maul erinnert an einen verwilderten Bart. Hinter der tierischen Schnauze liegt der Eindruck eines verzerrten Menschengesichts.', 'Die Bildtafel zeigt knorrige, geweihartige Knochenauswüchse. Schädel, Lederbänder und zerbrochene Schildreste sind als Trophäen eines alten Exemplars dargestellt; sie sind keine angeborenen Körperteile und keine vorgeschriebene Ausstattung jedes Madrúach.'),
      section('ursprung', 'Madra Rua und Fear Doirich', 'Nach der albischen Sage wollte Madra Rua durch einen Handel mit dem Púca die Tochter Cormac Ui Talamhs und Glannadeor gewinnen. Er war bereit, Untertanen und sogar die sieben Fürstensöhne zu opfern. Der Unhold verlangte stattdessen den Ratsdruiden Fear Doirich.', 'Der von Tieren gewarnte Druide brachte Madra dazu, die Macht des verdorbenen Brannoc freiwillig zu beanspruchen. Er löste Zatrachs Korruption aus dem Bären und übertrug sie entlang dieses Eides auf den Krieger. Der erste Madrúach floh in die Berge.'),
      section('glannadeor', 'Der Preis des Sieges', 'Jahrhunderte später fraß Madras Bärengestalt den erwachsenen Druidenkrieger, den Fear Doirich mit Cormacs Tochter gezeugt und erzogen hatte. Der Sohn war gegen den Wunsch seines Vaters zur Feuerprobe ausgezogen.', 'Am bronzenen Reif zwischen Blut und zerrissener Kleidung erkannte Fear Doirich die Bestie. Er verfluchte sich selbst und starb in Glannadeors unterirdischen Hallen. Aus seinem Leib erwuchs der Ahnenbaum, der die Ruinenmauern umschließt und niemals das Tageslicht erreicht.'),
      section('nachkommen', 'Die Weitergabe der Verderbnis', 'Die Sage führt die Madrúach-Urgren auf Nachkommen Madra Ruas mit Brannoc-Bärinnen und Bärinnen anderer Linien zurück. Sie spricht ausdrücklich von gewaltsam erzwungenen Paarungen. Seine Verderbnis ging an diese Nachkommen weiter.', 'Die Erzählung unterscheidet den verwandelten Stammvater von seiner Linie. Sie macht weder jeden Madrúach zu einem ehemals menschlichen Wesen noch jeden gefährlichen Bären zum Urgr. Über Madras späteres Ende und die heutige Zahl seiner Nachfahren ist nichts Sicheres überliefert.'),
      section('jagd', 'Jagd und Verhalten', 'Die Madrúach der jüngeren Berichte lauern auf Menschen und reißen Tiere. Ihre Gefahr liegt in der Verbindung gewaltiger Kraft mit gezieltem, feindseligem Verhalten. Die menschlich wirkende Visage darf nicht als Einladung zur Annäherung verstanden werden.', 'Eine feste Rudelordnung oder verlässliche Bindung an Menschen ist nicht überliefert. Madras Verhandlung mit dem Púca gehört zur Ursprungssage und beweist keine allgemeine menschliche Sprachfähigkeit seiner Nachkommen.'),
      section('lebensraum', 'Berge und verlassene Wege', 'Als heutiges Vorkommen werden die Berge Celtigerns Wachts genannt. Die Ruinen Glannadeors bilden den Mittelpunkt der Sage. Konkrete Reviere, Bestandszahlen und weitere Ansiedlungen sind nicht gesichert.', 'Seltene Sichtungen und das Motiv des arglosen Wanderers haben die Linie zum Gegenstand von Warnungen an Bergwegen gemacht.'),
      { id: 'feldhinweise', title: 'Stärken und Grenzen der Überlieferung', blocks: [{ type: 'list', items: ['Gewaltige Körperkraft und schwere Bärengestalt.', 'Böswillige Absicht und die Wahl menschlicher Opfer.', 'Keine verlässlich überlieferte Zähmung.', 'Keine belegte allgemeine Unsterblichkeit, besondere Waffenempfindlichkeit oder feste Zauberkraft.', 'Die Archivwerte vergleichen den Arttext; sie sind keine Kampfwerte oder exakten Messungen.'] }] },
      section('lied-und-buehne', 'Klage und Theater', '„Unter Eichen, unter Stein“ bewahrt den Weg von Cormacs blühendem Land bis zum Baum ohne Morgen als Klagelied. Das Gwynthorer Theater erzählt dieselbe Sage als „Der Eid von Glannadeor“ in fünf Aufzügen.')
    ],
    furtherReading: [
      { title: 'Urgren und die vollständige Ursprungssage', href: '../urgren/index.html#sage' },
      { title: 'Unter Eichen, unter Stein · Klagelied', href: '../urgren/klagelied.html' },
      { title: 'Der Eid von Glannadeor · Theaterstück', href: '/AleriaAlmanach/assets/gwynthor-theater/productions/der-eid-von-glannadeor/rollenheft.html' }
    ]
  };
}

export function addUrgrenToBearOverview(overview) {
  const result = structuredClone(overview);
  result.title = 'Bären & Urgren';
  result.subtitle = 'Uralte Kraft und die Schatten ihrer Verderbnis';
  result.lead = 'Die Bären Alerias reichen vom sanften Brannoc bis zu den Jägern des Packeises. Neben ihren natürlichen Linien stehen die Urgren: verfluchte Bärenformen, deren erste beschriebene Linie Madrúach in den Bergen Celtigerns Wachts gefürchtet wird.';
  result.sections = result.sections.filter(item => item.id !== 'urgren');
  result.sections.push(section('urgren', 'Urgren – die verfluchten Bären', 'Was die Warge für die Wölfe sind, sind die Urgren für die Bären: durch uralte Verderbnis gezeichnete Linien, deren Feindseligkeit über Hunger und Revier hinausgehen kann. Madrúach ist die erste erschlossene Urgrenlinie. Ihre Geschichte führt in das alte Tír na nDoirí und zu Fear Doirichs Eid von Glannadeor.'));
  result.atlas.intro = 'Acht natürliche Bärenarten besitzen ein vollständiges Dossier. Die Urgren führen zu einem eigenen Hauptartikel und ihrer ersten beschriebenen Linie Madrúach. Drei erhaltene Bildtafeln aus Lothir bleiben als unbestimmte Arten verzeichnet.';
  result.atlas.groups = result.atlas.groups.filter(group => group.id !== 'urgren');
  const group = { id: 'urgren', title: 'Urgren', kicker: 'Verfluchte Bärenlinien', description: 'Ein eigener Hauptartikel trennt die Verderbnis der Urgren von den natürlichen Bären. Madrúach steht am Anfang ihres Registers.', entries: [{ id: 'urgren', title: 'Urgren – die verfluchten Bären', region: 'Uralte albische Überlieferungen · Estryll', description: 'Hauptartikel mit der Sage von Glannadeor, Klagelied und dem ersten Dossier Madrúach.', status: 'Übersicht verfügbar', href: './urgren/index.html', image: image('../../../' + myth, 'Mythisches Bild der Urgren und des Ahnenbaums von Glannadeor') }] };
  const lothir = result.atlas.groups.findIndex(item => item.id === 'lothir');
  result.atlas.groups.splice(lothir < 0 ? result.atlas.groups.length : lothir, 0, group);
  return result;
}
