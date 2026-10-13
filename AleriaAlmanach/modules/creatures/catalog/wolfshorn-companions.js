import { createHouseholdCompanion } from './household-companion-profiles.js?v=20261013-wolfshorn-v1';

export const WOLFSHORN_OWNER_IDS = Object.freeze({
  hrolf: '0caPdKpJoVazPUuu2KMu', halvar: 'wvBnM1mHYYXycW9nnza9',
  asgeir: 'oUlhJyX6C4Q69mtLS9u1', ylva: 'bSYZYAEOwiRgy44f6OmO'
});
const portrait = name => `/AleriaAlmanach/assets/companions/wolfshorn/${name}.png`;

function companion(spec, biography) {
  const source = createHouseholdCompanion({
    ownerId: WOLFSHORN_OWNER_IDS[spec.ownerSlug], location: 'Celtigerns Wacht',
    habitat: 'Celtigerns Wacht, Gwynthor · aus Hornhall in Aldrimar',
    portrait: portrait(spec.slug), ...spec
  });
  return { ...source, biography: { ...source.biography, ...biography,
    facts: [...source.biography.facts, { label: 'Besitzer', value: spec.ownerName }, ...(biography.facts || [])],
    connections: [{ type: 'connection', name: spec.ownerName, detail: 'Besitzer und vertraute Bezugsperson' }, ...(biography.connections || [])]
  } };
}

const skarn = companion({
  slug: 'skarn', name: 'Skarn', ownerSlug: 'hrolf', ownerName: 'Hrolf Wolfshorn',
  profile: 'wolf', species: 'Gramnir · Nordwolf', level: 2, scores: [14, 8, 8, 3, 14, 12], movement: 6,
  description: 'Skarn ist Hrolfs gigantischer, 36 Jahre alter Gramnir und der Großvater von Freki. Noch immer erhaben, doch abgekämpft und deutlich altersschwach, steht er am Ende seines Lebens.',
  abilities: [['Gebrechlicher Überlebender', 'Seine Größe täuscht nicht über seine Altersschwäche hinweg. Lange Wege und Anstrengung setzen ihm zu; er benötigt häufige Ruhe und Hrolfs Unterstützung.']]
}, {
  appearance: 'Gigantischer graubrauner Nordwolf mit stark ergrautem Fell, breitem altem Fang, abgenutzten Ohren und beiden bernsteinfarbenen Augen. Seine aufrechte Haltung bewahrt Würde, obwohl sein Körper müde und abgekämpft ist.',
  personality: 'Alt, ruhig und erhaben. Seine schwindenden Kräfte machen ihn auf Hrolfs Fürsorge angewiesen.',
  history: 'Gramnir-Wölfe erreichen selten ihr dreißigstes Lebensjahr; Skarn ist bereits 36. Er ist Frekis Großvater. Die übrigen Wölfe kamen während der schlechten Jahre bei Hornhall um; Skarn und Freki sind die Überlebenden. Der lange Weg nach Gwynthor tat ihm nicht gut. Gegen Ende warf Hrolf ihn über die Schulter und trug ihn weiter. Seine Jahre sind gezählt.',
  bonds: 'Eng mit Hrolf Wolfshorn verbunden. Großvater von Ylvas Gramnir Freki; die beiden überlebten den Niedergang Hornhalls.',
  habits: 'Braucht kurze Wege, viel Ruhe und Fürsorge. Seine Erschöpfung und Altersschwäche sind Teil seines Alltags.',
  facts: [{ label: 'Alter', value: '36 Jahre' }, { label: 'Zustand', value: 'Altersschwach; am Ende seines Lebens' }, { label: 'Verwandtschaft', value: 'Großvater von Freki' }],
  traits: [{ title: 'Erhaben', detail: 'Selbst abgekämpft bleibt seine Haltung würdevoll.' }, { title: 'Letzter Lebensabschnitt', detail: 'Die Reise hat ihn gezeichnet; Hrolf musste ihn gegen Ende tragen.' }],
  connections: [{ type: 'connection', name: 'Freki', detail: 'Enkel; neben Skarn der überlebende Wolf aus den schlechten Jahren bei Hornhall.' }]
});

const myrk = companion({
  slug: 'myrk', name: 'Myrk', ownerSlug: 'hrolf', ownerName: 'Hrolf Wolfshorn',
  profile: 'horse', species: 'Hest-Hengst', level: 3, scores: [18, 10, 14, 2, 12, 10], movement: 15,
  description: 'Myrk ist Hrolfs in die Jahre gekommener Hest-Hengst: zäh, kräftig, gehorsam und über alle Maßen treu. Der klobige, kantige Schecke ist ein gutes, stoisches Tier.'
}, {
  appearance: 'Schwerer, kantiger Kaltblüter mit dunkelbraun-schwarzen und hellen Flecken. Die kräftigen Beine sind vom Sumpfmatsch bräunlich-grün verfärbt. Schlichtes altes Sattelzeug mit dem früheren Wolfshorn-Zeichen.',
  personality: 'Streng und stoisch, zäh und gefolgsam. Trotz seines Alters besitzt er noch erhebliche Kraft. Seine Treue zu Hrolf ist außergewöhnlich.',
  history: 'Hrolfs älterer Hest-Hengst stammt aus der sumpfigen Heimat der Wolfshorn und begleitet seinen Herrn nach Gwynthor.',
  bonds: 'Besitzer und Reiter: Hrolf Wolfshorn. Über alle Maßen treuer Begleiter.',
  facts: [{ label: 'Geschlecht', value: 'Hengst' }, { label: 'Rasse', value: 'Hest' }, { label: 'Alter', value: 'Älter; genaue Jahreszahl nicht festgelegt' }],
  traits: [{ title: 'Unerschütterlich treu', detail: 'Folgt seinem vertrauten Herrn gehorsam.' }, { title: 'Zäh', detail: 'Alt geworden, aber weiterhin kräftig und belastbar.' }]
});

const lund = companion({
  slug: 'lund', name: 'Lund', ownerSlug: 'halvar', ownerName: 'Halvar Wolfshorn',
  profile: 'horse', species: 'Hest–Tirashan-Mischling', level: 3, scores: [16, 14, 14, 2, 14, 10],
  description: 'Lund ist Halvars wachsames Waldpferd, ein Mischling mit Hest- und Tirashan-Abstammung. Die Linie ist unzuverlässig dokumentiert und kann weitere Rassen enthalten. Seine Aufmerksamkeit hat Halvar mehr als einmal das Leben gerettet.',
  abilities: [['Wachsames Waldpferd', 'Schreckt auf, wenn er einen Unhold oder eine ähnliche Gefahr riecht, hört oder wahrnimmt. Wahrnehmungsproben und die tatsächlichen Umstände entscheiden, was er bemerkt; seine Warnung ist keine sichere magische Erkennung.']]
}, {
  appearance: 'Kräftiges braunes Waldpferd mit dunkler Mähne, dunklen Beinen und dezenten dunklen Flecken. Kompakter Hest-Einschlag, etwas wendiger und weniger kantig durch die Tirashan-Abstammung. Aufmerksame Ohren, schlichtes Lederzeug.',
  personality: 'Ein gutes, sehr wachsames Pferd. Reagiert mit deutlichem Aufschrecken auf wahrgenommene Unholde und ähnliche Gefahren.',
  history: 'Hest und Tirashan gehören zu seiner Abstammung. Die Zucht ist nicht zuverlässig dokumentiert; weitere Rassen können in der Linie vorkommen. Lund gilt deshalb als Mischling, nicht als Zuchtpferd einer festgelegten Rasse. Er hat Halvar nicht nur einmal das Leben gerettet.',
  bonds: 'Besitzer und Reiter: Halvar Wolfshorn. Seine Aufmerksamkeit hat Halvar wiederholt vor Gefahr bewahrt.',
  habits: 'Achtet auf Gerüche und Geräusche im Wald. Sein Aufschrecken kann Halvar warnen, verlangt aber auch aufmerksame Führung.',
  facts: [{ label: 'Abstammung', value: 'Hest und Tirashan; weitere Rassen möglich, Linie unsicher dokumentiert' }, { label: 'Einordnung', value: 'Mischling; keine fest benannte Zucht' }],
  traits: [{ title: 'Wachsam', detail: 'Reagiert auf wahrgenommene Unholde und ähnliche Gefahren.' }, { title: 'Lebensretter', detail: 'Hat Halvar mehr als einmal das Leben gerettet.' }]
});
lund.bestiaryAncestry = {
  references: [{ id: 'tiere/pferde/hest' }, { id: 'tiere/pferde/tirashan' }],
  notes: 'Hest- und Tirashan-Abstammung; unzuverlässig dokumentierte Linie. Weitere Rassen sind möglich. Mischling, keine fest benannte Zucht.'
};

const haeppchen = companion({
  slug: 'haeppchen', name: 'Häppchen', ownerSlug: 'asgeir', ownerName: 'Asgeir Wolfshorn',
  profile: 'horse', species: 'Hest', level: 2, scores: [16, 10, 14, 2, 10, 8], movement: 15,
  description: 'Häppchen ist Asgeirs disziplinloser Hest-Schimmel. Gelangweilt und müde blickt das schwere Arbeitspferd in die Welt. Sein Name folgt Asgeirs makabrer Gewohnheit, seine Pferde nach ihrem befürchteten Ende zu nennen.'
}, {
  appearance: 'Klobiger, kantiger heller Apfelschimmel mit kräftigen Beinen, großen Hufen und ungeordneter silberheller Mähne. Halb geschlossene, gelangweilte Augen; entspannte Haltung und schlichtes gebrauchtes Sattelzeug.',
  personality: 'Disziplinlos, gelangweilt und häufig müde wirkend. Asgeir legt wenig Wert aufs Reiten und mag Pferde nicht besonders.',
  history: 'Asgeir hat bereits vier bis fünf Pferde an Wölfe, Unholde oder durch ungeschicktes Reiten verloren. Weil er unterwegs zu unvorsichtig mit ihnen ist, nennt er seine Pferde gewohnheitsmäßig Häppchen: Letztlich, so seine makabre Begründung, enden sie ohnehin als Häppchen für irgendwelche Tiere.',
  bonds: 'Besitzer und Reiter: Asgeir Wolfshorn. Seine geringe Begeisterung fürs Reiten und seine Unvorsichtigkeit prägen den Umgang mit dem Pferd.',
  facts: [{ label: 'Rasse', value: 'Hest' }, { label: 'Fellfarbe', value: 'Schimmel' }, { label: 'Namensherkunft', value: 'Asgeirs Gewohnheit nach dem Verlust von vier bis fünf Pferden' }],
  traits: [{ title: 'Disziplinlos', detail: 'Kein sorgfältig erzogenes Vorzeigereitpferd.' }, { title: 'Gelangweilt', detail: 'Müder Blick und wenig Begeisterung.' }]
});

const silberkrone = companion({
  slug: 'silberkrone', name: 'Silberkrone', ownerSlug: 'ylva', ownerName: 'Ylva Wolfshorn',
  profile: 'horse', species: 'Hest-Stute', level: 3, scores: [16, 12, 14, 2, 12, 12], movement: 15,
  description: 'Silberkrone ist Ylvas sorgfältig gepflegte Hest-Stute, ein sauberer Schimmel mit strahlend silberner, geflochtener Mähne. Ihre außergewöhnliche Pflege fällt gerade angesichts ihrer sumpfigen Herkunft auf. Ylvas Wolfshorn-Schild hängt am Sattel.'
}, {
  appearance: 'Kräftiger Hest-Kaltblutkörper mit etwas weicheren, weniger kantigen Zügen als die männlichen Tiere. Sauberes helles Schimmelfell, strahlend silberne Flechtmähne und gepflegter silberner Schweif. Schlichtes braunes Lederzeug; roter Wolfshorn-Rundschild mit schwarzem, golden eingefasstem Wolfskopf, Eisenrand und Schildbuckel am Sattel.',
  personality: 'Gepflegte, aufmerksam und gelassen wirkende Reitstute; Ylvas sorgsamer Umgang prägt ihr Erscheinungsbild.',
  history: 'Silberkrone stammt aus der Sumpflandschaft der Wolfshorn-Heimat. Dass ihr Haar trotzdem strahlend silbern und sauber bleibt, zeigt, wie sorgfältig Ylva ihr Pferd pflegt.',
  bonds: 'Besitzerin und Reiterin: Ylva Wolfshorn. Die silberne Mähne gab Silberkrone ihren Namen.',
  habits: 'Ylva hält Fell und Haar sauber, pflegt die auffällige Silbermähne und flicht sie sorgfältig.',
  facts: [{ label: 'Geschlecht', value: 'Stute' }, { label: 'Rasse', value: 'Hest' }, { label: 'Fellfarbe', value: 'Schimmel' }, { label: 'Merkmal', value: 'Strahlend silberne, geflochtene Mähne' }],
  traits: [{ title: 'Sorgfältig gepflegt', detail: 'Sauber bis in die silberne Mähne, trotz der sumpfigen Herkunft.' }]
});

export const WOLFSHORN_COMPANIONS = Object.freeze([skarn, myrk, lund, haeppchen, silberkrone]);
