import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';
import { HOUSE_CANWYLL_PORTRAITS } from './house-canwyll-portraits.js';
import { HOUSE_CHIFFYDDLON_PORTRAITS } from './house-chiffyddlon-portraits.js';
import { HOUSE_CREFYDDOL_PORTRAITS } from './house-crefyddol-portraits.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_SGWARNOG_PORTRAITS } from './house-sgwarnog-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-unigol';

export const HOUSE_UNIGOL_LOCAL_PORTRAIT_FILES = Object.freeze({
  'trachmyr-unigol': 'trachmyr-unigol.jpg',
  'tarawg-unigol': 'tarawg-unigol.jpg',
  'garselid-selwyn': 'garselid-selwyn.jpg',
  'tryffin-unigol': 'tryffin-unigol.jpg',
  'neidion-unigol': 'neidion-unigol.jpg',
  'olwyn-unigol': 'olwyn-unigol.jpg',
  'dafydd-unigol': 'dafydd-unigol.jpg',
  'tamsin-diud': 'tamsin-diud.jpg',
  'cathal-lockart': 'cathal-lockart.jpg',
  'gaynor-eirth': 'gaynor-eirth.jpg',
  'rhiwallon-unigol': 'rhiwallon-unigol.jpg',
  'rhianu-unigol': 'rhianu-unigol.jpg',
  'eirwyn-eirth': 'eirwyn-eirth.jpg',
  'cledwyn-selwyn': 'cledwyn-selwyn.jpg',
  'tawny-unigol': 'tawny-unigol.jpg',
  'lleulu-unigol': 'lleulu-unigol.jpg',
  'rhys-unigol': 'rhys-unigol.jpg',
  'unig-unigol': 'unig-unigol.jpg',
  'gwen-unigol': 'gwen-unigol.jpg'
});

export const HOUSE_UNIGOL_PORTRAIT_SOURCES = Object.freeze({
  'trachmyr-unigol': 'https://64.media.tumblr.com/af4220b7bfcc3bff73f21625230117ba/69a252243d308613-43/s250x400/75d8b529d42b277e1c7adee28f6edd998318c1c8.pnj',
  'tarawg-unigol': 'https://64.media.tumblr.com/616d91c7f87dbcd00279b8dbe49b8a1e/69a252243d308613-c0/s250x400/1fb536fb8f478c271e1e408680747684c3a7f029.pnj',
  'garselid-selwyn': 'https://64.media.tumblr.com/863f5899097d30ba3a5a64dc7cb88f64/a6c27039f48ce8c7-62/s250x400/f2bf1d27e86799e4d46730a77983c0ef8bf36f85.pnj',
  'tryffin-unigol': 'https://64.media.tumblr.com/7220a4d47594b667f815202c62169384/69a252243d308613-5e/s250x400/8b2133973a4e9128158a864b99879a301a49ad14.pnj',
  'neidion-unigol': 'https://64.media.tumblr.com/40580bf141fa5241ac503f48b16ab7c8/69a252243d308613-e7/s250x400/a9eae582df705dcf3bb598196cba5feead6ffa57.pnj',
  'olwyn-unigol': 'https://64.media.tumblr.com/6840de7b18a2eaf3c2f7559008f5257c/69a252243d308613-35/s250x400/42f4d94cdb8cc15e132da4fc002de90b87ff1e53.pnj',
  'dafydd-unigol': 'https://64.media.tumblr.com/9a49b33d5306203e30e75dbc0865c756/69a252243d308613-49/s250x400/468d4a86bbfc4477e279949af2b9857e72cf78f2.pnj',
  'tamsin-diud': 'https://64.media.tumblr.com/0c998bafffb8424ef96995118d42efee/2320be34cdfa8e17-9a/s250x400/f112d34bc13a2e62974cf519b087a91391bcf66d.pnj',
  'cathal-lockart': 'https://64.media.tumblr.com/5b556bdb9cd4e589cddaaa96c698c5cd/bbf762f5200af629-71/s250x400/58ef9b01f6b4d2c4c5a5748bab27455fd2f451d7.pnj',
  'gaynor-eirth': 'https://64.media.tumblr.com/6b98a0c06bfff880e9201695565d7f81/ef7b451a93b548d3-6d/s250x400/1ddf635e7cebb28f57c5bcf90258a2920f5d63cb.pnj',
  'rhiwallon-unigol': 'https://64.media.tumblr.com/d901c05bf2b66122db0a019e769b965f/69a252243d308613-57/s250x400/befdea35539d7b1a63f21c08014fa628f51539c0.pnj',
  'rhianu-unigol': 'https://64.media.tumblr.com/ac390742b48f4843b76e339e98886270/69a252243d308613-af/s250x400/5fe9180763d476c32ccb19ad66a4ea9dfe8baf76.pnj',
  'eirwyn-eirth': 'https://64.media.tumblr.com/feb61977d6017c49ee77394d32d89fd4/ef7b451a93b548d3-53/s250x400/3e84e372a55fa0e3aa537596fa8251626b76b6a3.pnj',
  'cledwyn-selwyn': 'https://64.media.tumblr.com/cc8db6c1746ef20b94ea76b97695f8bf/a6c27039f48ce8c7-72/s250x400/3e2a47ee5e45a75c0d94d104c43f47111b99cd54.pnj',
  'tawny-unigol': 'https://64.media.tumblr.com/1e59ee5c8985970d65da71c6b354bce2/69a252243d308613-91/s250x400/8665d59322aabb643bdb51a9ea155bed2e49ea6f.pnj',
  'lleulu-unigol': 'https://64.media.tumblr.com/0613f0a77e16d3e4a813bfc9646c0892/69a252243d308613-47/s250x400/0cbe2b9af2d116c3e2e7ba065fb1b24954df0f85.pnj',
  'rhys-unigol': 'https://64.media.tumblr.com/c48fca1891189c99c4d5af1f45dd99ca/69a252243d308613-e3/s250x400/e944e59b680b7effc76d0b52dad88ed28bd65925.pnj',
  'unig-unigol': 'https://64.media.tumblr.com/e93fd18fe1878204b45131b069454dba/69a252243d308613-5d/s250x400/2e746e49cff9693ea611b437ccb2609f662ce12e.pnj',
  'gwen-unigol': 'https://64.media.tumblr.com/48df0913b3250f9c220bae4c97672eaa/69a252243d308613-20/s250x400/647df7cc280617e6e90d1c753650ae7fb44a611b.pnj'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_UNIGOL_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Ausgearbeitete Gegenakten bleiben die kanonische Bildquelle geteilter
// Weltpersonen. Wiederholte Standardsilhouetten der Altquelle werden ausgelassen.
export const HOUSE_UNIGOL_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'trahaern-arth': HOUSE_ARTH_PORTRAITS['trahaern-arth'],
  'gwennan-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['gwennan-dienyddiwr'],
  'maelgwn-chiffyddlon': HOUSE_CHIFFYDDLON_PORTRAITS['maelgwn-chiffyddlon'],
  'cefinwen-crefyddol': HOUSE_CREFYDDOL_PORTRAITS['cefinwen-crefyddol'],
  'penkawr-unigol': HOUSE_CREFYDDOL_PORTRAITS['penkawr-unigol'],
  'morganwg-sgwarnog': HOUSE_SGWARNOG_PORTRAITS['morganwg-sgwarnog'],
  'ewynn-unigol': HOUSE_SGWARNOG_PORTRAITS['ewynn-unigol'],
  'llewella-1699-canwyll': HOUSE_CANWYLL_PORTRAITS['llewella-1699-canwyll'],
  'wynston-unigol': HOUSE_CANWYLL_PORTRAITS['wynston-unigol']
});
