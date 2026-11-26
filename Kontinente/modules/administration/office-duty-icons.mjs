import { officeIcon } from '../../../shared/cenyr-administration/office-icons.mjs';

const duties = ['records', 'coordination', 'supplies', 'command', 'arms', 'scouting',
  'learning', 'faith', 'care', 'secrecy', 'inquiry', 'diplomacy', 'money', 'proclamation',
  'hospitality', 'works', 'garden', 'judgment'];
export const OFFICE_DUTY_ICONS = Object.freeze(Object.fromEntries(duties.map(key => [key, officeIcon(key)])));

export function dutyIcon(key) {
  if (!Object.hasOwn(OFFICE_DUTY_ICONS, key)) throw new Error(`Unknown office duty icon: ${key}`);
  return OFFICE_DUTY_ICONS[key];
}

export function brief(practice, ...tasks) {
  return { practice, duties: tasks.map(([icon, text]) => ({ icon, text })) };
}
