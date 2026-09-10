import { readFile, writeFile } from 'node:fs/promises';
import { NECROPHAGE_PROFILE_IDS } from '../modules/necrophage-profile/necrophage-profile-registry.mjs';
import { renderNecrophageProfile } from '../modules/necrophage-profile/necrophage-profile-template.mjs';

const check = process.argv.includes('--check');
const profiles = [];

for (const id of NECROPHAGE_PROFILE_IDS) {
  const directory = new URL(`../wesen/nekrophagen/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  if (profile.id !== id) throw new Error(`Necrophage profile id does not match directory: ${id}`);
  profiles.push(profile);
}

for (const [index, profile] of profiles.entries()) {
  const directory = new URL(`../wesen/nekrophagen/${profile.id}/`, import.meta.url);
  const navigation = {
    previous: index > 0 ? profiles[index - 1] : null,
    next: index < profiles.length - 1 ? profiles[index + 1] : null
  };
  const output = new URL('index.html', directory);
  const html = renderNecrophageProfile(profile, navigation);

  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) {
      throw new Error(`Generated necrophage profile is out of date: ${profile.id}. Run node Bestiarium/scripts/build-necrophage-profiles.mjs`);
    }
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} necrophage profile: ${profile.id}`);
}
