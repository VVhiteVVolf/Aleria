import { getHouseRank } from '../../../Stammbäume/assets/js/domain/house-profile.js';

const TITLES = Object.freeze({ royal: 'König', county: 'Graf', barony: 'Baron', 'knight-prince': 'Ritterfürst', knight: 'Ritterherr', 'knight-simple': 'Ritter', commoner: 'Bürgerlich', laird: 'Laird', jarl: 'Jarl', thane: 'Thane', hesire: 'Hesire', huskarl: 'Huskarl', 'dun-tiarna': 'Dún Tiarna', 'mor-tiarna': 'Mor Tiarna', 'ard-tiarna': 'Ard Tiarna', 'ri-tiarna': 'Ri Tiarna', unknown: 'Offen' });
const TYPES = Object.freeze({ royal: 'Königshaus', county: 'Grafenhaus', barony: 'Baronenhaus', 'knight-prince': 'Ritterfürstenhaus', knight: 'Ritterhaus', 'knight-simple': 'Ritterfamilie', commoner: 'Bürgerliches Haus' });
const COMMONER_RANKS = new Set(['commoner', 'sept-head', 'mercantian', 'plebeian']);
const CATEGORY_LOCATION = /^(?:Antike|Ausgestorb|Erloschen|Vorbereitete|Historische)/i;

export const preparedHouseSlug = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Read facts only. No people, professions, ranks or relationships are inferred
// from a family name, its emblem or an illustration.
export function readPreparedHouseFacts(record) {
  const document = record.family?.document || record.document || {};
  const profile = record.profile || record.houseProfile || document.houseProfile;
  if (!record.id || !profile?.rankId || !(record.title || document.title)) throw new Error('Hausvorbereitung benötigt eine kanonische ID, einen Titel und ein Hausprofil.');
  const title = record.title || document.title;
  const folderPath = record.folderPath || profile.folderPath || [profile.kingdom, profile.county, profile.barony, profile.seat].filter(Boolean);
  const commoner = COMMONER_RANKS.has(profile.rankId);
  const clan = !commoner && (record.type === 'clan' || /^Clan\s/.test(title));
  const extinct = record.extinct === true || record.family?.extensions?.extinctHouse === true
    || record.family?.extensions?.historicalStatus === 'extinct'
    || folderPath.some(name => /^(?:Ausgestorb|Erloschen)/i.test(name));
  const rank = TITLES[profile.rankId] || getHouseRank(profile.rankId).label;
  const type = clan ? 'Clan' : commoner ? 'Bürgerliches Haus' : TYPES[profile.rankId] || 'Familie';
  const description = String(record.description || document.description || '').split(/(?<=[.!?])\s+|\n+/)
    .filter(sentence => !/\b(?:Akte|Akten|Register|Stammbaum|Datensatz|Platzhalter|Vorbereitete|Quelle|Quellen)\b/i.test(sentence)).join(' ').trim();
  const liegeNames = Array.isArray(profile.liegeHouses)
    ? [...new Set(profile.liegeHouses.map(house => house.name).filter(Boolean))] : [];
  const liege = liegeNames.length ? new Intl.ListFormat('de', { type: 'conjunction' }).format(liegeNames)
    : profile.liegeHouseName || '';
  return {
    id: record.id, title, profile, folderPath: [...folderPath], commoner, clan, extinct, rank, type,
    liege, parentHouseId: profile.liegeHouseId || '',
    emblem: record.emblem || document.emblem || '', motto: record.motto ?? document.motto ?? '',
    sourceRevision: Number(record.sourceRevision ?? record.family?.extensions?.sourceRevision ?? 0),
    description, region: CATEGORY_LOCATION.test(profile.barony || '') ? '' : profile.barony || ''
  };
}

export function describePreparedHouse(facts) {
  const { title, commoner, clan, extinct, profile, type, region, liege } = facts;
  const household = clan ? 'ein Clan' : commoner ? 'eine bürgerliche Familie' : type === 'Familie' ? 'eine Familie' : `${/familie$/i.test(type) ? 'eine' : 'ein'} ${type}`;
  const residence = profile.seat ? ` mit ${extinct ? 'überliefertem ' : ''}Sitz in ${profile.seat}` : '';
  const county = profile.county ? ` in der Grafschaft ${profile.county}` : '';
  const regionText = region && region !== profile.seat ? ` ${profile.seat || 'Die Heimat der Familie'} liegt in ${region}.` : '';
  const bond = liege ? ` ${extinct ? 'Die überlieferte Bindung führte zu' : 'Die Familie steht unter'} ${liege}.` : '';
  return `${title} ${extinct ? 'war' : 'ist'} ${household}${residence}${county}.${regionText}${bond}`;
}
