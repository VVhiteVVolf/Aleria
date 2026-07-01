(function(){
  'use strict';

  const ALLOWED_TAGS = new Set([
    'P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S',
    'UL', 'OL', 'LI', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'SPAN'
  ]);
  const ALLOWED_COLORS = new Set([
    '#1f1608', '#5a3a08', '#8a641f', '#9b1c1c',
    '#1f5f36', '#24527a', '#6b3f7a', '#f8efd2',
    '#ead8a5', '#d6c083'
  ]);
  const ALLOWED_TEXT_DECORATIONS = new Set(['underline', 'line-through']);

  function esc(value){
    return String(value || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[c]));
  }

  function looksLikeHtml(value){
    return /<\/?(p|div|br|strong|b|em|i|u|s|ul|ol|li|h2|h3|h4|blockquote|span|font)\b/i.test(String(value || ''));
  }

  function plainTextToHtml(value){
    const text = String(value || '').replace(/\r\n/g, '\n');
    if(!text.trim()) return '';
    return text
      .split(/\n{2,}/)
      .map(block => `<p>${esc(block).replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  function sanitizeStyle(styleText){
    const allowed = [];
    String(styleText || '').split(';').forEach(part => {
      const [rawName, rawValue] = part.split(':');
      const name = String(rawName || '').trim().toLowerCase();
      const raw = String(rawValue || '').trim().toLowerCase();
      const value = normalizeColorValue(raw);
      if((name === 'color' || name === 'background-color') && ALLOWED_COLORS.has(value)){
        allowed.push(`${name}:${value}`);
      }
      if(name === 'font-weight' && (raw === 'bold' || raw === '700')){
        allowed.push('font-weight:700');
      }
      if(name === 'font-style' && raw === 'italic'){
        allowed.push('font-style:italic');
      }
      if((name === 'text-decoration' || name === 'text-decoration-line')){
        const decorations = raw.split(/\s+/).filter(item => ALLOWED_TEXT_DECORATIONS.has(item));
        if(decorations.length) allowed.push(`text-decoration:${decorations.join(' ')}`);
      }
    });
    return allowed.join(';');
  }

  function normalizeColorValue(value){
    const raw = String(value || '').trim().toLowerCase();
    if(ALLOWED_COLORS.has(raw)) return raw;
    const rgb = raw.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
    if(!rgb) return raw;
    return '#' + rgb.slice(1).map(part => {
      const number = Math.max(0, Math.min(255, Number(part) || 0));
      return number.toString(16).padStart(2, '0');
    }).join('');
  }

  function sanitizeNode(node, documentRef){
    if(node.nodeType === Node.TEXT_NODE){
      return documentRef.createTextNode(node.textContent || '');
    }
    if(node.nodeType !== Node.ELEMENT_NODE){
      return documentRef.createTextNode('');
    }

    const tag = node.tagName.toUpperCase();
    if(tag === 'SCRIPT' || tag === 'STYLE'){
      return documentRef.createTextNode('');
    }
    const safeTag = tag === 'DIV'
      ? 'p'
      : ALLOWED_TAGS.has(tag)
        ? tag.toLowerCase()
        : 'span';
    const safeNode = documentRef.createElement(safeTag);

    const styleParts = [];
    const style = sanitizeStyle(node.getAttribute('style'));
    if(style) styleParts.push(style);
    const fontColor = normalizeColorValue(node.getAttribute('color'));
    if(tag === 'FONT' && ALLOWED_COLORS.has(fontColor)) styleParts.push(`color:${fontColor}`);
    if(styleParts.length) safeNode.setAttribute('style', styleParts.join(';'));

    Array.from(node.childNodes).forEach(child => {
      safeNode.appendChild(sanitizeNode(child, documentRef));
    });
    return safeNode;
  }

  function sanitizeHtml(value){
    const source = looksLikeHtml(value) ? String(value || '') : plainTextToHtml(value);
    const template = document.createElement('template');
    template.innerHTML = source;
    const fragment = document.createDocumentFragment();
    Array.from(template.content.childNodes).forEach(node => {
      fragment.appendChild(sanitizeNode(node, document));
    });
    const wrapper = document.createElement('div');
    wrapper.appendChild(fragment);
    return wrapper.innerHTML
      .replace(/<p><br><\/p>/g, '')
      .trim();
  }

  function editorHtml(value){
    return sanitizeHtml(value);
  }

  function renderHtml(value){
    const html = sanitizeHtml(value);
    return html || '';
  }

  function textPreview(value, maxLength = 200){
    const template = document.createElement('template');
    template.innerHTML = sanitizeHtml(value);
    return template.content.textContent.slice(0, maxLength);
  }

  function command(commandName, value = null){
    document.execCommand(commandName, false, value);
  }

  function format(action, value){
    const usesInlineStyle = action === 'color' || action === 'background';
    document.execCommand('styleWithCSS', false, usesInlineStyle);
    if(action === 'bold') command('bold');
    if(action === 'italic') command('italic');
    if(action === 'underline') command('underline');
    if(action === 'strike') command('strikeThrough');
    if(action === 'ul') command('insertUnorderedList');
    if(action === 'ol') command('insertOrderedList');
    if(action === 'paragraph') command('formatBlock', 'P');
    if(action === 'h2') command('formatBlock', 'H2');
    if(action === 'h3') command('formatBlock', 'H3');
    if(action === 'quote') command('formatBlock', 'BLOCKQUOTE');
    if(action === 'color') command('foreColor', value);
    if(action === 'background') command('hiliteColor', value);
  }

  function toolbar(targetId){
    const colors = [
      ['#1f1608', 'Tinte'],
      ['#8a641f', 'Gold'],
      ['#9b1c1c', 'Rot'],
      ['#1f5f36', 'Gruen'],
      ['#24527a', 'Blau'],
      ['#6b3f7a', 'Violett']
    ];
    const backgrounds = [
      ['#f8efd2', 'Papier'],
      ['#ead8a5', 'Gelb'],
      ['#d6c083', 'Markiert']
    ];
    const button = (label, action, title = label) =>
      `<button type="button" class="rt-btn" data-mousedown-action="zettel-rich-format" data-rich-target="${targetId}" data-rich-format="${action}" title="${esc(title)}">${label}</button>`;
    const colorButton = ([color, label], action) =>
      `<button type="button" class="rt-color" data-mousedown-action="zettel-rich-format" data-rich-target="${targetId}" data-rich-format="${action}" data-rich-value="${color}" title="${esc(label)}" style="background:${color}"></button>`;
    return `<div class="zettel-rt-toolbar" data-rich-toolbar-for="${targetId}">
      ${button('<b>F</b>', 'bold', 'Fett')}
      ${button('<i>K</i>', 'italic', 'Kursiv')}
      ${button('<u>U</u>', 'underline', 'Unterstrichen')}
      ${button('<s>S</s>', 'strike', 'Durchgestrichen')}
      ${button('H2', 'h2', 'Ueberschrift')}
      ${button('H3', 'h3', 'Zwischenueberschrift')}
      ${button('P', 'paragraph', 'Absatz')}
      ${button('•', 'ul', 'Bullet-Liste')}
      ${button('1.', 'ol', 'Nummerierte Liste')}
      ${button('Zitat', 'quote', 'Zitatblock')}
      <span class="rt-sep"></span>
      ${colors.map(color => colorButton(color, 'color')).join('')}
      <span class="rt-sep"></span>
      ${backgrounds.map(color => colorButton(color, 'background')).join('')}
    </div>`;
  }

  window.TafelZettelRichText = {
    editorHtml,
    renderHtml,
    textPreview,
    toolbar,
    format,
    sanitizeHtml
  };
})();
