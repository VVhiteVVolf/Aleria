// Separate release gates for shared adventure presentation and authoritative
// possession mechanics. Every generator is validation-only in this pipeline.
import { readFileSync, readdirSync } from 'node:fs';
const mechanicalSourceInputs = readdirSync(new URL('../../firebase/functions/src/generated/', import.meta.url), { recursive: true })
  .filter(file => /\.(?:m?js|json)$/.test(file)).map(file => `AleriaAlmanach/modules/${file.replaceAll('\\', '/')}`);
const goodsModuleInputs = [...readFileSync(new URL('../../AleriaAlmanach/AleriaAlmanach.html', import.meta.url), 'utf8')
  .matchAll(/<script\s+src="\.\/(modules\/[^"?]+-data\.js)(?:\?[^" ]*)?"/g)].map(match => `AleriaAlmanach/${match[1]}`);
const frontend = name => `AleriaAlmanach/tests/${name}.test.mjs`;
const test = (...files) => ['--test', '--experimental-test-isolation=none', ...files];
const dependencyCheck = ['netlify/build/prepare-runtime-checks.mjs'];
const currencyArtInputs = ['AleriaAlmanach/modules/currency/', 'AleriaAlmanach/assets/currency/',
  'AleriaAlmanach/scripts/build-currency-art.mjs', 'AleriaAlmanach/assets/gwynthor-troetzli/items/copper-coin-v1.png',
  'AleriaAlmanach/public/assets/inventory/coins/eisenpfennig.png'];
const mechanicalFeatures = ['combat', 'combat-critical', 'combat-status', 'combat-styles', 'characters', 'classes',
  'creatures', 'character-equipment', 'character-inventory', 'item-definitions', 'item-register', 'item-builder',
  'inventory-use', 'scene-inventory', 'scene-items', 'scene-rest', 'scene-regeneration', 'trade-catalog', 'house-armor']
  .map(name => `AleriaAlmanach/modules/${name}/`);
const groupTests = ['group-adventure-content', 'group-community', 'group-roster-window', 'group-scene-state',
  'group-landing-model', 'group-landing-inventory', 'group-landing-integration', 'group-account',
  'group-section-migration', 'gawain-duncan', 'gawain-content-source-projection', 'gawain-character-database', 'gawain-family-snapshot',
  'landing-folio-view', 'landing-presentation', 'landing-quest-journal', 'currency-art'];
const itemTests = ['item-definitions', 'item-system-readiness', 'item-system-checkup', 'item-register', 'item-register-text',
  'item-register-integration', 'item-register-modules', 'item-register-providers', 'item-register-template-search',
  'item-use-definitions', 'inventory-use-model', 'scene-inventory-transfer', 'scene-item-authoring',
  'character-inventory-itemization', 'character-equipment-sync', 'equipment-standards-2026-11', 'inventory-equipment-effects',
  'combat-action-card', 'combat-support-equipment', 'combat-defense-balance', 'weapon-action-balancing', 'combat-critical-damage', 'standard-tool-artwork', 'trade-catalog-money', 'scene-item-equipment-preservation'];

export const ADVENTURE_SYSTEM_TASKS = [
  {
    id: 'group-community', label: 'Shared group folios, story descriptions, public Gawain sources and group accounts',
    inputs: ['AleriaAlmanach/modules/landing/', 'AleriaAlmanach/modules/group-adventures/', 'AleriaAlmanach/modules/gawain-duncan/', ...currencyArtInputs,
      'Anzeigetafeln/assets/js/rewards/notice-rewards-model.mjs',
      'AleriaAlmanach/modules/story/', ...mechanicalFeatures, 'AleriaAlmanach/modules/quests/',
      'AleriaAlmanach/modules/module-store/group-section-migration.js', 'AleriaAlmanach/modules/module-store/group-section-migration.global.js',
      'AleriaAlmanach/modules/archive/archive-section-registration.mjs', 'AleriaAlmanach/modules/module-editor/module-editor-data.js',
      'AleriaAlmanach/modules/comments/comments-fazit-history.js', 'AleriaAlmanach/data/sections.js', 'AleriaAlmanach/AleriaAlmanach.html',
      'AleriaAlmanach/assets/landing-folio/', 'AleriaAlmanach/styles/group-landing.css',
      'AleriaAlmanach/package.json', 'AleriaAlmanach/package-lock.json', 'firebase/functions/package.json', 'firebase/functions/package-lock.json',
      'Stammbäume/assets/js/', 'Stammbäume/assets/data/published-families/haus-draig.json', 'Stammbäume/assets/data/published-families/registry.json',
      'CharakterDatenbank/lib/', 'CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/',
      'CharakterDatenbank/records/familien/haus-draig/gawain-draig--q1QtSIug74FzzwUAqWrs/',
      'Charakter Archiv Exporte/gawain-draig-oeffentliche-biografie-2026-11-01.json',
      ...['build-landing-model', 'build-group-adventures', 'build-group-section-migration', 'build-gawain-duncan-content',
        'build-gawain-family-snapshot', 'build-gawain-character-database'].map(name => `AleriaAlmanach/scripts/${name}.mjs`),
      'firebase/functions/src/groups/', 'firebase/functions/src/quests/quest-group-account.js', 'firebase/functions/src/generated/landing/',
      'AleriaAlmanach/tests/fixtures/', ...groupTests.map(frontend), ...['group-inventory', 'group-inventory-audit', 'group-content-membership'].map(name => `firebase/functions/tests/${name}.test.js`)],
    commands: [dependencyCheck,
      ...['build-group-section-migration', 'build-landing-model', 'build-group-adventures', 'build-gawain-duncan-content',
        'build-gawain-character-database', 'build-gawain-family-snapshot', 'build-currency-art'].map(name => [`AleriaAlmanach/scripts/${name}.mjs`, '--check']),
      test(...groupTests.map(frontend)),
      test(...['group-inventory', 'group-inventory-audit', 'group-content-membership'].map(name => `firebase/functions/tests/${name}.test.js`))]
  },
  {
    id: 'item-mechanics', label: 'Versioned item standards, transfers, equipment, use and authoritative transaction regressions',
    inputs: [...mechanicalFeatures, ...mechanicalSourceInputs, ...goodsModuleInputs, ...currencyArtInputs, 'AleriaAlmanach/modules/regional-equipment/',
      'AleriaAlmanach/AleriaAlmanach.html', 'AleriaAlmanach/modules/economy-calculator/',
      'AleriaAlmanach/modules/economy-pricing/', 'AleriaAlmanach/modules/gwynthor-geography/',
      'Anzeigetafeln/tools/build-notice-reward-catalog.mjs', 'Anzeigetafeln/assets/data/notice-reward-catalog.json', 'Anzeigetafeln/assets/js/rewards/notice-rewards-model.mjs',
      'AleriaAlmanach/scripts/build-item-register.mjs', 'AleriaAlmanach/scripts/source-pages/', 'AleriaAlmanach/docs/inventory/',
      'AleriaAlmanach/tests/fixtures/', 'CharakterDatenbank/generated/characters.snapshot.json',
      'AleriaAlmanach/package.json', 'AleriaAlmanach/package-lock.json', 'Markt/', 'Stammbäume/assets/js/',
      'Familien Häuser und Clans/', 'firebase/functions/src/', 'firebase/functions/tests/', 'firebase/functions/scripts/sync-almanach-mechanics.mjs',
      'firebase/functions/package.json', 'firebase/functions/package-lock.json', 'firebase/firestore.rules', 'firebase/firestore.indexes.json',
      ...itemTests.map(frontend)],
    commands: [dependencyCheck, ['netlify/build/check-mechanics-projection.mjs'], ['AleriaAlmanach/scripts/build-item-register.mjs', '--check'],
      ['Anzeigetafeln/tools/build-notice-reward-catalog.mjs', '--check'], test(...itemTests.map(frontend)),
      test('firebase/functions/tests/*.test.js')]
  }
];
