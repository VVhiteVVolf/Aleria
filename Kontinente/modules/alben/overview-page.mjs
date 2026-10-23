import presentation from './presentation.generated.json' with { type: 'json' };
import source from './principalities.source.json' with { type: 'json' };
import { renderCouncilGroups } from '../territory-directory/council-directory.mjs?v=20261020';
import { enhanceInfoboxes } from '../territory-directory/infobox.mjs?v=panels-20260911a';
import { upgradePrincipalityLinks } from './principality-links.mjs';

const root=document.querySelector('[data-alben-overview]');
if(root){
  enhanceInfoboxes(root);
  root.querySelector('[data-alben-council]')?.replaceChildren(renderCouncilGroups(presentation.councilGroups));
  upgradePrincipalityLinks(root,source.principalities,window.KONTINENTE_REGISTRY || []);
}
