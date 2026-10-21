import { NOTICE_SEALS } from '../../assets/js/seals/notice-seals-model.mjs';
import { buildEgonNoticeIdentity } from './egon-gafyr.mjs';

const signatureRoot = 'assets/images/issuers/signatures';
const profiles = {
  muireann: ['Muireann', 'baeurlich'],
  maonaid: ['Maonaid', 'buergerlich'],
  'cenwyn-annwyl': ['Sir Cenwyn Annwyl', 'buergerlich'],
  efa: ['Efa', 'baeurlich'],
  'brinthan-argall': ['Brinthan Argall', 'buergerlich'],
  'meurig-glyn': ['Meurig Glyn', 'baeurlich'],
  'malwyn-marve-brogar': ['Malwyn & Marve Brogar', 'buergerlich'],
  bobi: ['Bobi', 'baeurlich'],
  'gareth-talfryn': ['Gareth Talfryn', 'baeurlich'],
  'gwydion-rhyddid': ['Sir Gwydion Rhyddid', 'buergerlich'],
};

export const NOTICE_SIGNOFF_ASSIGNMENTS = Object.freeze({
  'gwynthor-fearnan-die-verschwundene-schatulle': 'muireann',
  'gwynthor-torvik-seit-lyristag-vermisst': 'maonaid',
  'gwynthor-torvik-seit-lyristag-vermisst-haldor': 'maonaid',
  'llysfaen-schwarzer-zitteraal': 'egon-gafyr',
  'llysfaen-feuerstollen': 'cenwyn-annwyl',
  'llysfaen-mabli': 'efa',
  'llysfaen-hoher-besuch': 'brinthan-argall',
  'llysfaen-hof-glyn': 'meurig-glyn',
  'llysfaen-pferdediebstahl': 'brinthan-argall',
  'llysfaen-brogars-hilfe': 'malwyn-marve-brogar',
  'llysfaen-bobi-erlenglanz': 'bobi',
  'llysfaen-crewe-hof': 'gareth-talfryn',
  'llysfaen-gemeinschaft': 'gwydion-rhyddid',
  'llysfaen-wasserloch': 'brinthan-argall',
});

export function signoffForNotice(id) {
  const issuer = NOTICE_SIGNOFF_ASSIGNMENTS[id];
  if (!issuer) return null;
  if (issuer === 'egon-gafyr') {
    const identity = buildEgonNoticeIdentity();
    return { verfasserName: 'Sir Egon Gafyr', unterschrift: identity.unterschrift, siegel: identity.siegel,
      media: { unterschrift: identity.media.unterschrift, siegel: identity.media.siegel } };
  }
  const [name, sealId] = profiles[issuer];
  const seal = NOTICE_SEALS.find(entry => entry.id === sealId);
  const signature = `${signatureRoot}/${issuer}/unterschrift-v1.png`;
  return { verfasserName: name, unterschrift: signature, siegel: seal.src,
    media: {
      unterschrift: { kind: 'image', name: `${name} · Unterschrift`, src: signature, fit: 'cover', position: 'center' },
      siegel: { kind: 'image', name: `Wachssiegel · ${seal.name}`, src: seal.src, fit: 'contain', position: 'center' },
    } };
}

export function buildNoticeSignoffUpdates(ids) {
  return ids.flatMap(id => {
    const signoff = signoffForNotice(id);
    if (!signoff) return [];
    return [{ id: `${id}:20261021-fill-empty-signoff`, noticeId: id, fields: [
      ...['verfasserName', 'unterschrift', 'siegel'].map(field => ({ field, fillEmpty: true, to: signoff[field] })),
      ...Object.entries(signoff.media).map(([slot, to]) => ({ field: `media.${slot}`, fillEmpty: true, to })),
    ] }];
  });
}
