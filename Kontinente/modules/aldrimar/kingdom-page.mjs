import kingdom from './kingdom.cards.generated.json' with { type: 'json' };
import { renderCouncilGroups } from '../territory-directory/council-directory.mjs?v=20261020';
import { renderFamilySection } from '../territory-directory/house-directory.mjs?v=20261020';
import { enhanceInfoboxes } from '../territory-directory/infobox.mjs?v=panels-20260911a';
import { refineReferenceTables } from '../territory-directory/reference-tables.mjs?v=20261018b';

const page = document.querySelector('[data-kingdom="Aldrimar"]');
if (page) {
  enhanceInfoboxes(page);
  refineReferenceTables(page);
}

// This page owns only its two mounts. Shared components own the card DOM.
const council=document.querySelector('[data-aldrimar-council]');
if(council)council.replaceChildren(renderCouncilGroups(kingdom.councilGroups));
const clans=document.querySelector('[data-aldrimar-clans]');
if(clans){
  const cards=kingdom.clans.map(clan=>{
    const image=document.createElement('img');
    image.src=clan.imageSrc;image.alt=`Wappen ${clan.name}`;image.loading='lazy';
    return {...clan,image};
  });
  clans.replaceChildren(renderFamilySection({title:'Die großen Clans Aldrimars',cards}));
}
