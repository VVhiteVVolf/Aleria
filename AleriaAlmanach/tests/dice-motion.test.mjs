import assert from 'node:assert/strict';
import test from 'node:test';
import { getDiceMotionConfig } from '../modules/scene-dice/dice-motion.js';

test('uses lively but bounded motion for the default throw', () => {
  const motion = getDiceMotionConfig({ throwStyle: 'balanced' });

  assert.ok(motion.launchAngleJitter >= 0.5);
  assert.ok(motion.tumbleForce >= 1);
  assert.ok(motion.restitution > 0.3);
  assert.ok(motion.angularDamping < 0.2);
  assert.ok(motion.settleTimeout >= 6000);
});

test('scales the complete motion profile from reduced to dramatic', () => {
  const reduced = getDiceMotionConfig({ reducedMotion: true, throwStyle: 'dramatic' });
  const gentle = getDiceMotionConfig({ throwStyle: 'gentle' });
  const dramatic = getDiceMotionConfig({ throwStyle: 'dramatic' });

  assert.ok(reduced.throwForce < gentle.throwForce);
  assert.ok(gentle.throwForce < dramatic.throwForce);
  assert.ok(reduced.tumbleForce < gentle.tumbleForce);
  assert.ok(gentle.tumbleForce < dramatic.tumbleForce);
  assert.ok(reduced.angularDamping > dramatic.angularDamping);
});
