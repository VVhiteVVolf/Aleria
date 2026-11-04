import { publishBiographyArtwork } from './biography-artwork-publication.mjs';

const files = {
  'gwen-hamnett': '../../../../assets/biographies/patrick-20261103/originals/gwen-hamnett.jpeg',
  silberstolz: '../../../../assets/biographies/patrick-20261103/originals/silberstolz.png',
  perle: '../../../../assets/biographies/patrick-20261103/originals/perle.png',
  'sir-balthasar': '../../../../assets/biographies/patrick-20261103/originals/sir-balthasar.png',
  sonnenaufgang: '../../../../assets/biographies/patrick-20261103/originals/sonnenaufgang.jpeg',
};
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ plannedOriginalImages: 5, applyRequired: true }));
} else {
  console.log(JSON.stringify(await publishBiographyArtwork({
    directory: new URL('../../../AleriaAlmanach/docs/art/patrick-biographies-20261103/portraits/', import.meta.url),
    files, familyId: 'haus-sgrechiwr', characterId: 'person--family-tree--unknown-cadogan-spouse',
    assetPrefix: 'patrick-originals-20261103',
    kinds: { 'gwen-hamnett': 'original-portrait', silberstolz: 'original-companion-portrait', perle: 'original-companion-portrait',
      'sir-balthasar': 'original-companion-portrait', sonnenaufgang: 'original-companion-portrait' },
  })));
}
