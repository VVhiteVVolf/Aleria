const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { webcrypto } = require('crypto');

const almanachRoot = path.resolve(__dirname, '..');
const sources = [
  'data/sections.js',
  'modules/core/content-safety.js',
  'modules/core/app-core.js',
  'modules/module-editor/module-editor-data.js',
  'modules/module-editor/module-editor-cast-picker.js',
  'modules/module-editor/module-editor-scene-blocks.js',
  'modules/module-editor/module-editor-bounty.js',
  'modules/module-editor/module-editor-goods.js',
  'modules/module-editor/module-editor-trade-catalog.js',
  'modules/module-editor/module-editor-map-template.js',
  'modules/module-editor/module-editor-landing.js',
  'modules/module-editor/module-editor-guest-register.js',
  'modules/module-editor/module-editor-profiles.js',
  'modules/module-editor/module-editor-wanted.js',
  'modules/module-editor/module-editor-character-inventory.js',
  'modules/module-editor/module-editor-session.js',
  'modules/module-editor/module-editor-biography.js',
  'modules/module-editor/module-editor-bestiary.js',
  'modules/module-editor/module-editor-recipe.js',
  'modules/module-editor/module-editor-quest.js',
  'modules/module-editor/module-editor-tournament.js',
  'modules/module-editor/module-editor-caste.js',
  'modules/module-editor/module-editor-court.js',
  'modules/module-editor/module-editor-hierarchy.js',
  'modules/module-editor/module-editor-family.js',
  'modules/module-editor/module-editor-icon-field.js',
  'modules/module-editor/module-editor-row-schemas.js',
  'modules/module-editor/module-editor-house.js',
  'modules/module-editor/module-editor-templates.js',
  'modules/module-editor/module-editor-workflow.js'
];

const noOp = () => {};
const context = {
  console,
  structuredClone,
  URL,
  Blob,
  TextEncoder,
  TextDecoder,
  setTimeout,
  clearTimeout,
  crypto: webcrypto,
  confirm: () => true,
  alert: noOp,
  navigator: {},
  localStorage: { getItem: () => null, setItem: noOp, removeItem: noOp },
  document: {
    readyState: 'complete',
    addEventListener: noOp,
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null
  }
};
context.window = context;
context.globalThis = context;
context.addEventListener = noOp;
vm.createContext(context);

for (const source of sources) {
  const filePath = path.join(almanachRoot, source);
  vm.runInContext(fs.readFileSync(filePath, 'utf8'), context, { filename: source });
}

const results = vm.runInContext(`
  Object.values(MODULE_TEMPLATE_REGISTRY).map(template => {
    const originalPages = template.createPages();
    const sanitizedPages = originalPages.map((page, index) => sanitizeModulePage(page, page.pageTitle || ('Seite ' + (index + 1))));
    const sanitizedAgain = sanitizedPages.map((page, index) => sanitizeModulePage(page, page.pageTitle || ('Seite ' + (index + 1))));
    const originalEntry = {
      id: 'roundtrip-' + template.id,
      title: template.defaultTitle,
      subtitle: template.defaultSubtitle,
      type: template.entryType,
      multipage: true,
      pages: originalPages
    };
    const importedEntry = JSON.parse(JSON.stringify(originalEntry));
    const sanitizedEntry = sanitizeModuleEntry(importedEntry);
    const sanitizedEntryAgain = sanitizeModuleEntry(JSON.parse(JSON.stringify(sanitizedEntry)));
    const recognizedTypes = sanitizedPages.map(page => getModuleTemplateForPage(page).id);
    const specializedContentRecognized = template.id === 'story' || sanitizedPages
      .filter(page => getModuleTemplateForPage(page).id === template.id)
      .every(page => hasModulePageContent({ ...page, pageTitle: '', description: '', image: '', quote: '' }));
    return {
      id: template.id,
      pageType: template.pageType,
      originalCount: originalPages.length,
      sanitizedCount: sanitizedPages.filter(Boolean).length,
      recognizedTypes,
      hasTitles: sanitizedPages.every(page => page && typeof page.pageTitle === 'string'),
      idempotent: JSON.stringify(sanitizedPages) === JSON.stringify(sanitizedAgain),
      entryId: sanitizedEntry.id,
      entryTitle: sanitizedEntry.title,
      entryPageCount: sanitizedEntry.pages.length,
      entryIdempotent: JSON.stringify(sanitizedEntry) === JSON.stringify(sanitizedEntryAgain),
      specializedContentRecognized,
      changedKeys: sanitizedPages.flatMap((page, index) => {
        const again = sanitizedAgain[index] || {};
        return [...new Set([...Object.keys(page || {}), ...Object.keys(again)])]
          .filter(key => JSON.stringify(page?.[key]) !== JSON.stringify(again[key]));
      }).filter((key, index, values) => values.indexOf(key) === index)
    };
  });
`, context);

const failures = [];
for (const result of results) {
  if (result.originalCount < 1) failures.push(`${result.id}: Defaultvorlage besitzt keine Seite.`);
  if (result.sanitizedCount !== result.originalCount) failures.push(`${result.id}: Beim Sanitizen gingen Seiten verloren.`);
  if (!result.hasTitles) failures.push(`${result.id}: Mindestens ein Seitentitel ging verloren.`);
  if (!result.idempotent) failures.push(`${result.id}: Wiederholtes Sanitizen veraendert ${result.changedKeys.join(', ') || 'die Daten'}.`);
  if (result.entryId !== `roundtrip-${result.id}`) failures.push(`${result.id}: Modul-ID ging im JSON-Roundtrip verloren.`);
  if (!result.entryTitle) failures.push(`${result.id}: Modultitel ging im JSON-Roundtrip verloren.`);
  if (result.entryPageCount !== result.originalCount) failures.push(`${result.id}: Seitenanzahl ging im Modul-Roundtrip verloren.`);
  if (!result.entryIdempotent) failures.push(`${result.id}: Vollstaendiges Modul ist nach Import nicht idempotent.`);
  if (!result.specializedContentRecognized) failures.push(`${result.id}: Spezialisierte Seite wird faelschlich als leer bewertet.`);
  if (result.id !== 'story' && !result.recognizedTypes.includes(result.id)) {
    failures.push(`${result.id}: Kein eigener Typmarker blieb erhalten (${result.recognizedTypes.join(', ')}).`);
  }
}

const referenceChecks = vm.runInContext(`
  (() => {
    const inventory = sanitizeCharacterInventoryData({
      categories: [{ id: 'quest-items', label: 'Questgegenstaende', icon: '!' }],
      items: [
        { id: 'valid', name: 'Siegel', category: 'quest-items' },
        { id: 'invalid', name: 'Unsortiert', category: 'missing-category' }
      ]
    });
    const family = sanitizeFamilyData({
      trees: [{
        id: 'familie',
        label: 'Familie',
        levels: [{ nodes: [
          { id: 'parent', title: 'Elternteil' },
          { id: 'child', title: 'Kind', parentIds: ['parent', 'missing', 'child'] }
        ] }],
        connections: [
          { from: 'parent', to: 'child', relationType: 'blood' },
          { from: 'parent', to: 'missing', relationType: 'blood' },
          { from: 'parent', to: 'parent', relationType: 'blood' }
        ]
      }]
    });
    const hierarchy = sanitizeHierarchyData({
      trees: [
        { id: 'root', parentTreeId: 'root', label: 'Root', levels: [] },
        { id: 'child', parentTreeId: 'missing', label: 'Child', levels: [] }
      ]
    });
    return {
      customCategoryKept: inventory.categories.some(category => category.id === 'quest-items'),
      customAssignmentKept: inventory.items.find(item => item.id === 'valid')?.category === 'quest-items',
      invalidAssignmentRepaired: inventory.items.find(item => item.id === 'invalid')?.category === 'other',
      familyParents: family.trees[0].levels[0].nodes.find(node => node.id === 'child')?.parentIds || [],
      familyConnectionCount: family.trees[0].connections.length,
      hierarchyParents: hierarchy.trees.map(tree => tree.parentTreeId)
    };
  })()
`, context);

const assetValidationChecks = vm.runInContext(`
  (() => {
    const errors = [];
    validateModulePageAssets(errors, {
      bountyFile: { portraitImage: 'data:image/png;base64,invalid' },
      court: { parties: [{ portrait: 'data:image/png;base64,invalid' }] },
      family: { trees: [{ levels: [{ nodes: [{ portrait: 'data:image/png;base64,invalid' }] }] }] },
      house: { crestImage: 'data:image/png;base64,invalid' },
      biography: { connections: [{ image: 'data:image/png;base64,invalid' }] },
      goodsTable: { tables: [{ rows: [{ image: 'data:image/png;base64,invalid' }] }] },
      tradeCatalog: { items: [{ sealImage: 'data:image/png;base64,invalid' }] },
      mapTemplate: { tabs: [{ image: 'data:image/png;base64,invalid' }] }
    }, 0);
    return errors;
  })()
`, context);

if (!referenceChecks.customCategoryKept) failures.push('character-inventory: Benutzerdefinierte Kategorie ging verloren.');
if (!referenceChecks.customAssignmentKept) failures.push('character-inventory: Gueltige Kategoriezuordnung ging verloren.');
if (!referenceChecks.invalidAssignmentRepaired) failures.push('character-inventory: Verwaiste Kategoriezuordnung wurde nicht repariert.');
if (JSON.stringify(referenceChecks.familyParents) !== JSON.stringify(['parent'])) failures.push('family: Ungueltige Elternreferenzen wurden nicht entfernt.');
if (referenceChecks.familyConnectionCount !== 1) failures.push('family: Ungueltige Verbindungen wurden nicht entfernt.');
if (referenceChecks.hierarchyParents.some(Boolean)) failures.push('hierarchy: Ungueltige Baumreferenzen wurden nicht entfernt.');
['Kopfgeldakte Portrait', 'Gerichtsakte Beteiligter', 'Familie 1.1', 'Hauswappen', 'Biografieverbindung', 'Warentabelle', 'Handelsgut', 'Kartenreiter']
  .forEach(label => {
    if (!assetValidationChecks.some(error => error.includes(label))) failures.push(`Assetvalidierung fehlt fuer ${label}.`);
  });

if (failures.length) {
  console.error(`Modultemplate-Roundtrip fehlgeschlagen:\n\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  const pageCount = results.reduce((total, result) => total + result.originalCount, 0);
  console.log(`Modultemplate-Roundtrip OK: ${results.length} Module, ${pageCount} Defaultseiten, JSON-Import stabil, Typmarker erhalten, Sanitizer idempotent, Referenzintegritaet geprueft.`);
}
