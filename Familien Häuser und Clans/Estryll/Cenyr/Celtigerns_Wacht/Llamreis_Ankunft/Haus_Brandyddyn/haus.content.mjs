import { createDraigGardeHouseContent } from '../../../../../modules/house-content/draig-garde-house-content.mjs';

const content = createDraigGardeHouseContent('brandyddyn');

export const HOUSE_CONTENT = {
  ...content,
  contentVersion: '20261124-brandyddyn-v2',
  images: {
    ...content.images,
    scene: '../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Brândyddyn/brandyddyn-krieger-v1.png',
    sceneAlt: 'Nachtblaue Hausrüstung der Brândyddyn mit ihrem Flammenwappen'
  },
  illustrationCategory: 'Krieger des Hauses Brândyddyn'
};
