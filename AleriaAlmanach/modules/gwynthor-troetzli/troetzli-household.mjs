// Shared public identities for the family charts, character archive and notice.
const portraits = '/AleriaAlmanach/assets/gwynthor-troetzli/portraits';
const person = (key, data) => Object.freeze({
  id: key, worldPersonId: `person--haus-${key === 'esyllt-penrudd' ? 'penrudd' : 'llythfor'}--${key}`,
  death: '', spouse: false, household: 'city', culture: 'Cenyri', ...data,
});

export const TROETZLI_PEOPLE = Object.freeze({
  cynddelw: person('cynddelw-llythfor', {
    name: 'Cynddelw Llythfor', sex: 'male', birth: '1698', age: 42,
    role: 'Berichterstatter bei Celtigerns Echo', portrait: `${portraits}/cynddelw-llythfor.png`,
    appearance: '42 Jahre. Glattes braunes Haar nach hinten gestrichen, lässige Wollmütze, frecher gepflegter Kinnbart und schmaler Schnurrbart. Drückt ein kleines Lederbuch an die Brust, die andere Hand am Kinn; verträumt grübelnder Blick zum Himmel. Schlichte gepflegte Bürgerkleidung.',
    bio: 'Gebürtiger Gwynthorer und Berichterstatter für Celtigerns Echo. Reist für Gespräche und Nachforschungen zwischen den Orten der Grafschaft. Lebt mit Esyllt Penrudd und ihrer Tochter Eirlys in Gwynthor. Sein alter Hest wird den Reisen nicht mehr lange gewachsen sein. Für 500 Kupfer kaufte er einem Söldner den jungen erwachsenen Rhyfel-Hengst Trötzli ab; dessen heftige Schreck- und Abwehrreaktionen überfordern ihn. Er verschweigt diese Schwierigkeiten keinem Kaufinteressenten und sucht nun Hilfe für die Überführung zu seinem Schwiegervater Tudur auf den Penrudd-Hof.',
  }),
  esyllt: person('esyllt-penrudd', {
    name: 'Esyllt Penrudd', sex: 'female', birth: '1706', age: 34,
    role: 'Jüngste Tochter Tudurs · lebt in Gwynthor', portrait: `${portraits}/esyllt-penrudd.png`,
    hairColor: 'braun', eyeColor: 'braun', portraitAge: 34,
    appearance: '34 Jahre. Braunes dichtes Haar, halb geflochten und über einer Schulter offen, braune Augen und feine Sommersprossen. Ähnelt ihrer älteren Schwester Eluned in Nase und Augenbrauen, mit weicheren feineren Gesichtszügen und einem warmen, schelmischen Lächeln. Schlichtes gepflegtes blaugrünes Stadtkleid über hellem Leinen.',
    bio: 'Jüngste Tochter Tudurs und Bethans, jüngere Schwester Meurigs und Eluneds. Wuchs auf dem Penrudd-Hof auf und lebt seit ihrer Heirat mit dem Berichterstatter Cynddelw Llythfor in Gwynthor. Ihre gemeinsame Tochter heißt Eirlys. Der Kontakt zum Hof ist eng geblieben; Tudur weiß von der geplanten Aufnahme Trötzlis. Esyllt unterstützt die Suche nach erfahrener Hilfe, ohne ihrem Mann einzureden, er müsse das verängstigte Pferd selbst bezwingen.',
  }),
  eirlys: person('eirlys-llythfor', {
    name: 'Eirlys Llythfor', sex: 'female', birth: '1730', age: 10,
    role: 'Tochter Cynddelws und Esyllts', portrait: `${portraits}/eirlys-llythfor.png`,
    appearance: 'Zehn Jahre. Braunes Haar in zwei Zöpfen, braune Augen und feine Sommersprossen. Grinst frech mit einer sichtbaren Zahnlücke. Hält einen einfachen Malstift und einen Papierfetzen in den Händen; schlichte blaugrüne Kinderkleidung über hellem Leinen.',
    bio: 'Zehnjährige Tochter Cynddelw Llythfors und Esyllt Penrudds. Lebt mit ihren Eltern in Gwynthor und zeichnet gern. Mit ihren beiden Zöpfen, dem frechen Zahnlückengrinsen und einem Malstift in der Hand ist sie leicht wiederzuerkennen. Gab dem neuen Pferd den Namen Trötzli, weil es sich so trotzig benimmt, und steuerte die Zeichnung von Papas Beinahetritt zu seinem Gesuch bei. Ihre Zuneigung zum Tier bedeutet nicht, dass sie es allein führt oder reitet.',
  }),
});

export const LLYTHFOR_EMBLEM = 'assets/images/placeholders/neutral-crest.png';
export const LLYTHFOR_MARRIAGE_ID = 'marriage-cynddelw-llythfor-esyllt-penrudd';
export const LLYTHFOR_MARRIAGE_YEAR = '1730';
export const TROETZLI_PORTRAIT = `${portraits}/troetzli.png`;
