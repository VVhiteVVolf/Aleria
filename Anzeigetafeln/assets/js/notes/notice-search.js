(function () {
  'use strict';
  const plain = value => window.TafelZettelRichText.textPreview(value || '', Number.MAX_SAFE_INTEGER);

  function fields(notice) {
    return [notice.title, notice.untertitel, notice.verfasserName, plain(notice.text),
      ...(notice.table || []).map(row => `${row.k || ''} ${row.v || ''}`),
      ...(notice.artikel || []).flatMap(article => [article.titel, plain(article.text)]),
      ...(notice.personen || []).flatMap(person => fields(person)),
    ].filter(Boolean);
  }

  function select(notices, { query = '', type = '', includeSecret = false } = {}) {
    const terms = query.trim().toLocaleLowerCase('de').split(/\s+/).filter(Boolean);
    return (notices || []).filter(notice => {
      if (notice.secret && !includeSecret) return false;
      if (type && notice.typ !== type) return false;
      const text = [window.TafelZettelConfig.typeById(notice.typ)?.label, ...fields(notice)].join(' ').toLocaleLowerCase('de');
      return terms.every(term => text.includes(term));
    });
  }

  window.TafelNoticeSearch = Object.freeze({ fields, select });
})();
