import { territoryHref } from '../territory-page/territory-reference.mjs?v=20261112a';

export const albenPath = '/Kontinente/Alben/';
export const albenHome = `${albenPath}Der Schild von Ailith.html`;

// Confederation navigation does not change a principality's continental hierarchy.
export function principalityHref(principality, registry = []) {
  return territoryHref(principality.pageId, registry) || `${albenPath}fuerstentum.html?id=${encodeURIComponent(principality.id)}`;
}

export function upgradePrincipalityLinks(root, principalities, registry) {
  const byId = new Map(principalities.map(p => [p.id, p]));
  for (const link of root.querySelectorAll('a[data-alben-principality]')) {
    const principality = byId.get(link.dataset.albenPrincipality);
    if (principality) link.href = principalityHref(principality, registry);
  }
}
