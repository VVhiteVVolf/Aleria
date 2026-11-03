import { CHARACTER_CULTURAL_ORIGINS } from '../../AleriaAlmanach/modules/character-origins/cultural-origin-catalog.js';

const frontend = name => `AleriaAlmanach/tests/${name}.test.mjs`;
const tests = [
  'weapon-standard-expansion', 'weapon-standard-art', 'weapon-standard-presentation', 'combat-weapon-profile-family',
  'vennyr-technique-weapon-rules', 'wyrmtanz-weapon-curriculum', 'standard-tool-artwork',
  'equipment-standards-2026-11', 'cultural-origin-catalog', 'character-creation',
  'character-development', 'character-development-audit', 'ability-icon-registry',
  'character-archive-catalog-integrity', 'character-archive-attack-groups',
  'character-archive-class-training', 'character-archive-query', 'character-archive-library-revision', 'combat-entry-icons',
  'character-archive-card-presentation',
  'combat-technique-icon-ui', 'item-register', 'character-inventory-itemization'
].map(frontend);

// Follow the catalog's documented countries and artwork without watching every
// unrelated country draft. No character records are read by the task planner.
const culturalInputs = [...new Set(CHARACTER_CULTURAL_ORIGINS.flatMap(origin => [
  ...origin.sourcePaths,
  origin.pagePath.split('#')[0].replace(/^\//, '').replace(/\/$/, '/index.html'),
  origin.icon.replace(/^\//, '')
]))];

export const CHARACTER_REFERENCE_TASKS = [{
  id: 'character-reference-catalogs',
  label: 'Weapon baselines, cultural origins, public character archive and individual ability artwork',
  inputs: [
    'AleriaAlmanach/modules/weapon-standards/', 'Markt/WaffenRüstungen/',
    'AleriaAlmanach/scripts/build-weapon-standards.mjs',
    'AleriaAlmanach/scripts/build-item-register.mjs',
    'AleriaAlmanach/scripts/prepare-weapon-standard-art.ps1',
    'AleriaAlmanach/scripts/check-weapon-standard-art.mjs',
    'AleriaAlmanach/docs/art/weapon-standards/',
    'AleriaAlmanach/public/assets/weapon-standards/',
    'AleriaAlmanach/modules/character-origins/', ...culturalInputs,
    'AleriaAlmanach/public/assets/character-origins/',
    'AleriaAlmanach/modules/character-archive/',
    'AleriaAlmanach/modules/character-trait-review/reviewed-character-traits.js',
    'AleriaAlmanach/tools/character-library/',
    'AleriaAlmanach/tools/build-spell-attack-library.mjs',
    'AleriaAlmanach/data/spell-attack-library.json',
    'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/records/',
    'AleriaAlmanach/scripts/prepare-ability-icons.ps1',
    'AleriaAlmanach/scripts/check-ability-icons.mjs',
    'AleriaAlmanach/docs/art/ability-icons/', 'AleriaAlmanach/public/assets/ability-icons/',
    'AleriaAlmanach/assets/development-traits/',
    'AleriaAlmanach/assets/combat-technique-icons/',
    'AleriaAlmanach/modules/character-equipment/',
    'AleriaAlmanach/modules/character-inventory/',
    'AleriaAlmanach/modules/character-development/',
    'AleriaAlmanach/modules/classes/', 'AleriaAlmanach/modules/combat/',
    'AleriaAlmanach/modules/combat-styles/',
    'AleriaAlmanach/modules/item-builder/', 'AleriaAlmanach/modules/item-register/',
    'AleriaAlmanach/modules/item-definitions/',
    'firebase/functions/scripts/sync-almanach-mechanics.mjs',
    'firebase/functions/src/generated/combat/character-creation-templates.js',
    'firebase/functions/src/generated/character-origins/',
    'firebase/functions/src/generated/combat/combat-weapon-profile-family.js',
    'firebase/functions/tests/reference-catalog-parity.test.js',
    'Klassenordner/modules/culture/culture-class-training-template.js',
    ...tests
  ],
  commands: [
    ['AleriaAlmanach/scripts/build-weapon-standards.mjs', '--check'],
    ['AleriaAlmanach/scripts/check-weapon-standard-art.mjs'],
    ['AleriaAlmanach/scripts/check-ability-icons.mjs'],
    ['AleriaAlmanach/scripts/build-item-register.mjs', '--check'],
    ['AleriaAlmanach/tools/build-spell-attack-library.mjs', '--check'],
    ['--test', '--experimental-test-isolation=none', ...tests],
    ['--test', '--experimental-test-isolation=none', 'firebase/functions/tests/reference-catalog-parity.test.js'],
    ['--test', '--experimental-test-isolation=none', 'netlify/tests/character-reference-tasks.test.mjs']
  ]
}];
