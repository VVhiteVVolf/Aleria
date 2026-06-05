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

  function starValue(row){
    const value = parseInt(row.v, 10) || 0;
    return '<span style="color:#c8a84b;letter-spacing:1px;">' + '\u2605'.repeat(value) + '</span><span style="opacity:.3;">' + '\u2605'.repeat(5 - value) + '</span>';
  }

  function renderQuest(z){
    let txt = esc(z.text || '');
    txt = txt.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
    const P = 'linear-gradient(162deg,#f4e8c4 0%,#ead9a0 30%,#dfc870 60%,#ead9a0 100%)';
    const H = 'linear-gradient(90deg,#2a1400,#6a3e08,#b07810,#d4a020,#b07810,#6a3e08,#2a1400)';
    const hasPortrait = !!(z.verfasser || z.verfasserName);
    const hasTable = !!(z.table && z.table.some(r => r.k));
    const hasLeft = hasPortrait || hasTable;
    return `<div style="background:${P};min-height:400px;border-radius:4px;overflow:hidden;border:1px solid #7a500a;">
  <div style="background:${H};padding:.7rem 1.4rem;text-align:center;border-bottom:2px solid #7a500a;">
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.3rem;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.4);">${esc(z.title || '')}</div>
    ${z.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:#f0e0b0;">${esc(z.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;min-height:280px;">
    ${hasLeft ? `<div style="width:160px;flex-shrink:0;border-right:1px solid rgba(100,70,20,.25);display:flex;flex-direction:column;align-items:center;padding:.8rem .6rem;gap:.5rem;background:rgba(180,130,40,.06);">
      ${hasPortrait ? `
        ${z.verfasser ? `<img src="${esc(z.verfasser)}" style="width:110px;height:110px;border-radius:50%;border:2px solid #8a6510;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,.25);flex-shrink:0;" onerror="this.style.display='none'"/>` :
          `<div style="width:110px;height:110px;border-radius:50%;border:2px dashed rgba(100,70,20,.35);background:rgba(180,130,40,.1);flex-shrink:0;"></div>`}
        ${z.verfasserName ? `<div style="font-family:'Georgia',serif;font-size:.88rem;color:#3d1e04;text-align:center;font-style:italic;line-height:1.3;">${esc(z.verfasserName)}</div>` : ''}
      ` : ''}
      ${hasTable ? `<table style="width:100%;border-collapse:collapse;font-size:.72rem;">
        ${z.table.filter(r => r.k).map(r => `<tr>
          <td style="font-family:'Cinzel',serif;font-size:.58rem;text-transform:uppercase;letter-spacing:.04em;
            color:#4a2800;background:rgba(180,130,40,.22);padding:3px 6px;border-bottom:1px solid rgba(100,70,20,.2);">${esc(r.k)}</td>
          <td style="color:#3d1e04;padding:3px 6px;border-bottom:1px solid rgba(100,70,20,.2);font-family:'EB Garamond',serif;">${r.type === 'stars' ? starValue(r) : esc(r.v)}</td>
        </tr>`).join('')}
      </table>` : ''}
    </div>` : ''}
    <div style="flex:1;padding:1rem 1.3rem;font-family:'EB Garamond',serif;font-size:1rem;line-height:1.88;color:#2a1200;${!hasLeft ? 'text-align:justify;' : ''}">
      ${txt || '<em style="opacity:.5;color:#8b6914">Kein Text eingetragen.</em>'}
    </div>
  </div>
  <div style="border-top:1px solid #c8a84b;padding:.4rem 1.2rem;text-align:center;background:#ede0b0;">
    <span style="font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.1em;color:#5a3a08;text-transform:uppercase;">Quest / Auftrag</span>
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
    const P = 'linear-gradient(162deg,#f4e8c4 0%,#ead9a0 30%,#dfc870 60%,#ead9a0 100%)';
    const hasPortrait = !!p.portrait;
    const hasTable = !!(p.table && p.table.some(r => r.k));
    const tableHTML = hasTable ? `<div style="width:300px;flex-shrink:0;border-left:1px solid #c8a84b;background:#f0e8c0;overflow-y:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
      ${p.table.filter(r => r.k).map(r => `<tr>
        <td style="font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.04em;color:#1a1200;background:#ede0b0;padding:5px 8px;border-bottom:1px solid #c8a84b;width:36%;vertical-align:top;font-weight:700;">${esc(r.k)}</td>
        <td style="color:#1a1200;padding:5px 8px;border-bottom:1px solid #c8a84b;font-family:'EB Garamond',serif;vertical-align:middle;">${r.type === 'stars' ? starValue(r) : esc(r.v)}</td>
      </tr>`).join('')}
    </table>
  </div>` : '';
    return `<div style="background:${P};min-height:420px;border-radius:4px;overflow:hidden;border:2px solid #c8a84b;display:flex;flex-direction:column;">
  <div style="background:linear-gradient(90deg,#3a0800,#7a1a04,#3a0800);padding:.9rem 1.4rem;text-align:center;border-bottom:3px solid #c8a84b;flex-shrink:0;">
    <div style="font-family:'Cinzel Decorative',serif;font-size:2.2rem;letter-spacing:.2em;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5);">GESUCHT</div>
    <div style="font-family:'Cinzel',serif;font-size:1.05rem;color:#f5e9c8;margin-top:.2rem;letter-spacing:.04em;">${esc(p.title || z.title || 'Unbekannte Person')}</div>
    ${p.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:#f0e0b0;font-size:.9rem;">${esc(p.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;flex:1;min-height:280px;">
    ${hasPortrait ? `<div style="width:175px;flex-shrink:0;border-right:1px solid #c8a84b;background:#ede0b0;">
      <img src="${esc(p.portrait)}" style="width:175px;height:100%;object-fit:cover;display:block;filter:sepia(15%);" onerror="this.style.display='none'"/>
    </div>` : ''}
    <div style="flex:1;padding:1.1rem 1.4rem;font-family:'EB Garamond',serif;font-size:1rem;line-height:1.9;color:#1a1200;overflow-y:auto;">
      ${p.text ? esc(p.text).replace(/\n/g, '<br>') : '<em style="opacity:.5;color:#8b6914">Kein Text eingetragen.</em>'}
    </div>
    ${tableHTML}
  </div>
  ${total > 1 ? `<div style="border-top:1px solid #c8a84b;padding:.5rem 1.2rem;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:#ede0b0;">
    <button data-action="zettel-set-page" data-zettel-id="${zid}" data-page="${page - 1}" ${page === 0 ? 'disabled' : ''} style="font-family:'Cinzel',serif;font-size:.75rem;padding:3px 14px;border:1px solid rgba(90,40,0,.4);border-radius:2px;background:${page === 0 ? 'transparent' : 'rgba(180,130,40,.15)'};color:${page === 0 ? 'rgba(90,40,0,.3)' : '#5a2000'};cursor:${page === 0 ? 'default' : 'pointer'};">Zurueck</button>
    <div style="font-family:'Cinzel',serif;font-size:.68rem;letter-spacing:.1em;color:#5a3a08;text-align:center;">
      <div>Person ${page + 1} / ${total}</div>
      <div style="display:flex;gap:4px;justify-content:center;margin-top:3px;">
        ${pers.map((_, i) => `<div data-action="zettel-set-page" data-zettel-id="${zid}" data-page="${i}" style="width:7px;height:7px;border-radius:50%;background:${i === page ? '#7a3000' : 'rgba(122,48,0,.25)'};cursor:pointer;"></div>`).join('')}
      </div>
    </div>
    <button data-action="zettel-set-page" data-zettel-id="${zid}" data-page="${page + 1}" ${page === total - 1 ? 'disabled' : ''} style="font-family:'Cinzel',serif;font-size:.75rem;padding:3px 14px;border:1px solid rgba(90,40,0,.4);border-radius:2px;background:${page === total - 1 ? 'transparent' : 'rgba(180,130,40,.15)'};color:${page === total - 1 ? 'rgba(90,40,0,.3)' : '#5a2000'};cursor:${page === total - 1 ? 'default' : 'pointer'};">Weiter</button>
  </div>` : `<div style="border-top:1px solid #c8a84b;padding:.4rem 1.2rem;text-align:center;background:#ede0b0;">
    <span style="font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.1em;color:#5a3a08;text-transform:uppercase;">Steckbrief - Tot oder lebendig</span>
  </div>`}
</div>`;
  }

  function renderSteckbrief(z){
    steckbriefPage = 0;
    return steckbriefPageHTML(z, 0);
  }

  function renderZeitung(z){
    const P = 'linear-gradient(162deg,#f5e9c8 0%,#ead9a0 42%,#f3e7c0 100%)';
    const H = 'linear-gradient(90deg,#111820,#2c3442,#5c6678,#2c3442,#111820)';
    const artikel = Array.isArray(z.artikel) && z.artikel.length ? z.artikel : [{titel:z.title || 'Artikel', text:z.text || ''}];
    const hasImage = !!z.bild;
    return `<div style="background:${P};min-height:420px;border-radius:4px;overflow:hidden;border:2px solid #9c8750;display:flex;flex-direction:column;">
  <div style="background:${H};padding:.75rem 1.4rem;text-align:center;border-bottom:2px solid #c8a84b;flex-shrink:0;">
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.3rem;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.4);">${esc(z.verfasserName || z.title || 'Alerische Rundschau')}</div>
    ${z.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:#f0e0b0;">${esc(z.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;gap:1rem;padding:1rem 1.2rem;flex:1;min-height:300px;">
    ${hasImage ? `<div style="width:220px;flex-shrink:0;border:1px solid #b9a062;background:#e8d8a8;padding:.35rem;height:max-content;">
      <img src="${esc(z.bild)}" style="width:100%;max-height:260px;object-fit:cover;display:block;filter:sepia(12%);" onerror="this.parentElement.style.display='none'"/>
    </div>` : ''}
    <div style="flex:1;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;font-family:'EB Garamond',serif;color:#1a1200;">
      ${artikel.map((a, i) => `<article style="border-left:${i ? '1px solid rgba(90,60,20,.22)' : '0'};padding-left:${i ? '.9rem' : '0'};">
        <h3 style="font-family:'Cinzel',serif;font-size:.95rem;letter-spacing:.04em;margin:0 0 .45rem;color:#1d2028;text-transform:uppercase;">${esc(a.titel || ('Artikel ' + (i + 1)))}</h3>
        <div style="font-size:.98rem;line-height:1.75;text-align:justify;">${a.text ? esc(a.text).replace(/\n/g, '<br>') : '<em style="opacity:.5;color:#8b6914">Kein Text eingetragen.</em>'}</div>
      </article>`).join('')}
    </div>
  </div>
  <div style="border-top:1px solid rgba(100,70,20,.25);padding:.4rem 1.2rem;text-align:center;flex-shrink:0;background:rgba(180,130,40,.08);">
    <span style="font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.1em;color:#5a3a08;text-transform:uppercase;">Zeitungsartikel</span>
  </div>
</div>`;
  }

  function renderVermisst(z){
    const P = 'linear-gradient(162deg,#f4e8c4 0%,#ead9a0 30%,#dfc870 60%,#ead9a0 100%)';
    const H = 'linear-gradient(90deg,#2a1400,#6a3e08,#b07810,#d4a020,#b07810,#6a3e08,#2a1400)';
    const hasPortrait = !!z.portrait;
    const hasTable = !!(z.table && z.table.some(r => r.k));
    const tableHTML = hasTable ? `<div style="width:280px;flex-shrink:0;border-left:1px solid #c8a84b;background:#f0e8c0;overflow-y:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
      ${z.table.filter(r => r.k).map(r => `<tr>
        <td style="font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.04em;color:#1a1200;background:#ede0b0;padding:5px 8px;border-bottom:1px solid #c8a84b;width:36%;vertical-align:top;font-weight:700;">${esc(r.k)}</td>
        <td style="color:#1a1200;padding:5px 8px;border-bottom:1px solid #c8a84b;font-family:'EB Garamond',serif;vertical-align:middle;">${r.type === 'stars' ? starValue(r) : esc(r.v)}</td>
      </tr>`).join('')}
    </table>
  </div>` : '';
    return `<div style="background:${P};min-height:380px;border-radius:4px;overflow:hidden;border:2px solid #c8a84b;display:flex;flex-direction:column;">
  <div style="background:${H};padding:.7rem 1.4rem;text-align:center;border-bottom:2px solid #c8a84b;flex-shrink:0;">
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.3rem;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.4);">${esc(z.title || '')}</div>
    ${z.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:#f0e0b0;">${esc(z.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;flex:1;min-height:280px;">
    ${hasPortrait ? `<div style="width:175px;flex-shrink:0;border-right:1px solid #c8a84b;background:#ede0b0;">
      <img src="${esc(z.portrait)}" style="width:175px;height:100%;object-fit:cover;display:block;filter:sepia(15%);" onerror="this.style.display='none'"/>
    </div>` : ''}
    <div style="flex:1;padding:1.1rem 1.4rem;font-family:'EB Garamond',serif;font-size:1rem;line-height:1.9;color:#1a1200;overflow-y:auto;">
      ${z.text ? esc(z.text).replace(/\n/g, '<br>') : '<em style="opacity:.5;color:#8b6914">Kein Text eingetragen.</em>'}
    </div>
    ${tableHTML}
  </div>
  <div style="border-top:1px solid rgba(100,70,20,.25);padding:.4rem 1.2rem;text-align:center;flex-shrink:0;background:rgba(180,130,40,.08);">
    <span style="font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.1em;color:#5a3a08;text-transform:uppercase;">Vermisst</span>
  </div>
</div>`;
  }

  function renderGeneric(z){
    const tdef = window.TafelZettelConfig.typeById(z.typ);
    const P = 'linear-gradient(162deg,#f4e8c4 0%,#ead9a0 30%,#dfc870 60%,#ead9a0 100%)';
    const H = 'linear-gradient(90deg,#2a1400,#6a3e08,#b07810,#d4a020,#b07810,#6a3e08,#2a1400)';
    const hasPortrait = !!z.portrait;
    const hasTable = !!(z.table && z.table.some(r => r.k));
    const tableHTML = hasTable ? `<div style="width:260px;flex-shrink:0;border-left:1px solid #c8a84b;background:#f0e8c0;overflow-y:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
      ${z.table.filter(r => r.k).map(r => `<tr>
        <td style="font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.04em;color:#1a1200;background:#ede0b0;padding:5px 8px;border-bottom:1px solid #c8a84b;width:36%;vertical-align:top;font-weight:700;">${esc(r.k)}</td>
        <td style="color:#1a1200;padding:5px 8px;border-bottom:1px solid #c8a84b;font-family:'EB Garamond',serif;vertical-align:middle;">${r.type === 'stars' ? starValue(r) : esc(r.v)}</td>
      </tr>`).join('')}
    </table>
  </div>` : '';
    return `<div style="background:${P};min-height:300px;border-radius:4px;overflow:hidden;border:2px solid #c8a84b;display:flex;flex-direction:column;">
  <div style="background:${H};padding:.7rem 1.4rem;text-align:center;border-bottom:2px solid #c8a84b;flex-shrink:0;">
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.1rem;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.4);">${esc(z.title || '')}</div>
    ${z.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:#f0e0b0;font-size:.9rem;">${esc(z.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;flex:1;min-height:200px;">
    ${hasPortrait ? `<div style="width:160px;flex-shrink:0;border-right:1px solid #c8a84b;background:#ede0b0;">
      <img src="${esc(z.portrait)}" style="width:160px;height:100%;object-fit:cover;display:block;filter:sepia(15%);" onerror="this.style.display='none'"/>
    </div>` : ''}
    <div style="flex:1;padding:1rem 1.3rem;font-family:'EB Garamond',serif;font-size:.97rem;line-height:1.85;color:#1a1200;overflow-y:auto;">
      ${z.text ? esc(z.text).replace(/\n/g, '<br>') : '<em style="opacity:.5;color:#8b6914">Kein Text eingetragen.</em>'}
    </div>
    ${tableHTML}
  </div>
  <div style="border-top:1px solid rgba(100,70,20,.25);padding:.4rem 1.2rem;text-align:center;flex-shrink:0;background:rgba(180,130,40,.08);">
    <span style="font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.1em;color:#8a6510;text-transform:uppercase;">${esc(tdef.label)}</span>
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
