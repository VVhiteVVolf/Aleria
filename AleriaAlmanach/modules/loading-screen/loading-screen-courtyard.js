export const OWETAS_COURTYARD = {
  id: 'owetas-quartett',
  kind: 'courtyard',
  description: 'stehen im Innenhof von Castell Draig und besprechen ihren Besuch am Tirfelyn-Hof',
  cast: [
    ['oweta', 'Oweta'],
    ['lefraye', 'Lefraye'],
    ['rianna', 'Rianna'],
    ['caralyn', 'Caralyn']
  ]
};

const stagePositions = [20, 39, 60, 80];

export function mountLoadingScreenCourtyard(_scene, art, { cast }, { createPicture, assetUrl }) {
  const picture = createPicture('oweta-courtyard-plate-v10', 1536, 1024);
  picture.className = 'almanach-loading__courtyard';
  art.replaceChildren(picture);
  const people = new Map(cast.map(([id], index) => {
    const person = art.ownerDocument.createElement('span');
    const x = stagePositions[index];
    person.className = 'almanach-loading__courtyard-person';
    person.dataset.courtyardPerson = id;
    person.style.setProperty('--courtyard-x', `${x}%`);
    person.style.setProperty('--courtyard-row', `${index * 100 / (cast.length - 1)}%`);
    art.append(person);
    return [id, { person, x }];
  }));
  art.style.setProperty('--courtyard-atlas', `url("${assetUrl('oweta-courtyard-gestures-v10.webp')}")`);

  let speaking;
  return (quote, bubble) => {
    speaking?.removeAttribute('data-speaking');
    const actor = people.get(quote?.speaker);
    speaking = actor?.person;
    if (!actor) return;
    speaking.dataset.speaking = '';
    bubble.style.setProperty('--courtyard-speaker-x', `${actor.x}cqw`);
  };
}
