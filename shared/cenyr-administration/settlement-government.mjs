import { geographicKey } from '../world-directory/geographic-key.mjs';
import { classifyLocalAuthority, createLocalAuthority, GUILD_LEASE, localAuthorityTitle } from './local-authority.mjs';
import { watchOfficeId } from './military-organization.mjs';

export const settlementDepartmentId = name => 'ortsrat-' + geographicKey(name);

// These places already have their own territorial administration.
const establishedSeats = new Set(['gwynthor', 'rhosmere', 'abergwint', 'castellbryn', 'aberllan', 'oilean']);
const militaryLeaders = new Set(['hauptmann', 'hauptmann-verwaltung', 'kommandant', 'burgverwalter']);

export function settlementProfile(place, authority, { template = false } = {}) {
  const type = String(place.type || '').replaceAll('-', ' ');
  if (!template && (establishedSeats.has(geographicKey(place.name)) || /^gro(?:ss|ß)stadt$/iu.test(type))) return null;
  const classification = classifyLocalAuthority(type);
  if (authority?.role === GUILD_LEASE || classification === 'lease') return { kind: 'guild', label: 'Pachtverwaltung' };
  if (classification === 'church') return { kind: 'church', label: 'Kirchliche Ortsverwaltung' };
  if (classification === 'stronghold' || /^militärisch/iu.test(type) || militaryLeaders.has(authority?.role)) {
    return { kind: 'military', label: 'Ortskommando' };
  }
  if (classification === 'open') return null;
  const town = geographicKey(place.name) === 'llysfaen' || /stadt|handels|hafen/iu.test(type);
  return { kind: 'civic', label: town ? 'Stadtherrschaft' : 'Ortsverwaltung' };
}

const office = (id, title, description, extra) => ({ id, title, description, ...extra });
const landrichter = office('gericht', 'Landrichter', 'Leitet die örtliche Gerichtsbarkeit und nimmt Streitfälle auf.');
const rentmeister = office('kasse', 'Rentmeister', 'Verwaltet die örtlichen Finanzen und berät die Ortsleitung in Abgabenfragen. Führt Rechnung über Leistungen, Erträge, Zölle und Steuern und liefert die fälligen Beträge und Naturalabgaben mit ihrer Abrechnung an die zuständige Kämmerei ab.');
const zellenfuehrer = office('meldestelle', 'Zellenführer', 'Leitet die örtliche Meldestelle und berichtet an den zuständigen Netzmeister.');
const captain = office('wache', 'Hauptmann der Ortswache', 'Führt die Wachverteidigung und die Garnison der Siedlung und berichtet dem zuständigen Marschall.');
const garrisonPosts = [
  office('stellvertretung', 'Leutnant der Garnison', 'Vertritt den Hauptmann der Garnison im Wachdienst.',
    { icon: 'command', kind: 'service', templateId: 'r-leutnant' }),
  office('versorgung', 'Zeugwart', 'Verwaltet Ausrüstung und Vorräte der Garnison.', { icon: 'supplies' }),
];
const governmentAreas = [
  { id: 'militaer', title: 'Militär', icon: 'watch', roles: {
    civic: [captain],
  } },
  { id: 'klerus', title: 'Glaube', icon: 'faith', jurisdiction: 'church', roles: {
    civic: [office('diakon', 'Diakon', 'Leitet die Ortskirche und berichtet der zuständigen geistlichen Leitung.')],
    military: [office('burgkaplan', 'Burgkaplan', 'Betreut den geistlichen Dienst der Besatzung und ihrer Angehörigen.')],
    church: [office('sakristan', 'Sakristan', 'Betreut die liturgischen Geräte und den Dienst in der Sakristei.')],
  } },
  { id: 'gerichtsbarkeit', title: 'Justiz', icon: 'justice', jurisdiction: 'place', roles: {
    civic: [landrichter], military: [landrichter], church: [landrichter], guild: [landrichter],
  } },
  { id: 'finanzen', title: 'Finanzen', icon: 'money', roles: {
    civic: [rentmeister],
    military: [rentmeister],
    church: [rentmeister],
    guild: [office('rechnung', 'Rechnungsführer der Pacht', 'Führt die Rechnung der Pachtsiedlung.')],
  } },
  { id: 'spionage', title: 'Geheimdienst', icon: 'secrecy', roles: {
    civic: [zellenfuehrer], military: [zellenfuehrer],
  } },
  { id: 'diplomatie', title: 'Diplomatie', icon: 'diplomacy', roles: {
    civic: [office('kanzlei', 'Ortsschreiber', 'Hält Ratsbeschlüsse fest und führt den Schriftverkehr mit Nachbarorten und der Herrschaft.')],
    military: [office('kanzlei', 'Garnisonsschreiber', 'Führt die Korrespondenz der Garnison und nimmt Anliegen der Ortsbewohner auf.')],
    church: [office('vogt', 'Kirchenvogt', 'Vertritt die weltlichen Belange der Gemeinschaft gegenüber der Herrschaft.')],
    guild: [office('markt', 'Marktmeister', 'Koordiniert den Handel am Ort und stimmt Marktangelegenheiten mit der zuständigen Herrschaft ab.')],
  } },
  { id: 'unterhaltung', title: 'Unterhaltung', icon: 'music', roles: {
    civic: [office('ortsbarde', 'Ortsbarde', 'Koordiniert Auftritte und öffentliche Feste in der Siedlung.')],
  } },
];
const councilDefaults = {
  civic: ['Ortsrat', 'Ratsmitglied', 8, 'Vertritt die Anliegen der einflussreichen Bürger, Familien und Gewerbe des Ortes.'],
  military: ['Rat des Standortes', 'Mitglied des Standortsrats', 3, 'Bringt Anliegen der Besatzung und der Ortsbewohner vor.'],
  church: ['Rat der Gemeinschaft', 'Mitglied des Gemeinderats', 3, 'Berät die geistliche Leitung in den Angelegenheiten der Gemeinschaft.'],
  guild: ['Rat der Pachtsiedlung', 'Mitglied des Pachtrats', 4, 'Vertritt Gilde, ansässige Gewerbe und Bewohner in Pachtangelegenheiten.'],
};
const recordedCouncils = {
  llysfaen: ['Glyn', 'Jernigan', 'Blevins', 'Talfryn', 'Crewe'],
  craithglyn: ['Tynged', 'Lloed', 'Tarw'],
};
const additionalOffices = {
  bronhir: { diplomatie: [office('buergermeister', 'Bürgermeister von Bronhir',
    'Vertritt die Gemeinde in weltlichen Angelegenheiten neben dem Lehenswart.', { icon: 'coordination' })] },
};

export function settlementDefinition(place, { authority, template = false } = {}) {
  const normalized = { ...place, type: String(place.type || '').replaceAll('-', ' ') };
  const profile = settlementProfile(normalized, authority, { template });
  if (!profile) return null;
  const { name } = normalized;
  const key = geographicKey(name);
  const office = authority || createLocalAuthority(normalized, null, 'der zuständigen Herrschaft');
  if (!authority && profile.kind === 'military' && !militaryLeaders.has(office.role)) office.role = 'hauptmann';
  if (!authority && profile.kind === 'civic' && office.kind === 'open') office.role = 'buergermeister';
  const separateWatch = profile.kind === 'military' && office.role === 'burgverwalter';
  const [council, member, count, duty] = councilDefaults[profile.kind];
  const families = recordedCouncils[key];
  const councilTitle = council === 'Ortsrat' && profile.label === 'Stadtherrschaft' ? 'Stadtrat' : council;
  const references = {
    wache: 'militaer/' + watchOfficeId(name),
    diakon: 'klerus/diakon-' + key,
    gericht: 'gerichtsbarkeit/landrichter-' + key,
    kasse: 'finanzen/rentmeister-' + key,
    meldestelle: 'spionage/zelle-' + key,
  };
  const government = governmentAreas.flatMap(({ id, title, icon, roles, jurisdiction }) => {
    const slots = [...(additionalOffices[key]?.[id] || []), ...(roles[profile.kind] || [])];
    if (id === 'militaer' && separateWatch) slots.push(captain);
    if (!slots.length) return [];
    return [{ id: `ortsregierung-${id}`, title, icon, slots: slots.map(slot => ({
      icon, ...slot, jurisdiction, canonicalKey: references[slot.id],
    })) }];
  });
  return {
    id: settlementDepartmentId(name), ...profile, place: name, type: normalized.type,
    head: { id: 'leitung', ...localAuthorityTitle(office), authority: office,
      icon: { military: separateWatch ? 'mayor' : 'watch', church: 'faith', guild: 'guild' }[profile.kind] || 'mayor' },
    government,
    ...(profile.kind === 'military' ? { garrison: { commander: separateWatch ? 'wache' : 'leitung', posts: garrisonPosts } } : {}),
    council: {
      title: councilTitle, description: duty,
      seats: (families || Array.from({ length: count }, () => '')).map((family, index) => ({
        id: family ? 'rat-' + geographicKey(family) : 'rat-' + (index + 1),
        title: family ? 'Sitz des Hauses ' + family : member, kind: 'other', icon: 'council',
        templateId: 'r-ortsrat', templateTitle: member, templateDescription: duty, description: duty,
      })),
    },
  };
}

export function settlementJurisdiction(kind, post) {
  return post.jurisdiction || ({ church: 'church', guild: 'guild' })[kind] || 'place';
}
