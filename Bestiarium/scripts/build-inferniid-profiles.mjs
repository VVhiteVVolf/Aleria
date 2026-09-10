import { readFile, writeFile } from 'node:fs/promises';
import { INFERNIID_PROFILE_IDS } from '../modules/inferniid-profile/inferniid-profile-registry.mjs';
import { renderArchdevilOverview, renderInferniidProfile } from '../modules/inferniid-profile/inferniid-profile-template.mjs';

const check = process.argv.includes('--check');
const profiles = [];

for (const id of INFERNIID_PROFILE_IDS) {
  const directory = new URL(`../wesen/inferniiden/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  if (profile.id !== id) throw new Error(`Inferniid profile id does not match directory: ${id}`);
  profiles.push(profile);
}

async function writeOrCheck(output, html, label) {
  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) throw new Error(`Generated ${label} is out of date. Run node Bestiarium/scripts/build-inferniid-profiles.mjs`);
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} ${label}`);
}

for (const [index, profile] of profiles.entries()) {
  const directory = new URL(`../wesen/inferniiden/${profile.id}/`, import.meta.url);
  const navigation = {
    previous: index > 0 ? profiles[index - 1] : null,
    next: index < profiles.length - 1 ? profiles[index + 1] : null
  };
  await writeOrCheck(new URL('index.html', directory), renderInferniidProfile(profile, navigation), `Inferniid profile: ${profile.id}`);
}

const archdevilDirectory = new URL('../wesen/gruppen/erzteufel/', import.meta.url);
const archdevil = JSON.parse(await readFile(new URL('profil.json', archdevilDirectory), 'utf8'));
if (archdevil.id !== 'erzteufel') throw new Error('Archdevil overview id does not match directory: erzteufel');
await writeOrCheck(new URL('index.html', archdevilDirectory), renderArchdevilOverview(archdevil), 'archdevil overview');
