// Editorial seed for the household guard. Uses the shared story and hierarchy
// templates; names and portraits refer to the existing character records.
(function registerDraigLeibgarde() {
  const id = 'draig-leibgarde';
  if (SECTIONS.some(section => section.entries?.some(entry => entry.id === id))) return;

  const assetRoot = './public/assets/draig-leibgarde';
  const portraitRoot = '../Stammbäume/assets/images/portraits';
  const emblem = `${assetRoot}/drachengarde-wappen-elfenbein-v1.png`;
  const paragraphs = items => items.map(text => `<p>${text}</p>`).join('');
  const vacant = count => Array.from({ length: count }, () => ({
    title: 'Freier Platz', subtitle: '', portrait: '', text: ''
  }));
  const person = (title, subtitle, portrait = '', text = '') => ({ title, subtitle, portrait, text });
  const story = (pageTitle, illustration, copy, stats = []) => ({
    pageTitle,
    image: `${assetRoot}/${illustration}.png`,
    imageWidth: 38, imageFit: 'contain', imagePosition: 'center',
    description: paragraphs(copy), stats, commentSequence: []
  });

  const activeLevels = [
    { label: 'Kommandant der Hausmacht', nodes: [
      person('Steffan Draig', 'Kommandant der Hausmacht', `${portraitRoot}/haus-draig/steffan-draig.jpg`)
    ] },
    { label: 'Hauptmann der Leibgarde', nodes: vacant(1) },
    { label: 'Leutnante', nodes: vacant(2) },
    { label: 'Ritter der Leibgarde', nodes: vacant(5) },
    { label: 'Waffenknechte · erste Reihe', nodes: [
      person('Llywelyn Coeddu', 'Leibgardist · Waffenknecht', `${portraitRoot}/haus-coeddu/llywelyn-coeddu.png`),
      person('Hywel Craigddu', 'Leibgardist · Waffenknecht', `${portraitRoot}/haus-craigddu/hywel-craigddu.png`),
      person('Mathon Curiad', 'Leibgardist · Waffenknecht', `${assetRoot}/mathon-curiad.png`),
      ...vacant(2)
    ] },
    { label: 'Waffenknechte · zweite Reihe', nodes: vacant(5) },
    { label: 'Rekruten', nodes: vacant(5) },
    { label: 'Knappen', nodes: vacant(5) },
    { label: 'Pagen', nodes: vacant(5) }
  ];
  const formerLevels = [
    { label: 'Pensioniert', nodes: [
      person('Brenric Coeddu', 'Waffenknecht im Ruhestand', '',
        'Llywelyns Vater. Veteran des Großen Krieges; diente unter Sir Maredudd.'),
      ...vacant(4)
    ] },
    { label: 'Verstorben', nodes: [
      person('Idwalladr Arwydd', '1653–1720', `${portraitRoot}/haus-arwydd/idwalladr-arwydd.jpg`),
      ...vacant(4)
    ] }
  ];

  const entry = {
    id, title: 'Draig Leibgarde',
    subtitle: 'Die persönliche Wacht des Hauses Draig',
    type: 'Leibgarde · Hausmacht', category: 'Cenyr · Celtigerns Wacht · Haus Draig',
    image: `${assetRoot}/steffan-burghof-v1.png`, symbol: emblem,
    icon: '⚔', stamp: 'HAUS DRAIG · LEIBGARDE',
    multipage: true, appendCommentsPage: false, enablePageComments: true,
    pages: [
      story('I. — Dem Haus anvertraut', 'steffan-burghof-v1', [
        'Wer im inneren Hof von Castell Draig an den aufgereihten Gardisten vorübergeht, sieht nur einen kleinen Teil der Macht des Hauses. Hinter den dunklen Rüstungen und roten Wappenröcken stehen Männer, denen weit mehr als ein Mauerabschnitt anvertraut ist: die Türen zu den Kammern, die Ruhe des Hofes und das Leben jener, die unter dem Schutz der Draig stehen.',
        'Die <strong>Draig Leibgarde</strong> bildet den engsten bewaffneten Dienst des Hauses. Ihr angestammter Wachbereich ist der <strong>Bergfried mit den Wohn- und Herrschaftsräumen</strong>. Während die übrigen Haustruppen die weiter gefassten Aufgaben der Hausmacht erfüllen, dient die Leibgarde dort, wo das Leben der Familie und ihres Haushalts stattfindet.',
        'Ihre besondere Stellung erwächst aus dieser Nähe. Ein sicherer Waffenarm gehört zum Dienst, doch ebenso zählen Verschwiegenheit, Aufmerksamkeit und die Gewissheit, sich auch in einer langen, ereignislosen Nacht auf den Mann vor der Tür verlassen zu können. <strong>Vertrauen, gute Schulung und Verlässlichkeit</strong> entscheiden über die Auswahl.',
        'Meist umfasst die Leibgarde <strong>weniger als fünfzig ausgewählte Waffenknechte und wenige Ritter</strong>. Sie werden aus der Hausmacht handverlesen. Wie die Hausmacht selbst ist auch die Leibgarde Bestandteil des Hauses Draig; die Hausmacht umfasst sämtliche Waffenknechte und Streitkräfte, die dem Haus angehören.'
      ], [
        ['Zugehörigkeit', 'Haus Draig · Teil der Hausmacht'],
        ['Angestammter Dienst', 'Bergfried von Castell Draig'],
        ['Stärke', 'Meist unter 50 Waffenknechte und Ritter'],
        ['Kommandant der Hausmacht', 'Steffan Draig']
      ]),
      story('II. — Hinter den Türen des Bergfrieds', 'bergfried-gang-v1', [
        'Ein stiller Gang kann ebenso viel Wachsamkeit verlangen wie ein Burgtor. Vor den Gemächern der Familie, an den Zugängen zum Thronsaal und zwischen den Räumen des Haushalts versieht die Leibgarde ihren täglichen Dienst. Sie kennt die Wege, die vertrauten Gesichter und jene Türen, an denen ein Besucher warten muss.',
        'Ihr Auftrag umfasst den <strong>Schutz der Behausung und ihrer Bewohner</strong>. Die Burg ist für sie zugleich Dienstort und anvertrautes Haus: Kammern, Säle und innere Zugänge bilden den Mittelpunkt ihrer Wacht. Ob eine Audienz bevorsteht oder die letzten Lichter verlöschen, die Verantwortung bleibt dieselbe.',
        'Besondere Fürsorge gilt denjenigen, die selbst keine Waffen führen. <strong>Prinzessinnen und junge Prinzen</strong> gehören ebenso zu den Schutzbefohlenen wie Angehörige der Familie, Ratsmitglieder, Beamte, Zofen und weitere Bedienstete. Wer im persönlichen Dienst der Draig steht, soll seinem Tagwerk nachgehen können, ohne bei jeder fremden Stimme im Gang nach einer Waffe greifen zu müssen.',
        'Ein guter Leibgardist versteht deshalb auch, wann Zurückhaltung geboten ist. Er wahrt Abstand, ohne unaufmerksam zu werden, und tritt vor, sobald sein Schutz gebraucht wird. Die Würde des Hauses zeigt sich auch darin, wie ruhig seine Wache ihren Dienst versieht.'
      ]),
      story('III. — Mit dem Haus auf dem Weg', 'gefolge-v1', [
        'Wenn die Tore sich für eine Reise öffnen, endet der Dienst der Leibgarde nicht an der Zugbrücke. Aus den Wachen der Kammern wird ein <strong>persönliches Geleit</strong>: auf dem Weg an einen fremden Hof, bei einer Reise ins Ausland oder bei einem Ausritt hinaus in die Wildnis.',
        'Zwischen Sattelzeug und Reisegepäck bleiben die vertrauten Gesichter nahe. Waffenknechte wie <strong>Llywelyn Coeddu, Hywel Craigddu und Mathon Curiad</strong> begleiten die ihnen Anvertrauten, halten beim Aufbruch die Wege frei und übernehmen auch fern des Bergfrieds die Wacht. Ihr Dienst folgt den Menschen des Hauses.',
        'Im Krieg tritt ein Teil der Leibgarde als <strong>Garde des ranghöchsten oder kommandierenden Familienmitglieds</strong> ins Feld. Sie schützt dessen Person und Stellung und vertritt an seiner Seite sichtbar die Gegenwart des Hauses Draig auf dem Schlachtfeld.',
        'Auch dort bleibt sie in die Hausmacht eingebunden. Nicht jeder Gardist zieht mit dem Feldgefolge: Der Schutz des zurückbleibenden Haushalts und der Dienst an den Kammern bestehen fort. Zwischen Burg und Feldlager trägt die Leibgarde dieselbe Verantwortung weiter.'
      ]),
      {
        pageTitle: 'IV. — Dienstordnung & Namen', hierarchyPage: true,
        image: `${assetRoot}/waffenkammer-v1.png`,
        hierarchy: {
          layoutMode: 'vertical', treeDisplayMode: 'tabs',
          cardFontScale: 100, portraitScale: 85, chartScale: 75,
          eyebrow: 'Haus Draig', subtitle: 'Leibgarde · Dienstordnung',
          centerLabel: 'Draig Leibgarde', emblem,
          sideImage: `${assetRoot}/waffenkammer-v1.png`,
          organizationTitle: 'Die Wacht des Hauses', motto: 'An den Türen. Auf den Wegen. An der Seite des Hauses.',
          description: paragraphs([
            'Unter Steffan Draig als Kommandant der Hausmacht führt der Hauptmann den Dienst der Leibgarde. Darunter stehen die Leutnante, die Ritter und die Waffenknechte; Rekruten, Knappen und Pagen schließen die Übersicht ab.',
            'Neben den Dienenden stehen die Namen jener, deren Wacht geendet hat: im Ruhestand oder im Tod.'
          ]),
          detailsTitle: 'Zugehörigkeit & Dienst',
          details: [
            { icon: '⚑', label: 'Haus', value: 'Draig' },
            { icon: '⌂', label: 'Sitz', value: 'Castell Draig · Bergfried' },
            { icon: '⚔', label: 'Verband', value: 'Teil der Hausmacht' },
            { icon: '♜', label: 'Stärke', value: 'Meist unter fünfzig Mann' }
          ],
          quote: '', chartTitle: 'Die Leibgarde & ihre Ehemaligen',
          chartIntro: 'Die beiden Waffenknechtreihen gehören demselben Rang an. Freie Plätze halten Raum für weitere Namen; sie stellen keine festgelegte Sollstärke dar. Pensionierte und Verstorbene stehen außerhalb der aktiven Befehlsfolge.',
          trees: [
            { id: 'draig-leibgarde-aktiv', label: 'Draig Leibgarde', levels: activeLevels },
            { id: 'draig-leibgarde-ehemalige', label: 'Ehemalige Leibgardisten', levels: formerLevels }
          ],
          footerNote: 'Waffenknechte und Ritter werden aus der Hausmacht ausgewählt. Ihr persönlicher Dienst gilt dem Haus Draig.'
        },
        commentSequence: []
      }
    ]
  };

  const tab = 'Gruppen';
  const path = ['Cenyr', 'Celtigerns Wacht', 'Haus Draig'];
  let section = SECTIONS.find(candidate => candidate.tab === tab
    && candidate.path?.length === path.length
    && path.every((part, index) => candidate.path[index] === part));
  if (!section) {
    section = {
      key: path[path.length - 1], tab, path,
      iconUrl: '../IconOrdner/ReiterIcons/Weltpfade/gruppen.png',
      desc: 'Die Gemeinschaften und bewaffneten Dienste des Hauses Draig.',
      entries: []
    };
    SECTIONS.push(section);
  }
  section.entries.push(entry);
})();
