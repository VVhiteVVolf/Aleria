(function(){
  const runtime = window.KartoRuntime;
  let stampTemplate = null;
  let overwriteTemplate = null;
  let overwriteFields = {};

  function state(){
    return runtime.state();
  }

  function isStamping(){
    return !!stampTemplate;
  }

  function isOverwriteActive(){
    return !!overwriteTemplate;
  }

  function openStampPicker(){
    if(!runtime.isEditMode()) return;
    document.getElementById('stamp-search').value = '';
    renderStampList('');
    document.getElementById('stamp-mo').classList.add('open');
  }

  function renderStampList(query){
    const list = document.getElementById('stamp-list');
    const q = (query || '').toLowerCase();
    const pins = state().pins.filter(pin => !q || pin.title.toLowerCase().includes(q));
    if(!pins.length){
      list.innerHTML = '<div style="font-family:\'EB Garamond\',serif;font-size:var(--fs-sm);color:var(--ink3);font-style:italic;padding:.5rem;">Keine Marker gefunden.</div>';
      return;
    }
    const esc = runtime.esc;
    list.innerHTML = pins.map(pin => {
      const category = runtime.categoryForPin(pin);
      return `<div class="stamp-item" data-action="start-stamp" data-pin-id="${esc(pin.id)}">
        <span class="stamp-dot" style="background:${category.color}"></span>
        <span class="stamp-name">${esc(pin.title)}</span>
        <span class="stamp-cat">${esc(category.label)}</span>
      </div>`;
    }).join('');
  }

  function startStamp(sourceId){
    const source = state().pins.find(pin => pin.id === sourceId);
    if(!source) return;
    stampTemplate = source;
    runtime.closeModal('stamp-mo');
    window.KartoMapInteraction.showStampCursor();
    const button = document.getElementById('btn-stamp');
    button.textContent = '🔖 Stempel: ' + source.title + ' — ESC zum Beenden';
    button.classList.add('stamp-active');
    window.hint('Klicken = Kopie setzen  ·  ESC = Stempel beenden');
  }

  function stopStamp(){
    stampTemplate = null;
    window.KartoMapInteraction.resetCursor();
    window.KartoMapInteraction.hideStampCursor();
    const button = document.getElementById('btn-stamp');
    button.textContent = '🔖 Kopieren & stempeln';
    button.classList.remove('stamp-active');
    window.hint('');
  }

  function placeStamp(mapX, mapY){
    if(!stampTemplate) return;
    const image = runtime.mapImageSize();
    const pin = {
      id: runtime.uid(),
      x: mapX / image.width,
      y: mapY / image.height,
      title: stampTemplate.title,
      cat: stampTemplate.cat,
      img: stampTemplate.img || '',
      table: JSON.parse(JSON.stringify(stampTemplate.table || [])),
      text: stampTemplate.text || '',
      secret: stampTemplate.secret || false
    };
    runtime.addPin(pin);
    runtime.renderPins();
    runtime.save();
    runtime.toast('📍 Kopie von "' + stampTemplate.title + '" gesetzt');
  }

  function openOverwritePicker(){
    owSwitchTab('tpl');
    document.getElementById('overwrite-mo').classList.add('open');
  }

  function owSwitchTab(tab){
    document.getElementById('owtab-tpl').classList.toggle('on', tab === 'tpl');
    document.getElementById('owtab-pins').classList.toggle('on', tab === 'pins');
    document.getElementById('ow-tpl-list').style.display = tab === 'tpl' ? 'block' : 'none';
    document.getElementById('ow-pins-wrap').style.display = tab === 'pins' ? 'block' : 'none';
    if(tab === 'tpl') renderOwTplList();
    if(tab === 'pins'){
      document.getElementById('ow-search').value = '';
      renderOverwritePinList('');
    }
  }

  function renderOwTplList(){
    const esc = runtime.esc;
    const cats = state().cats;
    document.getElementById('ow-tpl-list').innerHTML = window.PIN_TEMPLATES.map(template => {
      const suggestCat = cats.find(cat =>
        cat.label.toLowerCase().includes(template.label.toLowerCase().split('/')[0].trim()) ||
        template.label.toLowerCase().includes(cat.label.toLowerCase())
      );
      const markerUrl = suggestCat?.marker || '';
      return `
      <div class="ow-tpl-card" data-action="start-overwrite-template" data-template-id="${esc(template.id)}">
        ${markerUrl ? `<img src="${esc(markerUrl)}" style="width:36px;height:44px;object-fit:contain;flex-shrink:0;" onerror="this.style.display='none'"/>` :
          `<span class="ow-tpl-icon">${template.icon}</span>`}
        <div class="ow-tpl-info">
          <div class="ow-tpl-label">${esc(template.label)}</div>
          <div class="ow-tpl-desc">${esc(template.desc)}</div>
          <div class="ow-tpl-fields">${template.table.map(row => esc(row.k)).filter(Boolean).join(' · ')}</div>
        </div>
        ${suggestCat ? `<span style="font-family:'Cinzel',serif;font-size:.65rem;color:var(--ink3);flex-shrink:0;">${esc(suggestCat.label)}</span>` : ''}
      </div>`;
    }).join('');
  }

  function startOverwriteFromTemplate(templateId){
    const template = window.PIN_TEMPLATES.find(item => item.id === templateId);
    if(!template) return;
    overwriteTemplate = {
      title: template.label,
      table: template.table.map(row => ({...row})),
      cat: null,
      region: '',
      house: '',
      img: '',
      text: ''
    };
    activateOverwriteMode(template.icon + ' ' + template.label);
  }

  function renderOverwritePinList(query){
    const q = (query || '').toLowerCase();
    const list = document.getElementById('ow-list');
    const pins = state().pins.filter(pin => !q || pin.title.toLowerCase().includes(q));
    if(!pins.length){
      list.innerHTML = `<div style="padding:1rem;text-align:center;font-family:'EB Garamond',serif;color:var(--ink3);">Keine Pins gefunden.</div>`;
      return;
    }
    const esc = runtime.esc;
    list.innerHTML = pins.map(pin => {
      const category = runtime.categoryForPin(pin);
      return `<div class="stamp-item" data-action="start-overwrite-pin" data-pin-id="${esc(pin.id)}">
        <span class="stamp-dot" style="background:${category.color}"></span>
        <div style="flex:1;min-width:0;">
          <span class="stamp-name">${esc(pin.title)}</span>
          <span class="stamp-cat"> · ${esc(category.label)}</span>
        </div>
      </div>`;
    }).join('');
  }

  function startOverwriteFromPin(sourceId){
    const source = state().pins.find(pin => pin.id === sourceId);
    if(!source) return;
    overwriteTemplate = source;
    activateOverwriteMode(source.title);
  }

  function activateOverwriteMode(label){
    overwriteFields = {
      table: document.getElementById('owf-table')?.checked,
      cat: document.getElementById('owf-cat')?.checked,
      region: document.getElementById('owf-region')?.checked,
      house: document.getElementById('owf-house')?.checked,
      img: document.getElementById('owf-img')?.checked,
      text: document.getElementById('owf-text')?.checked,
    };
    runtime.closeModal('overwrite-mo');
    window.KartoMapInteraction.setCursor('crosshair');
    const button = document.getElementById('btn-overwrite');
    button.textContent = '✏️ ' + label + ' — ESC zum Beenden';
    button.classList.add('overwrite-active');
    document.querySelectorAll('.pin-dot').forEach(element => element.classList.add('pin-ow-target'));
    window.hint('Pin anklicken = Felder überschreiben  ·  ESC = Beenden');
  }

  function stopOverwrite(){
    overwriteTemplate = null;
    window.KartoMapInteraction.resetCursor();
    document.getElementById('btn-overwrite').textContent = '✏️ Überschreiben';
    document.getElementById('btn-overwrite').classList.remove('overwrite-active');
    document.querySelectorAll('.pin-ow-target').forEach(element => element.classList.remove('pin-ow-target'));
    window.hint('');
  }

  function applyOverwrite(targetId){
    if(!overwriteTemplate) return;
    const target = state().pins.find(pin => pin.id === targetId);
    if(!target) return;
    const source = overwriteTemplate;
    if(overwriteFields.table) target.table = JSON.parse(JSON.stringify(source.table || []));
    if(overwriteFields.cat && source.cat) target.cat = source.cat;
    if(overwriteFields.region) target.region = source.region || '';
    if(overwriteFields.house) target.house = source.house || '';
    if(overwriteFields.img && source.img) target.img = source.img;
    if(overwriteFields.text && source.text) target.text = source.text;
    runtime.save();
    runtime.renderPins();
    document.querySelectorAll('.pin-dot').forEach(element => element.classList.add('pin-ow-target'));
    runtime.toast('✏️ "' + target.title + '" überschrieben');
  }

  window.KartoStampOverwrite = {
    isStamping,
    isOverwriteActive,
    applyOverwrite,
  };

  window.openStampPicker = openStampPicker;
  window.renderStampList = renderStampList;
  window.startStamp = startStamp;
  window.stopStamp = stopStamp;
  window.placeStamp = placeStamp;
  window.openOverwritePicker = openOverwritePicker;
  window.owSwitchTab = owSwitchTab;
  window.renderOwTplList = renderOwTplList;
  window.startOverwriteFromTemplate = startOverwriteFromTemplate;
  window.renderOverwritePinList = renderOverwritePinList;
  window.startOverwriteFromPin = startOverwriteFromPin;
  window.startOverwrite = startOverwriteFromPin;
  window.renderOverwriteList = renderOverwritePinList;
  window.stopOverwrite = stopOverwrite;
})();
