(function () {
  'use strict';

  // Runs before the deferred application scripts. No Firebase access or app state.
  const html = document.documentElement;
  const lifetime = new AbortController();
  const milestones = new Map([
    ['page', { label: 'Seite', done: document.readyState === 'complete' }],
    ['shell', { label: 'Archiv', done: false }],
    ['modules', { label: 'Weltwissen', done: false }],
    ['characters', { label: 'Figuren', done: false }],
    ['creatures', { label: 'Kreaturen', done: false }],
    ['art', { label: 'Reisebilder', done: false }]
  ]);
  let view = null;
  let slow = false;
  let failed = false;
  let offline = false;
  let leaving = false;
  let animationPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let contentWasInert = false;
  let contentAriaHidden = null;
  let previousFocus = null;
  let sound = null;

  html.dataset.almanachLoading = '';
  const slowTimer = window.setTimeout(() => { slow = true; render(); }, 15000);
  const listen = (target, name, handler, options = {}) => {
    target.addEventListener(name, handler, { ...options, signal: lifetime.signal });
  };

  function complete(name) {
    if (leaving || !milestones.has(name)) return;
    milestones.get(name).done = true;
    render();
  }

  function isReady() {
    return !failed && [...milestones.values()].every(item => item.done);
  }

  function render() {
    if (!view || leaving) return;
    const ready = isReady();
    const items = [...milestones.values()];
    const finished = items.filter(item => item.done).length;
    view.root.dataset.state = failed ? 'error' : ready ? 'ready' : slow ? 'slow' : 'loading';
    view.root.dataset.motion = animationPaused ? 'paused' : 'playing';
    view.root.setAttribute('aria-busy', String(!ready && !failed));
    view.progress.value = finished;
    view.progress.setAttribute('aria-valuetext', `${finished} von ${items.length} Startschritten abgeschlossen`);
    view.status.textContent = failed ? 'Der Almanach konnte nicht vollständig starten.'
      : ready ? 'Dein Abenteuer kann beginnen.'
      : slow ? 'Die Reise dauert heute etwas länger …' : 'Aleria erwacht …';
    view.detail.textContent = failed ? 'Bitte lade die Seite noch einmal.'
      : ready ? offline ? 'Der verfügbare Stand ist bereit. Online-Daten laden bei Verbindung nach.' : 'Die Welt ist bereit. Die Geschichten warten auf dich.'
      : `Wird geladen: ${items.filter(item => !item.done).map(item => item.label).join(' · ')}`;
    view.enter.disabled = !ready;
    view.enter.textContent = ready ? 'Aleria betreten' : 'Die Welt wird geladen …';
    view.hint.textContent = ready ? 'Klicke irgendwo oder drücke Enter.' : 'Unsere kleine Reise begleitet dich, bis alles bereit ist.';
    view.recovery.hidden = !(slow || failed) || ready;
    view.continue.hidden = failed || !milestones.get('shell').done;
    view.pause.textContent = animationPaused ? '▷ Animation abspielen' : 'Ⅱ Animation pausieren';
    view.pause.setAttribute('aria-pressed', String(animationPaused));
    for (const step of view.steps) {
      step.dataset.complete = String(milestones.get(step.dataset.loadingStep)?.done === true);
    }
    if (ready) window.clearTimeout(slowTimer);
  }

  function restoreContent() {
    if (!view) return;
    view.content.inert = contentWasInert;
    if (contentAriaHidden === null) view.content.removeAttribute('aria-hidden');
    else view.content.setAttribute('aria-hidden', contentAriaHidden);
    delete html.dataset.almanachLoading;
  }

  function dismiss(allowPartial = false) {
    if (!view || leaving || (!isReady() && !(allowPartial && slow && !failed && milestones.get('shell').done))) return;
    leaving = true;
    view.root.dataset.state = 'leaving';
    window.clearTimeout(slowTimer);
    lifetime.abort();
    void sound?.enterAlmanach();
    window.setTimeout(() => {
      restoreContent();
      view.root.remove();
      const target = previousFocus && view.content.contains(previousFocus)
        ? previousFocus : view.content.querySelector('#archive-search-input, .gallery-tabs button, h1');
      if (target) {
        if (!target.matches('button, input, a, [tabindex]')) target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
      view = null;
    }, animationPaused ? 0 : 380);
  }

  function handleClick(event) {
    const action = event.target.closest('[data-loading-action]')?.dataset.loadingAction;
    if (action === 'pause') { void sound?.tryAutoplay(); animationPaused = !animationPaused; render(); return; }
    if (action === 'sound') { sound?.toggle(); return; }
    if (action === 'reload') { window.location.reload(); return; }
    if (!isReady() && action !== 'continue') void sound?.tryAutoplay();
    dismiss(action === 'continue');
  }

  function handleKeydown(event) {
    if (!event.target.closest('button') && !['Enter', ' '].includes(event.key)) void sound?.tryAutoplay();
    if (event.key === 'Tab') {
      const buttons = [...view.root.querySelectorAll('button')].filter(button => !button.disabled && !button.hidden && !button.closest('[hidden]'));
      const first = buttons[0];
      const last = buttons.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === view.root)) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === view.root)) {
        event.preventDefault(); first?.focus();
      }
    } else if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('button')) {
      event.preventDefault(); dismiss();
    }
  }

  function loadArtwork() {
    const sources = view.root.dataset.loadingImages.split(' ');
    const requests = sources.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve();
      // Art is decorative; a failed image must not block the application.
      img.onerror = () => resolve();
      img.src = src;
    }));
    if (view.root.querySelector('[data-loading-traveller]')) requests.push(loadWalk());
    Promise.allSettled(requests).then(() => complete('art'));
  }

  function loadSound() {
    const button = view.root.querySelector('[data-loading-action="sound"]');
    const control = view.root.querySelector('[data-loading-sound-control]');
    const src = view.root.dataset.loadingSound;
    const pendingLoad = new AbortController();
    window.addEventListener('pagehide', () => pendingLoad.abort(), { once: true, signal: pendingLoad.signal });
    import('./loading-screen-sound.js?v=20261013-v5').then(({ createLoadingScreenSound }) => {
      const cancelled = pendingLoad.signal.aborted || (!leaving && (!view || view.root.hidden));
      pendingLoad.abort();
      if (cancelled) return;
      sound = createLoadingScreenSound({ button, control, src });
      if (leaving) void sound.enterAlmanach();
      else void sound.tryAutoplay();
    }).catch(error => {
      pendingLoad.abort();
      button.setAttribute('data-sound-state', 'unavailable');
      button.setAttribute('aria-label', 'Musik nicht verfügbar');
      button.setAttribute('title', 'Musik nicht verfügbar');
      button.disabled = true;
      console.warn('Die Ladebildmusik konnte nicht vorbereitet werden:', error);
    });
  }

  function loadWalk() {
    const root = view.root;
    return import('./loading-screen-walk.js?v=20261013-v5').then(({ mountLoadingScreenWalk }) => {
      if (!leaving && view) return mountLoadingScreenWalk(root);
    }).catch(error => console.warn('Die ruhige Laufanimation konnte nicht vorbereitet werden:', error));
  }

  function mount() {
    if (view || leaving || document.readyState === 'loading') return;
    const root = document.querySelector('[data-loading-screen]');
    const content = document.querySelector('[data-almanach-content]');
    if (!root || !content) {
      delete html.dataset.almanachLoading;
      lifetime.abort();
      window.clearTimeout(slowTimer);
      return;
    }
    try {
      view = {
        root, content,
        status: root.querySelector('[data-loading-status]'),
        detail: root.querySelector('[data-loading-detail]'),
        progress: root.querySelector('progress'),
        enter: root.querySelector('[data-loading-action="enter"]'),
        pause: root.querySelector('[data-loading-action="pause"]'),
        continue: root.querySelector('[data-loading-action="continue"]'),
        recovery: root.querySelector('[data-loading-recovery]'),
        hint: root.querySelector('[data-loading-hint]'),
        steps: root.querySelectorAll('[data-loading-step]')
      };
      previousFocus = document.activeElement;
      contentWasInert = content.inert;
      contentAriaHidden = content.getAttribute('aria-hidden');
      content.inert = true;
      content.setAttribute('aria-hidden', 'true');
      root.hidden = false;
      listen(root, 'click', handleClick);
      listen(root, 'keydown', handleKeydown);
      listen(document, 'focusin', event => {
        if (view && !leaving && !root.contains(event.target)) root.focus({ preventScroll: true });
      });
      render();
      root.focus({ preventScroll: true });
      if (root.dataset.loadingSound) loadSound();
      loadArtwork();
    } catch (error) {
      sound?.destroy();
      restoreContent();
      root.hidden = true;
      lifetime.abort();
      window.clearTimeout(slowTimer);
      console.warn('Der Reisebildschirm konnte nicht gestartet werden:', error);
    }
  }

  listen(window, 'load', () => complete('page'), { once: true });
  listen(window, 'almanach:app-ready', () => complete('shell'), { once: true });
  listen(window, 'almanach:initial-modules-settled', event => {
    offline = event.detail?.offline === true;
    complete('modules');
  }, { once: true });
  listen(document, 'aleria:characters-changed', () => complete('characters'), { once: true });
  listen(document, 'aleria:creatures-changed', () => complete('creatures'), { once: true });
  listen(window, 'almanach:startup-error', () => { failed = true; render(); }, { once: true });
  listen(document, 'readystatechange', mount);
  listen(document, 'DOMContentLoaded', mount, { once: true });
  mount();
}());
