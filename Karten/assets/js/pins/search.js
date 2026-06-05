(function(){
  const runtime = window.KartoRuntime;

  function onSearch(value){
    const clearButton = document.getElementById('search-clear');
    const results = document.getElementById('search-results');
    clearButton.style.display = value ? 'block' : 'none';
    if(!value){
      results.style.display = 'none';
      return;
    }

    const query = value.toLowerCase();
    const matches = runtime.visiblePins().filter(pin => pin.title.toLowerCase().includes(query));
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
