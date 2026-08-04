import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyHerausforderungOutcome,
  collectHerausforderungApproaches,
  getHerausforderungApproachTargetId,
  HERAUSFORDERUNG_NARROW_FAILURE_MARGIN,
  isHerausforderungComment,
  MAX_HERAUSFORDERUNG_APPROACHES,
  normalizeHerausforderungApproach,
  normalizeHerausforderungEvent,
  parseHerausforderungApproachTargetId
} from '../modules/herausforderung/herausforderung-model.js';

test('normalisiert eine Herausforderung mit Titel, Beschreibung und Ansätzen', () => {
  const event = normalizeHerausforderungEvent({
    title: 'Der Dieb im Raum',
    publicDescription: 'Jemand hat hier etwas gestohlen.',
    approaches: [
      { label: 'Spuren untersuchen', preferredSkills: ['investigation'], difficulty: 13, insight: 'Idwal trat erst später in die Pfütze.' },
      { label: 'Verhalten vergleichen', preferredSkills: ['insight'], difficulty: 17, insight: 'Isobel lenkt ab.' }
    ]
  });
  assert.equal(event.title, 'Der Dieb im Raum');
  assert.equal(event.publicDescription, 'Jemand hat hier etwas gestohlen.');
  assert.equal(event.approaches.length, 2);
  assert.equal(event.approaches[0].label, 'Spuren untersuchen');
  assert.equal(event.approaches[0].difficulty, 13);
  assert.deepEqual(event.approaches[0].preferredSkills, ['investigation']);
});

test('vergibt einen Standardtitel und eine stabile Ansatz-ID, wenn nichts angegeben wurde', () => {
  const event = normalizeHerausforderungEvent({ approaches: [{}] });
  assert.equal(event.title, 'Herausforderung');
  assert.ok(event.approaches[0].approachId);
  assert.equal(event.approaches[0].label, 'Ansatz 1');
});

test('begrenzt die Anzahl der Ansätze auf das Maximum', () => {
  const approaches = Array.from({ length: MAX_HERAUSFORDERUNG_APPROACHES + 5 }, (_, index) => ({ label: `Ansatz ${index}` }));
  const event = normalizeHerausforderungEvent({ approaches });
  assert.equal(event.approaches.length, MAX_HERAUSFORDERUNG_APPROACHES);
});

test('normalizeHerausforderungApproach dedupliziert bevorzugte Fertigkeiten', () => {
  const approach = normalizeHerausforderungApproach({ preferredSkills: ['investigation', 'investigation', 'insight'] }, 0);
  assert.deepEqual(approach.preferredSkills, ['investigation', 'insight']);
});

test('erkennt Herausforderung-Kommentare an Payload, Kind oder Modus', () => {
  assert.equal(isHerausforderungComment({ herausforderung: { approaches: [] } }), true);
  assert.equal(isHerausforderungComment({ commentKind: 'herausforderung-event' }), true);
  assert.equal(isHerausforderungComment({ commentMode: 'herausforderung' }), true);
  assert.equal(isHerausforderungComment({ commentMode: 'narrator' }), false);
});

test('baut und liest zusammengesetzte Ziel-IDs aus Kommentar- und Ansatz-ID', () => {
  const targetId = getHerausforderungApproachTargetId('comment-123', 'approach-abc');
  assert.equal(targetId, 'herausforderung:comment-123:approach-abc');
  assert.deepEqual(parseHerausforderungApproachTargetId(targetId), { commentId: 'comment-123', approachId: 'approach-abc' });
  assert.equal(parseHerausforderungApproachTargetId('keine-herausforderung'), null);
});

test('collectHerausforderungApproaches liefert einen Eintrag pro Ansatz mit Ziel-Composer-Feldern', () => {
  const comments = [
    {
      id: 'comment-1',
      createdBy: 'uid-dm',
      herausforderung: {
        title: 'Der Dieb im Raum',
        publicDescription: 'Jemand hat hier etwas gestohlen.',
        approaches: [
          { approachId: 'a1', label: 'Spuren untersuchen', preferredSkills: ['investigation'], difficulty: 13, insight: 'Geheime Wahrheit A' },
          { approachId: 'a2', label: 'Verhalten vergleichen', preferredSkills: ['insight'], difficulty: 17, insight: 'Geheime Wahrheit B' }
        ]
      }
    },
    { id: 'comment-2', text: 'Ein normaler Kommentar ohne Herausforderung.' }
  ];
  const approaches = collectHerausforderungApproaches(comments);
  assert.equal(approaches.length, 2);
  assert.equal(approaches[0].id, 'herausforderung:comment-1:a1');
  assert.equal(approaches[0].authorKey, 'herausforderung:comment-1');
  assert.equal(approaches[0].authorName, 'Der Dieb im Raum');
  assert.equal(approaches[0].createdBy, 'uid-dm');
  assert.equal(approaches[0].difficulty, 13);
  assert.deepEqual(approaches[0].preferredSkills, ['investigation']);
  assert.equal(approaches[0].defenseMode, 'fixed');
  assert.equal(approaches[0].source, 'herausforderung');
  assert.equal(approaches[0].insight, 'Geheime Wahrheit A');
  assert.ok(!approaches[0].visibleText.includes('Geheime Wahrheit'), 'visibleText darf die verdeckte Erkenntnis nicht enthalten');
  assert.equal(approaches[1].id, 'herausforderung:comment-1:a2');
});

test('collectHerausforderungApproaches ignoriert Kommentare ohne Herausforderung', () => {
  assert.deepEqual(collectHerausforderungApproaches([{ id: 'x', text: 'normal' }]), []);
  assert.deepEqual(collectHerausforderungApproaches([]), []);
});

test('normalizeHerausforderungApproach übernimmt optionalen Teilhinweis und Fehlschlag-Konsequenz', () => {
  const approach = normalizeHerausforderungApproach({ insight: 'Wahrheit', partialHint: 'Unsicherer Hinweis', failureConsequence: 'Komplikation' }, 0);
  assert.equal(approach.insight, 'Wahrheit');
  assert.equal(approach.partialHint, 'Unsicherer Hinweis');
  assert.equal(approach.failureConsequence, 'Komplikation');
});

test('collectHerausforderungApproaches reicht Teilhinweis und Fehlschlag-Konsequenz durch', () => {
  const approaches = collectHerausforderungApproaches([{
    id: 'comment-1',
    herausforderung: {
      title: 'X', publicDescription: 'x',
      approaches: [{ approachId: 'a1', label: 'A', preferredSkills: ['investigation'], insight: 'Wahrheit', partialHint: 'Hinweis', failureConsequence: 'Komplikation' }]
    }
  }]);
  assert.equal(approaches[0].partialHint, 'Hinweis');
  assert.equal(approaches[0].failureConsequence, 'Komplikation');
});

test('classifyHerausforderungOutcome: eine natürliche 20 ist immer der kritische Erfolg', () => {
  assert.equal(classifyHerausforderungOutcome({ natural: 20, total: 1, difficulty: 40 }), 'kritischer-erfolg');
});

test('classifyHerausforderungOutcome: eine natürliche 1 zählt immer als deutliches Scheitern, auch bei hohem Gesamtwert', () => {
  assert.equal(classifyHerausforderungOutcome({ natural: 1, total: 99, difficulty: 10 }), 'deutlich');
});

test('classifyHerausforderungOutcome: erreichte oder übertroffene Schwierigkeit ist ein Erfolg', () => {
  assert.equal(classifyHerausforderungOutcome({ natural: 10, total: 13, difficulty: 13 }), 'erfolg');
  assert.equal(classifyHerausforderungOutcome({ natural: 10, total: 15, difficulty: 13 }), 'erfolg');
});

test('classifyHerausforderungOutcome: verfehlte Schwierigkeit knapp innerhalb der Marge ist knappes Scheitern', () => {
  const total = 13 - HERAUSFORDERUNG_NARROW_FAILURE_MARGIN;
  assert.equal(classifyHerausforderungOutcome({ natural: 10, total, difficulty: 13 }), 'knapp');
});

test('classifyHerausforderungOutcome: verfehlte Schwierigkeit deutlich außerhalb der Marge ist deutliches Scheitern', () => {
  const total = 13 - HERAUSFORDERUNG_NARROW_FAILURE_MARGIN - 1;
  assert.equal(classifyHerausforderungOutcome({ natural: 10, total, difficulty: 13 }), 'deutlich');
});
