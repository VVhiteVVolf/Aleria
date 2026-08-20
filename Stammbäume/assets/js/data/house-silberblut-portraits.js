const PORTRAIT_ROOT = 'assets/images/portraits/haus-silberblut';

export const HOUSE_SILBERBLUT_LOCAL_PORTRAIT_FILES = Object.freeze({
  'wulfgar-goldglanz': 'wulfgar-goldglanz.png',
  'fodnir-silberblut': 'fodnir-silberblut.png',
  'ragnar-silberblut': 'ragnar-silberblut.png',
  'mirmir-silberblut': 'mirmir-silberblut.png',
  'askold-silberblut': 'askold-silberblut.png',
  'gardar-silberblut': 'gardar-silberblut.png',
  'asbjorn-feuerherz': 'asbjorn-feuerherz.png',
  'egil-vragi': 'egil-vragi.png',
  'svandis-silberblut': 'svandis-silberblut.png',
  'undral-silberblut': 'undral-silberblut.png',
  'finnur-eisenbieger': 'finnur-eisenbieger.png',
  'thongvir-silberblut': 'thongvir-silberblut.png',
  'tengir-silberblut': 'tengir-silberblut.png',
  'alrik-silberblut': 'alrik-silberblut.png',
  'kjetill-silberblut': 'kjetill-silberblut.png',
  'jurgen-silberblut': 'jurgen-silberblut.png',
  'tova-silberblut': 'tova-silberblut.png'
});

export const HOUSE_SILBERBLUT_PORTRAIT_SOURCES = Object.freeze({
  'wulfgar-goldglanz': 'https://i.imgur.com/OiMAywV.png',
  'fodnir-silberblut': 'https://i.imgur.com/frKpHUP.png',
  'ragnar-silberblut': 'https://i.imgur.com/udFjXKS.png',
  'mirmir-silberblut': 'https://i.imgur.com/hxjhpQQ.png',
  'askold-silberblut': 'https://i.imgur.com/Of2JMrT.png',
  'gardar-silberblut': 'https://i.imgur.com/6ANocwr.png',
  'asbjorn-feuerherz': 'https://i.imgur.com/sw12u7m.png',
  'egil-vragi': 'https://i.imgur.com/angiCC2.png',
  'svandis-silberblut': 'https://i.imgur.com/iZ5uFqw.png',
  'undral-silberblut': 'https://i.imgur.com/zwsC1BF.png',
  'finnur-eisenbieger': 'https://i.imgur.com/dAQqkXJ.png',
  'thongvir-silberblut': 'https://i.imgur.com/WuEzybO.png',
  'tengir-silberblut': 'https://i.imgur.com/aco3Z76.png',
  'alrik-silberblut': 'https://i.imgur.com/U4VWlzd.png',
  'kjetill-silberblut': 'https://i.imgur.com/op7ki08.png',
  'jurgen-silberblut': 'https://i.imgur.com/2BRWxcW.png',
  'tova-silberblut': 'https://i.imgur.com/uRVDXSP.png'
});

export const HOUSE_SILBERBLUT_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_SILBERBLUT_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));
