import { HOF_POIS, HOF_MAP_ID, HOF_MAPPED_POIS } from '../../../shared/tirfelyn-hof/hof-pois.mjs';
import { hofResidentsAt } from '../../../shared/tirfelyn-hof/hof-household.mjs';
import { hofAreaFor, hofSceneKey } from '../../../shared/tirfelyn-hof/hof-areas.mjs';

export function buildHofScene(poi) {
  const residents = hofResidentsAt(poi);
  const peopleLabel = poi.residenceId ? 'Bewohner' : 'Zuständig';
  const mapped = HOF_MAPPED_POIS.some(place => place.key === poi.key);
  return {
    schemaVersion: 1, pageTitle: poi.title, commentThreadKey: hofSceneKey(poi),
    image: poi.image, imageWidth: 34, imageTall: true, imageFit: 'cover', imagePosition: 'center',
    sessionPage: true,
    sessionIntro: `<p>${poi.text}</p><p><strong>${peopleLabel}:</strong> ${residents.map(person => person.name).join(', ') || 'Familie Tirfelyn'}.</p><p><a href="../Karten/karte.html?map=${HOF_MAP_ID}${mapped ? `&amp;pin=tirfelyn-${poi.key}` : ''}" target="_blank" rel="noopener">${mapped ? 'Diesen Ort auf der Hofkarte öffnen' : 'Zur Hofkarte'}</a></p>`,
    sessionHint: `${poi.title} · Tirfelyn-Hof`,
    sessionEmptyTitle: 'Hier kann eine Begegnung beginnen',
    sessionEmptyText: 'Eine Ankunft, eine Arbeitspause oder ein Gespräch im Alltag des Hofes.',
    sessionDateAleria: { year: null, month: null, day: null }
  };
}

export function buildHofScenes(areaId) {
  return HOF_POIS.filter(poi => !areaId || hofAreaFor(poi).id === areaId).map(buildHofScene);
}
