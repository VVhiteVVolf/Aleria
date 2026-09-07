import { BESTIARY_TOPIC_GROUPS } from './topic-board-data.js?v=20260907-topic-articles-v1';
import { matchesEntry } from '../catalog/catalog-model.js?v=20260907-bestiarium-v1';
import { createEntryLink } from '../entry-preview/entry-link.js?v=20260907-bestiarium-v1';

export function mountTopicBoard(root) {
  const papers = root.querySelector('[data-role="topic-groups"]');
  const groups = BESTIARY_TOPIC_GROUPS.map(group => {
    const paper = document.createElement('section');
    paper.className = `topic-paper topic-paper-${group.id}`;
    paper.id = group.id;
    const folio = document.createElement('p');
    folio.className = 'paper-folio';
    folio.textContent = `${group.kind} / ${group.number}`;
    const title = document.createElement('h3');
    title.textContent = group.title;
    const description = document.createElement('p');
    description.className = 'paper-description';
    description.textContent = group.description;
    const list = document.createElement('ul');
    const entries = group.entries.map(entry => {
      const item = document.createElement('li');
      const control = createEntryLink(entry, 'topic-link');
      const label = document.createElement('span');
      label.textContent = entry.title;
      if (entry.note) {
        const note = document.createElement('small');
        note.textContent = entry.note;
        label.append(note);
      }
      const arrow = document.createElement('span');
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden', 'true');
      control.append(label, arrow);
      item.append(control);
      list.append(item);
      return { entry: { ...entry, chapter: group.title, group: group.kind }, item };
    });
    paper.append(folio, title, description, list);
    return { paper, entries };
  });
  papers.replaceChildren(...groups.map(group => group.paper));
  return {
    search(query) {
      let count = 0;
      for (const { paper, entries } of groups) {
        for (const { entry, item } of entries) {
          item.hidden = !matchesEntry(entry, query);
          if (!item.hidden) count++;
        }
        paper.hidden = entries.every(({ item }) => item.hidden);
      }
      root.querySelector('[data-role="topic-empty"]').hidden = count > 0;
      papers.hidden = count === 0;
      papers.dataset.singleGroup = String(groups.filter(({ paper }) => !paper.hidden).length === 1);
      root.querySelector('[data-role="topic-count"]').textContent = query ? `${count} passende Themen und Literaturverweise.` : '';
    }
  };
}
