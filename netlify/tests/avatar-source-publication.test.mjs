import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldPublish } from '../build/site-publish.mjs';

test('the two Gwen Hamnett workshop trees remain Git sources without static delivery', () => {
  for (const root of ['AleriaAlmanach/AvatarWerkstatt/Charaktere/Einzelcharaktere/Gwen Hamnett/',
    'AleriaAlmanach/AvatarWerkstatt/Output/Gwen Hamnett/']) {
    for (const file of ['Referenzen/portrait.png', 'Sheets/reactions.png', 'Prompts/generation.json',
      'Output/avatar.png', 'avatar.png']) assert.equal(shouldPublish(root + file), false, root + file);
  }
});

test('Gwen source exclusions preserve other workshop outputs and public character portraits', () => {
  for (const file of ['AleriaAlmanach/AvatarWerkstatt/Output/Gareth Swyll/avatar.png',
    'AleriaAlmanach/AvatarWerkstatt/Charaktere/Einzelcharaktere/Gwen Hamnett Zusatz/Output/avatar.png',
    'AleriaAlmanach/assets/biographies/patrick-20261103/originals/gwen-hamnett.jpeg']) {
    assert.equal(shouldPublish(file), true, file);
  }
});
