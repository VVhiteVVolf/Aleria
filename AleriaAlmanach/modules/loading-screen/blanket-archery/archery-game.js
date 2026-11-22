import { loadGameStylesheet } from '../games/loading-game-assets.js?v=20261122-carys-archery-v1';
import { createArcheryAudio } from './archery-audio.js?v=20261122-carys-archery-v1';
import { bindArcheryInput } from './archery-input.js?v=20261122-carys-archery-v1';
import { advanceArchery, beginDraw, cancelDraw, createArcheryRound, releaseArrow, setAim } from './archery-range.js?v=20261122-carys-archery-v1';
import { createArcheryStage, loadArcheryArt } from './archery-stage.js?v=20261122-carys-archery-v1';
import { createArcheryView } from './archery-view.js?v=20261122-carys-archery-v1';

export async function mountBlanketArchery(dock, { assetUrl, muted, signal, onClose }) {
  if (signal?.aborted) return null;
  const document = dock.ownerDocument;
  const environment = document.defaultView;
  const lifetime = new AbortController();
  const localSignal = lifetime.signal;
  const stop = () => lifetime.abort();
  signal?.addEventListener('abort', stop, { once: true, signal: localSignal });
  try {
    const stylesheet = new URL('./archery-game.css?v=20261122-carys-archery-v1', import.meta.url).href;
    const [art] = await Promise.all([
      loadArcheryArt(environment, assetUrl, localSignal),
      loadGameStylesheet(document, stylesheet, localSignal)
    ]);
    if (localSignal.aborted) return null;
    const view = createArcheryView(document, art);
    const stage = createArcheryStage(view.canvas, art);
    const sound = createArcheryAudio(environment, muted);
    let state = createArcheryRound();
    let paused = document.hidden;
    let frame = null;
    let previousTime = null;
    const isPlaying = () => !paused && state.phase === 'playing' && !localSignal.aborted;

    function render() {
      stage.draw(state, isPlaying());
      view.render(state, { paused, muted: sound.isMuted() });
    }

    function stopFrames() {
      if (frame !== null) environment.cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
    }

    function schedule() {
      if (frame === null && isPlaying()) frame = environment.requestAnimationFrame(tick);
    }

    const input = bindArcheryInput(view.field, {
      signal: localSignal,
      aim(x, y) { if (isPlaying()) setAim(state, x, y); },
      draw() {
        if (!isPlaying() || !beginDraw(state)) return false;
        sound.wake();
        sound.feedback('draw');
        return true;
      },
      release() {
        if (isPlaying() && releaseArrow(state)) sound.feedback('release');
      },
      cancel() { cancelDraw(state); }
    });

    function tick(now) {
      frame = null;
      const elapsed = previousTime === null ? 0 : Math.min(.050, (now - previousTime) / 1000);
      previousTime = now;
      const direction = input.direction();
      if (direction.x || direction.y) setAim(state, state.aim.x + direction.x * elapsed * 340,
        state.aim.y + direction.y * elapsed * 310);
      const impact = advanceArchery(state, elapsed, stage.hitsEinion);
      if (impact) {
        sound.feedback(impact);
        if (state.phase !== 'playing') sound.finish(state.phase);
      }
      if (isPlaying()) sound.music();
      render();
      schedule();
    }

    function restart() {
      stopFrames();
      input.clear();
      state = createArcheryRound();
      paused = document.hidden;
      sound.startRound();
      sound.setActive(!paused);
      render();
      schedule();
    }

    function setPaused(enabled) {
      if (paused === enabled || state.phase !== 'playing') return;
      paused = enabled;
      input.clear();
      stopFrames();
      sound.setActive(!paused);
      render();
      schedule();
    }

    function close() {
      stop();
      onClose();
    }

    view.root.addEventListener('click', event => {
      const action = event.target.closest('[data-archery-action]')?.dataset.archeryAction;
      if (action === 'close') close();
      if (action === 'pause') { setPaused(!paused); if (!paused) view.focus(); }
      if (action === 'retry') { restart(); view.focus(); }
      if (action === 'sound') { sound.toggleMuted(); render(); }
    }, { signal: localSignal });
    view.root.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      if (state.phase !== 'playing') close();
      else setPaused(!paused);
    }, { signal: localSignal });
    document.addEventListener('visibilitychange', () => { if (document.hidden) setPaused(true); }, { signal: localSignal });
    localSignal.addEventListener('abort', () => {
      stopFrames();
      input.clear();
      sound.destroy();
      view.root.remove();
    }, { once: true });
    dock.after(view.root);
    restart();
    return view;
  } catch (error) {
    stop();
    if (signal?.aborted) return null;
    throw error;
  }
}
