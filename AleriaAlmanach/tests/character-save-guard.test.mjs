import assert from 'node:assert/strict';
import test from 'node:test';

import {
  detectStaleCharacterFields,
  prepareCharacterDocumentWrite,
  selectCharacterArchiveStatusWrite,
  selectCharacterGenealogyWrite,
  selectCharacterImageLibraryWrite,
  shouldBlockCharacterWriteDuringEncounter,
  stampFreshRevisions,
  selectChangedSections
} from '../modules/characters/character-save-guard.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

test('sanitizeCharacterCombatProfile bewahrt eine mitgegebene Revision und faellt sonst auf 0 zurueck', () => {
  assert.equal(sanitizeCharacterCombatProfile({}).revision, 0);
  assert.equal(sanitizeCharacterCombatProfile({ revision: 1723000000000 }).revision, 1723000000000);
  assert.equal(sanitizeCharacterCombatProfile({ revision: -5 }).revision, 0, 'negative Werte werden auf 0 gekappt');
});

test('detectStaleCharacterFields erkennt ein veraltetes Kampfprofil, laesst frische oder fehlende Felder aber durch', () => {
  const currentDoc = { combatProfile: { revision: 200 }, inventory: { revision: 50 } };

  const staleWrite = { combatProfile: { revision: 100 } };
  assert.deepEqual(detectStaleCharacterFields(currentDoc, staleWrite), ['Kampfprofil']);

  const freshWrite = { combatProfile: { revision: 300 } };
  assert.deepEqual(detectStaleCharacterFields(currentDoc, freshWrite), []);

  const unrelatedWrite = { name: 'Neuer Titel' };
  assert.deepEqual(detectStaleCharacterFields(currentDoc, unrelatedWrite), [], 'ein Speichervorgang ohne combatProfile/inventory wird nicht blockiert');
});

test('eine Kampfsperre blockiert Kampfprofil und Inventar, aber keine reine Bildspeicherung', () => {
  const encounterKeys = ['encounter-1'];
  assert.equal(shouldBlockCharacterWriteDuringEncounter({ combatProfile: {} }, encounterKeys), true);
  assert.equal(shouldBlockCharacterWriteDuringEncounter({ inventory: {} }, encounterKeys), true);
  assert.equal(shouldBlockCharacterWriteDuringEncounter({ imageSets: [], portrait: null }, encounterKeys), false);
  assert.equal(shouldBlockCharacterWriteDuringEncounter({ inventory: null }, encounterKeys), true, 'auch ein Lösch-Patch ist kampfrelevant');
  assert.equal(shouldBlockCharacterWriteDuringEncounter({ combatProfile: {} }, []), false);
});

test('detectStaleCharacterFields prueft Kampfprofil und Inventar unabhaengig voneinander', () => {
  const currentDoc = { combatProfile: { revision: 200 }, inventory: { revision: 200 } };
  const bothStale = { combatProfile: { revision: 100 }, inventory: { revision: 100 } };
  assert.deepEqual(detectStaleCharacterFields(currentDoc, bothStale), ['Kampfprofil', 'Inventar']);

  const onlyInventoryStale = { combatProfile: { revision: 250 }, inventory: { revision: 100 } };
  assert.deepEqual(detectStaleCharacterFields(currentDoc, onlyInventoryStale), ['Inventar']);
});

test('detectStaleCharacterFields behandelt ein frisch angelegtes Dokument (keine Revision) als nicht veraltet', () => {
  assert.deepEqual(detectStaleCharacterFields(null, { combatProfile: { revision: 5 } }), []);
  assert.deepEqual(detectStaleCharacterFields({}, { combatProfile: { revision: 5 } }), []);
});

test('stampFreshRevisions setzt eine neue Revision auf vorhandene Felder, ohne andere Felder zu veraendern', () => {
  const stamped = stampFreshRevisions({ name: 'Rhiannon', combatProfile: { revision: 1 }, inventory: { revision: 1 } }, ['combatProfile', 'inventory'], 999);
  assert.equal(stamped.name, 'Rhiannon');
  assert.equal(stamped.combatProfile.revision, 999);
  assert.equal(stamped.inventory.revision, 999);
});

test('stampFreshRevisions laesst ein Dokument ohne combatProfile/inventory unangetastet', () => {
  const stamped = stampFreshRevisions({ name: 'Rhiannon' }, ['combatProfile', 'inventory'], 999);
  assert.deepEqual(stamped, { name: 'Rhiannon' });
});

test('eine neue Revision bleibt auch bei gleicher oder rueckwaertiger Client-Uhr monoton', () => {
  const prepared = prepareCharacterDocumentWrite(
    { inventory: { revision: 1000, items: [] }, combatProfile: { revision: 900 } },
    { inventory: { revision: 1000, items: [{ id: 'sword' }] } },
    { userId: 'owner', now: 999 }
  );
  assert.equal(prepared.data.inventory.revision, 1001);
});

test('Avatar-Patches enthalten niemals Profil, Inventar oder Charakterbogen', () => {
  const write = selectCharacterImageLibraryWrite({
    name: 'Fenrir',
    bio: 'Darf nicht mitgeschrieben werden',
    imageSetSchemaVersion: 1,
    imageSets: [{ id: 'standard', emotes: [] }],
    activeImageSetId: 'standard',
    portrait: 'fenrir.png',
    emotes: [],
    emotesOverride: true,
    imageSetsOverride: true,
    inventory: { revision: 20 },
    combatProfile: { revision: 30 },
    updatedAt: '2026-08-08T12:00:00.000Z'
  });
  assert.deepEqual(Object.keys(write), [
    'imageSetSchemaVersion', 'imageSets', 'activeImageSetId', 'portrait', 'emotes',
    'emotesOverride', 'imageSetsOverride', 'updatedAt'
  ]);
  assert.equal('name' in write, false);
  assert.equal('inventory' in write, false);
  assert.equal('combatProfile' in write, false);
});

test('Archiv- und Genealogieaktionen besitzen ebenfalls harte Feldgrenzen', () => {
  const source = {
    name: 'Gawain',
    archived: true,
    identity: { worldPersonId: 'gawain' },
    genealogy: { houseName: 'Draig' },
    imageSets: [{ id: 'standard' }],
    inventory: { revision: 1 },
    combatProfile: { revision: 1 },
    updatedAt: '2026-08-08T12:00:00.000Z'
  };
  assert.deepEqual(selectCharacterArchiveStatusWrite(source), {
    archived: true,
    updatedAt: source.updatedAt
  });
  assert.deepEqual(selectCharacterGenealogyWrite(source), {
    identity: source.identity,
    genealogy: source.genealogy,
    updatedAt: source.updatedAt
  });
});

test('ein normaler Profilspeichervorgang bleibt ein gezielter Merge', () => {
  const prepared = prepareCharacterDocumentWrite(
    { name: 'Fenrir', ownerUid: 'owner', legacyField: 'bleibt bestehen' },
    { name: 'Fenrir Varulv', bio: 'Aktualisiert' },
    { userId: 'editor', now: 999 }
  );

  assert.equal(prepared.merge, true);
  assert.deepEqual(prepared.data, { name: 'Fenrir Varulv', bio: 'Aktualisiert' });
});

test('ein Vollimport ersetzt das Dokument, bewahrt aber dessen Besitzdaten', () => {
  const prepared = prepareCharacterDocumentWrite(
    {
      name: 'Fenrir',
      ownerUid: 'original-owner',
      createdBy: 'original-creator',
      legacyField: 'muss verschwinden'
    },
    {
      name: 'Fenrir Varulv',
      inventory: { revision: 1, items: [{ id: 'greataxe' }] },
      combatProfile: { revision: 1, weapons: [{ id: 'greataxe' }] }
    },
    { userId: 'editor', replaceExisting: true, now: 999 }
  );

  assert.equal(prepared.merge, false, 'Firestore muss den alten Datensatz vollstaendig ersetzen');
  assert.equal(prepared.data.ownerUid, 'original-owner');
  assert.equal(prepared.data.createdBy, 'original-creator');
  assert.equal('legacyField' in prepared.data, false, 'nicht importierte Altfelder duerfen nicht erneut geschrieben werden');
  assert.equal(prepared.data.inventory.revision, 999);
  assert.equal(prepared.data.combatProfile.revision, 999);
});

test('ein Vollimport bewahrt vorhandene Bildsets und vereinigt Emotes desselben Sets', () => {
  const prepared = prepareCharacterDocumentWrite(
    {
      ownerUid: 'owner',
      imageSets: [
        {
          id: 'standard', name: 'Standard', portrait: 'alt.png',
          emotes: [{ img: 'eins.png', label: 'Alt' }]
        },
        {
          id: 'kampf', name: 'Kampf', portrait: 'kampf.png',
          emotes: [{ img: 'kampf-emote.png', label: 'Zornig' }]
        }
      ],
      activeImageSetId: 'kampf',
      portrait: 'alt.png',
      emotes: [{ img: 'eins.png', label: 'Alt' }]
    },
    {
      name: 'Fenrir',
      imageSets: [{
        id: 'standard', name: 'Standard', portrait: 'neu.png',
        emotes: [
          { img: 'eins.png', label: 'Aktualisiert' },
          { img: 'zwei.png', label: 'Neu' }
        ]
      }],
      activeImageSetId: 'standard',
      combatProfile: { weapons: [{ id: 'greataxe' }] }
    },
    { userId: 'owner', replaceExisting: true, now: 999 }
  );

  assert.equal(prepared.merge, false);
  assert.deepEqual(prepared.data.imageSets.map(set => set.id), ['standard', 'kampf']);
  assert.deepEqual(prepared.data.imageSets[0].emotes, [
    { img: 'eins.png', label: 'Aktualisiert' },
    { img: 'zwei.png', label: 'Neu' }
  ]);
  assert.equal(prepared.data.imageSets[1].emotes[0].img, 'kampf-emote.png');
  assert.equal(prepared.data.portrait, 'neu.png');
  assert.equal(prepared.data.emotes.length, 2);
  assert.equal(prepared.data.combatProfile.weapons[0].id, 'greataxe');
});

test('nur eine ausdrueckliche Medienersetzung darf serverseitige Bildsets entfernen', () => {
  const prepared = prepareCharacterDocumentWrite(
    {
      ownerUid: 'owner',
      imageSets: [
        { id: 'standard', name: 'Standard', emotes: [] },
        { id: 'kampf', name: 'Kampf', emotes: [{ img: 'kampf.png' }] }
      ]
    },
    {
      name: 'Fenrir',
      imageSets: [{ id: 'standard', name: 'Standard', emotes: [] }]
    },
    { userId: 'owner', replaceExisting: true, replaceImageLibrary: true, now: 999 }
  );

  assert.deepEqual(prepared.data.imageSets.map(set => set.id), ['standard']);
});

test('der Verlustschutz bewahrt bis zu zwanzig bereits vorhandene Bildsets', () => {
  const currentSets = [
    { id: 'standard', name: 'Standard', emotes: [] },
    ...Array.from({ length: 14 }, (_, index) => ({
      id: `set-${index + 2}`,
      name: `Set ${index + 2}`,
      emotes: [{ img: `https://i.imgur.com/${index + 2}.png` }]
    }))
  ];
  const prepared = prepareCharacterDocumentWrite(
    { ownerUid: 'owner', imageSets: currentSets },
    { name: 'Fenrir', imageSets: [{ id: 'standard', name: 'Standard', emotes: [] }] },
    { userId: 'owner', replaceExisting: true, now: 999 }
  );
  assert.equal(prepared.data.imageSets.length, 15);
  assert.equal(prepared.data.imageSets.at(-1).id, 'set-15');
});

test('ein Import mit neuer fester ID erhaelt die aktuelle Nutzerkennung', () => {
  const prepared = prepareCharacterDocumentWrite(
    null,
    { name: 'Neue Figur', combatProfile: { revision: 0 } },
    { userId: 'current-user', replaceExisting: true, now: 999 }
  );

  assert.equal(prepared.merge, false);
  assert.equal(prepared.data.ownerUid, 'current-user');
  assert.equal(prepared.data.createdBy, 'current-user');
  assert.equal(prepared.data.combatProfile.revision, 999);
});

test('selectChangedSections meldet nur echte Aenderungen - ein reiner Avatar-Upload laesst Kampfprofil/Inventar unberuehrt', () => {
  const baseline = {
    images: { portrait: 'alt.png', emotes: [] },
    inventory: { items: [{ id: 'sword' }] },
    combatProfile: { weapons: [{ id: 'axe' }] }
  };
  // Nur das Bild wurde tatsaechlich veraendert, Inventar/Kampfprofil kommen unveraendert
  // aus dem (potenziell veralteten) Formularzustand zurueck.
  const current = {
    images: { portrait: 'neu.png', emotes: [] },
    inventory: { items: [{ id: 'sword' }] },
    combatProfile: { weapons: [{ id: 'axe' }] }
  };
  assert.deepEqual(selectChangedSections(current, baseline, ['images', 'inventory', 'combatProfile']), ['images']);
});

test('Profil, Avatare, Inventar und Charakterbogen werden als vier getrennte Schreibbereiche erkannt', () => {
  const baseline = {
    profile: { name: 'Fenrir', bio: 'Alt' },
    images: { portrait: 'fenrir.png', imageSets: [] },
    inventory: { revision: 10, items: [{ id: 'axe' }] },
    combatProfile: { revision: 10, weapons: [{ id: 'axe' }] }
  };
  const sectionNames = ['profile', 'images', 'inventory', 'combatProfile'];

  for (const sectionName of sectionNames) {
    const current = structuredClone(baseline);
    current[sectionName] = { ...current[sectionName], auditMarker: sectionName };
    assert.deepEqual(
      selectChangedSections(current, baseline, sectionNames),
      [sectionName],
      `${sectionName} darf keinen anderen Bereich in den Schreibvorgang ziehen`
    );
  }
});

test('selectChangedSections erkennt Aenderungen in mehreren Abschnitten gleichzeitig', () => {
  const baseline = { images: { a: 1 }, inventory: { a: 1 }, combatProfile: { a: 1 } };
  const current = { images: { a: 1 }, inventory: { a: 2 }, combatProfile: { a: 2 } };
  assert.deepEqual(selectChangedSections(current, baseline, ['images', 'inventory', 'combatProfile']), ['inventory', 'combatProfile']);
});

test('ein importierter Charakterbogen wird gegen den zuvor geladenen Serverstand verglichen', () => {
  const persistedBaseline = {
    images: { portrait: 'fenrir-alt.png' },
    inventory: { items: [{ id: 'placeholder-weapon', name: 'Hauptwaffe' }] },
    combatProfile: { weapons: [{ id: 'default-unarmed-melee', name: 'Nahkampf' }] }
  };
  const importedDraft = {
    images: { portrait: 'fenrir-neu.png' },
    inventory: { items: [{ id: 'fenrir-greataxe', name: 'Großaxt' }] },
    combatProfile: {
      weapons: [
        { id: 'default-unarmed-melee', name: 'Nahkampf' },
        { id: 'fenrir-greataxe', name: 'Großaxt' },
        { id: 'fenrir-throwing-axe', name: 'Wurfaxt' }
      ]
    }
  };
  assert.deepEqual(
    selectChangedSections(importedDraft, persistedBaseline, ['images', 'inventory', 'combatProfile']),
    ['images', 'inventory', 'combatProfile'],
    'die importierten Waffen müssen beim unmittelbaren Vollspeichern als Änderung vorliegen'
  );
});

test('selectChangedSections behandelt eine fehlende Baseline (neu angelegte Figur) als "alles geaendert"', () => {
  const current = { images: { a: 1 }, inventory: { a: 1 }, combatProfile: { a: 1 } };
  assert.deepEqual(selectChangedSections(current, null, ['images', 'inventory', 'combatProfile']), ['images', 'inventory', 'combatProfile']);
});

test('detectStaleCharacterFields funktioniert mit eigenen Feldnamen (Kreaturen: loot statt inventory)', () => {
  const currentDoc = { combatProfile: { revision: 200 }, loot: { revision: 50 } };
  const staleLoot = { combatProfile: { revision: 200 }, loot: { revision: 10 } };
  assert.deepEqual(
    detectStaleCharacterFields(currentDoc, staleLoot, { combatProfile: 'Kampfprofil', loot: 'Beute' }),
    ['Beute']
  );
});

test('stampFreshRevisions funktioniert mit eigener Feldliste (Kreaturen: loot statt inventory)', () => {
  const stamped = stampFreshRevisions({ name: 'Wolf', combatProfile: { revision: 1 }, loot: { revision: 1 } }, ['combatProfile', 'loot'], 999);
  assert.equal(stamped.combatProfile.revision, 999);
  assert.equal(stamped.loot.revision, 999);
});

test('selectChangedSections meldet keine Aenderung, wenn ueberhaupt nichts angefasst wurde', () => {
  const baseline = { images: { a: 1 }, inventory: { a: 1 }, combatProfile: { a: 1 } };
  const current = { images: { a: 1 }, inventory: { a: 1 }, combatProfile: { a: 1 } };
  assert.deepEqual(selectChangedSections(current, baseline, ['images', 'inventory', 'combatProfile']), []);
});
