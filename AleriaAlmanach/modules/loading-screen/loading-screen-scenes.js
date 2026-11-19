import { LOADING_SCREEN_JOURNEYS, mountLoadingScreenJourney } from './loading-screen-journey.js?v=20261119-journey-v6';
import { HEROLDS_COUNCIL, mountLoadingScreenCouncil } from './loading-screen-council.js?v=20261119-journey-v6';

const assetRoot = new URL('../../public/assets/loading-screen/', import.meta.url);
const lastSceneKey = 'almanach.loadingScene';
export const LOADING_SCREEN_SCENES = [...LOADING_SCREEN_JOURNEYS, HEROLDS_COUNCIL];

export function chooseLoadingScreenScene({ random = Math.random, storage } = {}) {
  let lastScene;
  try { lastScene = storage?.getItem(lastSceneKey); } catch { /* Storage kann gesperrt sein. */ }
  const choices = LOADING_SCREEN_SCENES.filter(({ id }) => id !== lastScene);
  const selected = choices[Math.floor(random() * choices.length)];
  try { storage?.setItem(lastSceneKey, selected.id); } catch { /* Die aktuelle Szene ist weiterhin sichtbar. */ }
  return selected;
}

function assetUrl(name) {
  return new URL(name, assetRoot).href;
}

function createPicture(document, name, width, height) {
  const picture = document.createElement('picture');
  for (const size of ['mobile', 'desktop']) {
    const source = document.createElement('source');
    if (size === 'mobile') source.media = '(max-width: 600px)';
    source.type = 'image/avif';
    source.srcset = assetUrl(`${name}-${size}.avif`);
    picture.append(source);
  }
  const image = document.createElement('img');
  image.alt = '';
  image.width = width;
  image.height = height;
  image.decoding = 'async';
  image.fetchPriority = 'high';
  picture.append(image);
  image.src = assetUrl(`${name}-fallback.webp`);
  return picture;
}

export function mountLoadingScreenScene(scene, { signal } = {}) {
  const art = scene.querySelector('[data-loading-scene-art]');
  if (!art || signal?.aborted) return null;
  let storage;
  try { storage = scene.ownerDocument.defaultView.sessionStorage; } catch { /* Storage kann gesperrt sein. */ }
  const variant = chooseLoadingScreenScene({ storage });
  const people = new Intl.ListFormat('de', { type: 'conjunction' }).format(variant.cast.map(([, name]) => name));
  art.setAttribute('aria-label', `${people} ${variant.description}.`);
  scene.dataset.loadingVariant = variant.id;
  scene.dataset.sceneKind = variant.kind || 'journey';
  const mountArt = variant.kind === 'council' ? mountLoadingScreenCouncil : mountLoadingScreenJourney;
  const showSpeaker = mountArt(scene, art, variant, {
    assetUrl,
    createPicture: (name, width, height) => createPicture(art.ownerDocument, name, width, height)
  });

  let playing = false;
  let banter;
  let banterRequest;

  function setActive(active) {
    playing = active && !signal?.aborted;
    if (banter) { banter.setActive(playing); return; }
    if (!playing || banterRequest) return;
    banterRequest = import('./loading-screen-banter.js?v=20261119-journey-v6')
      .then(({ mountLoadingScreenBanter }) => {
        if (signal?.aborted) return;
        banter = mountLoadingScreenBanter(scene, { variant, signal, showSpeaker });
        banter?.setActive(playing);
      })
      .catch(error => console.warn('Die Zitate des Ladebildschirms konnten nicht geladen werden:', error));
  }

  return Object.freeze({ setActive });
}
