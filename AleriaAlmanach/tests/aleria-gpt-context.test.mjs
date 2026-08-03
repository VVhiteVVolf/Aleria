import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const contextBuilderSource = readFileSync(
  new URL('../modules/aleria-gpt/aleria-gpt-context-builder.js', import.meta.url),
  'utf8'
);
const retrievalSource = readFileSync(
  new URL('../modules/aleria-gpt/aleria-gpt-retrieval.js', import.meta.url),
  'utf8'
);

function loadContextBuilder() {
  const context = vm.createContext({ window: {}, document: undefined });
  vm.runInContext(`${contextBuilderSource}\nwindow.__collectFacts = (value, options = {}) => { const facts = []; collectAleriaGptStructuredFacts(value, facts, 'charakter', 0, options); return facts; };\nwindow.__commentSegments = comment => getAleriaGptCommentSegments(comment, { byId: new Map(), byNameKey: new Map() });\nwindow.__storedComments = comments => collectAleriaGptStoredComments(comments, { byId: new Map(), byNameKey: new Map() });`, context);
  return context.window;
}

function loadRetrievalInternals() {
  const context = vm.createContext({ window: {}, Math, Set, Map });
  vm.runInContext(`${retrievalSource}\nwindow.__collectChunks = collectAleriaGptRetrievalChunks;`, context);
  return context.window;
}

test('AleriaGPT verliert die verbindlichen Werte 0 und false nicht beim Indexieren', () => {
  const window = loadContextBuilder();
  assert.equal(window.AleriaGptContext.toPlainText(0), '0');
  assert.equal(window.AleriaGptContext.toPlainText(false), 'false');
  const facts = window.__collectFacts({
    combatProfile: {
      resources: [{ name: 'Mana', current: 0 }],
      conditions: [{ name: 'Geblendet', active: false }]
    }
  });
  assert.ok(facts.some(fact => /current: 0$/.test(fact)));
  assert.ok(facts.some(fact => /active: false$/.test(fact)));
});

test('AleriaGPT behandelt den erzählerischen Charakterhintergrund nicht als Bildfeld', () => {
  const window = loadContextBuilder();
  const facts = window.__collectFacts({
    combatProfile: { identity: { background: 'Ehemalige Tempelwache' } }
  });
  assert.ok(facts.some(fact => /background: Ehemalige Tempelwache$/.test(fact)));
});

test('AleriaGPT kann tief verschachtelte Kosten und Aura-Modifikatoren vollständig indexieren', () => {
  const window = loadContextBuilder();
  const facts = window.__collectFacts({
    combatProfile: {
      techniques: [{
        name: 'Mordhau',
        mechanics: {
          costs: [{ resourceId: 'special-action', amount: 1 }],
          auraModifiers: [{ target: 'enemy', field: 'armorClass', value: -2 }]
        }
      }]
    }
  }, { maxDepth: 8 });
  assert.ok(facts.some(fact => /resource Id: special-action$/.test(fact)));
  assert.ok(facts.some(fact => /field: armorClass$/.test(fact)));
  assert.ok(facts.some(fact => /value: -2$/.test(fact)));
});

test('AleriaGPT erhält Fertigkeitsresultate, aber keine noch verdeckte Wahrheit', () => {
  const window = loadContextBuilder();
  const [segment] = window.__commentSegments({
    id: 'comment-1',
    charName: 'Dieb',
    commentSegments: [{
      kind: 'performance',
      text: 'Der Weg ist sicher.',
      mechanicMode: 'skill',
      skillChallenge: {
        id: 'lie-1',
        title: 'Aussage prüfen',
        revealedText: 'Der Weg ist vermint.',
        difficulty: 14,
        preferredSkills: ['insight']
      },
      skillResolution: {
        skillId: 'deception',
        skillName: 'Täuschen',
        outcome: 'success',
        total: 18,
        difficulty: 14,
        revealedText: ''
      }
    }]
  });
  assert.equal(segment.mechanicMode, 'skill');
  assert.equal(segment.skillResolution.skillName, 'Täuschen');
  assert.equal(segment.skillChallenge.title, 'Aussage prüfen');
  assert.equal(Object.hasOwn(segment.skillChallenge, 'revealedText'), false);
  assert.equal(JSON.stringify(segment).includes('Der Weg ist vermint.'), false);
  assert.equal(segment.kind, 'speech');
});

test('AleriaGPT erhält gespeicherte Kampf-, Inventar- und Rastfolgen als kompakte Mechanik', () => {
  const window = loadContextBuilder();
  const comments = window.__storedComments([{
    id: 'combat-comment',
    entryId: 'scene-1',
    charName: 'Gawain',
    commentSegments: [{
      kind: 'combataction',
      text: 'Gawain führt den Hieb zu Ende.',
      combatResolution: {
        resolutionId: 'resolution-1',
        actorId: 'gawain',
        actorName: 'Gawain',
        targetId: 'bandit',
        targetName: 'Bandit',
        weapon: { name: 'Langschwert' },
        attack: { hit: true, criticalSuccess: false, criticalFailure: false, naturalRoll: 12, total: 18, targetDefense: 14 },
        damage: { total: 7, damageType: 'Hieb' },
        targetSnapshot: { hitPointsBefore: 11, hitPointsAfter: 4, maximumHitPoints: 11, temporaryHitPointsAfter: 0, defeated: false },
        actorResourceSnapshot: { changes: [{ resourceId: 'action', name: 'Aktion', amount: 1, before: 1, after: 0 }] }
      },
      inventoryUse: {
        usageId: 'use-1',
        actorId: 'gawain',
        actorName: 'Gawain',
        item: { id: 'potion', name: 'Heiltrank', type: 'Trank' },
        mode: 'consume',
        quantity: 1,
        quantityBefore: 2,
        quantityAfter: 1
      }
    }]
  }, {
    id: 'rest-comment',
    entryId: 'scene-1',
    narrator: true,
    commentKind: 'scene-rest-event',
    text: 'Die Gruppe rastet.',
    sceneRest: {
      kind: 'scene-rest-event',
      type: 'long',
      durationSeconds: 28800,
      recoveryDayKey: 'scene:scene-1:day-2',
      participants: [{
        actorId: 'gawain',
        name: 'Gawain',
        before: { hitPoints: { current: 4 } },
        after: { hitPoints: { current: 11, maximum: 11 } },
        changes: { resources: [{ name: 'Mana', before: 1, after: 4 }], abilities: [] }
      }]
    },
    sceneTimeEvent: { anchorDay: 2, anchorSeconds: 9000, segmentBreak: true }
  }]);

  const combat = comments[0].segments[0];
  assert.equal(combat.kind, 'combataction');
  assert.equal(combat.combatResolution.hitPointsAfter, 4);
  assert.equal(combat.inventoryUse.quantityAfter, 1);
  assert.match(combat.mechanicsText, /Langschwert: Treffer/);
  assert.match(combat.mechanicsText, /Ziel-TP 11 -> 4\/11/);
  assert.match(combat.mechanicsText, /Aktion 1 -> 0/);
  assert.match(combat.mechanicsText, /Heiltrank; Bestand 2 -> 1/);

  const rest = comments[1].segments[0];
  assert.equal(rest.sceneRest.type, 'long');
  assert.match(rest.mechanicsText, /Lange Rast/);
  assert.match(rest.mechanicsText, /TP 4 -> 11\/11/);
  assert.match(rest.mechanicsText, /Mana 1 -> 4/);
  assert.match(rest.mechanicsText, /Szenenzeit: Tag 2/);
});

test('AleriaGPT bezeichnet eine getarnte Schauspiel-Blase erst nach erfolgreicher Entlarvung korrekt', () => {
  const window = loadContextBuilder();
  const challenge = {
    id: 'lie-comment',
    entryId: 'scene-1',
    charName: 'Dieb',
    commentSegments: [{
      kind: 'performance',
      text: 'Der Weg ist sicher.',
      skillChallenge: { id: 'lie-1', difficulty: 14, preferredSkills: ['insight'] }
    }]
  };
  const hidden = window.__storedComments([challenge]);
  assert.equal(hidden[0].segments[0].kind, 'speech');

  const revealed = window.__storedComments([challenge, {
    id: 'answer',
    entryId: 'scene-1',
    charName: 'Ritterin',
    commentSegments: [{
      kind: 'thought',
      text: 'Etwas stimmt nicht.',
      skillResolution: { outcome: 'success', targetChallengeId: 'lie-1' }
    }]
  }]);
  assert.equal(revealed[0].segments[0].kind, 'performance');
});

test('AleriaGPT-Retrieval nimmt den Mechaniktext tatsächlich in den Kommentarblock auf', () => {
  const window = loadRetrievalInternals();
  const chunks = window.__collectChunks({
    modules: [],
    characters: [],
    creatures: [],
    comments: [{
      commentId: 'comment-1',
      moduleId: 'scene-1',
      segments: [{
        sourceRef: 'comment:comment-1:segment:0',
        speakerName: 'Gawain',
        kind: 'combataction',
        plainText: 'Der Hieb trifft.',
        mechanicsText: 'Kampfauswertung: Schaden 7; Ziel-TP 11 -> 4/11.'
      }]
    }]
  });
  assert.equal(chunks.length, 1);
  assert.match(chunks[0].text, /Der Hieb trifft/);
  assert.match(chunks[0].text, /Ziel-TP 11 -> 4\/11/);
  assert.equal(chunks[0].metadata.hasMechanics, true);
});

test('saving spells and temporary hit points stay explicit in the AI context', () => {
  const window = loadContextBuilder();
  const comments = window.__storedComments([{
    id: 'saving-spell',
    entryId: 'scene-1',
    commentSegments: [{
      kind: 'spell',
      text: 'Flammen schlagen um das Ziel.',
      combatResolution: {
        resolutionId: 'saving-spell-1',
        resolutionMode: 'saving-throw',
        actorName: 'Magierin',
        targetName: 'Waechter',
        weapon: { name: 'Flammenkreis' },
        attack: {
          hit: true,
          saveSucceeded: false,
          saveAttribute: 'dexterity',
          rollOwner: 'target',
          total: 11,
          targetDefense: 15
        },
        damage: { total: 8, damageType: 'Feuer' },
        targetSnapshot: {
          hitPointsBefore: 20,
          hitPointsAfter: 17,
          maximumHitPoints: 20,
          temporaryHitPointsBefore: 5,
          temporaryHitPointsAfter: 0,
          damageAbsorbedByTemporaryHitPoints: 5,
          damageAppliedToHitPoints: 3
        }
      }
    }]
  }]);

  const resolution = comments[0].segments[0].combatResolution;
  assert.equal(resolution.resolutionMode, 'saving-throw');
  assert.equal(resolution.saveSucceeded, false);
  assert.equal(resolution.temporaryHitPointsBefore, 5);
  assert.equal(resolution.damageAbsorbedByTemporaryHitPoints, 5);
  assert.match(comments[0].segments[0].mechanicsText, /Rettungswurf misslungen/);
  assert.match(comments[0].segments[0].mechanicsText, /Zauber-SG 15/);
  assert.match(comments[0].segments[0].mechanicsText, /tempor.*re TP 5 -> 0/);
});
