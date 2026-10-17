import { publishBiographyArtwork } from './biography-artwork-publication.mjs';
import { SLEIPNIR_TRAIT_ICONS, SLEIPNIR_VARULV_ID } from './sleipnir-biography-plan.mjs';
const directory = new URL('../../../AleriaAlmanach/assets/biographies/sleipnir-varulv/2026-10-17/', import.meta.url);
const files = { bow: 'sleipnir-bogen-trygg.png', age22: 'sleipnir-22.png', age12: 'sleipnir-12.png', child: 'sleipnir-07.png' };
for (const icon of Object.values(SLEIPNIR_TRAIT_ICONS)) files[`trait${icon}`] = `../../../../../IconOrdner/Traits%20Icon/${icon}.png`;
console.log(JSON.stringify(await publishBiographyArtwork({ directory, files, familyId: 'haus-varulv',
  characterId: SLEIPNIR_VARULV_ID, assetPrefix: 'sleipnir' })));
