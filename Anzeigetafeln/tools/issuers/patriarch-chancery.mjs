import { EUDDOGWY } from '../../../AleriaAlmanach/modules/gwynthor-cathedral/patriarch-adjutant.mjs';
export { EUDDOGWY };

const art = 'assets/images/notices/lleuwens-anhoerung';
const signature = `${art}/euddogwy-unterschrift-v1.webp`;
const seal = `${art}/kirchen-wachssiegel-v1.webp`;

export function patriarchChanceryIssuer(emblem, emblemName) {
  return {
    verfasser: EUDDOGWY.portrait,
    verfasserName: `${EUDDOGWY.name} · Kurator und persönlicher Adjutant des Patriarchen`,
    unterschrift: signature, siegel: seal, emblem,
    typography: { font: 'patrickhand', heading: 'template', script: 'common' },
    media: {
      verfasser: { kind: 'character', personId: EUDDOGWY.id, name: EUDDOGWY.name, src: EUDDOGWY.portrait, fit: 'cover', position: 'top' },
      unterschrift: { kind: 'image', name: `${EUDDOGWY.name} · Unterschrift`, src: signature, fit: 'contain', position: 'center' },
      siegel: { kind: 'image', name: 'Wachssiegel der patriarchalen Kanzlei · flammender Kelch', src: seal, fit: 'contain', position: 'center' },
      emblem: { kind: 'image', name: emblemName, src: emblem, fit: 'contain', position: 'center' },
    },
  };
}
