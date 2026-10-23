import {buildTerritoryRegion} from './territory-region-build.mjs';
await buildTerritoryRegion({slug:'vennyr',region:'Vennyr',kingdom:'Vennyr',mapFolder:'Vennyr',version:'preparation-20261022',check:process.argv.includes('--check')});
