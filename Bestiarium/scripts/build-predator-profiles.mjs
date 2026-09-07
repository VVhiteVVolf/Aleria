import { readFile, writeFile } from 'node:fs/promises';
import { PREDATOR_GROUPS } from '../modules/predator-profile/predator-registry.mjs';
import { renderPredatorOverview } from '../modules/predator-profile/predator-overview-template.mjs';
import { renderPredatorProfile } from '../modules/predator-profile/predator-profile-template.mjs';

const check = process.argv.includes('--check');

async function verifyOrWrite(output, html, label) {
  if (check) {
    const existing = (await readFile(output, 'utf8')).replace(/\r\n/g, '\n');
    if (existing !== html) throw new Error(`${label} is out of date. Run node Bestiarium/scripts/build-predator-profiles.mjs`);
  } else {
    await writeFile(output, html, 'utf8');
  }
  console.log(`${check ? 'Checked' : 'Built'} ${label}`);
}

for (const group of PREDATOR_GROUPS) {
  const directory = new URL(`../tiere/raubtiere/${group.id}/`, import.meta.url);
  const overview = JSON.parse(await readFile(new URL('uebersicht.json', directory), 'utf8'));
  if (overview.id !== group.id) throw new Error(`Predator overview id does not match directory: ${group.id}`);
  await verifyOrWrite(new URL('index.html', directory), renderPredatorOverview(overview), `predator overview: ${group.id}`);

  const profiles = [];
  for (const id of group.profileIds) {
    const profileDirectory = new URL(`${id}/`, directory);
    const profile = JSON.parse(await readFile(new URL('profil.json', profileDirectory), 'utf8'));
    if (profile.id !== id || profile.group.id !== group.id) throw new Error(`Predator-profile registry mismatch: ${group.id}/${id}`);
    profiles.push(profile);
  }

  for (const [index, profile] of profiles.entries()) {
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };
    const profileDirectory = new URL(`${profile.id}/`, directory);
    await verifyOrWrite(new URL('index.html', profileDirectory), renderPredatorProfile(profile, navigation), `predator profile: ${group.id}/${profile.id}`);
  }
}
