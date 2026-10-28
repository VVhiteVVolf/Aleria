import { readdirSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const tests = (directory, extension = 'mjs') => ['--test', '--experimental-test-isolation=none',
  ...readdirSync(new URL(directory + '/', root)).filter(name => name.endsWith('.test.' + extension))
    .sort().map(name => directory + '/' + name)];
const territoryBuilders = ['aislearneach', 'alben', 'blaithneach', 'ceitheach', 'cenyr-court',
  'dunfal', 'dunkelhain', 'faelaorn', 'fjordheim', 'heldenwacht', 'ivarsheim',
  'kraehenmoor', 'leitheach', 'schwarzfenn', 'skjaerheim', 'uathneach', 'vennyr'];
const albicTerritoryInputs = ['Stammbäume/assets/js/modules/albic-territories/',
  'Stammbäume/scripts/albic-territories/',
  ...['Leitheach', 'Aislearneach', 'Dunfal', 'Blaithneach', 'Uathneach', 'Faelaorn', 'Ceitheach']
    .flatMap(realm => [`Karten/${realm}/territories.import.json`, `Stammbäume/assets/images/regions/${realm}/`])];

// These tasks own the new world-content systems. Existing focused Roriksheim
// and family-chart geometry checks remain in site-build-tasks.mjs.
export const WORLD_CONTENT_TASKS = [
  {
    id: 'territory-pages', label: 'Realm hierarchies, territory pages and heraldry',
    inputs: ['Kontinente/', 'Karten/karten.registry.js', 'Karten/modules/regions/', 'Karten/Uathneach/',
      'Stammbäume/assets/js/data/', 'Familien Häuser und Clans/', ...albicTerritoryInputs],
    commands: [['Kontinente/scripts/review-albic-territories.mjs', '--check'],
      ['Kontinente/scripts/build-administration-vassals.mjs', '--check'],
      ...territoryBuilders.map(name => ['Kontinente/scripts/build-' + name + '.mjs', '--check']),
      tests('Kontinente/tests'), tests('Familien Häuser und Clans/tests')]
  },
  {
    id: 'map-systems', label: 'Map sources, regions, marker editing and household crests',
    inputs: ['Karten/', 'Kontinente/modules/', 'Kontinente/kontinente.registry.js',
      'Stammbäume/assets/js/data/', 'Familien Häuser und Clans/', ...albicTerritoryInputs],
    commands: [['Karten/tools/sync-albic-territory-labels.mjs', '--check'],
      ['Karten/tools/import-leitheach-source.mjs', '--check'],
      ['Karten/tools/build-leitheach.mjs', '--check'],
      ['Karten/tools/build-uathneach.mjs', '--check'],
      ['Karten/tools/build-households.mjs', '--check'], tests('Karten/tests')]
  },
  {
    id: 'family-records', label: 'Reviewed territorial allegiance and Dunfal portrait update',
    inputs: ['Stammbäume/assets/js/', 'Stammbäume/assets/data/', 'Stammbäume/tests/',
      'Familien Häuser und Clans/'],
    excludes: ['Stammbäume/assets/data/published-families/backups/'],
    // Historical import snapshots assert the exact world size of their import
    // date. Keep the release gate on the changed features; schema and geometry
    // for every populated family are covered by the existing family-charts task.
    commands: [['--test', '--experimental-test-isolation=none',
      'Stammbäume/tests/crew-family-records.test.js',
      'Stammbäume/tests/fjordheim-structure.test.js',
      'Stammbäume/tests/skjaerheim-structure.test.js',
      'Stammbäume/tests/albic-fief-placements.test.js',
      'Stammbäume/tests/dunfal-portrait-upgrade.test.js']]
  },
  {
    id: 'events-calendar', label: 'Event pages, battles and calendar integration',
    inputs: ['Ereignisse/', 'AleriaAlmanach/modules/calendar/',
      'shared/coastal-history/', 'Piraterie/', 'Fraktionen/data/dunkle-gilden.json',
      'Archiv/Quellen/kuestenchroniken-2026-10-24/',
      'AleriaAlmanach/modules/piracy/', 'IconOrdner/ReiterIcons/Piraterie.svg', 'IconOrdner/ReiterIcons/Piratenbanden.svg',
      'AleriaAlmanach/modules/core/aleria-calendar.js', 'AleriaAlmanach/tests/calendar-events.test.mjs'],
    commands: ['events', 'weddings', 'battles', 'praetendenten', 'coastal-history'].map(name => ['Ereignisse/scripts/build-' + name + '.mjs', '--check'])
      .concat([['Fraktionen/scripts/build-factions.mjs', '--check'], tests('Fraktionen/tests'), tests('Ereignisse/tests'), ['--test', '--experimental-test-isolation=none', 'AleriaAlmanach/tests/calendar-events.test.mjs']])
  },
  {
    id: 'uathneach-preview', label: 'Isolated regional proposals and complete preview assets',
    inputs: ['Vorschau/'],
    commands: [tests('Vorschau/tests')]
  }
];
