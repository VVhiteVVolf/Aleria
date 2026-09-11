// Labels describe the house, while authoring sources store the holder's title.
const houseLabels = Object.freeze({
  König: 'Königshaus', Kaiser: 'Kaiserhaus', Herzog: 'Herzogshaus',
  Fürst: 'Fürstenhaus', Graf: 'Grafenhaus', Baron: 'Baronenhaus',
  Ritterfürst: 'Ritterfürstenhaus', Ritterherr: 'Ritterherrenhaus',
  Bürgerlich: 'Bürgerliches Haus',
});

export function houseRankLabel(rank) {
  const value = typeof rank === 'string' ? rank.trim() : '';
  return houseLabels[value] || value || 'Offen';
}
