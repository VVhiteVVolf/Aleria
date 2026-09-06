const CLASS_PAGE_ICONS = Object.freeze({
  'cenyr-milwr': { pageName: 'Milwr', source: 'https://i.imgur.com/zj8Kobl.png' },
  teulu: { pageName: 'Teulu', source: 'https://i.imgur.com/ocBxSrC.png' },
  cantref: { pageName: 'Cantref', source: 'https://i.imgur.com/10LmjQR.png' },
  helwyr: { pageName: 'Helwyr', source: 'https://i.imgur.com/HjxiJxW.png' },
  uchelwyr: { pageName: 'Uchelwyr', source: 'https://i.imgur.com/J1dBp5C.png' },
  arthwyr: { pageName: 'Arthwyr', source: 'https://i.imgur.com/xGZMBX2.png' },
  barddwyr: { pageName: 'Barddwyr', source: 'https://i.imgur.com/HvWlZul.png' },
  morwyr: { pageName: 'Morwyr', source: 'https://i.imgur.com/FzoXhtJ.png' },
  rhyfelwyr: { pageName: 'Rhyfelwyr', source: 'https://i.imgur.com/Jh8DGNz.png' },
  ceidwynr: { pageName: 'Ceidwyn', source: 'https://i.imgur.com/k7eQ3Kt.png' },
  rhiddwyrr: { pageName: 'Rhiddwyr', source: 'https://i.imgur.com/UnjMmYp.png' },
  derwyn: { pageName: 'Derwyn', source: 'https://i.imgur.com/oaYwMOs.png' },
  kern: { pageName: 'Kern', source: 'https://i.imgur.com/E92CDhq.png' },
  cateran: { pageName: 'Cateran', source: 'https://i.imgur.com/ZZSDo2z.png' },
  mormaer: { pageName: 'Mormaer', source: 'https://i.imgur.com/vCXWd55.png' },
  serf: { pageName: 'Serf', source: 'https://i.imgur.com/qwsuhcH.png' },
  airig: { pageName: 'Airig', source: 'https://i.imgur.com/oxk3dMj.png' },
  currach: { pageName: 'Currach', source: 'https://i.imgur.com/raG2iIO.png' },
  'ceolaire-piobaire': { pageName: 'Ceólaire & Piobaire', source: 'https://i.imgur.com/JmtKs6F.png' },
  riada: { pageName: 'Riada', source: 'https://i.imgur.com/BmaklcS.png' },
  silvaner: { pageName: 'Silvaner', source: 'https://i.imgur.com/McVUKVQ.png' },
  galloghlaigh: { pageName: 'Galloghlaigh', source: 'https://i.imgur.com/T387Q5y.png' },
  fathach: { pageName: 'Fathach', source: 'https://i.imgur.com/NAEUMM1.png' },
  'hird-maid': { pageName: 'Hird/Maid', source: 'https://i.imgur.com/DXELbM2.png' },
  skjoldr: { pageName: 'Skjoldr', source: 'https://i.imgur.com/rlVtCrn.png' },
  thegnar: { pageName: 'Thegnar', source: 'https://i.imgur.com/Z081bE6.png' },
  skeidr: { pageName: 'Skeidr', source: 'https://i.imgur.com/RMS1Joo.png' },
  skjaldr: { pageName: 'Skjaldr', source: 'https://i.imgur.com/TjnJlHf.png' },
  skytte: { pageName: 'Skytte', source: 'https://i.imgur.com/kUMAEYt.png' },
  skalde: { pageName: 'Skalde', source: 'https://i.imgur.com/wAuI5MD.png' },
  magier: { pageName: 'Magier', source: 'https://i.imgur.com/n5A2PlT.png' },
  kleriker: { pageName: 'Kleriker', source: 'https://i.imgur.com/05uOAbw.png' },
  hexer: { pageName: 'Paktträger', source: 'https://i.imgur.com/5Dkv7Ri.png' },
  asket: { pageName: 'Asket', source: 'https://i.imgur.com/zCXtHAy.png' }
});

const CLASS_PAGE_ICON_ALIASES = Object.freeze({
  ceidwyn: CLASS_PAGE_ICONS.ceidwynr,
  rhiddwyr: CLASS_PAGE_ICONS.rhiddwyrr,
  'vennyr-milwr': { pageName: 'Milwr', source: 'https://i.imgur.com/2wdIWQ2.png' },
  pakttrager: CLASS_PAGE_ICONS.hexer,
  hexenmeister: CLASS_PAGE_ICONS.hexer,
  monch: CLASS_PAGE_ICONS.asket,
  paladin: { pageName: 'Eidgeschworener', source: 'https://i.imgur.com/mWd46UL.png' },
  eidgeschworener: { pageName: 'Eidgeschworener', source: 'https://i.imgur.com/mWd46UL.png' },
  lehensritter: CLASS_PAGE_ICONS.teulu,
  plunderer: CLASS_PAGE_ICONS.cateran,
  raubritter: CLASS_PAGE_ICONS.teulu,
  schutze: CLASS_PAGE_ICONS.helwyr,
  skaldin: CLASS_PAGE_ICONS.skalde,
  waffenknecht: { pageName: 'Milwr', source: 'https://i.imgur.com/zj8Kobl.png' }
});

function normalizeClassKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getClassPageIcon(classId = '') {
  const key = normalizeClassKey(classId);
  const entry = CLASS_PAGE_ICONS[key] || CLASS_PAGE_ICON_ALIASES[key];
  return entry ? { id: key, ...entry } : null;
}

export function getClassPageIconSource(classId = '') {
  return getClassPageIcon(classId)?.source || '';
}

export function getClassPageIconEntries() {
  return Object.entries(CLASS_PAGE_ICONS).map(([id, entry]) => ({ id, ...entry }));
}

export function getClassPageIconAliases() {
  return Object.entries(CLASS_PAGE_ICON_ALIASES).map(([id, entry]) => ({ id, ...entry }));
}
