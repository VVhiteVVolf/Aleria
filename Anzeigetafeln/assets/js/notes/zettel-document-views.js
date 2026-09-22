(function () {
  'use strict';
  const esc = value => window.TafelRuntime.esc(value);
  const rich = value => window.TafelZettelRichText.renderHtml(value || '');
  const media = (source, field, options) => window.TafelNoticeMediaModel.render(source, field, options);
  const styles = {
    notiz: { kicker: 'Worte an die Nachbarschaft', label: 'Öffentliche Mitteilung', symbol: '❧' },
    vermisst: { kicker: 'Jeder Hinweis kann helfen', label: 'Vermisst', symbol: '♙' },
    ankuendigung: { kicker: 'Hört, hört', label: 'Ankündigung', symbol: '✧' },
    zeitung: { kicker: 'Nachrichten aus Aleria', label: 'Zeitungsartikel', symbol: '❦' },
    handel: { kicker: 'Angebot & Nachfrage', label: 'Am Marktplatz', symbol: '⚖' },
    erlass: { kicker: 'Kund und zu wissen', label: 'Amtlicher Erlass', symbol: '⚜' },
    einladung: { kicker: 'In guter Gesellschaft', label: 'Einladung', symbol: '✧' },
    steckbrief: { kicker: 'Im Namen von Recht und Krone', label: 'Gesucht', symbol: '⚔' },
  };

  function facts(rows) {
    const filled = (rows || []).filter(row => String(row.v ?? '').trim());
    if (!filled.length) return '';
    return `<dl class="notice-facts">${filled.map(row => {
      const stars = Math.max(0, Math.min(5, parseInt(row.v, 10) || 0));
      const value = row.type === 'stars' ? `<span class="notice-stars" aria-label="${stars} von 5 Sternen">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</span>` : esc(row.v);
      return `<div class="notice-fact"><dt>${esc(row.k || 'Hinweis')}</dt><dd>${value}</dd></div>`;
    }).join('')}</dl>`;
  }

  function footer(z) {
    const author = z.verfasserName || (z.table || []).find(row => /^(quelle|kontakt|ausgestellt von|veranstalter|herausgeber|gastgeber)$/i.test(row.k) && row.v)?.v;
    return `<footer class="notice-signoff">
      <div class="notice-author">${media(z, 'verfasser', { className: 'notice-author-portrait', label: 'Verfasser', symbol: '♙' })}
        <div><span class="notice-eyebrow">Ausgegeben von</span><strong>${esc(author || 'Unbekannter Verfasser')}</strong></div></div>
      ${media(z, 'unterschrift', { className: 'notice-signature', label: 'Unterschrift', symbol: '✒︎', fit: 'contain' })}
      ${media(z, 'siegel', { className: 'notice-seal', label: 'Siegel', symbol: '⚜', fit: 'contain' })}
    </footer>`;
  }

  function header(z, style, title) {
    return `<header class="notice-heading">
      ${media(z, 'emblem', { className: 'notice-emblem', label: 'Emblem', symbol: style.symbol, fit: 'contain' })}
      <div><span class="notice-eyebrow">${style.kicker}</span><h2>${esc(title || z.title || style.label)}</h2>${z.untertitel ? `<p class="notice-subtitle">${esc(z.untertitel)}</p>` : ''}</div>
      <span class="notice-edition">${style.label}</span>
    </header>`;
  }

  function copy(text) {
    return `<div class="notice-copy">${rich(text) || '<p class="notice-empty">Der Wortlaut wird noch ergänzt.</p>'}</div>`;
  }

  function illustration(z, field = 'bild') {
    if (!z[field] && !z.media?.[field]) return '';
    return `<figure class="notice-illustration">${media(z, field, { label: 'Illustration' })}</figure>`;
  }

  function missing(z) {
    const name = (z.table || []).find(row => /^name$/i.test(row.k))?.v;
    return `<section class="notice-subject">
      <figure class="notice-subject-portrait">${media(z, 'portrait', { label: name || 'Gesuchte Person, Tier oder Gegenstand', symbol: '♙' })}<figcaption>${esc(name || 'Hinweise erbeten')}</figcaption></figure>
      <div><span class="notice-eyebrow">Auf einen Blick</span>${facts(z.table) || '<p class="notice-empty">Kennzeichen und Hinweise folgen.</p>'}</div>
    </section>${illustration(z)}${copy(z.text)}`;
  }

  function newspaper(z) {
    const articles = z.artikel?.length ? z.artikel : [{ titel: z.title, text: z.text }];
    return `${facts(z.table)}${z.datum ? `<p class="notice-news-date">${esc(z.datum)}</p>` : ''}${illustration(z)}${illustration(z, 'portrait')}
      <div class="notice-news-articles">${articles.map((article, index) => `<section class="notice-news-article"><span class="notice-eyebrow">${String(index + 1).padStart(2, '0')} / ${esc(z.verlag || 'Der Stadtbote')}</span><h3>${esc(article.titel || `Artikel ${index + 1}`)}</h3>${copy(article.text)}</section>`).join('')}</div>`;
  }

  function render(z) {
    const type = styles[z.typ] ? z.typ : 'notiz';
    const style = styles[type];
    const title = type === 'zeitung' ? z.verlag || z.verfasserName || z.title : z.title;
    const body = type === 'vermisst' ? missing(z) : type === 'zeitung' ? newspaper(z)
      : `${facts(z.table)}${illustration(z)}${illustration(z, 'portrait')}${copy(z.text)}`;
    return `<article class="zettel-rich-content notice-document notice-document--${type}" style="--notice-portrait-width:${portraitWidth(z)}px">
      ${header(z, style, title)}<div class="notice-document-body">${body}</div>${footer(z)}</article>`;
  }

  function portraitWidth(z) { return Math.max(120, Math.min(320, Number(z.sideWidth) || 180)); }

  function wanted(z, person, page, total) {
    const bounty = (person.table || []).find(row => /kopfgeld/i.test(row.k))?.v;
    return `<article class="zettel-rich-content notice-document notice-document--steckbrief" style="--notice-portrait-width:${portraitWidth(z)}px">
      ${header({ ...z, title: 'Gesucht', untertitel: person.untertitel || z.untertitel }, styles.steckbrief)}
      <div class="notice-document-body"><section class="notice-subject">
        <figure class="notice-subject-portrait">${media(person, 'portrait', { label: person.title || z.title || 'Gesuchte Person', symbol: '♙' })}<figcaption>Zur Ergreifung ausgeschrieben</figcaption></figure>
        <div><h3 class="notice-person-name">${esc(person.title || z.title || 'Unbekannte Person')}</h3>${facts(person.table)}</div>
      </section>${illustration(z)}${copy(person.text || z.text)}
      <div class="notice-reward"><span class="notice-eyebrow">Ausgesetztes Kopfgeld</span><strong>${esc(bounty || 'nach Maßgabe der Obrigkeit')}</strong></div></div>
      ${footer(z)}${total > 1 ? `<nav class="wanted-pages" aria-label="Gesuchte Personen"><button type="button" data-action="zettel-set-page" data-zettel-id="${esc(z.id)}" data-page="${page - 1}" ${page === 0 ? 'disabled' : ''}>Zurück</button><span>Steckbrief ${page + 1} von ${total}</span><button type="button" data-action="zettel-set-page" data-zettel-id="${esc(z.id)}" data-page="${page + 1}" ${page === total - 1 ? 'disabled' : ''}>Weiter</button></nav>` : ''}</article>`;
  }

  window.TafelZettelDocuments = Object.freeze({ render, wanted, facts });
})();
