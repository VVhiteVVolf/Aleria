import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  advanceArchery, aimPoint, beginDraw, cancelDraw, createArcheryRound, drawPower,
  einionPoseAt, hitsBlanket, projectilePoint, RANGE, releaseArrow, setAim
} from '../modules/loading-screen/blanket-archery/archery-range.js';
import { createCombatMusic } from '../modules/loading-screen/games/loading-combat-music.js';
import { einionPleaFor } from '../modules/loading-screen/blanket-archery/archery-pleas.js';

const clearLane = () => false;
const goal = { x: 641, y: 162 };

function shoot(state, target = goal, hold = .82) {
  setAim(state, target.x, target.y);
  assert.equal(beginDraw(state), true);
  advanceArchery(state, hold, clearLane);
  assert.equal(releaseArrow(state), true);
  return state.flight;
}

test('holding longer makes the sight less steady and canceling keeps all arrows', () => {
  function deviation(hold) {
    const state = createArcheryRound();
    advanceArchery(state, 1.83 - hold, clearLane);
    beginDraw(state);
    advanceArchery(state, hold, clearLane);
    const aim = aimPoint(state);
    const distance = Math.hypot(aim.x - state.aim.x, aim.y - state.aim.y);
    cancelDraw(state);
    assert.equal(drawPower(state), 0);
    assert.equal(state.arrows, RANGE.arrows);
    assert.equal(releaseArrow(state), false);
    return distance;
  }
  assert(deviation(.19) < deviation(.55));
  assert(deviation(.55) < deviation(1.04));
  assert(Math.abs(deviation(1.04) - deviation(1.5)) < .0001);
});

test('a taut shot reaches the visible reticle quickly and stays at that point', () => {
  const state = createArcheryRound();
  setAim(state, goal.x, goal.y);
  beginDraw(state);
  advanceArchery(state, .94, clearLane);
  const atRelease = aimPoint(state);
  releaseArrow(state);
  assert.deepEqual(projectilePoint(state.flight, 1), atRelease);
  assert(state.flight.duration < .19);
  assert.equal(beginDraw(state), false);
  advanceArchery(state, .33, clearLane);
  assert.equal(state.hits, 1);
  assert.deepEqual(state.impacts[0].point, atRelease);
});

test('a weak release reaches the floor and a medium shot curves more than a full one', () => {
  const weak = createArcheryRound();
  const soft = shoot(weak, goal, .06);
  const middle = shoot(createArcheryRound(), goal, .52);
  const strong = shoot(createArcheryRound(), goal, 1.05);
  assert(soft.lift > middle.lift && middle.lift > strong.lift);
  assert(soft.to.y >= RANGE.wallBase);
  assert(middle.to.y > strong.to.y);
  assert.equal(advanceArchery(weak, .45, clearLane), 'ground');
  assert.equal(weak.hits, 0);
  assert.equal(weak.arrows, 4);
});

test('Einion is tested at the depth crossing before a blanket hit, even across a long frame', () => {
  const state = createArcheryRound();
  const shot = shoot(state);
  const fraction = RANGE.einionDepth / shot.depth;
  const crossing = shot.startedAt + shot.duration * fraction;
  let tests = 0;
  const impact = advanceArchery(state, .6, (actor, point) => {
    tests += 1;
    assert.deepEqual(actor, einionPoseAt(crossing));
    assert.deepEqual(point, projectilePoint(shot, fraction));
    return true;
  });
  assert.equal(tests, 1);
  assert.equal(impact, 'einion');
  assert.equal(state.phase, 'lost');
  assert.equal(state.hits, 0);
  assert.deepEqual(state.impacts, []);
});

test('the higher blocking hop reaches the upper shooting lane and settles for the round ending', () => {
  const standing = einionPoseAt(0);
  const peak = (Math.PI / 2 + .1) / 3.05;
  const hopping = einionPoseAt(peak);
  assert(hopping.y < standing.y - 70);
  assert.equal(hopping.frame, 3);
  assert.equal(einionPoseAt(peak, 'blanket').y, standing.y);
});

test('three hits win within five arrows, whereas five misses exhaust the round', () => {
  const win = createArcheryRound();
  for (let hit = 0; hit < RANGE.hits; hit += 1) {
    shoot(win);
    assert.equal(advanceArchery(win, .3, clearLane), 'blanket');
  }
  assert.equal(win.phase, 'won');
  assert.equal(win.arrows, 2);
  assert.equal(win.impacts.length, 3);
  assert.equal(beginDraw(win), false);

  const exhausted = createArcheryRound();
  for (let attempt = 0; attempt < RANGE.arrows; attempt += 1) {
    shoot(exhausted, { x: 857, y: 137 });
    assert.equal(advanceArchery(exhausted, .3, clearLane), 'wall');
  }
  assert.equal(exhausted.phase, 'lost');
  assert.equal(exhausted.outcome, 'empty');
  assert.equal(exhausted.arrows, 0);
  assert.equal(beginDraw(exhausted), false);
  assert.equal(hitsBlanket({ x: 700, y: 150 }), false);
  assert.equal(hitsBlanket({ x: 681, y: 150 }), true);
});

test('Einion pleads in the running game and reacts to a hit on the blanket', () => {
  const state = createArcheryRound();
  assert.match(einionPleaFor(state), /Verschon/);
  advanceArchery(state, 4.5, clearLane);
  assert.match(einionPleaFor(state), /Töte Lord Schmusedecke nicht/);
  shoot(state);
  advanceArchery(state, .3, clearLane);
  assert.match(einionPleaFor(state), /Keinen Pfeil mehr/);
  state.phase = 'won';
  assert.equal(einionPleaFor(state), '');
});

test('the battle arrangement loops and only schedules while the game audio is active', () => {
  const tones = [];
  let enabled = false;
  let time = 0;
  const music = createCombatMusic({ isPlaying: () => enabled, time: () => time, tone: (...args) => tones.push(args) });
  music.tick();
  assert.deepEqual(tones, []);
  enabled = true;
  const score = [];
  for (let step = 0; step < 65; step += 1) {
    time = step * 60 / 124 / 2;
    tones.length = 0;
    music.tick();
    score.push(tones.map(([frequency, , , , type]) => [frequency, type]));
  }
  assert(score.every(beat => beat.length >= 2));
  assert.deepEqual(score[0], score[64]);
  assert.notDeepEqual(score[0], score[1]);
  music.reset();
  tones.length = 0;
  music.tick();
  assert.deepEqual(tones.map(([frequency, , , , type]) => [frequency, type]), score[0]);
});

test('the shooting range has three preview renditions and six registered poses per character', () => {
  const path = '../public/assets/loading-screen/carys-schiessuebung-v2-manifest.json';
  const assets = JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
  assert.equal(assets.teaser.assets.length, 3);
  for (const actor of [assets.carys, assets.einion]) {
    assert.equal(actor.poses.length, actor.columns * actor.rows);
    assert.deepEqual(actor.asset.size, [actor.columns * actor.cell, actor.rows * actor.cell]);
  }
  for (const { file, bytes, sha256 } of [
    assets.teaser.source, ...assets.teaser.assets, assets.room.source, assets.room.asset,
    assets.carys.source, assets.carys.asset, assets.einion.source, assets.einion.asset,
    ...Object.values(assets.arrows).flatMap(({ source, asset }) => [source, asset]),
    ...Object.values(assets.reactions).flatMap(({ source, asset }) => [source, asset])
  ]) {
    const data = readFileSync(new URL('../' + file, import.meta.url));
    assert.equal(data.length, bytes);
    assert.equal(createHash('sha256').update(data).digest('hex'), sha256);
  }
});
