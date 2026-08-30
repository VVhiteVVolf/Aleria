import { HOUSE_NACHTJAEGER_PORTRAITS } from './house-nachtjaeger-portraits.js';
import { HOUSE_NIC_CAOIMHE_PORTRAITS } from './house-nic-caoimhe-portraits.js';
import { HOUSE_SIDHE_SOMHAIRLE_PORTRAITS } from './house-sidhe-somhairle-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-nic-blar';

export const HOUSE_NIC_BLAR_LOCAL_PORTRAIT_FILES = Object.freeze({
  'tuathlaith-blar': 'tuathlaith-blar.png',
  'gormfhlaith-blar': 'gormfhlaith-blar.png',
  'blathnaid-blar': 'blathnaid-blar.png',
  'torlaith-blar': 'torlaith-blar.png',
  'pallaith-blar': 'pallaith-blar.png',
  'zearlach-blar': 'zearlach-blar.png',
  'jaimhin-blar': 'jaimhin-blar.png',
  'stiofan-blar': 'stiofan-blar.png',
  'sceolaith-blar': 'sceolaith-blar.png',
  'moirin-blar': 'moirin-blar.png',
  'roisin-blar': 'roisin-blar.png',
  'maonait-blar': 'maonait-blar.png',
  'nalainn-blar': 'nalainn-blar.png',
  'gobaith-blar': 'gobaith-blar.png',
  'sluagh-blar': 'sluagh-blar.png',
  'hascan-blar': 'hascan-blar.jpeg',
  'wunbhna-blar': 'wunbhna-blar.png',
  'nuala-blar': 'nuala-blar.jpeg',
  'reathnaigh-blar': 'reathnaigh-blar.png',
  'zephen-blar': 'zephen-blar.png',
  'damhnait-1727-blar': 'damhnait-1727-blar.png',
  'vardon-blar': 'vardon-blar.png'
});

export const HOUSE_NIC_BLAR_LOCAL_PORTRAIT_IDS = Object.freeze(
  Object.keys(HOUSE_NIC_BLAR_LOCAL_PORTRAIT_FILES)
);

export const HOUSE_NIC_BLAR_REUSED_PORTRAIT_IDS = Object.freeze([
  'searlas-somhairle',
  'jonaire-somhairle',
  'ciannait-caoimhe',
  'inghild-nachtjaeger'
]);

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_NIC_BLAR_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_NIC_BLAR_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'searlas-somhairle': HOUSE_SIDHE_SOMHAIRLE_PORTRAITS['searlas-somhairle'],
  'jonaire-somhairle': HOUSE_SIDHE_SOMHAIRLE_PORTRAITS['jonaire-somhairle'],
  'ciannait-caoimhe': HOUSE_NIC_CAOIMHE_PORTRAITS['ciannait-caoimhe'],
  'inghild-nachtjaeger': HOUSE_NACHTJAEGER_PORTRAITS['inghild-nachtjaeger']
});
