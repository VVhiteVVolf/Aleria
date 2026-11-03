// Authoring sources remain in the source repository. Their public counterparts
// (crests, previews, production images and explicit original downloads) stay live.
const SOURCE_ARCHIVE_ROOTS = [
  'AleriaAlmanach/docs/art/combat-technique-icons/',
  'AleriaAlmanach/docs/art/weapon-standards/',
  'AleriaAlmanach/docs/art/ability-icons/',
  'AleriaAlmanach/docs/art/character-origins/',
  'AleriaAlmanach/modules/character-inventory/scripts/',
  'AleriaAlmanach/assets/inventory-ui/',
  'js/biography/sources/',
  'AleriaAlmanach/modules/gwynthor-seven/source/',
  'AleriaAlmanach/assets/castell-draig/wohntrakte-zimmer-2026-11-01-v2/',
  'AleriaAlmanach/assets/castell-draig/wohnfluegel-2026-11-02/',
  'shared/accepted-realms/sources/',
  'shared/accepted-realms/scripts/',
  'shared/accepted-realms/authoring/',
  'Vorschau/Venalys/sources/',
  'Vorschau/Ishtaran/sources/',
  'Vorschau/Ishtaran/scripts/',
  'AleriaAlmanach/assets/gwynthor-marktplatz/',
  'AleriaAlmanach/modules/gawain-duncan/source/',
  'AleriaAlmanach/modules/group-adventures/source/',
  'AleriaAlmanach/backups/scenes/'
];

const HOUSE_SOURCE_ROOT = 'Familien Häuser und Clans/';
const HOUSE_ARCHIVE_FILENAME = /^(?:animexx-(?:original|source)(?:-\d{4}-\d{2}-\d{2}(?:-v\d+)?)?\.html|SOURCE_DECISIONS\.md|REDAKTION\.md|sources\.json|quellen\.json|source-manifest\.json|image-generation(?:-v\d+)?\.json)$/;

// House source filenames own this boundary regardless of the house's region.
// Active page data, iframe targets, artwork and explicit downloads are separate.
function isHouseSourceArchive(file) {
  return file.startsWith(HOUSE_SOURCE_ROOT)
    && HOUSE_ARCHIVE_FILENAME.test(file.slice(file.lastIndexOf('/') + 1));
}

export function isAuthoringArchive(file) {
  return file.startsWith('diagnostics/')
    || isHouseSourceArchive(file)
    || file === 'Familien Häuser und Clans/modules/house-content/prepared-house-content.mjs'
    || file === 'Familien Häuser und Clans/Estryll/Cenyr/Silberinsel/Silberbucht/Haus_Delvor/assets/hausdarstellung-2026-11-03.png'
    || file === 'Familien Häuser und Clans/Estryll/Cenyr/Sonnenkueste/Gerstekueste/Haus_Rhavorn/assets/hausdarstellung-2026-11-03.png'
    || file === 'Familien Häuser und Clans/Estryll/Cenyr/Sonnenkueste/Gerstekueste/Haus_Grianlaoch/assets/hausdarstellung-2026-11-03.png'
    || /^Familien Häuser und Clans\/Estryll\/Cenyr\/Tal_der_Milane\/Yvains_Klamm\/Haus_(?:Caerfran|Coedrudd|Barcud|Durdynn|Gwylen|Faelwyn|Gwyliadwr|Helyg)\/assets\/hausdarstellung-2026-11-03\.png$/.test(file)
    || file === 'Vorschau/Ishtaran/assets.source.json'
    || file === 'Vorschau/Ishtaran/warrior-art-direction.mjs'
    || file === 'Vorschau/Ishtaran/assets/warriors/manifest.json'
    || /^Vorschau\/Ishtaran\/assets\/warriors\/(?:production|previews)\/(?:aschik|derwisch|keman|lewent|nefer|nizet|sipahi)\.(?:png|webp)$/.test(file)
    || file === 'AleriaAlmanach/public/assets/inventory-ui/dark-hide-v1.png'
    || file === 'js/biography/build-public-biographies.mjs'
    || /^AleriaAlmanach\/assets\/development-traits\/[^/]+\.png$/.test(file)
    || SOURCE_ARCHIVE_ROOTS.some(root => file.startsWith(root))
    || file === 'AleriaAlmanach/assets/currency/image-prompts.json'
    || file.startsWith('output/heraldry/')
    || /^Vorschau\/[^/]+\/assets\/(?:(?:warriors|emblems)\/)?(?:generated(?:-archive)?|alternates)\//.test(file)
    || /^Klassenordner\/assets\/images\/brevanor\/icons\/generated\//.test(file);
}
