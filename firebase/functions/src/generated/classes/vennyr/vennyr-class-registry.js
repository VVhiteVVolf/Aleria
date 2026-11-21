import { getDerwynClassDefinition } from './derwyn-curriculum.js?v=20260909-dragon-parent-v2';
import { SIRENENTANZ_FORM_IDS as F, SIRENENTANZ_EXPERT_PATH_IDS } from '../../combat-styles/sirenentanz/sirenentanz-forms.js?v=20260909-dragon-parent-v2';
import { ARMOR_ROUTINE } from '../armor-routine.js';
import { getClassPassiveFeatures } from '../combat-passives/class-passive-curriculum.js';

export { VENNYR_CLASS_IDS } from './vennyr-class-ids.js?v=20260909-class-forms-v1';
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
    pending: [] },
  { classId: 'morwyr', name: 'Morwyr', focus: 'Partisane, Enteraxt und Harpune', trainingFocus: 'Ritter des Decks und der Brandung',
    primary: ['Partisane'], secondary: ['Enteraxt', 'Harpunenspeer'],
    note: 'Stangenwaffe für Distanz, Axt für Gedränge, Harpune für den Auftakt. Ziehen benötigt eine befestigte Leine und einen misslungenen Rettungswurf.',
    bands: { foundation: [1, 2, 3, 4, 5, 6], advanced: [7, 8], expert: [9, 11, 13, 15, 17, 18, 19, 20] },
    variants: [weapon('partisan', 'Partisane', 'Die geführte Partisane bestimmt Waffenwürfel und Reichweite. Ein bereits vorhandener Waffenbonus wird einmal gezählt.'),
      weapon('boarding-axe', 'Enteraxt', 'Kurze Hiebe und Haken. Ein gelungenes Manöver durchtrennt keine beliebig starken Taue oder Gegenstände automatisch.'),
      weapon('harpoon', 'Harpunenspeer', 'Wurf mit Waffenreichweite. Heranziehen bis 2 m nur mit intakter, befestigter Leine und KRF-Rettungswurf; niemals automatisches Überbordwerfen.')],
    pending: ['Schiffsbewegung, Überbordlage und Leinenführung bleiben situative Auswertung'] },
  { classId: 'rhyfelwyr', name: 'Rhyfelwyr', focus: 'Schwere Hiebwaffen und Linienbruch', trainingFocus: 'Wucht und Standfestigkeit',
    primary: ['Großaxt', 'Kriegshammer', 'Morgenstern', 'Streitkolben'], secondary: ['Ritterschwert', 'Flegel'],
    note: 'Dieselben schweren Folgen passen zu Axt, Hammer, Morgenstern und Kolben. Schwertführung bleibt möglich; Waffentyp und Würfel werden nicht vereinheitlicht.',
    bands: { foundation: [1, 2, 3, 4, 5, 6], advanced: [7, 8], expert: [9, 10, 11, 12, 13, 15, 17, 20] },
    variants: [weapon('heavy-impact', 'Axt, Hammer und Kolben', 'Die Schadensart folgt der Waffe. Zusätzliche Technik-Würfel kopieren niemals den vollständigen Mehrwürfel-Schaden einer Großwaffe.'),
      weapon('flail', 'Morgenstern und Flegel', 'Umgreifende Techniken senken nur die in der Attacke genannte Zielverteidigung; kein pauschales Ignorieren von Rüstung.')],
    pending: [] },
  { classId: 'ceidwyn', name: 'Ceidwyn', templateId: 'ceidwynr', focus: 'Kurzbogen, Armbrust, Säbel und Dreizack', trainingFocus: 'Schütze und Nahkämpfer der Flotte',
    primary: ['Kurzbogen', 'Armbrust'], secondary: ['Säbel', 'Dreizack'],
    note: 'Fern- und Nahkampf teilen sich die Slots. Bereits die Grundform enthält zwei echte Nahkampftechniken; jedes Expertenprofil führt mindestens eine fort.',
    bands: { foundation: [1, 2, 4, 6], advanced: [7, 8], expert: [9, 11, 13, 15, 17, 20] },
    variants: [weapon('shortbow', 'Kurzbogen', 'Bewegliche Schüsse mit der tatsächlichen Waffenreichweite; kein Langbogen-Ersatz.'),
      weapon('crossbow', 'Armbrust', 'Bolzentechniken verwenden Armbrustwürfel. Nachladen und Munition bleiben Voraussetzungen; keine kostenlosen Zusatzschüsse.'),
      weapon('sabre', 'Säbel', 'Schnelle Nahkampftechniken für enge Deckpassagen.'),
      weapon('trident', 'Dreizack', 'Bindung und Abstand. Entwaffnen ist ein ausgewiesener Versuch; der Treffer allein entfernt keine fremde Waffe.')],
    pending: ['Ballisten und andere Belagerungsgeräte', 'Signal- und Brandmunition', 'Kundschaftervogel und klerikale Segnungen'] },
  { classId: 'rhiddwyr', name: 'Rhiddwyr', templateId: 'rhiddwyrr', focus: 'Reiterwaffen, Armbrust und beweglicher Nahkampf', trainingFocus: 'Fahrender Ritter der Höhen und Küsten',
    primary: ['Flegel', 'Rabenschnabel', 'Reiteraxt', 'Streitkolben'], secondary: ['Glefe', 'Reiterspieß', 'Armbrust'],
    note: 'Sattelangriffe erfordern ein tatsächlich geführtes Reittier und den Status beritten. Unberitten bleiben eigene Nahkampf- und Armbrustoptionen verfügbar.',
    bands: { foundation: [1, 2, 3, 4, 5, 6], advanced: [7, 8], expert: [9, 11, 13, 15, 17, 20] },
    variants: [weapon('rider-impact', 'Flegel, Rabenschnabel, Reiteraxt, Kolben', 'Ein Waffenweg mit verschiedenen Würfeln und Schadensarten; auch zu Fuß nutzbar.'),
      weapon('rider-polearm', 'Glefe und Reiterspieß', 'Anrittsattacken benötigen berittenen Status und ausdrücklich angegebenen Anlauf. Kein Anritt auf engem Deck.'),
      weapon('crossbow', 'Armbrust', 'Eigenständige Fernkampfoptionen, auch abgesessen. Kein automatischer Fernschuss nach einem Sattelhieb.')],
    pending: ['Gemeinsame Positionsführung von Ross und Reiter'] },

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
      { id: 'veteran', name: 'Erfahrene Küstenwache', minimumLevel: 16, maximumLevel: 20, kind: 'class-features' }] : phases,
    formIds, pathSelection: { minimumLevel: militia ? 6 : 9, maximumLevel: militia ? 15 : 20,
      multiplePathsAllowed: !militia, sharedTechniqueBudget: true, firstSelectionRequired: !militia,
      firstSelectionCost: 0, additionalSelectionCost: militia ? 0 : 1, costUnit: 'technique-slot',
      allowedFormIds: militia ? [F.militia] : SIRENENTANZ_EXPERT_PATH_IDS,
      rule: militia ? 'Nach der Grundform folgt ausschließlich die Küstenwache, Stufe 6–15.' : 'Ab Stufe 9 erster Expertenpfad ohne Slotkosten; jeder weitere Pfad kostet einen Experten-Attackenslot. Pfadboni gleichen Typs verwenden nur den höheren Wert.' },
    techniqueBudget: { total: slots.length, slots, bands: Object.fromEntries(Object.entries(config.bands).map(([band, levels]) => [band, { levels, count: levels.length }])) },
    techniquePool: { totalSlots: slots.length, description: 'Techniken werden einzeln aus dem erweiterten Waffen- und Formenkatalog gewählt. Mehrere Waffenwege teilen dieselben Aktionsressourcen.' },
    weaponTraining: { primary: config.primary, secondary: config.secondary, note: config.note }, weaponVariants: config.variants || [],
    trainingBranches: config.primary.map((name, index) => ({ id: `${config.classId}-weapon-${index + 1}`, name, minimumLevel: 1, status: 'draft' })),
    classFeatures: [...getClassPassiveFeatures(militia ? 'vennyr-milwr' : config.classId), ARMOR_ROUTINE], combatStyleGrants: [],
    pendingFeatures: config.pending.map(name => ({ name, minimumLevel: null, status: 'pending' }))
  };
}

const definitions = [...configs.map(definition), getDerwynClassDefinition()];
export function getVennyrClassDefinition(id) {
  const key = String(id || '').toLowerCase();
  const match = definitions.find(entry => [entry.id, entry.classId, entry.templateId].includes(key));
  return match ? structuredClone(match) : null;
}
export function getVennyrClassDefinitions() { return structuredClone(definitions); }
