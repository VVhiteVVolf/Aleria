// The soundtrack owns its media element and fades independently of the UI.
export function createLoadingScreenSound({ button, src }, environment = window) {
  const audio = new environment.Audio(src);
  const lifetime = new AbortController();
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  let playing = false;
  let pending = false;
  let unavailable = false;
  let exiting = false;
  let destroyed = false;
  let manuallyStopped = false;
  let operation = 0;
  let frame = null;
  let stopTimer = null;
  let resolveFade = null;

  function render() {
    if (destroyed) return;
    button.disabled = unavailable || exiting;
    button.textContent = unavailable ? '♪ Musik nicht verfügbar' : playing ? '♫ Musik ausschalten' : pending ? '♪ Musik startet …' : '♪ Musik starten';
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
    if (destroyed || exiting || unavailable || manuallyStopped || pending) return false;
    if (playing) return true;
    const current = ++operation;
    cancelFade();
    pending = true;
    audio.volume = 0;
    render();
    try {
      await audio.play();
      if (destroyed || exiting || current !== operation) {
        if (destroyed || exiting || (!pending && !playing)) audio.pause();
        return false;
      }
      pending = false;
      playing = true;
      render();
      void fadeTo(.55, 6000);
      return true;
    } catch {
      if (current === operation) { pending = false; playing = false; render(); }
      return false;
    }
  }

  function toggle() {
    if (destroyed || exiting) return;
    if (playing || pending) {
      manuallyStopped = true;
      operation += 1;
      cancelFade();
      audio.pause();
      audio.volume = 0;
      playing = false;
      pending = false;
      render();
    } else {
      manuallyStopped = false;
      void start();
    }
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

  audio.addEventListener('error', () => {
    operation += 1;
    unavailable = true;
    playing = false;
    pending = false;
    cancelFade();
    audio.pause();
    audio.volume = 0;
    render();
  }, { signal: lifetime.signal });
  audio.addEventListener('pause', () => {
    if (destroyed || exiting || pending || !playing || !audio.paused) return;
    playing = false;
    cancelFade();
    audio.volume = 0;
    render();
  }, { signal: lifetime.signal });
  environment.addEventListener('pagehide', destroy, { once: true, signal: lifetime.signal });
  render();
  return Object.freeze({ tryAutoplay: start, toggle, fadeOut, destroy });
}
