export const TIEFENWYRM_CHASE = {
  id: 'tiefenwyrm',
  kind: 'rose-chase',
  dialogueOrigin: 'scripted',
  description: 'stehen bei einer zerschlagenen Teekanne und einer beschädigten Rosenhecke',
  cast: [
    ['idwal', 'Idwal'],
    ['trevor', 'Trevor'],
    ['talon', 'Talon']
  ]
};

const speakerPositions = { idwal: 43, trevor: 84, talon: 13 };

export function mountLoadingScreenTiefenwyrm(scene, art, _variant, options) {
  const { createPicture, assetUrl, signal, onGameActivity, isMusicMuted } = options;
  const impact = createPicture('rosenflucht-vorspiel-v10', 1536, 1024);
  const windup = createPicture('rosenflucht-vorspiel-ausholen-v10', 1536, 1024);
  impact.className = 'almanach-loading__chase-picture';
  windup.className = 'almanach-loading__chase-picture almanach-loading__chase-windup';
  art.replaceChildren(impact, windup);

  const dock = scene.ownerDocument.createElement('div');
  dock.className = 'almanach-loading__chase-dock';
  dock.dataset.loadingInteractive = '';
  dock.innerHTML = `
    <div>
      <strong>Rosenflucht</strong>
      <p>Ziffernblock oder Pfeiltasten. 4 / ← zurück, 6 / → vor, 8 / ↑ springen, 2 / ↓ ducken.</p>
      <p>Am Handy die Pfeile unter dem Spiel antippen oder halten.</p>
      <p role="status" data-chase-load-status hidden></p>
    </div>
    <button type="button" class="almanach-loading__chase-play">Spielen</button>`;
  scene.after(dock);
  const play = dock.querySelector('button');
  const status = dock.querySelector('[data-chase-load-status]');

  function restore() {
    if (signal?.aborted) return;
    scene.hidden = false;
    dock.hidden = false;
    play.disabled = false;
    play.focus({ preventScroll: true });
    onGameActivity?.(false);
  }

  async function start() {
    if (play.disabled || signal?.aborted) return;
    play.disabled = true;
    status.hidden = false;
    status.textContent = 'Die Jagd wird geladen …';
    const muted = isMusicMuted?.();
    onGameActivity?.(true);
    try {
      const { mountRoseChase } = await import('./rose-chase/chase-game.js?v=20261120-rosenflucht-v11');
      if (signal?.aborted) return;
      const game = await mountRoseChase(dock, { assetUrl, muted, signal, onClose: restore });
      if (!game || signal?.aborted) return;
      scene.hidden = true;
      dock.hidden = true;
      status.hidden = true;
      game.focus();
    } catch (error) {
      if (signal?.aborted) return;
      status.textContent = 'Das Spiel konnte nicht geladen werden. Versuch es noch einmal.';
      restore();
      console.warn('Die Rosenflucht konnte nicht gestartet werden:', error);
    }
  }

  play.addEventListener('click', start, { signal });
  return (quote, bubble) => {
    if (quote) bubble.style.setProperty('--chase-speaker-x', `${speakerPositions[quote.speaker]}cqw`);
  };
}
