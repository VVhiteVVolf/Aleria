import { loadGameImages } from '../games/loading-game-assets.js?v=20261122-carys-archery-v1';
import { RANGE, CARYS, EINION_GROUND, aimPoint, drawPower, einionPoseAt, projectilePoint } from './archery-range.js?v=20261122-carys-archery-v1';

const atlasCell = 240;
const atlasColumns = 3;
const files = {
  room: 'carys-schiesshalle-v2.webp',
  carys: 'carys-bogen-posen-v1.webp',
  einion: 'einion-block-posen-v1.webp',
  arrow: 'carys-pfeil-seite-v1.webp',
  arrowRear: 'carys-pfeil-einschlag-v1.webp',
  crying: 'einion-weinen-v1.webp',
  wynonna: 'wynonna-schimpfen-v1.webp'
};
const quiverMouths = [[224, 181], [205, 181], [202, 181], [202, 184], [205, 184], [206, 183]];

export function loadArcheryArt(environment, assetUrl, signal) {
  return loadGameImages(environment, assetUrl, files, signal);
}

function spriteRect({ x, y, size }) {
  return { left: x - size / 2, top: y - size, size };
}

function atlasOrigin(frame) {
  return [(frame % atlasColumns) * atlasCell, Math.floor(frame / atlasColumns) * atlasCell];
}

function createEinionCollision(document, atlas) {
  const mask = document.createElement('canvas');
  mask.width = atlas.width;
  mask.height = atlas.height;
  const context = mask.getContext('2d', { willReadFrequently: true });
  context.drawImage(atlas, 0, 0);
  const { data } = context.getImageData(0, 0, mask.width, mask.height);
  const stride = mask.width;
  return (actor, point) => {
    const { left, top, size } = spriteRect(actor);
    const localX = Math.floor((point.x - left) * atlasCell / size);
    const localY = Math.floor((point.y - top) * atlasCell / size);
    if (localX < 0 || localX >= atlasCell || localY < 0 || localY >= atlasCell) return false;
    const [x, y] = atlasOrigin(actor.frame);
    const sampleX = x + (actor.flip ? atlasCell - 1 - localX : localX);
    return data[((y + localY) * stride + sampleX) * 4 + 3] >= 135;
  };
}

function drawSprite(context, atlas, actor) {
  const { left, top, size } = spriteRect(actor);
  const [sourceX, sourceY] = atlasOrigin(actor.frame);
  context.save();
  context.translate(actor.flip ? left + size : left, top);
  if (actor.flip) context.scale(-1, 1);
  context.drawImage(atlas, sourceX, sourceY, atlasCell, atlasCell, 0, 0, size, size);
  context.restore();
}

function drawShadow(context, x, y, width, opacity) {
  context.fillStyle = 'rgba(43, 23, 33, ' + opacity + ')';
  context.beginPath();
  context.ellipse(x, y, width, width * .13, 0, 0, Math.PI * 2);
  context.fill();
}

function drawArrow(context, image, point, angle, length, inQuiver = false) {
  const width = inQuiver ? Math.round(image.width * .42) : image.width;
  const height = image.height * length / width;
  context.save();
  context.translate(point.x, point.y);
  context.rotate(angle);
  context.drawImage(image, 0, 0, width, image.height, -length, -height / 2, length, height);
  context.restore();
}

function drawLodgedArrow(context, image, { x, y }) {
  const width = 23;
  const height = image.height * width / image.width;
  // The nock is over the point of impact. The shaft and tip recede into the wall.
  context.drawImage(image, x - width / 2, y - height * .65, width, height);
}

function drawCarys(context, sheet, arrow, state) {
  const drawing = state.chargeStarted !== null;
  const power = drawPower(state);
  const frame = state.phase === 'won' ? 5 : drawing
    ? power < .19 ? 1 : power < .46 ? 2 : 3
    : state.time - state.releasedAt < .20 ? 4 : 0;
  drawShadow(context, CARYS.x + 4, CARYS.y - 19, 59, .46);
  drawSprite(context, sheet, { ...CARYS, frame });
  const { left, top, size } = spriteRect(CARYS);
  const [mouthX, mouthY] = quiverMouths[frame];
  const remaining = state.arrows - Number(drawing);
  for (let i = 0; i < remaining; i += 1) {
    const offset = i - (remaining - 1) / 2;
    const x = left + mouthX * size / 512 + offset * 3.7;
    const y = top + mouthY * size / 512 + offset * 1.25;
    drawArrow(context, arrow, { x, y }, 1.19 + offset * .09, 41 - 2 * Math.abs(offset), true);
  }
}

function drawReticle(context, point, power) {
  context.save();
  context.translate(point.x, point.y);
  context.beginPath();
  context.arc(0, 0, 12, 0, Math.PI * 2);
  for (let i = 0; i < 4; i += 1) {
    context.moveTo(0, 8);
    context.lineTo(0, 19);
    context.rotate(Math.PI / 2);
  }
  context.lineWidth = 6;
  context.strokeStyle = '#271c23';
  context.stroke();
  context.lineWidth = 2.7;
  context.strokeStyle = power >= .78 ? '#ffa66f' : '#fff1c7';
  context.stroke();
  context.fillStyle = '#fff7dc';
  context.fillRect(-1.4, -1.4, 2.8, 2.8);
  context.restore();
}

function drawFlyingArrow(context, arrow, shot, fraction) {
  const tip = projectilePoint(shot, fraction);
  const tail = projectilePoint(shot, fraction - .20);
  const next = projectilePoint(shot, fraction + .045);
  context.beginPath();
  context.moveTo(tail.x, tail.y);
  context.lineTo(tip.x, tip.y);
  context.lineWidth = 2.4;
  context.strokeStyle = '#f3c98283';
  context.stroke();
  drawArrow(context, arrow, tip, Math.atan2(next.y - tail.y, next.x - tail.x), 55 - 27 * fraction);
}

function drawHitFeedback(context, state) {
  const impact = state.lastImpact;
  if (state.phase !== 'playing' || impact?.place !== 'blanket') return;
  const elapsed = state.time - impact.at;
  if (elapsed >= .31) return;
  context.save();
  context.globalAlpha = 1 - elapsed / .31;
  context.beginPath();
  context.arc(impact.point.x, impact.point.y, 8 + elapsed * 70, 0, Math.PI * 2);
  context.strokeStyle = '#ffdb8f';
  context.lineWidth = 3;
  context.stroke();
  context.restore();
}

export function createArcheryStage(canvas, art) {
  canvas.width = RANGE.width;
  canvas.height = RANGE.height;
  const context = canvas.getContext('2d', { alpha: false });
  const hitsEinion = createEinionCollision(canvas.ownerDocument, art.einion);

  function draw(state, showAim) {
    context.drawImage(art.room, 0, 0, RANGE.width, RANGE.height);
    for (const impact of state.impacts) {
      if (impact.place === 'ground') drawArrow(context, art.arrow, impact.point, impact.angle, 48);
      else drawLodgedArrow(context, art.arrowRear, impact.point);
    }
    drawHitFeedback(context, state);

    const einion = einionPoseAt(state.time, state.outcome);
    drawShadow(context, einion.x, EINION_GROUND, 36, .33);
    const shot = state.flight;
    const fraction = shot ? (state.time - shot.startedAt) / shot.duration : 0;
    const pastEinion = shot && fraction * shot.depth >= RANGE.einionDepth;
    if (pastEinion) drawFlyingArrow(context, art.arrow, shot, fraction);
    if (state.phase !== 'won') drawSprite(context, art.einion, einion);
    drawCarys(context, art.carys, art.arrow, state);
    if (shot && !pastEinion) drawFlyingArrow(context, art.arrow, shot, fraction);
    if (showAim) drawReticle(context, aimPoint(state), drawPower(state));
  }
  return { draw, hitsEinion };
}
