import source from './principalities.source.json' with { type: 'json' };
import { upgradePrincipalityLinks } from './principality-links.mjs';

const root=document.querySelector('[data-default-id="kontinent-estryll"]');
if(root)upgradePrincipalityLinks(root,source.principalities,window.KONTINENTE_REGISTRY || []);
