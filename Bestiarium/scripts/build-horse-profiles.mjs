import { readFile, writeFile } from 'node:fs/promises';
import { HORSE_PROFILE_IDS } from '../modules/horse-profile/horse-profile-registry.mjs';
import { renderHorseProfile } from '../modules/horse-profile/horse-profile-template.mjs';

const check = process.argv.includes('--check');
const profiles = [];

for (const id of HORSE_PROFILE_IDS) {
  const directory = new URL(`../tiere/pferde/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  if (profile.id !== id) throw new Error(`Horse-profile id does not match directory: ${id}`);
  profiles.push(profile);
}

for (const [index, profile] of profiles.entries()) {
  const directory = new URL(`../tiere/pferde/${profile.id}/`, import.meta.url);
  const navigation = {
    previous: index > 0 ? profiles[index - 1] : null,
    next: index < profiles.length - 1 ? profiles[index + 1] : null
  };
  const html = renderHorseProfile(profile, navigation);
  const output = new URL('index.html', directory);

  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) throw new Error(`Generated horse profile is out of date: ${profile.id}. Run node Bestiarium/scripts/build-horse-profiles.mjs`);
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} horse profile: ${profile.id}`);
}
