import { TRACK } from './chase-state.js?v=20261120-rosenflucht-v11';
import { createChaseStage } from './chase-stage.js?v=20261120-rosenflucht-v11';

const openingLine = { speaker: 'Gwendolyn', text: 'WER WAR DAS?! Meine Rosenhecke!', fromGarden: true };
const lines = [
  { at: .4, speaker: 'Idwal', text: 'Scheiße, weg hier!' },
  { at: 3.3, speaker: 'Der Gärtner', text: 'Ihr Schweine! Ihr habt die Rosenhecke zerstört!', fromGarden: true },
  { at: 6.6, speaker: 'Trevor', text: 'Wir schieben es einfach auf Einion!' },
  { at: 10.7, speaker: 'Idwal', text: 'Wieso musstest du die Rosen falschrum reinstecken?' },
  { at: 16.2, speaker: 'Trevor', text: 'Wo ist eigentlich Talon?!' }
];

function speechFor(state) {
  if (state.phase === 'opening') return openingLine;
  if (state.phase !== 'running') return null;
  return lines.find(line => state.runningTime >= line.at && state.runningTime < line.at + 2.9);
}

const statusText = {
  pecking: 'Pyderi hat euch erwischt!',
  caught: 'Game over. Pyderi hat euch erwischt!',
  escaped: 'Entkommen! Der Gartenbezirk liegt hinter euch.'
};

export function createChaseView(document, art) {
  const root = document.createElement('section');
  root.className = 'rose-chase';
  root.dataset.loadingInteractive = '';
  root.setAttribute('aria-labelledby', 'rose-chase-title');
  root.innerHTML = `
    <header class="rose-chase__header">
      <div class="rose-chase__title">
        <h2 id="rose-chase-title">Rosenflucht</h2>
        <div class="rose-chase__bottles" data-chase-bottles role="img">
          ${Array.from({ length: TRACK.maxBottles }, () =>
            '<span class="rose-chase__bottle" aria-hidden="true"><i></i><i></i><i></i></span>').join('')}
        </div>
      </div>
      <div class="rose-chase__actions">
        <button type="button" data-chase-action="sound" aria-pressed="false">Ton aus</button>
        <button type="button" data-chase-action="pause">Pause</button>
        <button type="button" data-chase-action="close">Beenden</button>
      </div>
    </header>
    <progress class="rose-chase__distance" max="${TRACK.finish}" value="0" aria-label="Weg durch den Gartenbezirk"></progress>
    <div class="rose-chase__field" data-chase-field tabindex="0" role="group"
      aria-label="Spielszene Rosenflucht" aria-describedby="rose-chase-controls">
      <canvas aria-hidden="true"></canvas>
      <div class="rose-chase__speech" data-chase-speech hidden><b></b><q></q></div>
      <p class="rose-chase__result" data-chase-result role="status" hidden></p>
    </div>
    <div class="rose-chase__instructions" id="rose-chase-controls">
      <p class="rose-chase__keyboard">Ziffernblock oder Pfeiltasten. 4 / ← zurück, 6 / → vor, 8 / ↑ springen, 2 / ↓ ducken. Esc pausiert.</p>
      <p class="rose-chase__touch-help">Tippe ↑ zum Springen. Halte ← oder → zum Steuern und ↓ zum Ducken.</p>
      <div class="rose-chase__touch" role="group" aria-label="Touch-Steuerung">
        <button type="button" data-chase-input="back" aria-label="Zurück">←</button>
        <button type="button" data-chase-input="forward" aria-label="Vor">→</button>
        <button type="button" data-chase-input="jump" aria-label="Springen">↑</button>
        <button type="button" data-chase-input="down" aria-label="Ducken">↓</button>
      </div>
      <button type="button" class="rose-chase__retry" data-chase-action="retry" hidden>Noch einmal spielen</button>
    </div>`;

  const field = root.querySelector('[data-chase-field]');
  const draw = createChaseStage(field.querySelector('canvas'), art);
  const bottles = root.querySelector('[data-chase-bottles]');
  const speech = field.querySelector('[data-chase-speech]');
  const speaker = speech.querySelector('b');
  const lineText = speech.querySelector('q');
  const result = field.querySelector('[data-chase-result]');
  const pause = root.querySelector('[data-chase-action="pause"]');
  const retry = root.querySelector('[data-chase-action="retry"]');
  const sound = root.querySelector('[data-chase-action="sound"]');
  const progress = root.querySelector('progress');
  let lastLine;
  let lastBottles;

  function updateSpeech(state, paused) {
    const line = paused ? null : speechFor(state);
    if (line !== lastLine) {
      speech.hidden = !line;
      if (line) {
        speaker.textContent = line.speaker;
        lineText.textContent = line.text;
        speech.toggleAttribute('data-from-garden', !!line.fromGarden);
      }
      lastLine = line;
    }
    if (line && !line.fromGarden) {
      const x = state.x - (line.speaker === 'Trevor' ? TRACK.followerOffset : 0);
      speech.style.setProperty('--speech-x', `${x * 100 / TRACK.width}%`);
    }
  }

  function render(state, { paused, muted, finished }) {
    draw(state);
    progress.value = state.distance;
    if (state.bottles !== lastBottles) {
      Array.from(bottles.children).forEach((bottle, index) => {
        bottle.toggleAttribute('data-broken', index >= state.bottles);
      });
      bottles.setAttribute('aria-label', `${state.bottles} von ${TRACK.maxBottles} Whiskyflaschen übrig`);
      lastBottles = state.bottles;
    }
    if (paused || root.dataset.phase !== state.phase || root.dataset.paused === 'true') {
      const message = paused ? 'Pausiert' : statusText[state.phase] ?? '';
      if (result.textContent !== message) result.textContent = message;
      result.hidden = !message;
      pause.textContent = paused ? 'Weiter' : 'Pause';
      pause.setAttribute('aria-pressed', String(paused));
      retry.hidden = !finished;
      pause.disabled = finished;
      root.dataset.phase = state.phase;
      root.dataset.paused = String(paused);
    }
    if (sound.getAttribute('aria-pressed') !== String(muted)) {
      sound.setAttribute('aria-pressed', String(muted));
      sound.textContent = muted ? 'Ton an' : 'Ton aus';
    }
    updateSpeech(state, paused);
  }

  return { root, render, focus: () => field.focus({ preventScroll: true }) };
}
