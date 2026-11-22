import { TRACK } from './chase-state.js?v=20261120-rosenflucht-v11';
import { loadGameImages } from '../games/loading-game-assets.js?v=20261122-carys-archery-v1';

const CELL = 192;
const artFiles = {
  garden: 'rosenflucht-gartenbezirk-v10.webp',
  hedge: 'rosenflucht-rosenhecke-v10.webp',
  idwal: 'rosenflucht-idwal-posen-v11.webp',
  trevor: 'rosenflucht-trevor-posen-v11.webp',
  pyderi: 'rosenflucht-pyderi-posen-v11.webp'
};

export function loadChaseArt(environment, assetUrl, signal) {
  return loadGameImages(environment, assetUrl, artFiles, signal);
}

function drawGarden(context, garden, distance) {
  const tileWidth = garden.width * TRACK.height / garden.height;
  const offset = (distance * .61) % (2 * tileWidth);
  // Reflect alternating tiles to keep the garden path and the topiary continuous.
  for (let tile = 0; tile < 4; tile += 1) {
    const x = tile * tileWidth - offset;
    if (x + tileWidth <= 0 || x >= TRACK.width) continue;
    const reflected = tile % 2 === 1;
    context.save();
    context.translate(x + (reflected ? tileWidth : 0), 0);
    if (reflected) context.scale(-1, 1);
    context.drawImage(garden, 0, 0, tileWidth + .5, TRACK.height);
    context.restore();
  }
}

function drawShadow(context, x, width, height = 0) {
  context.fillStyle = `rgba(68, 44, 31, ${.3 - Math.min(.21, height * .0013)})`;
  context.beginPath();
  context.ellipse(x, TRACK.ground + 4, width / 2, 5.7, 0, 0, Math.PI * 2);
  context.fill();
}

function drawPose(context, sheet, { column, row, tilt = 0 }, x, y, size) {
  context.save();
  context.translate(x, y);
  if (tilt) context.rotate(tilt);
  context.drawImage(sheet, column * CELL, row * CELL, CELL, CELL,
    -size / 2, -size * (CELL - 4) / CELL, size, size);
  context.restore();
}

function runnerPose(state) {
  if (state.phase === 'pecking' || state.phase === 'caught') {
    return { row: 1, column: 3, tilt: Math.sin(state.phaseTime * 32) * .04 };
  }
  if (state.tumble > 0) {
    const progress = 1 - state.tumble / TRACK.tumbleTime;
    return progress < .72
      ? { row: 1, column: 2, tilt: .14 + Math.sin(progress / .72 * Math.PI) * .35 }
      : { row: 1, column: 3 };
  }
  if (state.height > 0) return { row: 1, column: Math.abs(state.verticalSpeed) < 300 ? 1 : 0 };
  if (state.crouching) return { row: 1, column: 3 };
  return { row: 0, column: state.phase === 'running' ? Math.floor(state.runningTime * 14) % 4 : 1 };
}

function drawPyderi(context, sheet, state, trevor) {
  const trailingX = Math.max(42, trevor - state.gap);
  const attacking = state.phase === 'pecking' || state.phase === 'caught';
  let x = trailingX;
  let lift = 0;
  let column = state.phase === 'running' ? Math.floor(state.runningTime * 15) % 4 : 0;
  if (attacking) {
    const beat = state.phase === 'caught' ? 2 : Math.min(2, Math.floor(state.phaseTime / .5));
    const time = state.phase === 'caught' ? .34 : state.phaseTime - beat * .5;
    const aim = (beat === 1 ? state.x : trevor) - 63;
    const from = beat === 0 ? trailingX : (beat === 1 ? trevor : state.x) - 63;
    x = from + (aim - from) * Math.min(1, time / .21);
    column = Math.min(3, Math.floor(time / .125));
    lift = Math.sin(Math.PI * time / .53) * 64;
  }
  drawShadow(context, x, 108, lift);
  drawPose(context, sheet, { row: attacking ? 1 : 0, column }, x, TRACK.ground - lift, 164);
  return state.phase === 'pecking' && column === 2 ? { x: x + 67, y: TRACK.ground - lift - 9 } : null;
}

function drawPeck(context, contact) {
  context.save();
  context.translate(contact.x, contact.y);
  context.lineWidth = 3;
  context.strokeStyle = '#ffe39a';
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(5, -5);
  context.lineTo(13, -17);
  context.moveTo(11, 1);
  context.lineTo(22, -3);
  context.moveTo(8, 8);
  context.lineTo(19, 13);
  context.stroke();
  context.restore();
}

function drawHedges(context, hedgeArt, state) {
  for (const hedge of state.hedges) {
    const x = hedge.position - state.distance;
    if (x < -TRACK.hedgeWidth || x > TRACK.width + TRACK.hedgeWidth) continue;
    if (hedge.hit && state.tumble > 0) {
      const age = 1 - state.tumble / TRACK.tumbleTime;
      for (let index = 0; index < 8; index += 1) {
        context.fillStyle = index % 2 ? '#9d3b47' : '#547238';
        context.beginPath();
        context.ellipse(x + (index - 3.5) * (6 + age * 12),
          TRACK.ground - 24 - Math.sin(age * Math.PI) * (16 + index * 6), 5, 2.5, index + age, 0, Math.PI * 2);
        context.fill();
      }
    }
    const height = hedge.hit ? TRACK.hedgeHeight * .57 : TRACK.hedgeHeight;
    context.drawImage(hedgeArt, x - TRACK.hedgeWidth / 2, TRACK.ground - height,
      TRACK.hedgeWidth, height);
  }
}

export function createChaseStage(canvas, art) {
  canvas.width = TRACK.width;
  canvas.height = TRACK.height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Canvas is unavailable');

  return state => {
    const trevor = state.x - TRACK.followerOffset;
    const pose = runnerPose(state);
    const bob = pose.row === 0 && state.phase === 'running' && pose.column === 3 ? 4 : 0;
    const y = TRACK.ground - state.height - bob;
    drawGarden(context, art.garden, state.distance);
    drawHedges(context, art.hedge, state);
    const peck = drawPyderi(context, art.pyderi, state, trevor);
    drawShadow(context, trevor, 64, state.height);
    drawShadow(context, state.x, 68, state.height);
    drawPose(context, art.trevor, pose, trevor, y, 132);
    drawPose(context, art.idwal, pose, state.x, y, 137);
    if (peck) drawPeck(context, peck);
  };
}
