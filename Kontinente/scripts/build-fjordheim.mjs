import {buildTerritoryRegion} from './territory-region-build.mjs';
await buildTerritoryRegion({slug:'fjordheim',region:'Fjordheim',kingdom:'Fjordheim',mapFolder:'Fjordheim',version:'preparation-20261022',check:process.argv.includes('--check')});
