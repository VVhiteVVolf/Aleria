import { existsSync } from 'node:fs';
import countySources from '../../../Kontinente/modules/cenyr-navigation/counties.source.json' with { type: 'json' };
import { HOUSE_CONTENT as pendrag } from '../../../Familien Häuser und Clans/Estryll/Cenyr/Vortigerns_Ruh/Tanwens_Flamme/Haus_Pendrag/haus.content.mjs';
import { resolveCanonicalFamilyId } from '../../../Stammbäume/assets/js/modules/family-registry/family-id-aliases.js';
import { territoryHref } from '../../../Kontinente/modules/territory-page/territory-reference.mjs';
import { normalizePersonName } from '../../../js/world-identity/person-identity.js';
import { geographicKey } from '../../../shared/world-directory/geographic-key.mjs';
import { isLocalAuthorityContact } from '../../../shared/cenyr-administration/local-authority.mjs';
import { CAMRUISGE_SCOPE } from '../../../shared/cenyr-administration/camruisge-plan.mjs';
import { countyDemesne, isPort, territorialPlaces, territoryDomains } from './territorial-domains.mjs';
import { createTerritorialPersonReader, readCouncilOffices, readCourtOffices, readHouseContent } from './territorial-office-sources.mjs';

const realmId = 'koenigreich-cenyr';
const crownScope = 'krone';
const ranks = { Grafschaft: 'county', Baronie: 'barony', Herrschaft: 'prince', Diarchie: 'diarchy' };
const vassalKinds = { knight: 'knight', 'knight-simple': 'knight', commoner: 'service' };
const neutralCrest = '/Stammbäume/assets/images/placeholders/neutral-crest.png';
const crestRoot = '/Stammbäume/assets/images/regions/';
const workspace = new URL('../../../', import.meta.url);
const compare = new Intl.Collator('de');
const realmOf = entry => entry.hierarchy.find(level => level.type === 'Königreich')?.slug;
const countyOf = entry => entry.hierarchy.find(level => level.type === 'Grafschaft')?.slug;
const hrefFor = entry => encodeURI(territoryHref(entry.id, [entry]));

function localCrest(...options) {
  return options.find(src => src?.startsWith('/') && !src.startsWith('//') && existsSync(new URL(`.${src}`, workspace))) || neutralCrest;
}

function familyResolver(families) {
  const canonical = new Map(families.flatMap(family => [family.id, ...family.aliases].map(id => [id, family.id])));
  return id => canonical.get(id) || resolveCanonicalFamilyId(id);
}

function directRoster(houseId, territory, context, branch) {
  const { families, directory, registry, familyId, readPerson, ownFamilyMembers, addFamilyPerson, otherService } = context;
  const candidates = new Map();
  function admit(id, kind, family, detail, branch) {
    if (id && !candidates.has(id)) candidates.set(id, { id, kind, family, ...(detail ? { detail } : {}), ...(branch ? { branch } : {}) });
  }
  function enroll(family, kind, branch) {
    const record = registry.get(family.id);
    for (const person of record ? ownFamilyMembers(record) : []) {
      if (otherService.has(`house-${record.id.replace(/^haus-/u, '')}/${person.id}`)) continue;
      admit(addFamilyPerson(record, person, undefined, undefined, `stammbaum/${record.id}/${person.id}`), kind, family.name, '', branch);
    }
  }
  const own = directory.get(houseId);
  if (own) enroll(own, 'house', branch);
  const ownName = normalizePersonName(own?.name).replace(/^haus /u, '');
  const explicitVassals = new Set((territory.content?.view?.familySections || []).flatMap(section => section.cards)
    .filter(card => {
      const liege = normalizePersonName(card.liege).replace(/^haus /u, '');
      return ownName && (liege === ownName || liege === ownName.split(' ')[0]);
    }).map(card => familyId(card.id)));
  const enrolled = families.filter(family => own && family.id !== houseId && vassalKinds[family.profile.rankId]
    && (family.profile.liegeHouseId ? familyId(family.profile.liegeHouseId) === houseId : explicitVassals.has(family.id)))
    .map(family => {
      const kind = vassalKinds[family.profile.rankId];
      enroll(family, kind, branch);
      return { id: family.id, name: family.name, kind, href: family.href };
    }).sort((a, b) => compare.compare(a.name, b.name));
  function sourced(scope, member, key, sourceFamily) {
    const result = readPerson(scope, member, key, sourceFamily);
    if (result?.eligible) admit(result.id, result.familyId === houseId ? 'house' : 'service',
      directory.get(result.familyId)?.name || '', 'Belegte Besetzung', branch);
    return result?.id || null;
  }
  return { candidates, enrolled, sourced };
}

function registrySeats(territory, county) {
  return territory.id === county.id ? countyDemesne(county)
    : territoryDomains(territory).filter(domain => !domain.territoryId || domain.territoryId === territory.id);
}

async function regionalRoster(territory, county, context, { royal = false } = {}) {
  const { directory, houseDirectory, familyId } = context;
  const rank = royal ? 'royal' : ranks[territory.type];
  const id = royal ? crownScope : territory.id;
  const view = territory.content?.view || {};
  const groups = view.councilGroups || [];
  const ruler = royal ? pendrag.heads.find(head => head.name === pendrag.currentHead) : groups.flatMap(group => group.members).find(member => member.featured);
  const houseId = familyId(ruler?.familyId);
  const own = directory.get(houseId);
  const { candidates, enrolled, sourced } = directRoster(houseId, territory, context);
  const admit = (member, key, sourceFamily) => sourced(id, member, key, sourceFamily);
  const council = royal ? context.royalCouncil : groups.filter(group => /^Ratsämter/u.test(group.title)).flatMap(group => group.members);
  const offices = readCouncilOffices(rank, council, admit);
  const courtScope = !royal && houseId === pendrag.id ? crownScope : undefined;
  const content = courtScope ? null : await readHouseContent(houseDirectory.get(houseId));
  const { court, staff } = readCourtOffices(content, admit);
  const domains = royal ? [] : registrySeats(territory, county);
  const places = territorialPlaces(domains);
  const localKeys = new Set(places.map(place => geographicKey(place.name)));
  const contacts = (view.vassalGroups || []).flatMap(group => group.members)
    .filter(member => localKeys.has(geographicKey(member.seat)) && isLocalAuthorityContact({ title: member.office, seat: member.seat }))
    .map(member => ({ title: member.office, seat: member.seat,
      id: admit(member, `ort/${geographicKey(member.seat)}`), ...(member.note ? { note: member.note } : {}) }));
  return {
    id, territoryId: territory.id, rank, regional: true, preparation: true, houseId,
    name: royal ? 'Haus Pendrag' : own?.name || territory.name, title: royal ? 'Königlicher Rat und Hof' : territory.name,
    href: hrefFor(territory), crest: localCrest(own?.emblem, view.article?.crestSrc, domains[0]?.crestSrc),
    ruler: ruler ? admit(ruler, 'oberhaupt', houseId) : null,
    offices, court, staff, contacts, places, enrolled, candidates: [...candidates.values()],
    ...(domains[0]?.center ? { governmentSeat: domains[0].center } : {}),
    fleet: royal || places.some(isPort), ...(courtScope ? { courtScope } : {}),
  };
}

function camruisgeRoster(territory, context) {
  const leadership = territory.content.view.councilGroups[0].members;
  const north = leadership.find(member => member.seat === 'Aberllan');
  const south = leadership.find(member => member.seat === 'Oilean');
  const garrael = context.familyId(north.familyId);
  const salach = context.familyId(south.familyId);
  const aberllanRoster = directRoster(garrael, territory, context, 'aberllan');
  const oileanRoster = directRoster(salach, territory, context, 'oilean');
  const aberllanHolder = aberllanRoster.sourced(CAMRUISGE_SCOPE, north, 'aberllan/leitung', garrael);
  const oileanHolder = oileanRoster.sourced(CAMRUISGE_SCOPE, south, 'oilean/leitung', salach);
  return {
    id: CAMRUISGE_SCOPE, territoryId: territory.id, rank: 'diarchy', regional: true, preparation: true,
    title: 'Dyarchie von Camruisge', name: 'Aberllan und Oilean', crest: neutralCrest, href: hrefFor(territory),
    branches: [
      { id: 'aberllan', name: 'Aberllan', authority: 'Celtigerns Wacht', title: north.office,
        titleVariants: ['Lehenswart Aberllans', 'Lehenswartin Aberllans'], familyName: 'Haus Garrael',
        familyHref: context.directory.get(garrael).href, description: 'Verwaltet die Nordseite Camruisges im Auftrag von Celtigerns Wacht.',
        holder: aberllanHolder },
      { id: 'oilean', name: 'Oilean', authority: 'Tír na Sleagh · Leitheach', title: south.office,
        familyName: 'Sept Salach', treeRegion: 'Tír na Sleagh', holder: oileanHolder,
        description: 'Verwaltet die Südseite Camruisges unter Tír na Sleagh in Leitheach.' },
    ],
    offices: {}, court: [], staff: [], places: [], contacts: [],
    enrolled: [...aberllanRoster.enrolled, ...oileanRoster.enrolled],
    candidates: [...aberllanRoster.candidates.values(), ...oileanRoster.candidates.values()],
  };
}

function summarize(scope, people) {
  const { id, name, title, rank, crest, href } = scope;
  return { id, name, title, rank, crest, href, ...(scope.ruler ? { ruler: people.get(scope.ruler).name } : {}) };
}

function freeCitizens(context, houses, legacyFree) {
  const { families, registry, ownFamilyMembers, addFamilyPerson } = context;
  const assigned = new Set(houses.flatMap(house => house.candidates.map(candidate => candidate.id)));
  const seen = new Set(legacyFree.map(candidate => candidate.id));
  return families.filter(family => family.profile.rankId === 'commoner' && !family.profile.liegeHouseId
    && !family.profile.liegeHouseName && family.placements[0]?.folderPath[0] === 'Cenyr'
    && family.placements[0].folderPath[1] !== 'Celtigerns Wacht')
    .flatMap(family => {
      const record = registry.get(family.id);
      return (record ? ownFamilyMembers(record) : []).flatMap(person => {
        const id = addFamilyPerson(record, person, undefined, undefined, `stammbaum/${record.id}/${person.id}`);
        if (assigned.has(id) || seen.has(id)) return [];
        seen.add(id);
        return [{ id, kind: 'free', family: family.name }];
      });
    });
}

export async function buildKingdomPlanning({ territories, families, houseEntries, legacyHouses, legacyFree, people, ...personSources }) {
  const all = new Map(territories.filter(entry => realmOf(entry) === 'cenyr').map(entry => [entry.id, entry]));
  const countyEntries = new Map(countySources.map(source => [countyOf(all.get(source.id)), source]));
  const byTerritory = new Map(legacyHouses.map(house => [house.territoryId, house]));
  const directory = new Map(families.map(family => [family.id, family]));
  const houseDirectory = new Map(houseEntries.map(entry => [entry.id, entry]));
  const familyId = familyResolver(families);
  const readPerson = createTerritorialPersonReader({ ...personSources, familyId });
  const royalCouncil = all.get('grafschaft-vortigerns-ruh').content.view.councilGroups.find(group => group.id === 'cenyr-royal').members;
  const context = { families, directory, houseDirectory, familyId, readPerson, royalCouncil, ...personSources };
  const crown = await regionalRoster(all.get(realmId), null, context, { royal: true });
  const houses = [crown];
  const summaries = new Map([...countyEntries.keys()].map(id => [id, []]));
  for (const territory of all.values()) {
    if (territory.id === realmId) continue;
    const district = countyOf(territory);
    const county = all.get(countyEntries.get(district)?.id);
    if (!county || !ranks[territory.type]) throw new Error(`Grafschaft oder Lehensrang fehlt für ${territory.id}`);
    const legacy = byTerritory.get(territory.id);
    const scope = legacy || (territory.id === 'insel-camruisge' ? camruisgeRoster(territory, context) : await regionalRoster(territory, county, context));
    if (!legacy) houses.push(scope);
    summaries.get(district).push(summarize(scope, people));
  }
  const counties = [...countyEntries].map(([id, source]) => {
    const territory = all.get(source.id);
    const records = summaries.get(id);
    const order = ['county', 'barony', 'prince', 'diarchy'];
    const scopes = records.sort((a, b) => order.indexOf(a.rank) - order.indexOf(b.rank) || compare.compare(a.title, b.title));
    const demesne = id === 'celtigerns-wacht' ? 'Llamreis Ankunft' : countyDemesne(territory).find(domain => domain.territoryId !== territory.id)?.title;
    return { id, name: id === 'klaueninsel' ? 'Klaueninseln' : source.title, candidateRegion: source.title, seat: source.seat,
      href: hrefFor(territory), crest: localCrest(`${crestRoot}${source.banner}.png`), scopes, ...(demesne ? { demesne } : {}) };
  }).sort((a, b) => compare.compare(a.name, b.name));
  const kingdom = { id: 'cenyr', name: 'Königreich Cenyr', candidateRegion: 'Vortigerns Ruh', seat: 'Mathragon',
    href: crown.href, crest: localCrest(`${crestRoot}koenigreich-cenyr.png`, crown.crest), scopes: [summarize(crown, people)] };
  return { kingdom, counties, houses, free: freeCitizens(context, [...legacyHouses, ...houses], legacyFree) };
}
