const travellers = Object.freeze({
  gawain: 'Gawain',
  guinevere: 'Guinevere',
  freya: 'Freya',
  fenrir: 'Fenrir'
});

const banter = Object.freeze([
  ['gawain', 'Das ist kein Umweg. Das ist ein würdigerer Auftritt.'],
  ['guinevere', 'Ich sehe die Herberge. Du darfst sie gleich entdecken.'],
  ['freya', 'Wartet! Der Bach ist verstimmt. Oder meine Laute.'],
  ['fenrir', 'Der Bach schafft es auch ohne Probe bis zur Herberge.'],
  ['gawain', 'Ritterliche Voraussicht. Ich habe ein zweites Halstuch dabei.'],
  ['guinevere', 'Ich habe die Karte. Dein Halstuch darf trotzdem mitkommen.'],
  ['freya', 'Fenrir, klapper noch mal mit dem Gürtel. Ich brauche den Takt.'],
  ['fenrir', 'Das war mein Magen.'],
  ['gawain', 'Der Schlamm reicht bis zum Knöchel. Das ist ein Hinterhalt.'],
  ['guinevere', 'Links ist es trocken. Ich wollte nur hören, wie du das nennst.'],
  ['freya', 'Die Ballade ist fast fertig. Könnt ihr euch auf ein Versmaß einigen?'],
  ['fenrir', 'Ich hab Brot. Das ist mein Beitrag zur Ballade.']
]);

export function mountLoadingScreenBanter(root, { signal, environment = window } = {}) {
  const bubble = root.querySelector('[data-loading-banter]');
  const speaker = bubble?.querySelector('[data-banter-speaker]');
  const line = bubble?.querySelector('[data-banter-line]');
  if (!speaker || !line || signal?.aborted) return null;
  let timer;
  let index = 0;
  let active = false;

  function showNext() {
    const [traveller, text] = banter[index];
    index = (index + 1) % banter.length;
    bubble.dataset.speaker = traveller;
    speaker.textContent = travellers[traveller];
    line.textContent = text;
    bubble.hidden = false;
    timer = environment.setTimeout(() => {
      bubble.hidden = true;
      timer = environment.setTimeout(showNext, 1400);
    }, 4400);
  }

  function setActive(enabled) {
    const next = !!enabled && !signal?.aborted;
    if (next === active) return;
    active = next;
    environment.clearTimeout(timer);
    bubble.hidden = true;
    if (active) timer = environment.setTimeout(showNext, 1250);
  }

  signal?.addEventListener('abort', () => setActive(false), { once: true });
  return Object.freeze({ setActive });
}
