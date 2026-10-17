import { publishFamilySnapshots } from '../../Stammbäume/tools/publish-family-snapshots.mjs';

// Versioned repository snapshots only; existing live character records are untouched.
console.log(JSON.stringify(await publishFamilySnapshots([
  'haus-gofrann', 'haus-tlawd', 'haus-vann', 'haus-maerllys', 'haus-pendrwn', 'haus-raves'
], { apply: process.argv.includes('--apply') })));
