// Convert the source's BBCode into the Markdown accepted by place cards.
// The unchanged source remains in the capture; no prose is generated here.
const entities = value => String(value).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, ' ');
export function worldAnvilDescription(value = '') {
  return entities(value)
    .replace(/(?:\[b\]\s*)?\[h([1-6])\]([\s\S]*?)\[\/h\1\](?:\s*\[\/b\])?/gi, '\n\n$2\n\n')
    .replace(/\[\/?quote(?:=[^\]]*)?\]/gi, '\n\n')
    .replace(/\[br\s*\/?\]/gi, '\n')
    .replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, '[$2]($1)')
    .replace(/\[url\]([^\[]+)\[\/url\]/gi, '[$1]($1)')
    .replace(/\[\/?b\]/gi, '**')
    .replace(/\[\/?i\]/gi, '*')
    .replace(/\[\/?(?:u|s|center|left|right|justify|small|sup|sub|container)(?:=[^\]]*)?\]/gi, '')
    .replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function worldAnvilPlaceTitle(marker) {
  const heading = (marker.description || marker.editorText || '').match(/\[h[1-6]\]([\s\S]*?)\[\/h[1-6]\]/i)?.[1];
  return entities(marker.title || marker.listTitle || heading || '')
    .replace(/\[\/?[^\]]+\]/g, '').replace(/\s+/g, ' ').trim();
}
