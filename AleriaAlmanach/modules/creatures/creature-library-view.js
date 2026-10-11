import { buildCreatureGroupTree } from './creature-classification.js?v=20261011-creature-groups-v1';

export function renderCreatureGroups(creatures, { renderCard, escape, openPaths = null }) {
  const renderGroup = (node, depth) => `<details class="creature-library-group" data-creature-group="${escape(node.path)}" data-depth="${depth}"${!openPaths || openPaths.has(node.path) ? ' open' : ''}>
    <summary><span>${escape(node.label)}</span><small>${node.count}</small></summary>
    <div class="creature-library-group-content">${node.children.length
      ? node.children.map(child => renderGroup(child, depth + 1)).join('')
      : `<div class="creature-grid">${node.creatures.map(renderCard).join('')}</div>`}</div>
  </details>`;
  return buildCreatureGroupTree(creatures).map(node => renderGroup(node, 0)).join('');
}
