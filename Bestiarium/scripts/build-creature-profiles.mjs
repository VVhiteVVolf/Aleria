import { readFile, writeFile } from 'node:fs/promises';
import { CREATURE_PROFILE_IDS } from '../modules/creature-profile/profile-registry.mjs';
import { renderCreatureProfile } from '../modules/creature-profile/profile-template.mjs';

const check = process.argv.includes('--check');
for (const id of CREATURE_PROFILE_IDS) {
  const directory = new URL(`../wesen/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  if (profile.id !== id) throw new Error(`Profile id does not match directory: ${id}`);
  const html = renderCreatureProfile(profile);
  const output = new URL('index.html', directory);
  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) throw new Error(`Generated profile is out of date: ${id}. Run node Bestiarium/scripts/build-creature-profiles.mjs`);
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} Bestiarium profile: ${id}`);
}
