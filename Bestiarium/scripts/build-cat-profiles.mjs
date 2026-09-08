import { readFile, writeFile } from 'node:fs/promises';
import { CAT_PROFILE_IDS } from '../modules/cat-profile/cat-profile-registry.mjs';
import { renderCatProfile } from '../modules/cat-profile/cat-profile-template.mjs';

const check = process.argv.includes('--check');
const profiles = [];

for (const id of CAT_PROFILE_IDS) {
  const directory = new URL(`../tiere/vieh/haustiere/katzen/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  if (profile.id !== id) throw new Error(`Cat-profile id does not match directory: ${id}`);
  profiles.push(profile);
}

for (const [index, profile] of profiles.entries()) {
  const directory = new URL(`../tiere/vieh/haustiere/katzen/${profile.id}/`, import.meta.url);
  const navigation = {
    previous: index > 0 ? profiles[index - 1] : null,
    next: index < profiles.length - 1 ? profiles[index + 1] : null
  };
  const html = renderCatProfile(profile, navigation);
  const output = new URL('index.html', directory);

  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) throw new Error(`Generated cat profile is out of date: ${profile.id}. Run node Bestiarium/scripts/build-cat-profiles.mjs`);
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} cat profile: ${profile.id}`);
}
