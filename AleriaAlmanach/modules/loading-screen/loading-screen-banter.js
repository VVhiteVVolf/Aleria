import { LOADING_SCREEN_QUOTES } from './loading-screen-quotes.js?v=20261119-journey-v6';

export function mountLoadingScreenBanter(root, { variant, signal, showSpeaker, environment = window }) {
  const bubble = root.querySelector('[data-loading-banter]');
  const speaker = bubble?.querySelector('[data-banter-speaker]');
  const line = bubble?.querySelector('[data-banter-line]');
  const quotes = LOADING_SCREEN_QUOTES[variant.id];
  if (!speaker || !line || !quotes?.length || signal?.aborted) return null;
  const positions = new Map(variant.cast.map(([id, name], index) => [
    id, { name, offset: (index + .5) / variant.cast.length - .5 }
  ]));
  let timer;
  let index = 0;
  let active = false;

  function showNext() {
    const quote = quotes[index];
    const { speaker: person, text } = quote;
    const { name, offset } = positions.get(person);
    bubble.dataset.speaker = person;
    bubble.style.setProperty('--speaker-offset', offset);
    speaker.textContent = name;
    line.textContent = text;
    showSpeaker?.(quote, bubble);
    bubble.hidden = false;
    timer = environment.setTimeout(() => {
      bubble.hidden = true;
      showSpeaker?.(null, bubble);
      index = (index + 1) % quotes.length;
      timer = environment.setTimeout(showNext, 1400);
    }, Math.max(4400, text.length * 52));
  }

  function setActive(enabled) {
    const next = !!enabled && !signal?.aborted;
    if (next === active) return;
    active = next;
    environment.clearTimeout(timer);
    bubble.hidden = true;
    showSpeaker?.(null, bubble);
    if (active) timer = environment.setTimeout(showNext, 1250);
  }

  signal?.addEventListener('abort', () => setActive(false), { once: true });
  return Object.freeze({ setActive });
}
