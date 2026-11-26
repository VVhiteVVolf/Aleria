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
  { source: 'https://i.imgur.com/dscN0iz.png', local: '/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Herrschaft_Haus_Wyrm/Craithglyn/assets/hywel-tynged.png' },
  { source: 'https://i.imgur.com/yu4DXTn.png', local: '/Kontinente/modules/administration/assets/portraits/afan-draenmelyn.webp' },
  { source: 'https://i.imgur.com/yEPvXLm.png', local: '/Kontinente/modules/administration/assets/portraits/brona-eisenherz.webp' },
  { source: 'https://i.imgur.com/sMslhgn.png', local: '/Kontinente/modules/administration/assets/portraits/bryn-rhydderch.webp' },
  { source: 'https://i.imgur.com/SaDQCjc.png', local: '/Kontinente/modules/administration/assets/portraits/cadell-ysgrif.webp' },
  { source: 'https://i.imgur.com/t2AWKNw.png', local: '/Kontinente/modules/administration/assets/portraits/cadog-morwyn.webp' },
  { source: 'https://i.imgur.com/UtW0UZD.png', local: '/Kontinente/modules/administration/assets/portraits/cai-taflu.webp' },
  { source: 'https://i.imgur.com/LK3q0UI.png', local: '/Kontinente/modules/administration/assets/portraits/caradog-tonnarth.webp' },
  { source: 'https://i.imgur.com/y5aRhJb.png', local: '/Kontinente/modules/administration/assets/portraits/emrys-porthan.webp' },
  { source: 'https://i.imgur.com/IEHF8TV.png', local: '/Kontinente/modules/administration/assets/portraits/gethin-draenmelyn.webp' },
  { source: 'https://i.imgur.com/vSRYHg1.png', local: '/Kontinente/modules/administration/assets/portraits/glendower-o-cenyr.webp' },
  { source: 'https://i.imgur.com/cy3TS2x.png', local: '/Kontinente/modules/administration/assets/portraits/gwenllian-lyswen.webp' },
  { source: 'https://i.imgur.com/mqnDamN.png', local: '/Kontinente/modules/administration/assets/portraits/iddon-haearn.webp' },
  { source: 'https://i.imgur.com/6YW06jU.png', local: '/Kontinente/modules/administration/assets/portraits/ifor-draenmelyn.webp' },
  { source: 'https://i.imgur.com/RE5WMSF.png', local: '/Kontinente/modules/administration/assets/portraits/rhodri-aelmor.webp' },
  { source: 'https://i.imgur.com/cAfLe9b.png', local: '/Kontinente/modules/administration/assets/portraits/rhunlas-llon.webp' },
  { source: 'https://i.imgur.com/NR8HKxj.png', local: '/Kontinente/modules/administration/assets/portraits/rhydwen-swyll.webp' },
]);

const localBySource = new Map(ADMINISTRATION_PORTRAIT_ARCHIVE.map(entry => [entry.source, entry.local]));

export function resolveAdministrationPortrait(source) {
  return localBySource.get(source) || source;
}
