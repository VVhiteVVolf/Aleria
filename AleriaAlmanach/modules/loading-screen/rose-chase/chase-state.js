export const TRACK = Object.freeze({
  width: 900, height: 416, ground: 355, finish: 6250,
  followerOffset: 102, hedgeWidth: 48, hedgeHeight: 44, maxBottles: 3,
  openingTime: 1.85, tumbleTime: .64, peckTime: 1.55
});

const HEDGES = [980, 1590, 2160, 2710, 3340, 3850, 4430, 4960, 5530, 6020];
const SPEED = 228;
const CATCH_GAP = 62;
const clamp = (number, low, high) => Math.min(high, Math.max(low, number));

export function createChaseState() {
  return {
    phase: 'opening', phaseTime: 0, runningTime: 0, distance: 0, x: 377,
    height: 0, verticalSpeed: 0, crouching: false, gap: 216,
    bottles: TRACK.maxBottles, tumble: 0,
    hedges: HEDGES.map(position => ({ position, hit: false }))
  };
}

function setPhase(state, phase) {
  state.phase = phase;
  state.phaseTime = 0;
}

function updateJump(state, input, elapsed, events) {
  if (input.jump && state.height === 0 && !input.down) {
    state.verticalSpeed = 425;
    events.push('jump');
  }
  if (input.down && state.height > 0) state.verticalSpeed = Math.min(-220, state.verticalSpeed);
  if (state.height > 0 || state.verticalSpeed > 0) {
    state.verticalSpeed -= 560 * elapsed;
    state.height = Math.max(0, state.height + state.verticalSpeed * elapsed);
    if (state.height === 0) state.verticalSpeed = 0;
  }
  state.crouching = input.down && state.height === 0;
}

function collideWithHedge(state, events) {
  if (state.height >= TRACK.hedgeHeight - 6) return;
  const trevor = state.x - TRACK.followerOffset;
  const contact = TRACK.hedgeWidth / 2 + 8;
  const hedge = state.hedges.find(({ position, hit }) => {
    const x = position - state.distance;
    return !hit && (Math.abs(state.x - x) < contact || Math.abs(trevor - x) < contact);
  });
  if (!hedge) return;

  hedge.hit = true;
  state.bottles -= 1;
  state.gap -= 33;
  state.height = 0;
  state.verticalSpeed = 0;
  state.crouching = false;
  state.tumble = TRACK.tumbleTime;
  events.push('break');
}

export function advanceChase(state, input, elapsed) {
  const events = [];
  state.phaseTime += elapsed;
  if (state.phase === 'opening') {
    if (state.phaseTime >= TRACK.openingTime) setPhase(state, 'running');
    return events;
  }
  if (state.phase === 'pecking') {
    if (state.phaseTime >= TRACK.peckTime) setPhase(state, 'caught');
    return events;
  }
  if (state.phase !== 'running') return events;

  state.runningTime += elapsed;
  const tumbling = state.tumble > 0;
  const oldX = state.x;
  if (tumbling) {
    state.tumble = Math.max(0, state.tumble - elapsed);
  } else {
    const direction = Number(!!input.forward) - Number(!!input.back);
    state.x = clamp(state.x + direction * 155 * elapsed, 213, 633);
    updateJump(state, input, elapsed, events);
  }
  state.distance += SPEED * (tumbling ? .71 : 1) * elapsed;
  const pursuit = input.back && !input.forward ? 27 : state.crouching ? 14 : .35;
  state.gap = clamp(state.gap + (state.x - oldX) * .46 - pursuit * elapsed, 36, 250);
  if (!tumbling) collideWithHedge(state, events);
  if (state.tumble === 0 && (state.gap <= CATCH_GAP || state.bottles === 0)) {
    setPhase(state, 'pecking');
    events.push('peck');
  } else if (state.tumble === 0 && state.distance >= TRACK.finish) {
    setPhase(state, 'escaped');
    events.push('escape');
  }
  return events;
}
