import { createHouseholdCompanion } from './household-companion-profiles.js?v=20261013-wolfshorn-v1';

export const DRAIG_RIDING_OWNER_IDS = Object.freeze({
  isobel: 'wnS8JOFUR3oS1izRzObH',
  neithon: '6Gpz6nJaoL7yo9rFu85H',
  odyar: '7VjIYgifnq4uqNNfjzcM',
  rhys: '9hurPRtv2yMJTYkAARkl',
  kane: 'HjDXMMexahez1G0rJrBE',
  carys: 'yLJ0Rr5suTSLa42sL743',
  gethin: '6atOllMA637Z2VNAZAxf'
});

function ridingHorse(spec, biography) {
  const source = createHouseholdCompanion({
    profile: 'horse', ownerId: DRAIG_RIDING_OWNER_IDS[spec.ownerSlug],
    location: 'Celtigerns Wacht', house: 'Haus Draig',
    portrait: `/AleriaAlmanach/assets/companions/haus-draig/${spec.slug}.png`, ...spec
  });
  return {
    ...source,
    portraitCaption: `${spec.name} · ${spec.species} · ${spec.ownerName}`,
    biography: {
      ...source.biography, ...biography,
      facts: [...source.biography.facts, { label: 'Rasse', value: spec.species },
        { label: 'Besitz', value: spec.ownerName }, ...(biography.facts || [])],
      connections: [{ type: 'connection', name: spec.ownerName, detail: 'Besitz und vertraute Bezugsperson' },
        ...(biography.connections || [])]
    }
  };
}

const rhoslyn = ridingHorse({
  slug: 'rhoslyn', name: 'Rhoslyn', ownerSlug: 'isobel', ownerName: 'Isobel Draig',
  species: 'Erlenglanz', level: 2, scores: [10, 18, 10, 2, 12, 16], movement: 21,
  description: 'Rhoslyn ist Isobel Draigs strahlend weißer Erlenglanz: atemberaubend schön, elfenhaft und filigran, mit einer außergewöhnlich voluminösen Mähne. Ein königlich wirkendes Reitpferd mit feinen Bewegungen und sensibler Natur.',
  abilities: [['Sensible Eleganz', 'Schnell und wendig, aber wenig belastbar. Lärm, Blutgeruch und chaotische Situationen können Rhoslyn überfordern; geduldige Führung und eine ruhige Umgebung helfen.']]
}, {
  appearance: 'Strahlend weißes, seidig glänzendes Fell, lange schlanke Beine und ein feiner Hals. Die außergewöhnlich lange, voluminöse weiße Mähne ist Rhoslyns individuelles Merkmal. Schlichtes braunes Lederzeug und eine helle, rot eingefasste Reitdecke mit dem Draig-Zeichen.',
  personality: 'In ruhiger Umgebung stolz und anmutig, mit beinahe königlicher Ausstrahlung. Rassetypisch sensibel, auf die vertraute Reiterin geprägt und unter starkem Lärm oder Unruhe leicht überfordert.',
  history: 'Isobel Draigs persönliches Erlenglanz-Reitpferd. Die üppige lange Mähne zeichnet Rhoslyn innerhalb der Rasse besonders aus.',
  bonds: 'Besitzerin und Reiterin: Isobel Draig. Zugehörig zu Haus Draig in Celtigerns Wacht.',
  habits: 'Benötigt sorgfältige Fell- und Mähnenpflege, geduldigen Umgang und regelmäßige Ruhe. Die filigrane Rasse eignet sich nicht für schwere Lasten oder anhaltende harte Arbeit.',
  facts: [{ label: 'Fellfarbe', value: 'Strahlend weiß' }, { label: 'Besonderheit', value: 'Außergewöhnlich voluminöse, lange Mähne' }],
  traits: [{ title: 'Königliche Erscheinung', detail: 'Elfenhafte, filigrane Gestalt und eine üppige weiße Mähne.' },
    { title: 'Feinfühlig', detail: 'Auf vertraute Führung angewiesen; wenig belastbar trotz hoher Wendigkeit.' }]
});

const cador = ridingHorse({
  slug: 'cador', name: 'Cador', ownerSlug: 'neithon', ownerName: 'Neithon Draig',
  species: 'Eidwacht', level: 3, scores: [16, 14, 14, 3, 12, 12],
  description: 'Cador ist Neithon Draigs junger, bereits erwachsener Eidwacht aus Ceffyl und Equo. Owain schenkte ihm das Pferd zu seinem Ritterschlag. Sehnig, stoisch und militärisch diszipliniert, mit beigefarbenem Fell, das nach oben dunkler wird, und kurz geschnittener, geknoteter Mähne.',
  abilities: [['Militärische Ausbildung', 'Reagiert auf klare Reiterhilfen und hält in geordneten Formationen ruhig seine Position. Ausbildung und Disziplin ersetzen keine notwendigen Proben bei außergewöhnlicher Gefahr.']]
}, {
  appearance: 'Sehniger, solider Körper mit aufrechter militärischer Haltung. Beine und Unterseite sind hellbeige; der Farbverlauf wird zum oberen Körper, Hals und Kopf hin zunehmend dunkler und warmbraun. Kurze, ordentlich geknotete Mähne. Funktionales braunes Sattelzeug und eine zurückhaltende rote Reitdecke mit Draig-Zeichen.',
  personality: 'Stoisch, diszipliniert und aufmerksam auf klare Anweisungen. Verbindet die enge Reiterbindung des Ceffyl mit der militärischen Zuverlässigkeit und Formationsruhe des Equo.',
  history: 'Owain Draig schenkte Cador Neithon anlässlich seines Ritterschlags. Cador ist jung, aber bereits erwachsen. Die benannte Zucht Eidwacht aus Ceffyl und Equo ist fest im Zuchtbuch des Bestiariums eingetragen.',
  bonds: 'Besitzer und Reiter: Neithon Draig. Geschenk von Owain Draig zu Neithons Ritterschlag; Zugehörigkeit zu Haus Draig.',
  habits: 'Gewöhnt an geordnete Abläufe und klare Reiterhilfen. Die Mähne wird kurz gehalten und ordentlich geknotet.',
  facts: [{ label: 'Abstammung', value: 'Ceffyl × Equo' }, { label: 'Alter', value: 'Jung, bereits erwachsen' },
    { label: 'Herkunft', value: 'Geschenk Owains zu Neithons Ritterschlag' }],
  traits: [{ title: 'Diszipliniert', detail: 'Stoische Haltung und verlässliche militärische Ausbildung.' },
    { title: 'Ritterliches Geschenk', detail: 'Begleitet Neithon seit seinem Ritterschlag.' }],
  connections: [{ type: 'connection', name: 'Owain Draig', detail: 'Schenkte Cador Neithon zu dessen Ritterschlag.' }]
});

const morcant = ridingHorse({
  slug: 'morcant', name: 'Morcant', ownerSlug: 'odyar', ownerName: 'Odyar Draig',
  species: 'Ceffyl', level: 1, scores: [12, 10, 10, 3, 14, 12], movement: 12,
  description: 'Morcant ist Odyar Draigs sehr alter schwarzer Ceffyl und der Bruder von Meurigs Emrys. Schwarzes Haar mit grauen Spitzen, ein vertrauter warmer Blick und seine würdevolle Erscheinung lassen die Verwandtschaft erkennen.',
  abilities: [['Erfahrener alter Begleiter', 'Bewahrt die enge Reiterbindung des Ceffyl. Sein hohes Alter begrenzt Kraft, Tempo und Belastbarkeit; längere Wege verlangen angemessene Pausen.']]
}, {
  appearance: 'Schwarzes Fell, lange schwarze Mähne und schwarzer Schweif mit grauen Haarspitzen. Graue Haare um Augen und Maul, ein langer edler Kopf und warme braune Augen. Kopf und Halslinie ähneln Emrys. Gepflegtes, sichtbar gebrauchtes braunes Lederzeug und eine verblichene rote Reitdecke mit Draig-Zeichen.',
  personality: 'Ruhig, würdevoll und dem vertrauten Reiter verbunden. Sein Alter ist deutlich sichtbar, ohne die stolze Haltung des Ceffyl ganz zu verdrängen.',
  history: 'Morcant ist das sehr alte Ceffyl-Reitpferd von Odyar Draig. Er und Emrys, das Pferd von Sir Meurig Draig, sind Brüder. Ihre Familienähnlichkeit zeigt sich besonders in Kopf, Augen und Halslinie.',
  bonds: 'Besitzer und Reiter: Odyar Draig. Bruder von Meurig Draigs Ceffyl Emrys.',
  habits: 'Benötigt altersgerechte Belastung, ruhige Pflege und häufigere Pausen als ein junges Ritterpferd.',
  facts: [{ label: 'Alter', value: 'Sehr alt; genaue Jahreszahl nicht festgelegt' }, { label: 'Fellfarbe', value: 'Schwarz, schwarze Haare mit grauen Spitzen' },
    { label: 'Verwandtschaft', value: 'Bruder von Emrys, Meurig Draigs Ceffyl' }],
  traits: [{ title: 'Alte Würde', detail: 'Deutlich gealtert, doch weiterhin von stolzer Erscheinung.' },
    { title: 'Familienähnlichkeit', detail: 'Langer Kopf, warme Augen und Halslinie erinnern an Emrys.' }],
  connections: [{ type: 'connection', name: 'Emrys', image: '/AleriaAlmanach/assets/companions/haus-draig/concepts/2026-10-13/references/emrys-meurig.jpeg', detail: 'Bruder; das Ceffyl-Reitpferd von Sir Meurig Draig.' }]
});

const lot = ridingHorse({
  slug: 'lot', name: 'Lot', ownerSlug: 'rhys', ownerName: 'Rhys Draig',
  species: 'Edel Rhyfel', level: 3, scores: [16, 14, 14, 2, 12, 12],
  description: 'Lot ist Rhys Draigs mahagonibrauner Edel Rhyfel. Die fest benannte Zucht aus Rhyfel und Ceffyl verbindet einen kräftigen, tragfähigen Körper mit einer edlen Halslinie und einem feineren Haupt. Lot wirkt aufmerksam, selbstbewusst und seinem Reiter verbunden.',
  abilities: [['Ritterpferd', 'Verbindet die Tragfähigkeit des Rhyfel mit der engen Reiterbindung des Ceffyl. Vertraute Reiterhilfen geben Orientierung; außergewöhnliche Gefahr verlangt weiterhin passende Proben.']]
}, {
  appearance: 'Mahagonibraunes Fell, schwarze Mähne und schwarzer Schweif, dunkle Beine und ein kleiner heller Stirnstern. Kräftige Brust, edler Hals und aufrechte Haltung. Schlichtes braunes Lederzeug und eine dunkelrote Reitdecke mit kleinem Draig-Zeichen.',
  personality: 'Aufmerksam, kraftvoll und selbstbewusst, mit einer stolzen, ritterlichen Erscheinung.',
  history: 'Rhys Draigs persönliches Reitpferd. Lot gehört zur fest im Zuchtbuch des Bestiariums eingetragenen Zucht Edel Rhyfel aus Rhyfel und Ceffyl.',
  bonds: 'Besitzer und Reiter: Rhys Draig. Zugehörig zu Haus Draig in Celtigerns Wacht.',
  habits: 'Reagiert auf vertraute Reiterhilfen und bleibt im ruhigen Stand aufmerksam.',
  facts: [{ label: 'Abstammung', value: 'Rhyfel × Ceffyl' }, { label: 'Fellfarbe', value: 'Mahagonibraun mit schwarzem Langhaar' }],
  traits: [{ title: 'Kraft und Adel', detail: 'Kräftiger Rhyfel-Körper mit eleganterer Ceffyl-Halslinie.' }]
});

const aelwyn = ridingHorse({
  slug: 'aelwyn', name: 'Aelwyn', ownerSlug: 'kane', ownerName: 'Kane Draig',
  species: 'Rhyfel', level: 3, scores: [16, 12, 14, 2, 12, 12],
  description: 'Aelwyn ist Kane Draigs weißer Rhyfel: kräftig, schick und sorgfältig gepflegt. Die ordentlich geflochtene silberweiße Mähne und die stolze Haltung geben dem robusten Reitpferd eine vornehme Erscheinung.',
  abilities: [['Robustes Reitpferd', 'Der kräftige Rhyfel-Körper eignet sich für regelmäßige Reitwege und angemessene Lasten. Auch ein gut gepflegtes Pferd benötigt Pausen und sichere Führung.']]
}, {
  appearance: 'Sauberes weißes Fell, silberweiße ordentlich geflochtene Mähne, heller Schweif, dunkle Augen und graues Maul. Breite Brust und kräftige Gliedmaßen. Braunes Sattelzeug und eine zurückhaltende rote Reitdecke mit Draig-Zeichen.',
  personality: 'Wach und selbstbewusst; Aelwyns gepflegte, stolze Erscheinung fällt sofort auf.',
  history: 'Kane Draigs persönlicher Rhyfel. Aelwyn wird sorgfältig gepflegt und trägt das Zeichen des Hauses Draig.',
  bonds: 'Besitzer und Reiter: Kane Draig. Zugehörig zu Haus Draig in Celtigerns Wacht.',
  habits: 'Fell und Langhaar werden sauber gehalten; die Mähne wird ordentlich geflochten.',
  facts: [{ label: 'Fellfarbe', value: 'Weiß' }, { label: 'Pflege', value: 'Sehr gepflegt, geflochtene Mähne' }],
  traits: [{ title: 'Gepflegter Rhyfel', detail: 'Vornehme Erscheinung bei unverändert kräftigem, robustem Rassebau.' }]
});

const alaw = ridingHorse({
  slug: 'alaw', name: 'Alaw', ownerSlug: 'carys', ownerName: 'Carys Draig',
  species: 'Tirashan', level: 2, scores: [14, 16, 12, 2, 14, 10],
  description: 'Alaw ist Carys Draigs mausbraunes Tirashan-Reitpferd. Kompakt, aufmerksam und wendig, mit dunklem Langhaar und dunklen Beinen. Carys benannte Alaw nach ihrer Großmutter väterlicherseits, Alaw Grawn, der Mutter von Cadfan Draig.',
  abilities: [['Waldreitpferd', 'Verbindet die Waldgängigkeit der Curragh-Linie mit der Robustheit des Hest. Auf unebenen oder schwierigen Wegen bleiben situationsabhängige Reitproben erforderlich.']]
}, {
  appearance: 'Mausbraunes, leicht graubraun schimmerndes Fell, dunkle Beine und Hufe sowie eine dunkle Mähne mit einem schlichten Zopf. Kompakter, muskulöser Körper, kurzer kräftiger Rücken und wacher Blick. Praktisches braunes Sattelzeug, rote Reitdecke mit kleinem Draig-Zeichen.',
  personality: 'Ruhig und aufmerksam, mit wachen Ohren und neugierigem Blick. Ein verlässlicher Begleiter für Wege am Waldrand.',
  history: 'Carys Draigs persönliches Tirashan-Reitpferd. Der Name Alaw erinnert an ihre Großmutter Alaw Grawn (1676–1720), die Mutter von Carys’ Vater Cadfan Draig. Die Rasse Tirashan ist eine gefestigte Linie aus Curragh und Hest.',
  bonds: 'Besitzerin und Reiterin: Carys Draig. Namenspatin ist ihre Großmutter väterlicherseits, Alaw Grawn.',
  habits: 'Beobachtet die Umgebung aufmerksam; die Ohren verfolgen Geräusche aus dem Wald.',
  facts: [{ label: 'Fellfarbe', value: 'Mausbraun mit dunklem Langhaar' },
    { label: 'Namenspatin', value: 'Alaw Grawn (1676–1720), Carys’ Großmutter väterlicherseits' }],
  traits: [{ title: 'Wachsamer Waldbegleiter', detail: 'Kompakter, kräftiger und zugleich wendiger Tirashan.' },
    { title: 'Familienname', detail: 'Nach der Mutter von Carys’ Vater Cadfan benannt.' }],
  connections: [{ type: 'connection', name: 'Alaw Grawn', detail: 'Namenspatin; Carys’ Großmutter väterlicherseits und Mutter von Cadfan Draig.' }]
});

const vivian = ridingHorse({
  slug: 'vivian', name: 'Vivian', ownerSlug: 'gethin', ownerName: 'Gethin Draig',
  species: 'Sonnenläufer-Stute', level: 3, scores: [14, 16, 12, 2, 12, 16],
  description: 'Vivian, von Gethin meist Vivi genannt, ist seine Sonnenläufer-Stute aus Ceffyl und Aurelianer. Ihr beiges Fell wird nach unten zunehmend golden, bis zu den goldenen Hufen. Die üppige weiße Mähne trägt hellgoldene Spitzen. Eine außergewöhnlich gute Stute mit ausgeprägten Diva-Allüren.',
  abilities: [['Stolze Reiterbindung', 'Die sensible, eigenwillige Stute reagiert auf vertraute und fein abgestimmte Führung. Ihre enge Bindung zu Gethin macht sie nicht automatisch gehorsam oder furchtlos.']]
}, {
  appearance: 'Beiger Kopf, Hals und Rücken; Brust, Bauch und Beine werden nach unten zunehmend golden. Goldene Hufe. Sehr dichte, voluminöse weiße Mähne mit hellgoldenen Spitzen und passender heller Schweif. Stolz aufgerichteter Hals, erhobenes Kinn und hochmütiger Seitenblick. Schlichtes braunes Sattelzeug und rote Reitdecke mit Draig-Zeichen.',
  personality: 'Eigenwillig, stolz und sensibel, mit deutlichen Diva-Allüren. Gethin beschreibt Vivi zugleich als außergewöhnlich gute Stute.',
  history: 'Gethin stellte Vivian in der Anhörung als seine Sonnenläufer-Stute aus Ceffyl und Aurelianer vor. Meist nennt er sie Vivi. Ihr Name erinnert an eine heilige Meerjungfer der Dame des Sees. Die Zucht Sonnenläufer ist im Bestiarium fest verzeichnet.',
  bonds: 'Besitzer und Reiter: Gethin Draig. Er liebt Vivi wie ein Familienmitglied.',
  habits: 'Verlangt einen geduldigen, feinfühligen Umgang. Ihre lange, dichte Mähne braucht sorgfältige Pflege.',
  facts: [{ label: 'Rufname', value: 'Vivi' }, { label: 'Geschlecht', value: 'Stute' }, { label: 'Abstammung', value: 'Ceffyl × Aurelianer' },
    { label: 'Namensursprung', value: 'Heilige Meerjungfer der Dame des Sees' }],
  traits: [{ title: 'Goldener Verlauf', detail: 'Beiges Grundfell, nach unten goldener; goldene Hufe und weiße Mähne mit hellgoldenen Spitzen.' },
    { title: 'Diva', detail: 'Eigenwillige und hochmütige, zugleich sehr geschätzte Stute.' }]
});

export const DRAIG_RIDING_HORSES = Object.freeze([rhoslyn, cador, morcant, lot, aelwyn, alaw, vivian]);
