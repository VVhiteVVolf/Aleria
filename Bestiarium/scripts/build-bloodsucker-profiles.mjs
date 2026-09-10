import { readFile, writeFile } from 'node:fs/promises';
import { BLOODSUCKER_PROFILE_IDS } from '../modules/bloodsucker-profile/bloodsucker-profile-registry.mjs';
import { renderBloodsuckerGroup, renderBloodsuckerProfile } from '../modules/bloodsucker-profile/bloodsucker-profile-template.mjs';

const check = process.argv.includes('--check');
const profiles = [];

for (const id of BLOODSUCKER_PROFILE_IDS) {
  const directory = new URL(`../wesen/blutsauger/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  if (profile.id !== id) throw new Error(`Bloodsucker profile id does not match directory: ${id}`);
  profiles.push(profile);
}

async function writeOrCheck(output, html, description) {
  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) {
      throw new Error(`Generated ${description} is out of date. Run node Bestiarium/scripts/build-bloodsucker-profiles.mjs`);
    }
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} ${description}`);
}

for (const [index, profile] of profiles.entries()) {
  const directory = new URL(`../wesen/blutsauger/${profile.id}/`, import.meta.url);
  const navigation = {
    previous: index > 0 ? profiles[index - 1] : null,
    next: index < profiles.length - 1 ? profiles[index + 1] : null
  };
  await writeOrCheck(new URL('index.html', directory), renderBloodsuckerProfile(profile, navigation), `bloodsucker profile: ${profile.id}`);
}

const groupDirectory = new URL('../wesen/gruppen/blutsauger/', import.meta.url);
const group = JSON.parse(await readFile(new URL('profil.json', groupDirectory), 'utf8'));
await writeOrCheck(new URL('index.html', groupDirectory), renderBloodsuckerGroup(group), 'bloodsucker group profile');
