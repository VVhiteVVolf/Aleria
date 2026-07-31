const MOTION_PRESETS = Object.freeze({
  reduced: Object.freeze({
    spinForce: 2.2,
    throwForce: 3.3,
    startingHeight: 5,
    launchAngleJitter: 0.16,
    launchHeightJitter: 0.06,
    tumbleForce: 0.42,
    friction: 0.82,
    restitution: 0.12,
    linearDamping: 0.5,
    angularDamping: 0.46,
    settleTimeout: 3200
  }),
  gentle: Object.freeze({
    spinForce: 5.2,
    throwForce: 5.8,
    startingHeight: 7,
    launchAngleJitter: 0.3,
    launchHeightJitter: 0.14,
    tumbleForce: 0.76,
    friction: 0.68,
    restitution: 0.24,
    linearDamping: 0.3,
    angularDamping: 0.24,
    settleTimeout: 5200
  }),
  balanced: Object.freeze({
    spinForce: 7.6,
    throwForce: 7.4,
    startingHeight: 9,
    launchAngleJitter: 0.52,
    launchHeightJitter: 0.24,
    tumbleForce: 1.05,
    friction: 0.58,
    restitution: 0.38,
    linearDamping: 0.18,
    angularDamping: 0.13,
    settleTimeout: 6200
  }),
  dramatic: Object.freeze({
    spinForce: 10.5,
    throwForce: 9.8,
    startingHeight: 11,
    launchAngleJitter: 0.78,
    launchHeightJitter: 0.34,
    tumbleForce: 1.4,
    friction: 0.48,
    restitution: 0.52,
    linearDamping: 0.1,
    angularDamping: 0.07,
    settleTimeout: 7600
  })
});

export function getDiceMotionConfig(settings = {}) {
  if (settings.reducedMotion === true) return { ...MOTION_PRESETS.reduced };
  const style = ['gentle', 'balanced', 'dramatic'].includes(settings.throwStyle)
    ? settings.throwStyle
    : 'balanced';
  return { ...MOTION_PRESETS[style] };
}
