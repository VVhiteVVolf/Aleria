// Owns the soundtrack and its control for the lifetime of the Almanach page.
export function createLoadingScreenSound({ button, src }, environment = window) {
  const audio = new environment.Audio(src);
  const lifetime = new AbortController();
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  let playing = false;
  let pending = false;
  let unavailable = false;
  let stopping = false;
  let destroyed = false;
  let manuallyStopped = false;
  let operation = 0;
  let frame = null;
  let stopTimer = null;
  let resolveFade = null;
  let persistentControl = null;

  function render() {
    if (destroyed) return;
    const active = !manuallyStopped && (playing || pending);
    button.disabled = unavailable;
    button.textContent = unavailable ? '♪ Musik nicht verfügbar' : active ? pending ? '♪ Musik startet …' : '♫ Musik ausschalten' : '♪ Musik einschalten';
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Almanach-Musik ausschalten' : 'Almanach-Musik einschalten');
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
    if (destroyed || unavailable || manuallyStopped || pending) return false;
    if (playing && !stopping) return true;
    const current = ++operation;
    cancelFade();
    stopping = false;
    pending = true;
    if (!playing || audio.paused) audio.volume = 0;
    render();
    try {
      await audio.play();
      if (destroyed || current !== operation) {
        if (destroyed || (!pending && !playing)) audio.pause();
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
    if (destroyed || unavailable) return;
    if (!manuallyStopped && (playing || pending)) return stop();
    manuallyStopped = false;
    return start();
  }

  async function stop() {
    manuallyStopped = true;
    stopping = true;
    pending = false;
    const current = ++operation;
    render();
    if (playing) await fadeTo(0, 1800);
    else cancelFade();
    if (destroyed || current !== operation) return;
    audio.pause();
    audio.volume = 0;
    playing = false;
    stopping = false;
    render();
  }

  function continueInAlmanach() {
    if (destroyed || persistentControl) return;
    persistentControl = environment.document.createElement('div');
    persistentControl.className = 'almanach-sound-control';
    button.className = 'almanach-sound-control__button';
    persistentControl.append(button);
    environment.document.body.append(persistentControl);
    button.addEventListener('click', toggle, { signal: lifetime.signal });
    // Entry is also a user gesture if the browser previously blocked autoplay.
    void start();
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
    persistentControl?.remove();
  }

  audio.addEventListener('error', () => {
    operation += 1;
    unavailable = true;
    playing = false;
    pending = false;
    stopping = false;
    cancelFade();
    audio.pause();
    audio.volume = 0;
    render();
  }, { signal: lifetime.signal });
  audio.addEventListener('pause', () => {
    if (destroyed || stopping || pending || !playing || !audio.paused) return;
    playing = false;
    cancelFade();
    audio.volume = 0;
    render();
  }, { signal: lifetime.signal });
  environment.addEventListener('pagehide', destroy, { once: true, signal: lifetime.signal });
  render();
  return Object.freeze({ tryAutoplay: start, toggle, continueInAlmanach, destroy });
}
