const testCommand = (...files) => ['--test', '--experimental-test-isolation=none', ...files];
const almanach = name => `AleriaAlmanach/tests/${name}.test.mjs`;
const gwynthorFamilyInputs = [
  'AleriaAlmanach/modules/gwynthor-bathhouse/bathhouse-people.mjs',
  'AleriaAlmanach/modules/kleiner-durst/durst-people.mjs',
  'AleriaAlmanach/modules/rotes-tor/penrudd-household.mjs',
  'AleriaAlmanach/modules/rotes-tor/penrudd-appearances.mjs',
  'AleriaAlmanach/modules/pendrwn-general-store/store-people.mjs',
  'AleriaAlmanach/modules/gwregysdu-harbor/',
  'AleriaAlmanach/modules/gestiefelte-muschi/muschi-people.mjs',
  'AleriaAlmanach/modules/letzter-heller/heller-people.mjs',
  'AleriaAlmanach/modules/cneacail-family/',
  'AleriaAlmanach/modules/klingende-muenze-gwynthor/',
  'AleriaAlmanach/modules/guild-trading-post/',
  'AleriaAlmanach/modules/markt-der-fortuna-gwynthor/'
];

// Keep calculation checks tied to their sources, rather than every UI or combat
// change in the Almanach. Add new priced venue features alongside their loader.
const economySourceInputs = [
  'economy-calculator', 'economy-pricing', 'item-register', 'trade-catalog', 'gwynthor-geography',
  'kleiner-durst', 'krumme-kanne', 'letzte-rast', 'goettliche-eleganz',
  'pendrwn-general-store', 'gwynthor-bathhouse', 'gestiefelte-muschi',
  'letzter-heller', 'gofrann-schmiede', 'klingende-krone', 'lachende-nixe',
  'gortach-brauerei', 'brewer-guilds', 'gwregysdu-harbor', 'windreiter'
].map(feature => `AleriaAlmanach/modules/${feature}/`);

// Inputs include cross-feature dependencies. Images do not affect the chart audit,
// which deliberately blocks image requests, but CSS, vendor code and family data do.
export const SITE_BUILD_TASKS = [
  {
    id: 'build-policy', label: 'Build selection and publication policy', always: true,
    inputs: ['netlify/build/', 'netlify/tests/'],
    commands: [testCommand('netlify/tests/site-build.test.mjs')]
  },
  {
    id: 'regional-catalog', label: 'Generate regional equipment catalog', always: true,
    inputs: ['AleriaAlmanach/scripts/build-regional-equipment.mjs'],
    commands: [['AleriaAlmanach/scripts/build-regional-equipment.mjs']]
  },
  {
    id: 'map-media', label: 'Generate map media index', always: true,
    inputs: ['Karten/tools/build-media-library.mjs'], commands: [['Karten/tools/build-media-library.mjs']]
  },
  {
    id: 'almanach-runtime', label: 'Archive, authentication and module storage',
    inputs: ['AleriaAlmanach/modules/', 'AleriaAlmanach/tests/',
      'AleriaAlmanach/app.js', 'AleriaAlmanach/firebase.js', 'AleriaAlmanach/AleriaAlmanach.html',
      'AleriaAlmanach/scripts/build-gwynthor-geography.mjs',
      'AleriaAlmanach/package.json', 'AleriaAlmanach/package-lock.json',
      'netlify/functions/', 'netlify/lib/', 'firebase/tests/publisher-access.test.mjs'],
    commands: [['AleriaAlmanach/scripts/build-gwynthor-geography.mjs', '--check'], testCommand(...[
      'firebase-auth-session', 'firebase-account-actions', 'email-action-controller',
      'comment-activity-repository', 'comment-read-reuse', 'dashboard-scene-activity',
      'archive-image-urls', 'archive-preview-navigation', 'gwynthor-geography', 'dashboard-rendering', 'rotes-tor-menu',
      'firebase-module-storage', 'module-store-revision', 'loading-screen',
      'character-performance', 'character-section-integration', 'character-save-guard',
      'character-register-views', 'character-equipment-sync'
    ].map(almanach), 'firebase/tests/publisher-access.test.mjs')]
  },
  {
    id: 'economy-calculator', label: 'Price review and calculations for purchasable cultural locations',
    inputs: [...economySourceInputs, 'Markt/', 'AleriaAlmanach/docs/economy/',
      'AleriaAlmanach/modules/core/aleria-calendar.js', 'AleriaAlmanach/modules/core/app-core.js',
      'AleriaAlmanach/modules/module-store/module-entry-migrations.js', 'AleriaAlmanach/modules/modal/modal-controller.js',
      'AleriaAlmanach/modules/module-editor/', 'AleriaAlmanach/modules/inline-editor/',
      'firebase/functions/src/generated/item-register/', 'firebase/functions/src/generated/economy-pricing/',
      'AleriaAlmanach/scripts/build-economy-calculator.mjs',
      'AleriaAlmanach/scripts/build-economy-price-reference.mjs', 'AleriaAlmanach/scripts/build-economy-price-review.mjs',
      'AleriaAlmanach/tests/economy-calculator.test.mjs', 'AleriaAlmanach/tests/economy-price-review.test.mjs', 'AleriaAlmanach/AleriaAlmanach.html'],
    commands: [['AleriaAlmanach/scripts/build-economy-price-reference.mjs', '--check'], ['AleriaAlmanach/scripts/build-economy-price-review.mjs', '--check'],
      ['AleriaAlmanach/scripts/build-economy-calculator.mjs', '--check'], testCommand(almanach('economy-calculator'), almanach('economy-price-review')),
      ['AleriaAlmanach/scripts/check-module-template-assets.js'], ['AleriaAlmanach/scripts/check-module-template-roundtrip.js']]
  },
  {
    id: 'gameplay-guides', label: 'Gameplay guide consistency',
    // These feature boundaries are checked against actual Node imports by the
    // dependency audit, including dynamically loaded editorial modules.
    inputs: ['Gameplay Guide/', 'CharakterDatenbank/generated/characters.snapshot.json',
      'AleriaAlmanach/package.json', 'Stammbäume/assets/js/', 'Stammbäume/assets/data/family-sources/',
      'Familien Häuser und Clans/', 'Bestiarium/modules/', ...gwynthorFamilyInputs,
      ...['character-equipment', 'characters', 'classes', 'combat', 'combat-critical',
        'combat-status', 'combat-styles', 'creatures', 'herausforderung', 'image-library',
        'krumme-kanne', 'goettliche-eleganz', 'lachende-nixe', 'gofrann-schmiede', 'letzte-rast', 'scene-items', 'scene-rest', 'spell-catalog']
        .map(feature => `AleriaAlmanach/modules/${feature}/`)],
    excludes: ['Gameplay Guide/assets/'],
    commands: [['netlify/build/verify-task-inputs.mjs', 'gameplay-guides'],
      ['Gameplay Guide/scripts/build-guides.mjs', '--check']]
  },
  {
    id: 'gwregysdu-harbor', label: 'Gwregysdu harbor module and family identities',
    inputs: ['AleriaAlmanach/modules/gwregysdu-harbor/', 'AleriaAlmanach/assets/gwregysdu-harbor/',
      'AleriaAlmanach/scripts/build-gwregysdu-harbor.mjs', 'Stammbäume/assets/js/',
      'Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Gwregysdu.png',
      almanach('gwregysdu-harbor')],
    commands: [['AleriaAlmanach/scripts/build-gwregysdu-harbor.mjs', '--check'],
      testCommand(almanach('gwregysdu-harbor'))]
  },
  {
    id: 'gestiefelte-muschi', label: 'Helvianes entertainment house and Brevanor heraldry',
    inputs: ['AleriaAlmanach/modules/gestiefelte-muschi/', 'AleriaAlmanach/assets/gestiefelte-muschi/',
      'AleriaAlmanach/scripts/build-gestiefelte-muschi.mjs', 'AleriaAlmanach/modules/brewer-guilds/',
      'AleriaAlmanach/modules/trade-catalog/', 'AleriaAlmanach/modules/item-register/',
      'AleriaAlmanach/modules/guest-register/', 'AleriaAlmanach/modules/character-genealogy/',
      'AleriaAlmanach/modules/creatures/', ...gwynthorFamilyInputs, 'Stammbäume/assets/js/',
      'Stammbäume/assets/images/houses/Brevanor/', almanach('gestiefelte-muschi')],
    commands: [['AleriaAlmanach/scripts/build-gestiefelte-muschi.mjs', '--check'], testCommand(almanach('gestiefelte-muschi'))]
  },
  {
    id: 'letzter-heller', label: 'Cneacail family, shabby tavern and unavailable historic beers',
    inputs: ['AleriaAlmanach/modules/letzter-heller/', 'AleriaAlmanach/assets/letzter-heller/',
      'AleriaAlmanach/scripts/build-letzter-heller.mjs', 'AleriaAlmanach/modules/trade-catalog/',
      'AleriaAlmanach/modules/item-register/', 'AleriaAlmanach/modules/module-editor/',
      'AleriaAlmanach/modules/character-genealogy/', 'AleriaAlmanach/modules/creatures/',
      'AleriaAlmanach/styles/module-page-trade-catalog.css', ...gwynthorFamilyInputs,
      'Stammbäume/assets/js/', 'Stammbäume/assets/images/houses/Ceitheach/sept-cneacail.png',
      almanach('letzter-heller'), almanach('trade-catalog-pricing')],
    commands: [['AleriaAlmanach/scripts/build-letzter-heller.mjs', '--check'], testCommand(almanach('letzter-heller'), almanach('trade-catalog-pricing'))]
  },
  {
    id: 'markt-der-fortuna-gwynthor', label: 'Fortuna families, banking, blue company and Tafel der Mutter',
    inputs: ['AleriaAlmanach/modules/markt-der-fortuna-gwynthor/', 'AleriaAlmanach/modules/guild-trading-post/',
      'AleriaAlmanach/assets/markt-der-fortuna-gwynthor/', 'AleriaAlmanach/scripts/build-markt-der-fortuna-gwynthor.mjs',
      'AleriaAlmanach/modules/archive/archive-section-registration.mjs', 'AleriaAlmanach/modules/letzte-rast/',
      'AleriaAlmanach/modules/goettliche-eleganz/', 'AleriaAlmanach/modules/pendrwn-general-store/',
      'AleriaAlmanach/tests/markt-der-fortuna-gwynthor.test.mjs', 'Fraktionen/data/gilden.json',
      'Stammbäume/assets/js/', 'Stammbäume/tools/publish-family-snapshots.mjs',
      'Stammbäume/assets/data/published-families/haus-aelmor.json', 'Stammbäume/assets/data/published-families/registry.json',
      'Familien Häuser und Clans/', 'AleriaAlmanach/AleriaAlmanach.html'],
    commands: [['AleriaAlmanach/scripts/build-markt-der-fortuna-gwynthor.mjs', '--check'], testCommand(almanach('markt-der-fortuna-gwynthor'))]
  },
  {
    id: 'klingende-muenze-gwynthor', label: 'Gwynthor trading post, three guilds and member placement',
    inputs: ['AleriaAlmanach/modules/klingende-muenze-gwynthor/', 'AleriaAlmanach/assets/klingende-muenze-gwynthor/',
      'AleriaAlmanach/scripts/build-klingende-muenze-gwynthor.mjs', 'AleriaAlmanach/modules/archive/archive-section-registration.mjs',
      'AleriaAlmanach/modules/klingende-krone/', 'AleriaAlmanach/modules/lachende-nixe/',
      'AleriaAlmanach/modules/letzter-heller/', ...gwynthorFamilyInputs,
      'AleriaAlmanach/modules/creatures/', 'AleriaAlmanach/tests/klingende-muenze-gwynthor.test.mjs',
      'Fraktionen/data/gilden.json', 'Fraktionen/assets/emblems/gilden/', 'Stammbäume/assets/js/',
      'AleriaAlmanach/AleriaAlmanach.html'],
    commands: [['AleriaAlmanach/scripts/build-klingende-muenze-gwynthor.mjs', '--check'], testCommand(almanach('klingende-muenze-gwynthor'))]
  },
  {
    id: 'klingende-krone', label: 'Finlays guild brewery and the expanded Cneacail genealogy',
    inputs: ['AleriaAlmanach/modules/klingende-krone/', 'AleriaAlmanach/assets/klingende-krone/',
      'AleriaAlmanach/scripts/build-klingende-krone.mjs', 'AleriaAlmanach/modules/letzter-heller/',
      'AleriaAlmanach/modules/trade-catalog/', 'AleriaAlmanach/modules/item-register/',
      'AleriaAlmanach/modules/character-genealogy/', 'AleriaAlmanach/modules/creatures/',
      'AleriaAlmanach/modules/comann-braich-alba/', ...gwynthorFamilyInputs,
      'Stammbäume/assets/js/', almanach('klingende-krone')],
    commands: [['AleriaAlmanach/scripts/build-klingende-krone.mjs', '--check'], testCommand(almanach('klingende-krone'))]
  },
  {
    id: 'natural-resources', label: 'Natural resource catalog and artwork',
    inputs: ['AleriaAlmanach/modules/natural-resources/',
      'AleriaAlmanach/modules/archive/archive-section-registration.mjs',
      'AleriaAlmanach/modules/module-editor/module-editor-data.js',
      'AleriaAlmanach/public/assets/natural-resources/',
      'IconOrdner/ReiterIcons/Weltpfade/natuerliche-rohstoffe.png',
      'AleriaAlmanach/scripts/build-natural-resources.mjs', almanach('natural-resources')],
    commands: [['AleriaAlmanach/scripts/build-natural-resources.mjs', '--check'],
      testCommand(almanach('natural-resources'))]
  },
  {
    id: 'skalli-retinue', label: 'Skallis Gefolge and group classification',
    inputs: ['AleriaAlmanach/modules/skalli-retinue/', 'AleriaAlmanach/modules/landing/',
      'AleriaAlmanach/package.json', 'AleriaAlmanach/package-lock.json',
      'AleriaAlmanach/modules/character-genealogy/', 'AleriaAlmanach/modules/module-store/',
      'AleriaAlmanach/modules/archive/archive-section-registration.mjs',
      'AleriaAlmanach/modules/module-editor/module-editor-data.js', 'Stammbäume/assets/js/',
      'Stammbäume/assets/images/portraits/haus-baerenherz/', 'Stammbäume/assets/images/portraits/haus-rotstahl/',
      'Stammbäume/assets/images/portraits/haus-unholdbann/', 'Stammbäume/assets/images/portraits/haus-eisenjungfer/',
      'AleriaAlmanach/public/assets/skalli-retinue/',
      'AleriaAlmanach/scripts/build-skalli-retinue.mjs', 'AleriaAlmanach/scripts/build-group-section-migration.mjs',
      almanach('skalli-retinue'), almanach('group-section-migration')],
    commands: [['AleriaAlmanach/scripts/build-skalli-retinue.mjs', '--check'],
      ['AleriaAlmanach/scripts/build-group-section-migration.mjs', '--prepare', '--check'],
      testCommand(almanach('skalli-retinue'), almanach('group-section-migration'))]
  },
  {
    id: 'regional-equipment', label: 'Regional equipment and item register',
    inputs: ['AleriaAlmanach/modules/regional-equipment/', 'AleriaAlmanach/modules/item-register/',
      'AleriaAlmanach/public/assets/regional-equipment/', 'Stammbäume/assets/js/',
      'Stammbäume/assets/data/family-sources/', 'Familien Häuser und Clans/',
      'AleriaAlmanach/modules/krumme-kanne/krumme-kanne-roster.mjs',
      'AleriaAlmanach/modules/gofrann-schmiede/', 'AleriaAlmanach/modules/letzte-rast/',
      'AleriaAlmanach/modules/goettliche-eleganz/eleganz-family-people.mjs',
      'AleriaAlmanach/modules/lachende-nixe/nixe-family-people.mjs', ...gwynthorFamilyInputs,
      'AleriaAlmanach/scripts/build-regional-equipment.mjs', almanach('regional-equipment')],
    commands: [testCommand(almanach('regional-equipment'))]
  },
  {
    id: 'family-charts', label: 'Family chart release and browser geometry',
    inputs: ['Stammbäume/assets/js/', 'Stammbäume/assets/css/', 'Stammbäume/assets/data/',
      'Stammbäume/vendor/', 'Stammbäume/tests/', 'Stammbäume/tools/',
      'Stammbäume/Stammbaum.html', 'Stammbäume/index.html',
      'Stammbäume/package.json', 'Stammbäume/package-lock.json', 'Familien Häuser und Clans/',
      'AleriaAlmanach/package.json', 'AleriaAlmanach/modules/krumme-kanne/krumme-kanne-roster.mjs',
      'AleriaAlmanach/modules/gofrann-schmiede/', 'AleriaAlmanach/modules/letzte-rast/',
      'AleriaAlmanach/modules/goettliche-eleganz/eleganz-family-people.mjs',
      'AleriaAlmanach/modules/lachende-nixe/nixe-family-people.mjs', ...gwynthorFamilyInputs],
    excludes: ['Stammbäume/assets/data/published-families/backups/'],
    commands: [['netlify/build/verify-task-inputs.mjs', 'family-charts'],
      ['Stammbäume/tools/check-release.mjs', '--prepare-browser']]
  }
];

export const SHARED_BUILD_INPUTS = ['netlify/build/', 'netlify/tests/', 'netlify.toml',
  '.gitignore', '.gitattributes', '.nvmrc', '.node-version', 'shared/', 'modules/', 'js/', 'css/'];
