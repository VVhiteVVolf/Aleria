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
  function richHtml(value){
    return window.TafelZettelRichText.renderHtml(value || '');
  }

  function clampNumber(value, min, max, fallback){
    const number = Number(value);
    if(!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, Math.round(number)));
  }

  function sideWidth(source, fallback, min = 120, max = 420){
    return clampNumber(source?.sideWidth, min, max, fallback);
  }

  function imageFit(source){
    return source?.imageFit === 'contain' ? 'contain' : 'cover';
  }

  function imagePosition(source){
    return ['top','center','bottom'].includes(source?.imagePosition) ? source.imagePosition : 'center';
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

  function infoRows(rows){
    return (rows || []).filter(row => row.k || row.v).map(row => `<tr>
      <th>${esc(row.k)}</th>
      <td>${row.type === 'stars' ? starValue(row) : esc(row.v)}</td>
    </tr>`).join('');
  }

  function valueFor(rows, label){
    const needle = String(label || '').toLocaleLowerCase('de');
    return (rows || []).find(row => String(row.k || '').toLocaleLowerCase('de').includes(needle))?.v || '';
  }

  function renderQuest(z){
    const txt = richHtml(z.text || '');
    const rows = infoRows(z.table);
    const reward = valueFor(z.table, 'belohnung');
    const deadline = valueFor(z.table, 'frist');
    const client = z.verfasserName || valueFor(z.table, 'auftraggeber');
    return `<article class="zettel-rich-content medieval-notice medieval-notice--quest">
      <div class="medieval-notice-corner medieval-notice-corner--left"></div>
      <div class="medieval-notice-corner medieval-notice-corner--right"></div>
      <header class="quest-header">
        <span class="quest-kicker">Öffentlicher Auftrag</span>
        <h2>${esc(z.title || 'Unbenannter Auftrag')}</h2>
        ${z.untertitel ? `<p>${esc(z.untertitel)}</p>` : ''}
      </header>
      ${z.bild ? `<figure class="quest-scene"><img src="${esc(z.bild)}" alt="" data-image-fallback="remove-parent" style="object-fit:${imageFit(z)};object-position:${imagePosition(z)}"></figure>` : ''}
      <div class="quest-layout">
        <aside class="quest-docket">
          ${z.verfasser ? `<div class="quest-patron"><img src="${esc(z.verfasser)}" alt="" data-image-fallback="quest-patron" style="object-fit:${imageFit(z)};object-position:${imagePosition(z)}"></div>` : '<div class="quest-patron quest-patron--empty">⚜</div>'}
          ${client ? `<div class="quest-patron-name"><span>Ausgegeben von</span><strong>${esc(client)}</strong></div>` : ''}
          ${rows ? `<table class="medieval-info-table">${rows}</table>` : ''}
        </aside>
        <section class="quest-copy">
          <div class="quest-copy-ornament">❧</div>
          ${txt || '<p class="medieval-empty">Der genaue Wortlaut des Auftrags wurde noch nicht angeschlagen.</p>'}
        </section>
      </div>
      <footer class="quest-footer">
        <div><span>Belohnung</span><strong>${esc(reward || 'nach Vereinbarung')}</strong></div>
        <div class="quest-seal" aria-hidden="true">⚔</div>
        <div><span>Frist</span><strong>${esc(deadline || 'offen')}</strong></div>
      </footer>
    </article>`;
  }

  function setSteckbriefPage(zid, page){
    const z = state().zettel.find(x => x.id === zid);
    if(!z) return;
    const pers = z.personen && z.personen.length ? z.personen : [{portrait:'', title:'', untertitel:'', text:'', table:[]}];
    steckbriefPage = Math.max(0, Math.min(pers.length - 1, page));
    document.getElementById('scroll-content').innerHTML = steckbriefPageHTML(z, steckbriefPage) + renderComments(z);
  }

  function steckbriefPageHTML(z, page){
    const pers = z.personen && z.personen.length ? z.personen : [{portrait:'', title:'', untertitel:'', text:'', table:[]}];
    const p = pers[page] || pers[0];
    const total = pers.length;
    const zid = z.id;
    const rows = infoRows(p.table);
    const bounty = valueFor(p.table, 'kopfgeld');
    const crimes = valueFor(p.table, 'verbrechen') || valueFor(p.table, 'vergehen');
    return `<article class="zettel-rich-content medieval-notice medieval-notice--wanted">
      <header class="wanted-header">
        <span class="wanted-authority">Im Namen von Recht und Krone</span>
        <h2>Gesucht</h2>
        <strong>${esc(p.title || z.title || 'Unbekannte Person')}</strong>
        ${p.untertitel ? `<p>${esc(p.untertitel)}</p>` : ''}
      </header>
      <div class="wanted-layout">
        <figure class="wanted-portrait${p.portrait ? '' : ' wanted-portrait--empty'}">
          ${p.portrait ? `<img src="${esc(p.portrait)}" alt="" data-image-fallback="wanted-portrait" style="object-fit:${imageFit(p)};object-position:${imagePosition(p)}">` : '<span>?</span>'}
          <figcaption>${esc(crimes || 'zur Ergreifung ausgeschrieben')}</figcaption>
        </figure>
        <section class="wanted-record">
          <div class="wanted-copy">${richHtml(p.text) || '<p class="medieval-empty">Weitere Angaben werden durch die Obrigkeit ergänzt.</p>'}</div>
          ${rows ? `<table class="medieval-info-table medieval-info-table--wanted">${rows}</table>` : ''}
        </section>
      </div>
      <div class="wanted-reward"><span>Ausgesetztes Kopfgeld</span><strong>${esc(bounty || 'nach Maßgabe der Obrigkeit')}</strong></div>
      ${total > 1 ? `<nav class="wanted-pages">
        <button data-action="zettel-set-page" data-zettel-id="${zid}" data-page="${page - 1}" ${page === 0 ? 'disabled' : ''}>Zurück</button>
        <span>Steckbrief ${page + 1} von ${total}</span>
        <button data-action="zettel-set-page" data-zettel-id="${zid}" data-page="${page + 1}" ${page === total - 1 ? 'disabled' : ''}>Weiter</button>
      </nav>` : '<footer class="wanted-footer">Hinweise sind unverzüglich der nächsten Wache zu melden.</footer>'}
    </article>`;
  }

  function renderSteckbrief(z){
    steckbriefPage = 0;
    return steckbriefPageHTML(z, 0);
  }

  function renderZeitung(z){
    const artikel = Array.isArray(z.artikel) && z.artikel.length ? z.artikel : [{titel:z.title || 'Artikel', text:z.text || ''}];
    const hasImage = !!z.bild;
    const imageWidth = sideWidth(z, 220, 160, 420);
    return `<div class="zettel-rich-content" style="background:${PAPER};min-height:420px;border-radius:4px;overflow:hidden;border:2px solid ${PAPER_BORDER};display:flex;flex-direction:column;">
  <div style="background:${NEWS_HEADER};padding:.75rem 1.4rem;text-align:center;border-bottom:2px solid ${PAPER_BORDER};flex-shrink:0;">
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.3rem;color:${PAPER_INK};">${esc(z.verfasserName || z.title || 'Alerische Rundschau')}</div>
    ${z.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:${PAPER_MUTED};">${esc(z.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;gap:1rem;padding:1rem 1.2rem;flex:1;min-height:300px;">
    ${hasImage ? `<div style="width:${imageWidth}px;flex-shrink:0;border:1px solid ${PAPER_BORDER};background:${PAPER_PANEL};padding:.35rem;height:max-content;">
      <img src="${esc(z.bild)}" data-image-fallback="hide-parent" style="width:100%;height:260px;object-fit:${imageFit(z)};object-position:${imagePosition(z)};display:block;filter:sepia(12%);"/>
    </div>` : ''}
    <div style="flex:1;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;font-family:'EB Garamond',serif;color:${PAPER_INK};">
      ${artikel.map((a, i) => `<article style="border-left:${i ? `1px solid ${PAPER_BORDER}` : '0'};padding-left:${i ? '.9rem' : '0'};">
        <h3 style="font-family:'Cinzel',serif;font-size:.95rem;letter-spacing:.04em;margin:0 0 .45rem;color:${PAPER_INK};text-transform:uppercase;">${esc(a.titel || ('Artikel ' + (i + 1)))}</h3>
        <div style="font-size:.98rem;line-height:1.75;text-align:justify;">${richHtml(a.text) || `<em style="opacity:.65;color:${PAPER_MUTED}">Kein Text eingetragen.</em>`}</div>
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
    const portraitWidth = sideWidth(z, 175, 130, 320);
    const tableHTML = hasTable ? `<div style="width:280px;flex-shrink:0;border-left:1px solid ${PAPER_BORDER};background:${PAPER_PANEL};overflow-y:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
      ${z.table.filter(r => r.k).map(r => `<tr>
        <td style="font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.04em;color:${PAPER_INK};background:${PAPER_LABEL};padding:5px 8px;border-bottom:1px solid ${PAPER_BORDER};width:36%;vertical-align:top;font-weight:700;">${esc(r.k)}</td>
        <td style="color:${PAPER_INK};padding:5px 8px;border-bottom:1px solid ${PAPER_BORDER};font-family:'EB Garamond',serif;vertical-align:middle;">${r.type === 'stars' ? starValue(r) : esc(r.v)}</td>
      </tr>`).join('')}
    </table>
  </div>` : '';
    return `<div class="zettel-rich-content" style="background:${PAPER};min-height:380px;border-radius:4px;overflow:hidden;border:2px solid ${PAPER_BORDER};display:flex;flex-direction:column;">
  <div style="background:${PAPER_HEADER};padding:.7rem 1.4rem;text-align:center;border-bottom:2px solid ${PAPER_BORDER};flex-shrink:0;">
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.3rem;color:${PAPER_INK};">${esc(z.title || '')}</div>
    ${z.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:${PAPER_MUTED};">${esc(z.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;flex:1;min-height:280px;">
    ${hasPortrait ? `<div style="width:${portraitWidth}px;flex-shrink:0;border-right:1px solid ${PAPER_BORDER};background:${PAPER_PANEL};">
      <img src="${esc(z.portrait)}" data-image-fallback="hide-self" style="width:${portraitWidth}px;height:100%;object-fit:${imageFit(z)};object-position:${imagePosition(z)};display:block;filter:sepia(15%);"/>
    </div>` : ''}
    <div style="flex:1;padding:1.1rem 1.4rem;font-family:'EB Garamond',serif;font-size:1rem;line-height:1.9;color:${PAPER_INK};overflow-y:auto;">
      ${richHtml(z.text) || `<em style="opacity:.65;color:${PAPER_MUTED}">Kein Text eingetragen.</em>`}
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
    const portraitWidth = sideWidth(z, 160, 130, 320);
    const tableHTML = hasTable ? `<div style="width:260px;flex-shrink:0;border-left:1px solid ${PAPER_BORDER};background:${PAPER_PANEL};overflow-y:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
      ${z.table.filter(r => r.k).map(r => `<tr>
        <td style="font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.04em;color:${PAPER_INK};background:${PAPER_LABEL};padding:5px 8px;border-bottom:1px solid ${PAPER_BORDER};width:36%;vertical-align:top;font-weight:700;">${esc(r.k)}</td>
        <td style="color:${PAPER_INK};padding:5px 8px;border-bottom:1px solid ${PAPER_BORDER};font-family:'EB Garamond',serif;vertical-align:middle;">${r.type === 'stars' ? starValue(r) : esc(r.v)}</td>
      </tr>`).join('')}
    </table>
  </div>` : '';
    return `<div class="zettel-rich-content" style="background:${PAPER};min-height:300px;border-radius:4px;overflow:hidden;border:2px solid ${PAPER_BORDER};display:flex;flex-direction:column;">
  <div style="background:${PAPER_HEADER};padding:.7rem 1.4rem;text-align:center;border-bottom:2px solid ${PAPER_BORDER};flex-shrink:0;">
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.1rem;color:${PAPER_INK};">${esc(z.title || '')}</div>
    ${z.untertitel ? `<div style="font-family:'EB Garamond',serif;font-style:italic;color:${PAPER_MUTED};font-size:.9rem;">${esc(z.untertitel)}</div>` : ''}
  </div>
  <div style="display:flex;flex:1;min-height:200px;">
    ${hasPortrait ? `<div style="width:${portraitWidth}px;flex-shrink:0;border-right:1px solid ${PAPER_BORDER};background:${PAPER_PANEL};">
      <img src="${esc(z.portrait)}" data-image-fallback="hide-self" style="width:${portraitWidth}px;height:100%;object-fit:${imageFit(z)};object-position:${imagePosition(z)};display:block;filter:sepia(15%);"/>
    </div>` : ''}
    <div style="flex:1;padding:1rem 1.3rem;font-family:'EB Garamond',serif;font-size:.97rem;line-height:1.85;color:${PAPER_INK};overflow-y:auto;">
      ${richHtml(z.text) || `<em style="opacity:.65;color:${PAPER_MUTED}">Kein Text eingetragen.</em>`}
    </div>
    ${tableHTML}
  </div>
  <div style="border-top:1px solid ${PAPER_BORDER};padding:.4rem 1.2rem;text-align:center;flex-shrink:0;background:${PAPER_PANEL};">
    <span style="font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.1em;color:${PAPER_MUTED};text-transform:uppercase;">${esc(tdef.label)}</span>
  </div>
</div>`;
  }

  function renderComments(z){
    return window.TafelZettelComments ? window.TafelZettelComments.render(z) : '';
  }

  function renderByType(z){
    if(z.typ === 'quest') return renderQuest(z);
    if(z.typ === 'steckbrief'){
      if(!z.personen || !z.personen.length){
        z.personen = [{portrait:z.portrait || '', title:z.title || '', untertitel:z.untertitel || '', text:z.text || '', table:(z.table || []).map(r => ({...r}))}];
      }
      return renderSteckbrief(z);
    }
    if(z.typ === 'zeitung') return renderZeitung(z);
    if(z.typ === 'vermisst') return renderVermisst(z);
    return renderGeneric(z);
  }

  function renderLive(z){
    return renderByType(z) + renderComments(z);
  }

  function handleImageError(image){
    const mode = image?.dataset?.imageFallback;
    const parent = image?.parentElement;
    if(mode === 'remove-parent') parent?.remove();
    if(mode === 'hide-parent' && parent) parent.hidden = true;
    if(mode === 'hide-self' && image) image.hidden = true;
    if(mode === 'quest-patron' && parent){
      parent.classList.add('quest-patron--empty');
      parent.textContent = '⚜';
    }
    if(mode === 'wanted-portrait' && parent){
      parent.classList.add('wanted-portrait--empty');
      image.remove();
      parent.insertAdjacentHTML('afterbegin', '<span>?</span>');
    }
  }

  window.TafelZettelViews = {
    renderQuest,
    renderSteckbrief,
    renderZeitung,
    renderVermisst,
    renderGeneric,
    renderByType,
    renderLive,
    setSteckbriefPage,
    handleImageError
  };
})();
