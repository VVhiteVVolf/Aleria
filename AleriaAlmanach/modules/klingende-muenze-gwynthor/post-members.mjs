import { GWREGYSDU_HOUSEHOLD } from '../gwregysdu-harbor/harbor-people.mjs';
import { kronePerson } from '../klingende-krone/krone-people.mjs';
import { nixePerson } from '../lachende-nixe/nixe-family-people.mjs';
import { klauePerson } from '../rote-klaue/klaue-people.mjs';

// Confirmed operating members only. A supply contract or a debt is insufficient.
export const OPERATING_MEMBERS = Object.freeze([
  { person: klauePerson('lucan'), owners: [klauePerson('lucan'), klauePerson('camilla')], entryId: 'gwynthor-die-rote-klaue', business: 'Die rote Klaue',
    activity: 'Pfandhaus · Darlehen, Münzwechsel und Wertschätzung', source: 'modules/rote-klaue/klaue-module.mjs',
    company: 'Drei zugewiesene Legionäre · im Betriebsmodul geführt' },
  { person: kronePerson('finlay'), entryId: 'gwynthor-zur-klingenden-krone', business: 'Zur Klingenden Krone',
    activity: 'Taverne · Brauerei · Destillerie und Cneacail-Vertrieb',
    source: 'modules/klingende-krone/krone-biography.mjs', company: 'Ein Leutnant und sechzehn Soldaten · im Betriebsmodul geführt' },
  { person: GWREGYSDU_HOUSEHOLD.find(p => p.key === 'bleddyn'), entryId: 'gwynthor-gwregysdu-lagerhaeuser', business: 'Die Lagerhäuser der Gwregysdu',
    activity: 'Vier Lagerhäuser · Hafenumschlag und Vertrieb',
    source: 'modules/gwregysdu-harbor/harbor-module.mjs', company: 'Optio Pilo, zwei Leutnanten und vierundzwanzig Soldaten · im Betriebsmodul geführt' },
  { person: nixePerson('albrecht'), entryId: 'die-lachende-nixe', business: 'Die Lachende Nixe',
    activity: 'Freudenhaus und Gastbetrieb · eingetragenes Gildenmitglied',
    source: 'modules/lachende-nixe/sources/module-before-finalization.json', company: '' }
]);
export const AFFILIATED_ENTRY_IDS = Object.freeze(OPERATING_MEMBERS.map(member => member.entryId));

export function operatingMemberNodes(prefix, mode = 'trade') {
  return OPERATING_MEMBERS.flatMap(({ person: proprietor, owners, entryId, business, activity, company }) => (owners || [proprietor]).map(person => ({
    id: `${prefix}-${person.key}`, title: person.name, subtitle: business,
    portrait: person.portrait,
    text: `<p>${activity}.</p><p>${mode === 'bank' ? 'Als Mitglied der Klingenden Münze gehört er zugleich der Roten Bank an und führt dort sein Gildenkonto.' : 'Mitglied der Klingenden Münze und der Roten Bank; sein Betrieb bleibt eigenständig geführt.'}${mode === 'company' && company ? ` ${company}.` : ''}</p>`,
    // Provenance remains structured data; no new identity or module is created.
    memberEntryId: entryId, worldPersonId: person.worldPersonId
  })));
}
