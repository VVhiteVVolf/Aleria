// Shared presentation for the location dialog and the editor's live preview.
(function () {
  function imagePosition(value) {
    return ['top', 'center', 'bottom'].includes(value) ? value : 'center';
  }

  function render(pin, { titleId = 'pin-card-title' } = {}) {
    const runtime = window.KartoRuntime;
    const esc = value => runtime.esc(String(value ?? ''));
    const category = runtime.categoryForPin(pin);
    const color = /^#[\da-f]{3}([\da-f]{3})?$/i.test(category.color) ? category.color : '#8a6510';
    const title = pin.title || 'Unbekannter Ort';
    const media = (html, href) => runtime.mediaLink(html, href);
    const image = window.KartoPinPlaceholders?.resolve(pin) || { src: pin.img, link: pin.imgLink };
    const rows = (pin.table || []).filter(row => row.k || row.v);
    const affiliations = [];
    const dominion = runtime.dominionForPin(pin);
    if (dominion) affiliations.push({ label: dominion.type || 'Herrschaft', value: runtime.dominionChain(dominion).map(item => item.name).join(' → ') });
    if (pin.region) affiliations.push({ label: 'Region', value: pin.region });
    if (pin.house) affiliations.push({ label: 'Herrschaft/Haus', value: pin.house });
    if (pin.faction) affiliations.push({ label: 'Fraktion', value: pin.faction });

    return `<article class="pin-card" aria-labelledby="${esc(titleId)}">
      <header class="sv-header">
        <div class="sv-crest">
          ${pin.crest ? media(`<img src="${esc(pin.crest)}" alt="Wappen von ${esc(title)}" data-card-image/>`, pin.crestLink) : ''}
          <span class="sv-crest-placeholder" aria-hidden="true"${pin.crest ? ' hidden' : ''}>✦</span>
        </div>
        <div class="sv-header-col">
          <h2 class="sv-title" id="${esc(titleId)}">${esc(title)}</h2>
          <div class="sv-subtitle-row">
            <span class="sv-cat-badge" style="--category-color:${color}">
              ${pin.pinMarker || category.marker
                ? `<img src="${esc(pin.pinMarker || category.marker)}" alt="" data-card-image/>`
                : '<span class="sv-category-dot" aria-hidden="true"></span>'}
              ${esc(category.label)}
            </span>
            ${pin.secret ? '<span class="sv-secret-badge">Geheim</span>' : ''}
          </div>
          ${affiliations.length ? `<div class="sv-affils">${affiliations.map(item => `<span class="sv-affil"><span class="sv-affil-lbl">${esc(item.label)}</span><span>${esc(item.value)}</span></span>`).join('')}</div>` : ''}
        </div>
        ${pin.banner ? `<div class="sv-banner">${media(`<img src="${esc(pin.banner)}" alt="Regionsbanner" data-card-image/>`, pin.bannerLink)}</div>` : ''}
      </header>
      <div class="sv-body${rows.length < 4 ? ' sv-body--compact' : ''}" data-image-position="${imagePosition(pin.imgPosition)}">
        <div class="sv-img-wrap">
          ${image.src ? media(`<img class="sv-location-image" src="${esc(image.src)}" alt="Ansicht von ${esc(title)}" data-card-image/>`, image.link) : ''}
          <div class="sv-img-ph"${image.src ? ' hidden' : ''}>Kein Ortsbild vorhanden</div>
        </div>
        ${rows.length ? `<table class="sv-table" aria-label="Informationen zu ${esc(title)}"><tbody>${rows.map(row => `<tr><th scope="row">${esc(row.k)}</th><td>${String(row.v ?? '').trim() ? esc(row.v) : '<span class="sv-empty-value" aria-label="Noch nicht eingetragen">—</span>'}</td></tr>`).join('')}</tbody></table>` : ''}
      </div>
      ${pin.text ? `<section class="sv-lore"><h3 class="sv-section-title">Beschreibung</h3><div class="sv-text">${runtime.formatText(pin.text)}</div></section>` : ''}
    </article>`;
  }

  // Images can appear inside links; delegate failures without inline handlers.
  document.addEventListener('error', event => {
    const img = event.target;
    if (!img.matches?.('img[data-card-image]')) return;
    img.hidden = true;
    if (img.closest('.sv-banner')) img.closest('.sv-banner').hidden = true;
    const media = img.closest('.sv-img-wrap, .sv-crest');
    const fallback = media?.querySelector('.sv-img-ph, .sv-crest-placeholder');
    if (fallback) fallback.hidden = false;
  }, true);

  window.KartoPinCard = Object.freeze({ render, imagePosition });
})();
