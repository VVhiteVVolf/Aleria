import { CLASS_LORE } from './class-lore-data.js?v=20260905-1';

export function appendClassLore(groups) {
  for (const group of groups) {
    const lore = CLASS_LORE[group.id];
    if (!lore) continue;
    const details = document.createElement('details');
    details.className = 'class-lore';
    const summary = document.createElement('summary');
    summary.textContent = `Hintergrund · ${lore.subtitle}`;
    const content = document.createElement('div');
    content.className = 'lore-columns';
    // Only trusted, repository-authored lore contains markup. Never use this
    // path for editable class rules, Firebase records or URL parameters.
    for (const [title, prose] of [['Kriegertum & Ehre', lore.warriorhood], ['Gesellschaftsordnung', lore.society]]) {
      const section = document.createElement('div');
      const heading = document.createElement('h3');
      heading.textContent = title;
      const text = document.createElement('div');
      text.innerHTML = prose;
      section.append(heading, text);
      content.append(section);
    }
    const hierarchy = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = 'Hierarchie & Ränge';
    const list = document.createElement('dl');
    for (const rank of lore.hierarchy) {
      const term = document.createElement('dt');
      term.textContent = rank.rank;
      const description = document.createElement('dd');
      description.innerHTML = rank.desc;
      list.append(term, description);
    }
    hierarchy.append(heading, list);
    content.append(hierarchy);
    details.append(summary, content);
    group.element.append(details);
  }
}
