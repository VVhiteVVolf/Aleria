import {buildTerritoryRegion} from './territory-region-build.mjs';
await buildTerritoryRegion({slug:'faelaorn',region:'Faelaorn',kingdom:'Faelaorn',mapFolder:'Faelaorn',version:'faelaorn-skjaerheim-20261022b',check:process.argv.includes('--check')});
