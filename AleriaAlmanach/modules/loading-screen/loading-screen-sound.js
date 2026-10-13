// The soundtrack owns its media element and fades independently of the UI.
export function createLoadingScreenSound({ button, src }, environment = window) {
  const audio = new environment.Audio(src);
  const lifetime = new AbortController();
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = 0;
  let playing = false;
  let pending = false;
  let unavailable = false;
  let exiting = false;
  let destroyed = false;
  let operation = 0;
  let frame = null;
  let stopTimer = null;
  let resolveFade = null;

  function render() {
    if (destroyed) return;
    button.disabled = unavailable || exiting;
    button.textContent = unavailable ? '♪ Musik nicht verfügbar' : playing ? '♫ Musik an' : pending ? '♪ Musik startet …' : '♪ Musik starten';
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Ladebildmusik ausschalten' : 'Ladebildmusik einschalten');
  }

  function cancelFade() {
    if (frame !== null) environment.cancelAnimationFrame(frame);
    if (stopTimer !== null) environment.clearTimeout(stopTimer);
    frame = null;
    stopTimer = null;
    const resolve = resolveFade;
    resolveFade = null;
    resolve?.();
  }

  function fadeTo(target, duration) {
    cancelFade();
    const from = audio.volume;
    const startedAt = environment.performance.now();
    return new Promise(resolve => {
      resolveFade = resolve;
      const finish = () => { audio.volume = target; cancelFade(); };
      const tick = now => {
        const progress = Math.max(0, Math.min(1, (now - startedAt) / duration));
        const eased = progress * progress * (3 - 2 * progress);
        audio.volume = from + (target - from) * eased;
        if (progress >= 1) finish();
        else frame = environment.requestAnimationFrame(tick);
      };
      frame = environment.requestAnimationFrame(tick);
      // Also stop in background tabs, where animation frames may be suspended.
      stopTimer = environment.setTimeout(finish, duration + 50);
    });
  }

  async function start() {
    if (destroyed || exiting || unavailable) return false;
    const current = ++operation;
    pending = true;
    audio.volume = 0;
    render();
    try {
      await audio.play();
      if (destroyed || exiting || current !== operation) { audio.pause(); return false; }
      pending = false;
      playing = true;
      render();
      void fadeTo(.55, 850);
      return true;
    } catch {
      if (current === operation) { pending = false; playing = false; render(); }
      return false;
    }
  }

  function toggle() {
    if (destroyed || exiting) return;
    if (playing || pending) {
      operation += 1;
      cancelFade();
      audio.pause();
      audio.volume = 0;
      playing = false;
      pending = false;
      render();
    } else void start();
  }

  async function fadeOut(duration = 1800) {
    if (destroyed || exiting) return;
    exiting = true;
    operation += 1;
    render();
    if (playing) await fadeTo(0, duration);
    destroy();
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    operation += 1;
    cancelFade();
    audio.pause();
    audio.volume = 0;
    audio.removeAttribute('src');
    audio.load();
    lifetime.abort();
  }

  audio.addEventListener('error', () => { unavailable = true; playing = false; pending = false; cancelFade(); render(); }, { signal: lifetime.signal });
  environment.addEventListener('pagehide', destroy, { once: true, signal: lifetime.signal });
  render();
  return Object.freeze({ tryAutoplay: start, toggle, fadeOut, destroy });
}
