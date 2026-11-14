// Existing release checks have a validation-only contract. Keep explicit entry
// points: an unknown script does not become checkpointable by taking --check.
const VALIDATION_CHECKS = new Set([
  "AleriaAlmanach/scripts/build-goettliche-eleganz.mjs",
  "AleriaAlmanach/scripts/build-goettliche-eleganz.mjs",
  "shared/world-directory/build-house-directories.mjs",
  "AleriaAlmanach/modules/language/package-language-build.mjs",
  "AleriaAlmanach/modules/patrick-biographies/build-biography-source.mjs",
  "AleriaAlmanach/scripts/build-arkaneum.mjs",
  "AleriaAlmanach/scripts/build-authored-item-catalog.mjs",
  "AleriaAlmanach/scripts/build-balchder-vertragsstube.mjs",
  "AleriaAlmanach/scripts/build-character-trait-review.mjs",
  "AleriaAlmanach/scripts/build-companion-ownership-review.mjs",
  "AleriaAlmanach/scripts/build-creature-bestiary-index.mjs",
  "AleriaAlmanach/scripts/build-currency-art.mjs",
  "AleriaAlmanach/scripts/build-draig-rooms.mjs",
  "AleriaAlmanach/scripts/build-economy-calculator.mjs",
  "AleriaAlmanach/scripts/build-economy-price-reference.mjs",
  "AleriaAlmanach/scripts/build-economy-price-review.mjs",
  "AleriaAlmanach/scripts/build-fleischsammler-argall.mjs",
  "AleriaAlmanach/scripts/build-gawain-character-database.mjs",
  "AleriaAlmanach/scripts/build-gawain-duncan-content.mjs",
  "AleriaAlmanach/scripts/build-gawain-family-snapshot.mjs",
  "AleriaAlmanach/scripts/build-gestiefelte-muschi.mjs",
  "AleriaAlmanach/scripts/build-goldene-fassung.mjs",
  "AleriaAlmanach/scripts/build-loer-hofjuwelier.mjs",
  "AleriaAlmanach/scripts/build-gwniwr-shop.mjs",
  "AleriaAlmanach/scripts/build-maerllys.mjs",
  "AleriaAlmanach/scripts/build-tailoring-characters.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-landfamilien.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-landfamilien-characters.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-horse-studs.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-horse-resale.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-underworld.mjs",
  "AleriaAlmanach/scripts/build-underworld-character-exports.mjs",
  "AleriaAlmanach/scripts/build-group-adventures.mjs",
  "AleriaAlmanach/scripts/build-group-section-migration.mjs",
  "AleriaAlmanach/scripts/build-gwregysdu-harbor.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-erbstreit-assets.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-geography.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-heime.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-lotsensuche.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-marktplatz.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-seven.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-troetzli.mjs",
  "AleriaAlmanach/scripts/build-honigtoertchen.mjs",
  "AleriaAlmanach/scripts/build-melog-characters.mjs",
  "AleriaAlmanach/scripts/build-pert-characters.mjs",
  "AleriaAlmanach/scripts/build-item-register.mjs",
  "AleriaAlmanach/scripts/build-klingende-krone.mjs",
  "AleriaAlmanach/scripts/build-klingende-muenze-gwynthor.mjs",
  "AleriaAlmanach/scripts/build-landing-model.mjs",
  "AleriaAlmanach/scripts/build-letzter-heller.mjs",
  "AleriaAlmanach/scripts/build-markt-der-fortuna-gwynthor.mjs",
  "AleriaAlmanach/scripts/build-natural-resources.mjs",
  "AleriaAlmanach/scripts/build-quest-catalog.mjs",
  "AleriaAlmanach/scripts/build-quest-preparations.mjs",
  "AleriaAlmanach/scripts/build-rote-klaue.mjs",
  "AleriaAlmanach/scripts/build-rotes-tor.mjs",
  "AleriaAlmanach/scripts/build-schwarze-zitteraale.mjs",
  "AleriaAlmanach/scripts/build-skalli-retinue.mjs",
  "AleriaAlmanach/scripts/build-substance-item-catalog.mjs",
  "AleriaAlmanach/scripts/build-weapon-standards.mjs",
  "AleriaAlmanach/scripts/sync-character-archive-pages.mjs",
  "AleriaAlmanach/tools/build-spell-attack-library.mjs",
  "Anzeigetafeln/tools/build-gwynthor-quest-notices.mjs",
  "Anzeigetafeln/tools/build-lotsensuche.mjs",
  "Anzeigetafeln/tools/build-notice-reward-catalog.mjs",
  "Anzeigetafeln/tools/build-notice-signoffs.mjs",
  "Anzeigetafeln/tools/vendor-notice-handwriting.mjs",
  "Bestiarium/scripts/build-bird-profiles.mjs",
  "Bestiarium/scripts/build-horse-breeding.mjs",
  "CharakterDatenbank/scripts/import-balchder-publication.mjs",
  "CharakterDatenbank/scripts/sync-house-signets.mjs",
  "CharakterDatenbank/scripts/sync-knight-starting-possessions.mjs",
  "CharakterDatenbank/scripts/sync-patrick-biographies.mjs",
  "Ereignisse/scripts/build-battles.mjs",
  "Ereignisse/scripts/build-coastal-history.mjs",
  "Ereignisse/scripts/build-events.mjs",
  "Ereignisse/scripts/build-praetendenten.mjs",
  "Ereignisse/scripts/build-weddings.mjs",
  "Fraktionen/scripts/build-factions.mjs",
  "Gameplay Guide/scripts/build-guides.mjs",
  "Karten/tools/build-fleischsammler-localities.mjs",
  "Karten/tools/build-households.mjs",
  "Karten/tools/project-halenrhyd.mjs",
  "Karten/tools/build-leitheach.mjs",
  "Karten/tools/build-roriksheim-transfer.mjs",
  "Karten/tools/build-uathneach.mjs",
  "Karten/tools/import-leitheach-source.mjs",
  "Karten/tools/reconcile-gwynthor-affiliations.mjs",
  "Karten/tools/sync-albic-territory-labels.mjs",
  "Klassenordner/scripts/build-culture-classes.mjs",
  "Kontinente/scripts/build-administration-vassals.mjs",
  "Kontinente/scripts/build-aislearneach.mjs",
  "Kontinente/scripts/build-alben.mjs",
  "Kontinente/scripts/build-aldrimar.mjs",
  "Kontinente/scripts/build-blaithneach.mjs",
  "Kontinente/scripts/build-ceitheach.mjs",
  "Kontinente/scripts/build-cenyr-court.mjs",
  "Kontinente/scripts/build-cenyr-navigation.mjs",
  "Kontinente/scripts/build-continent-overviews.mjs",
  "Kontinente/scripts/build-dunfal.mjs",
  "Kontinente/scripts/build-dunkelhain.mjs",
  "Kontinente/scripts/build-faelaorn.mjs",
  "Kontinente/scripts/build-fjordheim.mjs",
  "Kontinente/scripts/build-heldenwacht.mjs",
  "Kontinente/scripts/build-ivarsheim.mjs",
  "Kontinente/scripts/build-kraehenmoor.mjs",
  "Kontinente/scripts/build-leitheach.mjs",
  "Kontinente/scripts/build-roriksheim.mjs",
  "Kontinente/scripts/build-schwarzfenn.mjs",
  "Kontinente/scripts/build-skjaerheim.mjs",
  "Kontinente/scripts/build-uathneach.mjs",
  "Kontinente/scripts/build-vennyr.mjs",
  "Kontinente/scripts/review-albic-territories.mjs",
  "js/biography/build-public-biographies.mjs",
  "shared/accepted-realms/scripts/admit-art.mjs",
  "shared/accepted-realms/scripts/build-maps.mjs",
  "shared/accepted-realms/scripts/build-pages.mjs",
]);

const SCOPED_CHECKS = new Set([
  'Familien Häuser und Clans/scripts/build-house-content.mjs',
  'Gallerien/krieger/scripts/build-catalog.mjs',
]);
const READ_ONLY_CHECKS = new Set([
  'AleriaAlmanach/scripts/build-draig-garde-module.mjs',
  'netlify/build/check-mechanics-projection.mjs',
  'AleriaAlmanach/scripts/check-character-archive.mjs',
  'AleriaAlmanach/scripts/check-underworld-characters.mjs',
  'AleriaAlmanach/scripts/check-weapon-standard-art.mjs',
  'AleriaAlmanach/scripts/check-ability-icons.mjs',
  'AleriaAlmanach/scripts/check-family-tree-template.js',
  'AleriaAlmanach/scripts/check-module-template-assets.js',
  'AleriaAlmanach/scripts/check-module-template-roundtrip.js',
]);

// A known script and its complete, reviewed argument list define the contract.
// Merely accepting --check must never authorize arbitrary scripts or extra flags.
export function isCatalogValidationCommand(args) {
  if (!Array.isArray(args) || !args.every(arg => typeof arg === 'string')) return false;
  if (args.length === 2 && args[1] === '--check') return VALIDATION_CHECKS.has(args[0]);
  if (args.length !== 3 || args.slice(1).filter(arg => arg === '--check').length !== 1) return false;
  const scope = args.slice(1).find(arg => arg !== '--check');
  if (args[0] === 'AleriaAlmanach/scripts/build-eleganz-sales-characters.mjs') return scope === '--source-exports';
  if (args[0] === 'AleriaAlmanach/scripts/build-eleganz-sales-characters.mjs') return scope === '--source-exports';
  return SCOPED_CHECKS.has(args[0])
    && /^--houses=[a-z0-9][a-z0-9-]*(?:,[a-z0-9][a-z0-9-]*)*$/.test(scope);
}

export function isReadOnlyValidationCommand(args) {
  if (!Array.isArray(args) || !args.length || !args.every(arg => typeof arg === 'string')) return false;
  return args[0] === '--test'
    || isCatalogValidationCommand(args)
    || (args.length === 1 && READ_ONLY_CHECKS.has(args[0]))
    || (args.length === 2 && args[0] === 'AleriaAlmanach/modules/character-inventory/scripts/build-ui-art.mjs'
      && args[1] === '--verify')
    || (args.length === 2 && args[0] === 'netlify/build/verify-task-inputs.mjs' && /^[a-z0-9][a-z0-9-]*$/.test(args[1]));
}

export function isCheckpointCommand(args) {
  return isReadOnlyValidationCommand(args)
    || (Array.isArray(args) && args[0] === 'netlify/build/prepare-runtime-checks.mjs'
      && (args.length === 1 || (args.length === 2 && /^--scope=(?:all|almanach|firebase)$/.test(args[1]))))
    || (Array.isArray(args) && args.length === 2 && args[0] === 'Stammbäume/tools/check-release.mjs'
      && args[1] === '--prepare-browser');
}
