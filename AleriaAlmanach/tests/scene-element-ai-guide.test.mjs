import test from 'node:test';
import assert from 'node:assert/strict';
import { createHerausforderungAiTemplate, createHerausforderungAiStarter, parseHerausforderungImport } from '../modules/herausforderung/herausforderung-exchange.js';
import { createSceneElementAiScene, createSceneElementAiExamples } from '../modules/scene-elements/scene-element-ai-guide.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';

test('every complete starter example imports with the real parser, including narration and hidden danger', () => {
  for (const [type, example] of Object.entries(createSceneElementAiExamples())) {
    const imported = parseHerausforderungImport(JSON.stringify(example));
    assert.equal(imported.event.elementType, type);
    assert.deepEqual(imported.issues, [], type);
  }
});

test('the standalone guide explains the Almanach, all five types and normal scene mechanics', () => {
  const starter = createHerausforderungAiStarter();
  assert.match(starter.guide.aleria, /AleriaAlmanach.*interaktiven Szenenseiten/);
  assert.deepEqual(Object.keys(starter.guide.types).sort(), ['challenge', 'danger', 'item', 'narration', 'puzzle']);
  assert.match(starter.guide.copyPrompt, /Meine Idee.*Import-JSON/);
  for (const feature of ['Marotten', 'Konzentration', 'Rettungswurf', 'UND', 'ODER', 'Inventar', 'Waffenmanöver', 'Fazit', 'Szenenzeit']) {
    assert.ok(JSON.stringify(starter.guide).includes(feature), feature);
  }
  assert.equal(starter.catalog.checks.length, 32);
  assert.ok(Buffer.byteLength(JSON.stringify(starter)) < 32_000, 'Quick start must remain bounded without an entire item catalogue');
});

test('the compact package retains a real draft and only relevant figures/items; full reference remains available', () => {
  const item = STANDARD_ITEMS.find(item => item.category === 'waffen');
  const draft = { elementType: 'item', title: 'Ein Fund', publicDescription: 'Etwas liegt im Staub.', approaches: [{ approachId: 'find', label: 'Bergen',
    preferredSkills: ['investigation'], difficulty: 12, insight: 'Du birgst den Fund.', rewards: { items: [{ template: item.id, quantity: 1 }] } }] };
  const context = { participantIds: ['reader'], actors: [{ actorId: 'reader', name: 'Lefraye' }, { actorId: 'unrelated', name: 'Unbeteiligt' }] };
  const compact = createHerausforderungAiStarter({ standards: STANDARD_ITEMS }, context, draft);
  const full = createHerausforderungAiTemplate({ standards: STANDARD_ITEMS }, context);
  assert.equal(compact.challenge.title, draft.title);
  assert.deepEqual(compact.catalog.actors.map(actor => actor.actorId), ['reader']);
  assert.deepEqual(compact.catalog.itemTemplates.map(entry => entry.template), [item.id]);
  assert.ok(full.catalog.itemTemplates.length > compact.catalog.itemTemplates.length);
  assert.match(full.instructions.syntax.weaponManeuver, /weapon-maneuver/);
  assert.deepEqual(parseHerausforderungImport(JSON.stringify(compact), { standards: STANDARD_ITEMS }).issues, []);
});

test('scene context projects public titles and sources, never entire comments, result tables or hidden preparations', () => {
  const scene = createSceneElementAiScene({ entry: { title: 'Prüfmodul' }, page: { pageTitle: 'Korridor', sessionIntro: '<p>Ein stiller Gang.</p>', private: 'NICHT EXPORTIEREN' } }, [
    { id: 'item', serverValidatedMechanics: true, herausforderung: { elementType: 'item', title: 'Truhe', approaches: [{ insight: 'GEHEIME LÖSUNG' }] } },
    { id: 'secret', serverValidatedMechanics: true, sceneElementSignal: { visible: false, state: 'armed', title: 'VERBORGENE FALLE' } },
    { id: 'speech', text: 'PRIVATER VERLAUF', biography: 'BIOGRAFIE' }
  ]);
  assert.equal(scene.title, 'Korridor'); assert.equal(scene.situation, 'Ein stiller Gang.');
  assert.deepEqual(scene.interactionSources, [{ sourceId: 'item', type: 'item', title: 'Truhe' }]);
  assert.doesNotMatch(JSON.stringify(scene), /NICHT EXPORTIEREN|GEHEIME LÖSUNG|VERBORGENE FALLE|PRIVATER VERLAUF|BIOGRAFIE/);
});
