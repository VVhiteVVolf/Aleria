// Neue Gebietsnamen vom 22.10.2026; die überlieferten Häuser, Sitze und Ränge
// werden dadurch nicht verändert. Nur regionale Banner, keine neuen Hauswappen.
export const VENNYR_PREPARED_LORDSHIPS = Object.freeze([
  { name: 'Tir Gwanwyn', type: 'Baronie', familyId: 'haus-illygoden', seat: 'Tirwedd', region: 'Tir Dwyrain', banner: 'tir-gwanwyn.png' },
  { name: 'Tir Gwawr', type: 'Ritterfürstliche Herrschaft', familyId: 'haus-gwaedlyd', seat: 'Caer Gorwel', region: 'Tir Arfordir', banner: 'tir-gwawr.png' },
  { name: 'Tir Traethwyn', type: 'Ritterfürstliche Herrschaft', familyId: 'haus-walwrs', seat: 'Traeth', region: 'Tir Mynddoedd', banner: 'tir-traethwyn.png' },
  { name: 'Tir Derwlas', type: 'Ritterfürstliche Herrschaft', familyId: 'haus-lyfant', seat: 'Derwyddion', region: 'Tir Mynddoedd', banner: 'tir-derwlas.png' }
].map(lordship => Object.freeze({ ...lordship, banner: `assets/images/regions/Vennyr/${lordship.banner}` })));
