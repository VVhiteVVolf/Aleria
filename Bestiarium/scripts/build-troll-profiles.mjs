import { readFile, writeFile } from 'node:fs/promises';
import { TROLL_PROFILE_IDS } from '../modules/troll-profile/troll-profile-registry.mjs';
import { renderTrollProfile } from '../modules/troll-profile/troll-profile-template.mjs';

const check = process.argv.includes('--check');
const profiles = [];

for (const id of TROLL_PROFILE_IDS) {
  const directory = new URL(`../wesen/trolle/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  if (profile.id !== id) throw new Error(`Troll profile id does not match directory: ${id}`);
  profiles.push(profile);
}

for (const [index, profile] of profiles.entries()) {
  const directory = new URL(`../wesen/trolle/${profile.id}/`, import.meta.url);
  const navigation = {
    previous: index > 0 ? profiles[index - 1] : null,
    next: index < profiles.length - 1 ? profiles[index + 1] : null
  };
  const output = new URL('index.html', directory);
  const html = renderTrollProfile(profile, navigation);

  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) {
      throw new Error(`Generated troll profile is out of date: ${profile.id}. Run node Bestiarium/scripts/build-troll-profiles.mjs`);
    }
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} troll profile: ${profile.id}`);
}
