const test = (...files) => ['--test', '--experimental-test-isolation=none', ...files];
export const COMMENT_PRESENTATION_TASKS = [
  {
    id: 'comment-foreign-voice', label: 'Incidental speakers, their avatars and authoritative comment validation',
    inputs: ['AleriaAlmanach/modules/comments/', 'AleriaAlmanach/modules/characters/character-comment-picker.js',
      'assets/source/comment-foreign-voice/',
      'AleriaAlmanach/styles/comments-foreign-voice.css', 'AleriaAlmanach/public/assets/comment-foreign-voice/',
      'AleriaAlmanach/public/assets/comment-icons/foreign-voice.png', 'AleriaAlmanach/AleriaAlmanach.html',
      'AleriaAlmanach/tests/comment-foreign-voice.test.mjs', 'AleriaAlmanach/tests/fixtures/comment-foreign-voice-fixture.mjs',
      'firebase/functions/src/comments/', 'firebase/functions/src/generated/comments/',
      'firebase/functions/tests/foreign-voice-comment.test.js', 'firebase/functions/package.json', 'firebase/functions/package-lock.json'],
    commands: [['netlify/build/prepare-runtime-checks.mjs', '--scope=firebase'],
      test('AleriaAlmanach/tests/comment-foreign-voice.test.mjs', 'firebase/functions/tests/foreign-voice-comment.test.js')],
  },
  {
    id: 'topic-board-planning', label: 'Shared play planning, undated ideas, filtering and accessible presentation',
    inputs: ['AleriaAlmanach/modules/topic-board/', 'AleriaAlmanach/modules/world-date/',
      'AleriaAlmanach/styles/topic-board.css', 'AleriaAlmanach/styles/topic-board-cards.css',
      'AleriaAlmanach/styles/topic-board-editor.css', 'AleriaAlmanach/styles/topic-board-overview.css',
      'AleriaAlmanach/styles/topic-board-participants.css', 'AleriaAlmanach/AleriaAlmanach.html',
      'AleriaAlmanach/tests/topic-board-model.test.mjs', 'AleriaAlmanach/tests/topic-board-list-state.test.mjs',
      'AleriaAlmanach/tests/topic-board-schedule.test.mjs', 'AleriaAlmanach/tests/topic-board-planning.test.mjs',
      'AleriaAlmanach/tests/topic-board-overview.test.mjs', 'AleriaAlmanach/tests/world-date.test.mjs'],
    commands: [test(...['topic-board-model','topic-board-list-state','topic-board-schedule',
      'topic-board-planning','topic-board-overview','world-date'].map(name => `AleriaAlmanach/tests/${name}.test.mjs`))],
  },
];
