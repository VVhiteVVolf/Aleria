import {buildTerritoryRegion} from './territory-region-build.mjs';
await buildTerritoryRegion({slug:'faelaorn',region:'Faelaorn',kingdom:'Faelaorn',mapFolder:'Faelaorn',version:'albic-fiefs-20261024',check:process.argv.includes('--check')});
