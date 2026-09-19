const labels = { wealth: 'Wohlstand', reputation: 'Ruf', influence: 'Einfluss' };
const iconPaths = {
  wealth: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm-1 2v8h2V8Z',
  reputation: 'm12 1 3 2 4 .5.5 4 2 3-2 3-.5 4-4 .5-3 2-3-2-4-.5-.5-4-2-3 2-3 .5-4L9 3Zm0 5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm-5 13-1 4 6-2 6 2-1-4-2 1-3 2-3-2Z',
  influence: 'M4 1h2v22H4Zm4 2h12v13l-6-3-6 3Zm2 2v7.8l4-2 4 2V5Z',
};

export function parseMerchantRating(value) {
  const source = String(value ?? '').trim().replace(/\s/g, '');
  if (!/^[★☆✤✣✧]{5}$/u.test(source)) return null;
  return { value: [...source].filter(symbol => '★✤✣'.includes(symbol)).length, total: 5 };
}

export function createMerchantRating(value, kind, doc = document) {
  const source = String(value ?? '—') || '—';
  const rating = parseMerchantRating(source);
  const element = doc.createElement('span');
  element.className = `merchant-rating merchant-rating--${kind}`;
  element.dataset.ratingSource = source;
  if (rating) {
    element.setAttribute('role', 'img');
    element.setAttribute('aria-label', `${labels[kind]}: ${rating.value} von ${rating.total}`);
    element.title = `${labels[kind]}: ${rating.value} von ${rating.total}`;
    for (let index = 0; index < rating.total; index += 1) {
      const icon = createIcon(kind, doc);
      icon.classList.add(index < rating.value ? 'is-filled' : 'is-empty');
      element.append(icon);
    }
  } else {
    element.classList.add('merchant-rating--text');
    element.append(createIcon(kind, doc));
    const text = doc.createElement('span');
    text.textContent = source;
    element.append(text);
  }
  return element;
}

function createIcon(kind, doc) {
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = doc.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', iconPaths[kind]);
  path.setAttribute('fill-rule', 'evenodd');
  svg.append(path);
  return svg;
}
