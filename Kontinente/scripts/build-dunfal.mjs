import {buildTerritoryRegion} from './territory-region-build.mjs';

await buildTerritoryRegion({slug:'dunfal',region:'Dunfal',kingdom:'Dunfal',mapFolder:'Dunfal',version:'dunfal-20261022b',check:process.argv.includes('--check')});
