// Editorial catalog only. Creature mechanics and Firebase records belong to the Almanach.
// Set an entry's href once its local detail page exists; null opens an archive preview.
const icon = id => new URL(`../../assets/icons/${id}.webp`, import.meta.url).href;

function entry(id, title, description, note = '', href = null) {
  return { id, title, description, note, image: icon(id), href };
}

export const BESTIARY_FILTERS = [
  { id: 'all', label: 'Alle Ordnungen' },
  { id: 'tiere', label: 'Tiere' },
  { id: 'kreaturen', label: 'Kreaturen' },
  { id: 'infernale', label: 'Infernale' },
  { id: 'celestiale', label: 'Celestiale' }
];

export const BESTIARY_CHAPTERS = [
  {
    id: 'tiere', kind: 'tiere', number: 'I', title: 'Tiere', subtitle: 'Von Huf, Schwinge & Schuppe',
    description: 'Die Tiere Alerias stammen aus natürlichen Ursprüngen – teils gezähmt, teils wild. Ein Verzeichnis der Geschöpfe, die Wälder, Weiden, Himmel und Gewässer mit uns teilen.',
    groups: [{ id: 'tiergruppen', title: 'Die natürlichen Arten', entries: [
      entry('pferde', 'Pferde', 'Reitkunst und 32 Rassenlinien, geordnet nach Kontinent, Land und jeweiligem Urpferd.', '', './tiere/pferde/index.html'),
      entry('raubtiere', 'Raubtiere', 'Raubkatzen, Wölfe und Bären: Jagdweisen, Lebensräume und Spuren der großen Landjäger.', '', './tiere/raubtiere/index.html'),
      entry('flugwesen', 'Flugwesen', 'Gefiederte Bewohner der Lüfte, hohen Wälder und Klippen samt ihren Wanderwegen.', '', './tiere/flugwesen/index.html'),
      entry('wild', 'Wild', 'Scheue und wehrhafte Bewohner von Wald, Steppe und Gebirge, gegliedert nach Größe und Lebensweise.', '', './tiere/wild/index.html'),
      entry('meerestiere', 'Meerestiere', 'Lebensgemeinschaften der Küsten, Riffe, offenen See und verborgenen Tiefen.', '', './tiere/meerestiere/index.html'),
      entry('vieh', 'Vieh', 'Rinder, Herdentiere, Geflügel, Haustiere und Lastenträger des alerischen Alltags.', '', './tiere/vieh/index.html'),
      entry('reptilien', 'Reptilien', 'Schuppenträger aus warmen Felsen, Sümpfen und alten Ruinen, darunter Druchtan und Corrchuban.', '', './tiere/reptilien/index.html'),
      entry('amphibien', 'Amphibien', 'Frösche, Kröten und andere empfindsame Bewohner der Ufer, Moore und Quellwälder.', '', './tiere/amphibien/index.html'),
      entry('ornithosaurier', 'Ornithosaurier', 'Uralte gefiederte Fluglinien saurischer Herkunft: Klippenschnapper und Aerdrith.', '', './tiere/ornithosaurier/index.html'),
      entry('insekten', 'Insekten', 'Rieseninsekten, Spinnen und Skorpione – eine gepanzerte Welt zwischen Höhle, Sumpf und Wüste.', '', './tiere/insekten/index.html')
    ] }],
    specimenNote: 'Individuelle Tiere und seltene Zuchtlinien werden im folgenden Kapitel „Besondere Exemplare“ gesammelt.'
  },
  {
    id: 'besondere', kind: 'tiere', number: 'II', title: 'Besondere Exemplare', subtitle: 'Nicht jedes Wesen ist wie seinesgleichen',
    description: 'Ein eigener Platz für besondere Tiere, regionale Linien und individuelle Begegnungen. Den Anfang machen drei überlieferte Namen.',
    groups: [{ id: 'besondere-tiere', title: 'Individuelle Exemplare · Tiere', featured: true, entries: [
      entry('sturmbock', 'Sturmbock', 'Massives morgornisches Gebirgsreittier mit sicherem Felstritt und großer Angriffswucht.', 'Morgorn', './tiere/besondere/sturmbock/index.html'),
      entry('mondlaeufer', 'Mondläufer', 'Lautloses Waldreittier Lichthains, das vertraute Pfade selbst bei Nacht sicher findet.', 'Lichthain', './tiere/besondere/mondlaeufer/index.html'),
      entry('cuimhorn', 'Cuimhorn', 'Morgornisches Botentier mit außergewöhnlichem Personengedächtnis, Orientierungssinn und sicherem Felstritt.', 'Morgorn', './tiere/besondere/cuimhorn/index.html')
    ] }],
    specimenNote: 'Die Sammlung bleibt offen für weitere benannte Tiere, außergewöhnliche Funde und ihre Geschichten.'
  },
  {
    id: 'kreaturen', kind: 'kreaturen', number: 'III', title: 'Kreaturen', subtitle: 'Was zwischen den Geschichten lebt',
    description: 'Von ruhelosen Erscheinungen bis zu steinernen Kolossen: Geschöpfe, die sich nicht ohne Weiteres in die natürliche Ordnung einfügen.',
    groups: [
      { id: 'kreaturengruppen', title: 'Die Kreaturengruppen', entries: [
        entry('geister', 'Geister', 'Ruhelose Seelen, Erscheinungen und gebundene Nachhalle der Verstorbenen.', '', './wesen/gruppen/geister/index.html'),
        entry('nekrophagen', 'Nekrophagen', 'Untote Körper und verdorbene Wesen zwischen Nekromantie, Grabwacht und Hunger.', '', './wesen/gruppen/nekrophagen/index.html'),
        entry('trolle', 'Trolle', 'Regenerierende Kolosse der Wildnis und ihre fünfzehn bekannten Erscheinungsformen.', '', './wesen/gruppen/trolle/index.html'),
        entry('riesen', 'Riesen', 'Uralte humanoide Giganten, ihre Mythen und bislang verzeichneten Unterarten.', '', './wesen/gruppen/riesen/index.html')
      ] },
      { id: 'einzelne-kreaturen', title: 'Einzelne Kreaturen', description: 'Individuelle Exemplare und besondere Wesen dieses Kapitels.', entries: [
        entry('fairean', 'Fairean', 'Uralte druidische Wächtergeister in hölzerner Gestalt: Ursprung, Gattungen, Fähigkeiten und Bildatlas.', '', './wesen/fairean/index.html'),
        entry('luetten', 'Lütten', 'Kleinwüchsige Menschen mit angeborener Naturbindung: Herkunft, Lebensweise, Arten und Bildatlas.', '', './wesen/luetten/index.html'),
        entry('unbekanntes-waldwesen', 'Noch ohne Namen', 'Das pferdeartige Holzwesen aus der alten Bildtafel bleibt als unbestimmter Fund erhalten.', 'Unbestimmter Fund')
      ] }
    ],
    specimenNote: 'Weitere individuelle Kreaturen können hier mit ihrer jeweiligen Gruppe verzeichnet werden.'
  },
  {
    id: 'infernale', kind: 'infernale', number: 'IV', title: 'Infernale Wesen', subtitle: 'Jenseits von Riss & Schwelle',
    description: 'Linien und Einzelwesen, deren Überlieferungen von Morgath, Rissen, Pakten und infernaler Essenz erzählen.',
    groups: [
      { id: 'infernale-linien', title: 'Die infernalen Linien', entries: [
        entry('kobolde', 'Kobolde', 'Kobolde, Wichtel und Goblins sowie ihre Bindung an die infernalen Götter.', '', './wesen/gruppen/kobolde/index.html'),
        entry('ogroiden', 'Ogroiden', 'Die infernalen Kriegslinien der Goraks, Ognir, Grimnaks, Bhalgar und Zaroks.', '', './wesen/gruppen/ogroiden/index.html'),
        entry('vampire', 'Vampire', 'Bhaals blutgebundene Ordnung von den Vampirfürsten bis zu ihren niederen Sprossen.', '', './wesen/gruppen/vampire/index.html'),
        entry('inferniiden', 'Inferniiden', 'Dagons Teufelshierarchie und Sanguines Dämonenlinie mit Fürsten, hohen Dienern und niederen Gefolgschaften.', '', './wesen/gruppen/inferniiden/index.html'),
        entry('aelvar', 'Aelvar', 'Matriarchale Finsteralben und ihre fünf überlieferten Linien im Dienst infernaler Göttinnen.', '', './wesen/gruppen/aelvar/index.html'),
        entry('unhold', 'Unholde', 'Zatrachs überformte Jagdgestalten, seltene Relikte und offene Stellen für einzigartige Unholde.', '', './wesen/gruppen/unhold/index.html'),
        entry('nautiloiden', 'Nautiloiden', 'Thraalkin, Sirenen und Leviathane innerhalb Thraals wassergebundener Ordnung.', '', './wesen/gruppen/nautiloiden/index.html'),
        entry('sylvaniiden', 'Sylvaniiden', 'Korrumpierte Naturwächter, Jagddiener und Kreaturen unter Zatrachs Einfluss.', '', './wesen/gruppen/sylvaniiden/index.html'),
        entry('infestiden', 'Infestiiden', 'Nergaloths infernale Ausbreitungswesen mit der Naga als bislang benannter Gattung.', '', './wesen/gruppen/infestiden/index.html'),
        entry('psioniden', 'Psioniden', 'Amons Schwarmimperium aus Lenkern, Suchern, Lauerern und wandelbaren Dienerformen.', '', './wesen/gruppen/psioniden/index.html')
      ] },
      { id: 'einzelne-infernale', title: 'Einzelne infernale Wesen', description: 'Besondere Wesen und individuelle Exemplare abseits der großen Linien.', entries: [
        entry('djinn', 'Djinn', 'Naraths gefallene Diener: gebundene Willenswesen zwischen astraler Gestalt, Magie und gefährlich genauem Gehorsam.', '', './wesen/infernale/djinn/index.html'),
        entry('muhmen', 'Muhmen', 'Helas uralte Druidenhexen: Paktmagie, Fluchweberei und geduldig eingeforderte Preise.', '', './wesen/infernale/muhmen/index.html'),
        entry('gorgonnen', 'Gorgonnen', 'Eine eigene Tafel für die Gorgonnen Alerias.')
      ] }
    ],
    specimenNote: 'Benannte infernale Exemplare und ihre Zugehörigkeit werden hier nach und nach ergänzt.'
  },
  {
    id: 'celestiale', kind: 'celestiale', number: 'V', title: 'Celestiale Wesen', subtitle: 'Von alten Mächten & fernen Sphären',
    description: 'Mythische Ordnungen, Wesen der Sphären und die Diener der Souveränen – gesammelt unter einem gemeinsamen Himmelsgewölbe.',
    groups: [
      { id: 'celestiale-ordnungen', title: 'Die celestialen Ordnungen', entries: [
        entry('drachen', 'Drachen', 'Die Drachen Alerias, ihre Linien und Überlieferungen.'),
        entry('nymphen', 'Nymphen', 'Die Nymphen innerhalb der celestialen Sammlung.'),
        entry('nornen', 'Nornen', 'Ein eigener Platz für die Nornen und ihre Geschichten.'),
        entry('feen', 'Feen', 'Die Feen Alerias und ihre vielfältigen Erscheinungen.'),
        entry('schnitter', 'Schnitter', 'Eine eigene Tafel für die Schnitter der celestialen Ordnung.')
      ] },
      { id: 'diener', title: 'Diener der Souveränen', description: 'Fünf eigene Register für die Wesen im Gefolge der Souveränen.', entries: [
        entry('aelthars-diener', 'Aelthars Diener', 'Das Gefolge Aelthars, des Herrn des Donners.', 'Aelthar'),
        entry('nimues-diener', 'Nimues Diener', 'Das Gefolge Nimues, der Dame der See.', 'Nimue'),
        entry('thyraels-diener', 'Thyraels Diener', 'Das Gefolge Thyraels, des Herrn des Feuers.', 'Thyrael'),
        entry('zephyrs-diener', 'Zephyrs Diener', 'Das Gefolge Zephyrs, des Herrn der Winde.', 'Zephyr'),
        entry('rheas-diener', 'Rheas Diener', 'Das Gefolge Rheas, der Dame der Berge.', 'Rhea')
      ] }
    ],
    specimenTitle: 'Individuelle celestiale Exemplare',
    specimenNote: 'Noch keine benannten Exemplare verzeichnet. Hier werden besondere Drachen, Feen und einzelne Diener der Souveränen mit ihren eigenen Geschichten gesammelt.'
  }
];

export const BESTIARY_ENTRIES = BESTIARY_CHAPTERS.flatMap(chapter => chapter.groups.flatMap(group =>
  group.entries.map(item => ({ ...item, kind: chapter.kind, chapter: chapter.title, group: group.title }))
));
