import { geographicKey } from '../world-directory/geographic-key.mjs';
import { rankOf } from './scopes.mjs';
import { classifyLocalAuthority, createLocalAuthority, isLocalAuthorityContact, LOCAL_AUTHORITY_GROUPS, localAuthorityTitle, WATCH_AND_LOCAL_ADMINISTRATION } from './local-authority.mjs';
import { watchOfficeId } from './military-organization.mjs';

export const LEHENSWARTE_ID = 'lehenswarte';

export const lehenswartKey = seat => `${LEHENSWARTE_ID}/lehenswart-${geographicKey(seat)}`;

export function buildLehenswartePlan(house) {
  const contacts = new Map([...(house.contacts || []), ...(house.fiefContacts || [])]
    .filter(isLocalAuthorityContact).map(contact => [geographicKey(contact.seat), contact]));
  const places = new Map(house.places.filter(place => classifyLocalAuthority(place.type) !== 'open'
    || contacts.has(geographicKey(place.name))).map(place => [geographicKey(place.name), place]));
  for (const [key, contact] of contacts) {
    if (!places.has(key)) places.set(key, { name: contact.seat });
  }
  const liege = `dem ${rankOf(house).ruler}`;
  const groups = new Map(Object.keys(LOCAL_AUTHORITY_GROUPS).map(kind => [kind, []]));
  for (const [key, place] of places) {
    const contact = contacts.get(key);
    const authority = createLocalAuthority(place, contact, liege);
    groups.get(authority.kind).push({
      key: lehenswartKey(place.name), place: place.name, holder: contact?.id || null,
      ...localAuthorityTitle(authority), authority, note: contact?.note, href: contact?.href,
      ...(authority.role === WATCH_AND_LOCAL_ADMINISTRATION ? { previousKey: `militaer/${watchOfficeId(place.name)}` } : {}),
    });
  }
  return {
    sections: [...groups].filter(([, slots]) => slots.length).map(([kind, slots]) => {
      const { title, icon } = LOCAL_AUTHORITY_GROUPS[kind];
      return { id: `ortsamt-${kind}`, title, icon, slots };
    }),
  };
}
