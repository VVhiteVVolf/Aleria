export function mountLoadingGameDock(scene, options, game) {
  const { assetUrl, signal, onGameActivity, isMusicMuted } = options;
  const document = scene.ownerDocument;
  const dock = document.createElement('div');
  dock.className = 'almanach-loading__game-dock';
  dock.dataset.loadingInteractive = '';
  const description = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = game.title;
  description.append(title);
  for (const detail of game.details) {
    const paragraph = document.createElement('p');
    paragraph.textContent = detail;
    description.append(paragraph);
  }
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.hidden = true;
  description.append(status);
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'almanach-loading__game-play';
  play.textContent = 'Spielen';
  dock.append(description, play);
  scene.after(dock);

  function restore() {
    if (signal?.aborted) return;
    scene.hidden = false;
    dock.hidden = false;
    play.disabled = false;
    onGameActivity?.(false);
    play.focus({ preventScroll: true });
  }

  async function start() {
    if (play.disabled || signal?.aborted) return;
    play.disabled = true;
    status.hidden = false;
    status.textContent = game.loading;
    const muted = isMusicMuted?.();
    onGameActivity?.(true);
    try {
      const mount = await game.load();
      if (signal?.aborted) return;
      const instance = await mount(dock, { assetUrl, muted, signal, onClose: restore });
      if (signal?.aborted) return;
      if (!instance) throw new Error('Das Minispiel konnte nicht vorbereitet werden.');
      scene.hidden = true;
      dock.hidden = true;
      status.hidden = true;
      instance.focus();
    } catch (error) {
      if (signal?.aborted) return;
      status.textContent = 'Das Spiel konnte nicht geladen werden. Versuch es noch einmal.';
      restore();
      console.warn(game.title + ' konnte nicht gestartet werden.', error);
    }
  }

  play.addEventListener('click', start, { signal });
}
