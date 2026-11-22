import { LOADING_SCREEN_QUOTES } from './loading-screen-quotes.js?v=20261122-carys-archery-v1';

export function mountLoadingScreenBanter(root, { variant, signal, showSpeaker, environment = window }) {
  const bubble = root.querySelector('[data-loading-banter]');
  const speaker = bubble?.querySelector('[data-banter-speaker]');
  const line = bubble?.querySelector('[data-banter-line]');
  const quotes = LOADING_SCREEN_QUOTES[variant.id];
  if (!speaker || !line || !quotes?.length || signal?.aborted) return null;
  const dialogue = variant.opening ? [variant.opening, ...quotes] : quotes;
  const positions = new Map(variant.cast.map(([id, name], index) => [
    id, { name, offset: (index + .5) / variant.cast.length - .5 }
  ]));
  let timer;
  let index = 0;
  let active = false;

  function showNext() {
    const turn = dialogue[index];
    const actor = positions.get(turn.speaker);
    if (turn === variant.opening) {
      delete bubble.dataset.speaker;
      bubble.dataset.banterContext = '';
    } else {
      bubble.dataset.speaker = turn.speaker;
      delete bubble.dataset.banterContext;
    }
    bubble.style.setProperty('--speaker-offset', actor?.offset ?? 0);
    speaker.textContent = actor?.name ?? '';
    line.textContent = turn.text;
    showSpeaker?.(actor ? turn : null, bubble);
    bubble.hidden = false;
    timer = environment.setTimeout(() => {
      bubble.hidden = true;
      showSpeaker?.(null, bubble);
      index = (index + 1) % dialogue.length;
      timer = environment.setTimeout(showNext, 1400);
    }, Math.max(4400, turn.text.length * 52));
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
