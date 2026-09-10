import { escapeHtml as h } from '../content/content-html.mjs';

function renderListItem(item) {
  const match = item.match(/^([^;:]{5,65})[;:]\s*(.+)$/s);
  return match ? `<li><strong>${h(match[1])}</strong><p>${h(match[2])}</p></li>` : `<li>${h(item)}</li>`;
}

export function renderLoreBlocks(blocks) {
  return blocks.map(block => {
    if (block.type === 'heading') return `<h3>${h(block.text)}</h3>`;
    if (block.type === 'list') {
      const tag = block.ordered ? 'ol' : 'ul';
      return `<${tag} class="lore-list">${block.items.map(renderListItem).join('')}</${tag}>`;
    }
    return `<p>${h(block.text)}</p>`;
  }).join('');
}

export function renderLoreSections(entry, sharedLore = {}) {
  return entry.sections.map(section => {
    const blocks = section.blocks || section.paragraphs.map(text => ({ type: 'paragraph', text }));
    const shared = section.sharedLore ? sharedLore[section.sharedLore] : null;
    const doctrine = shared ? renderLoreBlocks(shared.blocks) : '';
    return `<section class="profile-section" id="${h(section.id)}"><h2>${h(section.title)}</h2>${shared && blocks.length ? `<details class="shared-doctrine"><summary>Zur Lehre: ${h(shared.title)}</summary><div>${doctrine}</div></details>` : doctrine}${renderLoreBlocks(blocks)}</section>`;
  }).join('');
}

export function renderDivineNames(names = []) {
  if (!names.length) return '';
  return `<section class="profile-section divine-names" id="namen"><p class="eyebrow">Ein Wesen, viele Namen</p><h2>Namen & Beinamen</h2><dl>${names.map(name => `<div><dt>${h(name.label)}</dt><dd>${h(name.value)}</dd></div>`).join('')}</dl></section>`;
}
