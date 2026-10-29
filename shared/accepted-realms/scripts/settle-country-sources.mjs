import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { REALM_DECISIONS, MOINNEACH_NAMES, WESTERN_NAMES, LOCAL_RULERS, RANK_LABELS, rankForAlbic } from '../authoring/realm-decisions.mjs';

const root = new URL('../../../', import.meta.url);
const sourceRoot = new URL('../sources/', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const western = await read('diagnostics/country-promotion-20261028/westliche-zuordnungen.audit.json');
const albic = await read('diagnostics/country-promotion-20261028/albic-historic.audit.json');
const art = await read('shared/accepted-realms/sources/art-manifest.json');
const slug = name => name.replaceAll('ß', 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const native = new Set(['moinneach', 'iathneach', 'deitheach']);
const rankAliases = { king: 'royal', prince: 'ducal', duke: 'ducal', count: 'county', ministerialer: 'ministerial', order: 'knightly-order', 'knight-prince': 'junker', knight: 'ministerial' };

function houseIdentity(realm, source, decision) {
  let houseId = decision?.canonicalHouseId || decision?.existingCounterpartHouseId;
  if (realm === 'deitheach' && source.id === 'trodach') houseId = 'house-droch-trodach';
  if (source.id === 'velten' && realm === 'aldingen') houseId = 'house-velten-aldingen';
  if (source.id === 'gueldenfels' && realm === 'goldmund') houseId = 'house-velten-goldmund';
  const name = (realm === 'deitheach' && source.id === 'seilgair' ? 'Ruin Seilgeir' : '') || WESTERN_NAMES[realm]?.[source.id] || decision?.displayName || decision?.visibleName || source.name;
  houseId ||= `house-${slug(name.replace(/^Die Ritter der /, 'Ritter der '))}`;
  return { name, houseId, familyId: decision?.canonicalFamilyId || houseId.replace(/^house-/, 'haus-') };
}

function decideHouse(realm, source, snapshot, placements, decisions, images) {
  const info = decisions.find(h => (h.previewId || h.id) === source.id);
  const nameSource = realm === 'moinneach' ? { ...source, name: MOINNEACH_NAMES[source.id] } : source;
  const identity = houseIdentity(realm, nameSource, info);
  if (realm === 'moinneach') identity.name = MOINNEACH_NAMES[source.id];
  const seatId = realm === 'moinneach' ? ({ cethrenn: 'gergonax', barrex: 'gergonax', rowak: 'tarvex' }[source.id] || source.seat) : placements[source.id];
  const seat = snapshot.settlements.find(s => s.id === seatId);
  if (!seat) throw Error(`Missing accepted seat ${realm}/${source.id}/${seatId}`);
  const rankId = native.has(realm) || realm === 'triarchie' ? rankForAlbic(realm, source.id, seat) : rankAliases[info.rank.id] || info.rank.id;
  let liegeId = info?.liege?.previewId || '';
  if (realm === 'moinneach' && source.id !== 'cethrenn') liegeId = 'cethrenn';
  if (realm === 'iathneach' && source.id === 'deaghaide') liegeId = 'cetchathach';
  if (realm === 'deitheach') {
    const main = LOCAL_RULERS.deitheach[seatId];
    liegeId = main !== source.id ? main : rankId === 'mor-tiarna' ? 'ard-roth' : '';
    if (!liegeId && source.id !== 'ard-roth') liegeId = ({ caorthainn: 'ard-roth', dorrain: 'neill', fhasgair: 'caolan', eirceann: 'duach' })[seat.county];
  }
  if (realm === 'aldingen' && source.id === 'velten') liegeId = 'klingen';
  const warrior = snapshot.warriors.find(w => w.id === source.id);
  return { id: source.id, sourceId: source.id, ...identity, clan: native.has(realm) || source.clan === true || info?.clan === true,
    originRealm: source.originRealm || realm, seatId, regionId: seat.county || seat.province || '', rankId, rank: realm === 'weisenfluh' && source.id === 'goldkranz' ? 'Erlenkönig' : RANK_LABELS[rankId], liegeId,
    isSeatRuler: (LOCAL_RULERS[realm]?.[seatId] || source.id) === source.id,
    ...(realm === 'iathneach' && source.id === 'deaghaide' ? { cadetOf: 'cetchathach' } : {}),
    ...(realm === 'iathneach' && source.id === 'farraigeach' ? { formerSeat: 'Cuansioda', formerRank: 'Mor Tiarna' } : {}),
    ...(realm === 'aldingen' && source.id === 'sgiathan' ? { culturalTitle: 'Laird · inoffizielle Eigenbezeichnung' } : {}),
    ...(realm === 'goldmund' && source.id === 'mac-ruan' ? { culturalTitle: 'Laird' } : {}),
    motif: source.motif || '', palette: source.palette || [], ornament: source.ornament || '', frame: source.frame || '',
    ...images.houses[source.id], warrior: { ...warrior, image: images.houses[source.id].warriorPreview, fullsize: images.houses[source.id].warrior },
    identityReferences: info?.counterpartMatches || info?.publicCounterpartReferences || [],
    rankBasis: info?.rank?.basis || (rankId === 'laird' && realm === 'iathneach' ? 'Örtliche Herrschaft; übergeordnete Mor-Führung ist noch nicht benannt.' : 'Nutzervorgabe und bestätigte örtliche Rangordnung'),
  };
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
for (const [realm, settings] of Object.entries(REALM_DECISIONS)) {
  const snapshot = JSON.parse(await readFile(new URL(`${realm}.snapshot.json`, sourceRoot), 'utf8'));
  const exportData = realm === 'moinneach' ? {} : JSON.parse(await readFile(new URL(`placements/${realm}-entwurf.json`, sourceRoot), 'utf8'));
  const decisions = western.realms.find(r => r.id === realm)?.houses || albic.countries[snapshot.previewDirectory]?.houses || [];
  const images = art.realms[realm];
  const settlements = snapshot.settlements.map(s => ({ ...s,
    ...(realm === 'goldmund' && s.id === 'hartenstein' ? { name: 'Hartenfels', mapName: 'Hartenstein' } : {}),
    ...(realm === 'weisenfluh' && s.id === 'weisshort' ? { name: 'Weishort', mapName: 'Weisshort' } : {}),
    ...(realm === 'weisenfluh' && s.id === 'weisslauf' ? { name: 'Weislauf', mapName: 'Weisslauf' } : {}),
    ...(realm === 'deitheach' && s.id === 'ailseag' ? { name: 'Lann Ailseag', mapName: s.name } : {}),
    ...(realm === 'deitheach' && s.id === 'dreasail' ? { name: 'Srath Dreasail', mapName: s.name } : {}),
  }));
  const context = snapshot.context || { introduction: '', history: [], themes: [] };
  const data = { schemaVersion: 1, acceptedOn: '2026-10-28', id: realm, ...settings,
    map: images.map, crest: images.realmCrest || '', context, design: exportData.design || {},
    regions: snapshot.counties || snapshot.provinces || [], settlements,
    houses: snapshot.houses.map(h => decideHouse(realm, h, snapshot, exportData.placements || {}, decisions, images)),
    territoryArt: images.territories,
  };
  // Missing political leadership is kept separate from known local ownership.
  if (realm === 'iathneach') data.notes = ['Die Hauptsitze der drei nichtfürstlichen Mor Tiarnatümer sind in Karte und Quellen nicht eindeutig benannt. Örtliche Sitze werden vorbereitet; kein Mor-Herrscher wird erfunden.'];
  if (realm === 'goldmund') data.notes = ['Für Aurelmark und Edelstrom sind noch keine Grafenfamilien benannt.'];
  if (realm === 'aldingen') data.notes = ['Hasselts Velten sind nach jüngster Vorgabe Grafen. Die ältere Kartenfarbgruppe Borgeln wird davon getrennt erhalten.'];
  if (realm === 'moinneach') data.notes = ['Variante 1/original verbindlich. Cethrenn und Barrex sitzen jetzt in Gergonax, Rowak in Tarvex. Die neun übrigen örtlichen Herrschaftsführer werden als Lairds geführt.'];
  await writeFile(new URL(`../data/${realm}.source.json`, import.meta.url), JSON.stringify(data, null, 2) + '\n');
  console.log(`${realm}: ${data.houses.length} Häuser, ${data.settlements.length} Sitze`);
}
