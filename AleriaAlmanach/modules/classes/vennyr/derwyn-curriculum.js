import { DERWYN_FORM_IDS as F, DERWYN_EXPERT_PATH_IDS } from '../../combat-styles/sirenentanz/sirenentanz-forms.js?v=20260909-dragon-parent-v2';
import { DRACHENTANZ_FORM_IDS as D } from '../../combat-styles/drachentanz/drachentanz-ids.js?v=20260909-dragon-parent-v2';
import { ARMOR_ROUTINE } from '../armor-routine.js';
import { getDerwynCenyrFoundationTechniques } from '../../combat-styles/sirenentanz/derwyn-techniques.js?v=20260909-dragon-parent-v2';

const bands = { foundation: [1, 3, 5], duelist: [7, 8], expert: [9, 12, 15, 17, 20] };
const slots = Object.entries(bands).flatMap(([band, levels]) => levels.map((level, index) =>
  ({ id: `${band}-${String(index + 1).padStart(2, '0')}`, level, band })));
const access = (formId, minimumLevel, maximumLevel) => ({ formId, minimumLevel, maximumLevel, status: 'confirmed' });

const definition = {
  schemaVersion: 3, id: 'vennyr-derwyn', classId: 'derwyn', templateId: 'derwyn', name: 'Derwyn',
  cultureId: 'vennyr', culture: 'Cenyr und Vennyr', cultures: ['Cenyr', 'Vennyr'], status: 'partial',
  pagePath: 'Klassenordner/Vennyr/derwyn/index.html', minimumLevel: 1, maximumLevel: 20,
  affiliation: 'Geistliche Nimues in Cenyr und Vennyr; nicht jeder Derwyn ist Ritter',
  focus: 'Schwert, Dreizack, Kampfstab und Morgenstern', trainingFocus: 'Ein gewähltes Fundament · vier gemeinsame Wyrmformen',
  foundationSelection: {
    required: true, minimumLevel: 1,
    allowedFormIds: [D.jungdrache, F.foundation],
    options: [
      { id: 'cenyr', formId: D.jungdrache, name: 'Cenyr · Tanz des Jungdrachens' },
      { id: 'vennyr', formId: F.foundation, name: 'Vennyr · Tanz der jungen Welle' }
    ],
    rule: 'Eine Grundausbildung wird ausdrücklich gewählt. Beide Wege verwenden dieselben drei Grundslots und führen zu denselben vier Wyrmformen.'
  },
  trainingPhases: [
    { id: 'foundation', name: 'Gewähltes Fundament: Jungdrache oder junge Welle', minimumLevel: 1, maximumLevel: 6, kind: 'foundation' },
    { id: 'free-training', name: 'Freie kreative Phase', minimumLevel: 7, maximumLevel: 8, kind: 'free-training' },
    { id: 'expert', name: 'Vier Wyrmformen des Derwyn', minimumLevel: 9, maximumLevel: 20, kind: 'path-selection' }
  ],
  formIds: [D.jungdrache, F.foundation, F.creative, ...DERWYN_EXPERT_PATH_IDS],
  formAccess: [access(D.jungdrache, 1, 6), access(F.foundation, 1, 6), access(F.creative, 7, 8),
    ...DERWYN_EXPERT_PATH_IDS.map(formId => access(formId, 9, 20))],
  pathSelection: {
    minimumLevel: 9, maximumLevel: 20, multiplePathsAllowed: true, sharedTechniqueBudget: true,
    selectionCadence: 'slot-funded', firstSelectionRequired: true, firstSelectionCost: 0,
    additionalSelectionCost: 1, costUnit: 'technique-slot', allowedFormIds: DERWYN_EXPERT_PATH_IDS,
    rule: 'Ab Stufe 9 wird die erste Wyrmform ohne Slotkosten gewählt. Jede weitere Form verbraucht einen der fünf Experten-Attackenslots; die vier Waffenwege teilen sich dieses Budget.'
  },
  techniqueBudget: { total: slots.length, slots,
    bands: Object.fromEntries(Object.entries(bands).map(([band, levels]) => [band, { levels, count: levels.length }])) },
  techniquePool: { rank: 'specialized', totalSlots: slots.length,
    description: 'Zehn Attackenslots: drei für das gewählte Fundament, zwei für die freie kreative Phase und fünf für die vier gemeinsamen Wyrmformen.' },
  combatStyleGrants: [
    { styleId: 'drachentanz', formId: D.jungdrache, minimumLevel: 1,
      techniqueUnlockLevels: Object.fromEntries(getDerwynCenyrFoundationTechniques().map(attack => [attack.id, attack.minimumLevel])) },
    { styleId: 'sirenentanz', formId: F.foundation, minimumLevel: 1 },
    { styleId: 'sirenentanz', formId: F.creative, minimumLevel: 7 },
    ...DERWYN_EXPERT_PATH_IDS.map(formId => ({ styleId: 'sirenentanz', formId, minimumLevel: 9 }))
  ],
  trainingBranches: [
    { id: 'derwyn-sword', name: 'Fließender Wyrm · Schwert', minimumLevel: 9, status: 'confirmed', formIds: [F.flowing], weaponProfileIds: ['sword'] },
    { id: 'derwyn-trident', name: 'Brandender Wyrm · Dreizack', minimumLevel: 9, status: 'confirmed', formIds: [F.breaking], weaponProfileIds: ['trident'] },
    { id: 'derwyn-staff', name: 'Steigender Wyrm · Kampfstab / Zauberstab', minimumLevel: 9, status: 'confirmed', formIds: [F.rising], weaponProfileIds: ['staff', 'quarterstaff', 'magic-staff'] },
    { id: 'derwyn-morningstar', name: 'Peitschender Wyrm · Morgenstern', minimumLevel: 9, status: 'confirmed', formIds: [F.whipping], weaponProfileIds: ['morningstar'] }
  ],
  weaponTraining: { primary: ['Schwert', 'Dreizack', 'Kampfstab / Zauberstab', 'Morgenstern'], secondary: [],
    note: 'Jede Wyrmform hat eine feste Waffenführung. Ein Zauberstab muss als Nahkampfwaffe geeignet sein; Zauber benötigen weiterhin ihre eigene Fähigkeit und deren Kosten.' },
  weaponVariants: [
    { id: 'sword', name: 'Schwert', rule: 'Fließender Wyrm: abwartende Klingenführung, Umlenkung und bezahlte Antwort.' },
    { id: 'trident', name: 'Dreizack', rule: 'Brandender Wyrm: Stoß und Waffenbindung; Kontrolle wirkt nur nach dem angegebenen Rettungswurf.' },
    { id: 'staff', name: 'Kampfstab / Zauberstab', rule: 'Steigender Wyrm: zweihändiger physischer Stabkampf. Keine automatisch mitgewirkte Magie.' },
    { id: 'morningstar', name: 'Morgenstern', rule: 'Peitschender Wyrm: offensive Hiebe mit engem Rückweg. Kein allgemeines Ignorieren von Rüstung.' }
  ],
  classFeatures: [ARMOR_ROUTINE],
  pendingFeatures: [
    'Wassermagie: Strömung, Nebel und Flut',
    'Wiederherstellungsmagie: Heilen, Reinigen und Stärken',
    'Geistliche Klassenmerkmale und eigene Zauberressourcen',
    'Zusätzliche Ritter- oder Eidgeschworenen-Ausbildung'
  ].map(name => ({ name, minimumLevel: null, status: 'pending' }))
};

export function getDerwynClassDefinition() { return structuredClone(definition); }
