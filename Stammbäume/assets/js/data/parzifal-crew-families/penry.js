export const PENRY_EXPANSION = {
  surname: 'Penry',
  description: 'Bürgerhaus aus Talgarth. Rhun Penry, der 74-jährige Vogt der Arth, ist Meleris Großvater; sein 52-jähriger jüngerer Bruder Iorwerth ist ihr Großonkel.',
  people: [
    'Meurig|m|1628|1694', 'Rhydderch|m|1648|1720', 'Bran|m|1652|1726',
    'Rhun|m|1666', 'Ffraid|f|1674', 'Iorwerth|m|1688', 'Cadoc|m|1680',
    'Bedwyr|m|1690', 'Arian|f|1693', 'Meleri|f|1712', 'Maelban|m|1713',
    'Gwen|f|1717', 'Peredur|m|1720', 'Nesta|f|1718', 'Dylan|m|1721',
    'Gwynd|m|1698', 'Alys|f|1726', 'Gethin|m|1730', 'Elidyr|m|1710',
    'Tegan|f|1715', 'Ioan|m|1733', 'Luned|f|1707', 'Edern|m|1711'
  ],
  couples: [
    ['Meurig', 'Elen|f|1630|1697', ['Rhydderch', 'Bran']],
    ['Rhydderch', 'Mair|f|1646|1715', ['Rhun', 'Ffraid', 'Iorwerth']],
    ['Bran', 'Gwenna|f|1657|1731', ['Cadoc']],
    ['Rhun', 'Gwenllian|f|1670', ['Bedwyr', 'Arian']],
    ['Bedwyr', 'Rhoswen|f|1693', ['Meleri', 'Maelban', 'Gwen', 'Peredur']],
    ['Arian', 'Rhys|m|1689', ['Nesta', 'Dylan']],
    ['Ffraid', 'Madoc|m|1670|1733', ['Gwynd']],
    ['Gwynd', 'Efa|f|1702', ['Alys', 'Gethin']],
    ['Iorwerth', 'Alaw|f|1692', ['Elidyr', 'Tegan']],
    ['Elidyr', 'Heledd|f|1712', ['Ioan']],
    ['Cadoc', 'Dilys|f|1684', ['Luned', 'Edern']]
  ],
  personPatches: {
    'rhun-penry': { title: 'Vogt des Hauses Arth · Meleris Großvater' },
    'iorwerth-penry': { title: 'Quartiermeister der Dychwelyd',
      portrait: '../AleriaAlmanach/assets/ship-crews/parzifals-schiffsmannschaft/source-2026-10-06/iorwerth-penry.png',
      notes: '52 Jahre. Jüngerer Bruder Rhun Penrys, des Vogtes der Arth; Großonkel von Meleri und Maelban. Neu aufgenommenes Mannschaftsmitglied.' }
  }
};
