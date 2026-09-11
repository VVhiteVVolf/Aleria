(function(){
  const runtime = window.KartoRuntime;

  function state(){
    return runtime.state();
  }

  function open(pinId){
    const pin = state().pins.find(item => item.id === pinId);
    if(!pin) return;
    window.KartoPinRenderer?.hideTooltip();
    renderScrollView(pin);
    document.getElementById('scroll-mo').classList.add('open');
  }

  function close(){
    document.getElementById('scroll-mo').classList.remove('open');
  }

  function renderScrollView(pin){
    const content = document.getElementById('scroll-content');
    const actions = document.getElementById('scroll-actions');
    const esc = runtime.esc;
    content.innerHTML = window.KartoPinCard.render(pin, { titleId: 'pin-detail-title' });

    actions.innerHTML = `
      ${runtime.isEditMode()
        ? `<button class="s-btn s-del" data-action="delete-pin" data-pin-id="${esc(pin.id)}">Löschen</button>
          <button class="s-btn" data-action="close-scroll-and-start-stamp" data-pin-id="${esc(pin.id)}">Stempeln</button>
          <button class="s-btn s-edit" data-action="edit-pin-from-scroll" data-pin-id="${esc(pin.id)}">✎ Bearbeiten</button>`
        : ''}
      <button class="s-btn s-cancel" data-action="close-scroll">Schließen</button>`;
  }

  window.KartoPinDetailView = {
    open,
    close,
    renderScrollView,
  };
})();
