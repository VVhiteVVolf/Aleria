import { GWYNTHOR_CITY_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';
import { GWYNTHOR_CITY_PLACES, cityPlaceSceneVersion } from './stadtorte-scenes.mjs';

export const CITY_PLACES_SECTION = Object.freeze({
  key: 'Gwynthor-Stadt', tab: 'Völker & Kulturen', path: GWYNTHOR_CITY_PATH,
  description: 'Bespielbare Orte in Gwynthor-Stadt.'
});
const artRoot = './public/assets/gwynthor-stadtorte';
const artwork = (id, version) => `${artRoot}/${id}-v${version}.webp`;

export function buildGwynthorCityPlaces() {
  return GWYNTHOR_CITY_PLACES.map(place => ({
    id: place.id, title: place.title, subtitle: place.subtitle,
    type: 'Interaktive Szene', category: 'Gwynthor-Stadt · Schauplätze',
    icon: '❧', stamp: `GWYNTHOR · ${place.title.replace('Gwynthor ', '').toLocaleUpperCase('de')}`,
    image: artwork(place.cover, cityPlaceSceneVersion(place, place.scenes.find(scene => scene.id === place.cover))),
    previewImage: artwork(place.cover, cityPlaceSceneVersion(place, place.scenes.find(scene => scene.id === place.cover))),
    schemaVersion: 1, multipage: true, appendCommentsPage: false,
    enablePageComments: false, sessionCast: [],
    pages: place.scenes.map(scene => ({
      schemaVersion: 1, pageTitle: scene.title,
      commentThreadKey: `gwynthor-${scene.id}`,
      image: artwork(scene.id, cityPlaceSceneVersion(place, scene)), imageWidth: 34, imageTall: true,
      imageFit: 'cover', imagePosition: scene.imagePosition || 'center 75%',
      sessionPage: true, sessionIntro: scene.intro,
      sessionLocation: `Gwynthor-Stadt · ${scene.location || scene.title}`,
      sessionHint: scene.hint, sessionEmptyTitle: scene.emptyTitle,
      sessionEmptyText: scene.emptyText,
      sessionDateAleria: { year: null, month: null, day: null }
    }))
  }));
}
