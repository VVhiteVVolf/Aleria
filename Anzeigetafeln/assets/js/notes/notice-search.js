(function () {
  'use strict';
  const plain = value => window.TafelZettelRichText.textPreview(value || '', Number.MAX_SAFE_INTEGER);
  const termsOf = query => String(query || '').trim().toLocaleLowerCase('de').split(/\s+/).filter(Boolean);

  function fields(notice) {
    return [notice.title, notice.untertitel, notice.verfasserName, plain(notice.text),
      ...(notice.table || []).map(row => `${row.k || ''} ${row.v || ''}`),
      ...(notice.artikel || []).flatMap(article => [article.titel, plain(article.text)]),
      ...(notice.personen || []).flatMap(person => fields(person)),
      ...(notice.rewards || []).map(reward => reward.title || ''),
    ].filter(Boolean);
  }

  function select(notices, { query = '', type = '', includeSecret = false } = {}) {
    const terms = termsOf(query);
    return (notices || []).filter(notice => {
      if (notice.secret && !includeSecret) return false;
      if (type && notice.typ !== type) return false;
      const text = [window.TafelZettelConfig.typeById(notice.typ)?.label, ...fields(notice)].join(' ').toLocaleLowerCase('de');
      return terms.every(term => text.includes(term));
    });
  }

  function preferred(notices, options = {}) {
    const matches = select(notices, options);
    const terms = termsOf(options.query);
    return matches.find(notice => {
      const heading = [notice.title, ...(notice.table || []).filter(row => /^name$/i.test(row.k)).map(row => row.v)].join(' ').toLocaleLowerCase('de');
      return terms.every(term => heading.includes(term));
    }) || matches[0];
  }

  window.TafelNoticeSearch = Object.freeze({ fields, select, preferred });
})();
