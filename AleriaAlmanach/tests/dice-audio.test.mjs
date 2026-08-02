import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clampDiceSoundVolume,
  countDiceInNotation,
  DEFAULT_DICE_SOUND_VOLUME,
  getDiceAudioProfile,
  getDiceResultCue
} from '../modules/scene-dice/dice-audio.js';
import { DICE_SETTINGS_KEY, DiceHistoryRepository } from '../modules/scene-dice/dice-history.js';

function createMemoryStorage(initial = {}) {
  const memory = new Map(Object.entries(initial));
  return {
    getItem: key => memory.get(key) || null,
    setItem: (key, value) => memory.set(key, value),
    memory
  };
}

test('counts all physical dice groups without treating modifiers as dice', () => {
  assert.equal(countDiceInNotation('2d20kh1 + 3d6 + 4'), 5);
  assert.equal(countDiceInNotation('1W8+3'), 1);
  assert.equal(countDiceInNotation('invalid'), 0);
});

test('selects stronger roll recordings for larger pools and dramatic throws', () => {
  assert.equal(getDiceAudioProfile('1d20', { throwStyle: 'gentle' }).assetKey, 'rollLight');
  assert.equal(getDiceAudioProfile('3d6', { throwStyle: 'balanced' }).assetKey, 'rollMedium');
  assert.equal(getDiceAudioProfile('8d6', { throwStyle: 'dramatic' }).assetKey, 'rollDramatic');
  assert.equal(getDiceAudioProfile('20d6').maxImpacts, 6);
});

test('clamps persisted sound volume to the safe zero-to-one range', () => {
  assert.equal(clampDiceSoundVolume(-1), 0);
  assert.equal(clampDiceSoundVolume(2), 1);
  assert.equal(clampDiceSoundVolume('not-a-number'), DEFAULT_DICE_SOUND_VOLUME);
});

test('uses distinct result cues for ordinary, critical and failed rolls', () => {
  const ordinary = getDiceResultCue({});
  const success = getDiceResultCue({ critical: 'success' });
  const failure = getDiceResultCue({ critical: 'failure' });
  assert.ok(success.endFrequency > success.startFrequency);
  assert.ok(failure.endFrequency < failure.startFrequency);
  assert.notEqual(ordinary.startFrequency, success.startFrequency);
});

test('enables physical feedback for new and legacy users while preserving a current mute', () => {
  const fresh = new DiceHistoryRepository(createMemoryStorage());
  assert.equal(fresh.getSettings().soundEnabled, true);
  assert.equal(fresh.getSettings().soundVolume, DEFAULT_DICE_SOUND_VOLUME);

  const legacyStorage = createMemoryStorage({
    [DICE_SETTINGS_KEY]: JSON.stringify({ schemaVersion: 2, soundEnabled: false, soundVolume: 0.25 })
  });
  const legacy = new DiceHistoryRepository(legacyStorage);
  assert.equal(legacy.getSettings().soundEnabled, true);

  const mutedStorage = createMemoryStorage({
    [DICE_SETTINGS_KEY]: JSON.stringify({ schemaVersion: 3, soundEnabled: false, soundVolume: 0.25 })
  });
  const muted = new DiceHistoryRepository(mutedStorage);
  assert.equal(muted.getSettings().soundEnabled, false);
  assert.equal(muted.getSettings().soundVolume, 0.25);
});

test('sanitizes audio settings before writing schema version three', () => {
  const storage = createMemoryStorage();
  const repository = new DiceHistoryRepository(storage);
  const settings = repository.setSettings({ soundEnabled: true, soundVolume: 4 });
  const stored = JSON.parse(storage.memory.get(DICE_SETTINGS_KEY));
  assert.equal(settings.soundVolume, 1);
  assert.equal(stored.soundVolume, 1);
  assert.equal(stored.schemaVersion, 3);
});
