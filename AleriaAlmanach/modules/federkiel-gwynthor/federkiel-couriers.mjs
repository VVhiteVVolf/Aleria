import people from './federkiel-couriers.json' with { type: 'json' };

const portraitRoot = '/AleriaAlmanach/assets/federkiel-gwynthor/couriers';

export const FEDERKIEL_BANNKREIS_COURIERS = people.map(person => ({
  ...person,
  id: `federkiel-gwynthor-${person.slug}`,
  portrait: `${portraitRoot}/${person.slug}/portrait-v1.webp`
}));

export function federkielCourierAvatar(slug, panel) {
  return `${portraitRoot}/${slug}/avatars/${slug}-set-01-avatar-${String(panel).padStart(2, '0')}.png`;
}
