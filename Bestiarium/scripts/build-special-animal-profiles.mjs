import { readFile, writeFile } from 'node:fs/promises';
import { SPECIAL_ANIMAL_PROFILE_IDS } from '../modules/special-animal-profile/special-animal-profile-registry.mjs';
import { renderSpecialAnimalProfile } from '../modules/special-animal-profile/special-animal-profile-template.mjs';

const check = process.argv.includes('--check');
const profiles = [];

for (const id of SPECIAL_ANIMAL_PROFILE_IDS) {
  const directory = new URL(`../tiere/besondere/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  if (profile.id !== id) throw new Error(`Special-animal profile id does not match directory: ${id}`);
  profiles.push(profile);
}

for (const [index, profile] of profiles.entries()) {
  const directory = new URL(`../tiere/besondere/${profile.id}/`, import.meta.url);
  const navigation = {
    previous: index > 0 ? profiles[index - 1] : null,
    next: index < profiles.length - 1 ? profiles[index + 1] : null
  };
  const html = renderSpecialAnimalProfile(profile, navigation);
  const output = new URL('index.html', directory);

  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) throw new Error(`Generated special-animal profile is out of date: ${profile.id}. Run node Bestiarium/scripts/build-special-animal-profiles.mjs`);
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} special-animal profile: ${profile.id}`);
}
