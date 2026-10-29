// Explicit acceptance on 28 October 2026. Stable preview identifiers are retained.
export const REALM_DECISIONS = Object.freeze({
  aldingen: { name: 'Aldingen', title: 'Großherzogtum Aldingen', type: 'Großherzogtum', continent: 'Lothir', capital: 'klingenhagen', ruler: 'klingen', rootId: 'grossherzogtum-aldingen' },
  goldmund: { name: 'Goldmund', title: 'Herzogtum Goldmund', type: 'Herzogtum', continent: 'Lothir', capital: 'thronholt', ruler: 'goldveld', rootId: 'herzogtum-goldmund', aliases: ['fuerstentum-goldmund'] },
  weisenfluh: { name: 'Weisenfluh', title: 'Königreich Weisenfluh', type: 'Königreich', continent: 'Lothir', capital: 'ewigensee', ruler: 'goldkranz', rootId: 'koenigreich-weisenfluh' },
  moinneach: { name: 'Moinneach', title: 'Fürstentum Moinneach', type: 'Fürstentum', continent: 'Lothir', capital: 'gergonax', ruler: 'cethrenn', rootId: 'fuerstentum-moinneach', aliases: ['fuerstentum-moinneachs', 'moinneachs'], selectedVariant: 'original' },
  iathneach: { name: 'Iathneach', title: 'Fürstentum Iathneach', type: 'Fürstentum', continent: 'Lothir', capital: 'botharin', ruler: 'cetchathach', rootId: 'fuerstentum-iathneach' },
  deitheach: { name: 'Deitheach', title: 'Fürstentum Deitheach', type: 'Fürstentum', continent: 'Aldervan', capital: 'ailseag', ruler: 'ard-roth', rootId: 'fuerstentum-deitheach', historical: true, occupier: 'triarchie' },
  triarchie: { name: 'Triarchie', title: 'Die Triarchie · Besetztes Lothir', type: 'Besatzungsgebiet', continent: 'Lothir', capital: '', ruler: '', rootId: 'triarchie-lothir', occupied: true },
});

export const MOINNEACH_NAMES = Object.freeze({ adruinna: 'Nic Adruinna', kerlaouen: 'Nic Kerlaouen', caddach: 'Ard Caddach', rowak: 'Mac Rowak', barrex: 'An Barrex', cethrenn: 'Tir An Cethrenn', damona: 'Dál Damona', avernax: 'Ard Avernax', brigantex: 'Ua Brigantex', keravel: 'Na Keravel', nemetex: 'Ord Nemetex' });
export const WESTERN_NAMES = Object.freeze({ aldingen: { rothmann: 'Rothman' }, goldmund: { broeck: 'Broek' }, weisenfluh: { honigfeld: 'Honigblüt' } });
export const LOCAL_RULERS = Object.freeze({
  aldingen: { barenstadt: 'ritten', borgeln: 'rothmann', hasselt: 'velten', grimberg: 'hohenmund', zollern: 'truchsen', bruchen: 'rebhart', klingenhagen: 'klingen', aldershafen: 'adharcan', welden: 'rosswarth', sassel: 'ronnach', dreiken: 'ankerhold' },
  goldmund: { thronholt: 'goldveld', brakenstein: 'broeck', bregen: 'aurelshain', haarlen: 'lanette', bramsen: 'seidenwarth', niedenfels: 'silberhorst', hartenstein: 'falkengold', aldermoor: 'herzau' },
  weisenfluh: { ewigensee: 'goldkranz', weisshort: 'sommerfeld', seeblick: 'silberthal', ewiggruen: 'rosenbluth', weisslauf: 'weissmann', hohenklamm: 'damhcallan', maehrenfeld: 'honigfeld', silbermundt: 'edelweiss', weissklippe: 'sgaireag', wolfrieden: 'wolfenstein', brueckenwacht: 'bruggemann', ottersburg: 'otterberg', weissthal: 'thalmann', aehrensass: 'die-ritter-der-kornahre' },
  moinneach: { gergonax: 'cethrenn', tarvex: 'rowak', druanax: 'kerlaouen', drunemax: 'damona', amabactoix: 'caddach', vironax: 'adruinna', arvonax: 'avernax', taranux: 'brigantex', senodex: 'keravel', camulax: 'nemetex' },
  iathneach: { botharin: 'cetchathach', 'sgeir-tearmainn': 'farraigeach', fiontarach: 'salaig', tirnafaoi: 'cannog', mharaich: 'tairise', famhair: 'muiredaigh', sidheanna: 'rieach', ailtean: 'treathai' },
  deitheach: { ailseag: 'ard-roth', beartain: 'neill', dreasail: 'caolan', carthain: 'duach', uamhar: 'ardmhair', sceolan: 'trodach', loscarn: 'torcmhar', muirdean: 'snaith', treabhair: 'tuairne' },
});

export const RANK_LABELS = Object.freeze({ royal: 'König', ducal: 'Herzog', county: 'Graf', freiherr: 'Freiherr', junker: 'Junker', ministerial: 'Ministerialer', 'ard-tiarna': 'Ard Tiarna', 'mor-tiarna': 'Mor Tiarna', 'dun-tiarna': 'Dún Tiarna', laird: 'Laird', 'knightly-order': 'Geistlicher Ritterorden', unknown: 'Offen' });

export function rankForAlbic(realm, id, seat) {
  if (realm === 'moinneach') return id === 'cethrenn' ? 'ard-tiarna' : 'laird';
  if (realm === 'iathneach') return id === 'cetchathach' ? 'ard-tiarna' : 'laird';
  if (realm === 'deitheach') return id === 'ard-roth' ? 'ard-tiarna' : ['neill', 'caolan', 'duach'].includes(id) ? 'mor-tiarna' : id === 'tuairne' ? 'dun-tiarna' : 'laird';
  if (realm === 'triarchie') {
    if (seat.originRealm === 'iathneach') return seat.kind.includes('Dún') ? 'dun-tiarna' : 'laird';
    return seat.kind.includes('Gräfliche') ? 'county' : seat.kind === 'Herrschaft' ? 'junker' : 'freiherr';
  }
  return 'unknown';
}
