import { RANGE, EINION_GROUND, drawPower, einionPoseAt } from './archery-range.js?v=20261122-carys-archery-v1';
import { einionPleaFor } from './archery-pleas.js?v=20261122-carys-archery-v1';

const verdicts = {
  blanket: 'Drei Treffer! Die Schießübung ist geschafft.',
  empty: 'Keine Pfeile mehr. Die Runde ist vorbei.',
  einion: 'Einion getroffen! Die Runde ist vorbei.'
};
const feedback = {
  blanket: 'Die Schmusedecke ist getroffen.',
  ground: 'Der Pfeil ist auf dem Boden gelandet.',
  wall: 'Der Pfeil hat die Wand getroffen.'
};
const wynonnaLine = 'Carys! Bogen runter!';

function setText(element, value) {
  if (element.textContent !== value) element.textContent = value;
}

export function createArcheryView(document, { crying, wynonna }) {
  const root = document.createElement('section');
  root.className = 'blanket-archery';
  root.dataset.loadingInteractive = '';
  root.setAttribute('aria-labelledby', 'blanket-archery-title');
  root.innerHTML = `
    <header class="blanket-archery__header">
      <h2 id="blanket-archery-title">Carys’ Schießübung</h2>
      <div class="blanket-archery__actions">
        <button type="button" data-archery-action="sound" aria-pressed="false">Ton aus</button>
        <button type="button" data-archery-action="pause" aria-pressed="false">Pause</button>
        <button type="button" data-archery-action="close">Beenden</button>
      </div>
    </header>
    <div class="blanket-archery__hud">
      <div class="blanket-archery__stat"><strong data-archery-hits>0 / ${RANGE.hits}</strong> Treffer</div>
      <div class="blanket-archery__stat"><strong data-archery-arrows>${RANGE.arrows} / ${RANGE.arrows}</strong> Pfeile</div>
      <label class="blanket-archery__power">
        Zugkraft <progress value="0" max="100"></progress>
      </label>
    </div>
    <div class="blanket-archery__field" data-archery-field tabindex="0" role="group"
      aria-label="Schießübung mit Einion und seiner Schmusedecke" aria-describedby="blanket-archery-controls">
      <canvas aria-hidden="true"></canvas>
      <p class="blanket-archery__speech" data-archery-speech aria-live="off" hidden><q></q></p>
      <p class="blanket-archery__speech blanket-archery__admonition" data-archery-admonition hidden>
        <q>${wynonnaLine}</q>
      </p>
      <p class="blanket-archery__result" data-archery-result hidden></p>
    </div>
    <div class="blanket-archery__instructions" id="blanket-archery-controls">
      <p class="blanket-archery__mouse-help">Zielen mit der Maus. Zum Spannen halten, zum Schießen loslassen.</p>
      <p class="blanket-archery__key-help">Pfeiltasten zum Zielen, Leertaste zum Spannen und Loslassen. Esc pausiert.</p>
      <p class="blanket-archery__touch-help">Finger halten und zum Zielen ziehen. Loslassen schießt.</p>
      <p class="blanket-archery__feedback" data-archery-feedback role="status" aria-atomic="true"></p>
      <button type="button" data-archery-action="retry" hidden>Noch einmal spielen</button>
    </div>`;
  const field = root.querySelector('[data-archery-field]');
  crying.className = 'blanket-archery__crying';
  crying.alt = 'Einion weint um Lord Schmusedecke.';
  crying.style.bottom = ((RANGE.height - EINION_GROUND) * 100 / RANGE.height) + '%';
  crying.hidden = true;
  wynonna.className = 'blanket-archery__wynonna';
  wynonna.alt = 'Wynonna Fiachrach schimpft.';
  wynonna.hidden = true;
  field.append(crying, wynonna);
  const meter = root.querySelector('progress');
  const hits = root.querySelector('[data-archery-hits]');
  const arrows = root.querySelector('[data-archery-arrows]');
  const result = root.querySelector('[data-archery-result]');
  const speech = root.querySelector('[data-archery-speech]');
  const speechLine = speech.querySelector('q');
  const admonition = root.querySelector('[data-archery-admonition]');
  const live = root.querySelector('[data-archery-feedback]');
  const pause = root.querySelector('[data-archery-action="pause"]');
  const sound = root.querySelector('[data-archery-action="sound"]');
  const retry = root.querySelector('[data-archery-action="retry"]');
  let previousImpact;
  let previousPhase;
  let previousPause;

  function render(state, { paused, muted }) {
    const plea = paused ? '' : einionPleaFor(state);
    speech.hidden = !plea;
    if (plea) {
      const einion = einionPoseAt(state.time);
      speech.style.setProperty('--einion-caption-x', (einion.x * 100 / RANGE.width) + '%');
      setText(speechLine, plea);
    }
    setText(hits, state.hits + ' / ' + RANGE.hits);
    setText(arrows, state.arrows + ' / ' + RANGE.arrows);
    const power = Math.round(drawPower(state) * 100);
    if (meter.value !== power) meter.value = power;
    meter.toggleAttribute('data-high-tension', power > 75);
    if (muted !== (sound.getAttribute('aria-pressed') === 'true')) {
      setText(sound, muted ? 'Ton an' : 'Ton aus');
      sound.setAttribute('aria-pressed', String(muted));
    }
    if (state.phase === previousPhase && paused === previousPause && state.lastImpact === previousImpact) return;
    const finished = state.phase !== 'playing';
    const outcome = verdicts[state.outcome];
    crying.hidden = state.phase !== 'won';
    if (!crying.hidden) crying.style.left = (einionPoseAt(state.time, state.outcome).x * 100 / RANGE.width) + '%';
    wynonna.hidden = state.phase !== 'lost';
    admonition.hidden = wynonna.hidden;
    const message = paused ? 'Pausiert' : outcome;
    result.hidden = !message;
    setText(result, message || '');
    const announcedVerdict = state.phase === 'lost' ? outcome + ' Wynonna ruft „' + wynonnaLine + '“' : outcome;
    setText(live, announcedVerdict || (state.lastImpact && feedback[state.lastImpact.place]) || '');
    setText(pause, paused ? 'Weiter' : 'Pause');
    pause.setAttribute('aria-pressed', String(paused));
    pause.disabled = finished;
    retry.hidden = !finished;
    root.dataset.phase = state.phase;
    root.dataset.paused = String(paused);
    root.dataset.impact = state.lastImpact?.place ?? '';
    previousImpact = state.lastImpact;
    previousPhase = state.phase;
    previousPause = paused;
  }

  return { root, field, canvas: field.querySelector('canvas'), render, focus: () => field.focus({ preventScroll: true }) };
}
