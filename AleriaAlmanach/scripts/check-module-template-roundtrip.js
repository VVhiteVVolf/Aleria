const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { webcrypto } = require('crypto');

const almanachRoot = path.resolve(__dirname, '..');
const sources = [
  'modules/name-list/name-list-data.js',
  'modules/script-table/script-table-data.js',
  'modules/language/language-reference-entries.js',
  'data/sections.js',
  'modules/core/content-safety.js',
  'modules/house-warriors/house-warriors-data.js',
  'modules/language/language-data.js',
  'modules/family-tree-embed/family-tree-embed-data.js',
  'modules/core/app-core.js',
  'modules/module-editor/module-editor-data.js',
  'modules/family/family-api.js',
  'modules/family/editor/family-editor-model.js',
  'modules/family/workbench/family-workbench-state.js',
  'modules/family/workbench/family-workbench-ui.js',
  'modules/family/editor/family-editor-ui.js',
  'modules/module-editor/module-editor-cast-picker.js',
  'modules/module-editor/module-editor-scene-blocks.js',
  'modules/module-editor/module-editor-bounty.js',
  'modules/module-editor/module-editor-goods.js',
  'modules/module-editor/module-editor-trade-catalog.js',
  'modules/module-editor/module-editor-map-template.js',
  'modules/language/language-module-editor.js',
  'modules/language/language-renderer.js',
  'modules/name-list/name-list-module-editor.js',
  'modules/name-list/name-list-renderer.js',
  'modules/script-table/script-table-module-editor.js',
  'modules/script-table/script-table-renderer.js',
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
  'modules/family-tree-embed/family-tree-embed-editor.js',
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

const templateListChecks = vm.runInContext(`(() => {
  const values = markup => [...markup.matchAll(/<option value="([^"]+)"/g)].map(match => match[1]);
  return {
    templates: values(buildModuleTemplateOptions('story')),
    pageTypes: values(buildModulePageTypeOptions('standard')),
    registryOptions: MODULE_TEMPLATE_OPTIONS.map(option => option.id)
  };
})()`, context);
['templates', 'pageTypes', 'registryOptions'].forEach(listName => {
  if (templateListChecks[listName].includes('family')) failures.push(`family: Ausgeklammertes Template erscheint weiterhin in ${listName}.`);
  if (!templateListChecks[listName].includes('family-tree')) failures.push(`family-tree: Stammbaum fehlt in ${listName}.`);
});

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
    const familyV2 = sanitizeFamilyData({
      schema: 'aleria.family',
      schemaVersion: 2,
      id: 'family-v2',
      document: { title: 'Haus V2', facts: [{ label: 'Sitz', value: 'Nordturm' }] },
      genealogy: {
        persons: [{ id: 'v2-person', identity: { displayName: 'V2 Person' } }],
        partnerships: [],
        parentages: [],
        associations: [],
        sources: [],
        fantasy: {}
      },
      view: { initialFocusPersonId: 'v2-person', orientation: 'horizontal' },
      extensions: { 'aleria.test': { kept: true } }
    });
    const familyV2DefaultPage = MODULE_TEMPLATE_REGISTRY.family.createPage(0);
    const familyV2DefaultEditor = buildFamilyModuleEditorFields(familyV2DefaultPage);
    const hierarchy = sanitizeHierarchyData({
      trees: [
        { id: 'root', parentTreeId: 'root', label: 'Root', levels: [] },
        { id: 'child', parentTreeId: 'missing', label: 'Child', levels: [] }
      ]
    });
    const language = sanitizeLanguageData({
      alphabetLayers: [
        { label: 'Ebene 1', image: 'https://example.com/alphabet-1.png' },
        { label: 'Ebene 2', image: 'https://example.com/alphabet-2.png' },
        { label: 'Ebene 3', image: '' }
      ],
      sections: []
    });
    const languageLayers = getVisibleLanguageAlphabetLayers(language);
    const languageTabs = buildLanguageLayerTabs(languageLayers, 'roundtrip-language');
    const languagePanels = buildLanguageLayerPanels(languageLayers, 'roundtrip-language');
    const languageSection = SECTIONS.find(section => section.key === 'Sprachen');
    const rheunwaithSource = languageSection?.entries?.find(entry => entry.id === 'rheunwaith');
    const rheunwaith = rheunwaithSource ? sanitizeModuleEntry(JSON.parse(JSON.stringify(rheunwaithSource))) : null;
    const rheunwaithPages = rheunwaith?.pages || [];
    const oghamSource = languageSection?.entries?.find(entry => entry.id === 'ogham');
    const ogham = oghamSource ? sanitizeModuleEntry(JSON.parse(JSON.stringify(oghamSource))) : null;
    const oghamPages = ogham?.pages || [];
    const karnrithSource = languageSection?.entries?.find(entry => entry.id === 'morgar-karnrith');
    const karnrith = karnrithSource ? sanitizeModuleEntry(JSON.parse(JSON.stringify(karnrithSource))) : null;
    const karnrithPages = karnrith?.pages || [];
    const infernalSource = languageSection?.entries?.find(entry => entry.id === 'infernal-nharazim');
    const infernal = infernalSource ? sanitizeModuleEntry(JSON.parse(JSON.stringify(infernalSource))) : null;
    const infernalPages = infernal?.pages || [];
    const futharkSource = languageSection?.entries?.find(entry => entry.id === 'futhark');
    const futhark = futharkSource ? sanitizeModuleEntry(JSON.parse(JSON.stringify(futharkSource))) : null;
    const futharkPages = futhark?.pages || [];
    const kanaanithSource = languageSection?.entries?.find(entry => entry.id === 'kanaanith');
    const kanaanith = kanaanithSource ? sanitizeModuleEntry(JSON.parse(JSON.stringify(kanaanithSource))) : null;
    const kanaanithPages = kanaanith?.pages || [];
    const argentiSource = languageSection?.entries?.find(entry => entry.id === 'lingua-argenti');
    const argenti = argentiSource ? sanitizeModuleEntry(JSON.parse(JSON.stringify(argentiSource))) : null;
    const argentiPages = argenti?.pages || [];
    const stoicheiaSource = languageSection?.entries?.find(entry => entry.id === 'stoicheia');
    const stoicheia = stoicheiaSource ? sanitizeModuleEntry(JSON.parse(JSON.stringify(stoicheiaSource))) : null;
    const stoicheiaPages = stoicheia?.pages || [];
    const getLanguageRenderCounts = pages => {
      const languageData = sanitizeLanguageData(pages[1]?.language || {});
      const nameData = sanitizeNameListData(pages[2]?.nameList || {});
      const scriptData = sanitizeScriptTableData(pages[3]?.scriptTable || {});
      const languageMarkup = buildLanguageMeta(languageData);
      const nameMarkup = nameData.groups.map(buildNameListGroup).join('');
      const scriptMarkup = buildScriptTableMainTable(scriptData) + buildScriptTableSyllableTable(scriptData);
      return {
        languageMetaRows: (languageMarkup.match(/<dt>/g) || []).length,
        names: (nameMarkup.match(/class="name-list-name"/g) || []).length,
        symbols: (scriptMarkup.match(/class="script-table-symbol/g) || []).length,
        stylePresent: scriptMarkup.includes('script-style-' + scriptData.scriptStyle),
        syllableTablePresent: scriptMarkup.includes('script-table-syllables')
      };
    };
    return {
      customCategoryKept: inventory.categories.some(category => category.id === 'quest-items'),
      customAssignmentKept: inventory.items.find(item => item.id === 'valid')?.category === 'quest-items',
      invalidAssignmentRepaired: inventory.items.find(item => item.id === 'invalid')?.category === 'other',
      familyParents: family.trees[0].levels[0].nodes.find(node => node.id === 'child')?.parentIds || [],
      familyConnectionCount: family.trees[0].connections.length,
      familyV2SchemaVersion: familyV2.schemaVersion,
      familyV2PersonId: familyV2.genealogy.persons[0]?.id || '',
      familyV2FocusId: familyV2.view.initialFocusPersonId || '',
      familyV2ExtensionKept: familyV2.extensions?.['aleria.test']?.kept === true,
      familyV2LayoutMode: familyV2.layoutMode,
      familyV2DefaultSchemaVersion: familyV2DefaultPage.family?.schemaVersion,
      familyV2DefaultPersonCount: familyV2DefaultPage.family?.genealogy?.persons?.length || 0,
      familyV2DefaultEditorStructured: familyV2DefaultEditor.includes('data-family-editor-version="2"')
        && familyV2DefaultEditor.includes('family-v2-source-data'),
      hierarchyParents: hierarchy.trees.map(tree => tree.parentTreeId),
      languageLayerCount: languageLayers.length,
      languageTabCount: (languageTabs.match(/data-language-layer-tab=/g) || []).length,
      languagePanelCount: (languagePanels.match(/data-language-layer-panel=/g) || []).length,
      languageEmptySectionsKept: language.sections.length === 0,
      rheunwaithFound: Boolean(rheunwaith),
      rheunwaithPageCount: rheunwaithPages.length,
      rheunwaithPageTypes: rheunwaithPages.map(page => getModuleTemplateForPage(page)?.id || ''),
      rheunwaithInfoCount: rheunwaithPages[0]?.stats?.length || 0,
      rheunwaithVisibleLayers: getVisibleLanguageAlphabetLayers(rheunwaithPages[1]?.language || {}).length,
      rheunwaithNameCounts: (rheunwaithPages[2]?.nameList?.groups || []).map(group => group.names.length),
      rheunwaithUniqueNameCounts: (rheunwaithPages[2]?.nameList?.groups || []).map(group => new Set(group.names.map(name => name.toLocaleLowerCase('de'))).size),
      rheunwaithScriptRowCount: rheunwaithPages[3]?.scriptTable?.rows?.length || 0,
      rheunwaithSyllableCount: rheunwaithPages[3]?.scriptTable?.syllables?.length || 0,
      rheunwaithScriptStyle: rheunwaithPages[3]?.scriptTable?.scriptStyle || '',
      rheunwaithImages: [
        rheunwaith?.image,
        rheunwaithPages[0]?.image,
        ...(rheunwaithPages[1]?.language?.alphabetLayers || []).map(layer => layer.image)
      ].filter(Boolean),
      oghamFound: Boolean(ogham),
      oghamPageCount: oghamPages.length,
      oghamPageTypes: oghamPages.map(page => getModuleTemplateForPage(page)?.id || ''),
      oghamInfoCount: oghamPages[0]?.stats?.length || 0,
      oghamAlphabetImageCount: (oghamPages[1]?.language?.alphabetLayers || []).filter(layer => layer.image).length,
      oghamNameCounts: (oghamPages[2]?.nameList?.groups || []).map(group => group.names.length),
      oghamUniqueNameCounts: (oghamPages[2]?.nameList?.groups || []).map(group => new Set(group.names.map(name => name.toLocaleLowerCase('de'))).size),
      oghamOrnamentStyle: oghamPages[2]?.nameList?.ornamentStyle || '',
      oghamScriptRowCount: oghamPages[3]?.scriptTable?.rows?.length || 0,
      oghamSyllableCount: oghamPages[3]?.scriptTable?.syllables?.length || 0,
      oghamScriptStyle: oghamPages[3]?.scriptTable?.scriptStyle || '',
      oghamEntryHasImage: Boolean(ogham?.image || oghamPages.some(page => page.image)),
      karnrithFound: Boolean(karnrith),
      karnrithTitle: karnrith?.title || '',
      karnrithPageCount: karnrithPages.length,
      karnrithPageTypes: karnrithPages.map(page => getModuleTemplateForPage(page)?.id || ''),
      karnrithInfoCount: karnrithPages[0]?.stats?.length || 0,
      karnrithVisibleLayers: getVisibleLanguageAlphabetLayers(karnrithPages[1]?.language || {}).length,
      karnrithLanguageSectionCount: karnrithPages[1]?.language?.sections?.length || 0,
      karnrithNativeName: karnrithPages[1]?.language?.nativeName || '',
      karnrithNameCounts: (karnrithPages[2]?.nameList?.groups || []).map(group => group.names.length),
      karnrithUniqueNameCounts: (karnrithPages[2]?.nameList?.groups || []).map(group => new Set(group.names.map(name => name.toLocaleLowerCase('de'))).size),
      karnrithNameStyle: karnrithPages[2]?.nameList?.ornamentStyle || '',
      karnrithNames: (karnrithPages[2]?.nameList?.groups || []).flatMap(group => group.names),
      karnrithScriptRowCount: karnrithPages[3]?.scriptTable?.rows?.length || 0,
      karnrithScriptSymbols: (karnrithPages[3]?.scriptTable?.rows || []).map(row => row.symbol),
      karnrithSyllableCount: karnrithPages[3]?.scriptTable?.syllables?.length || 0,
      karnrithScriptStyle: karnrithPages[3]?.scriptTable?.scriptStyle || '',
      karnrithImages: [
        karnrith?.image,
        karnrithPages[0]?.image,
        ...(karnrithPages[1]?.language?.alphabetLayers || []).map(layer => layer.image)
      ].filter(Boolean),
      infernalFound: Boolean(infernal),
      infernalTitle: infernal?.title || '',
      infernalPageCount: infernalPages.length,
      infernalPageTypes: infernalPages.map(page => getModuleTemplateForPage(page)?.id || ''),
      infernalInfoCount: infernalPages[0]?.stats?.length || 0,
      infernalContext: (infernalPages[0]?.description || '') + ' ' + (infernalPages[0]?.stats || []).flat().join(' '),
      infernalVisibleLayers: getVisibleLanguageAlphabetLayers(infernalPages[1]?.language || {}).length,
      infernalLanguageSectionCount: infernalPages[1]?.language?.sections?.length || 0,
      infernalNativeName: infernalPages[1]?.language?.nativeName || '',
      infernalNameCounts: (infernalPages[2]?.nameList?.groups || []).map(group => group.names.length),
      infernalUniqueNameCounts: (infernalPages[2]?.nameList?.groups || []).map(group => new Set(group.names.map(name => name.toLocaleLowerCase('de'))).size),
      infernalNameStyle: infernalPages[2]?.nameList?.ornamentStyle || '',
      infernalNames: (infernalPages[2]?.nameList?.groups || []).flatMap(group => group.names),
      infernalScriptRowCount: infernalPages[3]?.scriptTable?.rows?.length || 0,
      infernalScriptSymbols: (infernalPages[3]?.scriptTable?.rows || []).map(row => row.symbol),
      infernalSyllableCount: infernalPages[3]?.scriptTable?.syllables?.length || 0,
      infernalScriptStyle: infernalPages[3]?.scriptTable?.scriptStyle || '',
      infernalImages: [
        infernal?.image,
        infernalPages[0]?.image,
        ...(infernalPages[1]?.language?.alphabetLayers || []).map(layer => layer.image)
      ].filter(Boolean),
      futharkFound: Boolean(futhark),
      futharkPageCount: futharkPages.length,
      futharkPageTypes: futharkPages.map(page => getModuleTemplateForPage(page)?.id || ''),
      futharkInfoCount: futharkPages[0]?.stats?.length || 0,
      futharkContext: (futharkPages[0]?.description || '') + ' ' + (futharkPages[1]?.language?.sections || []).map(section => section.text).join(' '),
      futharkLanguageSectionCount: futharkPages[1]?.language?.sections?.length || 0,
      futharkAlphabetImageCount: (futharkPages[1]?.language?.alphabetLayers || []).filter(layer => layer.image).length,
      futharkEntryHasImage: Boolean(futhark?.image || futharkPages.some(page => page.image)),
      futharkNameCounts: (futharkPages[2]?.nameList?.groups || []).map(group => group.names.length),
      futharkUniqueNameCounts: (futharkPages[2]?.nameList?.groups || []).map(group => new Set(group.names.map(name => name.toLocaleLowerCase('de'))).size),
      futharkNameStyle: futharkPages[2]?.nameList?.ornamentStyle || '',
      futharkNames: (futharkPages[2]?.nameList?.groups || []).flatMap(group => group.names),
      futharkScriptRowCount: futharkPages[3]?.scriptTable?.rows?.length || 0,
      futharkScriptSymbols: (futharkPages[3]?.scriptTable?.rows || []).map(row => row.symbol),
      futharkSyllableCount: futharkPages[3]?.scriptTable?.syllables?.length || 0,
      futharkScriptStyle: futharkPages[3]?.scriptTable?.scriptStyle || '',
      kanaanithFound: Boolean(kanaanith),
      kanaanithPageCount: kanaanithPages.length,
      kanaanithPageTypes: kanaanithPages.map(page => getModuleTemplateForPage(page)?.id || ''),
      kanaanithInfoCount: kanaanithPages[0]?.stats?.length || 0,
      kanaanithContext: (kanaanithPages[0]?.description || '') + ' ' + (kanaanithPages[1]?.language?.sections || []).map(section => section.text).join(' '),
      kanaanithWritingDirection: kanaanithPages[1]?.language?.writingDirection || '',
      kanaanithVisibleLayers: getVisibleLanguageAlphabetLayers(kanaanithPages[1]?.language || {}).length,
      kanaanithLanguageSectionCount: kanaanithPages[1]?.language?.sections?.length || 0,
      kanaanithNameCounts: (kanaanithPages[2]?.nameList?.groups || []).map(group => group.names.length),
      kanaanithUniqueNameCounts: (kanaanithPages[2]?.nameList?.groups || []).map(group => new Set(group.names.map(name => name.toLocaleLowerCase('de'))).size),
      kanaanithNameStyle: kanaanithPages[2]?.nameList?.ornamentStyle || '',
      kanaanithNames: (kanaanithPages[2]?.nameList?.groups || []).flatMap(group => group.names),
      kanaanithScriptRowCount: kanaanithPages[3]?.scriptTable?.rows?.length || 0,
      kanaanithScriptSymbols: (kanaanithPages[3]?.scriptTable?.rows || []).map(row => row.symbol),
      kanaanithSyllableCount: kanaanithPages[3]?.scriptTable?.syllables?.length || 0,
      kanaanithScriptStyle: kanaanithPages[3]?.scriptTable?.scriptStyle || '',
      kanaanithImages: [
        kanaanith?.image,
        kanaanithPages[0]?.image,
        ...(kanaanithPages[1]?.language?.alphabetLayers || []).map(layer => layer.image)
      ].filter(Boolean),
      argentiFound: Boolean(argenti),
      argentiPageCount: argentiPages.length,
      argentiPageTypes: argentiPages.map(page => getModuleTemplateForPage(page)?.id || ''),
      argentiInfoCount: argentiPages[0]?.stats?.length || 0,
      argentiContext: (argentiPages[0]?.description || '') + ' ' + (argentiPages[1]?.language?.sections || []).map(section => section.text).join(' '),
      argentiLanguageSectionCount: argentiPages[1]?.language?.sections?.length || 0,
      argentiAlphabetImageCount: (argentiPages[1]?.language?.alphabetLayers || []).filter(layer => layer.image).length,
      argentiEntryHasImage: Boolean(argenti?.image || argentiPages.some(page => page.image)),
      argentiNameCounts: (argentiPages[2]?.nameList?.groups || []).map(group => group.names.length),
      argentiUniqueNameCounts: (argentiPages[2]?.nameList?.groups || []).map(group => new Set(group.names.map(name => name.toLocaleLowerCase('de'))).size),
      argentiNameGroups: (argentiPages[2]?.nameList?.groups || []).map(group => group.names),
      argentiNames: (argentiPages[2]?.nameList?.groups || []).flatMap(group => group.names),
      argentiNameStyle: argentiPages[2]?.nameList?.ornamentStyle || '',
      argentiScriptSymbols: (argentiPages[3]?.scriptTable?.rows || []).map(row => row.symbol),
      argentiSyllableCount: argentiPages[3]?.scriptTable?.syllables?.length || 0,
      argentiScriptStyle: argentiPages[3]?.scriptTable?.scriptStyle || '',
      argentiRenderCounts: getLanguageRenderCounts(argentiPages),
      stoicheiaFound: Boolean(stoicheia),
      stoicheiaPageCount: stoicheiaPages.length,
      stoicheiaPageTypes: stoicheiaPages.map(page => getModuleTemplateForPage(page)?.id || ''),
      stoicheiaInfoCount: stoicheiaPages[0]?.stats?.length || 0,
      stoicheiaContext: (stoicheiaPages[0]?.description || '') + ' ' + (stoicheiaPages[1]?.language?.sections || []).map(section => section.text).join(' '),
      stoicheiaLanguageSectionCount: stoicheiaPages[1]?.language?.sections?.length || 0,
      stoicheiaAlphabetImageCount: (stoicheiaPages[1]?.language?.alphabetLayers || []).filter(layer => layer.image).length,
      stoicheiaEntryHasImage: Boolean(stoicheia?.image || stoicheiaPages.some(page => page.image)),
      stoicheiaNameCounts: (stoicheiaPages[2]?.nameList?.groups || []).map(group => group.names.length),
      stoicheiaUniqueNameCounts: (stoicheiaPages[2]?.nameList?.groups || []).map(group => new Set(group.names.map(name => name.toLocaleLowerCase('de'))).size),
      stoicheiaNameGroups: (stoicheiaPages[2]?.nameList?.groups || []).map(group => group.names),
      stoicheiaNames: (stoicheiaPages[2]?.nameList?.groups || []).flatMap(group => group.names),
      stoicheiaNameStyle: stoicheiaPages[2]?.nameList?.ornamentStyle || '',
      stoicheiaScriptSymbols: (stoicheiaPages[3]?.scriptTable?.rows || []).map(row => row.symbol),
      stoicheiaSyllableCount: stoicheiaPages[3]?.scriptTable?.syllables?.length || 0,
      stoicheiaScriptStyle: stoicheiaPages[3]?.scriptTable?.scriptStyle || '',
      stoicheiaRenderCounts: getLanguageRenderCounts(stoicheiaPages)
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
      houseWarriors: { crest: 'data:image/png;base64,invalid' },
      biography: { connections: [{ image: 'data:image/png;base64,invalid' }] },
      goodsTable: { tables: [{ rows: [{ image: 'data:image/png;base64,invalid' }] }] },
      tradeCatalog: { items: [{ sealImage: 'data:image/png;base64,invalid' }] },
      mapTemplate: { tabs: [{ image: 'data:image/png;base64,invalid' }] },
      language: { alphabetLayers: [{ image: 'data:image/png;base64,invalid' }] }
    }, 0);
    return errors;
  })()
`, context);

if (!referenceChecks.customCategoryKept) failures.push('character-inventory: Benutzerdefinierte Kategorie ging verloren.');
if (!referenceChecks.customAssignmentKept) failures.push('character-inventory: Gueltige Kategoriezuordnung ging verloren.');
if (!referenceChecks.invalidAssignmentRepaired) failures.push('character-inventory: Verwaiste Kategoriezuordnung wurde nicht repariert.');
if (JSON.stringify(referenceChecks.familyParents) !== JSON.stringify(['parent'])) failures.push('family: Ungueltige Elternreferenzen wurden nicht entfernt.');
if (referenceChecks.familyConnectionCount !== 1) failures.push('family: Ungueltige Verbindungen wurden nicht entfernt.');
if (referenceChecks.familyV2SchemaVersion !== 2 || referenceChecks.familyV2PersonId !== 'v2-person' || referenceChecks.familyV2FocusId !== 'v2-person' || !referenceChecks.familyV2ExtensionKept || referenceChecks.familyV2LayoutMode !== 'depth') failures.push('family: Das versionierte v2-Dokument bleibt beim Sanitizen nicht vollstaendig erhalten.');
if (referenceChecks.familyV2DefaultSchemaVersion !== 2 || referenceChecks.familyV2DefaultPersonCount < 3 || !referenceChecks.familyV2DefaultEditorStructured) failures.push('family: Neue Family-Seiten starten nicht mit dem strukturierten v2-Editor.');
if (referenceChecks.hierarchyParents.some(Boolean)) failures.push('hierarchy: Ungueltige Baumreferenzen wurden nicht entfernt.');
if (referenceChecks.languageLayerCount !== 2 || referenceChecks.languageTabCount !== 2 || referenceChecks.languagePanelCount !== 2) failures.push('language: Alphabet-Ebenen werden nicht passend zu den hinterlegten Bildern gerendert.');
if (!referenceChecks.languageEmptySectionsKept) failures.push('language: Bewusst geleerte Textabschnitte wurden wiederhergestellt.');
if (!referenceChecks.rheunwaithFound) failures.push('rheunwaith: Fester Eintrag im Sprachen-Reiter fehlt.');
if (referenceChecks.rheunwaithPageCount !== 4) failures.push('rheunwaith: Das Modul besitzt nicht genau vier Seiten.');
if (JSON.stringify(referenceChecks.rheunwaithPageTypes) !== JSON.stringify(['story', 'language', 'name-list', 'script-table'])) failures.push(`rheunwaith: Erwartete Seitentypen story/language/name-list/script-table fehlen (${referenceChecks.rheunwaithPageTypes.join(', ')}).`);
if (referenceChecks.rheunwaithInfoCount !== 6) failures.push('rheunwaith: Die Story-Seite besitzt nicht genau sechs Infokarten.');
if (referenceChecks.rheunwaithVisibleLayers !== 2) failures.push('rheunwaith: Die beiden vorhandenen lokalen Alphabetbilder werden nicht als Ebenen erkannt.');
if (JSON.stringify(referenceChecks.rheunwaithNameCounts) !== JSON.stringify([200, 200])) failures.push(`rheunwaith: Erwartet werden je 200 Namen pro Geschlecht (${referenceChecks.rheunwaithNameCounts.join(', ')}).`);
if (JSON.stringify(referenceChecks.rheunwaithUniqueNameCounts) !== JSON.stringify([200, 200])) failures.push('rheunwaith: Die Namenslisten enthalten Duplikate.');
if (referenceChecks.rheunwaithScriptRowCount !== 30 || referenceChecks.rheunwaithScriptStyle !== 'rheunwaith') failures.push('rheunwaith: Die Zeichentabelle besitzt nicht 30 Rheunwaith-Zeichen.');
if (referenceChecks.rheunwaithSyllableCount < 1) failures.push('rheunwaith: Die ergänzende Silbentabelle fehlt.');
(referenceChecks.rheunwaithImages || []).forEach(image => {
  if (!fs.existsSync(path.resolve(almanachRoot, image))) failures.push(`rheunwaith: Lokales Bild fehlt (${image}).`);
});
if (!referenceChecks.oghamFound) failures.push('ogham: Fester Eintrag im Sprachen-Reiter fehlt.');
if (referenceChecks.oghamPageCount !== 4) failures.push('ogham: Das Modul besitzt nicht genau vier Seiten.');
if (JSON.stringify(referenceChecks.oghamPageTypes) !== JSON.stringify(['story', 'language', 'name-list', 'script-table'])) failures.push(`ogham: Erwartete Seitentypen story/language/name-list/script-table fehlen (${referenceChecks.oghamPageTypes.join(', ')}).`);
if (referenceChecks.oghamInfoCount !== 6) failures.push('ogham: Die Story-Seite besitzt nicht genau sechs Infokarten.');
if (referenceChecks.oghamAlphabetImageCount !== 0 || referenceChecks.oghamEntryHasImage) failures.push('ogham: Bildfelder sollten bis zur späteren Ergänzung leer bleiben.');
if (JSON.stringify(referenceChecks.oghamNameCounts) !== JSON.stringify([200, 200])) failures.push(`ogham: Erwartet werden je 200 Namen pro Geschlecht (${referenceChecks.oghamNameCounts.join(', ')}).`);
if (JSON.stringify(referenceChecks.oghamUniqueNameCounts) !== JSON.stringify([200, 200])) failures.push('ogham: Die Namenslisten enthalten Duplikate.');
if (referenceChecks.oghamOrnamentStyle !== 'ogham') failures.push('ogham: Die Namensverzierung verwendet nicht den Ogham-Stil.');
if (referenceChecks.oghamScriptRowCount !== 20 || referenceChecks.oghamScriptStyle !== 'ogham') failures.push('ogham: Die Zeichentabelle besitzt nicht 20 Ogham-Zeichen.');
if (referenceChecks.oghamSyllableCount < 1) failures.push('ogham: Die ergänzende Silbentabelle fehlt.');
if (!referenceChecks.karnrithFound) failures.push('karnrith: Fester Morgar-Eintrag im Sprachen-Reiter fehlt.');
if (referenceChecks.karnrithTitle !== 'Morgar' || !referenceChecks.karnrithNativeName.includes('Morgar') || !referenceChecks.karnrithNativeName.includes('Karnrith')) failures.push('karnrith: Sprache Morgar und Schrift Karnrith werden nicht eindeutig unterschieden.');
if (referenceChecks.karnrithPageCount !== 4) failures.push('karnrith: Das Modul besitzt nicht genau vier Seiten.');
if (JSON.stringify(referenceChecks.karnrithPageTypes) !== JSON.stringify(['story', 'language', 'name-list', 'script-table'])) failures.push(`karnrith: Erwartete Seitentypen story/language/name-list/script-table fehlen (${referenceChecks.karnrithPageTypes.join(', ')}).`);
if (referenceChecks.karnrithInfoCount !== 6) failures.push('karnrith: Die Story-Seite besitzt nicht genau sechs Infokarten.');
if (referenceChecks.karnrithVisibleLayers !== 2) failures.push('karnrith: Zeichentafel und Schriftprobe werden nicht als zwei sichtbare Ebenen erkannt.');
if (referenceChecks.karnrithLanguageSectionCount !== 8) failures.push(`karnrith: Die gründliche Sprachbeschreibung sollte acht Abschnitte besitzen (${referenceChecks.karnrithLanguageSectionCount}).`);
if (JSON.stringify(referenceChecks.karnrithNameCounts) !== JSON.stringify([200, 200])) failures.push(`karnrith: Erwartet werden je 200 Namen pro Geschlecht (${referenceChecks.karnrithNameCounts.join(', ')}).`);
if (JSON.stringify(referenceChecks.karnrithUniqueNameCounts) !== JSON.stringify([200, 200])) failures.push('karnrith: Die Namenslisten enthalten Duplikate.');
if (referenceChecks.karnrithNameStyle !== 'karnrith') failures.push('karnrith: Die Namensverzierung verwendet nicht den Karnrith-Stil.');
['Arkarn', 'Gortharn', 'Vetharn', 'Faurhelda', 'Gharthera'].forEach(name => {
  if (!referenceChecks.karnrithNames.includes(name)) failures.push(`karnrith: Kanonisch gebildeter Prüfnamens fehlt (${name}).`);
});
const expectedKarnrithSymbols = ['A', 'K', 'G', 'F', 'U', 'V', 'O', 'D', 'H', 'L', 'T', 'W', 'B', 'M', 'N', 'R', 'Y', 'NG', 'E', 'P', 'S', 'TH', 'KH', 'Z', 'I', 'GH', 'SH', 'CH', 'DH', 'Q'];
if (referenceChecks.karnrithScriptRowCount !== 30 || JSON.stringify(referenceChecks.karnrithScriptSymbols) !== JSON.stringify(expectedKarnrithSymbols) || referenceChecks.karnrithScriptStyle !== 'karnrith') failures.push('karnrith: Die Zeichentabelle entspricht nicht den 30 kanonischen Karnrith-Zeichen.');
if (referenceChecks.karnrithSyllableCount !== 39) failures.push(`karnrith: Präfixe, Suffixe und Vokalstufen sind unvollständig (${referenceChecks.karnrithSyllableCount}/39).`);
(referenceChecks.karnrithImages || []).forEach(image => {
  if (!fs.existsSync(path.resolve(almanachRoot, image))) failures.push(`karnrith: Lokales Bild fehlt (${image}).`);
});
if (!referenceChecks.infernalFound) failures.push('infernal: Fester Eintrag im Sprachen-Reiter fehlt.');
if (referenceChecks.infernalTitle !== 'Infernal' || !referenceChecks.infernalNativeName.includes('Infernal') || !referenceChecks.infernalNativeName.includes('Nharazim')) failures.push('infernal: Sprache Infernal und Schrift Nharazim werden nicht eindeutig unterschieden.');
if (!referenceChecks.infernalContext.includes('neun celestialen') || !referenceChecks.infernalContext.includes('fünf elementaren') || !referenceChecks.infernalContext.includes('machtvollste Mittel')) failures.push('infernal: Kosmische Gegenordnung und Vorrang als Kontaktsprache fehlen.');
if (referenceChecks.infernalPageCount !== 4) failures.push('infernal: Das Modul besitzt nicht genau vier Seiten.');
if (JSON.stringify(referenceChecks.infernalPageTypes) !== JSON.stringify(['story', 'language', 'name-list', 'script-table'])) failures.push(`infernal: Erwartete Seitentypen story/language/name-list/script-table fehlen (${referenceChecks.infernalPageTypes.join(', ')}).`);
if (referenceChecks.infernalInfoCount !== 6) failures.push('infernal: Die Story-Seite besitzt nicht genau sechs Infokarten.');
if (referenceChecks.infernalVisibleLayers !== 2) failures.push('infernal: Zeichentafel und Schriftprobe werden nicht als zwei sichtbare Ebenen erkannt.');
if (referenceChecks.infernalLanguageSectionCount !== 8) failures.push(`infernal: Die gründliche Sprachbeschreibung sollte acht Abschnitte besitzen (${referenceChecks.infernalLanguageSectionCount}).`);
if (JSON.stringify(referenceChecks.infernalNameCounts) !== JSON.stringify([200, 200])) failures.push(`infernal: Erwartet werden je 200 Namen pro Geschlecht (${referenceChecks.infernalNameCounts.join(', ')}).`);
if (JSON.stringify(referenceChecks.infernalUniqueNameCounts) !== JSON.stringify([200, 200])) failures.push('infernal: Die Namenslisten enthalten Duplikate.');
if (referenceChecks.infernalNameStyle !== 'infernal') failures.push('infernal: Die Namensverzierung verwendet nicht den Nharazim-Stil.');
['Ashrak', 'Belkhar', 'Gholira', 'Rhazor', 'Thurnara'].forEach(name => {
  if (!referenceChecks.infernalNames.includes(name)) failures.push(`infernal: Regelgebildeter Prüfname fehlt (${name}).`);
});
const expectedInfernalSymbols = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Ä', 'Ö', 'Ü', 'ß'];
if (referenceChecks.infernalScriptRowCount !== 30 || JSON.stringify(referenceChecks.infernalScriptSymbols) !== JSON.stringify(expectedInfernalSymbols) || referenceChecks.infernalScriptStyle !== 'infernal') failures.push('infernal: Die Zeichentabelle entspricht nicht den 30 kanonischen Nharazim-Sigillen.');
if (referenceChecks.infernalSyllableCount !== 28) failures.push(`infernal: Wirkungspräfixe, Rangendungen und Ritualketten sind unvollständig (${referenceChecks.infernalSyllableCount}/28).`);
(referenceChecks.infernalImages || []).forEach(image => {
  if (!fs.existsSync(path.resolve(almanachRoot, image))) failures.push(`infernal: Lokales Bild fehlt (${image}).`);
});
if (!referenceChecks.futharkFound) failures.push('futhark: Fester Eintrag im Sprachen-Reiter fehlt.');
if (referenceChecks.futharkPageCount !== 4) failures.push('futhark: Das Modul besitzt nicht genau vier Seiten.');
if (JSON.stringify(referenceChecks.futharkPageTypes) !== JSON.stringify(['story', 'language', 'name-list', 'script-table'])) failures.push(`futhark: Erwartete Seitentypen story/language/name-list/script-table fehlen (${referenceChecks.futharkPageTypes.join(', ')}).`);
if (referenceChecks.futharkInfoCount !== 6) failures.push('futhark: Die Story-Seite besitzt nicht genau sechs Infokarten.');
if (referenceChecks.futharkLanguageSectionCount !== 8) failures.push(`futhark: Die gründliche Sprachbeschreibung sollte acht Abschnitte besitzen (${referenceChecks.futharkLanguageSectionCount}).`);
if (!['Oghma', 'Eiris', 'Runor', 'Tyrdras'].every(term => referenceChecks.futharkContext.includes(term))) failures.push('futhark: Herkunft oder Zuordnung der drei Ættir ist unvollständig.');
if (referenceChecks.futharkAlphabetImageCount !== 0 || referenceChecks.futharkEntryHasImage) failures.push('futhark: Bildfelder sollten mangels lokaler Bildtafeln leer bleiben.');
if (JSON.stringify(referenceChecks.futharkNameCounts) !== JSON.stringify([200, 200])) failures.push(`futhark: Erwartet werden je 200 Namen pro Geschlecht (${referenceChecks.futharkNameCounts.join(', ')}).`);
if (JSON.stringify(referenceChecks.futharkUniqueNameCounts) !== JSON.stringify([200, 200])) failures.push('futhark: Die Namenslisten enthalten Duplikate.');
if (referenceChecks.futharkNameStyle !== 'futhark') failures.push('futhark: Die Namensverzierung verwendet nicht den Futhark-Stil.');
['Fehar', 'Sigurd', 'Soladis', 'Tiwahild', 'Lagaruna'].forEach(name => {
  if (!referenceChecks.futharkNames.includes(name)) failures.push(`futhark: Regelgebildeter Prüfname fehlt (${name}).`);
});
const expectedFutharkSymbols = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];
if (referenceChecks.futharkScriptRowCount !== 24 || JSON.stringify(referenceChecks.futharkScriptSymbols) !== JSON.stringify(expectedFutharkSymbols) || referenceChecks.futharkScriptStyle !== 'futhark') failures.push('futhark: Die Zeichentabelle entspricht nicht den 24 Runen des älteren Futhark.');
if (referenceChecks.futharkSyllableCount !== 28) failures.push(`futhark: Namensendungen und Runenbindungen sind unvollständig (${referenceChecks.futharkSyllableCount}/28).`);
if (!referenceChecks.kanaanithFound) failures.push('kanaanith: Fester Eintrag im Sprachen-Reiter fehlt.');
if (referenceChecks.kanaanithPageCount !== 4) failures.push('kanaanith: Das Modul besitzt nicht genau vier Seiten.');
if (JSON.stringify(referenceChecks.kanaanithPageTypes) !== JSON.stringify(['story', 'language', 'name-list', 'script-table'])) failures.push(`kanaanith: Erwartete Seitentypen story/language/name-list/script-table fehlen (${referenceChecks.kanaanithPageTypes.join(', ')}).`);
if (referenceChecks.kanaanithInfoCount !== 6) failures.push('kanaanith: Die Story-Seite besitzt nicht genau sechs Infokarten.');
if (referenceChecks.kanaanithLanguageSectionCount !== 8) failures.push(`kanaanith: Die gründliche Sprachbeschreibung sollte acht Abschnitte besitzen (${referenceChecks.kanaanithLanguageSectionCount}).`);
if (!referenceChecks.kanaanithContext.includes('Südost-Tirnara') || !referenceChecks.kanaanithContext.includes('Ogham') || !referenceChecks.kanaanithWritingDirection.includes('rechts nach links')) failures.push('kanaanith: Herkunft, Region oder RTL-Schreibrichtung ist unvollständig.');
if (referenceChecks.kanaanithVisibleLayers !== 2) failures.push('kanaanith: Zeichentafel und Schriftprobe werden nicht als zwei sichtbare Ebenen erkannt.');
if (JSON.stringify(referenceChecks.kanaanithNameCounts) !== JSON.stringify([200, 200])) failures.push(`kanaanith: Erwartet werden je 200 Namen pro Geschlecht (${referenceChecks.kanaanithNameCounts.join(', ')}).`);
if (JSON.stringify(referenceChecks.kanaanithUniqueNameCounts) !== JSON.stringify([200, 200])) failures.push('kanaanith: Die Namenslisten enthalten Duplikate.');
if (referenceChecks.kanaanithNameStyle !== 'kanaanith') failures.push('kanaanith: Die Namensverzierung verwendet nicht den Kana’anith-Stil.');
['Arubar', 'Betizan', 'Gamumer', 'Arugama', 'Reshumera'].forEach(name => {
  if (!referenceChecks.kanaanithNames.includes(name)) failures.push(`kanaanith: Kanonisch belegter Prüfname fehlt (${name}).`);
});
const expectedKanaanithSymbols = Array.from({ length: 22 }, (_, index) => String.fromCodePoint(0x10900 + index));
if (referenceChecks.kanaanithScriptRowCount !== 22 || JSON.stringify(referenceChecks.kanaanithScriptSymbols) !== JSON.stringify(expectedKanaanithSymbols) || referenceChecks.kanaanithScriptStyle !== 'kanaanith') failures.push('kanaanith: Die Zeichentabelle entspricht nicht den 22 kanonischen RTL-Zeichen.');
if (referenceChecks.kanaanithSyllableCount !== 38) failures.push(`kanaanith: Präfixe, Suffixe und Vokalmuster sind unvollständig (${referenceChecks.kanaanithSyllableCount}/38).`);
(referenceChecks.kanaanithImages || []).forEach(image => {
  if (!fs.existsSync(path.resolve(almanachRoot, image))) failures.push(`kanaanith: Lokales Bild fehlt (${image}).`);
});
const kanaanithDataPath = path.resolve(almanachRoot, '../Fonts/Kanaanith-Gesamtpaket-1.000/Daten/Kanaanith_Daten.json');
if (!fs.existsSync(kanaanithDataPath)) {
  failures.push('kanaanith: Strukturierte kanonische Sprachdaten fehlen.');
} else {
  const canonicalKanaanith = JSON.parse(fs.readFileSync(kanaanithDataPath, 'utf8'));
  const renderedKanaanithNames = new Set(referenceChecks.kanaanithNames.map(name => name.toLocaleLowerCase('de')));
  [...canonicalKanaanith.male_names, ...canonicalKanaanith.female_names].forEach(record => {
    if (!renderedKanaanithNames.has(record.name.toLocaleLowerCase('de'))) failures.push(`kanaanith: Dokumentierter Name fehlt in der erweiterten Liste (${record.name}).`);
  });
}

function validatePackagedLanguage({
  id,
  checks,
  contextTerms,
  style,
  syllableCount,
  dataPath,
  maleKey,
  femaleKey
}) {
  if (!checks.found) failures.push(`${id}: Fester Eintrag im Sprachen-Reiter fehlt.`);
  if (checks.pageCount !== 4) failures.push(`${id}: Das Modul besitzt nicht genau vier Seiten.`);
  if (JSON.stringify(checks.pageTypes) !== JSON.stringify(['story', 'language', 'name-list', 'script-table'])) failures.push(`${id}: Erwartete Seitentypen story/language/name-list/script-table fehlen (${checks.pageTypes.join(', ')}).`);
  if (checks.infoCount !== 6) failures.push(`${id}: Die Story-Seite besitzt nicht genau sechs Infokarten.`);
  if (checks.sectionCount !== 8) failures.push(`${id}: Die gründliche Sprachbeschreibung sollte acht Abschnitte besitzen (${checks.sectionCount}).`);
  if (!contextTerms.every(term => checks.context.includes(term))) failures.push(`${id}: Kanonischer Sprach- oder Kulturkontext ist unvollständig.`);
  if (checks.imageCount !== 0 || checks.hasImage) failures.push(`${id}: Bildfelder sollten mangels lokaler Bildtafeln leer bleiben.`);
  if (JSON.stringify(checks.nameCounts) !== JSON.stringify([200, 200])) failures.push(`${id}: Erwartet werden je 200 Namen pro Geschlecht (${checks.nameCounts.join(', ')}).`);
  if (JSON.stringify(checks.uniqueNameCounts) !== JSON.stringify([200, 200])) failures.push(`${id}: Die Namenslisten enthalten Duplikate.`);
  if (checks.nameStyle !== style || checks.scriptStyle !== style) failures.push(`${id}: Namens- oder Schrifttabellenstil ist nicht ${style}.`);
  if (checks.syllableCount !== syllableCount) failures.push(`${id}: Kraftsilben und Formenlehre sind unvollständig (${checks.syllableCount}/${syllableCount}).`);
  if (checks.renderCounts.languageMetaRows !== 5 || checks.renderCounts.names !== 400 || checks.renderCounts.symbols !== checks.scriptSymbols.length || !checks.renderCounts.stylePresent || !checks.renderCounts.syllableTablePresent) failures.push(`${id}: Sprache, Namenslisten oder Schrifttabelle werden nicht vollständig gerendert.`);
  if (!fs.existsSync(dataPath)) {
    failures.push(`${id}: Strukturiertes kanonisches Gesamtpaket fehlt.`);
    return;
  }
  const canonical = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const expectedSymbols = canonical.alphabet.map(row => row[0]);
  if (JSON.stringify(checks.scriptSymbols) !== JSON.stringify(expectedSymbols)) failures.push(`${id}: Die Zeichentabelle entspricht nicht dem kanonischen Alphabet.`);
  const renderedNames = new Set(checks.names.map(name => name.toLocaleLowerCase('de')));
  [...canonical[maleKey], ...canonical[femaleKey]].forEach(record => {
    if (!renderedNames.has(record[0].toLocaleLowerCase('de'))) failures.push(`${id}: Dokumentierter Name fehlt in der erweiterten Liste (${record[0]}).`);
  });
  const canonicalMaleNames = canonical[maleKey].map(record => record[0]);
  const canonicalFemaleNames = canonical[femaleKey].map(record => record[0]);
  if (JSON.stringify(checks.nameGroups[0]?.slice(0, canonicalMaleNames.length)) !== JSON.stringify(canonicalMaleNames)) failures.push(`${id}: Die kanonischen männlichen Namen stehen nicht unverändert am Anfang der Liste.`);
  if (JSON.stringify(checks.nameGroups[1]?.slice(0, canonicalFemaleNames.length)) !== JSON.stringify(canonicalFemaleNames)) failures.push(`${id}: Die kanonischen weiblichen Namen stehen nicht unverändert am Anfang der Liste.`);
}

validatePackagedLanguage({
  id: 'lingua-argenti',
  checks: {
    found: referenceChecks.argentiFound,
    pageCount: referenceChecks.argentiPageCount,
    pageTypes: referenceChecks.argentiPageTypes,
    infoCount: referenceChecks.argentiInfoCount,
    sectionCount: referenceChecks.argentiLanguageSectionCount,
    context: referenceChecks.argentiContext,
    imageCount: referenceChecks.argentiAlphabetImageCount,
    hasImage: referenceChecks.argentiEntryHasImage,
    nameCounts: referenceChecks.argentiNameCounts,
    uniqueNameCounts: referenceChecks.argentiUniqueNameCounts,
    nameGroups: referenceChecks.argentiNameGroups,
    names: referenceChecks.argentiNames,
    nameStyle: referenceChecks.argentiNameStyle,
    scriptSymbols: referenceChecks.argentiScriptSymbols,
    syllableCount: referenceChecks.argentiSyllableCount,
    scriptStyle: referenceChecks.argentiScriptStyle,
    renderCounts: referenceChecks.argentiRenderCounts
  },
  contextTerms: ['Kana’anith', 'Stoicheia', '23 Litterae', 'Kraftsilben'],
  style: 'argenti',
  syllableCount: 56,
  dataPath: path.resolve(almanachRoot, '../Fonts/Lingua-Argenti-Gesamtpaket-1.000/Daten/Lingua_Argenti_Daten_1.0.json'),
  maleKey: 'namen_maennlich',
  femaleKey: 'namen_weiblich'
});

validatePackagedLanguage({
  id: 'stoicheia',
  checks: {
    found: referenceChecks.stoicheiaFound,
    pageCount: referenceChecks.stoicheiaPageCount,
    pageTypes: referenceChecks.stoicheiaPageTypes,
    infoCount: referenceChecks.stoicheiaInfoCount,
    sectionCount: referenceChecks.stoicheiaLanguageSectionCount,
    context: referenceChecks.stoicheiaContext,
    imageCount: referenceChecks.stoicheiaAlphabetImageCount,
    hasImage: referenceChecks.stoicheiaEntryHasImage,
    nameCounts: referenceChecks.stoicheiaNameCounts,
    uniqueNameCounts: referenceChecks.stoicheiaUniqueNameCounts,
    nameGroups: referenceChecks.stoicheiaNameGroups,
    names: referenceChecks.stoicheiaNames,
    nameStyle: referenceChecks.stoicheiaNameStyle,
    scriptSymbols: referenceChecks.stoicheiaScriptSymbols,
    syllableCount: referenceChecks.stoicheiaSyllableCount,
    scriptStyle: referenceChecks.stoicheiaScriptStyle,
    renderCounts: referenceChecks.stoicheiaRenderCounts
  },
  contextTerms: ['Kana’anith', 'Athara', 'vierundzwanzig Zeichen', 'Rhemata'],
  style: 'stoicheia',
  syllableCount: 61,
  dataPath: path.resolve(almanachRoot, '../Fonts/Stoicheia-Gesamtpaket-1.000/Daten/Stoicheia_Daten_1.0.json'),
  maleKey: 'namen_maennlich',
  femaleKey: 'namen_weiblich'
});

[
  '../Fonts/Rheunwaith-Font-1.000/Web/Rheunwaith-Regular.woff2',
  '../Fonts/Noto-Historic-Scripts/NotoSansOgham-Regular.ttf',
  '../Fonts/Karnrith-Font-2.000/Web/KarnrithHochschnitt-Regular.woff2',
  '../Fonts/Infernal-Font-1.000/Web/Nharazim-Regular.woff2',
  '../Fonts/Noto-Historic-Scripts/NotoSansRunic-Regular.ttf',
  '../Fonts/Kanaanith-Gesamtpaket-1.000/Web/KanaanithMonumental-Regular.woff2',
  '../Fonts/Lingua-Argenti-Gesamtpaket-1.000/Fonts/LinguaArgentiMonumental-Regular.woff2',
  '../Fonts/Stoicheia-Gesamtpaket-1.000/Fonts/StoicheiaPolis-Regular.woff2'
].forEach(fontPath => {
  if (!fs.existsSync(path.resolve(almanachRoot, fontPath))) failures.push(`Schrifttabelle: Font fehlt (${fontPath}).`);
});
['Kopfgeldakte Portrait', 'Gerichtsakte Beteiligter', 'Familie 1.1', 'Hauswappen', 'Hauskrieger Wappen', 'Biografieverbindung', 'Warentabelle', 'Handelsgut', 'Kartenreiter', 'Sprache Alphabet']
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
