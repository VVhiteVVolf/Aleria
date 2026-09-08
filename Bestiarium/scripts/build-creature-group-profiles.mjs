import { readFile, writeFile } from 'node:fs/promises';
import { CREATURE_GROUP_PROFILE_IDS } from '../modules/creature-group-profile/creature-group-profile-registry.mjs';
import { renderCreatureGroupProfile } from '../modules/creature-group-profile/creature-group-profile-template.mjs';

const check = process.argv.includes('--check');
const profiles = [];

for (const id of CREATURE_GROUP_PROFILE_IDS) {
  const directory = new URL(`../wesen/gruppen/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  if (profile.id !== id) throw new Error(`Creature-group profile id does not match directory: ${id}`);
  profiles.push(profile);
}

for (const [index, profile] of profiles.entries()) {
  const directory = new URL(`../wesen/gruppen/${profile.id}/`, import.meta.url);
  const navigation = {
    previous: index > 0 ? profiles[index - 1] : null,
    next: index < profiles.length - 1 ? profiles[index + 1] : null
  };
  const html = renderCreatureGroupProfile(profile, navigation);
  const output = new URL('index.html', directory);

  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) throw new Error(`Generated creature-group profile is out of date: ${profile.id}. Run node Bestiarium/scripts/build-creature-group-profiles.mjs`);
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} creature-group profile: ${profile.id}`);
}
