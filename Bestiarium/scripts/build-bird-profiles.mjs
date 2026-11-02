import { readFile, writeFile } from 'node:fs/promises';
import { renderBirdProfile } from '../modules/bird-profile/bird-profile-template.mjs';
import { BIRD_PROFILE_IDS } from '../modules/bird-profile/bird-profile-registry.mjs';

for (const id of BIRD_PROFILE_IDS) {
  const directory = new URL(`../tiere/flugwesen/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  if (profile.id !== id) throw new Error(`Vogelprofil stimmt nicht mit dem Pfad überein: ${id}`);
  const html = renderBirdProfile(profile), output = new URL('index.html', directory);
  if (process.argv.includes('--check')) {
    if ((await readFile(output, 'utf8')).replace(/\r\n/g, '\n') !== html) throw new Error(`Veraltetes Vogelprofil: ${id}`);
  } else await writeFile(output, html);
  console.log(`${process.argv.includes('--check') ? 'Geprüft' : 'Erstellt'}: Vogelprofil ${id}`);
}
