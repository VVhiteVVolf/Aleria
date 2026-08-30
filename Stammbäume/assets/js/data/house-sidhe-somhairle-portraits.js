const PORTRAIT_ROOT = 'assets/images/portraits/haus-sidhe-somhairle';

export const HOUSE_SIDHE_SOMHAIRLE_LOCAL_PORTRAIT_FILES = Object.freeze({
  'siomhrach-founder-somhairle': 'siomhrach-founder-somhairle.png',
  'oighreag-somhairle': 'oighreag-somhairle.png',
  'searlas-somhairle': 'searlas-somhairle.png',
  'muiredach-somhairle': 'muiredach-somhairle.png',
  'proinnseas-somhairle': 'proinnseas-somhairle.png',
  'klaihn-somhairle': 'klaihn-somhairle.png',
  'jonaire-somhairle': 'jonaire-somhairle.png',
  'quinlan-somhairle': 'quinlan-somhairle.png',
  'cinnia-somhairle': 'cinnia-somhairle.png',
  'oisean-somhairle': 'oisean-somhairle.png',
  'ailidh-somhairle': 'ailidh-somhairle.png',
  'lisair-somhairle': 'lisair-somhairle.png',
  'fionnchu-somhairle': 'fionnchu-somhairle.png',
  'wihalg-somhairle': 'wihalg-somhairle.png',
  'hectan-somhairle': 'hectan-somhairle.png',
  'breanna-somhairle': 'breanna-somhairle.png',
  'pol-somhairle': 'pol-somhairle.png',
  'zephen-somhairle': 'zephen-somhairle.png'
});

export const HOUSE_SIDHE_SOMHAIRLE_LOCAL_PORTRAIT_IDS = Object.freeze(
  Object.keys(HOUSE_SIDHE_SOMHAIRLE_LOCAL_PORTRAIT_FILES)
);

export const HOUSE_SIDHE_SOMHAIRLE_REUSED_PORTRAIT_IDS = Object.freeze([
  'uinseann-trodach',
  'oydis-helgr',
  'fearghus-1699-cruthin',
  'ybhna-iomrach',
  'hurracan-frisealach',
  'conan-iomrach',
  'eibhear-somhairle',
  'blathnaid-blar',
  'zearlach-blar'
]);

export const HOUSE_SIDHE_SOMHAIRLE_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.entries(HOUSE_SIDHE_SOMHAIRLE_LOCAL_PORTRAIT_FILES).map(
    ([personId, fileName]) => [personId, `${PORTRAIT_ROOT}/${fileName}`]
  )),
  'uinseann-trodach': 'assets/images/portraits/haus-ard-trodach/uinseann-trodach.png',
  'oydis-helgr': 'assets/images/portraits/haus-helgr/oydis-helgr.png',
  'fearghus-1699-cruthin': 'assets/images/portraits/haus-dal-cruthin/fearghus-1699-cruthin.png',
  'ybhna-iomrach': 'assets/images/portraits/haus-iomrach/ybhna-iomrach.png',
  'hurracan-frisealach': 'assets/images/portraits/haus-ard-frisealach/hurracan-frisealach.png',
  'conan-iomrach': 'assets/images/portraits/haus-iomrach/conan-iomrach.png',
  'eibhear-somhairle': 'assets/images/portraits/haus-helgr/eibhear-somhairle.png',
  'blathnaid-blar': 'assets/images/portraits/haus-nic-blar/blathnaid-blar.png',
  'zearlach-blar': 'assets/images/portraits/haus-nic-blar/zearlach-blar.png'
});
