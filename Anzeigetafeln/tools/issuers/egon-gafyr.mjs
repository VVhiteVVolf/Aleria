const art = 'assets/images/issuers/egon-gafyr';
export const EGON_NOTICE_PORTRAIT = '../Stammb%C3%A4ume/assets/images/portraits/haus-gafyr/egon-gafyr.jpg';
export const EGON_NOTICE_EMBLEM = '../Stammb%C3%A4ume/assets/images/houses/Llamreis%20Ankunft/haus-gafyr.png';
export const EGON_NOTICE_SIGNATURE = `${art}/unterschrift-v1.png`;
export const EGON_NOTICE_SEAL = `${art}/wachssiegel-v1.png`;

export function buildEgonNoticeIdentity() {
  return { verfasser: EGON_NOTICE_PORTRAIT, emblem: EGON_NOTICE_EMBLEM, unterschrift: EGON_NOTICE_SIGNATURE, siegel: EGON_NOTICE_SEAL,
    media: {
      verfasser: { kind: 'character', familyId: 'haus-gafyr', personId: 'egon-gafyr', name: 'Sir Egon Gafyr', src: EGON_NOTICE_PORTRAIT, fit: 'cover', position: 'top' },
      unterschrift: { kind: 'image', name: 'Egon Gafyr · Unterschrift', src: EGON_NOTICE_SIGNATURE, fit: 'cover', position: 'center' },
      siegel: { kind: 'image', name: 'Wachssiegel des Marschalls · Egon Gafyr', src: EGON_NOTICE_SEAL, fit: 'contain', position: 'center' },
      emblem: { kind: 'image', name: 'Haus Gafyr', src: EGON_NOTICE_EMBLEM, fit: 'contain', position: 'center' },
    } };
}
