import { createDraigGardeHouseContent } from '../../../../../modules/house-content/draig-garde-house-content.mjs';

const content = createDraigGardeHouseContent('brandyddyn');

export const HOUSE_CONTENT = {
  ...content,
  contentVersion: '20261124-brandyddyn-v2',
  images: {
    ...content.images,
    scene: '../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Brandyddyn/assets/brandyddyn-krieger-v1.png',
    sceneAlt: 'Nachtblaue Hausrüstung der Brândyddyn mit ihrem Flammenwappen'
  },
  illustrationCategory: 'Krieger des Hauses Brândyddyn'
};
