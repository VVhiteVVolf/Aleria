import { SIRENENTANZ_FORM_IDS as F, SIRENENTANZ_EXPERT_PATH_IDS } from '../../combat-styles/sirenentanz/sirenentanz-forms.js';
import { ARMOR_ROUTINE } from '../armor-routine.js';

export const VENNYR_CLASS_IDS = Object.freeze(['milwr', 'morwyr', 'rhyfelwyr', 'ceidwyn', 'rhiddwyr', 'derwyn']);
const feature = (id, name, minimumLevel, description) => ({ id, name, minimumLevel, description, status: 'draft', mechanics: null });
const weapon = (id, name, rule) => ({ id, name, rule });
const phases = [
  { id: 'foundation', name: 'Tanz der jungen Welle', minimumLevel: 1, maximumLevel: 6, kind: 'foundation' },
  { id: 'advanced', name: 'Tanz der kehrenden Flut', minimumLevel: 7, maximumLevel: 8, kind: 'advanced' },
  { id: 'expert', name: 'Drei Expertenpfade', minimumLevel: 9, maximumLevel: 20, kind: 'path-selection' }
];
const configs = [
  { classId: 'milwr', name: 'Milwr', templateId: 'milwr', cultures: ['Cenyr', 'Vennyr'],
    focus: 'Küstenwache, Schildwall und Waffendienst', trainingFocus: 'Gemeinsame Klasse · vennyriische Ausbildung',
    affiliation: 'Milizen, Mannschaften und Wachen Cenyrs und Vennyrs',
    primary: ['Speer', 'Streitkolben', 'Axt'], secondary: ['Schwert'],
    note: 'Waffenflexible Milizausbildung. Die cenyrische Drachling-Ausbildung und die vennyriische Küstenwache sind Alternativen; keine doppelten Slots.',
    bands: { foundation: [1, 2, 4, 6], militia: [6, 8, 10, 12, 15] },
    features: [feature('milwr-kuestenstand', 'Stand der Küstenwache', 1, '+1 auf manuell ausgewertete Balanceproben auf nassem oder schwankendem Untergrund.'),
      feature('milwr-schulter', 'Schulter an Schulter', 6, 'Schadenslose Deckungstechniken dürfen einen benachbarten Verbündeten schützen; Reichweite 2 m, unveränderte Kosten.'),
      feature('milwr-erfahren', 'Erfahrene Wache', 15, 'Der Balancebonus steigt auf +2. Die Waffenausbildung endet auf Stufe 15; Stufen 16–20 bringen weiterhin die allgemeinen Klassenressourcen.')],
    pending: ['Eigenständige Klassenmerkmale für Stufen 16–20'] },
  { classId: 'morwyr', name: 'Morwyr', focus: 'Partisane, Enteraxt und Harpune', trainingFocus: 'Ritter des Decks und der Brandung',
    primary: ['Partisane'], secondary: ['Enteraxt', 'Harpunenspeer'],
    note: 'Stangenwaffe für Distanz, Axt für Gedränge, Harpune für den Auftakt. Ziehen benötigt eine befestigte Leine und einen misslungenen Rettungswurf.',
    bands: { foundation: [1, 2, 3, 4, 5, 6], advanced: [7, 8], expert: [9, 11, 13, 15, 17, 18, 19, 20] },
    variants: [weapon('partisan', 'Partisane', 'Die geführte Partisane bestimmt Waffenwürfel und Reichweite. Ein bereits vorhandener Waffenbonus wird einmal gezählt.'),
      weapon('boarding-axe', 'Enteraxt', 'Kurze Hiebe und Haken. Ein gelungenes Manöver durchtrennt keine beliebig starken Taue oder Gegenstände automatisch.'),
      weapon('harpoon', 'Harpunenspeer', 'Wurf mit Waffenreichweite. Heranziehen bis 2 m nur mit intakter, befestigter Leine und KRF-Rettungswurf; niemals automatisches Überbordwerfen.')],
    features: [feature('morwyr-seebeine', 'Seebeine', 1, '+2 auf Balanceproben an Deck; der Situationsbonus wird manuell berücksichtigt und ist kein allgemeiner RK-Bonus.'),
      feature('morwyr-entergriff', 'Sicherer Entergriff', 6, '+1 auf den Angriffswurf mit Sirenentanz-Harpunentechniken; keine zusätzliche Attacke.'),
      feature('morwyr-leinenmeister', 'Leinenmeister', 15, 'Ein im Manöver ausdrücklich erlaubtes Heranziehen darf bis 3 m statt 2 m reichen. Rettungswurf und Leinenbedingung bleiben bestehen.'),
      feature('morwyr-deckmeister', 'Meister des Decks', 20, 'Einmal pro Beitrag +1 Schaden auf einen Partisanen- oder Enteraxttreffer nach einem eigenen gelungenen Sirenentanz-Verschiebemanöver.')],
    pending: ['Schiffsbewegung, Überbordlage und Leinenführung bleiben situative Auswertung'] },
  { classId: 'rhyfelwyr', name: 'Rhyfelwyr', focus: 'Schwere Hiebwaffen und Linienbruch', trainingFocus: 'Wucht und Standfestigkeit',
    primary: ['Großaxt', 'Kriegshammer', 'Morgenstern', 'Streitkolben'], secondary: ['Ritterschwert', 'Flegel'],
    note: 'Dieselben schweren Folgen passen zu Axt, Hammer, Morgenstern und Kolben. Schwertführung bleibt möglich; Waffentyp und Würfel werden nicht vereinheitlicht.',
    bands: { foundation: [1, 2, 3, 4, 5, 6], advanced: [7, 8], expert: [9, 10, 11, 12, 13, 15, 17, 20] },
    variants: [weapon('heavy-impact', 'Axt, Hammer und Kolben', 'Die Schadensart folgt der Waffe. Zusätzliche Technik-Würfel kopieren niemals den vollständigen Mehrwürfel-Schaden einer Großwaffe.'),
      weapon('flail', 'Morgenstern und Flegel', 'Umgreifende Techniken senken nur die in der Attacke genannte Zielverteidigung; kein pauschales Ignorieren von Rüstung.')],
    features: [feature('rhyfelwyr-stand', 'Stand gegen den Sturm', 1, '+1 auf Rettungswürfe gegen Furcht und Umwerfen; nur bei einem tatsächlich geforderten passenden Wurf.'),
      feature('rhyfelwyr-wucht', 'Kontrollierte Wucht', 6, 'Bei Sirenentanz-Angriffen mit schwerer Axt, Hammer, Flegel oder Kolben: −1 Angriff und +1 Schaden. Kein Bonus auf Schwertangriffe.'),
      feature('rhyfelwyr-fassung', 'Fassung unter Druck', 15, 'Stand gegen den Sturm steigt auf +2 und ersetzt den bisherigen Bonus; keine Immunität gegen Zustände.'),
      feature('rhyfelwyr-front', 'Unerschütterliche Front', 20, 'Nach einer schadenslosen Tiefwasser-Schutztechnik erhält der Anwender einmal pro Beitrag 3 temporäre LP bis zum Ende seines nächsten Beitrags. Temporäre LP werden nicht addiert.')],
    pending: [] },
  { classId: 'ceidwyn', name: 'Ceidwyn', templateId: 'ceidwynr', focus: 'Kurzbogen, Armbrust, Säbel und Dreizack', trainingFocus: 'Schütze und Nahkämpfer der Flotte',
    primary: ['Kurzbogen', 'Armbrust'], secondary: ['Säbel', 'Dreizack'],
    note: 'Fern- und Nahkampf teilen sich die Slots. Bereits die Grundform enthält zwei echte Nahkampftechniken; jedes Expertenprofil führt mindestens eine fort.',
    bands: { foundation: [1, 2, 4, 6], advanced: [7, 8], expert: [9, 11, 13, 15, 17, 20] },
    variants: [weapon('shortbow', 'Kurzbogen', 'Bewegliche Schüsse mit der tatsächlichen Waffenreichweite; kein Langbogen-Ersatz.'),
      weapon('crossbow', 'Armbrust', 'Bolzentechniken verwenden Armbrustwürfel. Nachladen und Munition bleiben Voraussetzungen; keine kostenlosen Zusatzschüsse.'),
      weapon('sabre', 'Säbel', 'Schnelle Nahkampftechniken für enge Deckpassagen.'),
      weapon('trident', 'Dreizack', 'Bindung und Abstand. Entwaffnen ist ein ausgewiesener Versuch; der Treffer allein entfernt keine fremde Waffe.')],
    features: [feature('ceidwyn-seeblick', 'Seeblick', 1, '+1 Angriff mit Kurzbogen oder Armbrust. Der Bonus gilt einmal und nicht für Säbel oder Dreizack.'),
      feature('ceidwyn-reling', 'Verteidiger der Reling', 6, 'Die vier Grundslots sollen mindestens eine Fernkampf- und eine Nahkampftechnik enthalten. Die Empfehlung vergibt Säbel und Dreizack, bevor weitere Schüsse gewählt werden.'),
      feature('ceidwyn-spaeher', 'Wachsamer Ausguck', 15, '+2 auf manuell ausgewertete Wahrnehmungsproben über freier See; Vögel handeln nicht automatisch mit.'),
      feature('ceidwyn-wechsel', 'Meister beider Distanzen', 20, 'Nach einem bezahlten Wechsel zwischen Fern- und Nahwaffe erhält der erste passende Sirenentanz-Angriff im selben Beitrag +1 Angriff. Waffenwechsel bleibt kostenpflichtig.')],
    pending: ['Ballisten und andere Belagerungsgeräte', 'Signal- und Brandmunition', 'Kundschaftervogel und klerikale Segnungen'] },
  { classId: 'rhiddwyr', name: 'Rhiddwyr', templateId: 'rhiddwyrr', focus: 'Reiterwaffen, Armbrust und beweglicher Nahkampf', trainingFocus: 'Fahrender Ritter der Höhen und Küsten',
    primary: ['Flegel', 'Rabenschnabel', 'Reiteraxt', 'Streitkolben'], secondary: ['Glefe', 'Reiterspieß', 'Armbrust'],
    note: 'Sattelangriffe erfordern ein tatsächlich geführtes Reittier und den Status beritten. Unberitten bleiben eigene Nahkampf- und Armbrustoptionen verfügbar.',
    bands: { foundation: [1, 2, 3, 4, 5, 6], advanced: [7, 8], expert: [9, 11, 13, 15, 17, 20] },
    variants: [weapon('rider-impact', 'Flegel, Rabenschnabel, Reiteraxt, Kolben', 'Ein Waffenweg mit verschiedenen Würfeln und Schadensarten; auch zu Fuß nutzbar.'),
      weapon('rider-polearm', 'Glefe und Reiterspieß', 'Anrittsattacken benötigen berittenen Status und ausdrücklich angegebenen Anlauf. Kein Anritt auf engem Deck.'),
      weapon('crossbow', 'Armbrust', 'Eigenständige Fernkampfoptionen, auch abgesessen. Kein automatischer Fernschuss nach einem Sattelhieb.')],
    features: [feature('rhiddwyr-trittsicher', 'Trittsicherer Reisender', 1, '+2 auf manuell ausgewertete Reitproben in Hügeln und Küstenpfaden; keine zusätzlichen Aktionen des Rosses.'),
      feature('rhiddwyr-sattel', 'Sicher im Sattel', 6, '+1 Angriff bei ausdrücklich berittenen Sirenentanz-Techniken. Zu Fuß entfällt dieser Bonus.'),
      feature('rhiddwyr-hut', 'Hut des Reisenden', 15, 'Eine schadenslose Schutztechnik darf auch das eigene Ross in 2 m Reichweite wählen. Kosten und Dauer bleiben gleich.'),
      feature('rhiddwyr-wende', 'Meister der Wende', 20, 'Eine Eigenbewegung einer berittenen Strömungstechnik darf einmal pro Beitrag 2 m weiter reichen. Sie addiert sich nicht zu Weiter Bogen.')],
    pending: ['Gemeinsame Positionsführung von Ross und Reiter'] },
  { classId: 'derwyn', name: 'Derwyn', cultures: ['Cenyr', 'Vennyr'], focus: 'Stab, Dreizack und Streitkolben im Dienst Nimues', trainingFocus: 'Gemeinsame Klasse · zunächst reine Waffenausbildung',
    affiliation: 'Geistliche Nimues in Cenyr und Vennyr; nicht jeder Derwyn ist Ritter',
    primary: ['Stab / Saphirstab', 'Dreizack', 'Streitkolben'], secondary: [],
    note: 'Drei gleichberechtigte Waffenwege aus einem Budget. Ein Stab ist hier eine physische Waffe; seine künftige Funktion als Zauberfokus bleibt unberührt.',
    bands: { foundation: [1, 3, 5], advanced: [7, 8], expert: [9, 12, 15, 17, 20] },
    variants: [weapon('staff', 'Stab / Saphirstab', 'Zweihändige Führung, Umlenkung und Deckung. Reiner physischer Schaden, keine stillschweigend hinzugefügte Magie.'),
      weapon('trident', 'Dreizack', 'Stich und Bindung auf Waffenreichweite; kontrollierende Manöver benötigen den ausgewiesenen Rettungswurf.'),
      weapon('mace', 'Streitkolben', 'Kurze, feste Schläge und Schutz eines benachbarten Verbündeten. Kein automatischer Wasserschaden.')],
    features: [feature('derwyn-dreifach', 'Drei Werkzeuge der Flut', 1, 'Stab, Dreizack und Streitkolben sind gleichwertige Ausbildungszweige. Kein zusätzlicher Angriff und kein zusätzlicher Slot durch Waffenvielfalt.'),
      feature('derwyn-ruhe', 'Ruhe des Hüters', 6, '+1 auf manuell ausgewertete Rettungswürfe gegen Furcht und Bezauberung; die Waffenausbildung gewährt noch keine Zauber.'),
      feature('derwyn-wacht', 'Wacht des Heiligtums', 15, 'Schadenslose Waffenschutztechniken dürfen einen Verbündeten in 2 m Reichweite wählen; Dauer und Kosten bleiben unverändert.'),
      feature('derwyn-bewahren', 'Meister des Bewahrens', 20, 'Einmal pro Beitrag gewährt eine solche Schutztechnik zusätzlich 3 temporäre LP für ihre Dauer. Kein Heilen verlorener LP, kein Stapeln temporärer LP.')],
    pending: ['Wassermagie: Strömung, Nebel und Flut', 'Wiederherstellungsmagie: Heilen, Reinigen, Stärken und Widerstände nach dem gewünschten Vorbild', 'Eigene Zauberressourcen und Verbindung von Waffe und Zauber', 'Zusätzliche Ritter- oder Eidgeschworenen-Ausbildung separat bestimmen'] }
];

function definition(config) {
  const militia = config.classId === 'milwr';
  const slots = Object.entries(config.bands).flatMap(([band, levels]) => levels.map((level, index) => ({ id: `${band}-${String(index + 1).padStart(2, '0')}`, level, band })));
  const formIds = militia ? [F.foundation, F.militia] : [F.foundation, F.advanced, ...SIRENENTANZ_EXPERT_PATH_IDS];
  return {
    schemaVersion: 2, id: `vennyr-${config.classId}`, classId: config.classId, name: config.name,
    templateId: config.templateId || config.classId, cultureId: 'vennyr', culture: 'Vennyr', cultures: config.cultures || ['Vennyr'],
    pagePath: `Klassenordner/Vennyr/${config.classId}/index.html`, status: 'draft', minimumLevel: 1, maximumLevel: 20,
    focus: config.focus, trainingFocus: config.trainingFocus, affiliation: config.affiliation || 'Rittertradition des historischen Königreichs Vennyr',
    trainingPhases: militia ? [phases[0], { id: 'militia', name: 'Tanz der Küstenwache', minimumLevel: 6, maximumLevel: 15, kind: 'path' },
      { id: 'open', name: 'Weitere Klassenentwicklung', minimumLevel: 16, maximumLevel: 20, kind: 'pending' }] : phases,
    formIds, pathSelection: { minimumLevel: militia ? 6 : 9, maximumLevel: militia ? 15 : 20,
      multiplePathsAllowed: !militia, sharedTechniqueBudget: true, firstSelectionRequired: !militia,
      firstSelectionCost: 0, additionalSelectionCost: militia ? 0 : 1, costUnit: 'technique-slot',
      allowedFormIds: militia ? [F.militia] : SIRENENTANZ_EXPERT_PATH_IDS,
      rule: militia ? 'Nach der Grundform folgt ausschließlich die Küstenwache, Stufe 6–15.' : 'Ab Stufe 9 erster Expertenpfad ohne Slotkosten; jeder weitere Pfad kostet einen Experten-Attackenslot. Pfadboni gleichen Typs verwenden nur den höheren Wert.' },
    techniqueBudget: { total: slots.length, slots, bands: Object.fromEntries(Object.entries(config.bands).map(([band, levels]) => [band, { levels, count: levels.length }])) },
    techniquePool: { totalSlots: slots.length, description: `${slots.length} gemeinsam verteilte Waffentechniken bis Stufe 20; Katalogoptionen sind keine zusätzlich erlernten Attacken.` },
    weaponTraining: { primary: config.primary, secondary: config.secondary, note: config.note }, weaponVariants: config.variants || [],
    trainingBranches: config.primary.map((name, index) => ({ id: `${config.classId}-weapon-${index + 1}`, name, minimumLevel: 1, status: 'draft' })),
    classFeatures: [...config.features, ARMOR_ROUTINE], combatStyleGrants: [],
    pendingFeatures: config.pending.map(name => ({ name, minimumLevel: null, status: 'pending' }))
  };
}

const definitions = configs.map(definition);
export function getVennyrClassDefinition(id) {
  const key = String(id || '').toLowerCase();
  const match = definitions.find(entry => [entry.id, entry.classId, entry.templateId].includes(key));
  return match ? structuredClone(match) : null;
}
export function getVennyrClassDefinitions() { return structuredClone(definitions); }
