import { getPatrickBiographySource, getPatrickBiographyPersonFields, buildPatrickBiographyModule } from '../../../../AleriaAlmanach/modules/patrick-biographies/biography-source.mjs';
import { HAMNETT_HOUSE } from './hamnett-house-profile.js';

const REVISIONS=Object.freeze({'haus-sgrechiwr':{previous:1,next:2},'haus-draenmelyn':{previous:9,next:10},'haus-swyll':{previous:14,next:15}});
const identities=Object.freeze({
  'haus-sgrechiwr':['cadogan-sgrechiwr','unknown-cadogan-spouse'],
  'haus-draenmelyn':['rhiannon-draenmelyn'],
  'haus-swyll':['rhiannon-draenmelyn']
});

export function withPatrickBiographyFamily(family) {
  const revision=REVISIONS[family.document.id];
  if(!revision)return family;
  const selected=new Set(identities[family.document.id]);
  const persons=family.persons.map(person=>{
    if(!selected.has(person.id))return person;
    const source=getPatrickBiographySource(person.id);
    if(!source||person.worldPersonId!==source.worldPersonId)throw Error('Die bestehende Biografie-Weltperson darf nicht verändert werden.');
    const fields=getPatrickBiographyPersonFields(source.key);
    const managed=[...new Set([...(person.extensions?.registryManagedFields||[]),...Object.keys(fields)])];
    const stored=person.extensions?.biographyModule;
    const biography=Object.hasOwn(person.extensions||{},'biographyModule')?stored:buildPatrickBiographyModule(source.key);
    return {...person,...fields,extensions:{...(person.extensions||{}),
      // Preserve separately authored/disabled biographies in future upgrades.
      biographyModule:biography,
      registryManagedFields:managed,registryManagedSourceRevision:revision.next,
      registryManagedFieldRevisions:{...(person.extensions?.registryManagedFieldRevisions||{}),...Object.fromEntries(Object.keys(fields).map(field=>[field,revision.next]))}
    }};
  });
  const needsHamnett=persons.some(person=>person.houseId===HAMNETT_HOUSE.id);
  const houses=needsHamnett&&!family.houses.some(house=>house.id===HAMNETT_HOUSE.id)?[...family.houses,HAMNETT_HOUSE]:family.houses;
  return {...family,persons,houses,extensions:{...family.extensions,sourceRevision:Math.max(Number(family.extensions?.sourceRevision)||0,revision.next),
    registryManagedEntitySourceRevision:family.extensions?.registryManagedEntitySourceRevision??revision.previous}};
}
