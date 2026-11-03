import { PATRICK_BIOGRAPHY_ASSETS, PATRICK_BIOGRAPHY_LOCAL_ASSETS } from '../../AleriaAlmanach/modules/patrick-biographies/biography-assets.mjs';

const tests=[
  'patrick-biography-family-integration','patrick-biographies','patrick-biography-database','patrick-biography-publication',
  'character-identity-retirements','gethin-character-links',
  'character-database-sync','character-database-overlays','character-export-sources',
  'creature-bestiary','biography-editions','biography-transfer'
].map(name=>`AleriaAlmanach/tests/${name}.test.mjs`);
const artwork=[...new Set([...Object.values(PATRICK_BIOGRAPHY_ASSETS),...Object.values(PATRICK_BIOGRAPHY_LOCAL_ASSETS)]
  .filter(value=>typeof value==='string'&&value.startsWith('/'))
  .map(value=>decodeURIComponent(value).slice(1)))];

// One bounded gate joins the shared public biography source to its three
// family projections, companion ownership and reviewed document retirements.
// Commands are checks only; no full archive builder or live publisher runs.
export const PATRICK_BIOGRAPHY_TASKS=[{
  id:'patrick-biographies',label:'Three shared biographies, Hamnett identity, owned pets and confirmed duplicate retirements',
  inputs:[
    'AleriaAlmanach/modules/patrick-biographies/',...artwork,
    'AleriaAlmanach/public/assets/biography-trait-icons/',
    'Stammbäume/assets/images/houses/Silberinsel/haus-hamnett.png',
    'Stammbäume/assets/images/portraits/haus-sgrechiwr/',
    'Stammbäume/assets/images/portraits/haus-draenmelyn/',
    'Stammbäume/assets/images/portraits/haus-swyll/',
    'Stammbäume/assets/images/portraits/haus-draig/myrddin-draig.jpg',
    'AleriaAlmanach/modules/character-genealogy/','js/world-identity/',
    'AleriaAlmanach/modules/creatures/catalog/patrick-biography-companions.js',
    'AleriaAlmanach/modules/creatures/catalog/household-companion-profiles.js',
    'AleriaAlmanach/modules/creatures/catalog/bestiary-profile-index.js',
    'AleriaAlmanach/modules/creatures/creature-catalog.js',
    'AleriaAlmanach/modules/creatures/creature-companion-link.js',
    'AleriaAlmanach/modules/creatures/creature-bestiary-reference.js',
    'AleriaAlmanach/modules/item-register/item-register-companions.js',
    'AleriaAlmanach/modules/characters/character-data.js',
    'AleriaAlmanach/scripts/build-creature-bestiary-index.mjs',
    'Stammbäume/assets/js/data/patrick-biography-family-overlay.js',
    'Stammbäume/assets/js/data/house-hamnett-family.js',
    'Stammbäume/assets/js/data/hamnett-house-profile.js',
    'Stammbäume/assets/js/data/house-sgrechiwr-family.js',
    'Stammbäume/assets/js/data/house-draenmelyn-family.js',
    'Stammbäume/assets/js/data/house-swyll-family.js',
    'Stammbäume/assets/js/data/draenmelyn-swyll-marriage.js',
    'Stammbäume/assets/js/data/families.registry.js',
    'Stammbäume/assets/js/data/family-record-builders.js',
    'Stammbäume/assets/js/data/celtigerns-wacht-house-profiles.js',
    'Stammbäume/assets/js/data/blank-house-family-factory.js',
    'Stammbäume/assets/js/modules/person-biography/',
    'Stammbäume/assets/js/modules/family-sync/project-origin-reconciliation.js',
    'Stammbäume/assets/js/services/family-registry-upgrade.js',
    'Stammbäume/assets/js/domain/',
    'CharakterDatenbank/assets/js/character-identity-retirements.mjs',
    'CharakterDatenbank/assets/js/character-database-client.mjs',
    'CharakterDatenbank/lib/character-record-projections.mjs',
    'CharakterDatenbank/lib/character-record-confirmation.mjs',
    'CharakterDatenbank/lib/character-companion-overlays.mjs',
    'CharakterDatenbank/lib/character-residence-overlays.mjs',
    'CharakterDatenbank/lib/character-reviewed-metadata-overlays.mjs',
    'CharakterDatenbank/lib/character-export-sources.mjs',
    'CharakterDatenbank/lib/character-database-model.mjs',
    'CharakterDatenbank/scripts/sync-patrick-biographies.mjs',
    'Charakter Archiv Exporte/Patrick Biografien 2026-11-03/',
    'CharakterDatenbank/registry.json','CharakterDatenbank/generated/',
    'Charakter Archiv Exporte/gethin-draig-zuordnung-2026-10-14.json',
    'Charakter Archiv Exporte/gethin-altbestand-2026-10-14.json',
    'firebase/scripts/content/character-retirement-plan.mjs',
    'firebase/scripts/content/publish-confirmed-character-retirements.mjs',
    'firebase/scripts/content/patrick-biography-publication-plan.mjs',
    'firebase/scripts/content/patrick-biography-publication.mjs',
    'firebase/scripts/content/publish-patrick-biographies.mjs',
    'firebase/scripts/content/content-publication-client.mjs',
    'firebase/scripts/backup/firestore-value-codec.mjs',
    'firebase/scripts/backup/project-backup-crypto.mjs',
    'Familien Häuser und Clans/tests/hamnett-house-page.test.mjs',
    'js/biography/',...tests,'netlify/tests/patrick-biography-tasks.test.mjs'
  ],
  commands:[
    ['AleriaAlmanach/modules/patrick-biographies/build-biography-source.mjs','--check'],
    ['js/biography/build-public-biographies.mjs','--check'],
    ['AleriaAlmanach/scripts/build-creature-bestiary-index.mjs','--check'],
    ['CharakterDatenbank/scripts/sync-patrick-biographies.mjs','--check'],
    ['--test','--experimental-test-isolation=none',...tests,'Familien Häuser und Clans/tests/hamnett-house-page.test.mjs'],
    ['--test','--experimental-test-isolation=none','netlify/tests/patrick-biography-tasks.test.mjs']
  ]
}];
