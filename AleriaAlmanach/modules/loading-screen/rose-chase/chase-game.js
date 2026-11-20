import { advanceChase, createChaseState } from './chase-state.js?v=20261120-rosenflucht-v11';
import { loadChaseArt } from './chase-stage.js?v=20261120-rosenflucht-v11';
import { createChaseView } from './chase-view.js?v=20261120-rosenflucht-v11';
import { bindChaseInput } from './chase-input.js?v=20261120-rosenflucht-v11';
import { createChaseAudio } from './chase-audio.js?v=20261120-rosenflucht-v11';

function loadStylesheet(document, signal) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./chase-game.css?v=20261120-rosenflucht-v11', import.meta.url).href;
  return new Promise((resolve, reject) => {
    link.addEventListener('load', resolve, { once: true, signal });
    link.addEventListener('error', () => reject(new Error('Rosenflucht stylesheet is unavailable')), { once: true, signal });
    signal.addEventListener('abort', () => { link.remove(); reject(signal.reason); }, { once: true });
    document.head.append(link);
  });
}

const isFinished = state => state.phase === 'caught' || state.phase === 'escaped';

export async function mountRoseChase(dock, { assetUrl, muted, signal, onClose }) {
  if (signal?.aborted) return null;
  const document = dock.ownerDocument;
  const environment = document.defaultView;
  const lifetime = new AbortController();
  const stop = () => lifetime.abort();
  const localSignal = lifetime.signal;
  signal?.addEventListener('abort', stop, { once: true, signal: localSignal });
  try {
    const [art] = await Promise.all([loadChaseArt(environment, assetUrl, localSignal), loadStylesheet(document, localSignal)]);
    if (localSignal.aborted) return null;
    const view = createChaseView(document, art);
    const sound = createChaseAudio(environment, muted);
    dock.after(view.root);
    const input = bindChaseInput(view.root, localSignal, sound.wake);
    let state;
    let paused = document.hidden;
    let frame = null;
    let previousTime = null;

    function render() {
      view.render(state, { paused, muted: sound.isMuted(), finished: isFinished(state) });
    }

    function cancelFrame() {
      if (frame !== null) environment.cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
    }

    function schedule() {
      if (frame === null && !paused && !isFinished(state) && !localSignal.aborted) {
        frame = environment.requestAnimationFrame(tick);
      }
    }

    function tick(now) {
      frame = null;
      const elapsed = previousTime === null ? 0 : Math.min(.041, (now - previousTime) / 1000);
      previousTime = now;
      if (elapsed > 0) {
        for (const event of advanceChase(state, input.read(), elapsed)) sound.feedback(event);
        if (state.phase === 'opening') sound.opening();
        if (state.phase === 'running') sound.music();
        render();
      }
      schedule();
    }

    function startRound() {
      cancelFrame();
      input.clear();
      state = createChaseState();
      paused = document.hidden;
      sound.startRound();
      sound.setActive(!paused);
      render();
      schedule();
    }

    function setPaused(value) {
      if (value === paused || isFinished(state)) return;
      paused = value;
      input.clear();
      cancelFrame();
      sound.setActive(!paused);
      render();
      schedule();
    }

    function close() {
      stop();
      onClose();
    }

    view.root.addEventListener('click', event => {
      const action = event.target.closest('[data-chase-action]')?.dataset.chaseAction;
      if (action === 'close') close();
      if (action === 'pause') setPaused(!paused);
      if (action === 'retry') { startRound(); view.focus(); }
      if (action === 'sound') { sound.toggleMuted(); render(); }
    }, { signal: localSignal });
    view.root.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      if (isFinished(state)) close();
      else setPaused(!paused);
    }, { signal: localSignal });
    document.addEventListener('visibilitychange', () => { if (document.hidden) setPaused(true); }, { signal: localSignal });
    localSignal.addEventListener('abort', () => {
      cancelFrame();
      sound.destroy();
      view.root.remove();
    }, { once: true });
    startRound();
    return view;
  } catch (error) {
    stop();
    if (signal?.aborted) return null;
    throw error;
  }
}
