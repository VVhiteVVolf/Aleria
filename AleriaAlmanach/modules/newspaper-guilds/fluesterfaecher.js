registerNewspaperGuild({
  id: 'fluesterfaecher', asset: 'fluesterfaecher', name: 'Der Flüsterfächer',
  reach: 'Hauptsitz Blutstadt · Lokalblätter in Cenyrs Haupt- und Grafenstädten',
  seat: 'Blutstadt', patron: 'Gildenhaus in der Blutstadt', tagline: 'Samt & Sünde',
  publicationModel: 'Eigenständige örtliche Gesellschaftsmagazine', price: '8 Kupferstücke in der Gwynthorer Ausgabe',
  story: [
    '<strong>Zwischen Salon und Schlüsselloch</strong>',
    'Ein Fächer verbirgt nicht nur ein Lächeln. Er lenkt den Blick, unterbricht ein Gespräch und macht eine beiläufige Geste zur Nachricht. <strong>Der Flüsterfächer</strong> versteht diese Sprache. Sein Stoff sind Salons, Mode, Luxus und die Beziehungen jener Menschen, deren Auftreten andere beobachten.',
    'Unter dem Leitsatz <strong>Samt & Sünde</strong> erscheinen gesellschaftliche Enthüllungen neben Zeichnungen, Stilurteilen und Berichten über das Nachtleben. Ein neuer Duft, eine auffällige Einladung oder eine unerwartete Nähe zwischen zwei Erwachsenen kann hier ebenso Gesprächsstoff liefern wie eine öffentliche Blamage. Die Feder darf spitz sein; belanglos soll sie nicht werden.',
    '<strong>Ein ferner Hauptsitz, eine nahe Gesellschaft</strong>',
    'Der Hauptsitz der Gilde liegt in der <strong>Blutstadt</strong>. Von dort werden Name und Stil des Magazins gewahrt. Die örtlichen Redaktionen dagegen kennen ihre eigenen Salons, Quellen und Lieblingsgestalten. Sie bestimmen Themen, Zeichnungen und Urteile <strong>vollständig vor Ort</strong>. Eine zentrale Gesamtausgabe gibt es nicht.',
    'In Cenyr ist das Magazin für <strong>Haupt- und Grafenstädte</strong> vorgesehen. Die Gwynthorer Lokalredaktion gehört zu den bereits eingerichteten Standorten. Ihr Publikum erwartet Nähe zur eigenen Gesellschaft: Wer wurde eingeladen, wer übergangen, und weshalb war ein bestimmter Tisch plötzlich leer?',
    '<strong>Geschmack als öffentliche Macht</strong>',
    'Der Flüsterfächer begleitet Ansehen, er kann es aber auch verändern. Ein schmeichelhaftes Bild weckt Aufmerksamkeit, ein treffender Spott bleibt lange im Gedächtnis. Zwischen Beobachtung, Urteil und bloßem Flüstern zu unterscheiden, gehört deshalb zu den anspruchsvollsten Aufgaben seiner Schreiber.'
  ],
  overview: ['<strong>Der Flüsterfächer</strong> ist eine Gesellschafts- und Schreibergilde mit Hauptsitz in der Blutstadt. Ihre örtlichen Magazine verbinden Gesellschaft, Stil, diskrete Beziehungen und bebilderte Satire.', 'Die Zentrale schützt <strong>Namen und Handschrift</strong>. Jede Lokalredaktion verantwortet ihre eigene Ausgabe, ihre Quellen und ihre Urteile.'],
  traits: [['Gesellschaftskenntnis', 'Salons, Einladungen und persönliche Beziehungen bilden das Umfeld der Berichte.', 'Diplomatie'], ['Zeichnung & Urteil', 'Porträts, Karikaturen und scharfzüngige Kolumnen geben dem Magazin seine Stimme.', 'Unterhaltung'], ['Diskretion', 'Vertrauliche Hinweise werden von belegten Aussagen und offenem Gerücht unterschieden.', 'Spionage']],
  history: ['Der übergeordnete Hauptsitz in der <strong>Blutstadt</strong> ist festgelegt. Für <strong>Gwynthor</strong> ist eine eigenständige Lokalredaktion eingerichtet.', 'Die Verbreitung innerhalb Cenyrs ist auf Haupt- und Grafenstädte ausgerichtet. Weitere konkrete Redaktionshäuser, ein Gründungsjahr und die persönliche Besetzung der Hauptleitung sind bislang nicht benannt.'],
  topics: ['Gesellschaft, Adel und Salonleben; Mode, Parfüm und Luxus.', 'Nachtleben und diskrete Beziehungen unter Erwachsenen.', 'Porträts, Karikaturen und die Kolumne der Giftigen Feder.', 'Durchs Schlüsselloch: ausdrücklich als unbestätigt geführtes Flüstern.'],
  trivia: ['Der Gwynthorer Verkaufspreis beträgt acht Kupferstücke.', 'Das Gildenemblem verbindet ein Gesicht hinter dem Fächer mit einer goldenen Feder.', 'Der gemeinsame Stil verpflichtet die Lokalredaktionen nicht zu gemeinsamen Inhalten.'],
  connections: [{ type: 'heading', title: 'Gesellschaftliches Umfeld' }, { type: 'connection', name: 'Salons, Ateliers und Veranstaltungsorte', detail: 'Orte der Beobachtung und des Austauschs; daraus folgt keine feste Zugehörigkeit zur Gilde.', image: '../IconOrdner/Organisationsicons/Unterhaltung.png', imageFormat: 'square' }],
  obligations: [['Namen und Stil wahren', 'Die Zentrale betreut das gemeinsame Zeichen und die erkennbare Handschrift des Magazins.'], ['Örtliche Eigenverantwortung', 'Themen, Quellen, Zeichnungen und Urteile gehören zur jeweiligen Lokalredaktion.']],
  property: [['Gildenhaus in der Blutstadt', 'Sitz der Hauptleitung und Verwahrung von Zeichen, Musterblättern und Gildenverzeichnissen.'], ['Gwynthorer Salonredaktion', 'Örtliche Schreib- und Zeichenstube für die Gesellschaft der Grafenstadt.']],
  governance: ['Die Hauptleitung in der <strong>Blutstadt</strong> wahrt die gemeinsame Identität des Flüsterfächers. Sie betreut Gildenname, Stil, Handwerk und die Verbindung der angeschlossenen Häuser.', 'Sie legt nicht fest, über welche Begegnung eine örtliche Ausgabe berichtet. Die Themen und Urteile entstehen in den Lokalredaktionen. Die zentrale Ordnung schafft dafür einen gemeinsamen Rahmen.'],
  governanceRemit: 'Gildenzeichen, Stil und Verbindung der Häuser',
  head: ['Oberster Fächermeister', 'Vertritt die Gilde von der Blutstadt aus und wahrt Namen und Ansehen des Flüsterfächers.', 'Diplomatie'],
  council: ['Rat der Feder und des Fächers', 'Berät die gemeinsame Handschrift und schlichtet Angelegenheiten zwischen den angeschlossenen Häusern.', 'Unterhaltung'],
  offices: [['Meister des Stils', 'Bewahrt Muster und Gestaltungsgrundsätze, ohne die örtliche Themenwahl zu übernehmen.', 'Unterhaltung'], ['Bewahrer der Siegel', 'Verwahrt das Gildenzeichen und bestätigt die Zugehörigkeit eigenständiger Lokalredaktionen.', 'Administration'], ['Meister der Zeichenkunst', 'Fördert die Ausbildung in Porträt, Modezeichnung und Karikatur innerhalb der Gilde.', 'Unterhaltung'], ['Meister der vertraulichen Wege', 'Ordnet geschützte Übergaben und die diskrete Verbindung zwischen den Gildenhäusern.', 'Diplomatie']],
  governanceFooter: 'Die Hauptleitung schützt das gemeinsame Gesicht des Magazins; jede Lokalredaktion verantwortet ihre eigene Stimme.',
  networkIntro: ['<strong>Ein gemeinsamer Fächer, viele örtliche Stimmen.</strong> Der Hauptsitz verbindet die Häuser über Namen und Stil. Die gesellschaftlichen Geschichten werden dort geschrieben, wo ihre Leser leben.'],
  networkModel: 'Die Blutstadt wahrt das Gildenzeichen und die gemeinsame Handschrift. Örtliche Häuser betreiben ihre Redaktion und Ausgabe eigenständig.',
  networkNote: 'Für Cenyr sind Haupt- und Grafenstädte als Erscheinungsorte vorgesehen. Hier wird nur die bereits konkret eingerichtete Gwynthorer Redaktion zusätzlich zum Hauptsitz aufgeführt.',
  sites: [
    { name: 'Blutstadt', kind: 'headquarters', region: 'Übergeordneter Hauptsitz', description: 'Wahrt Namen und Stil des Magazins sowie die Verbindung seiner Gildenhäuser; die örtlichen Inhalte entstehen unabhängig.' },
    { name: 'Gwynthor', kind: 'editorial', region: 'Grafenstadt · Celtigerns Wacht · Cenyr', image: '../Stammbäume/assets/images/regions/gwynthor.png', description: 'Eigenständige Salonredaktion für Gesellschaft, Mode, Luxus, Nachtleben und diskrete Beziehungen in Gwynthor.', href: '../Orte/grossstadt.html?id=gwynthor', publicationHref: '../Zeitungen/zeitung.html?zeitung=fluesterfaecher-gwynthor' }
  ],
  work: [
    '<strong>Beobachtung ist ein Handwerk</strong>',
    'Wer für den Flüsterfächer arbeitet, muss den Unterschied zwischen einer auffälligen Geste und einer belastbaren Geschichte erkennen. Ein verlassener Platz im Salon kann Absicht, Zufall oder eine ausgezeichnete Gelegenheit für ein Missverständnis sein. Gute Schreiber sammeln deshalb Einzelheiten, bevor sie ihnen eine Bedeutung geben.',
    'Die örtlichen Federn pflegen ihre Kontakte zu Salons, Ateliers, Spielhäusern und Tavernen. Diskretion ist dabei kein Versprechen, alles zu verschweigen. Sie bedeutet, Übergaben zu schützen und Hinweise nicht leichtfertig mit der Person zu verwechseln, die sie gebracht hat.',
    '<strong>Von der Skizze zur spitzen Feder</strong>',
    'Eine Zeichnung kann mit wenigen Strichen zeigen, was ein langer Text umkreist. Lehrlinge üben Gesichter, Haltung, Stoffe und die Wirkung einer Übertreibung. Ein guter Spott trifft eine erkennbare Eigenheit. Eine gedankenlose Verzerrung verrät vor allem den schlechten Blick ihres Zeichners.',
    'Text und Bild werden gemeinsam betrachtet. Schmeichelei, Satire, Modeurteil und Tatsachenbericht tragen unterschiedliche Verantwortung. Noch unbestätigte Hinweise gehören als <em>Flüstern</em> kenntlich gemacht; sie werden nicht allein durch eine hübsche Seite zu Gewissheiten.',
    '<strong>Gemeinsamer Stil, örtliches Urteil</strong>',
    'Die Hauptleitung bewahrt Zeichen und Muster der Gilde. Ob eine bestimmte Feier oder eine neue Mode die nächste Ausgabe verdient, entscheidet jedoch die Lokalredaktion. Ihre Schreiber müssen die Gesellschaft kennen, über die sie urteilen, und mit den Antworten leben, die das gedruckte Urteil hervorruft.',
    '<strong>Aufträge hinter geschlossenen Türen</strong>',
    'Eine geschützte Briefübergabe, die Suche nach einer gestohlenen Zeichnung oder die Herkunft eines gefälschten Gesellschaftsblattes kann Fremde mit der Gilde verbinden. Mitunter beginnt ein Auftrag auch mit der schlichten Bitte, zu bestätigen, ob ein angeblich berühmter Gast überhaupt anwesend war.'
  ]
});
