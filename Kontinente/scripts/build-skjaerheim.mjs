import {buildTerritoryRegion} from './territory-region-build.mjs';
await buildTerritoryRegion({slug:'skjaerheim',region:'Skjaerheim',kingdom:'Skjaerheim',mapFolder:'Skjaerheim',version:'faelaorn-skjaerheim-20261022b',check:process.argv.includes('--check')});
