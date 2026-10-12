const PUBLIC_ASSET_PATH = '/AleriaAlmanach/public/assets/account/';
const assetUrl = filename => new URL(`../../public/assets/account/${filename}`, import.meta.url).href;
const PUBLIC_ORIGIN = 'https://dieweltvonaleria.netlify.app';

export const ACCOUNT_AVATARS = Object.freeze([
  { id: 'gawain', name: 'Gawain Draig', caption: 'Mutprobe? Bin dabei.' },
  { id: 'freya', name: 'Freya Skald', caption: 'Ich würfle auf Charme.' },
  { id: 'fenrir', name: 'Fenrir Varulv', caption: 'Ich bin nicht mürrisch.' },
  { id: 'guinevere', name: 'Guinevere Neidr', caption: 'Alles Teil des Plans.' }
].map(avatar => Object.freeze({ ...avatar, path: `${PUBLIC_ASSET_PATH}${avatar.id}-v1.webp`, src: assetUrl(`${avatar.id}-v1.webp`) })));

export const ACCOUNT_ART = Object.freeze({ key: assetUrl('key-v1.webp'), myrddin: assetUrl('myrddin-v1.webp') });
export const ACCOUNT_BUTTON_ART = Object.freeze({ login: assetUrl('button-login-v1.webp'), register: assetUrl('button-register-v1.webp'), pass: assetUrl('button-pass-v1.webp') });

export function accountAvatar(id) {
  return ACCOUNT_AVATARS.find(avatar => avatar.id === id) || null;
}

export function accountAvatarId(photoURL) {
  try {
    const pathname = new URL(photoURL).pathname;
    return ACCOUNT_AVATARS.find(avatar => avatar.path === pathname)?.id || '';
  } catch { return ''; }
}

export function prepareAccountProfile(profile, origin = globalThis.location?.origin || PUBLIC_ORIGIN) {
  if (!profile || typeof profile !== 'object') return null;
  const displayName = String(profile.displayName || '').trim().replace(/\s+/gu, ' ');
  if (displayName.length > 40 || /[\u0000-\u001f\u007f<>]/u.test(displayName)) throw new Error('Dein Abenteurername darf höchstens 40 Zeichen und keine Steuer- oder HTML-Zeichen enthalten.');
  const avatar = accountAvatar(profile.avatarId);
  if (!avatar) throw new Error('Bitte wähle einen der vier Gildenavatare.');
  const publicOrigin = /^https?:\/\//u.test(origin) ? origin : PUBLIC_ORIGIN;
  return Object.freeze({ displayName, photoURL: new URL(avatar.path, publicOrigin).href });
}
