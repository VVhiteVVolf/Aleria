import assert from 'node:assert/strict';
import test from 'node:test';

import { createCharacterImageLibraryAutosave } from '../modules/characters/character-image-library-autosave.js';

function createManualTimer() {
  let nextId = 1;
  const callbacks = new Map();
  return {
    setTimer(next) {
      const id = nextId++;
      callbacks.set(id, next);
      return id;
    },
    clearTimer(id) {
      callbacks.delete(id);
    },
    run(id = callbacks.keys().next().value) {
      const next = callbacks.get(id);
      callbacks.delete(id);
      next?.();
    }
  };
}

test('mehrere schnelle Bildaenderungen werden als letzter vollstaendiger Stand gespeichert', async () => {
  const timer = createManualTimer();
  const writes = [];
  const autosave = createCharacterImageLibraryAutosave({
    write: async snapshot => writes.push(snapshot),
    setTimer: timer.setTimer,
    clearTimer: timer.clearTimer
  });

  autosave.schedule({ characterId: 'fenrir', images: { imageSets: [{ id: 'standard' }] } });
  autosave.schedule({ characterId: 'fenrir', images: { imageSets: [{ id: 'standard' }, { id: 'kampf' }] } });
  await autosave.flush();

  assert.equal(writes.length, 1);
  assert.deepEqual(writes[0].images.imageSets.map(set => set.id), ['standard', 'kampf']);
});

test('Bildspeicherungen laufen geordnet und ueberschreiben keinen neueren Stand mit einem aelteren', async () => {
  let releaseFirstWrite;
  const writes = [];
  const firstWrite = new Promise(resolve => { releaseFirstWrite = resolve; });
  const autosave = createCharacterImageLibraryAutosave({
    write: async snapshot => {
      writes.push(snapshot.images.portrait);
      if (writes.length === 1) await firstWrite;
    }
  });

  autosave.schedule({ characterId: 'gawain', images: { portrait: 'alt.png' } });
  const firstFlush = autosave.flush();
  autosave.schedule({ characterId: 'gawain', images: { portrait: 'neu.png' } });
  const secondFlush = autosave.flush();

  await Promise.resolve();
  assert.deepEqual(writes, ['alt.png']);
  releaseFirstWrite();
  await Promise.all([firstFlush, secondFlush]);
  assert.deepEqual(writes, ['alt.png', 'neu.png']);
});

test('eine ausstehende Bildspeicherung kann vor dem Loeschen der Figur verworfen werden', async () => {
  const timer = createManualTimer();
  const writes = [];
  const autosave = createCharacterImageLibraryAutosave({
    write: async snapshot => writes.push(snapshot),
    setTimer: timer.setTimer,
    clearTimer: timer.clearTimer
  });

  autosave.schedule({ characterId: 'guinevere', images: { portrait: 'portrait.png' } });
  assert.equal(autosave.cancel('guinevere'), true);
  timer.run();
  await autosave.flush();
  assert.deepEqual(writes, []);
});

test('schneller Figurenwechsel verdrängt keinen ausstehenden Avatarstand der ersten Figur', async () => {
  const writes = [];
  const autosave = createCharacterImageLibraryAutosave({
    write: async snapshot => writes.push([snapshot.characterId, snapshot.images.portrait])
  });

  autosave.schedule({ characterId: 'fenrir', images: { portrait: 'fenrir-neu.png' } });
  autosave.schedule({ characterId: 'gawain', images: { portrait: 'gawain-neu.png' } });
  await autosave.flush();

  assert.deepEqual(writes, [
    ['fenrir', 'fenrir-neu.png'],
    ['gawain', 'gawain-neu.png']
  ]);
});

test('gezieltes Flush speichert nur die angeforderte Figur und bewahrt die andere Warteschlange', async () => {
  const writes = [];
  const autosave = createCharacterImageLibraryAutosave({
    write: async snapshot => writes.push(snapshot.characterId)
  });
  autosave.schedule({ characterId: 'fenrir', images: { portrait: 'fenrir.png' } });
  autosave.schedule({ characterId: 'gawain', images: { portrait: 'gawain.png' } });

  await autosave.flush('gawain');
  assert.deepEqual(writes, ['gawain']);
  await autosave.flush();
  assert.deepEqual(writes, ['gawain', 'fenrir']);
});
