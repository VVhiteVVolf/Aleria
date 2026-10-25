import { WELLENRUH } from '../battles/wellenruh-data.mjs';
import { LEITHEACH_INCIDENTS } from '../coastal-history/coastal-incidents.mjs';
import { LEITHEACH_DURATION } from '../../../shared/coastal-history/leitheach-chronology.mjs';

// Inhalt der alten Ereignisübersicht. Unbekannte Daten bleiben ausdrücklich offen.
// articleHref ist relativ zu Ereignisse/index.html; nur vorhandene Seiten verlinken.
// sourceHref bewahrt bestehende Altseiten, bis ein lokales articleHref sie ablöst.
export const EVENT_CHAPTERS = Object.freeze([
  { id: 'kriege', numeral: 'I', title: 'Kriege', subtitle: 'Um Kronen und Königreiche', description: 'Bürgerkriege, Invasionen und Raubzüge, die Aleria veränderten.' },
  { id: 'schlachten', numeral: 'II', title: 'Schlachten', subtitle: 'Wo die Waffen aufeinandertreffen', description: 'Einzelne Schlachten und ihre Überlieferungen.' },
  { id: 'zeremonien', numeral: 'III', title: 'Zeremonien', subtitle: 'Von Bündnissen und Schwüren', description: 'Hochzeiten und feierliche Zusammenkünfte.' },
  { id: 'reisen', numeral: 'IV', title: 'Reisen', subtitle: 'Auf noch unbeschriebenen Wegen', description: 'Dieser Teil der Chronik wartet noch auf seinen ersten benannten Reisebericht.', icon: 'reise' },
  { id: 'abenteuer', numeral: 'V', title: 'Abenteuer', subtitle: 'Geschichten auf langen Wegen', description: 'Die Unternehmungen der Wintersonne und der Ritter der Tafelrunde.' },
  { id: 'tragoedien', numeral: 'VI', title: 'Tragödien', subtitle: 'Was nicht vergessen wird', description: 'Dunkle Ereignisse und die Spuren, die sie hinterließen.' }
].map(Object.freeze));

export const EVENTS = Object.freeze([
  {
    id: 'krieg-der-praetendenten', chapter: 'kriege', title: 'Der Krieg der Prätendenten', type: 'Bürgerkrieg',
    icon: 'buergerkrieg', sourceHref: 'https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2021',
    startYear: 1627, endYear: 1647, duration: '20 Jahre', note: 'Erster Bürgerkrieg · Experimentelles Kriegsdossier', articleHref: 'Kriege/krieg-der-praetendenten/index.html', experimental: true,
    summary: 'Der Krieg der Prätendenten war der blutigste und längste Bürgerkrieg in der Geschichte Aldrimars. Über einen Zeitraum von zwanzig Jahren verwüstete er das Königreich und drohte, die Linie des Königshauses vollständig auszulöschen. Auslöser war der Giftmord am frisch gekrönten Hochkönig Roger und seiner Braut Astrid. Die beschuldigten Geschwister Ulfrik und Helga wurden ohne ordentliches Verfahren hingerichtet; die Überlieferungen widersprechen sich bei ihrer Schuld. Arn, Sinding und Bjoern wurden zu den Prätendenten dreier rivalisierender Parteien, die um die Krone rangen.'
  },
  {
    id: 'krieg-um-estryll', chapter: 'kriege', title: 'Der Krieg um Estryll', type: 'Großer Krieg',
    icon: 'krieg', sourceHref: 'https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2454',
    startYear: 1719, endYear: 1720, duration: 'Ein Jahr', note: 'Entstehung des Dunkelhains nach Kriegsende', articleHref: null,
    summary: 'Der Krieg um Estryll war ein großflächiger, politisch wie okkult motivierter Konflikt, ausgelöst im Jahr 1719 durch das machtgierige Fürstentum Ceitheach, das – getrieben von den Kulten der Erben der Morgenröte, des Blutmondes und dem Kreis der Dämmerung – die albische Krone an sich reißen wollte. Ein Bündnis aus Cenyr, Aldrimar, Leitheach, Blaitheach, Dunfal und Aislearneach stellte sich ihnen entgegen und konnte die Offensive aufhalten, doch der Sieg endete nicht ohne Preis, sondern im Verderben Ceitheachs und Umwandlung in den Dunkelhain. Einzig das Opfer einer Heldin konnte Schlimmeres unterbinden.'
  },
  {
    id: 'invasion-von-vennyr', chapter: 'kriege', title: 'Die Invasion von Vennyr', type: 'Invasion',
    icon: 'krieg', sourceHref: 'https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2178',
    startYear: 1717, endYear: 1720, duration: '3 Jahre', note: 'Vennyr wird zu Fjordheim', articleHref: 'Kriege/invasion-von-vennyr/index.html', experimental: true,
    summary: 'Die Invasion von Vennyr im Jahr 1717 markiert einen Wendepunkt in der Geschichte des Königreichs, als die Nordmänner des Hohen Nordens, angeführt von den mächtigen Clans der Nordmannen, einen erneuten Versuch unternahmen, das Land zu erobern, das sie als ihre angestammte Heimat betrachteten.'
  },
  {
    id: 'aufstieg-der-triarchie', chapter: 'kriege', title: 'Aufstieg der Triarchie', type: 'Krieg',
    icon: 'krieg',
    startYear: 1717, endYear: 1721, duration: '4 Jahre', note: 'Unterwerfung vieler alerischer Reiche', articleHref: null,
    summary: 'Der Aufstieg der Triarchie beschreibt die gezielte Unterwerfung zahlreicher zentral gelegener Königreiche und Fürstentümer durch die Einführung einer tief okkulten Religion, welche sich auf die drei dunklen Götter Grimnar, Dagon und Bhaal stützt. Diese Religion wird durch ein fanatisches Triumvirat aus drei mächtigen Magiern – den sogenannten Triarchen – verkörpert, die als weltliche und geistige Führer agieren, um ein religiös-diktatorisches Regime über die eroberten Reiche zu errichten.'
  },
  {
    id: 'raubzug-durch-leitheach', chapter: 'kriege', title: 'Raubzug durch Leitheach', type: 'Raubzug',
    icon: 'raubzug', sourceHref: 'https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2467',
    startYear: 1733, endYear: 1733, duration: LEITHEACH_DURATION, note: 'Winter 1733 · Fall von Broch an Clais', articleHref: 'Kriege/raubzug-durch-leitheach/index.html', experimental: true,
    summary: 'Im Winter 1733 überfielen vier Banden des Schwarzblut-Kollektivs Leitheach. Nach dem Fall von Broch an Clais drangen Teilverbände entlang des Flusses bis nach Dun Laog vor. Die Piraten töteten oder verschleppten die an der Burg anwesenden Iomrach, plünderten zahlreiche Siedlungen und entführten viele Alben. Dun Laog konnte gehalten werden; der Großteil der Piraten entkam mit Beute und Gefangenen.'
  },
  ...LEITHEACH_INCIDENTS.map(event => ({ id: `leitheach-${event.id}`, chapter: 'schlachten', title: event.title, type: event.type, icon: 'raubzug', startYear: 1733, endYear: 1733, duration: event.duration, note: `Winter 1733 · ${event.time}`, summary: event.lead, articleHref: event.file.replace('Ereignisse/', ''), experimental: true })),
  {
    id: WELLENRUH.id, chapter: 'schlachten', title: WELLENRUH.title, type: 'Seeschlacht',
    icon: 'seeschlacht', startYear: WELLENRUH.date.year, endYear: WELLENRUH.date.year,
    startDate: WELLENRUH.date, duration: 'Ein Tag', note: 'Sieg der Grünen · Experimentelles Schlachtdossier',
    summary: WELLENRUH.summary, articleHref: WELLENRUH.articleHref, experimental: true,
    location: WELLENRUH.location, calendarType: 'battle'
  },
  {
    id: 'seeschlacht-rhonwens-traenen', chapter: 'schlachten', title: 'Seeschlacht um Rhonwens Tränen', type: 'Schlacht',
    icon: 'seeschlacht',
    startYear: null, endYear: null, duration: null, note: null, summary: '', articleHref: null
  },
  {
    id: 'hochzeit-bei-gwynthor', chapter: 'zeremonien', title: 'Die Hochzeit bei Gwynthor', type: 'Hochzeit',
    icon: 'hochzeit', sourceHref: 'https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2608',
    startYear: 1740, endYear: 1740, duration: 'Ein Tag', note: 'Bevorstehendes Ehebündnis von Haus Draig und Haus Penderyn',
    summary: 'Die Hochzeit von Prinz Tudwal Draig und Lady Revelyn Penderyn in Gwynthor. Den aktuellen Termin und Ablauf führt das gemeinsame Festbuch.', articleHref: './Hochzeiten/Haus-Draig-und-Penderyn.html'
  },
  {
    id: 'abenteuer-der-wintersonne', chapter: 'abenteuer', title: 'Abenteuer der Wintersonne', type: 'Abenteuer',
    icon: 'abenteuer',
    startYear: 1663, endYear: 1689, duration: '26 Jahre', note: null, summary: '', articleHref: null
  },
  {
    id: 'ritter-der-tafelrunde', chapter: 'abenteuer', title: 'Abenteuer der Ritter der Tafelrunde', type: 'Abenteuer',
    icon: 'abenteuer',
    startYear: 1710, endYear: 1720, duration: '10 Jahre', note: null, summary: '', articleHref: null
  },
  {
    id: 'schrecken-von-torrenheim', chapter: 'tragoedien', title: 'Das Schrecken von Torrenheim', type: 'Tragödie',
    icon: 'tragoedie', sourceHref: 'https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=1442',
    startYear: 1730, endYear: 1730, duration: null, note: 'Rory wird als der Blutfürst bekannt', articleHref: null,
    summary: 'Das Ereignis um Torrenheim ist eine Geschichte von Machtkämpfen, Verbannten und Söldnern. Torrenheim ist ein Anwesen einer einstigen Edelfamilie, das aufgrund seiner Nähe zur Küste und der Grenze von Fjordheim verlassen und den Elementen überlassen wurde. Ein in Ungnade gefallener Hesir erhielt jedoch das Anwesen, um ihn vom Hofe zu verweisen. Dort baute der Hesir eine Bande von Räubern und Marodeuren auf, die mit den Nordmännern kooperierten, um dem König ans Bein zu pinkeln.'
  }
].map(Object.freeze));
