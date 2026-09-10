import { readFile, writeFile } from 'node:fs/promises';
import { OGROID_PROFILE_IDS } from '../modules/ogroid-profile/ogroid-profile-registry.mjs';
import { renderOgroidProfile } from '../modules/ogroid-profile/ogroid-profile-template.mjs';

const check = process.argv.includes('--check');
const profiles = [];

for (const id of OGROID_PROFILE_IDS) {
  const directory = new URL(`../wesen/ogroiden/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  if (profile.id !== id) throw new Error(`Ogroid profile id does not match directory: ${id}`);
  profiles.push(profile);
}

for (const [index, profile] of profiles.entries()) {
  const directory = new URL(`../wesen/ogroiden/${profile.id}/`, import.meta.url);
  const navigation = {
    previous: index > 0 ? profiles[index - 1] : null,
    next: index < profiles.length - 1 ? profiles[index + 1] : null
  };
  const output = new URL('index.html', directory);
  const html = renderOgroidProfile(profile, navigation);

  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) {
      throw new Error(`Generated ogroid profile is out of date: ${profile.id}. Run node Bestiarium/scripts/build-ogroid-profiles.mjs`);
    }
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} ogroid profile: ${profile.id}`);
}
