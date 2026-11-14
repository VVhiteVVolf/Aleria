// Nutzerfestlegungen vom 14.11.2026 und bereits bekannte Familienidentitäten.
// Keine private Täterakte ist Quelle dieses Ermittlungsstands.
export const REPORT_DOCUMENT_ID = 'meredydd-fleischsammler-ermittlungsbuch';
export const REPORT_ITEM_ID = 'fleischsammler:meredydds-ermittlungsbuch';
export const REPORT_AREA = Object.freeze({ width: 8192, height: 6300, center: { x: 6028, y: 2784 }, radius: 1024 });

const body = (number, name, age, familyId, personId, organ, place, point, neck, tissue, connections, background) => ({
  number, kind: 'recovered', name, age, familyId, personId, organ, place, point, neck, tissue, connections, background,
  cause: 'Strangulation', motive: 'Ein persönliches Tatmotiv ist nicht belegt.'
});
const trace = (number, place, point, evidence) => ({ number, kind: 'unrecovered', name: '', age: null, familyId: '', personId: '', organ: null, place, point, evidence });
const unidentified = (...fields) => ({ ...body(...fields), provisionalIdentity: true });

// Registerfolge: zuerst die sechs örtlichen Familien. Sie ist keine behauptete
// zeitliche Tatfolge; Ceridwen starb vor Wochen, Lleian erst vor wenigen Tagen.
export const FLEISCHSAMMLER_CASES = Object.freeze([
  body(1, 'Ffraid Marchwern', 25, 'haus-marchwern', 'ffraid-marchwern', 'Herz',
    'In einer flachen, vom Gestütsweg abgewandten Wegmulde beim Marchwern-Gestüt.', { x: 5360, y: 2780 },
    'Ausgeprägte Druckspur am Hals, wenige Abwehrverletzungen; ein überraschender Angriff von hinten erscheint wahrscheinlich.',
    'Ein kleines, sauber abgegrenztes Stück am Oberschenkel fehlte. Die Schnittflächen ließen sich nicht durch Tierfraß erklären.',
    'Tochter Gwrgi Marchwerns und Mareds; Schwester Rhuns, Eluneds und Rhunedds. Der Gestütsdienst verbindet den Haushalt mit Haus Wyrm. Daraus folgt kein Verdacht gegen das Haus.',
    'Arbeitete in der Pferdepflege. Eine familiäre Fehde, ein Streit mit einem Käufer oder ein auf sie gerichteter Anschlag ist bislang nicht belegt.'),
  body(2, 'Lleian Dolweth', 18, 'haus-dolweth', 'lleian-dolweth', 'Leber',
    'Hinter der niedrigen Feldhecke am Verbindungsweg nördlich der Dolweth-Kate.', { x: 5780, y: 3400 },
    'Unregelmäßige Druckspur und Schürfungen am Hals; kleine Verletzungen an Fingern und Unterarmen sprechen für Gegenwehr.',
    'Ein etwas größeres Stück aus der seitlichen Oberschenkelmuskulatur war glatt herausgetrennt. An weiteren Rändern fanden sich spätere Fraßspuren.',
    'Tochter Aled Dolweths und Sioneds, ältere Schwester Peredurs. Keine belegte Verbindung zu einer kämpfenden oder verborgenen Fraktion.',
    'Vor wenigen Tagen getötet. Der bescheidene Haushalt bietet keinen erkennbaren Grund für einen gezielten Raubmord.'),
  body(3, 'Catrin Bragwen', 20, 'haus-bragwen', 'catrin-bragwen', 'Nieren',
    'Im grasigen Graben am südlichen Zufahrtsweg des Brauerhofs Bragwen & Eiddfer.', { x: 6430, y: 2210 },
    'Deutliche Druckspur, zusätzliche Kratzspuren am Hals und Blutergüsse an einem Unterarm. Gegenwehr ist wahrscheinlich.',
    'Zwei kleine, verschieden große Fleischstücke fehlten am Oberarm. Die glatten Schnitte unterschieden sich von den späteren Tierverletzungen.',
    'Tochter Owain Bragwens und Eleris, Schwester Iestyns. Durch dessen Ehe mit Rhiain Eiddfer mit dem zweiten Brauerhaushalt verschwägert. Verbindung zur Teyrngarch Brauerzunft über die gemeinsame Arbeit.',
    'Kam eines Tages nicht nach Hause. Ein Streit um Braurechte oder Lieferungen ist als Tatmotiv nicht nachgewiesen.'),
  body(4, 'Ceridwen Tirfelyn', 22, 'haus-tirfelyn', 'ceridwen-tirfelyn', 'Augen',
    'In einem Gebüsch neben dem Feldweg zwischen Tirfelyn-Hof und Jagdhaus Helfaen, innerhalb des eingezeichneten Suchkreises.', { x: 6010, y: 3180 },
    'Schmale Druckspur am Hals und geringe Abwehrspuren; der Befund ist mit einem unerwarteten Angriff von hinten vereinbar.',
    'Ein flaches Stück am Unterschenkel fehlte; saubere Schnittränder. Die übrigen Verletzungen weisen nicht auf die gezielte Entnahme eines weiteren Organs hin.',
    'Tochter Caradog Tirfelyns und Enids, Schwester Gareths und Bedwyrs. Mit Gorwyn Helfaen verlobt. Die Helfaen trauern um seine Verlobte; aus ihrer eigenen Familie ist kein Opfer festgestellt.',
    'Wollte Gorwyn besuchen und war am folgenden Morgen nicht zurückgekehrt. Ihr Tod liegt wenige Wochen zurück. Keine belegte Eifersuchts- oder Familienfehde.'),
  body(5, 'Gwenith', 32, 'haus-brynial', 'gwenith-spouse-brynial', 'Lungen',
    'Zwischen Sträuchern an einem kleinen Ackerweg südwestlich der Brynial-Kate.', { x: 6690, y: 2630 },
    'Breite Druckspur am Hals und Blutergüsse an beiden Händen; sie dürfte versucht haben, den Griff oder die Schlinge zu lösen.',
    'Ein größeres Stück aus der Wade war mit glatten Rändern entfernt. Der erste Eindruck eines Tierangriffs hielt dem Vergleich der Schnitte nicht stand.',
    'Ehefrau Rhydderch Brynials, Mutter Iantos und Anwens. Ihre Herkunftsfamilie ist nicht benannt; sie gehört zum Brynial-Haushalt.',
    'Die zurückgebliebenen Kinder und der kleine Hofhaushalt sind betroffen. Ein persönlicher Feind oder eine Verbindung zu einer Fraktion ist nicht belegt.'),
  body(6, 'Morwen Eiddfer', 23, 'haus-eiddfer', 'morwen-eiddfer', 'Milz',
    'An einem von der Brauerhofzufahrt abgehenden Hohlweg, hinter der ersten Böschung.', { x: 6520, y: 2190 },
    'Druckspur mit einer seitlichen Unterbrechung und mehrere oberflächliche Schürfungen. Die Unterschiede können durch Bewegung und Gegenwehr entstanden sein.',
    'Ein schmales Stück am Oberarm und ein kleineres an der Wade fehlten. Beide Entnahmen waren präzise geschnitten.',
    'Tochter Cadell Eiddfers und Ffions, Schwester Rhiains und Tegids. Über Rhiain und Iestyn mit Bragwen verbunden; beruflich mit der Teyrngarch Brauerzunft.',
    'Half bei Brauarbeit und Lieferungen. Die Verluste beider Brauerfamilien belegen für sich weder einen Zunftkonflikt noch eine Täterschaft aus dem Braugewerbe.'),
  unidentified(7, 'Meleri', 27, '', '', 'Magen',
    'In einer kleinen Senke neben dem östlichen Landweg, auf dem örtlichen Wegabschnitt in Richtung Bronhir.', { x: 6360, y: 3020 },
    'Durchgehende Druckspur, kaum erkennbare Abwehrverletzungen. Ein Überfall in der Dämmerung ist eine Arbeitshypothese.',
    'Ein kleines Stück der Oberschenkelmuskulatur war glatt entnommen.',
    'Ich führe die Unbekannte unter dem Arbeitsnamen „Meleri“. Ihr wirklicher Name und ihre Familie sind nicht ermittelt; das Alter ist geschätzt. Eine Verbindung zu einem örtlichen Haushalt oder einer Fraktion ist nicht belegt.',
    'Der Fund am Landweg lässt eine Reise zwischen Gwynthor und Bronhir möglich erscheinen. Vielleicht war sie eine reisende Bäuerin. Herkunft, Beruf, Reiseziel und persönliches Tatmotiv sind nicht bekannt.'),
  unidentified(8, 'Awenna', 16, '', '', 'Bauchspeicheldrüse',
    'Hinter einer Feldmauer am südöstlichen Abzweig des Landwegs, noch innerhalb des Suchkreises.', { x: 6520, y: 3290 },
    'Deutliche Halsdruckspur und oberflächliche Verletzungen an einer Hand; kurze Gegenwehr ist möglich.',
    'Ein größeres Stück am Oberarm fehlte. Die Schnittflächen waren gleichmäßig und von Tierfraß unterscheidbar.',
    '„Awenna“ ist mein Arbeitsname für dieses nicht identifizierte Mädchen, kein ermittelter Vorname. Ihr Alter ist geschätzt. Familie, Herkunft und mögliche Verbindungen sind unbekannt.',
    'Vielleicht war sie allein unterwegs; auch eine Reise in Richtung Bronhir ist nur eine Möglichkeit. Es gibt keine gesicherte letzte Sichtung, aus der sich ihr Weg oder Reiseziel ableiten ließe. Motiv unbekannt.'),
  unidentified(9, 'Olwen', 34, '', '', 'Gallenblase',
    'Unter einer niedrigen Baumgruppe am westlichen Rand des abgegrenzten Landwegnetzes.', { x: 5200, y: 2900 },
    'Unregelmäßige Halsdruckspur und Blutergüsse an einem Ellenbogen; der Befund lässt einen Kampf um das Gleichgewicht zu.',
    'Ein kleines Stück an der Wade war mit einem sauberen Schnitt abgetrennt; weitere Schäden waren unregelmäßiger Fraß.',
    'Unter „Olwen“ verzeichne ich eine weiterhin unbekannte Frau; der Name ist nur ein Arbeitsname, das Alter eine Schätzung. Niemandem aus den örtlichen Familien konnte sie sicher zugeordnet werden.',
    'Eine fremde Bäuerin auf der Durchreise kommt als Möglichkeit in Betracht. Dafür fehlen bestätigte Angaben zu Herkunft, Tätigkeit und Reiseweg. Keine nachgewiesene Fraktionsverbindung; Motiv unbekannt.'),
  unidentified(10, 'Rhoswen', 21, '', '', 'Schilddrüse',
    'Im Bewuchs hinter einer Wegbiegung südlich des Brauerhofgebiets.', { x: 6180, y: 2390 },
    'Ausgeprägte Druckspur und mehrere Kratzer am Hals. Die unterschiedlichen Spuren sind mit stärkerer Gegenwehr vereinbar.',
    'Zwei flache Stücke unterschiedlicher Größe fehlten am Oberschenkel. Saubere Schnitte ohne entsprechende Zahnspuren.',
    '„Rhoswen“ ist ein von mir vergebener Arbeitsname. Die tatsächliche Identität ist offen, ebenso Familien- und Fraktionszugehörigkeit. Das Alter beruht auf einer Schätzung.',
    'Die Lage am Weg könnte zu einer Durchreisenden passen; woher sie kam und wohin sie wollte, wissen wir nicht. Kleiner Schmuck war vorhanden. Welche Habe ihr zuvor gehörte und was fehlt, lässt sich ohne Identifizierung nicht verlässlich bestimmen.'),
  unidentified(11, 'Teleri', 29, '', '', 'Zunge',
    'An der Rückseite eines kleinen Feldrains neben dem Verbindungsweg im südlichen Suchgebiet.', { x: 5980, y: 3600 },
    'Deutliche Halsdruckspur bei wenigen Abwehrverletzungen. Der Tod durch Strangulation ist von der späteren Organentnahme zu unterscheiden.',
    'Ein mittelgroßes Stück der Wadenmuskulatur fehlte. Glatte Schnittränder, daneben spätere Fraßverletzungen.',
    'Ich nenne die Unbekannte in dieser Akte „Teleri“. Das ist ein Arbeitsname und kein Zeugnis ihrer Identität; auch das Alter ist geschätzt. Familie und Fraktionskontakte sind nicht ermittelt.',
    'Vielleicht war sie eine Landarbeiterin oder auf einer Reise zwischen Gwynthor und Bronhir. Beides bleibt eine Vermutung. Eine bestätigte letzte Sichtung, ihr Ausgangsort, Reiseziel und ein persönliches Tatmotiv fehlen.'),
  trace(12, 'Graben an einem Feldweg östlich des Marchwern-Gestüts.', { x: 5590, y: 2700 },
    'Große Blutmenge, eine abgerissene Rockschlaufe und Schleifspuren abseits des Wegs; kein Leichnam. Weibliche Person wird aus dem Kleidungsrest vermutet.'),
  trace(13, 'Buschsaum am Verbindungsweg nördlich des Tirfelyn-Hofs.', { x: 5680, y: 3060 },
    'Blutgetränkter Boden, zerrissener Unterrocksaum und ein zurückgelassener Schuh. Die örtliche Suche blieb ohne Leichenfund.'),
  trace(14, 'Geschützte Wegmulde südöstlich des Brauerhofs.', { x: 6710, y: 2360 },
    'Erhebliche Blutspuren, ein abgerissener Beutelriemen und blutige Stoffstücke; der Verlauf abseits des Wegs ähnelt den geborgenen Fällen.'),
  trace(15, 'Schmale Feldzufahrt im östlichen Teil des Suchkreises.', { x: 6900, y: 2880 },
    'Blutlache, zerbrochener Korb und Fetzen eines Frauenkleids. Keine Person sicher identifiziert, kein Körper gefunden.'),
  trace(16, 'Heckenrand am südlichen Landweg innerhalb der Kreisgrenze.', { x: 6210, y: 3500 },
    'Starke Blutspuren, ein einzelner Schuh und eine zerrissene Haube. Schleifspuren enden im Bewuchs; kein Leichnam trotz Nachsuche.')
]);

export const FAMILY_REPORTS = Object.freeze([
  { familyId: 'haus-marchwern', name: 'Marchwern', victim: 'Ffraid Marchwern, 25', text: 'Gwrgi und Mared Marchwern beklagen ihre Tochter Ffraid. Ihre Geschwister Rhun, Eluned und Rhunedd müssen die Arbeit am Gestüt nun ohne sie fortführen; auch Gwynogs Angehörige helfen bei Zucht und Pflege. Ffraid gehörte zu den Frauen, die auf den Wegen zwischen Stall, Weiden und den benachbarten Höfen anzutreffen waren.\n\nDie Marchwern dienen Haus Wyrm und handeln mit Pferden. Beides ist bei den Erkundigungen zu berücksichtigen. Bisher liegt mir jedoch kein Hinweis vor, dass ein Streit um Pferde, Abgaben oder die Dienstpflicht den Anlass zu Ffraids Tod gab.' },
  { familyId: 'haus-dolweth', name: 'Dolweth', victim: 'Lleian Dolweth, 18', text: 'Lleians Tod liegt erst wenige Tage zurück. Aled und Sioned haben ihre Tochter verloren, Peredur seine ältere Schwester. Die Angehörigen teilen weiterhin die Arbeit an den wenigen Tieren, auf dem Acker und im Haus.\n\nVon einer gegen Lleian gerichteten Fehde oder einem Streit mit einer anderen Familie wissen wir nichts. Ich sehe derzeit keinen Grund, ihren Tod anders zu beurteilen als die übrigen Überfälle auf den Landwegen. Ihre letzten Wege und Begegnungen bleiben dennoch gesondert zu prüfen.' },
  { familyId: 'haus-bragwen', name: 'Bragwen', victim: 'Catrin Bragwen, 20', text: 'Owain und Eleri Bragwen trauern um ihre Tochter Catrin. Ihr Bruder Iestyn ist mit Rhiain Eiddfer verheiratet; die beiden haben die kleine Nerys. Die Verwandtschaft verbindet die Häuser eng, ebenso die tägliche Arbeit auf dem gemeinsamen Brauerhof.\n\nDort fehlt Catrin bei den Lieferungen und den Arbeiten, die sie mit ihren Angehörigen teilte. Seit auch Morwen Eiddfer getötet wurde, tragen beide Familien einen eigenen Verlust. Dass zwei Opfer vom selben Hof stammen, verdient besondere Aufmerksamkeit. Für einen Anschlag gegen die Teyrngarch Brauerzunft fehlt bislang ein Beleg.' },
  { familyId: 'haus-tirfelyn', name: 'Tirfelyn', victim: 'Ceridwen Tirfelyn, 22', text: 'Ceridwen war die Tochter Caradog Tirfelyns und Enids, die Schwester Gareths und Bedwyrs. Vor wenigen Wochen verließ sie den Hof, um ihren Verlobten Gorwyn Helfaen zu besuchen. Als sie am folgenden Morgen nicht zurückgekehrt war, fehlte dem Haushalt mehr als eine helfende Hand.\n\nAuf dem Hof gehen Viehhaltung, Feldarbeit und die Versorgung Gwynthors weiter. Ceridwens Verlobung erklärt, weshalb sie den Weg zum Jagdhaus nehmen wollte. Wen sie unterwegs traf und wann der Täter sie angriff, ist damit noch nicht geklärt.' },
  { familyId: 'haus-brynial', name: 'Brynial', victim: 'Gwenith, 32', text: 'Rhydderch Brynial ist Witwer. Seine Kinder Ianto und Anwen haben ihre Mutter Gwenith verloren. Verwandte helfen bei den Tieren und auf dem kleinen Stück Land; die tägliche Arbeit lässt sich auch während der Trauer nicht aufschieben.\n\nÜber Gweniths Herkunftsfamilie liegen mir keine verlässlichen Angaben vor. Ein persönlicher Feind ist nicht bekannt. Ich halte es für nötig, ihre gewöhnlichen Wege und Besorgungen weiter zu erfragen, bevor aus dem Unglück des Hauses ein besonderer Grund für die Tat abgeleitet wird.' },
  { familyId: 'haus-eiddfer', name: 'Eiddfer', victim: 'Morwen Eiddfer, 23', text: 'Cadell und Ffion Eiddfer haben ihre Tochter Morwen verloren; Rhiain und Tegid ihre Schwester. Morwen half beim Brauen und bei den Lieferungen. Ihr Tod trifft einen Haushalt, der durch Rhiains Ehe mit Iestyn Bragwen bereits um Catrin trauerte.\n\nDie beiden Brauerfamilien arbeiten auf demselben Hof und liefern an die Teyrngarch Brauerzunft. Diese Nähe könnte erklären, weshalb beide jungen Frauen ähnliche Wege benutzten. Ob sie dem Täter dadurch wiederholt Gelegenheit bot oder ob er den Hof gezielt im Blick hatte, vermag ich bisher nicht zu entscheiden.' },
  { familyId: 'haus-helfaen', name: 'Helfaen', victim: '', text: 'Unter den Toten befindet sich keine Angehörige der Helfaen. Dennoch hat die Mordreihe das Jagdhaus unmittelbar getroffen: Gorwyn hat seine Verlobte Ceridwen Tirfelyn verloren. Sie wollte ihn besuchen und kehrte am folgenden Morgen nicht zu ihren Eltern zurück.\n\nDie Familien trauern um dieselbe junge Frau. Aus der Verlobung ergibt sich ein Anlass für ihre Reise, aber noch kein Verdacht gegen Gorwyn oder seine Angehörigen. Zu klären bleibt, wer Ceridwen auf dem Weg zwischen dem Hof ihrer Eltern und dem Jagdhaus begegnet ist.' },
  { familyId: 'haus-ysgellfor', name: 'Ysgellfor und die Haushalte in Caer Ysgellfor', victim: '', text: 'Aus den Haushalten von Caer Ysgellfor ist bisher keine Frau unter den Opfern erkannt worden. Die Festung liegt an der Hauptstraße und bleibt für die Suche von Bedeutung. Hier laufen Vorratstransporte und die Wege der umliegenden Höfe zusammen.\n\nMadog Ysgellfor betreut mit seiner Familie Annahme und Lagerung der Vorräte; Hauptmann Rhydric Argall verantwortet Wachen und Burgbetrieb. Ich empfehle, ihre Kenntnis der Wege, Fuhrleute und gewöhnlichen Ankunftszeiten zu nutzen. Aus ihren Ämtern allein lässt sich kein Zusammenhang mit den Taten ableiten.' }
]);
