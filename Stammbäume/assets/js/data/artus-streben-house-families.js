import { ARTUS_STREBEN_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';

// Vorbereitete Hausakten (Juli 2026) für die neu angelegten Wappen unter
// assets/images/houses/Artus Streben/. Die Datei "Gwefrydd.png" im Ordner
// "Niedere Ritterliche" wurde bewusst NICHT übernommen — es gibt bereits ein
// eigenständiges Haus Gwefrydd (Baronengeschlecht, ebenfalls Artus Streben, Sitz
// Rhosmere); die Datei gilt als Dublette/Versehen und wird ignoriert.
//
// "Niedere Ritterliche" und "Ritterliche" gelten laut Absprache als dieselbe
// Rangstufe (knight, silberner Wappenrahmen). Sobald ein Haus im Detail ausgearbeitet
// wird, ersetzt seine HOUSE_X_FAMILY den Eintrag hier — wie bereits bei den niederen
// Ritterhäusern in lower-knight-house-families.js vorgemacht.
export const ARTUS_STREBEN_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'almarch', file: 'Almarch', rankId: 'knight', folder: 'Niedere Ritterliche' }),
  Object.freeze({ slug: 'althin', file: 'Althin', rankId: 'knight', folder: 'Niedere Ritterliche' }),
  Object.freeze({ slug: 'brinmarch', file: 'Brinmarch', rankId: 'knight', folder: 'Niedere Ritterliche' }),
  Object.freeze({ slug: 'coedvarn', file: 'Coedvarn', rankId: 'knight', folder: 'Niedere Ritterliche' }),
  Object.freeze({ slug: 'eirfael', file: 'Eirfael', rankId: 'knight', folder: 'Niedere Ritterliche' }),
  Object.freeze({ slug: 'ghorswyn', file: 'Ghorswyn', rankId: 'knight', folder: 'Niedere Ritterliche' }),
  Object.freeze({ slug: 'gwardin', file: 'Gwardin', rankId: 'knight', folder: 'Niedere Ritterliche' }),
  Object.freeze({ slug: 'gwynrhos', file: 'Gwynrhos', rankId: 'knight', folder: 'Niedere Ritterliche' }),
  Object.freeze({ slug: 'talmeirch', file: 'Talmeirch', rankId: 'knight', folder: 'Niedere Ritterliche' }),
  Object.freeze({ slug: 'tirwyn', file: 'Tirwyn', rankId: 'knight', folder: 'Niedere Ritterliche' }),
  Object.freeze({ slug: 'bekab', file: 'Bekab', rankId: 'commoner', folder: 'Bürgerliche' }),
  Object.freeze({ slug: 'iorwen', file: 'Iorwen', rankId: 'commoner', folder: 'Bürgerliche' }),
  Object.freeze({ slug: 'maethan', file: 'Maethan', rankId: 'commoner', folder: 'Bürgerliche' }),
  Object.freeze({ slug: 'rhen', file: 'Rhen', rankId: 'commoner', folder: 'Bürgerliche' })
]);

export const ARTUS_STREBEN_HOUSE_FAMILIES = Object.freeze(
  ARTUS_STREBEN_HOUSE_DEFINITIONS.map(definition => createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: `Haus ${definition.file}`,
    emblem: `assets/images/houses/Artus Streben/${definition.folder}/${definition.file}.png`,
    houseProfile: ARTUS_STREBEN_VASSAL_PROFILES[definition.slug],
    description: `Vorbereitete Familienakte des Hauses ${definition.file} aus Artus Streben.`
  }))
);
