import {buildTerritoryRegion} from './territory-region-build.mjs';

await buildTerritoryRegion({slug:'dunfal',region:'Dunfal',kingdom:'Dunfal',mapFolder:'Dunfal',version:'albic-fiefs-20261024',check:process.argv.includes('--check')});
