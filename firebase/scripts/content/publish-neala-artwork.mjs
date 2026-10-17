import { publishBiographyArtwork } from './biography-artwork-publication.mjs';
const directory = new URL('../../../AleriaAlmanach/assets/biographies/neala-wylan/2026-10-17/', import.meta.url);
const files = { armor: 'neala-wylan-ruestung-floeckchen.png', age20: 'neala-20.png', age14: 'neala-14.png', child: 'neala-08.png', floeckchen: 'references/floeckchen-original.jpeg' };
const traitFiles = { traitDuty: 'Diligent', traitPride: 'Proud', traitCharm: 'Charismatic_negotiator', traitPatience: 'Patient', traitKindness: 'Kind', traitPerfection: 'Fussy' };
for (const [key, file] of Object.entries(traitFiles)) files[key] = `../../../../../IconOrdner/Traits%20Icon/${file}.png`;
console.log(JSON.stringify(await publishBiographyArtwork({ directory, files, familyId: 'haus-wylan',
  characterId: 'person--haus-wylan--neala-wylan', assetPrefix: 'neala', kinds: { floeckchen: 'companion' } })));
