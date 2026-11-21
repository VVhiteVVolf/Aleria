import { ALERIA_CURRENT_YEAR } from '../../../Stammbäume/assets/js/config/chronology.js';
import { DRAIG_GARDE_PEOPLE_BY_ID } from '../../../Stammbäume/assets/js/data/draig-garde-people.js';
import { formatAge } from '../../../Stammbäume/assets/js/domain/person-presentation.js';

const ysabel = DRAIG_GARDE_PEOPLE_BY_ID['ysabel-bronnor'];
export const YSABEL_CHARACTER_ID = ysabel.worldPersonId;
export const YSABEL_BIRTH_YEAR = ysabel.birth;
export const YSABEL_GUARD_PORTRAIT = '/Stammbäume/assets/images/portraits/haus-bronnor/ysabel-bronnor.png';

const asset = file => `/AleriaAlmanach/assets/ysabel-bronnor/${file}`;
const traitIcon = file => `/IconOrdner/Traits%20Icon/${file}.png`;
const trait = (title, detail, icon) => ({ title, detail, icon });
const connection = (name, detail, image) => ({ type: 'connection', name, detail, image, imageFormat: 'portrait' });
const paragraphs = (...text) => text.map(paragraph => `<p>${paragraph}</p>`).join('');

export const YSABEL_COMPANION_DETAILS = Object.freeze([
  {
    slug: 'gwaedor',
    name: 'Gwaedor',
    species: 'Roter Habicht',
    profile: 'hawk',
    portrait: asset('gwaedor-v4.png'),
    description: 'Ysabels roter Habicht. Schon als Knappin trug sie ihn auf der Schulter.',
    appearance: 'Ziegelrotes und rostbraunes Gefieder, hell gebänderte Brust, ein heller Strich über dem goldenen Auge und ein lang gebänderter Schwanz.'
  },
  {
    slug: 'neddwyn',
    name: 'Neddwyn',
    species: 'Tirashan',
    profile: 'horse',
    sex: 'Hengst',
    bestiaryId: 'tiere/pferde/tirashan',
    portrait: asset('neddwyn-v4.png'),
    description: 'Ysabels brauner Tirashan-Hengst mit Sattelzeug des Hauses Bronnor.',
    appearance: 'Das braune, fein gepunktete Fell dunkelt zu den Hufen hin bis ins tiefe Grün ab. Mähne und Schweif sind kurz und militärisch geflochten. Auf der dunklen, rot gesäumten Schabracke steht der rote Adler über dem roten Fels des Hauses Bronnor.'
  }
]);

export const YSABEL_BIOGRAPHY = {
  schema: 'aleria.biography-module',
  schemaVersion: 1,
  pageTitle: 'Ysabel Bronnor',
  stats: [
    { label: 'Name', value: 'Lady Ysabel Bronnor' },
    { label: 'Herkunft', value: 'Haus Bronnor · Penbryn, Tal der Milane' },
    { label: 'Geburtsjahr', value: YSABEL_BIRTH_YEAR },
    { label: `Alter im Jahr ${ALERIA_CURRENT_YEAR}`, value: formatAge(ysabel) },
    { label: 'Dienst', value: 'Leutnant der Draig-Leibgarde in Gwynthor' },
    { label: 'Kriegerkunst', value: 'Helwyr · kundig in der Kunst der Teulu' },
    { label: 'Ehemann', value: 'Pellinard Brândyddyn' },
    { label: 'Kinder', value: 'Drei, darunter Eurgain Brândyddyn als älteste Tochter' },
    ...YSABEL_COMPANION_DETAILS.map(animal => ({
      label: animal.profile === 'horse' ? 'Reittier' : 'Gefährte',
      value: `${animal.name} · ${animal.species}`
    }))
  ],
  biography: {
    portrait: asset('child-v1.png'),
    portraitStages: [asset('squire-v1.png'), asset('gwendolyn-v2.png'), YSABEL_GUARD_PORTRAIT],
    portraitDefaultStage: 4,
    portraitFit: 'contain',
    portraitCaptions: [
      'Als Kind im Haus Bronnor.',
      'Als junge Knappin im Bronnor-Wappenrock, mit Gwaedor auf der Schulter.',
      'Gwendolyn Aderyn und Ysabel Bronnor in Gwynthor.',
      'Lady Ysabel Bronnor in der Montur der Draig-Leibgarde.'
    ],
    biographyTitle: 'Lady Ysabel Bronnor',
    biographyText: paragraphs(
      'Wer Gwendolyn Draig im vertrauten Kreis erlebt, erkennt in Ysabel denselben trockenen Witz und dieselbe Entschlossenheit wieder. Wenn Gwendolyn schon auf dem Sprung ist, hört Ysabel noch zu und stellt die Frage, die beiden entgangen ist. Den Kindern der Draigs begegnet sie wie eine Tante. In ihrer Familie ist diese Nähe selbstverständlich geworden.',
      'Im Dienst ist Ysabel eine verlässliche Strategin. Sie hält Besprechungen knapp, fragt nach den Folgen einer Entscheidung und will wissen, wer Verantwortung übernimmt. Wie Gwendolyn ist sie eine <strong>Helwyr</strong>. Sie beherrscht auch die Kunst der <strong>Teulu</strong> sehr gut und kann zwischen beiden Schulen wechseln.'
    ),
    abilitiesTitle: 'Persönlichkeit',
    abilities: [
      trait('Besonnen', 'Unter Druck nimmt sie sich einen Augenblick zum Zuhören und trifft dann eine klare Entscheidung.', traitIcon('Patient')),
      trait('Treu', 'Sie hält zu den Menschen, denen sie sich verbunden fühlt, auch wenn es für sie etwas kostet.', '/IconOrdner/Cktraits/Trait_devoted.png'),
      trait('Strategisch', 'Sie denkt mehrere Schritte voraus und bemerkt, wo ein scheinbar solider Plan von einer einzigen Annahme abhängt.', traitIcon('Strategist')),
      trait('Pflichtbewusst', 'Sie nimmt ihren Dienst ernst und erwartet von sich selbst dieselbe Sorgfalt wie von ihrer Garde.', traitIcon('Conscientious')),
      trait('Familienverbunden', 'Ysabel nimmt regen Anteil am Leben ihrer Kinder und behandelt Gwendolyns Kinder mit derselben familiären Wärme.', traitIcon('Family_focus')),
      trait('Unnachgiebig', 'Wer sich in ihren Augen einmal als unzuverlässig erwiesen hat, muss lange um eine zweite Chance bitten.', traitIcon('Stubborn')),
      trait('Übergenau', 'Sie prüft mitunter selbst kleine Absprachen nach und lässt ihren Leuten damit weniger Spielraum, als ihnen guttut.', traitIcon('Fussy'))
    ],
    historyTitle: 'Vom Tal der Milane in die Leibgarde',
    historyText: paragraphs(
      `Ysabel wurde ${YSABEL_BIRTH_YEAR} geboren, im selben Jahr wie Gwendolyn Aderyn. Sie wuchs im Ritterhaus Bronnor im Tal der Milane als fröhlicher Frechdachs auf. Gwendolyn war schon damals ihre engste Freundin. In ihren Jahren als Knappin trug Ysabel den dunklen Wappenrock mit dem roten Adler ihres Hauses. Gwaedor, ihr roter Habicht, saß dabei auf ihrer Schulter.`,
      'Als Gwendolyn mit Galahad Draig verlobt wurde, zog sie nach Gwynthor und schloss sich dort den Rittern der Tafelrunde an. Ysabel ging ebenfalls nach Gwynthor und trat der Tafelrunde bei. Dort lernte sie Pellinard Brândyddyn kennen. Die beiden heirateten noch vor Galahad und Gwendolyn und traten als Ehepaar in die Leibgarde des Hauses Draig ein.',
      'Als Gwendolyn schwanger wurde und die Tafelrunde schon früh nicht mehr auf ihren Auszügen begleiten konnte, blieb Ysabel bei ihr. Aus der vertrauten Freundin wurde für Gwendolyns Kinder mit der Zeit eine Tante im gelebten Sinn. Auch unter den erwachsenen Draigs bewegt sich Ysabel mit der Vertrautheit einer Angehörigen.',
      'Im Großen Krieg vor zwanzig Jahren fiel Ysabels Vorgänger. In den Jahren danach wuchs sie Schritt für Schritt in die Verantwortung eines Leutnants hinein. Heute dienen sie und Pellinard beide als Leutnante unter Hauptmann Marared Curiad. Sie haben drei Kinder. Ihre älteste Tochter Eurgain dient als Ritter der Garde.'
    ),
    connectionsTitle: 'Familie und Gefährten',
    connections: [
      connection('Gwendolyn Draig, geborene Aderyn', 'Ihre Freundin seit Kindertagen.', '/Stammbäume/assets/images/portraits/haus-draig/gwendolyn-aderyn.jpg'),
      connection('Pellinard Brândyddyn', 'Ihr Ehemann. Er dient mit ihr als Leutnant unter Marared Curiad.', '/Stammbäume/assets/images/portraits/haus-brandyddyn/pellinard-brandyddyn.png'),
      connection('Eurgain Brândyddyn', 'Ihre älteste Tochter und Ritter der Leibgarde.', '/Stammbäume/assets/images/portraits/haus-brandyddyn/eurgain-brandyddyn.png'),
      ...YSABEL_COMPANION_DETAILS.map(animal => connection(animal.name, animal.description, animal.portrait))
    ],
    footer: 'Personenakte · Ysabel Bronnor'
  }
};

export const YSABEL_BIOGRAPHY_CATALOG_ENTRY = {
  key: 'ysabel-bronnor',
  name: 'Ysabel Bronnor',
  characterIds: [YSABEL_CHARACTER_ID],
  worldPersonIds: [YSABEL_CHARACTER_ID],
  personIds: ['ysabel-bronnor'],
  moduleRefs: [],
  replacedDefaultFingerprints: ['739:192ae880:4adb762e'],
  biography: YSABEL_BIOGRAPHY
};
