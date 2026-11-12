export const DRAIG_GARDE_TASKS = [{
  id: 'draig-garde', label: 'Draig guard hierarchy, supplied avatar sets and new commoner households',
  inputs: ['AleriaAlmanach/modules/draig-leibgarde/', 'AleriaAlmanach/assets/draig-leibgarde/',
    'AleriaAlmanach/scripts/build-draig-garde-module.mjs',
    'AleriaAlmanach/AvatarWerkstatt/Anleitungen/avatar-prompt-sets.json',
    'Stammbäume/assets/js/data/draig-garde-house-families.js', 'Stammbäume/assets/js/data/draig-garde-people.js',
    'AleriaAlmanach/tests/draig-garde-module.test.mjs', 'AleriaAlmanach/tests/draig-garde-supplied-avatars.test.mjs',
    'Stammbäume/tests/draig-garde-house-families.test.js'],
  commands: [['AleriaAlmanach/scripts/build-draig-garde-module.mjs'],
    ['--test', '--experimental-test-isolation=none', 'AleriaAlmanach/tests/draig-garde-module.test.mjs',
      'AleriaAlmanach/tests/draig-garde-supplied-avatars.test.mjs', 'Stammbäume/tests/draig-garde-house-families.test.js']],
}];
