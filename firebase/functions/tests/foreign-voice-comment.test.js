import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildNarrativeCommentDocument,
  commitNarrativeCommentOperation,
  narrativeCommentInternals
} from '../src/comments/commit-narrative-comment.js';
import { database } from './fixtures/combat-transaction-database.js';

const auth = { uid: 'foreign-voice-author', token: { aleriaRole: 'player' } };
const avatarIds = ['boy', 'girl', 'woman', 'man', 'person', 'boy-2', 'boy-3', 'girl-2', 'girl-3', 'woman-2', 'woman-3', 'man-2', 'man-3',
  'elderly-woman', 'elderly-citizen', 'courtesan', 'servant', 'city-guard', 'knight', 'mercenary', 'robber', 'knight-2', 'mercenary-2'];

function payload() {
  return {
    entryId: 'foreign-voice-fixture',
    charName: 'Hauptfigur',
    charTitle: 'Reisende',
    portrait: './main-character.png',
    text: 'Die Reisende fragt nach dem Weg. Mehrere Dorfbewohner antworten.',
    metadata: {
      characterId: 'main-character',
      commentMode: 'character',
      commentKind: 'speech',
      commentSegments: [
        { kind: 'speech', text: 'Wo ist die Mühle?', characterId: 'main-character',
          charName: 'Hauptfigur', portrait: './main-character.png', emoteIndex: 2, imageSetId: 'travel' },
        ...avatarIds.map((avatarId, index) => ({
          kind: 'foreignvoice',
          text: `Antwort ${index + 1}`,
          foreignVoiceName: avatarId === 'person' ? '' : `Dorfstimme ${index + 1}`,
          foreignVoiceAvatarId: avatarId,
          charName: avatarId === 'person' ? 'Fremde/r' : `Dorfstimme ${index + 1}`,
          charTitle: '',
          portrait: `./public/assets/comment-foreign-voice/${avatarId}.png`,
          avatarKind: 'foreignvoice',
          emoteIndex: null,
          imageSetId: '',
          side: index % 2 ? 'right' : 'left'
        }))
      ]
    }
  };
}

test('the existing narrative document preserves all twenty-three foreign voice avatars beside the selected main character', () => {
  const input = payload();
  const document = buildNarrativeCommentDocument(input, input.entryId, { auth }, 100);
  assert.deepEqual(document.commentSegments, input.metadata.commentSegments);
  assert.deepEqual(document.commentSegments.slice(1).map(segment => segment.foreignVoiceAvatarId), avatarIds);
  assert.equal(document.charName, 'Hauptfigur');
  assert.equal(document.portrait, './main-character.png');
  assert.equal(document.characterId, 'main-character');
  assert.equal(document.commentKind, 'speech');
  assert.equal(document.mechanicalAudit, false);
});

test('a mixed narrative transaction round-trips foreign names and silhouettes without creating or changing characters', async () => {
  const originalCharacter = { name: 'Hauptfigur', ownerUid: 'preserved-owner', inventory: { items: [] } };
  const db = database({ 'characters/main-character': originalCharacter });
  const input = payload();
  const result = await commitNarrativeCommentOperation({ auth, data: input }, { database: db, now: 200 });
  const saved = JSON.parse(JSON.stringify(db.data.get(`comments/${result.id}`)));

  assert.deepEqual(saved.commentSegments, input.metadata.commentSegments);
  assert.deepEqual(saved.commentSegments.slice(1).map(segment => segment.foreignVoiceAvatarId), avatarIds);
  assert.deepEqual(db.data.get('characters/main-character'), originalCharacter);
  assert.deepEqual([...db.data.keys()].sort(), ['characters/main-character', `comments/${result.id}`].sort());
  assert.deepEqual(result.profileUpdates, []);
  assert.equal(saved.createdBy, auth.uid);
  assert.equal(saved.serverCommitted, true);
});

test('foreign voices remain narrative and cannot bypass the existing state-changing mechanic guard', async () => {
  const input = payload();
  assert.equal(narrativeCommentInternals.containsPersistentMechanics(input.metadata), false);
  input.metadata.commentSegments[1].inventoryUse = { usageId: 'forged-use' };
  await assert.rejects(
    commitNarrativeCommentOperation({ auth, data: input }, { database: {} }),
    /Transaktion/
  );
});

test('a narrator post preserves ordinary narration, a named foreign voice and an anonymous secret action together', async () => {
  const db = database({});
  const input = {
    entryId: 'foreign-voice-narrator-fixture', charName: 'Erzähler', charTitle: '', portrait: null,
    narrator: true, text: 'Auf dem Dorfplatz spricht die Torwache. Eine Gestalt verbirgt einen Brief.',
    metadata: { commentMode: 'narrator', commentKind: 'narrator', characterId: '', commentSegments: [
      { kind: 'action', commentKind: 'action', narrator: true, charName: 'Erzähler', text: 'Auf dem Dorfplatz sammeln sich einige Leute.', portrait: null, characterId: '' },
      { kind: 'foreignvoice', commentKind: 'foreignvoice', narrator: false, charName: 'Torwache', charTitle: '',
        foreignVoiceName: 'Torwache', foreignVoiceAvatarId: 'man-2', portrait: './public/assets/comment-foreign-voice/man-2.png',
        avatarKind: 'foreignvoice', characterId: '', imageSetId: '', emoteIndex: null, text: 'Abends schließt das Tor.' },
      { kind: 'secretaction', commentKind: 'secretaction', narrator: false, charName: 'Unbekannte Gestalt',
        portrait: null, characterId: '', text: 'Jemand schiebt eine Nachricht unter die Tür.' }
    ] }
  };
  const result = await commitNarrativeCommentOperation({ auth, data: input }, { database: db, now: 300 });
  const saved = db.data.get(`comments/${result.id}`);
  assert.equal(saved.narrator, true);
  assert.equal(saved.characterId, '');
  assert.deepEqual(saved.commentSegments, input.metadata.commentSegments);
  assert.deepEqual(result.profileUpdates, []);
  assert.deepEqual([...db.data.keys()], [`comments/${result.id}`]);
});
