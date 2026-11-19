export const HEROLDS_COUNCIL = {
  id: 'heroldsrat',
  kind: 'council',
  description: 'sitzen in der Kammer des Herolds am runden Tisch und beraten über Cadogans Hut',
  cast: [
    ['iestyn', 'Iestyn'],
    ['gareth', 'Gareth'],
    ['trahern', 'Trahern'],
    ['cadogan', 'Cadogan'],
    ['cadfan', 'Cadfan'],
    ['neala', 'Neala'],
    ['branwen', 'Branwen']
  ]
};

// Approximate seat centres in the painting, measured from its top-left edge.
const seatCoordinates = [
  [8.2, 67.2], [20.5, 63], [35.3, 61.2], [50, 61], [65.2, 61.2], [79.5, 63], [91.8, 67.2]
];

export function mountLoadingScreenCouncil(_scene, art, { cast }, { createPicture, assetUrl }) {
  const document = art.ownerDocument;
  const room = document.createElement('div');
  room.className = 'almanach-loading__council-room';
  room.setAttribute('aria-hidden', 'true');
  room.style.setProperty('--council-atlas', `url("${assetUrl('heroldsrat-gesten-v6.webp')}")`);
  room.style.setProperty('--council-atlas-height', `${cast.length * 100}%`);
  const painting = createPicture('heroldsrat-kammer-v6', 1440, 1080);
  const frontOfTable = painting.cloneNode(true);
  frontOfTable.className = 'almanach-loading__council-table';
  room.append(painting);

  const seats = new Map(cast.map(([person], index) => {
    const [x, y] = seatCoordinates[index];
    const element = document.createElement('span');
    element.className = 'almanach-loading__council-seat';
    element.dataset.councilSeat = person;
    element.style.setProperty('--seat-x', `${x}%`);
    element.style.setProperty('--seat-bottom', `${100 - y}%`);
    element.style.setProperty('--council-row', `${index * 100 / (cast.length - 1)}%`);
    room.append(element);
    return [person, { element, x }];
  }));

  room.append(frontOfTable);
  art.replaceChildren(room);

  let speaker;
  return (quote, bubble) => {
    if (speaker) delete speaker.dataset.speaking;
    const seat = seats.get(quote?.speaker);
    speaker = seat?.element;
    if (!seat) return;
    speaker.dataset.speaking = '';
    bubble.style.setProperty('--council-speaker-x', `${seat.x}cqw`);
  };
}
