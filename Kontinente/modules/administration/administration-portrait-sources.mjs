// Exact original URLs from territorial council records and legacy documents.
// This archive resolves image provenance only; it does not assign identities.
export const ADMINISTRATION_PORTRAIT_ARCHIVE = Object.freeze([
  { source: 'https://i.imgur.com/kCRKZhW.png', local: '/Stammbäume/assets/images/portraits/haus-gwyvern/jeannae-aderyn.jpg' },
  { source: 'https://64.media.tumblr.com/69616b8e034bfa486227434056a75e61/ba9bff75417640f7-6c/s1280x1920/4d324ea625deb68171d90699dfe59355f0daa5a5.pnj', local: '/Stammbäume/assets/images/portraits/haus-wyrm/olwen-wyrm.jpg' },
  { source: 'https://i.imgur.com/yEiU1My.png', local: '/Kontinente/modules/administration/assets/portraits/gwenydd-anghof.png' },
  { source: 'https://i.imgur.com/Vn4wYAD.png', local: '/Kontinente/modules/administration/assets/portraits/torri.png' },
  { source: 'https://i.imgur.com/7yB9PR6.png', local: '/Kontinente/modules/administration/assets/portraits/arawn.png', placeholder: true },
  { source: 'https://i.imgur.com/MsmQR0F.png', local: '/Kontinente/modules/administration/assets/portraits/tegyr.png' },
  { source: 'https://i.imgur.com/yTbQ4Mq.png', local: '/Kontinente/modules/administration/assets/portraits/ceridwen-lhuyd.png' },
  { source: 'https://i.imgur.com/YdNY8rx.png', local: '/Kontinente/modules/administration/assets/portraits/jinell-harddwch.png' },
  { source: 'https://i.imgur.com/QrGSnzO.png', local: '/Kontinente/modules/administration/assets/portraits/gwydion-seon.png' },
]);

const localBySource = new Map(ADMINISTRATION_PORTRAIT_ARCHIVE.map(entry => [entry.source, entry.local]));

export function resolveAdministrationPortrait(source) {
  return localBySource.get(source) || source;
}
