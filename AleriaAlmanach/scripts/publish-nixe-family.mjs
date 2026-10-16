import { publishFamilySnapshots } from '../../Stammbäume/tools/publish-family-snapshots.mjs';
console.log(JSON.stringify(await publishFamilySnapshots(['haus-sonnenfels'], { apply: process.argv.includes('--apply') })));
