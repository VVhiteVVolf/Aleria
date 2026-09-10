import { escapeHtml as escape } from '../book-shell/book-template-utils.mjs';

function safeUrl(value, image = false) {
  const url = String(value || '').trim();
  if (/^(?:https?:\/\/|\.\.?\/|\/[^/]|#)/i.test(url) || (!image && /^mailto:/i.test(url))) return escape(url);
  throw new Error(`Unsupported book URL: ${url}`);
}

export function renderInline(content = []) {
  if (typeof content === 'string') return escape(content);
  return content.map(item => {
    if (typeof item === 'string') return escape(item);
    if (item.type === 'break') return '<br>';
    if (['strong', 'em', 'code'].includes(item.type)) return `<${item.type}>${renderInline(item.children)}</${item.type}>`;
    if (item.type === 'link') return `<a href="${safeUrl(item.href)}">${renderInline(item.children)}</a>`;
    throw new Error(`Unsupported inline content: ${item.type}`);
  }).join('');
}

export function renderBookBlock(block) {
  const attributes = `id="${escape(block.id)}" data-book-anchor="${escape(block.id)}"`;
  const content = renderInline(block.content);
  switch (block.type) {
    case 'paragraph': return `<p ${attributes}>${content}</p>`;
    case 'heading': return `<h3 ${attributes}>${content}</h3>`;
    case 'quote': return `<blockquote ${attributes}>${content}${block.cite ? `<cite>${escape(block.cite)}</cite>` : ''}</blockquote>`;
    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      return `<${tag} ${attributes}>${block.items.map(item => `<li>${renderInline(item)}</li>`).join('')}</${tag}>`;
    }
    case 'figure': return `<figure ${attributes}><a href="${safeUrl(block.src, true)}" data-bestiary-image-link><img src="${safeUrl(block.src, true)}" alt="${escape(block.alt)}" width="${Number(block.width)}" height="${Number(block.height)}" decoding="async"></a>${block.caption ? `<figcaption>${renderInline(block.caption)}</figcaption>` : ''}</figure>`;
    case 'table': return `<div ${attributes} class="book-table-wrap" tabindex="0" role="region" aria-label="${escape(block.caption || 'Tabelle')}"><table>${block.caption ? `<caption>${escape(block.caption)}</caption>` : ''}<thead><tr>${block.columns.map(column => `<th scope="col">${renderInline(column)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row => `<tr>${row.map(cell => `<td>${renderInline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    default: throw new Error(`Unsupported book block: ${block.type}`);
  }
}

export function renderBookSource(topic) {
  const ids = new Set();
  const register = id => {
    if (!/^[a-z][a-z0-9-]*$/.test(id) || ids.has(id)) throw new Error(`Invalid or duplicate book anchor: ${id}`);
    ids.add(id);
  };
  return topic.sections.map(section => {
    register(section.id);
    const blocks = section.blocks || (section.paragraphs || []).map((content, index) => ({ id: `${section.id}-absatz-${index + 1}`, type: 'paragraph', content }));
    return `<h2 id="${escape(section.id)}" data-book-anchor="${escape(section.id)}">${escape(section.title)}</h2>\n${blocks.map(block => { register(block.id); return renderBookBlock(block); }).join('\n')}`;
  }).join('\n');
}
