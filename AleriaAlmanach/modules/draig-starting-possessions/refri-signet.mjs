// A personal, worn signet; the ordinary Draig house seal remains unchanged.
export const REFRI_SIGNET_IMAGE = '/AleriaAlmanach/assets/house-knight-rings/refri-thornwick-alter-siegelring-v1.png';

export function buildRefriSignetItem(image = REFRI_SIGNET_IMAGE) {
  return {
    id: 'personal-signet:refri-thornwick', canonicalKey: 'personal-signet:refri-thornwick',
    title: 'Refris alter Thornwick-Siegelring', category: 'sonstiges', type: 'Ritterlicher Siegelring',
    section: 'definition', image, definitionKind: 'unique', stackable: false,
    description: 'Refris persönlicher, alter eiserner Ritterring mit dem Emblem des Hauses Thornwick: eine helle Eule mit ausgebreiteten Schwingen auf olivgrünem Grund. Das Metall ist zerkratzt, an den Kanten abgerieben und in den Vertiefungen stellenweise rostig; die farbige Einlage ist verblasst. Ein schlichter, deutlich gebrauchter Siegelring ohne Edelstein und ohne magische Wirkung.',
    aliases: [], tags: ['Siegelring', 'Haus Thornwick', 'Persönlicher Gegenstand', 'Abgenutzt'],
    priceRange: null, stock: null, combatDefinition: null, attributes: [],
    infoRows: [{ label: 'Haus', value: 'Haus Thornwick' }, { label: 'Zustand', value: 'Alt, zerkratzt, stellenweise rostig' }],
    inventoryUseMode: 'use', mechanicsStatus: 'narrative',
    sourceRefs: [{ kind: 'personal-signet', familyId: 'haus-thornwick',
      sourcePage: 'Stammbäume/Stammbaum.html?family=haus-thornwick',
      worldPersonId: 'person--haus-thornwick--refri-thornwick' }]
  };
}
