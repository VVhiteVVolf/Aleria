import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getTrustedSceneDay,
  isTrustedMechanicalComment,
  isTrustedSceneTimeComment
} from '../src/mechanics/trusted-scene-history.js';

test('server committed timeline events advance the trusted scene day', () => {
  const comments = [
    { serverCommitted: true, mechanicalAudit: true, sceneTimeEvent: { anchorDay: 2 } },
    { serverValidatedMechanics: true, sceneTimeEvent: { anchorDay: 4 } }
  ];
  assert.equal(comments.every(isTrustedSceneTimeComment), true);
  assert.equal(getTrustedSceneDay(comments), 4);
});

test('client-shaped and imported timeline records cannot reset daily resources', () => {
  const comments = [
    { sceneTimeEvent: { anchorDay: 50 } },
    {
      serverCommitted: true,
      mechanicalAudit: true,
      importedHistoricalMechanics: true,
      sceneTimeEvent: { anchorDay: 40 }
    }
  ];
  assert.equal(comments.some(isTrustedSceneTimeComment), false);
  assert.equal(getTrustedSceneDay(comments), 1);
});

test('only live server-validated mechanics participate in combat replay', () => {
  assert.equal(isTrustedMechanicalComment({ serverValidatedMechanics: true }), true);
  assert.equal(isTrustedMechanicalComment({
    serverValidatedMechanics: true,
    importedHistoricalMechanics: true
  }), false);
});
