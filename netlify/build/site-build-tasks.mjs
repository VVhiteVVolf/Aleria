const testCommand = (...files) => ['--test', '--experimental-test-isolation=none', ...files];
const almanach = name => `AleriaAlmanach/tests/${name}.test.mjs`;

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
      'AleriaAlmanach/package.json', 'AleriaAlmanach/package-lock.json',
      'netlify/functions/', 'netlify/lib/', 'firebase/tests/publisher-access.test.mjs'],
    commands: [testCommand(...[
      'firebase-auth-session', 'firebase-account-actions', 'email-action-controller',
      'comment-activity-repository', 'comment-read-reuse', 'dashboard-scene-activity',
      'archive-image-urls', 'archive-preview-navigation', 'dashboard-rendering',
      'firebase-module-storage', 'module-store-revision', 'loading-screen'
    ].map(almanach), 'firebase/tests/publisher-access.test.mjs')]
  },
  {
    id: 'gameplay-guides', label: 'Gameplay guide consistency',
    // These feature boundaries are checked against actual Node imports by the
    // dependency audit, including dynamically loaded editorial modules.
    inputs: ['Gameplay Guide/', 'CharakterDatenbank/generated/characters.snapshot.json',
      'AleriaAlmanach/package.json', 'Stammbäume/assets/js/', 'Stammbäume/assets/data/family-sources/',
      'Familien Häuser und Clans/', 'Bestiarium/modules/',
      ...['character-equipment', 'characters', 'classes', 'combat', 'combat-critical',
        'combat-status', 'combat-styles', 'creatures', 'herausforderung', 'image-library',
        'krumme-kanne', 'scene-items', 'scene-rest', 'spell-catalog']
        .map(feature => `AleriaAlmanach/modules/${feature}/`)],
    excludes: ['Gameplay Guide/assets/'],
    commands: [['netlify/build/verify-task-inputs.mjs', 'gameplay-guides'],
      ['Gameplay Guide/scripts/build-guides.mjs', '--check']]
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
    id: 'regional-equipment', label: 'Regional equipment and item register',
    inputs: ['AleriaAlmanach/modules/regional-equipment/', 'AleriaAlmanach/modules/item-register/',
      'AleriaAlmanach/public/assets/regional-equipment/', 'Stammbäume/assets/js/',
      'Stammbäume/assets/data/family-sources/', 'Familien Häuser und Clans/',
      'AleriaAlmanach/modules/krumme-kanne/krumme-kanne-roster.mjs',
      'AleriaAlmanach/scripts/build-regional-equipment.mjs', almanach('regional-equipment')],
    commands: [testCommand(almanach('regional-equipment'))]
  },
  {
    id: 'family-charts', label: 'Family chart release and browser geometry',
    inputs: ['Stammbäume/assets/js/', 'Stammbäume/assets/css/', 'Stammbäume/assets/data/',
      'Stammbäume/vendor/', 'Stammbäume/tests/', 'Stammbäume/tools/',
      'Stammbäume/Stammbaum.html', 'Stammbäume/index.html',
      'Stammbäume/package.json', 'Stammbäume/package-lock.json', 'Familien Häuser und Clans/',
      'AleriaAlmanach/package.json', 'AleriaAlmanach/modules/krumme-kanne/krumme-kanne-roster.mjs'],
    excludes: ['Stammbäume/assets/data/published-families/backups/'],
    commands: [['netlify/build/verify-task-inputs.mjs', 'family-charts'],
      ['Stammbäume/tools/check-release.mjs', '--prepare-browser']]
  }
];

export const SHARED_BUILD_INPUTS = ['netlify/build/', 'netlify/tests/', 'netlify.toml',
  '.gitignore', '.gitattributes', '.nvmrc', '.node-version', 'shared/', 'modules/', 'js/', 'css/'];
