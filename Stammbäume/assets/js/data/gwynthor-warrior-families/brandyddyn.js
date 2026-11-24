export const BRANDYDDYN_SONS = Object.freeze([
  { name: 'Aelwryd', sex: 'male', birth: 1717, portrait: true,
    title: 'Krieger der Brândyddyn', clothing: 'Hausrüstung der Brândyddyn',
    notes: 'Der Ältere der beiden Söhne übt am liebsten vor dem Frühstück, wenn es im Hof noch still ist.' },
  { name: 'Gwrgant', sex: 'male', birth: 1721, portrait: true,
    notes: 'Der jüngste Bruder Eurgains kennt die Dachgiebel der Altstadt am Umriss. Am liebsten zählt er sie von der Holzgalerie aus.' }
]);

export const BRANDYDDYN_LINE = Object.freeze({
  ancestor: 'rhychwyn',
  members: [
    { name: 'Rhychwyn', sex: 'male', birth: 1637, death: 1725, lineageRole: 'mainline', portrait: true },
    { name: 'Ceredryn', sex: 'male', birth: 1664, title: 'Oberhaupt', lineageRole: 'head', portrait: true,
      notes: 'Ceredryn hört bei Familiengesprächen gern zuerst denjenigen zu, die am weitesten vom Kopfende sitzen.' },
    { name: 'Meirona', sex: 'female', birth: 1668 },
    { name: 'Eilwarth', sex: 'male', birth: 1671, hairColor: 'grau',
      title: 'Waffenmeister der Brândyddyn', clothing: 'Hausrüstung der Brândyddyn' },
    { name: 'Dyfrayn', sex: 'male', birth: 1676, portrait: true, hairColor: 'grau',
      title: 'Ehemaliger Kanzleischreiber der Draig', notes: 'Der jüngste der vier Geschwister blieb ledig.' },
    { name: 'Ffraidwen', sex: 'female', birth: 1692, portrait: true,
      notes: 'In ihren Briefen an die Geschwister stehen selbst zwischen ernsten Absätzen kleine Beobachtungen aus ihrem Alltag.' },
    { name: 'Treforid', sex: 'male', birth: 1695, portrait: 2,
      title: 'Waffenknecht der Draig', clothing: 'Reguläre Hausrüstung der Draig' },
    { name: 'Brithwal', sex: 'male', birth: 1698, title: 'Kanzleischreiber der Draig', clothing: 'Draig-Dienstkleidung' },
    { name: 'Maelweth', sex: 'female', birth: 1700, title: 'Protokollführerin der Draig', clothing: 'Draig-Dienstkleidung' },
    { name: 'Aerwych', sex: 'male', birth: 1703, notes: 'Aerwych ist ledig. Bei Besuchen bringt er seinen Nichten und Neffen stets ein neues Rätsel mit.' },
    { name: 'Rhyfelen', sex: 'female', birth: 1704 },
    { name: 'Gweirlun', sex: 'male', birth: 1707, title: 'Krieger der Brândyddyn', clothing: 'Hausrüstung der Brândyddyn' },
    { name: 'Tangwra', sex: 'female', birth: 1708 },
    { name: 'Enfrydwen', sex: 'female', birth: 1725, portrait: true,
      notes: 'Sie merkt sich Geschichten, indem sie einzelne Sätze in ein kleines Buch schreibt.' },
    { name: 'Celyddan', sex: 'male', birth: 1729 },
    { name: 'Hylfryn', sex: 'male', birth: 1728 },
    { name: 'Rhweddwen', sex: 'female', birth: 1732 },
    { name: 'Awrdel', sex: 'female', birth: 1732 },
    { name: 'Gweirfan', sex: 'male', birth: 1733 }
  ],
  households: [
    { parent: 'rhychwyn', start: 1663, children: ['ceredryn', 'meirona', 'eilwarth', 'dyfrayn'] },
    { parent: 'ceredryn', start: 1689, children: ['pellinard', 'ffraidwen', 'treforid', 'tangwra'] },
    { parent: 'meirona', start: 1695, marriedAway: true },
    { parent: 'eilwarth', start: 1697, children: ['brithwal', 'maelweth', 'aerwych', 'rhyfelen', 'gweirlun'] },
    { parent: 'ffraidwen', start: 1719, marriedAway: true },
    { parent: 'treforid', start: 1723, children: ['enfrydwen', 'celyddan'] },
    { parent: 'brithwal', start: 1725, children: ['hylfryn', 'rhweddwen'] },
    { parent: 'maelweth', start: 1729, marriedAway: true },
    { parent: 'rhyfelen', start: 1730, marriedAway: true },
    { parent: 'gweirlun', start: 1732, children: ['awrdel', 'gweirfan'] },
    { parent: 'tangwra', start: 1734, marriedAway: true }
  ],
  summary: 'Von Rhychwyn stammen vier Geschwisterlinien ab. Ceredryn leitet die Familie. Sein Sohn Pellinard ist der Erbe. Eilwarths Zweig führt über Brithwal zu zwei Enkeln. Meirona heiratete in ein anderes Haus und Dyfrayn blieb ledig.'
});
