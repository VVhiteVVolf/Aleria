export const STORE_ART = './assets/pendrwn-general-store';
export const PENDRWN_EMBLEM = '../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Pendrwn.png';
export const FORTUNA_EMBLEM = '../Fraktionen/assets/emblems/gilden/markt-der-fortuna.webp';
export const DRAIG_EMBLEM = '../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-draig.png';
const portrait = key => `${STORE_ART}/portraits/${key}.png`;

// The shop belongs exclusively to the new eldest branch and Idwal.
// Existing Meilyr/Gwenith descendants are intentionally absent from this roster.
export const STORE_FAMILY = Object.freeze([
  { key: 'cadwgan', id: 'cadwgan-pendrwn', name: 'Cadwgan Pendrwn', sex: 'male', birth: '1684', role: 'Inhaber · Einkauf und Verkauf',
    portrait: portrait('cadwgan'), bio: '56 Jahre. Idwals ältester Sohn und älterer Bruder Meilyrs und Gweniths führt den Vollen Korb gemeinsam mit seinem Vater. Geduldig im Gespräch, gründlich bei Mengen und unbeirrbar bei offenen Rechnungen.',
    appearance: '56-jähriger breitschultriger Mann, kantiges breites Gesicht, kräftige gerade Nase, kleine Lachfalten, satt kupferrotes kurzes seitlich gekämmtes Haar, gepflegter kurzer roter Vollbart, klare grüne Augen. Rostbrauner Wollrock über cremefarbenem Leinenhemd, dunkelgrüne Weste, einfacher Ledergürtel. Stehend, gelassenes schiefes Lächeln, eine Hand locker auf einem geschlossenen Warenbuch, andere am Gürtel. Keine grauen oder braunen Haarpartien.' },
  { key: 'mabli', id: 'mabli-spouse-pendrwn', name: 'Mabli', sex: 'female', birth: '1687', role: 'Kasse · Haushaltsbedarf',
    portrait: portrait('mabli'), bio: '53 Jahre. Cadwgans Gemahlin führt die Tageskasse und prüft die kleinen Hauswaren. Warmherzig, sparsam und schwer durch schöne Verpackung zu beeindrucken. Ihr Herkunftshaus bleibt vorerst offen.',
    appearance: '53-jährige Cenyri-Frau, rundliches herzförmiges Gesicht, leichte Sommersprossen, grüne Augen, einheitlich dunkelrotes Haar in einem dicken geflochtenen Haarkranz. Ockerfarbenes schlichtes Leinenkleid mit brauner Schürze, kleine Messingohrringe. Aufrecht stehend, verschmitztes geschlossenes Lächeln, beide Hände locker um einen kleinen Geldbeutel vor dem Bauch. Reife sichtbare Gesichtszüge, kein jugendliches Gesicht.' },
  { key: 'rhun', id: 'rhun-pendrwn', name: 'Rhun Pendrwn', sex: 'male', birth: '1710', role: 'Wareneingang · Auslieferung',
    portrait: portrait('rhun'), bio: '30 Jahre, unverheiratet. Cadwgans und Mablis Sohn nimmt Lieferungen an, vergleicht Fracht mit Bestellung und bringt kleinere Einkäufe zu Stammkunden. Wortkarg, kräftig und zuverlässig.',
    appearance: '30-jähriger großer kräftiger Cenyri-Mann, langes rechteckiges Gesicht, breite Nase, grüne Augen, einheitlich ziegelrotes lockiges Haar bis knapp über die Ohren, glatt rasiert. Hochgekrempeltes hellgraues Leinenhemd, lederne Trägerweste, dunkelbraune Hose. Stehend in entspannter Dreiviertelansicht, eine leere flache Holzkiste leicht an die Hüfte gelehnt, andere Hand offen am Kistenrand. Ruhiger freundlicher Blick, einfacher sicherer Griff.' },
  { key: 'tesni', id: 'tesni-pendrwn', name: 'Tesni Pendrwn', sex: 'female', birth: '1715', role: 'Verkauf · Bestellungen',
    portrait: portrait('tesni'), bio: '25 Jahre, unverheiratet. Cadwgans und Mablis Tochter berät am Tresen und merkt sich ungewöhnliche Kundenwünsche. Wach, neugierig und offen im Umgang, ohne jedes Geschäft schönzureden.',
    appearance: '25-jährige Cenyri-Frau mit schmalem ovalem Gesicht, grünen Augen, leichten Sommersprossen, einheitlich leuchtend rotem glattem Haar in einem hohen lockeren Pferdeschwanz, kurze seitliche Strähnen. Taubenblaues praktisches Kleid mit cremefarbener Bluse, schmaler brauner Gürtel. Stehend, leicht zur Seite gedreht, eine Hand locker in die Hüfte gestützt, andere hält einen zusammengefalteten Bestellzettel. Aufmerksames offenes Lächeln.' }
].map(p => Object.freeze({ ...p, worldPersonId: `person--haus-pendrwn--${p.id}` })));

export const IDWAL = Object.freeze({ key: 'idwal', id: 'idwal-pendrwn', name: 'Idwal Pendrwn', birth: '1661',
  worldPersonId: 'person--haus-pendrwn--idwal-pendrwn', role: 'Mitinhaber · Lieferanten und Rechnungsbücher',
  portrait: '../Stammbäume/assets/images/portraits/haus-pendrwn/idwal-pendrwn.png',
  bio: '79 Jahre. Das Familienoberhaupt führt den Laden mit Cadwgan. Er pflegt die Lieferbeziehung zum Markt der Fortuna und prüft größere Bestellungen; den langen Tag am Tresen überlässt er seinem Sohn.' });

export const STORE_STAFF = Object.freeze([
  { key: 'elen', name: 'Elen', birth: '1716', role: 'Verkäuferin · Kleinteile und Verpackung',
    bio: '24 Jahre. Scharf im Kopfrechnen und freundlich zu Unentschlossenen. Legt kleine Bestellungen sorgfältig zusammen und lässt sich selten aus der Ruhe bringen.',
    appearance: '24-jährige Cenyri-Frau, olivbraune Augen, kurzes dunkelbraunes kinnlanges Haar mit geradem Pony, eckiges Gesicht mit kräftigen Augenbrauen. Salbeigrünes einfaches Kleid, gestreifte helle Schürze. Stehend, leicht erhobene linke Augenbraue und kleines amüsiertes Lächeln, ein einzelnes sauber gefaltetes Tuch locker über dem Unterarm, andere Hand entspannt unten.' },
  { key: 'iestyn', name: 'Iestyn', birth: '1702', role: 'Lagergehilfe · Tragen und Einräumen',
    bio: '38 Jahre. Behält den Überblick über Kisten und Regalfächer. Redet wenig, packt rasch zu und kennt das Knarren jeder Stufe zur Hintertür.',
    appearance: '38-jähriger stämmiger Cenyri-Mann, braune Augen, dunkelbraunes sehr kurz geschorenes Haar, dichter brauner Schnurrbart ohne Bart am Kinn, breites rundes Gesicht. Grobes dunkelrotes Arbeitshemd, abgewetzte lederne Arbeitsschürze. Stehend in Seitenansicht mit zum Betrachter gedrehtem Kopf, Hände locker hinter dem Rücken, entspanntes warmes Grinsen. Keine Kiste halten.' },
  { key: 'cadoc', name: 'Cadoc', birth: '1695', role: 'Hauswächter · Tür und Lieferhof',
    bio: '45 Jahre. Ein einzelner bezahlter Wächter für Eingang, Lieferungen und den abendlichen Verschluss. Besonnen und aufmerksam; bei ernstem Ärger ruft er die Stadtwache.',
    appearance: '45-jähriger schlanker hochgewachsener Cenyri-Mann, graugrüne Augen, einheitlich dunkelrotes schulterlanges Haar im tiefen Nackenknoten, markante Wangen, kurzer roter Kinnbart, kleine alte Narbe an der rechten Braue. Dunkelblaue gepolsterte Jacke über Leinen, schlichter Ledergürtel, kurzer Knüppel am Gürtel, kein Ritterharnisch. Aufrecht stehend, Gewicht locker auf ein Bein verlagert, Arme locker vor der Brust verschränkt, ruhiger nüchterner Blick.' }
].map(p => Object.freeze({ ...p, portrait: portrait(p.key), worldPersonId: `person--gwynthor-voller-korb--${p.key}` })));

export const STORE_CAT = Object.freeze({ key: 'fflam', name: 'Fflam', role: 'Lagerkatze · Cenyric', portrait: `${STORE_ART}/portraits/fflam.png`,
  bio: 'Ein vierjähriger rot getigerter Cenyric mit weißer Brust. Durchstreift den Speicher nach Mäusen und beansprucht den sonnigen Platz neben der Warenannahme.',
  bestiaryReference: { id: 'tiere/vieh/haustiere/katzen/cenyric', name: 'Cenyric', url: '/Bestiarium/tiere/vieh/haustiere/katzen/cenyric/index.html' } });
export const STORE_PEOPLE = Object.freeze([IDWAL, ...STORE_FAMILY, ...STORE_STAFF]);
export const storePerson = key => STORE_PEOPLE.find(p => p.key === key);
