// Authoring sources remain in the source repository. Their public counterparts
// (crests, previews, production images and explicit original downloads) stay live.
const SOURCE_ARCHIVE_ROOTS = [
  'assets/source/comment-foreign-voice/',
  'AleriaAlmanach/docs/art/character-style/experiments/',
  'shared/world-directory/tests/',
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
  'Vorschau/Venalys/scripts/',
  'Vorschau/Ishtaran/sources/',
  'Vorschau/Ishtaran/scripts/',
  'Vorschau/Leukonia/sources/',
  'Vorschau/Leukonia/scripts/',
  'Vorschau/Calidaria/sources/',
  'Vorschau/Calidaria/scripts/',
  'Vorschau/Sylvarant/sources/',
  'Vorschau/Sylvarant/scripts/',
  'Vorschau/Solestia/sources/',
  'Vorschau/Solestia/scripts/',
  'Vorschau/Phalantia/sources/',
  'Vorschau/Phalantia/scripts/',
  'Vorschau/Klythesia/sources/',
  'Vorschau/Klythesia/scripts/',
  'Vorschau/Kemetara/sources/',
  'Vorschau/Kemetara/scripts/',
  'Vorschau/Kemetara/tests/',
  'Vorschau/Mathringen/sources/',
  'Vorschau/Mathringen/scripts/',
  'Vorschau/Mathringen/tests/',
  'Vorschau/Adharath/sources/',
  'Vorschau/Adharath/scripts/',
  'Vorschau/Adharath/tests/',
  'Vorschau/Adharath/assets/originals/',
  'Vorschau/shared/heraldic-artifacts/',
  'AleriaAlmanach/assets/gwynthor-marktplatz/',
  'AleriaAlmanach/modules/gawain-duncan/source/',
  'AleriaAlmanach/modules/group-adventures/source/',
  'AleriaAlmanach/AvatarWerkstatt/Charaktere/Einzelcharaktere/Gwen Hamnett/',
  'AleriaAlmanach/AvatarWerkstatt/Output/Gwen Hamnett/',
  'AleriaAlmanach/backups/scenes/'
];

const HOUSE_SOURCE_ROOT = 'Familien Häuser und Clans/';
const HOUSE_ARCHIVE_FILENAME = /^(?:animexx-(?:original|source)(?:-\d{4}-\d{2}-\d{2}(?:-v\d+)?)?\.html|SOURCE_DECISIONS\.md|REDAKTION\.md|sources\.json|quellen\.json|source-manifest\.json|image-generation(?:-v\d+)?\.json)$/;

// Supplied language packages retain their complete authoring history in Git.
// Only their font files are runtime assets. The module imports reference data
// and specimen images into its own public paths; no raw-package downloads are
// offered. Keep the complete original packages available in the source tree.
const LANGUAGE_PACKAGE_ROOT = /^Fonts\/(?:Tlapanui-Gesamtpaket-2\.000|Ishtaran-Gesamtpaket-1\.000)\//;
function isLanguagePackageArchive(file) {
  if (!LANGUAGE_PACKAGE_ROOT.test(file)) return false;
  const relative = file.replace(LANGUAGE_PACKAGE_ROOT, '');
  return !/^Fonts\/[^/]+\.(?:woff2?|ttf|otf)$/.test(relative);
}

function isLanguageSceneSource(file) {
  return /^AleriaAlmanach\/modules\/language\/(tlapanui|ishtaran)\/assets\/language-\1-scene\.(?:png|prompt\.md)$/.test(file);
}

// House source filenames own this boundary regardless of the house's region.
// Active page data, iframe targets, artwork and explicit downloads are separate.
function isHouseSourceArchive(file) {
  return file.startsWith(HOUSE_SOURCE_ROOT)
    && HOUSE_ARCHIVE_FILENAME.test(file.slice(file.lastIndexOf('/') + 1));
}

export function isAuthoringArchive(file) {
  return file.startsWith('diagnostics/')
    || file === 'shared/world-directory/source-reader.mjs'
    || file === 'shared/world-directory/build-house-directories.mjs'
    || file === 'shared/world-directory/house-placement.mjs'
    || isHouseSourceArchive(file)
    || isLanguagePackageArchive(file)
    || isLanguageSceneSource(file)
    || file === 'AleriaAlmanach/modules/language/package-language-build.mjs'
    || (file.startsWith('Fonts/Ishtaran-Web-1.001/')
      && file !== 'Fonts/Ishtaran-Web-1.001/AyluunMondbogen-Regular.woff')
    || file === 'Familien Häuser und Clans/modules/house-content/prepared-house-content.mjs'
    || file === 'Familien Häuser und Clans/Estryll/Cenyr/Silberinsel/Silberbucht/Haus_Delvor/assets/hausdarstellung-2026-11-03.png'
    || file === 'Familien Häuser und Clans/Estryll/Cenyr/Sonnenkueste/Gerstekueste/Haus_Rhavorn/assets/hausdarstellung-2026-11-03.png'
    || file === 'Familien Häuser und Clans/Estryll/Cenyr/Sonnenkueste/Gerstekueste/Haus_Grianlaoch/assets/hausdarstellung-2026-11-03.png'
    || /^Familien Häuser und Clans\/Estryll\/Cenyr\/Tal_der_Milane\/Yvains_Klamm\/Haus_(?:Caerfran|Coedrudd|Barcud|Durdynn|Gwylen|Faelwyn|Gwyliadwr|Helyg)\/assets\/hausdarstellung-2026-11-03\.png$/.test(file)
    || file === 'Vorschau/Ishtaran/assets.source.json'
    || file === 'Vorschau/Ishtaran/warrior-art-direction.mjs'
    || file === 'Vorschau/Ishtaran/assets/warriors/manifest.json'
    || file === 'Vorschau/Leukonia/assets.source.json'
    || /^Vorschau\/Leukonia\/assets\/(?:warriors|emblems|banners|castes)\/manifest\.json$/.test(file)
    || file === 'Vorschau/Calidaria/assets.source.json'
    || file === 'Vorschau/Sylvarant/assets.source.json'
    || file === 'Vorschau/Sylvarant/source-import.json'
    || file === 'Vorschau/Solestia/assets.source.json'
    || file === 'Vorschau/Solestia/source-import.json'
    || file === 'Vorschau/Solestia/assets/warriors/manifest.json'
    || file === 'Vorschau/Solestia/assets/estates/manifest.json'
    || file === 'Vorschau/Phalantia/assets.source.json'
    || file === 'Vorschau/Phalantia/source-import.json'
    || file === 'Vorschau/Klythesia/assets.source.json'
    || file === 'Vorschau/Klythesia/source-import.json'
    || file === 'Vorschau/Kemetara/assets.source.json'
    || file === 'Vorschau/Kemetara/source-import.json'
    || /^Vorschau\/Kemetara\/assets\/(?:estates|warriors|emblems|regions)\/(?:[a-z-]*manifest\.json|generated(?:-archive)?\/)/.test(file)
    || file === 'Vorschau/Mathringen/assets.source.json'
    || file === 'Vorschau/Adharath/assets.source.json'
    || /^Vorschau\/Adharath\/assets\/(?:warriors|castes)\/manifest\.json$/.test(file)
    || file === 'Vorschau/Mathringen/source-import.json'
    || /^Vorschau\/Mathringen\/assets\/(?:estates|warriors|emblems)\/(?:[a-z-]*manifest\.json|generated(?:-archive)?\/)/.test(file)
    || /^Vorschau\/(?:Phalantia|Klythesia)\/assets\/(?:warriors|emblems|estates)\/(?:house-|realm-)?manifest\.json$/.test(file)
    || /^Vorschau\/(?:Phalantia|Klythesia)\/assets\/(?:warriors|emblems|estates)\/originals\//.test(file)
    || file === 'Vorschau/Venalys/assets/estates/manifest.json'
    || file.startsWith('Vorschau/Venalys/assets/estates/generated/')
    || file.startsWith('Vorschau/Solestia/assets/estates/generated/')
    || /^Vorschau\/Solestia\/assets\/warriors\/(?:production|previews)\/house-pool-07\.(?:png|webp)$/.test(file)
    || /^Vorschau\/Solestia\/assets\/warriors\/(?:production|previews)\/house-pool-04\.(?:png|webp)$/.test(file)
    || /^Vorschau\/Solestia\/assets\/emblems\/(?:production|previews)\/pool-04\.(?:png|webp)$/.test(file)
    || file === 'Vorschau/shared/art-catalog-source.mjs'
    || file === 'Vorschau/shared/warrior-artifacts/category.py'
    || /^Vorschau\/Sylvarant\/assets\/(?:warriors|emblems)\/manifest\.json$/.test(file)
    || /^Vorschau\/Sylvarant\/assets\/emblems\/(?:production|previews)\/(?:province-sylvarant|pool-02-v1)\.(?:png|webp)$/.test(file)
    || /^Vorschau\/Sylvarant\/assets\/warriors\/(?:production|previews)\/(?:house-(?:cerunia|rinia|maborel|stalitia|pool-(?:07|10|11))|prototype-03)\.(?:png|webp)$/.test(file)
    || /^Vorschau\/Calidaria\/assets\/(?:warriors|emblems)\/manifest\.json$/.test(file)
    || /^Vorschau\/Calidaria\/assets\/warriors\/(?:production|previews)\/prototype-03\.(?:png|webp)$/.test(file)
    || /^Vorschau\/Calidaria\/assets\/warriors\/(?:production|previews)\/house-tlapanui-11\.(?:png|webp)$/.test(file)
    || /^Vorschau\/Calidaria\/assets\/emblems\/(?:production|previews)\/tlapanui-11\.(?:png|webp)$/.test(file)
    || /^Vorschau\/Calidaria\/assets\/emblems\/(?:production|previews)\/(?:province-calidaria|ancient-tlapatlan)\.(?:png|webp)$/.test(file)
    // Explicitly retired proposals remain source files, alongside their generator originals.
    || /^Vorschau\/Leukonia\/assets\/emblems\/(?:production|previews)\/(?:leukonia|pool-33|pool-34)\.(?:png|webp)$/.test(file)
    || /^Vorschau\/Leukonia\/assets\/banners\/(?:production|previews)\/bolar\.(?:png|webp)$/.test(file)
    || /^Vorschau\/Leukonia\/assets\/warriors\/(?:production|previews)\/house-mede\.(?:png|webp)$/.test(file)
    || /^Vorschau\/Ishtaran\/assets\/warriors\/(?:production|previews)\/(?:aschik|derwisch|keman|lewent|nefer|nizet|sipahi)\.(?:png|webp)$/.test(file)
    || file === 'AleriaAlmanach/public/assets/inventory-ui/dark-hide-v1.png'
    || file === 'js/biography/build-public-biographies.mjs'
    || /^AleriaAlmanach\/assets\/development-traits\/[^/]+\.png$/.test(file)
    || SOURCE_ARCHIVE_ROOTS.some(root => file.startsWith(root))
    || file === 'AleriaAlmanach/assets/currency/image-prompts.json'
    || file.startsWith('output/heraldry/')
    || /^Vorschau\/[^/]+\/assets\/(?:(?:warriors|emblems|banners|castes)\/)?(?:generated(?:-archive)?|alternates)\//.test(file)
    || /^Klassenordner\/assets\/images\/brevanor\/icons\/generated\//.test(file);
}
