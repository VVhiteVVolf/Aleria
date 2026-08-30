const PORTRAIT_ROOT = 'assets/images/portraits/haus-iomrach';

export const HOUSE_IOMRACH_LOCAL_PORTRAIT_FILES = Object.freeze({
  'conan-founder-iomrach': 'conan-founder-iomrach.png',
  'bearnard-iomrach': 'bearnard-iomrach.png',
  'keava-iomrach': 'keava-iomrach.png',
  'purseil-iomrach': 'purseil-iomrach.png',
  'meallan-iomrach': 'meallan-iomrach.png',
  'fearghas-iomrach': 'fearghas-iomrach.png',
  'donnacha-iomrach': 'donnacha-iomrach.png',
  'ybhna-iomrach': 'ybhna-iomrach.png',
  'keiran-iomrach': 'keiran-iomrach.png',
  'tuala-iomrach': 'tuala-iomrach.png',
  'zilda-iomrach': 'zilda-iomrach.png',
  'conan-iomrach': 'conan-iomrach.png'
});

export const HOUSE_IOMRACH_LOCAL_PORTRAIT_IDS = Object.freeze(
  Object.keys(HOUSE_IOMRACH_LOCAL_PORTRAIT_FILES)
);

export const HOUSE_IOMRACH_REUSED_PORTRAIT_IDS = Object.freeze([
  'geallan-cruthin',
  'fionnchu-somhairle',
  'breanna-somhairle'
]);

export const HOUSE_IOMRACH_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.entries(HOUSE_IOMRACH_LOCAL_PORTRAIT_FILES).map(
    ([personId, fileName]) => [personId, `${PORTRAIT_ROOT}/${fileName}`]
  )),
  'geallan-cruthin': 'assets/images/portraits/haus-dal-cruthin/geallan-cruthin.png',
  'fionnchu-somhairle': 'assets/images/portraits/haus-sidhe-somhairle/fionnchu-somhairle.png',
  'breanna-somhairle': 'assets/images/portraits/haus-sidhe-somhairle/breanna-somhairle.png'
});
