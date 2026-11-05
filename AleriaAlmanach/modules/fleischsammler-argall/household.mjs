// Authored on 2 November 2026. Public family and office facts only.
const portraitRoot = '/AleriaAlmanach/assets/fleischsammler-argall/portraits';
export const ARGALL_CAPTAIN_HOME = Object.freeze({
  mapId: 'cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis',
  pinId: 'gwynthor-marking-091', name: 'Caer Ysgellfor',
  captainId: 'rhydric-argall', squireId: 'perwyn-argall'
});

export const ARGALL_CAPTAIN_PEOPLE = Object.freeze({
  captain: Object.freeze({ id: 'rhydric-argall', worldPersonId: 'person--haus-argall--rhydric-argall',
    name: 'Rhydric Argall', sex: 'male', birth: '1700', age: 40, houseId: 'house-argall',
    role: 'Burgverwalter und Hauptmann von Caer Ysgellfor', portrait: `${portraitRoot}/rhydric-argall.png`,
    appearance: 'Abgekämpft und übermüdet, deutliche Augenringe, etwas zerzaustes rotbraunes Haar. Gwynthorer Hauptmannsrüstung und roter Mantel. Eine Hand ruht am Knauf des eingesteckten Schwertes, die andere hält einen Apfel.',
    biography: 'Rhydric ist der deutlich jüngere Bruder Dyrwyn Argalls und ein Vetter Brinthan und Uthyr Argalls. Er verwaltet Caer Ysgellfor und führt dort als Hauptmann den Wachdienst. Die kleine Festung schützt die umliegenden Höfe und die Hauptstraße und sammelt Getreide und Vorräte für Gwynthor. Die ungelöste Mordserie überfordert ihn; er wirkt abgekämpft und schläft zu wenig. Seine Ehe mit Gwenella ist geschieden. Sie verließ ihn und brannte mit dem Barden Maelor Ffionydd nach Aberon durch. Der gemeinsame Sohn Perwyn lebt bei Rhydric und dient ihm als Knappe.' }),
  squire: Object.freeze({ id: 'perwyn-argall', worldPersonId: 'person--haus-argall--perwyn-argall',
    name: 'Perwyn Argall', sex: 'male', birth: '1723', age: 17, houseId: 'house-argall',
    role: 'Knappe seines Vaters Rhydric Argall', portrait: `${portraitRoot}/perwyn-argall.png`,
    appearance: 'Siebzehnjähriger schmaler Jugendlicher, sorgfältig gerichtetes kupferrotes Haar, selbstgefälliger stolzer Blick. Gut gepflegte Gwynthorer Knappenrüstung mit rotem Stoff, leichten Metallteilen und Kettenzeug; vollständig bekleidet.',
    biography: 'Perwyn ist der gemeinsame Sohn Rhydric Argalls und Gwenellas. Die Scheidung seiner Eltern verändert seine Abstammung nicht. Er lebt bei seinem Vater in Caer Ysgellfor und dient ihm als Knappe. Er ist eitel, hält Haar und Rüstung sorgfältig in Ordnung und trägt seinen jungen Rang mit sichtlichem Stolz. Einen eigenen Ritterschlag besitzt er noch nicht.' }),
  mother: Object.freeze({ id: 'gwenella-spouse-rhydric-argall', worldPersonId: 'person--family-tree--gwenella-spouse-rhydric-argall',
    name: 'Gwenella', sex: 'female', birth: '1702', age: 38, houseId: '',
    role: 'Perwyns Mutter · geschiedene Frau Rhydric Argalls', portrait: `${portraitRoot}/gwenella.png`,
    appearance: 'Schöne erwachsene Frau mit langem gepflegtem kupferrotem Haar, stolzer Haltung und arrogantem, abschätzigem Blick. Gepflegte gute Reisekleidung in gedämpftem Grün und Creme, dezenter Schmuck.',
    biography: 'Gwenella ist Perwyn Argalls Mutter und war mit Rhydric Argall verheiratet. Die Ehe ist geschieden. Sie hat eine Affäre mit dem Barden Maelor Ffionydd und ist mit ihm nach Aberon durchgebrannt. Der Affärengrund lautet: „Durchgebrannt nach Aberon“. Ihren Sohn Perwyn hat sie aus ihrer Ehe mit Rhydric. Sie gilt als Schönheit und begegnet anderen mit ausgeprägtem Hochmut. Ihre Herkunftsfamilie ist nicht überliefert.' }),
  bard: Object.freeze({ id: 'maelor-ffionydd', worldPersonId: 'person--family-tree--maelor-ffionydd',
    name: 'Maelor Ffionydd', sex: 'male', birth: '1705', age: 35, houseId: '',
    role: 'Barde · Affäre mit Gwenella', portrait: `${portraitRoot}/maelor-ffionydd.png`,
    appearance: 'Schlanker erwachsener fahrender Barde, dunkles gewelltes Haar, selbstsicheres gewinnendes Lächeln. Gut geschnittener Reisemantel in gedämpftem Petrol und Weinrot; eine schlichte Laute gehört zu seinem Beruf.',
    biography: 'Maelor Ffionydd ist ein fahrender Barde und hat eine Affäre mit Gwenella. Sie verließ ihren Mann Rhydric Argall und brannte mit Maelor nach Aberon durch. Der Affärengrund lautet: „Durchgebrannt nach Aberon“. Eine Ehe zwischen ihnen ist nicht festgelegt. Maelor ist nicht Perwyns Vater. Über seine Herkunftsfamilie und eigene Kinder ist nichts festgelegt.' })
});

// The quest consumes this neutral office card, never the household biographies.
export const ARGALL_CAPTAIN_QUEST_CONTACT = Object.freeze({
  name: ARGALL_CAPTAIN_PEOPLE.captain.name, role: ARGALL_CAPTAIN_PEOPLE.captain.role,
  description: 'Verantwortet Burgverwaltung und örtlichen Wachdienst in Caer Ysgellfor im östlichen Bannkreis.',
  kind: 'character', recordId: ARGALL_CAPTAIN_PEOPLE.captain.worldPersonId,
  image: ARGALL_CAPTAIN_PEOPLE.captain.portrait, profile: ''
});
