export const DURST_ART = './assets/kleiner-durst';
export const RHWYD_EMBLEM = '../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Rhwyd.png';
export const RHWYD_MOTTO = 'Wir bleiben.';
const person = (key, name, sex, birth, role, bio, appearance, extra = {}) => Object.freeze({
  key, id: `${key}-rhwyd`, worldPersonId: `person--haus-rhwyd--${key}-rhwyd`, name, sex, birth, death: '',
  role, bio, appearance, portrait: `${DURST_ART}/portraits/${key}.png`, ...extra
});

export const RHWYD_PEOPLE = Object.freeze([
  person('gethin', 'Gethin Rhwyd', 'male', '1666', 'Ehemaliger Inhaber · verstorben',
    'Gethin führte die Hafenkneipe vor Efa und Iorwerth. Vier seiner fünf Söhne wurden 1720 in den Krieg geschickt; keiner kam lebend zurück. Nach ihrem Tod verfiel er dem Trinken und starb 1728 an dessen Folgen. Die Schulden blieben seiner Witwe und dem jüngsten Sohn.',
    'Menschlicher Mann, dargestellt zu Lebzeiten etwa 1723 mit 57 Jahren. Stämmig, braunes stumpfes Haar, kurzer gleichfarbiger Bart, braune Augen, schwere Lider und vom Trinken gezeichnetes müdes Gesicht. Abgetragenes graubraunes Hemd und alte braune Weste, Gürtel. Stehend, breite Schultern etwas gesunken, Arme seitlich, kein Getränk in der Hand.', { death: '1728', portraitAge: 57 }),
  person('efa', 'Efa', 'female', '1670', 'Witwe und Mitinhaberin · Kasse und Haus',
    'Efa ist 70 Jahre alt und hat vier Söhne und ihren Mann verloren. Mit Iorwerth hält sie den Kleinen Durst offen, obwohl das Haus überschuldet ist. Sie zählt die Einnahmen, flickt Leinen und behält die Vorräte im Blick. Die Jahre haben sie abgekämpft; für vertraute Gäste bleibt ein schwaches Lächeln.',
    '70-jährige menschliche Frau, deutlich alt und vom Leben erschöpft, vollständig graues ehemals braunes Haar in schlichtem tiefem Knoten, braune Augen, ausgeprägte Falten und weiche schwere Gesichtszüge. Etwas kräftiger Körperbau, nicht fettleibig. Mattes graubraunes langes Wollkleid, geflickte Schürze. Stehend mit leicht gebeugten Schultern, Hände locker vor der Schürze, schwaches müdes Lächeln.', { unknownOrigin: true }),
  person('aled', 'Aled Rhwyd', 'male', '1688', 'Ältester Sohn · 1720 gefallen',
    'Der älteste der fünf Brüder wurde 1720 in den Krieg geschickt und kehrte nicht lebend zurück. Er starb mit 32 Jahren. Eine eigene Ehe oder Nachkommenschaft ist nicht überliefert.',
    '32-jähriger menschlicher Fischer zu Lebzeiten, breite kantige Kieferpartie, stumpfbraunes kurz geschorenes Haar, braune Augen, dichter kurzer brauner Bart. Wettergraue Wolltunika, schlichter Gürtel. Stehend frontal, Arme locker, ernster ruhiger Blick. Keine Rüstung, kein Heldendenkmal.', { death: '1720', portraitAge: 32 }),
  person('carwyn', 'Carwyn Rhwyd', 'male', '1690', 'Zweiter Sohn · 1720 gefallen',
    'Carwyn zog 1720 wie seine älteren und jüngeren Brüder in den Krieg. Er starb mit 30 Jahren. Weitere Lebensstationen werden vorerst nicht festgelegt.',
    '30-jähriger menschlicher Hafenarbeiter zu Lebzeiten, langes schmales Gesicht, stumpfbraunes etwas längeres glattes Haar hinter die Ohren gestrichen, braune Augen, rasiert. Verwaschene olivgraue Tunika und einfache braune Weste. Stehend leicht nach links, ein Daumen am Gürtel, anderer Arm locker, zurückhaltender Blick.', { death: '1720', portraitAge: 30 }),
  person('hywel', 'Hywel Rhwyd', 'male', '1692', 'Dritter Sohn · 1720 gefallen',
    'Hywel gehörte zu den vier Rhwyd-Brüdern, die 1720 nicht heimkehrten. Er wurde 28 Jahre alt. Sein Platz in der Familie bleibt erhalten, ohne ihm eine ungesicherte eigene Linie zu geben.',
    '28-jähriger menschlicher Matrose zu Lebzeiten, runderes kräftiges Gesicht, stumpfbraunes welliges Haar, braune Augen, breiter brauner Schnurrbart ohne Vollbart. Ausgeblichenes blaugrünes Hemd, alte Hüftschärpe. Stehend nach rechts, Hände entspannt tief ineinander, leicht schiefes freundliches Lächeln.', { death: '1720', portraitAge: 28 }),
  person('dafydd', 'Dafydd Rhwyd', 'male', '1694', 'Vierter Sohn · 1720 gefallen',
    'Dafydd starb 1720 mit 26 Jahren im Krieg. Nur Iorwerth, der damals 15 jährige jüngste Bruder, blieb zurück. Über eine Gemahlin oder Kinder Dafydds ist nichts festgelegt.',
    '26-jähriger menschlicher Fischer zu Lebzeiten, schlank, etwas breitere Nase, stumpfbraunes unordentliches kurzes Haar mit seitlichem Scheitel, braune Augen, nur leichter brauner Stoppelbart. Grobes beigebraunes Hemd mit Schnürkragen und kurzer grauer Schulterumhang. Stehend in Dreiviertelansicht, beide Arme locker seitlich, ruhiger aufmerksamer Blick.', { death: '1720', portraitAge: 26 }),
  person('iorwerth', 'Iorwerth Rhwyd', 'male', '1705', 'Mitinhaber · Tresen und Einkauf',
    'Iorwerth war 1720 erst 15 Jahre alt und blieb als einziger der fünf Söhne zu Hause. Heute ist er 35 und führt mit seiner Mutter die überschuldete Kneipe. Er kauft günstigen Tagesfang, zapft und spült. Sein mürrischer, beinahe gleichförmiger Blick täuscht keine Gelassenheit vor: Er ist schlicht müde. Mit Nia hat er den Sohn Dewi.',
    '35-jähriger menschlicher Schankwirt, völlig erschöpft, eingefallene Wangen, schwere braune Augen mit deutlichen Augenringen, stumpfes dreckigbraunes strähniges kurzes Haar, ungleichmäßige braune Stoppeln. Altes verwaschenes graues Leinenhemd, fleckige braune Weste, schlichte Schürze. STEHEND hinter einem niedrigen Tresen, hält genau EINEN Holzkrug tief vor der Hüfte und säubert ihn mit einem Tuch, unkomplizierte Hände. Monotoner mürrischer leicht müder Blick direkt zum Betrachter.'),
  person('meleri', 'Meleri Rhwyd', 'female', '1710', 'Schwester · Bedienung',
    'Iorwerths unverheiratete jüngere Schwester ist 30 und trägt die Becher zu den Tischen. Sie ist munterer als ihr Bruder, hat einen trockenen Scherz für die Stammgäste und kennt deren gewöhnliche Bestellung. Eine Wegheirat ist nicht festgelegt; sie lebt und arbeitet im Familienhaus.',
    '30-jährige erwachsene menschliche Frau, vollbusig und kräftig gebaut, stumpfbraunes gewelltes Haar zu lockerem Zopf gebunden, braune Augen, lebhafte runde Gesichtszüge. Abgetragenes moosbraunes mittelalterliches Miederkleid mit cremefarbener Bluse und einfacher Schürze, praktische vollständig bekleidete Wirtshauskleidung. Stehend im Dreiviertelprofil, trägt EINEN kleinen Holzkrug sicher in einer Hand auf Hüfthöhe, andere locker, munteres schiefes Lächeln.'),
  person('nia', 'Nia', 'female', '1707', 'Iorwerths Gemahlin · Küche',
    'Nia ist 33 und kocht die kleine Fischkarte des Hauses. Aus günstigem Fang, Wurzeln, Kohl und Gerste macht sie sättigende Portionen. Mit Iorwerth ist sie seit 1725 verheiratet; ihr Sohn Dewi hilft überall mit. Ihr Herkunftshaus bleibt unbekannt.',
    '33-jährige menschliche Frau, stumpfbraunes dichtes Haar vollständig in schlichtem losem Knoten, braune Augen, markante Wangenknochen und kleine Sommersprossen, abgearbeitet aber wacher klarer Blick. Einfaches verwaschenes rotbraunes langes Kleid, hochgekrempelte Ärmel, grobe helle Küchenschürze. Stehend seitlich am Herd, Arme locker tief vor dem Körper, kein Gegenstand in den Händen, kleines beherrschtes Lächeln.', { unknownOrigin: true }),
  person('dewi', 'Dewi Rhwyd', 'male', '1726', 'Hausbursche · hilft überall',
    'Dewi ist 14, der Sohn Iorwerths und Nias. Er trägt Holz und Wasser, räumt Becher ab, holt kleine Einkäufe und findet auf fast jede Ermahnung eine freche Antwort. Hinter seiner großen Klappe steckt ein Junge, der den erschöpften Erwachsenen mehr Arbeit abnimmt, als er zugibt.',
    '14-jähriger menschlicher Junge, eindeutig jugendliches noch kindliches Gesicht und schmale altersgemäße Statur, stumpfbraunes zerzaustes Haar, braune Augen wie seine Eltern, freches Grinsen. Vollständig bekleidet mit geflickter grober graubrauner Tunika, langen Hosen und schlichten Schuhen. Stehend mit einer Hand an der Hüfte und anderer locker, kecker Blick, keine Waffen, kein Alkohol, keine erwachsene Muskulatur.')
]);

export const DURST_MAID = Object.freeze({ key: 'carys', id: 'carys-kleiner-durst', worldPersonId: 'person--kleiner-durst--carys',
  name: 'Carys', sex: 'female', birth: '1713', role: 'Magd · Reinigung, Wäsche und schwere Handgriffe',
  portrait: `${DURST_ART}/portraits/carys.png`,
  bio: 'Die 27 jährige Carys ist die einzige Angestellte. Sie schrubbt, wäscht, trägt Wasser und packt beim Bewegen der Fässer an. Eine hübsche Frau mit kräftigen Armen, geradem Rücken und wenig Geduld für Gäste, die ihr die Arbeit unnötig schwer machen. Einen Nachnamen führt der Eintrag nicht.',
  appearance: '27-jährige erwachsene menschliche Frau, hübsches kantig-ovales Gesicht, braune Augen, dunkelbraunes glattes Haar in festem tiefem Knoten, kräftige Schultern und kräftige Unterarme durch körperliche Arbeit, normale natürliche Proportionen. Einfaches einteiliges graugrünes mittelalterliches Arbeitskleid mit hochgekrempelten Ärmeln und grober Schürze. Stehend nach rechts gedreht mit geradem Rücken, Arme entspannt, selbstbewusster ruhiger Blick. Keine Luxuskleidung.' });

export const DURST_DOG = Object.freeze({ key: 'bram', name: 'Bram', age: 16, birth: '1724', species: 'Ponter', role: 'Alter Wachhund · meist am Kamin',
  portrait: `${DURST_ART}/portraits/bram.png`,
  bestiaryReference: { id: 'tiere/vieh/haustiere/hunde/ponter', name: 'Ponter', url: '/Bestiarium/tiere/vieh/haustiere/hunde/ponter/index.html' },
  bio: 'Bram ist ein 16 jähriger Ponter und seit langem beim Haus. Der frühere Aufpasser ist steif, schwerhörig und fast immer vor dem Kamin zu finden. Meist hebt er beim Öffnen der Tür nur ein Lid. Einen bezahlten Wachmann können sich die Rhwyd nicht leisten; Bram ist längst mehr Familiengefährte als Schutz.',
  appearance: 'Ein uralter 16 jähriger mittelgroßer schlanker Ponter-Hund, wetterfestes stumpfes graubraunes Fell, weißgraue Schnauze, große ehemals aufgerichtete nun entspannte Ohren wie im Bestiarium, getrübte braune Augen. LIEGT erschöpft aber lebend auf einem dünnen geflickten Wolltuch vor einem kleinen gemauerten Kneipenkamin, Kopf auf den Pfoten, ein Auge halb offen, zartes Glutlicht. Kein Welpe, kein Kampfhund, keine Wunden, kein Blut, kein Ritter und keine Menschen im Bild.' });

export const durstPerson = key => RHWYD_PEOPLE.find(person => person.key === key);
export const DURST_LIVING = Object.freeze([...RHWYD_PEOPLE.filter(person => !person.death), DURST_MAID]);
