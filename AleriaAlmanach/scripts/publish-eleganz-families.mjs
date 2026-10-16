import { publishFamilySnapshots } from '../../Stammbäume/tools/publish-family-snapshots.mjs';
console.log(JSON.stringify(await publishFamilySnapshots([
  'haus-raves', 'haus-veltrane', 'haus-maerllys', 'haus-coeddu',
  'haus-trevoryn', 'haus-svathamar', 'haus-dubhdarach', 'haus-tonnarth'
], { apply: process.argv.includes('--apply') })));
