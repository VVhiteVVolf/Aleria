import { GUILD_LEASE, localAuthorityChoices, localAuthorityTitle } from '../../shared/cenyr-administration/local-authority.mjs';
import { MAX_TITLE_LENGTH } from './draft-office-titles.mjs';

function optionalName(value) {
  if (value === undefined) return '';
  const name = typeof value === 'string' ? value.trim() : null;
  if (name === null || name.length > MAX_TITLE_LENGTH || /[\u0000-\u001f\u007f]/u.test(name)) {
    throw new Error(`Gildenname und Amtstitel dürfen jeweils bis zu ${MAX_TITLE_LENGTH} Zeichen umfassen.`);
  }
  return name;
}

export function validateAuthorityChoice(post, choice) {
  if (!post?.authority || !choice || typeof choice !== 'object' || Array.isArray(choice)
    || !localAuthorityChoices(post.authority).includes(choice.role)) {
    throw new Error('Diese Amtsform steht für den Ort nicht zur Auswahl.');
  }
  const { role } = choice;
  return role === GUILD_LEASE ? { role, guild: optionalName(choice.guild), title: optionalName(choice.title) } : { role };
}

export function importAuthorityChoices(input, posts) {
  if (input === undefined) return {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Ungültige Ortsämter im Entwurf.');
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, validateAuthorityChoice(posts.get(key), value)]));
}

export function applyDraftAuthority(post, choices, posts) {
  const choice = choices[post.key];
  const applied = choice ? { ...post, ...localAuthorityTitle(post.authority, choice), authorityChoice: { ...choice } } : post;
  const key = post.locality?.key;
  const authority = key && post.locality.type !== 'station' && posts.get(key)?.authority;
  return authority && choices[key] ? {
    ...applied, locality: { ...post.locality, title: localAuthorityTitle(authority, choices[key]).title },
  } : applied;
}
