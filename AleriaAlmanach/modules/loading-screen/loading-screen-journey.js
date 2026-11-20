export const LOADING_SCREEN_JOURNEYS = [
  {
    id: 'wolfshorn',
    dialogueOrigin: 'scripted',
    description: 'wandern durch einen Nadelwald und ein Bergtal, vorbei an einem Wasserfall',
    cast: [
      ['duncan', 'Sir Duncan'],
      ['gawain', 'Gawain'],
      ['ylva', 'Ylva'],
      ['freki', 'Freki']
    ]
  }
];

function createPanorama(document, picture) {
  const strip = document.createElement('div');
  strip.className = 'almanach-loading__panorama';
  strip.setAttribute('aria-hidden', 'true');

  picture.className = 'almanach-loading__landscape';
  strip.append(picture, picture.cloneNode(true));
  return strip;
}

function createParty(document, cast) {
  const party = document.createElement('div');
  party.className = 'almanach-loading__party';
  party.setAttribute('aria-hidden', 'true');
  const cadence = [1.07, .99, 1.12, .94];
  const phase = [-.21, -.65, -.46, -.08];
  cast.forEach(([id], index) => {
    const traveller = document.createElement('span');
    traveller.className = 'almanach-loading__traveller';
    traveller.dataset.loadingTraveller = id;
    traveller.style.setProperty('--journey-row', `${100 * index / (cast.length - 1)}%`);
    traveller.style.setProperty('--journey-cadence', `${cadence[index]}s`);
    traveller.style.setProperty('--journey-phase', `${phase[index]}s`);
    party.append(traveller);
  });
  return party;
}

export function mountLoadingScreenJourney(scene, art, { id, cast }, { createPicture, assetUrl }) {
  const count = cast.length;
  scene.dataset.partySize = String(count);
  scene.style.setProperty('--party-size', count);
  scene.style.setProperty('--atlas-height', `${count * 100}%`);
  scene.style.setProperty('--journey-atlas', `url("${assetUrl(`${id}-stride-v6.webp`)}")`);
  const picture = createPicture(`${id}-panorama-v6`, 1800, 450);
  const party = createParty(art.ownerDocument, cast);
  art.replaceChildren(createPanorama(art.ownerDocument, picture), party);

  let turnedTraveller;
  return turn => {
    turnedTraveller?.removeAttribute('data-looking-back');
    turnedTraveller = undefined;
    if (!turn?.lookAt) return;
    const speakerIndex = cast.findIndex(([person]) => person === turn.speaker);
    const targetIndex = cast.findIndex(([person]) => person === turn.lookAt);
    if (targetIndex < 0 || targetIndex >= speakerIndex) return;
    turnedTraveller = party.children[speakerIndex];
    turnedTraveller.dataset.lookingBack = '';
  };
}
