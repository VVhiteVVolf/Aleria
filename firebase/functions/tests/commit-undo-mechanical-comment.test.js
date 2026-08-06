import assert from 'node:assert/strict';
import test from 'node:test';
import { undoMechanicalCommentInternals } from '../src/mechanics/commit-undo-mechanical-comment.js';

test('beschreibt eine Kampfhandlung mit Name und gekürztem Text', () => {
  const description = undoMechanicalCommentInternals.describeComment({
    charName: 'Gawain Draig',
    commentKind: 'combataction',
    text: 'Gawain greift mit seinem Langschwert an.'
  });
  assert.equal(description, 'Kampfhandlung von Gawain Draig ("Gawain greift mit seinem Langschwert an.")');
});

test('kürzt sehr lange Kommentartexte in der Beschreibung', () => {
  const description = undoMechanicalCommentInternals.describeComment({
    charName: 'Gawain Draig',
    commentKind: 'combataction',
    text: 'x'.repeat(200)
  });
  assert.match(description, /…"\)$/);
});

test('erkennt Kampfankündigung und Rast anhand von commentKind', () => {
  assert.match(
    undoMechanicalCommentInternals.describeComment({ charName: 'Erzähler', commentKind: 'combat-encounter-event', text: 'Der Kampf beginnt.' }),
    /^Kampfankündigung von Erzähler/
  );
  assert.match(
    undoMechanicalCommentInternals.describeComment({ charName: 'Erzähler', commentKind: 'scene-rest-event', text: 'Die Gruppe rastet.' }),
    /^Rast von Erzähler/
  );
});

test('blockiert Beiträge mit zusätzlicher Fertigkeitsprobe oder Inventarnutzung', () => {
  assert.equal(undoMechanicalCommentInternals.hasUnsupportedMechanics({
    commentSegments: [{ skillResolution: { resolutionId: 'r1' } }]
  }), true);
  assert.equal(undoMechanicalCommentInternals.hasUnsupportedMechanics({
    commentSegments: [{ inventoryUse: { usageId: 'u1' } }]
  }), true);
  assert.equal(undoMechanicalCommentInternals.hasUnsupportedMechanics({
    commentSegments: [{ combatResolution: { resolutionId: 'r1' } }]
  }), false);
  assert.equal(undoMechanicalCommentInternals.hasUnsupportedMechanics({}), false);
});
