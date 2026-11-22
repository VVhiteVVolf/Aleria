export const REFRI_FITTING_ROOM = {
  id: 'refri-anprobe',
  kind: 'fitting-room',
  description: 'sind im separaten Anproberaum von Göttliche Eleganz. Catrin wartet besorgt vor der klappernden Kabinentür. Unter der Tür stehen Refris Schuhe',
  cast: [['refri', 'Refri'], ['catrin', 'Catrin']]
};

const frame = [1672, 941];
const doorBox = [783, 121, 1128, 755];
const openingBox = [761, 69, 1144, 851];
const artwork = {
  protest: 'refri-anprobe-tuer-offen-v2.webp',
  reassure: 'refri-anprobe-beruhigen-v2.webp'
};

function placeLayer(element, [left, top, right, bottom]) {
  const [width, height] = frame;
  element.classList.add('almanach-loading__fitting-layer');
  Object.assign(element.style, {
    left: `${left / width * 100}%`,
    top: `${top / height * 100}%`,
    width: `${(right - left) / width * 100}%`,
    height: `${(bottom - top) / height * 100}%`
  });
}

function rattleWithSound(scene, panel, { assetUrl, signal, isMusicMuted }) {
  const { ownerDocument } = scene;
  const { navigator } = ownerDocument.defaultView;
  const screen = scene.closest('[data-loading-screen]');
  const sound = ownerDocument.createElement('audio');
  sound.preload = 'none';
  sound.volume = .32;
  panel.addEventListener('animationiteration', () => {
    if (ownerDocument.hidden || screen?.dataset.motion !== 'playing' || isMusicMuted?.() || sound.error) return;
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
    if (!sound.hasAttribute('src')) sound.src = assetUrl('refri-anprobe-klappern-v2.wav');
    sound.currentTime = 0;
    void sound.play().catch(() => {});
  }, { signal });
  signal?.addEventListener('abort', () => {
    if (!sound.hasAttribute('src')) return;
    sound.pause();
    sound.removeAttribute('src');
    sound.load();
  }, { once: true });
}

export function mountLoadingScreenFittingRoom(scene, art, _variant, options) {
  const { createPicture, assetUrl, signal } = options;
  const document = art.ownerDocument;
  const stage = document.createElement('div');
  stage.className = 'almanach-loading__fitting-stage';
  stage.setAttribute('aria-hidden', 'true');
  const backdrop = createPicture('refri-anprobe-geschlossen-v2', ...frame);
  backdrop.className = 'almanach-loading__fitting-backdrop';
  const background = backdrop.querySelector('img');
  const revealLayers = () => { stage.dataset.fittingBackdrop = 'ready'; };
  if (background.complete && background.naturalWidth) revealLayers();
  else background.addEventListener('load', revealLayers, { once: true, signal });

  const door = document.createElement('span');
  door.className = 'almanach-loading__fitting-door';
  placeLayer(door, doorBox);
  door.hidden = true;
  const panel = document.createElement('img');
  panel.alt = '';
  panel.decoding = 'async';
  panel.addEventListener('load', () => { door.hidden = false; }, { once: true, signal });
  panel.src = assetUrl('refri-anprobe-tuerblatt-v2.webp');
  door.append(panel);
  stage.append(backdrop, door);

  const peeks = new Map();
  let requestedPose;
  function showPose() {
    const peek = peeks.get(requestedPose);
    if (peek && !peek.hidden) stage.dataset.fittingPose = requestedPose;
    else delete stage.dataset.fittingPose;
  }
  for (const [pose, file] of Object.entries(artwork)) {
    const image = document.createElement('img');
    image.alt = '';
    image.decoding = 'async';
    image.hidden = true;
    image.className = 'almanach-loading__fitting-peek';
    image.dataset.fittingPeek = pose;
    placeLayer(image, openingBox);
    peeks.set(pose, image);
    image.addEventListener('load', () => { image.hidden = false; showPose(); }, { once: true, signal });
    image.src = assetUrl(file);
    stage.append(image);
  }
  art.replaceChildren(stage);
  rattleWithSound(scene, panel, options);

  return (quote, bubble) => {
    requestedPose = quote?.peek;
    showPose();
    if (!quote) return;
    const speakerX = quote.speaker === 'catrin' ? 668 : quote.peek ? 832 : 928;
    bubble.style.setProperty('--fitting-speaker-offset', speakerX / frame[0] - .5);
  };
}
