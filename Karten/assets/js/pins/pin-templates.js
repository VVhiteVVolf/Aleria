(function(){
  const runtime = window.KartoRuntime;
  let pendingPin = null;
  let selectedTemplate = null;
  let pendingKind = 'place';

  const PIN_TEMPLATES = window.KartoPinTemplateCatalog.templates;

  function startAdd(kind = 'place'){
    if(!runtime.isEditMode()) return;
    pendingKind = kind === 'text' ? 'text' : 'place';
    window.activateLayer?.('pins');
    runtime.setAddingPin(true);
    window.KartoMapInteraction.showPlacementCursor();
    window.hint('Klicken = Pin setzen  ·  ESC = Abbrechen');
  }

  function openTplPicker(pin){
    pendingPin = pin;
    selectedTemplate = null;
    const esc = runtime.esc;
    const grid = document.getElementById('tpl-grid');
    grid.innerHTML = PIN_TEMPLATES.map(template => `
      <div class="tpl-card" id="tplc-${esc(template.id)}" data-action="select-pin-template" data-template-id="${esc(template.id)}">
        <span class="tpl-icon">${template.icon}</span>
        <span class="tpl-label">${template.label}</span>
        <span class="tpl-desc">${template.desc}</span>
      </div>`).join('');
    document.getElementById('tpl-apply-btn').disabled = true;
    document.getElementById('pin-tpl-mo').classList.add('open');
  }

  function selectTpl(id){
    selectedTemplate = id;
    document.querySelectorAll('.tpl-card').forEach(card => card.classList.remove('on'));
    document.getElementById('tplc-' + id)?.classList.add('on');
    document.getElementById('tpl-apply-btn').disabled = false;
  }

  function tplApply(){
    if(!pendingPin || !selectedTemplate) return;
    const template = PIN_TEMPLATES.find(item => item.id === selectedTemplate);
    if(template) {
      pendingPin.table = window.KartoPinTablePresets.createTable(template.id, runtime.categoryForPin(pendingPin));
      pendingPin.templateId = template.id;
    }
    runtime.closeModal('pin-tpl-mo');
    runtime.addPin(pendingPin);
    const newPinId = pendingPin.id;
    runtime.renderPins();
    window.KartoPinEditor?.open(newPinId, { isNew: true });
    runtime.toast('Pin platziert — Eintrag ausfüllen und übernehmen');
    pendingPin = null;
    selectedTemplate = null;
  }

  function cancelAdd(){
    pendingPin = null;
    selectedTemplate = null;
    pendingKind = 'place';
    runtime.setAddingPin(false);
    window.KartoMapInteraction.resetCursor();
    window.KartoMapInteraction.hidePlacementCursor();
    window.hint('');
  }

  function placePin(mapX, mapY){
    const image = runtime.mapImageSize();
    runtime.setAddingPin(false);
    window.KartoMapInteraction.resetCursor();
    window.KartoMapInteraction.hidePlacementCursor();
    window.hint('');
    const pin = {
      id: runtime.uid(),
      x: mapX / image.width,
      y: mapY / image.height,
      title: 'Neuer Ort',
      cat: runtime.firstCategoryId(),
      img: '',
      imgLink: '',
      crest: '',
      crestLink: '',
      banner: '',
      bannerLink: '',
      region: '',
      house: '',
      faction: '',
      table: [],
      text: '',
      secret: false
    };
    if (pendingKind === 'text') {
      pin.kind = 'text';
      pin.title = 'Neuer Schriftzug';
      pin.lettering = window.KartoPinLettering.normalize({ fontSize: runtime.state().lblSize });
      runtime.addPin(pin);
      runtime.renderPins();
      window.KartoPinEditor?.open(pin.id, { isNew: true });
    } else {
      openTplPicker(pin);
    }
    pendingKind = 'place';
  }

  window.PIN_TEMPLATES = PIN_TEMPLATES;
  window.startAdd = startAdd;
  window.openTplPicker = openTplPicker;
  window.selectTpl = selectTpl;
  window.tplApply = tplApply;
  window.cancelAdd = cancelAdd;
  window.placePin = placePin;
})();
