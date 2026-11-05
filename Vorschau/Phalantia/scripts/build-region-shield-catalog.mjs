/** Region shield authoring uses the same asset IO as house crests and figures. */
import { createCountryArtCatalogSource } from '../../shared/art-catalog-source.mjs';
import { REGIONS } from '../territory-data.mjs';

const {readJson,exists,artwork,emit} = createCountryArtCatalogSource(new URL('../',import.meta.url));
const jobs = await exists('sources/regional-shield-jobs.json')
  ? (await readJson('sources/regional-shield-jobs.json')).jobs : [];
const regions = new Set(REGIONS.map(region => region.id));
if (jobs.length && (jobs.length !== regions.size || new Set(jobs.map(job => job.regionId)).size !== regions.size)) {
  throw Error('Expected one Hoplon shield for each of the eight Phalantian seat regions.');
}
const shields = [];
for (const job of jobs) {
  if (!regions.has(job.regionId)) throw Error(`Unknown region: ${job.regionId}`);
  shields.push({id:job.id,regionId:job.regionId,name:job.name,description:job.description || job.motif,
    motif:job.motif,palette:job.palette,frame:job.frame,kind:'region',status:'proposal',
    ...await artwork('emblems',job.assetStem || job.id)});
}
await emit('region-shield-data.mjs',[['REGION_SHIELDS',shields]]);
console.log(JSON.stringify({regionShields:shields.length,ready:shields.filter(shield => shield.ready).length}));
