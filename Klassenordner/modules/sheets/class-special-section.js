import { getClassSpecialManeuvers } from '../../../AleriaAlmanach/modules/classes/class-special-maneuvers.js';
import { escapeClassHtml as escape } from '../pages/class-page-content.js';

export function getClassSpecialSection(classId) {
  const pool = getClassSpecialManeuvers(classId, 20);
  const options = [...pool.abilities, ...pool.techniques].sort((a,b) => a.minimumLevel - b.minimumLevel);
  if (!options.length) return null;
  return { id: 'besondere-klassenmanoever', title: 'Besondere Klassenmanöver · Stufe 5–20', status: 'written',
    html: '<p>Diese festen Klassenfähigkeiten kommen zu den erlernten Techniken hinzu und verbrauchen keinen Ausbildungsplatz. Ab Stufe 5 stehen eine kleine Vorbereitung und eine stärkere Handlung zur Verfügung; auf Stufe 8, 12, 16 und 20 kommt je eine weitere Option hinzu. Jede kostet eine Besondere Aktion und die angegebenen weiteren Ressourcen. Aura ersetzt diese Kosten nicht. Verfügbare Vorräte werden dadurch nicht erhöht.</p>'
      + options.map(entry => `<h3>Stufe ${entry.minimumLevel} · ${escape(entry.name)}</h3><p><strong>${entry.costs.map(cost=>escape(cost.name)).join(' + ')}</strong></p><p>${escape(entry.description)}</p>`).join('') };
}
