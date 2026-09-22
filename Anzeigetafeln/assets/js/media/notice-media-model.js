(function () {
  'use strict';

  function imageUrl(value) {
    const source = String(value || '').trim();
    if (!source || /[<>\u0000-\u001f]/u.test(source)) return '';
    if (/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(source)) return source;
    if (/^(?:javascript|data|blob|file|vbscript):/i.test(source)) return '';
    try {
      const url = new URL(source, document.baseURI);
      if (!['https:', 'http:'].includes(url.protocol)) return '';
      if (/^(?:www\.)?imgur\.com$/i.test(url.hostname)) {
        const id = url.pathname.match(/^\/([a-z0-9]+)(?:\.(?:png|jpe?g|webp|gif))?\/?$/i)?.[1];
        if (!id) return '';
        return `https://i.imgur.com/${id}.png`;
      }
      return source;
    } catch { return ''; }
  }

  function characterLink(reference) {
    if (!reference?.familyId || !reference?.personId) return '';
    return `../Stammb%C3%A4ume/Stammbaum.html?${new URLSearchParams({
      family: reference.familyId, mode: 'view', person: reference.personId,
    })}`;
  }

  function selection(source, field) {
    const reference = source?.media?.[field];
    const src = imageUrl(source?.[field]);
    // A changed legacy URL must never keep an unrelated character link.
    const matches = reference && (imageUrl(reference.src) === src || (!reference.src && reference.kind !== 'character'));
    return matches ? { ...reference, src } : { src };
  }

  function render(source, field, { className = '', label = 'Bild', symbol = '◇', fit, position } = {}) {
    const esc = window.TafelRuntime.esc;
    const item = selection(source, field);
    const href = characterLink(item);
    const tag = href ? 'a' : 'span';
    const imageFit = fit || (source?.imageFit === 'contain' ? 'contain' : 'cover');
    const imagePosition = position || (['top', 'bottom'].includes(source?.imagePosition) ? source.imagePosition : 'center');
    return `<${tag} class="notice-media ${className}${item.src ? ' has-image' : ''}"${href ? ` href="${esc(href)}" target="_blank" rel="noopener" title="${esc(item.name || label)} im Stammbaum öffnen"` : ''}>
      <span class="notice-media-placeholder" role="img" aria-label="${esc(item.name || label)}"><span aria-hidden="true">${symbol}</span></span>
      ${item.src ? `<img src="${esc(item.src)}" alt="${esc(item.name || label)}" loading="lazy" data-image-fallback="notice-media" style="object-fit:${imageFit};object-position:${imagePosition}">` : ''}
    </${tag}>`;
  }

  function apply(source, field, item) {
    const src = imageUrl(item?.src);
    source[field] = src;
    source.media = { ...source.media };
    if (item) source.media[field] = item.kind === 'character'
      ? { ...item, src }
      : { kind: item.kind, name: item.name };
    else delete source.media[field];
  }

  function searchText(value) {
    return String(value || '').toLocaleLowerCase('de').replace(/ß/g, 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  window.TafelNoticeMediaModel = Object.freeze({ imageUrl, characterLink, selection, render, apply, searchText });
})();
