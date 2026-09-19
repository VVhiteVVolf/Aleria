// Local DOM primitives for the house and settlement directories.
export function element(tag, className = '', text = '') {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function directoryLink(href, className, label) {
  const link = element('a', className, label);
  link.href = href;
  const target = new URL(href, document.baseURI);
  if (/^https?:$/.test(target.protocol) && target.origin !== location.origin) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  return link;
}

export function detailList(className, entries) {
  const list = element('dl', `directory-details ${className}`);
  for (const { label, value, className: rowClass = '', href = '' } of entries) {
    const row = element('div', rowClass);
    const term = element('dt', '', label);
    const description = element('dd');
    if (href) description.append(directoryLink(href, 'directory-detail-link', value));
    else description.textContent = value || 'Nicht angegeben';
    row.append(term, description);
    list.append(row);
  }
  return list;
}

export function entryHeading(className, name, href, linkClass = '') {
  const heading = element('h4', className);
  if (href) heading.append(directoryLink(href, `directory-entry-link ${linkClass}`, name));
  else heading.textContent = name;
  return heading;
}
