import { createFamilyCandidates, buildImportedCharacter, buildFamilyPersonViewUrl } from '../character-genealogy/genealogy-mapping.js';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';
import { GWNIWR_STAFF_SOURCE } from '../gwniwr/gwniwr-personnel.mjs';

export const TAILORING_CHARACTER_FEATURE = 'gwniwr-maerllys-20261108';
export const TAILORING_AUTHORED_AT = '2026-11-08T16:10:00.000Z';
export const TAILORING_EXISTING_RUNTIME_IDS = Object.freeze({
 'person--craigddu--person-28b0e0a3':'XVeiNvgFfsmtomLuIjcA',
 'person--haus-maerllys--nia-maerllys':'qN5et9e7KaWlIPTSrsXt',
 'person--haus-maerllys--rhys-maerllys':'person--haus-maerllys--rhys-maerllys',
 'person--haus-maerllys--gwenora-maerllys':'person--haus-maerllys--gwenora-maerllys',
 'person--haus-veltrane--matteo-veltrane':'person--haus-veltrane--matteo-veltrane'
});

// Historical facts come from the retained family sources. The present tailoring
// occupations and daily working practices are the user's commissioned expansion.
export const TAILORING_LIFE = Object.freeze({
  "person-7b6c292b": [
    "Emyr Gwniwr wurde 1680 geboren und führt mit seiner Gemahlin Gwenllian die traditionsreiche Schneiderei Nadel & Faden in Gwynthor. Der Betrieb gehört seit beinahe zweihundert Jahren zum Handwerk der Stadt. Seine frühere Stellung als führende Schneiderei hat er an die Göttliche Eleganz verloren; Emyr setzt den Wert der eigenen Arbeit deshalb keineswegs geringer an. Seine Kundschaft soll brauchbare Kleidung bekommen, deren Preis im Alltag tragbar bleibt.",
    "In der Werkstatt achtet Emyr besonders auf haltbare Tuche, saubere Belastungsnähte und Schnitte, die sich ausbessern lassen. Ein schlichtes Gewand verdient nach seiner Auffassung dieselbe Sorgfalt wie ein guter Festanzug. Die Auswahl reicht von einfacher bis guter Kleidung; die kleine Hochzeitslinie bleibt bewusst überschaubar und folgt der walisisch-gälischen Formensprache seiner Heimat.",
    "Emyr und Gwenllian sind die Eltern von Tudur und Eleri. Tudur arbeitet bereits als Schneidermeister mit; Eleri, die mit Hywel Craigddu verheiratet ist, hilft im Laden. Dass die Familie im Lauf der Jahrzehnte kleiner geworden ist, macht die Weitergabe des Wissens für Emyr besonders wichtig. Der lange zuvor abgespaltene Maerllys-Zweig gehört zur gemeinsamen Herkunft, führt heute aber sein eigenes Geschäft."
  ],
  "person-f926e0da": [
    "Gwenllian wurde 1684 geboren und leitet Nadel & Faden gemeinsam mit Emyr Gwniwr. Im Laden führt sie Stoffwahl, Beratung und die Aufnahme von Aufträgen zusammen. Wer nur ein einziges gutes Kleidungsstück besitzt, soll bei ihr ebenso aufmerksam beraten werden wie ein wohlhabender Kunde. Sie erklärt, wo ein besseres Tuch seinen Preis rechtfertigt und wo eine schlichtere Ausführung ausreicht.",
    "Bei der Anprobe achtet Gwenllian darauf, wie ein Mensch tatsächlich steht und arbeitet. Ein Ärmel muss Bewegungsfreiheit lassen; Saum und Verschluss sollen zum Alltag passen. Sie hält die Wünsche der Kundschaft fest und stimmt die Übergabe mit Tudur und den erfahrenen Angestellten ab. Verlässliche Absprachen gehören für sie genauso zum Handwerk wie der sichtbare Stich.",
    "Ihre Kinder Tudur und Eleri verbinden die Zukunft des Betriebs mit dem weiteren Familienkreis. Eleri ist an Hywel Craigddu verheiratet und hilft mit ihren Kindern im Elternhaus. Männer und Frauen werden bei den Gwniwr gleichermaßen ausgebildet. Gwenllian trägt diese Tradition mit und unterstützt den Grundsatz, dass gute Kleidung kein Vorrecht des Adels ist."
  ],
  "person-ece54bdb": [
    "Tudur Gwniwr wurde 1704 als Sohn von Emyr und Gwenllian geboren. Er arbeitet bereits als Schneidermeister in Nadel & Faden. Zwischen der Führung seiner Eltern und den Händen der Gesellen übernimmt er den fachlichen Zuschnitt, die Abstimmung der Schnitte und die letzte Kontrolle vor der Abholung. Dabei verbindet er die alten Muster der Familie mit den Anforderungen heutiger Kunden.",
    "Die Meistertradition der Gwniwr verlangt zwei abschließende Arbeiten: ein Stück aus einfachem und eines aus kostbarem Stoff. Beide müssen dieselben Anforderungen an Haltbarkeit und Sorgfalt erfüllen. Diese Haltung prägt auch Tudurs Kollektion. Schlichte Tuniken und gute Festgewänder unterscheiden sich im Material und Aufwand, nicht darin, ob ihre Nähte ordentlich ausgeführt sind. Die begrenzte Hochzeitsmode bleibt tragbar, zurückhaltend und regional verwurzelt.",
    "Tudur ist mit Catrin verheiratet. Ihre Kinder heißen Gethin, Bleddyn, Efa und Micah. Seine Schwester Eleri lebt als Gemahlin Hywel Craigddu’s in einem weiteren Familienzweig. Für Tudur ist die Werkstatt zugleich Beruf und Familienüberlieferung. Die Zukunft des kleineren Familienkreises liegt ihm dabei ebenso am Herzen wie die nächste gut sitzende Naht."
  ],
  "person-3f9eaf4f": [
    "Catrin wurde 1708 geboren und ist mit dem Schneidermeister Tudur Gwniwr verheiratet. Gemeinsam haben sie Gethin, Bleddyn, Efa und Micah. Zum engeren Familienkreis gehören auch Tudurs Eltern Emyr und Gwenllian, die Nadel & Faden führen. Über Catrins Herkunft vor der Ehe ist wenig bekannt.",
    "Die Schneiderei verbindet die Familie mit vielen Bürgern Gwynthors. Stoffe, Anproben und die Weitergabe handwerklicher Kenntnisse gehören zum Umfeld ihres Haushalts. Die Kinder wachsen mit dem Anspruch auf, dass ein einfaches Arbeitsgewand ebenso zuverlässig verarbeitet werden soll wie gute Festkleidung. In der Familie werden Mädchen und Jungen gleichermaßen an das überlieferte Wissen herangeführt.",
    "Tudurs Schwester Eleri ist mit dem Waffenknecht Hywel Craigddu verheiratet. So verbindet Catrins heutiger Familienkreis die Werkstatt mit einem weiteren Gwynthorer Haushalt. Während Tudur als Meister an den Schnitten arbeitet, bleibt das gemeinsame Familienleben mit den vier Kindern ein eigener Teil der Gwniwr-Geschichte."
  ],
  "person-cf831497": [
    "Eleri Gwniwr wurde 1708 als Tochter von Emyr und Gwenllian geboren. Tudur ist ihr älterer Bruder. Sie heiratete Hywel Craigddu, einen Waffenknecht in Gwynthor, und wird seitdem auch Eleri Craigddu genannt. Der Verbindung zu ihrer Herkunftsfamilie blieb sie eng verbunden.",
    "Eleri hilft mit ihren Kindern im elterlichen Laden Nadel & Faden. Bei Empfang und Verkauf kennt sie die Gewohnheiten der Stammkundschaft und den Unterschied zwischen einer rasch benötigten Ausbesserung und einem neuen Auftrag. Ihre Mithilfe gehört zum familiären Zusammenhalt des über viele Generationen gewachsenen Betriebs.",
    "Eleri und Hywel haben sieben Töchter: Lowri, Carys, Nerys, Ffion, Anwen, Eirlys und Mali. Die große Kinderschar erweitert den enger gewordenen Familienkreis der Gwniwr. Während Hywel seinem Dienst nachgeht, bleibt der Laden von Eleris Eltern ein vertrauter Begegnungsort zwischen den beiden Familien."
  ],
  "person-e847aa96": [
    "Hywel Craigddu wurde 1708 geboren und dient als Waffenknecht in Gwynthor. Er ist der Sohn Iestyn Craigddu’s und Mareds, Catrins Bruder und Llywelyn Coeddus Freund. Seine Ehe mit Eleri verbindet die Craigddu mit der Schneiderfamilie Gwniwr.",
    "Eleri ist die Tochter Emyrs und Gwenllians, die Nadel & Faden führen. Sie hilft mit ihren Kindern im Laden. Für Hywel führt die familiäre Verbindung damit aus dem eigenen Dienstalltag in ein anderes Handwerk: In der Schneiderstube seiner Schwiegereltern zählen gute Tuche, brauchbare Schnitte und verlässliche Absprachen.",
    "Das Paar hat die sieben Töchter Lowri, Carys, Nerys, Ffion, Anwen, Eirlys und Mali. Hywels großer Haushalt steht neben den Familien seiner Schwester und seiner Vettern im weitverzweigten Craigddu-Kreis. Eleris fortdauernde Mithilfe bei ihren Eltern hält zugleich die Nähe zu den Gwniwr lebendig."
  ],
  "person-178882ce": [
    "Gethin Gwniwr wurde 1724 als ältestes der vier Kinder Tudurs und Catrins geboren. Seine Geschwister sind Bleddyn, Efa und Micah. Im Jahr 1740 ist er sechzehn Jahre alt. Sein Vater arbeitet als Schneidermeister; seine Großeltern Emyr und Gwenllian führen Nadel & Faden.",
    "Er wächst im Umfeld einer traditionsreichen Schneiderfamilie auf. Dort haben alte Muster, sorgfältige Verarbeitung und die Erhaltung getragener Kleidung einen hohen Wert. Die Familiengeschichte erzählt von angehenden Meistern, die aus einfachem und kostbarem Tuch gleichermaßen gute Arbeiten fertigen. Für Gethin liegt die Entscheidung über seinen eigenen beruflichen Weg noch vor ihm.",
    "Seine Tante Eleri ist mit Hywel Craigddu verheiratet und hat sieben Töchter. Der familiäre Kreis reicht dadurch weit über die Werkstatt hinaus. Gethin steht zwischen den kleineren Geschwistern und den erwachsenen Handwerkern einer Familie, die um ihren Fortbestand und die Weitergabe ihres Wissens bemüht ist."
  ],
  "person-558acc56": [
    "Bleddyn Gwniwr wurde 1728 geboren und ist zwölf Jahre alt. Seine Eltern heißen Tudur und Catrin. Gethin ist sein älterer Bruder; Efa und Micah sind jünger. Die vier Geschwister gehören zur jüngsten Generation der Gwynthorer Schneiderfamilie.",
    "Nadel & Faden bildet den handwerklichen Hintergrund seiner Kindheit. Großvater Emyr und Großmutter Gwenllian führen den Betrieb, während Tudur als Meister arbeitet. Der Anspruch auf haltbare, ehrliche Arbeit gehört zu den Vorstellungen, mit denen die Kinder in diesem Familienkreis aufwachsen.",
    "Bleddyns Tante Eleri lebt mit Hywel Craigddu und ihren sieben Töchtern in einem weiteren großen Haushalt. Seine eigene Zukunft bleibt offen. Noch steht er als Kind zwischen den unterschiedlichen Generationen der Familie, deren Geschichte sich zugleich um das gemeinsame Handwerk und den Zusammenhalt der Angehörigen dreht."
  ],
  "person-38812666": [
    "Efa Gwniwr wurde 1730 geboren und ist zehn Jahre alt. Sie ist die Tochter Tudurs und Catrins und die Schwester von Gethin, Bleddyn und Micah. Ihre Großeltern Emyr und Gwenllian führen Nadel & Faden in Gwynthor.",
    "Die Gwniwr möchten gute Kleidung auch Menschen mit wenig Geld zugänglich machen. In diesem bürgerlichen Handwerksumfeld wächst Efa auf. Dass Männer und Frauen das Schneidern gleichermaßen erlernen können, gehört seit Generationen zum Selbstverständnis ihrer Familie.",
    "Durch ihre Tante Eleri ist Efa mit dem großen Craigddu-Haushalt verbunden. Der ältere Maerllys-Zweig gehört zur weiter zurückreichenden Familiengeschichte. Für Efa selbst steht die Kindheit im gegenwärtigen Gwniwr-Kreis im Mittelpunkt; welchen Weg sie später einschlagen wird, ist noch ungewiss."
  ],
  "person-d55e335a": [
    "Micah Gwniwr wurde 1732 geboren und ist acht Jahre alt. Er ist das jüngste der vier Kinder Tudurs und Catrins. Gethin, Bleddyn und Efa sind seine älteren Geschwister; Emyr und Gwenllian seine Großeltern.",
    "Die Familie ist eng mit Nadel & Faden verbunden, wo sein Vater als Schneidermeister arbeitet. Der Laden und die Werkstatt sind Teil einer viel älteren Geschichte, in der brauchbare Muster und Fertigkeiten an die nächste Generation weitergegeben werden. Für Micah bilden die erwachsenen Handwerker das Umfeld seiner Kindheit.",
    "Zur Verwandtschaft gehört seine Tante Eleri, die mit Hywel Craigddu sieben Töchter hat. So steht der jüngste Gwniwr zwischen einem kleinen engeren Geschwisterkreis und einer größeren Verwandtschaft in derselben Stadt. Seine späteren Aufgaben und persönlichen Bindungen liegen noch vor ihm."
  ],
  "cadfan-maerllys": [
    "Cadfan Maerllys wurde 1662 geboren und ist das älteste namentlich bekannte Oberhaupt der jüngeren Maerllys-Linie. Mit seiner Gemahlin Eira hat er den Sohn Iorwerth. Sein Bruder Owain heiratete Gwenllian Ysgrif und begründete den zweiten bekannten Zweig. Die Geschichte vor den beiden Brüdern verliert sich in einer langen Überlieferungslücke.",
    "Heute gibt Cadfan als Altmeister Erfahrungen und alte Schnittvorlagen an Naht & Siegel weiter. Die tägliche Arbeit tragen Iorwerth und die jüngeren Hände. Cadfans Platz liegt im beratenden Familienkreis, wo die bewährten Lösungen vergangener Werkstattjahre neben neuen Anforderungen an Dienstkleidung stehen.",
    "Seine Enkel heißen Elowen, Nia und Rhys. Elowen gehört seit ihrer Ehe zum Haushalt der Letzten Rast, Nia dient der Prinzessin Isobel, Rhys arbeitet in der Göttlichen Eleganz. Cadfans Familie bleibt durch diese unterschiedlichen Wege eng mit dem Leben Gwynthors verbunden."
  ],
  "eira-spouse-maerllys": [
    "Eira wurde 1666 geboren und ist die Gemahlin Cadfan Maerllys’. Iorwerth ist ihr Sohn; Elowen, Nia und Rhys ihre Enkel. Über ihre Herkunftsfamilie ist wenig bekannt. Gemeinsam mit Cadfan gehört sie zur ältesten konkret bekannten Generation des jüngeren Maerllys-Haushalts.",
    "Im heutigen Hausleben ist Eira eine erfahrene Ansprechpartnerin für Wäsche, Ausbesserung und sorgfältige Handnähte. Naht & Siegel fertigt Kleidung, die lange im Dienst getragen werden soll. Ihr Blick auf Pflege und Erhaltung ergänzt deshalb die Arbeit der jüngeren Generation, die das Geschäft führt.",
    "Die Wege ihrer Enkel führen zur Letzten Rast, in den persönlichen Dienst bei Prinzessin Isobel und in den Verkauf der Göttlichen Eleganz. Die ältere Schneidertradition bleibt der gemeinsame Hintergrund, obwohl jeder der drei seinen eigenen Platz im Stadtleben gefunden hat."
  ],
  "owain-maerllys": [
    "Owain Maerllys wurde 1665 geboren und ist Cadfans Bruder. Er heiratete Gwenllian Ysgrif. Ihre Kinder heißen Geraint und Rhoswen. Die beiden Brüder stehen am Beginn der namentlich bekannten jüngeren Maerllys-Linie; die früheren Generationen sind nur lückenhaft überliefert.",
    "Owain bringt als älterer Handwerker Erfahrung bei Schnittfragen und alten Mustern ein. Für die Dienstgarnituren von Naht & Siegel sind bewährte Schnitte wichtig, die sich wiederholen und an verschiedene Körper anpassen lassen. Während Geraint die heutige Werkstatt leitet, behält Owain im Familienrat den Blick auf das ältere Handwerkswissen.",
    "Geraint ist mit Llio Falchdyn verheiratet. Rhoswen heiratete Madoc Tonnarth und hat mit ihm die drei Söhne Bryn, Emrys und Aled. Owains Familie ist damit in mehrere Gwynthorer Haushalte verzweigt und bewahrt über die Ehen den persönlichen Kontakt über die eigene Werkstatt hinaus."
  ],
  "gwenllian-ysgrif": [
    "Gwenllian Ysgrif wurde 1668 geboren und ist Idris Ysgrifs Schwester. Sie heiratete Owain Maerllys und verbindet beide Gwynthorer Häuser. Ihre Kinder sind Geraint und Rhoswen.",
    "Im älteren Familienkreis richtet Gwenllian ihr Augenmerk auf Tuche, saubere Verarbeitung und praktische Pflege. Sie gehört zum beratenden Familienrat von Naht & Siegel. Eine geeignete Stoffwahl entscheidet für sie darüber, ob eine Dienstgarnitur nach vielen Arbeitstagen noch ordentlich aussieht und gut getragen werden kann.",
    "Geraints Ehe mit Llio Falchdyn und Rhoswens Ehe mit Madoc Tonnarth erweitern ihren Verwandtenkreis. Die Familie ihrer Tochter führt mit Bryn, Emrys und Aled eine weitere Generation fort. Ihre Ysgrif-Herkunft bleibt neben dem gemeinsamen Maerllys-Haushalt ein fester Teil ihrer Lebensgeschichte."
  ],
  "iorwerth-maerllys": [
    "Iorwerth Maerllys wurde 1689 als Sohn Cadfans und Eiras geboren. Er ist mit Bronwen Swyll verheiratet; ihre Kinder sind Elowen, Nia und Rhys. Die Schneidertradition der Familie führt er heute in Naht & Siegel fort, einer professionellen Werkstatt für Dienstkleidung, Livreen und einheitliche Garnituren.",
    "Iorwerth leitet Auftragsplanung und Uniformschnitt. Seine Kunden sind Haushalte und Arbeitgeber, die Zofen, Diener, Vögte, Mägde, Burschen und Amtsträger passend einkleiden möchten. Ein Auftrag beginnt für ihn mit der Frage, welche Arbeit die Kleidung aushalten muss. Bewegungsweite, Erkennbarkeit der Hausfarben und die spätere Nachbestellung werden zusammen geplant.",
    "Der Betrieb arbeitet mit der Göttlichen Eleganz zusammen und liegt preislich zwischen deren gehobener Mode und der günstigen Alltagskleidung von Nadel & Faden. Iorwerth bewahrt zugleich die eigenständigen Wege seiner Kinder: Elowen arbeitet nach ihrer Ehe in der Letzten Rast, Nia dient Prinzessin Isobel und Rhys verkauft in der Eleganz."
  ],
  "bronwen-swyll": [
    "Bronwen Swyll wurde 1691 geboren und ist Iestyn Swylls Schwester. Durch ihre Ehe mit Iorwerth Maerllys kam sie in die Gwynthorer Schneiderfamilie. Elowen, Nia und Rhys sind ihre Kinder. Ihre Verbindung hält den Kontakt zwischen beiden Familien lebendig.",
    "Bei Naht & Siegel betreut Bronwen Anproben und Qualitätskontrolle. Eine Dienstgarnitur soll im Stehen ordentlich wirken und zugleich beim Treppensteigen, Tragen oder Arbeiten bequem bleiben. Sie prüft deshalb nicht nur die äußere Linie, sondern Ärmelweite, Verschlüsse, Saumlänge und die Beanspruchung im vorgesehenen Dienst.",
    "Mit Iorwerth stimmt sie die Aufträge der Haushalte ab; Geraint und Llio übernehmen Werkstatt und Serienfertigung. Bronwen achtet darauf, dass verschiedene Größen eines Auftrags als zusammengehörig erkennbar bleiben. Der Betrieb schafft die Kleidung, vergibt aber weder Ämter noch Rangzeichen einer Herrschaft aus eigener Macht."
  ],
  "geraint-maerllys": [
    "Geraint Maerllys wurde 1691 als Sohn Owains und Gwenllian Ysgrifs geboren. Er ist Iorwerths Vetter und Rhoswens Bruder. Seine Gemahlin heißt Llio Falchdyn. Durch ihre Ehe begegnen sich zwei in Gwynthor verwurzelte bürgerliche Familien.",
    "In Naht & Siegel leitet Geraint die Werkstatt und arbeitet am Schnitt der Herrenlivreen. Bei einem größeren Haushaltsauftrag müssen Stoffrichtung, Hausfarben, Besatz und Größenfolge zusammenpassen. Er ordnet die Arbeitsschritte so, dass einzelne Stücke später nachgefertigt und beschädigte Teile ohne vollständigen Neukauf ersetzt werden können.",
    "Die Spezialisierung der Maerllys richtet sich an Arbeitgeber. Geraint fertigt daher kein bloßes Festkostüm, sondern Kleidung für wiederholten Dienst. Mit Iorwerths Auftragsplanung, Bronwens Anproben und Llios Nähstube bildet seine Werkstatt den Kern des kleineren, professionellen Familienbetriebs."
  ],
  "llio-falchdyn": [
    "Llio Falchdyn wurde 1692 geboren und ist eine Tochter Madoc Falchdyns. Sie heiratete Geraint Maerllys und lebt im Umfeld der Gwynthorer Schneiderfamilie. Ihre Herkunft verbindet die Maerllys mit dem Haus Falchdyn.",
    "Llio betreut in Naht & Siegel die Nähstube und die Serienfertigung. Eine Reihe von Dienstkleidern soll gleichmäßig wirken und trotzdem zu Menschen unterschiedlicher Größe passen. Sie achtet auf wiederkehrende Nahtführung, saubere Innenverarbeitung und eine Arbeitsfolge, in der Änderungen vor der letzten Fertigstellung möglich bleiben.",
    "Mit Geraints Werkstattleitung und Bronwens abschließender Anprobe verbindet sich ihre Arbeit zu einer verlässlichen Abfolge. Eine Bestellung für einen ganzen Haushalt verlangt Geduld und gleichbleibende Sorgfalt. Gerade in der Wiederholung sieht Llio den Unterschied zwischen bloßer Gleichförmigkeit und gutem Handwerk."
  ],
  "rhoswen-maerllys": [
    "Rhoswen Maerllys wurde 1694 als Tochter Owains und Gwenllian Ysgrifs geboren. Geraint ist ihr Bruder. Ihre Ehe mit Madoc Tonnarth führte sie in einen anderen Gwynthorer Familienhaushalt.",
    "Mit Madoc hat Rhoswen die drei Söhne Bryn, Emrys und Aled. Ihr engerer Familienkreis gehört damit zur jüngeren Tonnarth-Linie. Die Verbindung zu ihren Eltern und ihrem Bruder bleibt neben dem eigenen Haushalt ein Teil ihres Lebens.",
    "Die Schneidertradition der Maerllys bildet Rhoswens Herkunft. Inzwischen richtet Naht & Siegel sein Handwerk auf die Dienstkleidung größerer Haushalte aus. Rhoswens eigener Familienzweig führt die gemeinsame Geschichte bei Tonnarth weiter und verbindet ihre Kinder mit den Verwandten beider Eltern."
  ],
  "madoc-tonnarth": [
    "Madoc Tonnarth wurde 1692 geboren und ist Cadell Tonnarths Bruder sowie Llewarchs Onkel. Er heiratete Rhoswen Maerllys, die Tochter Owains und Gwenllian Ysgrifs. Die Ehe verbindet zwei bürgerliche Familien Gwynthors.",
    "Madoc und Rhoswen haben die drei Söhne Bryn, Emrys und Aled. Mit ihnen bildet das Paar einen fortgeführten Zweig innerhalb der Tonnarth-Familie. Auf Rhoswens Seite gehören Geraint und die ältere Maerllys-Generation zum weiteren Verwandtenkreis.",
    "Über die Familie seiner Frau reicht diese Verbindung zu den Schneidereien der Stadt. Madocs persönliche Aufgaben sind darüber hinaus wenig beschrieben. Sein Platz in der Familiengeschichte wird durch seinen eigenen Haushalt, seine Brüder und die gemeinsame jüngste Generation bestimmt."
  ],
  "elowen-maerllys": [
    "Elowen Maerllys wurde 1713 als Tochter Iorwerths und Bronwen Swylls geboren. Sie ist die ältere Schwester Nias und Rhys’. Im Jahr 1733 heiratete sie Edern Vann und lebt und arbeitet seither in der Letzten Rast in Gwynthor.",
    "Ihre Herkunft ist die Schneiderfamilie Maerllys. Mit der Ehe verlagerte sich ihr täglicher Mittelpunkt in das Herbergsleben der Vann. Gäste, Zimmer und die Abläufe eines Hauses, in dem Reisende ein- und ausgehen, gehören zu einer anderen Arbeitswelt als Zuschnitt und Nähstube, bleiben aber ebenso auf Verlässlichkeit angewiesen.",
    "Auch ihre Geschwister fanden eigene Aufgaben: Nia dient Prinzessin Isobel Draig persönlich, Rhys verkauft in der Göttlichen Eleganz. Die drei bleiben durch Eltern und Großeltern verbunden. Elowens dunkelrotes Haar und ihre blauen Augen ähneln denen ihrer jüngeren Geschwister."
  ],
  "edern-vann": [
    "Edern Vann wurde 1705 geboren und ist Herbergsmeister in der Letzten Rast in Gwynthor. Zu seinen Aufgaben gehören Zimmer und Buchungen. Im Jahr 1733 heiratete er Elowen Maerllys, die seither mit ihm im Umfeld des Familienbetriebs lebt und arbeitet.",
    "Ederns Arbeit gilt der Belegung des Hauses, verlässlichen Absprachen und der Aufnahme von Gästen. Ein gut geführtes Gästehaus braucht Übersicht über ankommende Reisende und freie Räume. Seine Tätigkeit verbindet die persönliche Begegnung mit dem geordneten Alltag der Herberge.",
    "Durch Elowen ist Edern mit der Maerllys-Schneiderfamilie verwandt. Seine Schwägerin Nia steht im persönlichen Dienst der Prinzessin Isobel; sein Schwager Rhys arbeitet im Verkauf der Göttlichen Eleganz. Die verschiedenen Arbeitswelten begegnen sich so innerhalb eines gemeinsamen Verwandtenkreises in Gwynthor."
  ],
  "nia-maerllys": [
    "Nia Maerllys wurde 1716 als Tochter Iorwerth Maerllys’ und Bronwen Swylls geboren. Im Jahr 1740 ist sie vierundzwanzig Jahre alt. Elowen ist ihre ältere Schwester, Rhys ihr jüngerer Bruder. Ihre Großeltern väterlicherseits heißen Cadfan und Eira.",
    "Nia dient als persönliche Zofe der Prinzessin Isobel Draig. Ihr Alltag gehört damit zum unmittelbaren Umfeld der Prinzessin und des Hauses Draig. Die bürgerliche Schneiderfamilie ihrer Herkunft bleibt ihr verwandtschaftlicher Rückhalt, während ihr eigener Dienst sie an einen anderen Platz führt als die Werkstatt der Eltern.",
    "Elowen heiratete 1733 Edern Vann und arbeitet seither in der Letzten Rast; Rhys verkauft in der Göttlichen Eleganz. Nia selbst ist unverheiratet und ohne Verlobung. Ihr dunkelrotes Haar und ihre blauen Augen verbinden ihr Aussehen mit den Geschwistern. Der ältere Maerllys-Zweig stammt von den Gwniwr ab; die einzelnen Ahnen vor den langen Überlieferungslücken sind unbekannt."
  ]
});

function biography(name, paragraphs, portrait, stats){
 return sanitizeCharacterBiographyForFirestore({biography:{schema:'aleria.biography-module',schemaVersion:1,stats,
  biography:{portrait,biographyTitle:'Biografie',biographyText:paragraphs[0],extraSections:paragraphs.slice(1).map((text,i)=>({position:'afterIntro',mode:'text',title:i===0?'Arbeit und Alltag':'Familie und Verbindungen',text}))}}}).biography;
}
export function tailoringFamilyCandidates(registry){
 return ['gwniwr','haus-maerllys'].flatMap(id=>{const record=registry.find(r=>r.id===id);if(!record)throw Error('Familie fehlt '+id);return createFamilyCandidates(record).filter(c=>TAILORING_LIFE[c.personId]||['nia-maerllys','rhys-maerllys','gwenora-maerllys','matteo-veltrane'].includes(c.personId)).map(candidate=>({...candidate,url:buildFamilyPersonViewUrl(candidate)}));});
}
export function tailoringDatabaseCandidates(registry){
 const selected=tailoringFamilyCandidates(registry),worldIds=new Set(selected.map(candidate=>candidate.worldPersonId));
 const known=new Set(selected.map(candidate=>`${candidate.familyId}:${candidate.personId}`));
 // Database links include confirmed counterpart charts without expanding the
 // authored export roster or changing its preferred family projection order.
 const counterparts=registry.flatMap(record=>createFamilyCandidates(record))
  .filter(candidate=>worldIds.has(candidate.worldPersonId)&&!known.has(`${candidate.familyId}:${candidate.personId}`))
  .map(candidate=>({...candidate,url:buildFamilyPersonViewUrl(candidate)}));
 return [...selected,...counterparts];
}
export function buildTailoringCharacterExports(registry, existingCharacters=[]){
 const counterparts=registry.flatMap(record=>createFamilyCandidates(record));
 const family=tailoringFamilyCandidates(registry).map(candidate=>{
  const runtimeId=TAILORING_EXISTING_RUNTIME_IDS[candidate.worldPersonId]||candidate.worldPersonId;
  const prior=existingCharacters.find(c=>c.id===runtimeId);
  const imported=buildImportedCharacter(candidate,prior||null,TAILORING_AUTHORED_AT);
  // Add counterpart knowledge and preserve older live family relations. A
  // married-away chart intentionally omits children shown in the target tree.
  const related=counterparts.filter(other=>other.worldPersonId===candidate.worldPersonId);
  for(const other of related){
   const combined=buildImportedCharacter(other,{...prior,...imported},TAILORING_AUTHORED_AT);
   imported.genealogy.sources=combined.genealogy.sources;
  }
  imported.genealogy.relationships=Object.fromEntries(['parents','partners','children'].map(kind=>{
   const rows=[...(prior?.genealogy?.relationships?.[kind]||[]),...related.flatMap(c=>c.relationships[kind]||[]),...(candidate.relationships[kind]||[])];
   return[kind,[...new Map(rows.map(row=>[`${row.worldPersonId||row.personId}|${row.type}`,row])).values()]];
  }));
  const alreadyOnline=Object.hasOwn(TAILORING_EXISTING_RUNTIME_IDS,candidate.worldPersonId);
  let character;
  if(alreadyOnline){
   // Existing biographies, jobs, portraits and complete avatar libraries survive.
   character={id:runtimeId,name:candidate.displayName,identity:imported.identity,genealogy:imported.genealogy,updatedAt:TAILORING_AUTHORED_AT};
   if(['nia-maerllys','person-e847aa96'].includes(candidate.personId)){
    const paragraphs=TAILORING_LIFE[candidate.personId],portrait=prior?.portrait||candidate.portrait;
    character.bio=paragraphs.join('\n\n');
    character.biography=biography(candidate.displayName,paragraphs,portrait,[['Vollständiger Name',candidate.displayName],['Geboren',candidate.birth],['Alter',`${1740-Number(candidate.birth)} Jahre`],['Tätigkeit',candidate.title],['Familie',candidate.houseName]]);
   }
  }else{
   const paragraphs=TAILORING_LIFE[candidate.personId];if(!paragraphs)throw Error('Bio fehlt '+candidate.personId);
   const age=1740-Number(candidate.birth);
   character={...imported,id:runtimeId,bio:paragraphs.join('\n\n'),biography:biography(candidate.displayName,paragraphs,candidate.portrait,
    [['Vollständiger Name',candidate.displayName],['Geboren',candidate.birth],['Alter',`${age} Jahre`],['Familie',candidate.houseName||candidate.familyTitle],['Tätigkeit',candidate.title||'Familienangehörige/r'],['Herkunft','Gwynthor']]),
    currentLocation:'Gwynthor',profileLink:buildFamilyPersonViewUrl(candidate),age};
   delete character.inventory;
  }
  return {type:'aleria-character',version:1,exportedAt:TAILORING_AUTHORED_AT,mergeStrategy:'replace-reviewed-metadata-fields',assignedTab:'Gwynthor',
   sourcePath:`Charakter Archiv Exporte/Gwniwr-Maerllys/${candidate.familyId}/${candidate.personId}.json`,character};
 });
 const staff=GWNIWR_STAFF_SOURCE.map(person=>{
  const id=`person--gwniwr-staff--${person.key}`,portrait=`./assets/gwniwr/portraits/${person.key}.jpg`;
  const paragraphs=[`${person.name} ist ${person.age} Jahre alt und arbeitet bei Nadel & Faden in Gwynthor. ${person.bio}`,
   person.key==='osian'?'Als Lehrling übt Osian unter Anleitung an Heftnähten, Säumen und einfachen vorbereitenden Arbeiten. Er trägt noch keine Meisterverantwortung. Der Familienbrauch verlangt zum Abschluss der Meisterausbildung Arbeiten aus einfachem und kostbarem Tuch. Bis zu einer solchen Arbeit hat Osian noch viel zu lernen.':'Im Laden von Emyr und Gwenllian gilt die gleiche Sorgfalt für schlichte und gute Kleidung. Die Arbeit wird mit Schneidermeister Tudur und den übrigen Händen abgestimmt. Ausbesserungen, klare Absprachen und haltbare Nähte sind ebenso wichtig wie ein neues Kleidungsstück.',
   person.key==='osian'?'Im Familienbetrieb lernt Osian das Handwerk neben Gesellen und erfahrenen Schneiderhänden kennen. Zur Mannschaft gehören Meirion Wym, Iwan Trevor, Briallen Wym und Nesta Ferchwyn. Auch Eleri Craigddu hilft in ihrem Elternhaus.':'Zum Arbeitskreis gehören neben Emyr, Gwenllian und Tudur auch die anderen Angestellten und der junge Lehrling Osian. Die Aufgaben greifen ineinander: Beratung und Anprobe, Zuschnitt und Nähstube führen gemeinsam zu einem Kleidungsstück, auf das der Käufer vertrauen kann.'];
  const character={id,name:person.name,title:person.role,role:person.role,status:'active',relevance:'minor',fraktion:'Nadel & Faden',
   age:person.age,currentLocation:'Gwynthor · Nadel & Faden',origin:'',portrait,bio:paragraphs.join('\n\n'),
   biography:biography(person.name,paragraphs,portrait,[['Vollständiger Name',person.name],['Alter',`${person.age} Jahre`],['Tätigkeit',person.role],['Arbeitsort','Nadel & Faden · Gwynthor']]),
   identity:{worldPersonId:id},createdAt:TAILORING_AUTHORED_AT,updatedAt:TAILORING_AUTHORED_AT};
  return {type:'aleria-character',version:1,exportedAt:TAILORING_AUTHORED_AT,mergeStrategy:'replace-reviewed-metadata-fields',assignedTab:'Gwynthor',sourcePath:`Charakter Archiv Exporte/Gwniwr-Maerllys/personal/${person.key}.json`,character};
 });
 const exports=[...family,...staff];
 if(exports.length!==31||new Set(exports.map(e=>e.character.id)).size!==31)throw Error('Figureninventar muss31 eindeutige benannte Personen enthalten.');
 return exports.map(entry=>({...entry,character:Object.fromEntries(Object.keys(entry.character).sort().map(key=>[key,entry.character[key]]))}));
}
