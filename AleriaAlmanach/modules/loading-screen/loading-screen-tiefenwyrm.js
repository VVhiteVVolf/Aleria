import { mountLoadingGameDock } from './games/loading-game-dock.js?v=20261122-carys-archery-v1';

export const TIEFENWYRM_CHASE = {
  id: 'tiefenwyrm',
  kind: 'rose-chase',
  dialogueOrigin: 'scripted',
  description: 'stehen bei einer zerschlagenen Teekanne und einer beschädigten Rosenhecke',
  cast: [
    ['idwal', 'Idwal'],
    ['trevor', 'Trevor'],
    ['talon', 'Talon']
  ]
};

const speakerPositions = { idwal: 43, trevor: 84, talon: 13 };

export function mountLoadingScreenTiefenwyrm(scene, art, _variant, options) {
  const { createPicture } = options;
  const impact = createPicture('rosenflucht-vorspiel-v10', 1536, 1024);
  const windup = createPicture('rosenflucht-vorspiel-ausholen-v10', 1536, 1024);
  impact.className = 'almanach-loading__chase-picture';
  windup.className = 'almanach-loading__chase-picture almanach-loading__chase-windup';
  art.replaceChildren(impact, windup);

  mountLoadingGameDock(scene, options, {
    title: 'Rosenflucht',
    details: [
      'Ziffernblock oder Pfeiltasten. 4 / ← zurück, 6 / → vor, 8 / ↑ springen, 2 / ↓ ducken.',
      'Am Handy die Pfeile unter dem Spiel antippen oder halten.'
    ],
    loading: 'Die Jagd wird geladen …',
    load: () => import('./rose-chase/chase-game.js?v=20261122-carys-archery-v1')
      .then(({ mountRoseChase }) => mountRoseChase)
  });
  return (quote, bubble) => {
    if (quote) bubble.style.setProperty('--chase-speaker-x', `${speakerPositions[quote.speaker]}cqw`);
  };
}
