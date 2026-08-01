(function(){
  const runtime = window.KartoRuntime;
  const COMBINING_DIACRITICS = /[̀-ͯ]/g;

  function normalize(value){
    return String(value || '').toLowerCase().normalize('NFD').replace(COMBINING_DIACRITICS, '');
  }

  // True if every character of `query` appears in `text` in order - a
  // cheap typo/partial-match tolerance without a fuzzy-match dependency.
  function isSubsequence(query, text){
    let index = 0;
    for(const char of text){
      if(char === query[index]) index += 1;
      if(index === query.length) return true;
    }
    return index === query.length;
  }

  function searchableFields(pin){
    return [pin.title, pin.region, pin.house, pin.faction, pin.text, ...(pin.table || []).map(row => row.v)];
  }

  // Ranks pins against a query: exact-prefix matches on the title rank
  // highest, then substring matches (title first, then region/house/
  // faction/text/table values), then loose subsequence matches as a
  // typo-tolerant fallback. Was title-only substring matching before.
  function rankPins(pins, query){
    const q = normalize(query).trim();
    if(!q) return [];
    const scored = [];
    for(const pin of pins){
      const title = normalize(pin.title);
      let score = -1;
      if(title.startsWith(q)) score = 100;
      else if(title.includes(q)) score = 80;
      else if(searchableFields(pin).some(field => normalize(field).includes(q))) score = 50;
      else if(isSubsequence(q, title)) score = 10;
      if(score > 0) scored.push({pin, score});
    }
    scored.sort((a, b) => b.score - a.score || a.pin.title.localeCompare(b.pin.title));
    return scored.map(entry => entry.pin);
  }

  function onSearch(value){
    const clearButton = document.getElementById('search-clear');
    const results = document.getElementById('search-results');
    clearButton.style.display = value ? 'block' : 'none';
    if(!value){
      results.style.display = 'none';
      return;
    }

    const matches = rankPins(runtime.visiblePins(), value).slice(0, 12);
    if(!matches.length){
      results.style.display = 'none';
      return;
    }

    const esc = runtime.esc;
    results.innerHTML = matches.map(pin => {
      const category = runtime.categoryForPin(pin);
      return `<div class="sr-item" data-action="jump-to-search-result" data-pin-id="${esc(pin.id)}">
        <span class="sr-dot" style="background:${category.color}"></span>${esc(pin.title)}
      </div>`;
    }).join('');
    results.style.display = 'block';
  }

  function hideSearch(){
    document.getElementById('search-results').style.display = 'none';
  }

  function clearSearch(){
    document.getElementById('search-inp').value = '';
    document.getElementById('search-clear').style.display = 'none';
    hideSearch();
  }

  function jumpTo(id){
    clearSearch();
    runtime.jumpToPin(id);
    setTimeout(() => runtime.openPin(id, 'view'), 350);
  }

  window.onSearch = onSearch;
  window.hideSearch = hideSearch;
  window.clearSearch = clearSearch;
  window.jumpTo = jumpTo;
})();
