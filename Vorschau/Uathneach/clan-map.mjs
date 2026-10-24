import {createClanMap as createProposalClanMap} from '../shared/clan-map.mjs';
import {previewAsset} from './preview-assets.mjs';
import {clanRankLabel} from './clan-hierarchy.mjs';

export function createClanMap(options){
 return createProposalClanMap({...options,tooltip:document.querySelector('#clan-tooltip'),
  assetUrl:previewAsset,rankLabel:clanRankLabel,imageSize:[4096,3365],
  hasBakedNames:variant=>variant.id==='original',rootClanLabel:'Fürstenclan Uathneachs'});
}
