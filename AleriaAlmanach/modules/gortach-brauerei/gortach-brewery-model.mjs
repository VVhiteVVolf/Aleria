// Build-time editorial composition. Rendering, editing and trading remain owned by
// the existing Story, Guild and Trade Catalog systems.
const ASSETS = './public/assets/gortach-brauerei';
const FAMILY = '../Stammbäume/assets/images/portraits/haus-ru-gortach';
const CREST = '../Stammbäume/assets/images/houses/Leitheach/clan-ru-gortach.png';
const MARK = `${ASSETS}/brauzeichen.png`;
const ORIGIN = 'Broch an Ear · Tír na Tonn · Fürstentum Leitheach';
const paragraph = text => `<p>${text}</p>`;

export const BEERS = [
  { id: 'orbharr', name: 'Òrbharr', subtitle: 'Die goldene Ernte · Hausbier', strength: '4,7', tags: ['Brot', 'Honig', 'Haselnuss'],
    maturation: 'Jung ausgeschenkt; Holz dient vor allem Lagerung und Transport.', occasions: ['Alltag', 'Schankstube', 'Tafel'],
    availability: 'Das bekannteste und am weitesten verbreitete Gortach-Bier; auch über den Seehandel erhältlich.' },
  { id: 'dubhbharr', name: 'Dubhbharr', subtitle: 'Die schwarze Ernte · Dunkelbier', strength: '5,8', tags: ['Röstmalz', 'Nuss', 'Kakao'],
    maturation: 'Meist jung; ausgewählte Sude reifen mehrere Monate in Leitheacher Eiche.', occasions: ['Lange Abende', 'Herbst & Winter'],
    availability: 'Ganzjährig gebraut. Die fassgereifte Variante ist seltener und im Winter besonders begehrt.' },
  { id: 'gealbharr', name: 'Gealbharr', subtitle: 'Die helle Ernte · Frühstücksbier', strength: '3,4', tags: ['Helles Brot', 'Birne', 'Honig'],
    maturation: 'Kurze Lagerung, keine geschmackliche Eichenreife; möglichst frisch ausschenken.', occasions: ['Frühstück', 'Herzhafte Speisen'],
    availability: 'Vor allem in und um Broch an Ear; für lange Reisen weniger geeignet.' },
  { id: 'ciarbharr', name: 'Ciarbharr', subtitle: 'Die Dämmerernte · Rotbier', strength: '5,2', tags: ['Karamellmalz', 'Roter Apfel', 'Honig'],
    maturation: 'Gewöhnlich ohne Eichenreife; einzelne Festsude ruhen mehrere Monate im Fass.', occasions: ['Dämmerung', 'Feierabend'],
    availability: 'Regulärer Ausschank; besondere Fasssude werden für Feste und Familienanlässe zurückgelegt.' },
  { id: 'turas', name: 'Turas', subtitle: 'Die Reise · Seefahrerbier', strength: '6,8', tags: ['Hopfen', 'Kräuter', 'Trocken'],
    maturation: 'Kräftiger gehopft und weitgehend trocken vergoren; sorgfältig gearbeitete Reisefässer.', occasions: ['Seefahrt', 'Aufbruch', 'Proviant'],
    availability: 'Für lange Überfahrten bestimmt; gute Lagerbedingungen bleiben auch auf See entscheidend.' },
  { id: 'moine', name: 'Mòine', subtitle: 'Der Torf · Rauchbier', strength: '5,7', tags: ['Torf', 'Heide', 'Malz'],
    maturation: 'Getorftes Òrbharr-Malz; gewöhnlich mindestens ein halbes Jahr in Leitheacher Eiche.', occasions: ['Rauchbier', 'Ruhiger Abend'],
    availability: 'Die Menge hängt von Ernte, Torf und Reife ab. Bei großer Nachfrage muss man auf fertige Fässer warten.' }
];

export const WHISKIES = [
  { id: 'gealbharr-18', name: 'Gealbharr', age: 18, tags: ['Honig', 'Gelber Apfel', 'Bienenwachs'],
    maturation: '18 Jahre ausschließlich in ehemaligen Gealbharr-Fässern; keine Nachreife.', availability: 'Der klassische Achtzehnjährige und Maßstab des Hauses.' },
  { id: 'orbharr-18', name: 'Òrbharr', age: 18, tags: ['Malz', 'Brot', 'Haselnuss'],
    maturation: 'Gealbharr-Grundreife, anschließend zweite Reife in frisch geleerten Òrbharr-Fässern.', availability: 'Klassische Abfüllung mit besonders ausgeprägtem Charakter der Muttergerste.' },
  { id: 'ciarbharr-18', name: 'Ciarbharr', age: 18, tags: ['Roter Apfel', 'Honig', 'Trockenfrucht'],
    maturation: 'Gealbharr-Grundreife, anschließend zweite Reife in frisch geleerten Ciarbharr-Fässern.', availability: 'Die fruchtigste klassische Abfüllung; auch als Caddach der Dämmerung bekannt.' },
  { id: 'dubhbharr-18', name: 'Dubhbharr', age: 18, tags: ['Walnuss', 'Brotkruste', 'Kakao'],
    maturation: 'Gealbharr-Grundreife, anschließend zweite Reife in ausgewählten Dubhbharr-Fässern.', availability: 'Kräftige ungetorfte Abfüllung mit dunklem Malzcharakter.' },
  { id: 'turas-18', name: 'Turas', age: 18, tags: ['Kräuter', 'Eiche', 'Trocken'],
    maturation: 'Gealbharr-Grundreife, anschließend zweite Reife in frisch geleerten Turas-Fässern.', availability: 'Unter Seeleuten als Whisky der Heimkehr bekannt; der Beiname steht nicht auf dem Etikett.' },
  { id: 'grosse-reise-22', name: 'Die große Reise', age: 22, tags: ['Sechs Fassarten', 'Vielschichtig', 'Feiner Torfrauch'],
    maturation: '16 Jahre Gealbharr → 2 Jahre Òrbharr → 18 Monate Ciarbharr → 1 Jahr Dubhbharr → 1 Jahr Turas → 6 Monate Mòine.',
    availability: 'Eine bestimmte Abfüllung der experimentellen 22-jährigen Reihe. Andere Zweiundzwanzigjährige können andere Fassfolgen besitzen.' },
  { id: 'moine-18', name: 'Mòine', age: 18, peated: true, tags: ['Torfrauch', 'Heide', 'Bienenwachs'],
    maturation: 'Getorfter Grundbrand; Gealbharr-Grundreife und zweite Reife in frisch geleerten Mòine-Fässern.', availability: 'Der einzige klassische Achtzehnjährige aus getorftem Malz.' },
  { id: 'orbharr-28', name: 'Òrbharr', age: 28, tags: ['Alter Honig', 'Quitte', 'Ausgeprägt wachsig'],
    maturation: 'Vom ersten Tag an Òrbharr-Fässer; später erneuter Wechsel in frisch geleerte Òrbharr-Fässer. Keine Gealbharr-Grundreife.',
    availability: 'Seltenste und älteste regelmäßig vorgesehene Abfüllung. In schlechten Jahren wird kein Fass freigegeben.' }
];

function buildGuildPage() {
  const person = (name, id, detail) => ({ name, detail, image: `${FAMILY}/${id}-gortach.png`, imageFormat: 'portrait' });
  return {
    pageTitle: 'Familie, Zunft & Handschrift', guildPage: true,
    image: `${FAMILY}/kinneth-gortach.png`, imageFit: 'contain', imagePosition: 'center',
    quote: 'Ein gutes Bier muss nicht wissen, wer den Krug hält.',
    stats: [['Sitz', 'Broch an Ear'], ['Region', 'Tír na Tonn · Leitheach'], ['Träger', 'Familie Gortach'], ['Hausoberhaupt', 'Kinneth Gortach'], ['Handwerke', 'Brauerei & Brennerei']],
    guild: {
      crestImage: CREST, portraitFormat: 'portrait', sideWidth: 100, connectionPortraitHeight: 100,
      biographyTitle: 'Eine Familie mit Malz an den Händen',
      biographyText: [
        'Wer bei den Gortach einkehren will, begegnet einem Haus, dessen Ansehen aus gelebtem Handwerk erwächst. Seine Brauerei gehört zum Alltag Broch an Ears: Fischer, Küfer, Händler und Adlige kennen denselben malzigen Geschmack. Die Familie ist stolz auf ihren Ruf, aber nicht darauf, den Krug nur vornehmlich gedeckten Tischen vorzubehalten.',
        'Als Gemeinschaft von Brauern, Mälzern, Brennern und Küfern besitzt der Gortach-Hof den Charakter einer gewachsenen Handwerkszunft. Verwandtschaft hält das Haus zusammen; Erfahrung und Ausbildung entscheiden darüber, wer einen Sud, eine Darre oder ein Fass beurteilen kann. Ein Braumeister wird durch seinen Namen nicht schon zum Brennmeister.',
        'Kinneth Gortach ist seit 1731 Laird von Broch an Ear. Mit ihm steht heute ein Angehöriger jener Familie an der Spitze des Hauses, deren Geschichte mit Stadt und Brauerei verwachsen ist. Die Porträts seiner lebenden Verwandten geben dieser Überlieferung Gesichter; die fachliche Verantwortung bleibt bei den jeweils ausgebildeten Meistern.'
      ].map(paragraph).join(''),
      abilitiesTitle: 'Woran man einen Gortach erkennt',
      abilities: [
        { title: 'Geselligkeit ohne Standesdünkel', detail: 'Ein Krug verbindet Hafen, Werkstatt und Adelstafel. Das Familienwappen zeigt zwei einander umarmende Zecher.', icon: CREST },
        { title: 'Eigensinn mit gutem Grund', detail: 'Sicherere Werkzeuge sind willkommen. Mehr Ausbeute allein rechtfertigt keine Änderung des Geschmacks.', icon: MARK },
        { title: 'Geduld statt Abkürzung', detail: 'Ob Saatgut, Daube oder Torfbier: Was noch Zeit braucht, wird nicht vorzeitig freigegeben.', icon: MARK },
        { title: 'Humor über den eigenen Fehler', detail: 'Die Geschichte vom verkaterten Mälzer wird weitererzählt. Sein Missgeschick lebt als sorgfältig gebrautes Mòine fort.', icon: MARK }
      ],
      historyTitle: 'Übernommenes Wissen, lebendige Tradition',
      historyText: [
        'Die alte Gerste war schon da, bevor die Gortach ihre Geschichte erforschten. Nach dem Abgleich alter Aufzeichnungen bestätigten Druiden den Fortbestand der Òrbharr-Linie. Das Haus versprach, sie zu bewahren, ohne sie gezielt auf höheren Ertrag zu züchten.',
        'Jahrhunderte später kam durch eine Heirat eine Brennerei zur Familie. Ihre Erbin brachte Anlagen, Aufzeichnungen und erfahrene Beschäftigte nach Broch an Ear. Sie wurde die erste Brennmeisterin des neuen Hauses. Ihr Name und der ihres Gortach-Gemahls sind in dieser Überlieferung nicht genannt.',
        'Bis heute bleiben beide Handwerke eigenständig. Die Brauer geben gute Fässer über den Hof weiter; die Brenner führen darin dieselbe Gerste auf einem längeren Weg fort.'
      ].map(paragraph).join(''),
      worksTitle: 'Was den Hof verlässt', works: [
        'Sechs Biere: Òrbharr, Dubhbharr, Gealbharr, Ciarbharr, Turas und Mòine.',
        'Sechs klassische Achtzehnjährige, die 22-jährige Große Reise und der 28-jährige Òrbharr.',
        'Eichenfässer, deren erste Geschichte im Bier und deren zweite im Whisky liegt.'
      ],
      triviaTitle: 'Eigenheiten des Hauses', trivia: [
        '„Die schwarze Gerste?“ — „Im Darrenhaus.“ Dubhbharr ist ein Bier, keine eigene Gerstensorte.',
        'Gealbharr begrüßt den Morgen, Òrbharr begleitet den Tag, Ciarbharr empfängt die Dämmerung und Dubhbharr gehört der Nacht.',
        'Die Brauer erklären, dass ihr Getränk bereits gut sei. Die Brenner stimmen zu und brennen trotzdem.'
      ],
      connectionsTitle: 'Die heutige Familie', connections: [
        person('Kinneth Gortach', 'kinneth', 'Geboren 1673 · Laird von Broch an Ear seit 1731. Das heutige Oberhaupt des Hauses.'),
        person('Jodhrán Gortach', 'jodhran', 'Geboren 1678 · Angehöriger der älteren lebenden Generation, Gemahl Joneens und Vater von Séamus und Híomhar.'),
        person('Peighneachan Gortach', 'peighneachan', 'Geboren 1690 · Erster in der Erbfolge des Laird. Hausnachfolge und Meisterausbildung sind unterschiedliche Aufgaben.'),
        person('Carthach Gortach', 'carthach', 'Geboren 1657 · Tochter Fuirseachs und Rosmertas, Ordensmitglied. Sie dient dem Clan außerhalb der weltlichen Erbfolge.')
      ],
      contractsTitle: 'Versprechen & Verantwortung', contracts: [
        { title: 'Die Linie der Òrbharr', text: 'Saatgut zurückbehalten, Saatfelder trennen, fremden Wuchs entfernen. Keine Kreuzung zur Ertragssteigerung.', icon: MARK },
        { title: 'Das Erbe des Brennhauses', text: 'Überlieferte Brennweise und Form der alten Brennblasen erhalten; die Ausbildung bleibt ein eigenes Handwerk.', icon: MARK }
      ],
      documentsTitle: 'Hof, Besitz & Familienbuch', documents: [
        { title: 'Brauhaus & Brennhaus', text: 'Mälzböden, Darre, Quelle, Küferei, Fasskeller und Lagerhäuser rund um den gemeinsamen Hof.', icon: MARK },
        { title: 'Felder & Eichenbestände', text: 'Höfe um Broch an Ear, getrennte Saatfelder und Holzbestände für Leitheacher Fassdauben.', icon: MARK },
        { title: 'Stammbaum der Ru’Gortach', text: 'Die überlieferte Familie mit ihren ursprünglichen Porträts und Verbindungen.', icon: CREST, link: '../Stammbäume/Stammbaum.html?family=haus-ru-gortach&mode=view' }
      ],
      footer: 'Bewahren heißt bei den Gortach: niemals aufhören, es zu benutzen.'
    }, commentSequence: []
  };
}

function story(title, image, blocks) {
  return { pageTitle: title, image: `${ASSETS}/${image}.png`, imageWidth: 38,
    imageFit: 'contain', imagePosition: 'center', description: blocks.join('\n'), commentSequence: [] };
}

function productItem(product, blocks, whisky = false) {
  const category = whisky ? 'whisky' : 'bier';
  const title = whisky ? `Caddach Gortach · ${product.age} Jahre · ${product.name}` : product.name;
  return {
    id: `${category}-${product.id}`, category, title,
    subtitle: whisky ? `Albischer Whisky · ${product.peated ? 'getorft' : 'ungetorft'}` : product.subtitle,
    image: `${ASSETS}/${whisky ? 'whisky' : 'bier'}-${product.id}.png`, imageFormat: 'portrait', imageFit: 'contain', imagePosition: 'center', imageHeight: 420,
    badge: whisky ? `${product.age} Jahre` : `${product.strength} % vol.`, tags: product.tags,
    descriptionTitle: 'Charakter, Handwerk & Geschichten', description: blocks.join('\n'),
    featuresTitle: 'Steckbrief', features: [
      { icon: '✦', text: 'Gerste: ausschließlich Òrbharr, die alte Muttergerste.' },
      { icon: '◈', text: whisky ? 'Alkoholgehalt: 46 % vol.' : `Alkoholgehalt: ungefähr ${product.strength} % vol.` },
      { icon: '◷', text: product.maturation },
      ...(whisky ? [{ icon: '◇', text: 'Natürliche Farbe aus Destillat und Fass; Quellwasser des Hauses zur Trinkstärke.' }] : [])
    ],
    originTitle: 'Herkunft', origin: ORIGIN,
    usageTitle: whisky ? 'Charakter' : 'Am Tisch & unterwegs', usageTags: product.occasions || product.tags,
    priceTitle: 'Preis', priceMin: '', priceMax: '', priceFill: 0, currencyCode: 'K', currencyLabel: 'Kupferstücke', currencyIcon: '◈',
    priceNote: 'Für diese Abfüllung ist noch kein Verkaufspreis festgelegt.',
    conditionsTitle: 'Verfügbarkeit & Besonderheiten', conditions: product.availability,
    attributes: [], sealImage: MARK
  };
}

function assortmentPage(products, manuscript, offset, whisky = false) {
  return {
    pageTitle: whisky ? 'Caddach Gortach · Acht Abfüllungen' : 'Das Biersortiment · Sechs Charaktere', tradeCatalogPage: true,
    tradeCatalog: {
      title: whisky ? 'Die Whiskys des Caddach Gortach' : 'Die Biere der Familie Gortach',
      subtitle: whisky ? 'Sechs Achtzehnjährige · Die große Reise · Òrbharr mit 28 Jahren' : 'Von der hellen Ernte bis zum Torfrauch',
      headerIcon: MARK, noteIcon: '✦', noteTitle: whisky ? 'Òrbharr, Eiche & Zeit' : 'Eine Muttergerste, sechs Biere',
      noteText: whisky ? 'Alle acht Abfüllungen mit 46 % vol. Jede Fassfolge bewahrt ihre eigene Geschichte.' : 'Gebraut in Broch an Ear aus Òrbharr, der alten Muttergerste der Gortach.',
      categories: [{ id: whisky ? 'whisky' : 'bier', label: whisky ? 'Whisky · Getränke' : 'Bier · Getränke' }],
      allLabel: whisky ? 'Alle Whiskys' : 'Alle Biere',
      searchPlaceholder: 'Nach Name, Charakter oder Fass suchen …', filterLabel: 'Suche',
      items: products.map((product, index) => productItem(product, manuscript[index + offset].blocks, whisky)),
      footerCards: []
    }, commentSequence: []
  };
}

function roman(number) {
  let result = '';
  for (const [value, symbol] of [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) {
    while (number >= value) { result += symbol; number -= value; }
  }
  return result;
}

export function buildGortachBrewery(manuscript) {
  if (manuscript.length !== 20) throw new Error('Expected all 20 source sections.');
  const distillery = manuscript[10].blocks;
  const split = distillery.findIndex(block => block.includes('Gebrannt wie damals'));
  if (split < 1) throw new Error('Missing distillery chapter boundary.');
  const pages = [
    story('Broch an Ear · Ein ehrliches Bier', '01-broch-an-ear', manuscript[0].blocks),
    buildGuildPage(),
    story('Òrbharr · Die Muttergerste', '03-muttergerste', manuscript[1].blocks),
    story('Vom Feld in den Krug', '04-brauhaus', [...manuscript[2].blocks, '<h3>Das Sortiment</h3>', ...manuscript[3].blocks]),
    assortmentPage(BEERS, manuscript, 4),
    story('Caddach Gortach · Ein mitgebrachtes Erbe', '11-brennerei-erbe', distillery.slice(0, split)),
    story('Zwei Handwerke, ein Hof', '12-fasshof', distillery.slice(split)),
    story('Ein Brand, sechs Wege', '13-handschrift', manuscript[11].blocks),
    assortmentPage(WHISKIES, manuscript, 12, true)
  ].map((page, index) => ({ ...page, pageTitle: `${roman(index + 1)}. — ${page.pageTitle}` }));
  return {
    id: 'gortach-brauerei', title: 'Die Brauerei der Familie Gortach', subtitle: 'Òrbharr, Eiche & Zeit · Caddach Gortach',
    type: 'Brauerei & Brennerei', category: 'Gilden & Zünfte · Brauer & Brenner',
    image: MARK, icon: '✦', stamp: 'BROCH AN EAR · LEITHEACH',
    multipage: true, appendCommentsPage: false, enablePageComments: true, pages
  };
}
