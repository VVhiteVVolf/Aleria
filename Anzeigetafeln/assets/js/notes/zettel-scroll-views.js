(function(){
  'use strict';

  let steckbriefPage = 0;

  function rt(){
    return window.TafelRuntime;
  }

  function state(){
    return rt().state();
  }

  function esc(value){
    return rt().esc(value);
  }

  const PAPER = '#f8efd2';
  const PAPER_PANEL = '#f1e4bd';
  const PAPER_LABEL = '#e5d19a';
  const PAPER_BORDER = '#d0bb7a';
  const PAPER_ACCENT = '#8a641f';
  const PAPER_INK = '#1f1608';
  const PAPER_MUTED = '#6f5725';
  const PAPER_HEADER = '#ead8a5';
  const WANTED_HEADER = '#dfb29c';
  const NEWS_HEADER = '#d6d2bd';

  function starValue(row){
    const value = parseInt(row.v, 10) || 0;
    return '<span style="color:#c8a84b;letter-spacing:1px;">' + '\u2605'.repeat(value) + '</span><span style="opacity:.3;">' + '\u2605'.repeat(5 - value) + '</span>';
  }

  function renderQuest(z){
    let txt = esc(z.text || '');
    txt = txt.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
    const hasPortrait = !!(z.verfasser || z.verfasserName);
    const hasTable = !!(z.table && z.table.some(r => r.k));
    const hasLeft = hasPortrait || hasTable;
    return `<div style="background:${PAPER};min-height:400px;border-radius:4px;overflow:hidden;border:1px solid ${PAPER_BORDER};">
  <div style="background:${PAPER_HEADER};padding:.7rem 1.4rem;text-align:center;border-bottom:2px solid ${PAPER_BORDER};">
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.3rem;color:${PAPER_INK};">${esc(z.title || '')}</div>
    ${z.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:${PAPER_MUTED};">${esc(z.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;min-height:280px;">
    ${hasLeft ? `<div style="width:160px;flex-shrink:0;border-right:1px solid ${PAPER_BORDER};display:flex;flex-direction:column;align-items:center;padding:.8rem .6rem;gap:.5rem;background:${PAPER_PANEL};">
      ${hasPortrait ? `
        ${z.verfasser ? `<img src="${esc(z.verfasser)}" style="width:110px;height:110px;border-radius:50%;border:2px solid ${PAPER_ACCENT};object-fit:cover;box-shadow:0 2px 5px rgba(0,0,0,.18);flex-shrink:0;" onerror="this.style.display='none'"/>` :
          `<div style="width:110px;height:110px;border-radius:50%;border:2px dashed ${PAPER_BORDER};background:${PAPER};flex-shrink:0;"></div>`}
        ${z.verfasserName ? `<div style="font-family:'Georgia',serif;font-size:.88rem;color:${PAPER_INK};text-align:center;font-style:italic;line-height:1.3;">${esc(z.verfasserName)}</div>` : ''}
      ` : ''}
      ${hasTable ? `<table style="width:100%;border-collapse:collapse;font-size:.72rem;">
        ${z.table.filter(r => r.k).map(r => `<tr>
          <td style="font-family:'Cinzel',serif;font-size:.58rem;text-transform:uppercase;letter-spacing:.04em;
            color:${PAPER_INK};background:${PAPER_LABEL};padding:3px 6px;border-bottom:1px solid ${PAPER_BORDER};">${esc(r.k)}</td>
          <td style="color:${PAPER_INK};padding:3px 6px;border-bottom:1px solid ${PAPER_BORDER};font-family:'EB Garamond',serif;">${r.type === 'stars' ? starValue(r) : esc(r.v)}</td>
        </tr>`).join('')}
      </table>` : ''}
    </div>` : ''}
    <div style="flex:1;padding:1rem 1.3rem;font-family:'EB Garamond',serif;font-size:1rem;line-height:1.88;color:${PAPER_INK};${!hasLeft ? 'text-align:justify;' : ''}">
      ${txt || `<em style="opacity:.65;color:${PAPER_MUTED}">Kein Text eingetragen.</em>`}
    </div>
  </div>
  <div style="border-top:1px solid ${PAPER_BORDER};padding:.4rem 1.2rem;text-align:center;background:${PAPER_PANEL};">
    <span style="font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.1em;color:${PAPER_MUTED};text-transform:uppercase;">Quest / Auftrag</span>
  </div>
</div>`;
  }

  function setSteckbriefPage(zid, page){
    const z = state().zettel.find(x => x.id === zid);
    if(!z) return;
    const pers = z.personen && z.personen.length ? z.personen : [{portrait:'', title:'', untertitel:'', text:'', table:[]}];
    steckbriefPage = Math.max(0, Math.min(pers.length - 1, page));
    document.getElementById('scroll-content').innerHTML = steckbriefPageHTML(z, steckbriefPage);
  }

  function steckbriefPageHTML(z, page){
    const pers = z.personen && z.personen.length ? z.personen : [{portrait:'', title:'', untertitel:'', text:'', table:[]}];
    const p = pers[page] || pers[0];
    const total = pers.length;
    const zid = z.id;
    const hasPortrait = !!p.portrait;
    const hasTable = !!(p.table && p.table.some(r => r.k));
    const tableHTML = hasTable ? `<div style="width:300px;flex-shrink:0;border-left:1px solid ${PAPER_BORDER};background:${PAPER_PANEL};overflow-y:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
      ${p.table.filter(r => r.k).map(r => `<tr>
        <td style="font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.04em;color:${PAPER_INK};background:${PAPER_LABEL};padding:5px 8px;border-bottom:1px solid ${PAPER_BORDER};width:36%;vertical-align:top;font-weight:700;">${esc(r.k)}</td>
        <td style="color:${PAPER_INK};padding:5px 8px;border-bottom:1px solid ${PAPER_BORDER};font-family:'EB Garamond',serif;vertical-align:middle;">${r.type === 'stars' ? starValue(r) : esc(r.v)}</td>
      </tr>`).join('')}
    </table>
  </div>` : '';
    return `<div style="background:${PAPER};min-height:420px;border-radius:4px;overflow:hidden;border:2px solid ${PAPER_BORDER};display:flex;flex-direction:column;">
  <div style="background:${WANTED_HEADER};padding:.9rem 1.4rem;text-align:center;border-bottom:3px solid ${PAPER_BORDER};flex-shrink:0;">
    <div style="font-family:'Cinzel Decorative',serif;font-size:2.2rem;letter-spacing:.2em;color:#4a1608;">GESUCHT</div>
    <div style="font-family:'Cinzel',serif;font-size:1.05rem;color:${PAPER_INK};margin-top:.2rem;letter-spacing:.04em;">${esc(p.title || z.title || 'Unbekannte Person')}</div>
    ${p.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:${PAPER_MUTED};font-size:.9rem;">${esc(p.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;flex:1;min-height:280px;">
    ${hasPortrait ? `<div style="width:175px;flex-shrink:0;border-right:1px solid ${PAPER_BORDER};background:${PAPER_PANEL};">
      <img src="${esc(p.portrait)}" style="width:175px;height:100%;object-fit:cover;display:block;filter:sepia(15%);" onerror="this.style.display='none'"/>
    </div>` : ''}
    <div style="flex:1;padding:1.1rem 1.4rem;font-family:'EB Garamond',serif;font-size:1rem;line-height:1.9;color:${PAPER_INK};overflow-y:auto;">
      ${p.text ? esc(p.text).replace(/\n/g, '<br>') : `<em style="opacity:.65;color:${PAPER_MUTED}">Kein Text eingetragen.</em>`}
    </div>
    ${tableHTML}
  </div>
  ${total > 1 ? `<div style="border-top:1px solid ${PAPER_BORDER};padding:.5rem 1.2rem;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:${PAPER_PANEL};">
    <button data-action="zettel-set-page" data-zettel-id="${zid}" data-page="${page - 1}" ${page === 0 ? 'disabled' : ''} style="font-family:'Cinzel',serif;font-size:.75rem;padding:3px 14px;border:1px solid rgba(90,40,0,.4);border-radius:2px;background:${page === 0 ? 'transparent' : 'rgba(180,130,40,.15)'};color:${page === 0 ? 'rgba(90,40,0,.3)' : '#5a2000'};cursor:${page === 0 ? 'default' : 'pointer'};">Zurueck</button>
    <div style="font-family:'Cinzel',serif;font-size:.68rem;letter-spacing:.1em;color:${PAPER_MUTED};text-align:center;">
      <div>Person ${page + 1} / ${total}</div>
      <div style="display:flex;gap:4px;justify-content:center;margin-top:3px;">
        ${pers.map((_, i) => `<div data-action="zettel-set-page" data-zettel-id="${zid}" data-page="${i}" style="width:7px;height:7px;border-radius:50%;background:${i === page ? PAPER_ACCENT : 'rgba(122,48,0,.25)'};cursor:pointer;"></div>`).join('')}
      </div>
    </div>
    <button data-action="zettel-set-page" data-zettel-id="${zid}" data-page="${page + 1}" ${page === total - 1 ? 'disabled' : ''} style="font-family:'Cinzel',serif;font-size:.75rem;padding:3px 14px;border:1px solid rgba(90,40,0,.4);border-radius:2px;background:${page === total - 1 ? 'transparent' : 'rgba(180,130,40,.15)'};color:${page === total - 1 ? 'rgba(90,40,0,.3)' : '#5a2000'};cursor:${page === total - 1 ? 'default' : 'pointer'};">Weiter</button>
  </div>` : `<div style="border-top:1px solid ${PAPER_BORDER};padding:.4rem 1.2rem;text-align:center;background:${PAPER_PANEL};">
    <span style="font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.1em;color:${PAPER_MUTED};text-transform:uppercase;">Steckbrief - Tot oder lebendig</span>
  </div>`}
</div>`;
  }

  function renderSteckbrief(z){
    steckbriefPage = 0;
    return steckbriefPageHTML(z, 0);
  }

  function renderZeitung(z){
    const artikel = Array.isArray(z.artikel) && z.artikel.length ? z.artikel : [{titel:z.title || 'Artikel', text:z.text || ''}];
    const hasImage = !!z.bild;
    return `<div style="background:${PAPER};min-height:420px;border-radius:4px;overflow:hidden;border:2px solid ${PAPER_BORDER};display:flex;flex-direction:column;">
  <div style="background:${NEWS_HEADER};padding:.75rem 1.4rem;text-align:center;border-bottom:2px solid ${PAPER_BORDER};flex-shrink:0;">
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.3rem;color:${PAPER_INK};">${esc(z.verfasserName || z.title || 'Alerische Rundschau')}</div>
    ${z.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:${PAPER_MUTED};">${esc(z.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;gap:1rem;padding:1rem 1.2rem;flex:1;min-height:300px;">
    ${hasImage ? `<div style="width:220px;flex-shrink:0;border:1px solid ${PAPER_BORDER};background:${PAPER_PANEL};padding:.35rem;height:max-content;">
      <img src="${esc(z.bild)}" style="width:100%;max-height:260px;object-fit:cover;display:block;filter:sepia(12%);" onerror="this.parentElement.style.display='none'"/>
    </div>` : ''}
    <div style="flex:1;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;font-family:'EB Garamond',serif;color:${PAPER_INK};">
      ${artikel.map((a, i) => `<article style="border-left:${i ? `1px solid ${PAPER_BORDER}` : '0'};padding-left:${i ? '.9rem' : '0'};">
        <h3 style="font-family:'Cinzel',serif;font-size:.95rem;letter-spacing:.04em;margin:0 0 .45rem;color:${PAPER_INK};text-transform:uppercase;">${esc(a.titel || ('Artikel ' + (i + 1)))}</h3>
        <div style="font-size:.98rem;line-height:1.75;text-align:justify;">${a.text ? esc(a.text).replace(/\n/g, '<br>') : `<em style="opacity:.65;color:${PAPER_MUTED}">Kein Text eingetragen.</em>`}</div>
      </article>`).join('')}
    </div>
  </div>
  <div style="border-top:1px solid ${PAPER_BORDER};padding:.4rem 1.2rem;text-align:center;flex-shrink:0;background:${PAPER_PANEL};">
    <span style="font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.1em;color:${PAPER_MUTED};text-transform:uppercase;">Zeitungsartikel</span>
  </div>
</div>`;
  }

  function renderVermisst(z){
    const hasPortrait = !!z.portrait;
    const hasTable = !!(z.table && z.table.some(r => r.k));
    const tableHTML = hasTable ? `<div style="width:280px;flex-shrink:0;border-left:1px solid ${PAPER_BORDER};background:${PAPER_PANEL};overflow-y:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
      ${z.table.filter(r => r.k).map(r => `<tr>
        <td style="font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.04em;color:${PAPER_INK};background:${PAPER_LABEL};padding:5px 8px;border-bottom:1px solid ${PAPER_BORDER};width:36%;vertical-align:top;font-weight:700;">${esc(r.k)}</td>
        <td style="color:${PAPER_INK};padding:5px 8px;border-bottom:1px solid ${PAPER_BORDER};font-family:'EB Garamond',serif;vertical-align:middle;">${r.type === 'stars' ? starValue(r) : esc(r.v)}</td>
      </tr>`).join('')}
    </table>
  </div>` : '';
    return `<div style="background:${PAPER};min-height:380px;border-radius:4px;overflow:hidden;border:2px solid ${PAPER_BORDER};display:flex;flex-direction:column;">
  <div style="background:${PAPER_HEADER};padding:.7rem 1.4rem;text-align:center;border-bottom:2px solid ${PAPER_BORDER};flex-shrink:0;">
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.3rem;color:${PAPER_INK};">${esc(z.title || '')}</div>
    ${z.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:${PAPER_MUTED};">${esc(z.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;flex:1;min-height:280px;">
    ${hasPortrait ? `<div style="width:175px;flex-shrink:0;border-right:1px solid ${PAPER_BORDER};background:${PAPER_PANEL};">
      <img src="${esc(z.portrait)}" style="width:175px;height:100%;object-fit:cover;display:block;filter:sepia(15%);" onerror="this.style.display='none'"/>
    </div>` : ''}
    <div style="flex:1;padding:1.1rem 1.4rem;font-family:'EB Garamond',serif;font-size:1rem;line-height:1.9;color:${PAPER_INK};overflow-y:auto;">
      ${z.text ? esc(z.text).replace(/\n/g, '<br>') : `<em style="opacity:.65;color:${PAPER_MUTED}">Kein Text eingetragen.</em>`}
    </div>
    ${tableHTML}
  </div>
  <div style="border-top:1px solid ${PAPER_BORDER};padding:.4rem 1.2rem;text-align:center;flex-shrink:0;background:${PAPER_PANEL};">
    <span style="font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.1em;color:${PAPER_MUTED};text-transform:uppercase;">Vermisst</span>
  </div>
</div>`;
  }

  function renderGeneric(z){
    const tdef = window.TafelZettelConfig.typeById(z.typ);
    const hasPortrait = !!z.portrait;
    const hasTable = !!(z.table && z.table.some(r => r.k));
    const tableHTML = hasTable ? `<div style="width:260px;flex-shrink:0;border-left:1px solid ${PAPER_BORDER};background:${PAPER_PANEL};overflow-y:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
      ${z.table.filter(r => r.k).map(r => `<tr>
        <td style="font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.04em;color:${PAPER_INK};background:${PAPER_LABEL};padding:5px 8px;border-bottom:1px solid ${PAPER_BORDER};width:36%;vertical-align:top;font-weight:700;">${esc(r.k)}</td>
        <td style="color:${PAPER_INK};padding:5px 8px;border-bottom:1px solid ${PAPER_BORDER};font-family:'EB Garamond',serif;vertical-align:middle;">${r.type === 'stars' ? starValue(r) : esc(r.v)}</td>
      </tr>`).join('')}
    </table>
  </div>` : '';
    return `<div style="background:${PAPER};min-height:300px;border-radius:4px;overflow:hidden;border:2px solid ${PAPER_BORDER};display:flex;flex-direction:column;">
  <div style="background:${PAPER_HEADER};padding:.7rem 1.4rem;text-align:center;border-bottom:2px solid ${PAPER_BORDER};flex-shrink:0;">
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.1rem;color:${PAPER_INK};">${esc(z.title || '')}</div>
    ${z.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:${PAPER_MUTED};font-size:.9rem;">${esc(z.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;flex:1;min-height:200px;">
    ${hasPortrait ? `<div style="width:160px;flex-shrink:0;border-right:1px solid ${PAPER_BORDER};background:${PAPER_PANEL};">
      <img src="${esc(z.portrait)}" style="width:160px;height:100%;object-fit:cover;display:block;filter:sepia(15%);" onerror="this.style.display='none'"/>
    </div>` : ''}
    <div style="flex:1;padding:1rem 1.3rem;font-family:'EB Garamond',serif;font-size:.97rem;line-height:1.85;color:${PAPER_INK};overflow-y:auto;">
      ${z.text ? esc(z.text).replace(/\n/g, '<br>') : `<em style="opacity:.65;color:${PAPER_MUTED}">Kein Text eingetragen.</em>`}
    </div>
    ${tableHTML}
  </div>
  <div style="border-top:1px solid ${PAPER_BORDER};padding:.4rem 1.2rem;text-align:center;flex-shrink:0;background:${PAPER_PANEL};">
    <span style="font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.1em;color:${PAPER_MUTED};text-transform:uppercase;">${esc(tdef.label)}</span>
  </div>
</div>`;
  }

  window.TafelZettelViews = {
    renderQuest,
    renderSteckbrief,
    renderZeitung,
    renderVermisst,
    renderGeneric,
    setSteckbriefPage
  };
})();
