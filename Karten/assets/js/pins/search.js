(function(){
  const runtime = window.KartoRuntime;
  const COMBINING_DIACRITICS = /[̀-ͯ]/g;
  const wrap = document.getElementById('search-wrap');
  const input = document.getElementById('search-inp');
  const results = document.getElementById('search-results');
  const clearButton = document.getElementById('search-clear');
  let activeIndex = -1;

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
    const dominion = runtime.dominionForPin(pin);
    return [pin.title, dominion?.name, pin.region, pin.house, pin.faction, pin.text, ...(pin.table || []).map(row => row.v)];
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
    clearButton.style.display = value ? 'block' : 'none';
    activeIndex = -1;
    input.removeAttribute('aria-activedescendant');
    if(!value.trim()){
      hideSearch();
      return;
    }

    const matches = rankPins(runtime.visiblePins(), value).slice(0, 12);
    const esc = runtime.esc;
    results.innerHTML = matches.map((pin, index) => {
      const category = runtime.categoryForPin(pin);
      return `<button type="button" class="sr-item" id="pin-search-result-${index}" role="option" aria-selected="false" tabindex="-1" data-action="jump-to-search-result" data-pin-id="${esc(pin.id)}">
        <span class="sr-dot" style="background:${esc(category.color)}"></span>
        <span class="sr-copy">${esc(pin.title)}<small>${esc(category.label || '')}</small></span>
      </button>`;
    }).join('') || '<div class="sr-empty" role="status">Kein Ort gefunden.</div>';
    results.style.display = 'block';
    input.setAttribute('aria-expanded', 'true');
  }

  function hideSearch(){
    results.style.display = 'none';
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  }

  function clearSearch(){
    input.value = '';
    clearButton.style.display = 'none';
    hideSearch();
  }

  function jumpTo(id){
    if(!runtime.jumpToPin(id)) return;
    clearSearch();
    input.blur();
    runtime.openPin(id, 'view');
  }

  function onKeydown(event){
    if(event.key === 'Escape'){
      hideSearch();
      event.stopPropagation();
      return;
    }
    if(!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
    if(results.style.display === 'none'){
      if(event.key === 'Enter') return;
      onSearch(input.value);
    }
    const items = [...results.querySelectorAll('.sr-item')];
    if(!items.length) return;
    event.preventDefault();
    if(event.key === 'Enter'){
      jumpTo(items[Math.max(0, activeIndex)].dataset.pinId);
      return;
    }
    const next = activeIndex < 0 ? (event.key === 'ArrowDown' ? 0 : items.length - 1)
      : (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    activeIndex = next;
    items.forEach((item, index) => {
      item.classList.toggle('is-active', index === next);
      item.setAttribute('aria-selected', String(index === next));
    });
    input.setAttribute('aria-activedescendant', items[next].id);
    items[next].scrollIntoView({ block: 'nearest' });
  }

  // Keep result nodes alive from pointer-down through click. A timed blur
  // handler or a second render on input change can remove the clicked target.
  input.addEventListener('input', () => onSearch(input.value));
  input.addEventListener('focus', () => onSearch(input.value));
  input.addEventListener('keydown', onKeydown);
  wrap.addEventListener('focusout', event => {
    if(event.relatedTarget && !wrap.contains(event.relatedTarget)) hideSearch();
  });
  document.addEventListener('pointerdown', event => {
    if(!wrap.contains(event.target)) hideSearch();
  });

  window.onSearch = onSearch;
  window.hideSearch = hideSearch;
  window.clearSearch = clearSearch;
  window.jumpTo = jumpTo;
})();
