(function(){
  const runtime = window.KartoRuntime;

  function state(){
    return runtime.state();
  }

  function mediaLink(html, href){
    return runtime.mediaLink ? runtime.mediaLink(html, href) : html;
  }

  function open(pinId){
    const pin = state().pins.find(item => item.id === pinId);
    if(!pin) return;
    renderScrollView(pin);
    document.getElementById('scroll-mo').classList.add('open');
  }

  function close(){
    document.getElementById('scroll-mo').classList.remove('open');
  }

  function renderScrollView(pin){
    const content = document.getElementById('scroll-content');
    const actions = document.getElementById('scroll-actions');
    const category = runtime.categoryForPin(pin);
    const affiliations = [];
    if(pin.region) affiliations.push({label:'Region', value:pin.region});
    if(pin.house) affiliations.push({label:'Herrschaft', value:pin.house});
    if(pin.faction) affiliations.push({label:'Fraktion', value:pin.faction});

    const rgb = hexToRgb(category.color || '#8a6510');
    const headerBg = `linear-gradient(135deg,rgba(${rgb.r},${rgb.g},${rgb.b},.2) 0%,rgba(${rgb.r},${rgb.g},${rgb.b},.07) 55%,transparent 100%)`;
    const esc = runtime.esc;

    content.innerHTML = `
      <div class="sv-header" style="background:${headerBg};">
        <div class="sv-crest-wrap">
          <div class="sv-crest">
            ${pin.crest
              ? mediaLink(`<img src="${esc(pin.crest)}" onerror="this.parentElement.innerHTML='Burg'"/>`, pin.crestLink)
              : `<span style="opacity:.3;font-size:1rem">Burg</span>`}
          </div>
        </div>
        ${category.marker ? `<div class="sv-marker-icon" title="${esc(category.label)}"><img src="${esc(category.marker)}" onerror="this.style.display='none'"/></div>` : ''}
        <div class="sv-header-col">
          <div class="sv-title">${esc(pin.title)}</div>
          <div class="sv-subtitle-row">
            <span class="sv-cat-badge" style="color:${category.color};border-color:${category.color}88;background:rgba(${rgb.r},${rgb.g},${rgb.b},.15);">
              ${pin.pinMarker
                ? `<img src="${esc(pin.pinMarker)}" style="width:14px;height:17px;object-fit:contain;flex-shrink:0;" onerror="this.style.display='none'"/>`
                : `<span style="width:7px;height:7px;border-radius:50%;background:${category.color};display:inline-block;flex-shrink:0;"></span>`}
              ${esc(category.label)}
            </span>
            ${pin.secret ? `<span class="sv-secret-badge">Geheim</span>` : ''}
          </div>
          ${affiliations.length ? `<div class="sv-affils">
            ${affiliations.map(item => `<span class="sv-affil"><span class="sv-affil-lbl">${esc(item.label)}</span> ${esc(item.value)}</span>`).join('')}
          </div>` : ''}
        </div>
        ${pin.banner ? `<div class="sv-banner">${mediaLink(`<img src="${esc(pin.banner)}" onerror="this.parentElement.style.display='none'" title="Regionsbanner"/>`, pin.bannerLink)}</div>` : ''}
      </div>

      ${(pin.img || pin.table?.length) ? `
      <div class="sv-body">
        <div class="sv-img-wrap">
          <div class="sv-img">
            ${pin.img
              ? mediaLink(`<img src="${esc(pin.img)}" onerror="this.style.display='none';this.nextSibling.style.display='flex'"/>
                 <div class="sv-img-ph" style="display:none">Bild</div>`, pin.imgLink)
              : `<div class="sv-img-ph">Bild</div>`}
          </div>
        </div>
        <div class="sv-col">
          ${pin.table?.length ? `<table class="sv-table">${pin.table.map(row => `<tr><td>${esc(row.k)}</td><td>${esc(row.v)}</td></tr>`).join('')}</table>` : ''}
        </div>
      </div>` : ''}

      ${pin.text ? `<div class="sv-lore"><div class="sv-text">${runtime.formatText(pin.text)}</div></div>` : ''}
    `;

    actions.innerHTML = `
      ${runtime.isEditMode()
        ? `<button class="s-btn s-del" data-action="delete-pin" data-pin-id="${esc(pin.id)}" style="margin-right:auto">Loeschen</button>
          <button class="s-btn" style="background:rgba(180,140,50,.15);border-color:var(--border2);" data-action="close-scroll-and-start-stamp" data-pin-id="${esc(pin.id)}">Stempeln</button>
          <button class="s-btn s-edit" data-action="edit-pin-from-scroll" data-pin-id="${esc(pin.id)}">? Bearbeiten</button>`
        : ''}
      <button class="s-btn s-cancel" data-action="close-scroll">Schlie?en</button>`;
  }

  function hexToRgb(hex){
    const clean = (hex || '#8a6510').replace('#', '');
    const normalized = clean.length === 3
      ? clean.split('').map(char => char + char).join('')
      : clean.padEnd(6, '0').slice(0, 6);
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return {
      r: Number.isNaN(r) ? 138 : r,
      g: Number.isNaN(g) ? 101 : g,
      b: Number.isNaN(b) ? 16 : b,
    };
  }

  window.KartoPinDetailView = {
    open,
    close,
    renderScrollView,
  };
})();
