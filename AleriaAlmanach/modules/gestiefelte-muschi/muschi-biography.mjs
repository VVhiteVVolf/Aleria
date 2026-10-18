import { BIELLE_EMBLEM, DESELE_EMBLEM, muschiPerson } from './muschi-people.mjs';
export function buildHelvianeBiography() {
  return { crestImage: DESELE_EMBLEM, biographyTitle: 'Helviane Desele · Was sich retten ließ',
    biographyText: '<p>Helviane wurde 1668 als <strong>Bielle</strong> in Brevanor geboren. Ihr eigenes Haus verband Ritterdienst mit Weinbau; durch ihre Ehe kam sie zu den <strong>Desele</strong>, deren Champagnia und Parfüme weit über die Heimat hinaus einen Namen hatten. Sie lernte, wie man Seltenheit verkauft, ohne selbst um Aufmerksamkeit zu bitten. Mit zweiundsiebzig Jahren beherrscht sie diese Kunst unverändert.</p>',
    historyTitle: 'Zwei Fluchten und ein neuer Besitz',
    historyText: '<p>Vor etwas mehr als zwanzig Jahren brachte die <strong>Triarchie</strong>, ein Bund dreier Hexer, Brevanor, Talyndor und Deitheach unter ihre Gewalt. Helvianes Kinder kämpften gegen den Umsturz. Die Niederlage zerriss die Familie: Angehörige blieben zurück, gingen verloren oder suchten nach Streit eigene Wege. Über das Schicksal jedes Einzelnen gibt Helviane keine vollständige Auskunft.</p><p>Sie floh zunächst nach <strong>Lothir</strong>. Als die Triarchie auch dort Fuß fasste, setzte sie den Weg bis nach <strong>Estryll</strong> fort. Vier Hausbedienstete und die Reste ihrer Garde hielten ihr die Treue. Ein Teil des Vermögens, Geschäftspapiere, Duftrezepte und ein kleiner Bestand alter Flaschen erreichten mit ihr Gwynthor.</p><p>Vom geretteten Vermögen kaufte sie ein bestehendes Etablissement und formte daraus die <strong>Gestiefelte Muschi</strong>. Heute tragen Ausschank, Unterhaltung, Zimmer und private Gesellschaft den laufenden Betrieb. Die seltenen Brevanorer Flaschen sind ein endlicher Besitz; gewöhnliche Getränke und Tirnaras Tabak kommen über die heutigen Handelswege.</p>',
    abilitiesTitle: 'Hinter dem Fächer', abilities: [
      { title: 'Geschäftssinn', icon: '../IconOrdner/Cktraits/Trait_education_stewardship_3.png', detail: 'Unterscheidet tägliche Einnahmen von gerettetem Vermögen und verkauft die letzten alten Flaschen niemals beiläufig.' },
      { title: 'Hochmut', icon: '♛', detail: 'Ein Blick über den Fächer genügt gewöhnlich, um einen aufdringlichen Gast an seinen Platz zu erinnern.' },
      { title: 'Beharrlichkeit', icon: '../IconOrdner/Big Traits/Trait_patient.png', detail: 'Hat Heimat und Stellung verloren, aber die Fähigkeit bewahrt, einen Haushalt zu führen und neu zu beginnen.' }
    ],
    worksTitle: 'Ihr heutiges Haus', works: ['Ausschank, Tanz, Musik und Spiel als Mittelpunkt des Abends.', 'Private Gesellschaft nach Absprache sowie sechs vermietbare Kammern.', 'Letzte Bielle- und Desele-Flaschen aus Brevanor; Desele-Duftrezepte in neuer Gwynthorer Abfüllung.'],
    triviaTitle: 'Was hinter den Vorhängen bleibt', trivia: ['Offiziell werden Tabak, Pfeifen und Zigarren angeboten. Unter der Hand lässt sich hier gelegentlich auch ein Rauschmittel auftreiben; Herkunft und Preis werden nicht offen angeschlagen.', 'Wer eine Mahlzeit sucht, wird zur Lachenden Nixe verwiesen. Die Gestiefelte Muschi unterhält keine Küche.'],
    quotesTitle: 'Helviane', quotes: ['„Mein Lieber, das war ein Preis. Keine Einladung zum Feilschen.“'],
    connectionsTitle: 'Herkunft und heutige Vertraute', connections: [
      { name: 'Haus Bielle · Brevanor', image: BIELLE_EMBLEM, detail: 'Ihr Geburtshaus: Ritter und Winzer. Turm und zweifarbige Trauben erinnern an die verlorenen Güter.' },
      { name: 'Haus Desele · Brevanor', image: DESELE_EMBLEM, detail: 'Ihr angeheiratetes Haus: Champagnia, Duftkompositionen und die verbliebene Garde.' },
      { name: 'Klingende Münze', image: '../Fraktionen/assets/emblems/gilden/klingende-muenze.webp', detail: 'Handelsweg für Tirnaras Tabakwaren und ergänzende Bestellungen. Daraus folgt keine behauptete persönliche Gildenmitgliedschaft Helvianes.' },
      ...['alain', 'gaston', 'colette', 'mariette', 'daric'].map(key => { const p = muschiPerson(key); return { name: p.name, image: p.portrait, imageFormat: 'portrait', detail: p.role }; })
    ], documentsTitle: 'Die beiden Häuser', documents: [
      { title: 'Bielle', icon: BIELLE_EMBLEM, text: 'Brevanors Ritter und Winzer · Helvianes Geburtshaus.', link: '../Stammbäume/Stammbaum.html?family=haus-bielle&mode=view' },
      { title: 'Desele', icon: DESELE_EMBLEM, text: 'Champagnia, Parfüme und ein geretteter Teil des alten Haushalts.', link: '../Stammbäume/Stammbaum.html?family=haus-desele&mode=view' }
    ] };
}
