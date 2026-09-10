// Layout owns DOM measurement, never animation. Source nodes are not moved or edited.
function textUnits(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: node => node.nodeType === Node.TEXT_NODE || node.nodeName === 'BR' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
  });
  const units = [];
  let text = '';
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const value = node.nodeName === 'BR' ? '\n' : node.textContent;
    units.push({ node, start: text.length, end: text.length + value.length });
    text += value;
  }
  return { units, text };
}

function boundary(units, offset) {
  const unit = units.find(item => item.end >= offset) || units.at(-1);
  if (unit.node.nodeType === Node.TEXT_NODE) return [unit.node, Math.max(0, offset - unit.start)];
  return [unit.node.parentNode, Array.prototype.indexOf.call(unit.node.parentNode.childNodes, unit.node) + (offset > unit.start ? 1 : 0)];
}

function fragment(source, units, start, end) {
  const range = document.createRange();
  range.setStart(...boundary(units, start));
  range.setEnd(...boundary(units, end));
  const node = source.cloneNode(false);
  node.append(range.cloneContents());
  node.dataset.bookOffset = String(start);
  node.dataset.bookEnd = String(end);
  return node;
}

function removeDuplicateIds(node) {
  // Canonical fragment IDs stay on the single source article. The reader routes hashes.
  node.removeAttribute('id');
  node.querySelectorAll('[id]').forEach(child => child.removeAttribute('id'));
  return node;
}

export function createLeaf(title, number) {
  const leaf = document.createElement('div');
  leaf.className = 'book-leaf';
  leaf.dataset.density = 'soft';
  const header = document.createElement('div');
  header.className = 'book-running-title';
  header.textContent = title;
  header.setAttribute('aria-hidden', 'true');
  const body = document.createElement('div');
  body.className = 'book-page-body book-prose';
  const footer = document.createElement('div');
  footer.className = 'book-folio';
  footer.textContent = String(number);
  footer.setAttribute('aria-hidden', 'true');
  leaf.append(header, body, footer);
  return { leaf, body };
}

export function paginateBook(source, mount, { width, height, title }) {
  const measurement = createLeaf(title, 0);
  measurement.leaf.classList.add('book-measure');
  measurement.leaf.style.width = `${width}px`;
  measurement.leaf.style.height = `${height}px`;
  measurement.leaf.setAttribute('aria-hidden', 'true');
  measurement.leaf.inert = true;
  mount.append(measurement.leaf);
  const body = measurement.body;
  const pages = [];
  let nodes = [];

  const fits = () => body.scrollHeight <= body.clientHeight + 1 && body.scrollWidth <= body.clientWidth + 1;
  const add = node => { body.append(node); return fits(); };
  const flush = () => {
    if (!nodes.length) return;
    pages.push(nodes);
    nodes = [];
    body.replaceChildren();
  };
  const keep = node => { nodes.push(node); };

  function oversized(sourceNode) {
    flush();
    const container = document.createElement('div');
    container.className = 'book-overflow';
    const note = document.createElement('p');
    note.className = 'book-overflow-note';
    note.textContent = 'Großer Inhalt · innerhalb dieses Bereichs scrollen oder die Artikelansicht nutzen.';
    const viewport = document.createElement('div');
    viewport.className = 'book-overflow-viewport';
    viewport.tabIndex = 0;
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-label', 'Vollständiger großer Inhalt, scrollbar');
    viewport.append(removeDuplicateIds(sourceNode.cloneNode(true)));
    container.append(note, viewport);
    body.append(container);
    keep(container);
    flush();
  }

  function splitTable(original) {
    const table = original.querySelector('table');
    const rows = [...table.tBodies[0].rows];
    if (!rows.length) { oversized(original); return; }
    let index = 0;
    while (index < rows.length) {
      const part = removeDuplicateIds(original.cloneNode(true));
      part.dataset.bookOffset = String(index);
      const tbody = part.querySelector('tbody');
      tbody.replaceChildren();
      body.append(part);
      let accepted = 0;
      while (index < rows.length) {
        const row = rows[index].cloneNode(true);
        tbody.append(row);
        if (!fits()) { row.remove(); break; }
        index++;
        accepted++;
      }
      if (accepted) { part.dataset.bookEnd = String(index); keep(part); flush(); }
      else {
        part.remove();
        if (nodes.length) { flush(); continue; }
        tbody.append(rows[index++].cloneNode(true));
        oversized(part);
      }
    }
  }

  function splitText(original) {
    const { units, text } = textUnits(original);
    if (!text.length) { oversized(original); return; }
    const ends = [...text.matchAll(/\s+/g)].map(match => match.index + match[0].length);
    if (ends.at(-1) !== text.length) ends.push(text.length);
    let start = 0;
    while (start < text.length) {
      let low = 0;
      const candidates = ends.filter(end => end > start);
      let high = candidates.length - 1;
      let best = null;
      let end = start;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const attempt = fragment(original, units, start, candidates[middle]);
        const fitsHere = add(attempt);
        attempt.remove();
        if (fitsHere) { best = attempt; end = candidates[middle]; low = middle + 1; }
        else high = middle - 1;
      }
      if (!best) {
        if (nodes.length) { flush(); continue; }
        // An unbreakable token / embedded control remains completely accessible.
        oversized(fragment(original, units, start, text.length));
        break;
      }
      body.append(best);
      if (nodes.length && end < text.length && best.getBoundingClientRect().height < 48) {
        best.remove(); flush(); continue;
      }
      keep(removeDuplicateIds(best));
      start = end;
      if (start < text.length) flush();
    }
  }

  try {
    const originals = [...source.children];
    for (const original of originals) {
      const node = removeDuplicateIds(original.cloneNode(true));
      node.dataset.bookOffset = '0';
      // Authored headings begin a new leaf, independently of viewport or font metrics.
      if (/^H[1-6]$/.test(node.tagName)) flush();
      if (add(node)) { keep(node); continue; }
      node.remove();
      if (node.matches('p, blockquote') && !node.querySelector('img, input, button, select, textarea')) splitText(original);
      else if (node.matches('.book-table-wrap') && !node.querySelector('[rowspan]')) splitTable(original);
      else {
        flush();
        if (add(node)) keep(node);
        else { node.remove(); oversized(original); }
      }
    }
    flush();
    return pages.map((items, index) => {
      const page = createLeaf(title, index + 1);
      page.body.append(...items);
      return page.leaf;
    });
  } finally {
    measurement.leaf.remove();
  }
}

export function findAnchorPage(pages, anchor) {
  if (!anchor) return 1;
  let match = 1;
  pages.forEach((page, index) => {
    for (const node of page.querySelectorAll('[data-book-anchor]')) {
      if (node.dataset.bookAnchor === anchor.id && Number(node.dataset.bookOffset || 0) <= (anchor.offset || 0)) match = index;
    }
  });
  return match;
}
