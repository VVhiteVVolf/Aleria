import { mountLoadingGameDock } from './games/loading-game-dock.js?v=20261122-carys-archery-v1';

export const CARYS_ARCHERY = {
  id: 'carys-schiessuebung',
  kind: 'blanket-archery',
  dialogueOrigin: 'scripted',
  cast: [['einion', 'Einion']],
  description: 'verteidigt seine blau-goldene Schmusedecke an der Burgwand. Carys Draig steht mit Bogen und Köcher im Vordergrund, den Rücken zum Betrachter'
};

export function mountLoadingScreenArchery(scene, art, _variant, options) {
  const picture = options.createPicture('carys-schiessuebung-v2', 1672, 941);
  picture.className = 'almanach-loading__archery-picture';
  art.replaceChildren(picture);
  mountLoadingGameDock(scene, options, {
    title: 'Carys’ Schießübung',
    details: ['Triff Einions Schmusedecke dreimal mit fünf Pfeilen. Einion selbst darf keinen Treffer abbekommen.'],
    loading: 'Die Schießübung wird geladen …',
    load: () => import('./blanket-archery/archery-game.js?v=20261122-carys-archery-v1')
      .then(({ mountBlanketArchery }) => mountBlanketArchery)
  });
}
