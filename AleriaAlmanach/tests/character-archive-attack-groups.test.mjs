import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getCharacterArchiveAttackGroups,
  isCharacterArchiveCombatAbility,
  matchesCharacterArchiveKind
} from '../modules/character-archive/character-archive-attack-groups.js';

const parents = [
  {
    id: 'builtin--combat-style--drachentanz-form-i-jungdrache',
    kind: 'combat-style',
    name: 'Drachentanz Form I · Tanz des Jungdrachens',
    description: 'Die erste Form des Drachentanzes.',
    data: { id: 'drachentanz-form-i-jungdrache' },
    sources: []
  },
  {
    id: 'builtin--class--teulu',
    kind: 'class',
    name: 'Teulu',
    description: 'Klassischer Ritter Cenyrs.',
    data: { id: 'teulu' },
    sources: [{ kind: 'system', id: 'teulu', name: 'Aleria-Regelvorlagen' }]
  },
  {
    id: 'builtin--class--helwyr',
    kind: 'class',
    name: 'Helwyr',
    description: 'Fernkämpfender Ritter Cenyrs.',
    data: { id: 'helwyr' },
    sources: [{ kind: 'system', id: 'helwyr', name: 'Aleria-Regelvorlagen' }]
  }
];

test('Kampfformzuordnung gewinnt vor einer zusätzlichen Klassenquelle', () => {
  const technique = {
    id: 'biss-des-jungdrachens',
    key: 'technique::biss des jungdrachens',
    kind: 'technique',
    name: 'Biss des Jungdrachens',
    data: {
      trainingForm: 'Drachentanz Form I · Tanz des Jungdrachens',
      combatStyleFormId: 'drachentanz-form-i-jungdrache',
      sourceClassId: 'teulu'
    },
    sources: [{ kind: 'class', id: 'teulu', name: 'Teulu' }]
  };
  const groups = getCharacterArchiveAttackGroups([technique], [...parents, technique]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].type, 'combat-form');
  assert.equal(groups[0].name, 'Drachentanz Form I · Tanz des Jungdrachens');
  assert.deepEqual(groups[0].entries.map(entry => entry.name), ['Biss des Jungdrachens']);
});

test('klassenspezifische Attacken werden unter allen expliziten Klassenquellen geführt', () => {
  const attack = {
    id: 'ritterschwert',
    key: 'attack::ritterschwert',
    kind: 'attack',
    name: 'Ritterschwert',
    data: { weaponType: 'sword' },
    sources: [
      { kind: 'class', id: 'teulu', name: 'Teulu' },
      { kind: 'class', id: 'helwyr', name: 'Helwyr' }
    ]
  };
  const groups = getCharacterArchiveAttackGroups([attack], [...parents, attack]);
  assert.deepEqual(groups.map(group => group.name), ['Helwyr', 'Teulu']);
  assert.ok(groups.every(group => group.type === 'class'));
  assert.ok(groups.every(group => group.entries[0] === attack));
});

test('charaktereigene Kampffähigkeiten landen gemeinsam bei besonderen Attacken', () => {
  const ability = {
    id: 'arkaner-schrei',
    key: 'ability::arkaner schrei',
    kind: 'ability',
    name: 'Arkaner Schrei',
    data: { combatUsable: true, sourceClassId: 'skalde' },
    sources: [{ kind: 'character', id: 'freya', name: 'Freya Skald' }]
  };
  assert.equal(isCharacterArchiveCombatAbility(ability), true);
  assert.equal(matchesCharacterArchiveKind(ability, 'technique'), true);
  const groups = getCharacterArchiveAttackGroups([ability], [...parents, ability]);
  assert.equal(groups[0].type, 'special');
  assert.equal(groups[0].name, 'Besondere & einzigartige Attacken');
});

test('persönliche Angriffe und allgemeine Systemangriffe bleiben getrennte Sammelgruppen', () => {
  const personal = {
    id: 'drachenatem',
    key: 'attack::drachenatem',
    kind: 'attack',
    name: 'Drachenatem',
    data: {},
    sources: [{ kind: 'creature', id: 'drache', name: 'Alter Drache' }]
  };
  const general = {
    id: 'improvisierter-angriff',
    key: 'attack::improvisierter angriff',
    kind: 'attack',
    name: 'Improvisierter Angriff',
    data: {},
    builtin: true,
    sources: [{ kind: 'system', id: 'combat', name: 'Grundregeln' }]
  };
  const groups = getCharacterArchiveAttackGroups([personal, general], [...parents, personal, general]);
  assert.deepEqual(groups.map(group => group.type), ['special', 'general']);
  assert.deepEqual(groups.map(group => group.entries[0].name), ['Drachenatem', 'Improvisierter Angriff']);
});

test('ein frei angelegter eigener Angriff gilt ohne weitere Metadaten als besondere Attacke', () => {
  const custom = {
    id: 'eigene-attacke',
    key: 'technique::eigene attacke',
    kind: 'technique',
    name: 'Eigene Attacke',
    data: {},
    builtin: false,
    sources: []
  };
  const groups = getCharacterArchiveAttackGroups([custom], [...parents, custom]);
  assert.equal(groups[0].type, 'special');
});
