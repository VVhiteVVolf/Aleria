import { readFile, writeFile } from 'node:fs/promises';
import { KOBOLD_PROFILE_IDS } from '../modules/kobold-profile/kobold-profile-registry.mjs';
import { renderKoboldProfile } from '../modules/kobold-profile/kobold-profile-template.mjs';

const check = process.argv.includes('--check');
const profiles = [];

for (const id of KOBOLD_PROFILE_IDS) {
  const directory = new URL(`../wesen/kobolde/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  if (profile.id !== id) throw new Error(`Kobold profile id does not match directory: ${id}`);
  profiles.push(profile);
}

for (const [index, profile] of profiles.entries()) {
  const directory = new URL(`../wesen/kobolde/${profile.id}/`, import.meta.url);
  const navigation = {
    previous: index > 0 ? profiles[index - 1] : null,
    next: index < profiles.length - 1 ? profiles[index + 1] : null
  };
  const output = new URL('index.html', directory);
  const html = renderKoboldProfile(profile, navigation);

  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) {
      throw new Error(`Generated kobold profile is out of date: ${profile.id}. Run node Bestiarium/scripts/build-kobold-profiles.mjs`);
    }
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} kobold profile: ${profile.id}`);
}
