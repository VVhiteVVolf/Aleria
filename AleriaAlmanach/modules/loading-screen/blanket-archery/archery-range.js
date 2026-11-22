export const RANGE = Object.freeze({
  width: 960,
  height: 540,
  arrows: 5,
  hits: 3,
  wallBase: 379,
  einionDepth: .73
});

export const CARYS = Object.freeze({ x: 204, y: 542, size: 334 });
export const EINION_GROUND = 413;
export const DEFAULT_AIM = Object.freeze({ x: 587, y: 218 });
const fullDrawTime = 1.04;
const straightPower = .64;
const floorPower = .37;
const einionJumpHeight = 78;

// Coordinates follow the cream trim in the stage painting.
const blanket = [
  [483, 133], [493, 128], [548, 137], [585, 142], [625, 140], [671, 132],
  [685, 126], [691, 137], [694, 226], [695, 278], [688, 286], [678, 289],
  [488, 289], [481, 284], [478, 274], [481, 203]
];

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const interpolate = (from, to, ratio) => from + (to - from) * ratio;

export function hitsBlanket({ x, y }) {
  let inside = false;
  for (let i = 0, j = blanket.length - 1; i < blanket.length; j = i++) {
    const [ax, ay] = blanket[i];
    const [bx, by] = blanket[j];
    if ((ay > y) !== (by > y) && x < ax + (bx - ax) * (y - ay) / (by - ay)) inside = !inside;
  }
  return inside;
}

export function einionPoseAt(time, outcome) {
  const sway = time * 2.05 - .95;
  const x = 515 + 106 * Math.sin(sway);
  const lift = outcome ? 0 : einionJumpHeight * Math.max(0, Math.sin(time * 3.05 - .1)) ** 6;
  const runningFrame = Math.abs(Math.cos(sway)) < .20 ? 0 : 1 + Math.floor(time * 9) % 2;
  const frame = outcome === 'einion' ? 4 : outcome ? 5 : lift > 10 ? 3 : runningFrame;
  return { x, y: EINION_GROUND + 11 - lift, size: 183, frame, flip: !outcome && Math.cos(sway) < 0 };
}

export function createArcheryRound() {
  return {
    time: 0,
    aim: { ...DEFAULT_AIM },
    chargeStarted: null,
    flight: null,
    releasedAt: -1,
    arrows: RANGE.arrows,
    hits: 0,
    impacts: [],
    lastImpact: null,
    phase: 'playing',
    outcome: null
  };
}

export function drawPower(state) {
  return state.chargeStarted === null ? 0 : clamp((state.time - state.chargeStarted) / fullDrawTime, 0, 1);
}

export function setAim(state, x, y) {
  state.aim.x = clamp(x, 9, RANGE.width - 9);
  state.aim.y = clamp(y, 9, RANGE.height - 9);
}

export function aimPoint(state) {
  const t = state.time;
  const strain = drawPower(state) ** 1.65;
  return {
    x: clamp(state.aim.x + strain * (19 * Math.sin(18 * t) + 8 * Math.sin(31 * t)), 9, RANGE.width - 9),
    y: clamp(state.aim.y + strain * (14 * Math.cos(16 * t) + 5 * Math.sin(27 * t)), 9, RANGE.height - 9)
  };
}

export function beginDraw(state) {
  if (state.phase !== 'playing' || state.chargeStarted !== null || state.flight || state.arrows === 0) return false;
  state.chargeStarted = state.time;
  return true;
}

export function cancelDraw(state) {
  state.chargeStarted = null;
}

export function bowOrigin(power) {
  if (power < .19) return { x: 278, y: 370 };
  if (power < .46) return { x: 298, y: 320 };
  return { x: 307, y: 317 };
}

export function projectilePoint(shot, fraction) {
  const t = clamp(fraction, 0, 1);
  return {
    x: interpolate(shot.from.x, shot.to.x, t),
    y: interpolate(shot.from.y, shot.to.y, t) - 4 * shot.lift * t * (1 - t)
  };
}

export function releaseArrow(state) {
  if (state.chargeStarted === null || state.phase !== 'playing') return false;
  const power = drawPower(state);
  const aim = aimPoint(state);
  const from = bowOrigin(power);
  const shortShot = power < floorPower;
  const depthLimit = shortShot ? interpolate(.30, .66, power / floorPower) : 1;
  const drop = 87 * (1 - clamp((power - floorPower) / (straightPower - floorPower), 0, 1)) ** 2;
  const to = shortShot ? {
    x: interpolate(from.x, aim.x, depthLimit),
    y: clamp(interpolate(512, 444, depthLimit) + (aim.y - 230) * .11, RANGE.wallBase + 5, 528)
  } : { x: aim.x, y: clamp(aim.y + drop, 9, 530) };
  const floorDepth = to.y >= RANGE.wallBase
    ? interpolate(1, .17, (to.y - RANGE.wallBase) / (RANGE.height - RANGE.wallBase)) : 1;
  const shot = {
    startedAt: state.time,
    duration: .155 + .175 * (1 - power),
    from,
    to,
    depth: Math.min(depthLimit, floorDepth),
    lift: 8 + 20 * (1 - power),
    checkedEinion: false
  };
  state.arrows -= 1;
  state.releasedAt = state.time;
  state.flight = shot;
  cancelDraw(state);
  return true;
}

function finishFlight(state, place, point, at, shot) {
  const previous = projectilePoint(shot, .92);
  const angle = place === 'ground' ? -.10 : Math.atan2(point.y - previous.y, point.x - previous.x);
  const impact = { place, point, angle, at };
  state.flight = null;
  state.lastImpact = impact;
  if (place !== 'einion') state.impacts.push(impact);
  if (place === 'blanket') state.hits += 1;
  if (place === 'einion' || state.hits === RANGE.hits || state.arrows === 0) {
    state.phase = state.hits === RANGE.hits ? 'won' : 'lost';
    state.outcome = place === 'einion' ? 'einion' : state.phase === 'won' ? 'blanket' : 'empty';
    state.time = at;
  }
  return place;
}

export function advanceArchery(state, seconds, hitsEinion) {
  if (state.phase !== 'playing') return null;
  state.time += seconds;
  const shot = state.flight;
  if (!shot) return null;
  const crossing = RANGE.einionDepth / shot.depth;
  const crossingTime = shot.startedAt + shot.duration * crossing;
  if (!shot.checkedEinion && crossing <= 1 && state.time >= crossingTime) {
    shot.checkedEinion = true;
    const point = projectilePoint(shot, crossing);
    if (hitsEinion(einionPoseAt(crossingTime), point)) {
      return finishFlight(state, 'einion', point, crossingTime, shot);
    }
  }
  const landing = shot.startedAt + shot.duration;
  if (state.time < landing) return null;
  const place = shot.to.y >= RANGE.wallBase ? 'ground' : hitsBlanket(shot.to) ? 'blanket' : 'wall';
  return finishFlight(state, place, shot.to, landing, shot);
}
