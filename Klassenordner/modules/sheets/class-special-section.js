import { createSecondWind, getMartialClassDefinition } from '../../../AleriaAlmanach/modules/classes/martial-recovery.js';
import { escapeClassHtml as escape } from '../pages/class-page-content.js';
export function getClassSpecialSection(classId) {
  if (!getMartialClassDefinition(classId)) return null;
  const ability = createSecondWind();
  return { id: 'durchschnaufen', title: 'Durchschnaufen', status: 'written',
    html: `<p><strong>Bonusaktion · einmal pro langer Rast</strong></p><p>${escape(ability.description)}</p>` };
}
