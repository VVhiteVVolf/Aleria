import assert from 'node:assert/strict';
import test from 'node:test';

import { validateHerausforderungEvent } from '../src/mechanics/commit-herausforderung.js';
import { normalizeHerausforderungEvent } from '../src/generated/herausforderung/herausforderung-model.js';

function validEvent(overrides = {}) {
  return normalizeHerausforderungEvent({
    title: 'Der Dieb im Raum',
    publicDescription: 'Jemand hat hier etwas gestohlen.',
    approaches: [
      { label: 'Spuren untersuchen', preferredSkills: ['investigation'], difficulty: 13, insight: 'Idwal trat erst später in die Pfütze.' }
    ],
    ...overrides
  });
}

test('eine vollständige Herausforderung besteht die Validierung', () => {
  assert.equal(validateHerausforderungEvent(validEvent()), null);
});

test('eine Herausforderung ohne öffentliche Beschreibung wird abgelehnt', () => {
  const event = validEvent({ publicDescription: '' });
  assert.match(validateHerausforderungEvent(event), /öffentliche Beschreibung/);
});

test('eine Herausforderung ohne Ansätze wird abgelehnt', () => {
  const event = validEvent({ approaches: [] });
  assert.match(validateHerausforderungEvent(event), /mindestens ein Ansatz/i);
});

test('ein Ansatz ohne bevorzugte Fertigkeit wird abgelehnt', () => {
  const event = validEvent({ approaches: [{ label: 'Ohne Fertigkeit', preferredSkills: [], insight: 'Etwas' }] });
  assert.match(validateHerausforderungEvent(event), /passende Fertigkeit/);
});

test('ein Ansatz ohne verdeckte Erkenntnis wird abgelehnt', () => {
  const event = validEvent({ approaches: [{ label: 'Ohne Erkenntnis', preferredSkills: ['investigation'], insight: '' }] });
  assert.match(validateHerausforderungEvent(event), /Erkenntnis/);
});

test('mehrere gültige Ansätze bestehen die Validierung gemeinsam', () => {
  const event = validEvent({
    approaches: [
      { label: 'Spuren untersuchen', preferredSkills: ['investigation'], difficulty: 13, insight: 'Wahrheit A' },
      { label: 'Verhalten vergleichen', preferredSkills: ['insight'], difficulty: 17, insight: 'Wahrheit B' }
    ]
  });
  assert.equal(event.approaches.length, 2);
  assert.equal(validateHerausforderungEvent(event), null);
});
