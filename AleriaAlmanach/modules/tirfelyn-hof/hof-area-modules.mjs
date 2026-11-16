import { HOF_AREAS, HOF_SCENE_RELOCATIONS, hofSceneLink } from '../../../shared/tirfelyn-hof/hof-areas.mjs';
import { HOF_POIS, HOF_MAP_ID } from '../../../shared/tirfelyn-hof/hof-pois.mjs';
import { hofResidentsAt } from '../../../shared/tirfelyn-hof/hof-household.mjs';
import { buildHofScene } from './hof-scenes.mjs';

export function hofAreaDirectory() {
  return `<p>Die Orte des Hofes sind nach Haushalten und Arbeitsbereichen zusammengefasst.</p><ul>${HOF_AREAS.map(area =>
    `<li><a href="../AleriaAlmanach/AleriaAlmanach.html?entry=${area.id}">${area.title}</a> · ${area.description}</li>`).join('')}</ul>`;
}

export function buildHofAreaModules() {
  return HOF_AREAS.filter(area => area.id !== 'tirfelyn-hof').map(area => {
    const places = area.poiKeys.map(key => HOF_POIS.find(poi => poi.key === key));
    const residents = [...new Map(places.flatMap(hofResidentsAt).map(person => [person.actorId, person])).values()];
    const cast = residents.map(person => person.actorId).filter(Boolean);
    const roster = residents.map(person => `<p><strong>${person.name}</strong> · ${person.work || person.role}.</p>`).join('');
    const image = places[0].image;
    return {
      id: area.id, title: area.title, subtitle: `${area.label} · Tirfelyn-Hof`, type: 'Hofbereich', category: 'Tirfelyn-Hof',
      stamp: 'Tirfelyn-Hof', icon: '⌂', image, previewImage: image, schemaVersion: 1, multipage: true,
      appendCommentsPage: false, enablePageComments: true, sessionCast: [...new Set(cast)],
      commentThreadAliases: HOF_SCENE_RELOCATIONS.filter(route => route.entryId === area.id)
        .map(route => ({ from: route.oldThreadId, to: route.threadId })),
      pages: [{ schemaVersion: 1, pageTitle: area.title, commentThreadKey: `${area.id}-ueberblick`,
        image, imageWidth: 34, imageTall: true, imageFit: 'cover',
        description: `<p>${area.description}</p>${roster}<p><a href="../Karten/karte.html?map=${HOF_MAP_ID}" target="_blank" rel="noopener">Zur Hofkarte</a> · <a href="../AleriaAlmanach/AleriaAlmanach.html?entry=tirfelyn-hof">Zur Familie Tirfelyn</a></p><ul>${places.map(poi => `<li><a href="${hofSceneLink(poi)}">${poi.title}</a></li>`).join('')}</ul>`,
        stats: [['Hof', 'Tirfelyn-Hof'], ['Eigentümer', 'Familie Tirfelyn'], ['Orte', String(places.length)]] },
      ...places.map(buildHofScene)]
    };
  });
}
