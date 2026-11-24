import { isSettlement } from './local-offices.mjs';

export const GUILD_LEASE = 'gildenpacht';
export const WATCH_AND_LOCAL_ADMINISTRATION = 'hauptmann-verwaltung';

const offices = {
  buergermeister: ['Bürgermeister', 'Bürgermeisterin', 'Leitet die weltlichen Angelegenheiten der Siedlung.'],
  lehenswart: ['Lehenswart', 'Lehenswartin', 'Verwaltet das übertragene Lehen und seinen Bannkreis im Auftrag des Lehnsherrn.'],
  kommandant: ['Kommandant', 'Kommandantin', 'Leitet den befestigten Ort und ordnet seine Bereitschaft und örtlichen Dienste.'],
  [WATCH_AND_LOCAL_ADMINISTRATION]: ['Hauptmann und Verwalter', 'Hauptmann und Verwalterin', 'Führt die Ortswache und verwaltet die militärische Siedlung im Auftrag der Herrschaft.'],
  hauptmann: ['Hauptmann', 'Hauptmann', 'Führt die örtliche Besatzung und regelt den Dienst am Standort.'],
  burgverwalter: ['Burgverwalter', 'Burgverwalterin', 'Betreut Burg, Vorräte, Bedienstete und zugehörige Besitzangelegenheiten.'],
  oberer: ['Oberer', 'Oberin', 'Leitet die geistliche Gemeinschaft und die ihr anvertraute Siedlung.'],
  prior: ['Prior', 'Priorin', 'Leitet die örtliche geistliche Gemeinschaft und ihren laufenden Dienst.'],
  abt: ['Abt', 'Äbtissin', 'Leitet die Abtei, ihre Gemeinschaft und die ihr anvertrauten Güter.'],
};
const civic = ['buergermeister', 'lehenswart'];
const stronghold = ['kommandant', 'hauptmann', 'burgverwalter'];
const church = ['oberer', 'prior', 'abt'];
const secular = [...civic, ...stronghold];
const feudalContact = /^(?:vasall(?:in)?$|ritterhaus\b.*\bbelehnt\b)/iu;

export const LOCAL_AUTHORITY_GROUPS = {
  civic: { title: 'Bürgerlich geprägte Siedlungen', icon: 'coordination', offices: civic },
  secular: { title: 'Weltliche Siedlungen', icon: 'coordination', offices: secular },
  church: { title: 'Kirchen- und Klostersiedlungen', icon: 'faith', offices: church },
  stronghold: { title: 'Burgen, Festungen und Türme', icon: 'watch', offices: stronghold },
  fortified: { title: 'Befestigte Siedlungen', icon: 'watch', offices: secular },
  lease: { title: 'Pachtsiedlungen', icon: 'money', offices: [] },
  open: { title: 'Orte mit offenem Typ', icon: 'records', offices: [...secular, ...church] },
};

export function classifyLocalAuthority(placeType = '') {
  const label = String(placeType ?? '');
  if (/gildenpacht|pachtsiedlung/iu.test(label)) return 'lease';
  const type = label.split('·', 1)[0].trim();
  if (/kirch(?:en)?siedlung|kloster|abtei|kathedrale|^kirche$/iu.test(type)) return 'church';
  if (/^befestigt\w*\s/iu.test(type)) return 'fortified';
  if (/(?:burg|festung|turm|kastell)(?:s?siedlung)?$/iu.test(type)) return 'stronghold';
  if (/^(?:weltliche )?siedlung$/iu.test(type)) return 'secular';
  return isSettlement({ type }) || /(?:dorf|weiler)$/iu.test(type) ? 'civic' : 'open';
}

export function recordedLocalOffice(title = '') {
  const name = String(title ?? '').trim().toLocaleLowerCase('de').replace(/^lehnswart/u, 'lehenswart');
  return Object.keys(offices).find(key => offices[key].slice(0, 2).some(word => {
    const prefix = word.toLocaleLowerCase('de');
    return name === prefix || name.startsWith(`${prefix} `);
  }));
}

export const isLocalAuthorityContact = contact => Boolean(contact.seat && !contact.scope
  && (recordedLocalOffice(contact.title) || feudalContact.test(contact.title)));
export const localAuthorityChoices = authority => [
  ...(authority.role === WATCH_AND_LOCAL_ADMINISTRATION ? [WATCH_AND_LOCAL_ADMINISTRATION] : []),
  ...LOCAL_AUTHORITY_GROUPS[authority.kind].offices, GUILD_LEASE,
];
export const localOfficeLabel = key => key === GUILD_LEASE ? 'Gildenpacht' : [...new Set(offices[key].slice(0, 2))].join(' / ');

export function localAuthorityTitle(authority, choice) {
  const role = choice?.role || authority.role;
  const { seat } = authority;
  if (role === GUILD_LEASE) return {
    title: choice?.title || `Leitung der Pachtsiedlung ${seat}`, titleVariants: undefined,
    description: 'Leitet die Pachtsiedlung im Auftrag der Gilde und nach den Bestimmungen ihres Pachtvertrags.',
    reportsTo: choice?.guild ? `der Gilde ${choice.guild}` : 'der pachtenden Gilde',
  };
  const [title, female, description] = offices[role];
  const titleVariants = [title, female].map(name => `${name} von ${seat}`);
  const reportsTo = role === WATCH_AND_LOCAL_ADMINISTRATION ? 'dem zuständigen Marschall im Wachdienst und der zuständigen Herrschaft in Ortsangelegenheiten'
    : role === 'lehenswart' ? authority.liege : church.includes(role)
    ? 'der zuständigen geistlichen Leitung' : 'der zuständigen Herrschaft';
  return { title: (!choice && authority.sourceTitle) || titleVariants[0], titleVariants, description, reportsTo };
}

export function createLocalAuthority(place, contact, liege) {
  const { name: seat, type = '' } = place;
  const kind = classifyLocalAuthority(type);
  const recorded = recordedLocalOffice(contact?.title);
  const feudalSeat = feudalContact.test(contact?.title || '');
  let role = recorded || LOCAL_AUTHORITY_GROUPS[kind].offices[0] || GUILD_LEASE;
  if (!recorded && feudalSeat && LOCAL_AUTHORITY_GROUPS[kind].offices.includes('lehenswart')) role = 'lehenswart';
  if (!recorded && kind === 'stronghold') {
    if (/turm/iu.test(type)) role = 'hauptmann';
    else if (/burg/iu.test(type)) role = 'burgverwalter';
  }
  const source = recorded && contact.title.trim();
  const bareTitle = source && offices[recorded].slice(0, 2).includes(source);
  const sourceTitle = source && (!bareTitle && source.includes(' ') ? source : `${source} von ${seat}`);
  return { seat, type, kind, role, liege, ...(sourceTitle ? { sourceTitle } : {}) };
}
