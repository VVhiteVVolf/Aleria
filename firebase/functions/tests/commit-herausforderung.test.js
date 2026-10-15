import assert from 'node:assert/strict';
import test from 'node:test';

import { validateHerausforderungEvent, commitHerausforderungOperation } from '../src/mechanics/commit-herausforderung.js';
import { database } from './fixtures/combat-transaction-database.js';
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

test('Szenenbild wird serverseitig gespeichert, normalisiert und bei Wiederholung nicht doppelt veröffentlicht', async () => {
  const db=database({}),sceneImage={url:'https://imgur.com/AbC123',alt:'Eine Wache',caption:'Abendlicht',format:'2:3',fit:'contain'};
  const request={auth:{uid:'image-author',token:{aleriaRole:'editor'}},data:{entryId:'image-test',text:'Herausforderung',metadata:{operationId:'scene-image-20261015',herausforderung:validEvent({sceneImage})}}};
  const first=await commitHerausforderungOperation(request,{database:db,now:123});
  const again=await commitHerausforderungOperation(request,{database:db,now:124});
  assert.equal(first.id,again.id);assert.equal(db.data.size,1);
  assert.deepEqual(db.data.get('comments/'+first.id).herausforderung.sceneImage,{...sceneImage,url:'https://i.imgur.com/AbC123.jpg'});
});

test('Server weist unsichere Bildquellen vor dem ersten Schreibzugriff zurück', async () => {
  const db=database({});
  const challenge=validEvent();challenge.sceneImage={url:'javascript:alert(1)',format:'16:9'};
  await assert.rejects(commitHerausforderungOperation({auth:{uid:'author',token:{}},data:{entryId:'image-test',text:'Bild',metadata:{herausforderung:challenge}}},{database:db}),/Szenenbild/);
  assert.equal(db.data.size,0);
});

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

test('ein Ansatz ohne angebotene Probe wird abgelehnt', () => {
  const event = validEvent({ approaches: [{ label: 'Ohne Fertigkeit', preferredSkills: [], insight: 'Etwas' }] });
  assert.match(validateHerausforderungEvent(event), /passende Probe/);
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
