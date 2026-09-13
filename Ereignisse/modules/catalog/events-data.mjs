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
    startYear: 1627, endYear: 1647, duration: '20 Jahre', note: 'Erster Bürgerkrieg', articleHref: null,
    summary: 'Der Krieg der Prätendenten war der blutigste und längste Bürgerkrieg in der Geschichte Aldrimars. Über einen Zeitraum von zwanzig Jahren verwüstete er das Königreich und drohte, die Linie des Königshauses vollständig auszulöschen. Der verheerende Konflikt entflammte nach der brutalen Ermordung des frisch gekrönten Hochkönigs, die durch ein heimtückisches Mordkomplott zweier seiner Halbgeschwister inszeniert wurde. Diese Tat löste einen erbitterten Kampf um den Thron aus, bei dem verschiedene Fraktionen und Prätendenten um die Macht rangen, während das Land in Blut und Chaos versank.'
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
    startYear: 1717, endYear: 1720, duration: '3 Jahre', note: 'Vennyr wird zu Fjordheim', articleHref: null,
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
    startYear: 1733, endYear: 1733, duration: 'Ein Tag', note: 'Beinahe Auslöschung des Hauses Iomrach', articleHref: null,
    summary: 'Im Jahr 1733 wagte eine größere Gruppe der Schwarzblut Marodeure einen Raubzug an der Südküste Leitheachs. Die Piraten griffen im Schutz der Nacht die Burg Broch an Clais an und töteten oder verschleppten den gesamten Clan der Iomrach. Ohne den Schutz, den Broch an Clais an der Flussmündung bot, konnten die Schiffe der Piraten bis nach Dun Laog hinaufsegeln, um es direkt anzugreifen. Bei diesem Streifzug verschleppten, raubten und töteten die Piraten viele Alben, bevor Verstärkung aus Westen und Osten eintreffen konnte. Letztlich wurden die Piraten zwar zurückgeschlagen, jedoch waren zu jenem Zeitpunkt die meisten der Räuber bereits entkommen und mit ihnen auch viele der Alben.'
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
