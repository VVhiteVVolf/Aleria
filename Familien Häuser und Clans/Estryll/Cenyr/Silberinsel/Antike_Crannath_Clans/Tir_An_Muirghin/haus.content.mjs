// Gemeinsame redaktionelle Quelle. Die bestehende vorbereitete Genealogie bleibt erhalten.
const assetRoot = 'Estryll/Cenyr/Silberinsel/Antike_Crannath_Clans/Tir_An_Muirghin/assets';

export const HOUSE_CONTENT = {
  id: 'haus-tir-an-muirghin', name: 'Tir An Muirghin', type: 'Clan', page: 'haus.html',
  county: 'Silberinsel', liege: '', territoryId: 'silberinsel', territoryName: 'Silberinsel',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Silberinsel/Grafschaft Silberinsel.html',
  parentHouseId: '', extinct: false,
  showMotto: false, registerPage: true, prepared: false,
  contentVersion: '20261103-silberinsel-v1', biographySourceRevision: 1, biographyPreviousDefaultFingerprints: [],
  biographyIntroTitle: 'Über den Clan', biographyHistoryTitle: 'Geschichte des Clans',
  biographySummary: {
    overview: 'Tir An Muirghin ist ein antikes Crannath-Geschlecht der Silberinsel. Vor der cenyrischen Grafschaft gehörte die Insel zu seinem Herrschaftsraum; Ard Iasgleann war eine seiner blühenden Hafenstädte. Der Clan wird auf der Rangstufe eines Mor Tiarna geführt. Seine alte Inselherrschaft ging verloren, doch sein Erbe lebte weiter.',
    history: 'Seefahrt, Bergbau und Handwerk prägten die alte Crannath-Kultur auf der Insel. Im Äon der Seefahrer wurde sie zu einem frühen Ziel der Norrnaigh. Die Eroberung traf die Tir An Muirghin schwer und löschte sie nahezu aus. Ein Kadettenzweig fand an der Sonnenküste Zuflucht; die Ortsüberlieferung führt Haus Blach auf dessen Verbindung mit einem dortigen Clan zurück. Später vertrieb Gawan Neidr die Eindringlinge von der Silberinsel. Durch seine Heirat mit Mallaidh Muirghin entstand eine weitere Verbindung des alten Geschlechts zur späteren Herrschaft der Neidr. Ein pauschales Aussterben des Clans ist damit nicht festgelegt.',
    character: 'Die überlieferte Geschichte steht für den Übergang von der älteren Crannath-Welt zur späteren cenyrischen Ordnung. Ein eigener Leitspruch, ein ausführlicher Wertekanon und namentlich bekannte frühe Oberhäupter sind bisher nicht überliefert.',
    customs: 'Die alte Kampftradition der Crannath beruhte auf den Tiarna, deren persönliches Können und Rang wichtiger waren als große Aufgebote. Die Beschreibung dieser Tradition bildet den kulturellen Hintergrund des Clans; einzelne eigene Rituale und Heldentaten sind nicht benannt.',
    holdings: 'Ard Iasgleann ist als historischer Herrschaftsort auf der Silberinsel belegt. Die einst blühende Hafenstadt liegt heute in Ruinen. Seefahrt, Schiffbau, Bergbau und Handwerk gehörten zu den Fertigkeiten ihrer früheren Crannath-Bevölkerung. Weitere einzelne Besitzungen des Clans sind bislang nicht gesichert.',
    culture: 'Der Clan gehörte zur Crannath-Kultur und verehrte den Alten Pantheon. Die Quelle nennt keine einzelnen Schutzgottheiten. Das spätere alerische Kirchenleben der Silberinsel wird deshalb nicht rückwirkend zum Glauben der Tir An Muirghin erklärt.',
    relations: 'Die Hausquelle nennt die Avallornier als historische Freunde und die Norrnaigh als Feinde. Diese Einordnung gehört zur alten Epoche und begründet keine heutigen Fehden oder Vasallenbindungen. Das Familienerbe führt über die überlieferte Verbindung mit Gawan Neidr in die spätere Dynastie der Silberinsel.'
  },
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
  allies: [],
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
    { type: 'Grafschaft', name: 'Silberinsel', slug: 'silberinsel' },
    { type: 'Region', name: 'Antike Crannath Clans', slug: 'antike-crannath-clans' },
    { type: 'Clan', name: 'Tir An Muirghin', slug: 'haus-tir-an-muirghin' }
  ],
  profile: {
    highestTitle: 'Mor Tiarna (Graf)', rank: 'Mor Tiarna (Graf)', houseType: 'Antiker Crannath-Clan', motto: '', quoteAuthor: '',
    seat: 'Ard Iasgleann (historisch)', affiliation: 'Silberinsel · antikes Crannath-Geschlecht', liege: '',
    troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', milestoneOne: '', milestoneTwo: '',
    patron: '', knightingPatron: '', people: 'Crannath', wealth: '', religion: 'Alter Pantheon', patronDeities: '',
    origin: 'Antike Crannath der Silberinsel', cadetBranches: '', allies: 'Avallornier (historisch)', enemies: 'Norrnaigh (historisch)'
  },
  omitMilitaryProfile: true,
  sections: {
    overview: [
      'Tir An Muirghin ist ein antikes Crannath-Geschlecht der Silberinsel. Die Insel gehörte vor der cenyrischen Grafschaft zu seinem Herrschaftsraum. Das Geschlecht wird im bestehenden Register auf der Rangstufe eines Mor Tiarna geführt. Ard Iasgleann ist als historischer Herrschaftsort belegt.',
      'Die alte Inselherrschaft ging verloren. Das Erbe der Tir An Muirghin blieb jedoch sowohl an der Sonnenküste als auch in der späteren Dynastie Neidr lebendig. Aus der nahezu vollständigen Vernichtung während der Eroberung wird kein pauschaler Aussterbestatus des Geschlechts abgeleitet.'
    ],
    history: [
      'Vor der Gründung der cenyrischen Grafschaft entwickelte sich unter den Tir An Muirghin eine blühende Crannath-Kultur. Ard Iasgleann war eine ihrer Hafenstädte. Seefahrt, Schiffbau, Bergbau und Handwerk prägten die Insel.',
      'Das Äon der Seefahrer brachte die Invasion der Norrnaigh. Die Silberinsel wurde zu einem ihrer frühen Ziele, Ard Iasgleann fiel den Angriffen zum Opfer und der Clan wurde nahezu vollständig ausgelöscht. Ein Kadettenzweig fand an der Sonnenküste Zuflucht und verband sich mit einem dort ansässigen Clan. Der Ortsüberlieferung zufolge ging Haus Blach aus dieser Verbindung hervor.',
      'Die spätere Vertreibung der Eindringlinge durch Gawan Neidr leitete eine neue Herrschaftszeit ein. Gawan verband sich mit einer Überlebenden der Tir An Muirghin, die die bestehende Neidr-Überlieferung Mallaidh Muirghin nennt. Diese Verbindung gehört zur Herkunft der Neidr. Der Verlust der alten Herrschaft bedeutet deshalb keine vollständige Auslöschung des Familienerbes.'
    ],
    traditions: 'Eigene Feste, Erbbräuche und besondere Rituale der Tir An Muirghin sind nicht näher beschrieben. Die erhaltene Überlieferung behandelt vor allem die alte Crannath-Kultur und deren Übergang zur späteren cenyrischen Ordnung.',
    knighthood: [
      'Das ältere Crannath-Tiarnatum unterschied sich vom später eingeführten Rittertum. Die Tiarna bildeten eine kleine Schicht angesehener Elitekrieger, die für Verteidigung und Ordnung einstand. Bei begrenzten Konflikten setzte man auf ausgewählte Kämpfer; die Überlieferung betont den Anspruch, die Zivilbevölkerung zu verschonen.',
      'Persönliches Können und gesellschaftlicher Rang standen im Vordergrund. Beschrieben werden vergleichsweise einfache Leder- und Pelzrüstungen sowie Waffen aus Bronze oder Kupfer. Die Ausrüstung diente dabei auch als Zeichen des Standes. Diese allgemeine Crannath-Überlieferung ist der kulturelle Hintergrund des Clans, keine Liste individueller Krieger oder eigener Schlachten.',
      'Mit der Ankunft der Norrnaigh traf diese Ordnung auf große, gut ausgerüstete Verbände und deren Einhejaren. Die alten Formen begrenzter Ehrenkämpfe boten darauf keine ausreichende Antwort. Erst die Ankunft der Avallornier und die spätere Ausbildung des Ritterstandes veränderten die Kriegführung grundlegend.'
    ],
    holdings: 'Der alte Herrschaftsraum lag auf der Silberinsel. Ard Iasgleann ist als früherer Herrschaftsort ausdrücklich belegt; die einst blühende Hafenstadt liegt heute in Ruinen. Ihre Crannath-Bevölkerung war für Seefahrt, Schiffbau und Bergbau bekannt. Weitere einzelne Güter werden hier nicht ergänzt.',
    cultureReligion: 'Die Tir An Muirghin gehörten zur Crannath-Kultur und verehrten den Alten Pantheon. Einzelne Hauspatrone sind nicht genannt. Der spätere Glaube der cenyrischen Silberinsel wird nicht auf den antiken Clan übertragen.',
    conflictsAlliances: 'Die Avallornier werden als historische Freunde genannt, die Norrnaigh als Feinde der alten Epoche. Das Geschlecht steht im bestehenden Register außerhalb der heutigen Neidr-Lehensordnung. Die spätere dynastische Verbindung mit den Neidr ist Teil der Inselgeschichte, keine moderne Vasallenbindung.',
    values: 'Die allgemeine Überlieferung des Crannath-Tiarnatums betont persönlichen Mut, Ansehen und begrenzte ehrenvolle Kämpfe. Ein eigener verbindlicher Leitspruch oder ein davon unterschiedener Wertekanon des Clans sind nicht ausgearbeitet.',
    succession: 'Eine namentlich gesicherte frühere Oberhauptfolge oder heutige Erbfolge liegt nicht vor. Der Fortbestand des Familienerbes ist beschrieben; eine vollständige gegenwärtige Clanstruktur bleibt offen.',
    court: 'Einzelne Hofangehörige und Amtsinhaber sind nicht namentlich überliefert. Die leeren modernen Hof- und Figurenvorlagen liefern keine historischen Besetzungen.',
    familyTree: 'Die vorhandene vorbereitete Familienakte der Tir An Muirghin ist eingebettet. Die genealogischen Platzhalter der alten Hausvorlage werden nicht zusätzlich übernommen.',
    historicalFigures: 'Eine eigenständige historische Figurengalerie ist nicht überliefert. Die Verbindung Mallaidh Muirghins mit Gawan Neidr wird in der bestehenden Neidr-Akte geführt.'
  },
  images: {
    crest: '../Stammbäume/assets/images/houses/Silberinsel/Antike Crannath Clans/tir-an-muirghin.png',
    scene: `${assetRoot}/hausdarstellung-original.png`, sceneAlt: 'Originale historische Tiarna-Darstellung der Tir An Muirghin mit Speer, grünblauem Mantel und langem Fischschild',
    banner: '../Stammbäume/assets/images/regions/silberinsel.png'
  },
  illustrationCategory: 'Historische Clan-Darstellung', cadets: [], founder: null, heads: [], heirs: [], offices: [],
  figuresTitle: 'Historische Persönlichkeiten des Clans', figures: [],
  trivia: ['Das Erbe des alten Clans ist über Mallaidh Muirghin mit der Herkunft der Neidr verbunden.', 'Die Überlieferung Ard Iasgleanns führt Haus Blach auf einen an die Sonnenküste geflüchteten Kadettenzweig zurück.'],
  currentHead: 'Nicht namentlich überliefert', firstHeir: '',
  relatedRecords: [{
    icon: '../Stammbäume/assets/images/houses/Silberinsel/haus-neidr.png', title: 'Haus Neidr',
    text: 'Die bestehende Neidr-Akte führt Gawan Neidr und Mallaidh Muirghin.',
    link: '../Stammb%C3%A4ume/Stammbaum.html?family=haus-neidr&mode=view'
  }, {
    icon: '../Stammbäume/assets/images/houses/Sonnenküste/Gersteküste/haus-blach.png', title: 'Haus Blach',
    text: 'Die Ortsüberlieferung Ard Iasgleanns beschreibt den Ursprung des Hauses aus einem geflüchteten Kadettenzweig.',
    link: '../Stammb%C3%A4ume/Stammbaum.html?family=haus-blach&mode=view'
  }]
};
