// Dünne historische Quelle; bestehende Leerakte, Rang und Ortszuordnung bleiben unverändert.
export const HOUSE_CONTENT = {
  id: 'haus-ard-follmhar', name: 'Haus Ard Follmhar', type: 'Clan', page: 'haus.html',
  county: 'Klaueninsel', liege: '', territoryId: 'grafschaft-klaueninsel', territoryName: 'Klaueninsel',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Klaueninsel/Grafschaft Klaueninsel.html',
  parentHouseId: '', extinct: false, showMotto: false, registerPage: true, prepared: true,
  contentVersion: '20261103-klaueninsel-v1', biographySourceRevision: 2, biographyPreviousDefaultFingerprints: [],
  biographyIntroTitle: 'Über das historische Haus', biographyHistoryTitle: 'Historischer Zusammenhang',
  biographySummary: {
    overview: 'Ard Follmhar ist als antikes Crannath-Haus von Ard Dunrath auf der Klaueninsel verzeichnet. Seine genaue Rangstufe, eine namentliche Gründerfamilie und eine zusammenhängende Hauschronik sind bisher nicht ausgearbeitet. Das Haus steht außerhalb der heutigen Arth-Lehensordnung.',
    history: 'Ard Dunrath war einst eine bedeutende Hauptstadt der Inselgruppe. Die Stadt lag auf einem Gipfel und wurde von den Nordmännern während ihrer Eroberung geplündert und zerstört. Als die Arth die Inseln besiedelten, lag sie bereits seit längerer Zeit in Trümmern. Die Zerstörung des Ortes belegt den Verlust der alten Herrschaft, aber nicht das Schicksal sämtlicher Angehöriger des Hauses.',
    character: 'Die erhaltene Hausvorlage beschreibt vor allem den allgemeinen kulturellen Hintergrund der Crannath-Tiarna. Persönliches Können, gesellschaftlicher Rang und begrenzte ehrenvolle Kämpfe stehen dort vor großen Aufgeboten. Ein eigener Leitspruch oder besondere Taten der Ard Follmhar sind nicht überliefert.',
    holdings: 'Ard Dunrath ist der belegte historische Sitz. Von seiner erhöhten Lage aus ließ sich die Insel überblicken; heute ist der Ort eine Ruine. Weitere einzelne Güter oder fortbestehende Besitzansprüche des Hauses sind nicht benannt.',
    culture: 'Die Quelle ordnet das Haus den Crannath und dem Alten Pantheon zu. Einzelne Schutzgottheiten und besondere eigene Rituale fehlen bislang.',
    relations: 'Avallornier und Norrnaigh erscheinen als historische Freunde und Feinde im allgemeinen Überlieferungsrahmen. Daraus entsteht keine heutige Vasallenbindung oder Fehde. Eine aktuelle Oberhauptfolge und der genaue Fortbestand der Familienlinien bleiben offen.'
  },
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' }, allies: [],
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' }, { type: 'Grafschaft', name: 'Klaueninsel', slug: 'klaueninsel' },
    { type: 'Region', name: 'Antike Häuser', slug: 'antike-haeuser' }, { type: 'Historischer Sitz', name: 'Ard Dunrath', slug: 'ard-dunrath' },
    { type: 'Haus', name: 'Haus Ard Follmhar', slug: 'haus-ard-follmhar' }
  ],
  profile: {
    highestTitle: 'Offen', rank: 'Offen', houseType: 'Antikes Crannath-Haus', motto: '', quoteAuthor: '',
    seat: 'Ard Dunrath', affiliation: 'Klaueninsel · Antike Häuser', liege: '',
    troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: '', milestoneOne: '', milestoneTwo: '', patron: '', knightingPatron: '',
    people: 'Crannath', wealth: '', religion: 'Alter Pantheon', patronDeities: '', origin: 'Antike Crannath der Klaueninsel',
    cadetBranches: '', allies: 'Avallornier (historischer Überlieferungsrahmen)', enemies: 'Norrnaigh (historischer Überlieferungsrahmen)'
  }, omitMilitaryProfile: true,
  sections: {
    overview: 'Haus Ard Follmhar ist als antikes Crannath-Geschlecht mit historischem Sitz in Ard Dunrath registriert. Seine genaue Rangstufe ist offen. Eine heutige Unterordnung unter Arth ist nicht überliefert.',
    history: ['Ard Dunrath war eine alte Hauptstadt der Inselgruppe. Die Stadt lag auf einem Gipfel, von dem aus die Insel überblickt werden konnte. Sie wurde während der nordmännischen Eroberungen geplündert und vernichtet.', 'Als die Arth die Inseln besiedelten, war der Ort bereits seit geraumer Zeit verwüstet. Die heutige Ruine bewahrt die Erinnerung an die ältere Herrschaft. Das Ende einer Stadt und die Vernichtung sämtlicher Angehöriger eines Hauses sind dabei verschiedene Aussagen; die überlieferte Ortsgeschichte legt keinen pauschalen Aussterbestatus fest.'],
    traditions: 'Besondere Hausrituale, Feste und Erbbräuche sind bisher nicht ausgearbeitet.',
    knighthood: ['Die Hausvorlage beschreibt das frühere Crannath-Tiarnatum als allgemeinen kulturellen Zusammenhang. Die Tiarna waren angesehene Elitekrieger, deren persönliches Können und Rang die begrenzten Auseinandersetzungen ihrer Zeit prägten. Die Überlieferung betont ehrenvolle Kämpfe unter ausgewählten Kriegern und den Anspruch, die übrige Bevölkerung zu schonen.', 'Leder- und Pelzrüstung sowie Waffen aus Bronze oder Kupfer gehörten zum beschriebenen Erscheinungsbild. Ausrüstung konnte auch den Stand anzeigen. Diese allgemeinen Angaben sind keine Liste individueller Ard-Follmhar-Krieger.', 'Mit den nordmännischen Heerscharen und ihren Einhejaren geriet diese Ordnung unter Druck. Die spätere Ankunft der Avallornier und die Entwicklung des Rittertums veränderten die Kriegführung. Eigene Schlachten oder benannte Helden des Hauses werden daraus nicht ergänzt.'],
    holdings: 'Ard Dunrath ist der belegte historische Sitz und heute eine Ruine. Zusätzliche Burgen, Güter oder gegenwärtige Besitzansprüche sind nicht überliefert.',
    cultureReligion: 'Die Hausquelle nennt Crannath-Kultur und den Alten Pantheon. Einzelne Gottheiten und eigene religiöse Hausbräuche bleiben unbekannt. Späterer cenyrischer Glaube wird nicht auf das antike Haus zurückübertragen.',
    conflictsAlliances: 'Die Vorlage nennt Avallornier als Freunde und Norrnaigh als Feinde der alten Epoche. Konkrete eigene Bündnisverträge, heutige Fehden und eine moderne Vasallenbindung sind nicht ausgearbeitet.',
    values: 'Die allgemeine Crannath-Tiarna-Überlieferung betont persönlichen Mut und ehrenvolle begrenzte Kämpfe. Ein zusätzlicher verbindlicher Wertekanon oder Hausleitspruch ist nicht vorhanden.',
    succession: 'Namentliche frühe Oberhäupter und eine aktuelle Erbfolge sind nicht überliefert. Der Fortbestand einzelner Familienlinien ist bisher nicht geklärt.',
    court: 'Die leeren Hof- und Personenvorlagen der alten Quelle enthalten keine namentlich belegten Besetzungen.',
    familyTree: 'Die vorhandene vorbereitete Familienakte von Ard Follmhar ist eingebettet. Ihre unbekannten Gründer bleiben unverändert.',
    historicalFigures: 'Eigene historische Persönlichkeiten sind bisher nicht namentlich ausgearbeitet.'
  },
  images: {
    crest: '../Stammbäume/assets/images/houses/Klaueninsel/haus-ard-follmhar.png',
    scene: 'Estryll/Cenyr/Klaueninsel/Antike_Haeuser/Haus_Ard_Follmhar/assets/hausdarstellung-original.png',
    sceneAlt: 'Originale historische Clanfigur der Ard Follmhar mit Speer, Pelzbesatz und violettem Gewand',
    banner: '../Stammbäume/assets/images/regions/klaueninsel.png'
  }, illustrationCategory: 'Historische Clan-Darstellung', cadets: [], founder: null, heads: [], heirs: [], offices: [],
  figuresTitle: 'Historische Persönlichkeiten des Hauses', figures: [], trivia: [], currentHead: 'Nicht überliefert', firstHeir: ''
};
