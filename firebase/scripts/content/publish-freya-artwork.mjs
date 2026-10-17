import { publishBiographyArtwork } from './biography-artwork-publication.mjs';
import { FREYA_CHARACTER_ID } from './freya-family-context.mjs';
import { FREYA_TRAITS } from './freya-biography-content.mjs';
const directory = new URL('../../../AleriaAlmanach/assets/biographies/freya-skald/2026-10-17/', import.meta.url);
const files = { standard: 'references/freya-standard.png', armor: 'freya-schildmaid-eldfaxi.png',
  age15: 'freya-15.png', child: 'freya-06-fenrir-08.png', eldfaxi: 'references/eldfaxi-original.png',
  academy: '../../../../../IconOrdner/Etablissemant%20Icons/LauteIcon.png' };
for (const { icon } of FREYA_TRAITS) files[`trait${icon}`] = `../../../../../IconOrdner/Traits%20Icon/${icon}.png`;
console.log(JSON.stringify(await publishBiographyArtwork({ directory, files, familyId: 'haus-skald',
  characterId: FREYA_CHARACTER_ID, assetPrefix: 'freya', kinds: { academy: 'icon' } })));
