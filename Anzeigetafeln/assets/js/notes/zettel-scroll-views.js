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

  function starValue(row){
    const value = Math.max(0, Math.min(5, parseInt(row.v, 10) || 0));
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
      ${z.bild || z.media?.bild ? `<figure class="quest-scene">${window.TafelNoticeMediaModel.render(z, 'bild', {label:'Illustration'})}</figure>` : ''}
      <div class="quest-layout">
        <aside class="quest-docket">
          ${window.TafelNoticeMediaModel.render(z, 'verfasser', {className:'quest-patron', label:'Auftraggeber', symbol:'⚜'})}
          ${client ? `<div class="quest-patron-name"><span>Ausgegeben von</span><strong>${esc(client)}</strong></div>` : ''}
          ${rows ? `<table class="medieval-info-table">${rows}</table>` : ''}
        </aside>
        <section class="quest-copy">
          <div class="quest-copy-ornament">${window.TafelNoticeMediaModel.render(z, 'emblem', {className:'quest-emblem', label:'Emblem', symbol:'❧', fit:'contain'})}</div>
          ${z.portrait || z.media?.portrait ? window.TafelNoticeMediaModel.render(z, 'portrait', {className:'quest-subject', label:'Porträt'}) : ''}
          ${txt || '<p class="medieval-empty">Der genaue Wortlaut des Auftrags wurde noch nicht angeschlagen.</p>'}
          ${z.unterschrift || z.media?.unterschrift ? window.TafelNoticeMediaModel.render(z, 'unterschrift', {className:'notice-signature', label:'Unterschrift', fit:'contain'}) : ''}
        </section>
      </div>
      <footer class="quest-footer">
        <div><span>Belohnung</span><strong>${esc(reward || 'nach Vereinbarung')}</strong></div>
        ${window.TafelNoticeMediaModel.render(z, 'siegel', {className:'quest-seal', label:'Siegel', symbol:'⚔', fit:'contain'})}
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
    const people = z.personen?.length ? z.personen : [z];
    return window.TafelZettelDocuments.wanted(z, people[page] || people[0], page, people.length);
  }

  function renderSteckbrief(z){ return steckbriefPageHTML(z, 0); }
  function renderZeitung(z){ return window.TafelZettelDocuments.render(z); }
  function renderVermisst(z){ return window.TafelZettelDocuments.render(z); }
  function renderGeneric(z){ return window.TafelZettelDocuments.render(z); }

  function renderComments(z){
    return window.TafelZettelComments ? window.TafelZettelComments.render(z) : '';
  }

  function renderByType(z){
    if(z.typ === 'quest') return renderQuest(z);
    if(z.typ === 'steckbrief') return renderSteckbrief(z);
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
    if(mode === 'notice-media' && parent){
      image.remove();
      parent.classList.remove('has-image');
      return;
    }
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
