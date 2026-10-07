// Editorial directory metadata only: never used to identify or price an offer.
// IDs refer to the existing modules, including modules saved in the module store.
const regionalArt = '../Stammbäume/assets/images/regions/';
const gwynthorArt = '../Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/assets/etablissements/';

export const PROVIDER_TRADES = Object.freeze([
  { id: 'brewers', label: 'Brauer & Brenner', image: './public/assets/brewer-guilds/nav-brauer-brenner.png' },
  { id: 'inns', label: 'Wirte & Herbergen', image: '../IconOrdner/Orts Pins/Gasthof.png' },
  { id: 'salons', label: 'Freudenhäuser & Salons', image: '../IconOrdner/Orts Pins/Bordell-removebg-preview.png' },
  { id: 'studs', label: 'Gestüte & Rosszüchter', image: '../IconOrdner/ZunftsWappen/Rosszucht.png' },
  { id: 'other', label: 'Weitere Sortimente', image: '../IconOrdner/Universal Pins/Gemischtwarenhändler.png' }
]);

export const PROVIDER_REGIONS = Object.freeze({
  'celtigerns-wacht': { id: 'celtigerns-wacht', label: 'Celtigerns Wacht', realm: 'Königreich Cenyr', image: `${regionalArt}celtigerns-wacht.png` },
  sonnenkueste: { id: 'sonnenkueste', label: 'Sonnenküste', realm: 'Königreich Cenyr', image: `${regionalArt}sonnenkueste.png` },
  'vortigerns-ruh': { id: 'vortigerns-ruh', label: 'Vortigerns Ruh', realm: 'Königreich Cenyr', image: `${regionalArt}vortigerns-ruh.png` },
  'tir-na-tonn': { id: 'tir-na-tonn', label: 'Tír na Tonn', realm: 'Fürstentum Leitheach', image: `${regionalArt}Leitheach/tir-na-tonn.png` },
  unassigned: { id: 'unassigned', label: 'Ohne Ortszuordnung', realm: '', image: './public/assets/dashboard/compass.svg' }
});

const directory = Object.freeze({
  'gortach-brauerei': { tradeId: 'brewers', regionId: 'tir-na-tonn', location: 'Broch an Ear' },
  'teyrngarch-brauerzunft': { tradeId: 'brewers', regionId: 'sonnenkueste', location: 'Aberon' },
  'penderyn-brauer-destillierzunft': { tradeId: 'brewers', regionId: 'vortigerns-ruh', location: 'Drakenburg' },
  'celtigerns-letzte-rast': { tradeId: 'inns', regionId: 'celtigerns-wacht', location: 'Gwynthor · Adelsdistrikt', image: `${gwynthorArt}celtigerns-letzte-rast.png` },
  'modul-1781474092957': { tradeId: 'inns', regionId: 'celtigerns-wacht', location: 'Gwynthor · Osttor & Hafen', image: `${gwynthorArt}krumme-kanne.png` },
  'zum-roten-drachen-taverne': { tradeId: 'inns', regionId: 'celtigerns-wacht', location: 'Morddwr · Llamreis Ankunft' },
  'die-lachende-nixe': { tradeId: 'salons', regionId: 'celtigerns-wacht', location: 'Gwynthor · Südliche Docks', image: `${gwynthorArt}lachende-nixe.png` },
  'herberge-bei-owains-anwesen': { tradeId: 'inns', location: 'Bei Owains Anwesen', image: './public/assets/item-register/providers/owains-herberge.png' },
  'modul-1781813764249': { tradeId: 'studs', location: 'Owains Anwesen', image: '../Orte/modules/merchants/assets/stud.png' }
});

// These exact original signs already exist locally. Custom replacement artwork
// in the module still takes precedence; only the known originals are mirrored.
const localSigns = Object.freeze({
  'https://i.imgur.com/c9Q2tPn.png': `${gwynthorArt}celtigerns-letzte-rast.png`,
  'https://i.imgur.com/Ah2Bau8.png': `${gwynthorArt}krumme-kanne.png`,
  'https://i.imgur.com/oZUJ5Qv.png': `${gwynthorArt}lachende-nixe.png`,
  'https://i.imgur.com/EXqlDw8.png': '../Orte/modules/merchants/assets/stud.png',
  'https://i.imgur.com/MuwLhG4.png': './public/assets/item-register/providers/roter-drache.png'
});

export function providerImage(source) { return localSigns[source] || source; }

export function providerDirectoryEntry(listId) {
  const entry = directory[String(listId || '').replace(/^module:/, '')] || {};
  const trade = PROVIDER_TRADES.find(trade => trade.id === entry.tradeId) || PROVIDER_TRADES.at(-1);
  return { trade, region: PROVIDER_REGIONS[entry.regionId] || PROVIDER_REGIONS.unassigned,
    location: entry.location || '', images: [entry.image || trade.image] };
}
