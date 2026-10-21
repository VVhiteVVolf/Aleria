import { escapeHtml } from './court-context.mjs';

export function renderBlocks(blocks) {
  return blocks.map(block=>{
    const tag=block.kind==='heading'?'h3':'p';
    const className=block.kind==='bullet'?'aldrimar-list-item':block.kind==='heading'?'aldrimar-subheading':'';
    return `<${tag}${className?` class="${className}"`:''}>${escapeHtml(block.text)}</${tag}>`;
  }).join('\n');
}

export function sectionHeading(id,title,number='') {
  return `<header class="court-section-heading">${number ? `<span class="court-section-number" aria-hidden="true">${number}</span>` : ''}<h2 id="${id}-titel">${escapeHtml(title)}</h2></header>`;
}

export function renderSections(sections) {
  return sections.filter(section=>section.blocks.length).map(section=>`<section class="court-section" id="${section.id}" aria-labelledby="${section.id}-titel">${sectionHeading(section.id,section.title)}${renderBlocks(section.blocks)}</section>`).join('\n');
}

export function facts(rows,className='court-facts') {
  return `<dl class="${className}">${rows.map(row=>`<div><dt>${escapeHtml(row.label)}</dt><dd>${escapeHtml(row.value)}</dd></div>`).join('')}</dl>`;
}
