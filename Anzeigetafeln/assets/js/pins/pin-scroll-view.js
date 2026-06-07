(function(){
  'use strict';

  function rt(){ return window.TafelRuntime; }
  function esc(value){ return rt().esc(value); }
  function catOf(pin){ return rt().catOf(pin); }
  function isEditMode(){ return rt().isEditMode(); }

  function fmtText(text){
    if(!text) return '';
    let html = esc(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/---/g, '<hr style="border:none;border-top:1px solid rgba(100,70,20,.2);margin:.38rem 0"/>');
    html = html.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
    return html;
  }

  function mediaLink(html, href){
    const url = (href || '').trim();
    return url ? `<a class="sv-linked-media" href="${esc(url)}">${html}</a>` : html;
  }

  function render(pin){
    const sc = document.getElementById('scroll-content');
    const sa = document.getElementById('scroll-actions');
    const cat = catOf(pin);
    const affils = [];
    if(pin.region) affils.push({lbl:'Region', val:pin.region});
    if(pin.house) affils.push({lbl:'Herrschaft', val:pin.house});
    if(pin.faction) affils.push({lbl:'Fraktion', val:pin.faction});

    const h = (cat.color || '#8a6510').replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const headerBg = `linear-gradient(135deg,rgba(${r},${g},${b},.2) 0%,rgba(${r},${g},${b},.07) 55%,transparent 100%)`;

    sc.innerHTML = `
    <div class="sv-header" style="background:${headerBg};">
      <div class="sv-crest-wrap">
        <div class="sv-crest">
          ${pin.crest
            ? mediaLink(`<img src="${esc(pin.crest)}" onerror="this.parentElement.innerHTML='🏰'"/>`, pin.crestLink)
            : `<span style="opacity:.3;font-size:2rem">🏰</span>`}
        </div>
      </div>
      ${cat.marker ? `<div class="sv-marker-icon" title="${esc(cat.label)}"><img src="${esc(cat.marker)}" onerror="this.style.display='none'"/></div>` : ''}
      <div class="sv-header-col">
        <div class="sv-title">${esc(pin.title)}</div>
        <div class="sv-subtitle-row">
          <span class="sv-cat-badge" style="color:${cat.color};border-color:${cat.color}88;background:rgba(${r},${g},${b},.15);">
            ${pin.pinMarker
              ? `<img src="${esc(pin.pinMarker)}" style="width:14px;height:17px;object-fit:contain;flex-shrink:0;" onerror="this.style.display='none'"/>`
              : `<span style="width:7px;height:7px;border-radius:50%;background:${cat.color};display:inline-block;flex-shrink:0;"></span>`}
            ${esc(cat.label)}
          </span>
          ${pin.secret ? `<span class="sv-secret-badge">🔒 Geheim</span>` : ''}
        </div>
        ${affils.length ? `<div class="sv-affils">
          ${affils.map(a => `<span class="sv-affil"><span class="sv-affil-lbl">${esc(a.lbl)}</span> ${esc(a.val)}</span>`).join('')}
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
               <div class="sv-img-ph" style="display:none">🗺</div>`, pin.imgLink)
            : `<div class="sv-img-ph">🖼</div>`}
        </div>
      </div>
      <div class="sv-col">
        ${pin.table?.length ? `<table class="sv-table">${pin.table.map(row => `<tr><td>${esc(row.k)}</td><td>${esc(row.v)}</td></tr>`).join('')}</table>` : ''}
      </div>
    </div>` : ''}

    ${pin.text ? `<div class="sv-lore"><div class="sv-text">${fmtText(pin.text)}</div></div>` : ''}
  `;

    sa.innerHTML = `
    ${isEditMode()
      ? `<button class="s-btn s-del" data-action="pin-delete" data-pin-id="${pin.id}" style="margin-right:auto">🗑 Löschen</button>
        <button class="s-btn" style="background:rgba(180,140,50,.15);border-color:var(--border2);" data-action="pin-start-stamp" data-pin-id="${pin.id}">🔖 Stempeln</button>
        <button class="s-btn s-edit" data-action="pin-open-edit" data-pin-id="${pin.id}">✎ Bearbeiten</button>`
      : ''}
    <button class="s-btn s-cancel" data-action="close-scroll">Schließen</button>`;
  }

  window.TafelPinScrollView = {
    render,
    fmtText
  };
})();
