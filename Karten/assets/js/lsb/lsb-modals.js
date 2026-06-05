(function(){
  const CUSTOM_SLOTS = 12;
  const config = window.KartoLsbConfig;
  const calculations = window.KartoLsbCalculations;

  let groupEditId = null;
  let waypointGroupId = null;
  let waypointIndex = -1;
  let waypointEventType = 'none';
  let previewColor = config.colors[0];
  let previewIcon = config.icons[0];
  let previewOpacity = 80;
  let previewIconIsImage = false;

  function runtime(){
    return window.KartoRuntime;
  }

  function state(){
    return runtime().lsbState();
  }

  function groups(){
    return state().groups || [];
  }

  function groupById(id){
    return groups().find(group => group.id === id);
  }

  function iconTab(tab){
    document.getElementById('icntab-emoji').classList.toggle('on', tab === 'emoji');
    document.getElementById('icntab-custom').classList.toggle('on', tab === 'custom');
    document.getElementById('icn-panel-emoji').style.display = tab === 'emoji' ? '' : 'none';
    document.getElementById('icn-panel-custom').style.display = tab === 'custom' ? '' : 'none';
  }

  function renderCustomSlots(){
    const wrap = document.getElementById('lgrp-custom-slots');
    if(!wrap) return;
    wrap.innerHTML = '';
    const slots = state().customIcons || [];
    slots.forEach((icon, index) => {
      const slot = document.createElement('div');
      const active = previewIconIsImage && previewIcon === icon.src;
      slot.className = 'cslot' + (active ? ' on' : '');
      slot.dataset.action = 'pick-travel-custom-icon';
      slot.dataset.iconSrc = icon.src;
      slot.innerHTML = `<img src="${icon.src}" onerror="this.parentElement.classList.add('empty');this.remove()"/><div class="cslot-del" data-action="delete-travel-custom-icon" data-slot-index="${index}">✕</div>`;
      wrap.appendChild(slot);
    });
    for(let index = slots.length; index < CUSTOM_SLOTS; index++){
      const empty = document.createElement('div');
      empty.className = 'cslot empty';
      empty.title = 'Noch leer';
      empty.innerHTML = '<span style="font-size:16px;opacity:0.75">＋</span>';
      wrap.appendChild(empty);
    }
  }

  function pickCustomSlot(src, element){
    previewIcon = src;
    previewIconIsImage = true;
    document.getElementById('lgrp-icon-preview').innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:contain;"/>`;
    document.querySelectorAll('.cslot').forEach(slot => slot.classList.remove('on'));
    element?.classList.add('on');
  }

  function addCustomSlot(){
    const url = document.getElementById('lgrp-icon-url').value.trim();
    if(!url || url === '(Hochgeladen)' && !previewIcon){
      runtime().toast('Zuerst Bild hochladen oder URL eingeben');
      return;
    }
    const src = previewIcon || (previewIconIsImage ? previewIcon : null);
    if(!src){
      runtime().toast('Kein Bild ausgewählt');
      return;
    }
    if(!state().customIcons) state().customIcons = [];
    if(state().customIcons.length >= CUSTOM_SLOTS){
      runtime().toast('Alle Slots belegt — erst einen löschen');
      return;
    }
    state().customIcons.push({src});
    renderCustomSlots();
    runtime().saveTravel();
    runtime().toast('✓ Icon gespeichert');
  }

  function deleteCustomSlot(index){
    if(!state().customIcons) return;
    state().customIcons.splice(index, 1);
    renderCustomSlots();
    runtime().saveTravel();
  }

  function previewGroupOpacity(){
    previewOpacity = +document.getElementById('lgrp-opacity').value;
    document.getElementById('lgrp-opacity-val').textContent = previewOpacity + '%';
    document.getElementById('lgrp-color-preview').style.background = calculations.colorWithOpacity(previewColor, previewOpacity);
  }

  function previewIconUrl(){
    const url = document.getElementById('lgrp-icon-url').value.trim();
    const preview = document.getElementById('lgrp-icon-preview');
    if(url){
      previewIcon = url;
      previewIconIsImage = true;
      preview.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:contain;" onerror="this.parentElement.textContent='❌'"/>`;
      document.querySelectorAll('#lgrp-icon-grid .icnl,.cslot').forEach(item => item.classList.remove('on'));
    } else {
      previewIconIsImage = false;
    }
  }

  function loadIconFile(input){
    if(!input.files[0]) return;
    const reader = new FileReader();
    reader.onload = event => {
      previewIcon = event.target.result;
      previewIconIsImage = true;
      document.getElementById('lgrp-icon-url').value = '(Hochgeladen)';
      document.getElementById('lgrp-icon-preview').innerHTML = `<img src="${event.target.result}" style="width:100%;height:100%;object-fit:contain;"/>`;
      document.querySelectorAll('#lgrp-icon-grid .icnl,.cslot').forEach(item => item.classList.remove('on'));
      if(!state().customIcons) state().customIcons = [];
      if(state().customIcons.length < CUSTOM_SLOTS){
        state().customIcons.push({src:event.target.result});
        renderCustomSlots();
        runtime().saveTravel();
        runtime().toast('✓ Icon in Slot gespeichert');
      }
    };
    reader.readAsDataURL(input.files[0]);
  }

  function pickEmoji(icon, element){
    previewIcon = icon;
    previewIconIsImage = false;
    const url = document.getElementById('lgrp-icon-url');
    if(url) url.value = '';
    document.getElementById('lgrp-icon-preview').textContent = icon;
    document.querySelectorAll('#lgrp-icon-grid .icnl,.cslot').forEach(item => item.classList.remove('on'));
    element?.classList.add('on');
  }

  function pickColor(color, element){
    previewColor = color;
    document.querySelectorAll('#lgrp-colors .gcsw2').forEach(item => item.classList.remove('on'));
    element?.classList.add('on');
    previewGroupOpacity();
  }

  function openGroupModal(groupId){
    groupEditId = groupId || null;
    const existing = groupId ? groupById(groupId) : null;
    document.getElementById('lgrp-mo-ttl').textContent = existing ? 'Gruppe bearbeiten' : 'Neue Gruppe';
    previewColor = existing?.colorHex || config.colors[groups().length % config.colors.length];
    previewOpacity = existing?.opacity ?? 80;
    previewIcon = existing?.icon || config.icons[0];
    previewIconIsImage = existing?.iconIsImg || false;
    document.getElementById('lgrp-name').value = existing?.name || '';

    const preview = document.getElementById('lgrp-icon-preview');
    if(previewIconIsImage){
      preview.innerHTML = `<img src="${previewIcon}" style="width:100%;height:100%;object-fit:contain;"/>`;
      document.getElementById('lgrp-icon-url').value = previewIcon.startsWith('data:') ? '(Hochgeladen)' : previewIcon;
    } else {
      preview.textContent = previewIcon;
      document.getElementById('lgrp-icon-url').value = '';
    }

    const iconGrid = document.getElementById('lgrp-icon-grid');
    iconGrid.innerHTML = '';
    config.icons.forEach(icon => {
      const item = document.createElement('div');
      item.className = 'icnl' + (icon === previewIcon && !previewIconIsImage ? ' on' : '');
      item.dataset.action = 'pick-travel-emoji';
      item.dataset.icon = icon;
      item.textContent = icon;
      iconGrid.appendChild(item);
    });

    iconTab('emoji');
    renderCustomSlots();

    const colors = document.getElementById('lgrp-colors');
    colors.innerHTML = '';
    config.colors.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'gcsw2' + (color === previewColor ? ' on' : '');
      swatch.style.background = color;
      swatch.dataset.action = 'pick-travel-group-color';
      swatch.dataset.color = color;
      colors.appendChild(swatch);
    });

    document.getElementById('lgrp-opacity').value = previewOpacity;
    document.getElementById('lgrp-opacity-val').textContent = previewOpacity + '%';
    document.getElementById('lgrp-color-preview').style.background = calculations.colorWithOpacity(previewColor, previewOpacity);
    const travelMode = document.getElementById('lgrp-tm');
    travelMode.innerHTML = config.travelModes.map(mode => `<option value="${mode.id}"${mode.id === (existing?.travelMode || 'foot_e') ? ' selected' : ''}>${mode.l} (~${mode.kmh}km/h)</option>`).join('');
    document.getElementById('lgrp-mo').classList.add('open');
    setTimeout(() => document.getElementById('lgrp-name').focus(), 60);
  }

  function saveGroup(){
    const name = document.getElementById('lgrp-name').value.trim();
    if(!name){
      runtime().toast('Namen eingeben');
      return;
    }
    const travelMode = document.getElementById('lgrp-tm').value;
    const color = calculations.colorWithOpacity(previewColor, previewOpacity);
    const wasEditing = !!groupEditId;
    if(groupEditId){
      const group = groupById(groupEditId);
      if(group) Object.assign(group, {name, color, colorHex:previewColor, opacity:previewOpacity, icon:previewIcon, iconIsImg:previewIconIsImage, travelMode});
      groupEditId = null;
    } else {
      const group = {id:runtime().uid(), name, color, colorHex:previewColor, opacity:previewOpacity, icon:previewIcon, iconIsImg:previewIconIsImage, travelMode, route:[]};
      groups().push(group);
      runtime().setSelectedTravelGroup(group.id);
    }
    runtime().closeModal('lgrp-mo');
    runtime().preloadTravelIcons();
    window.lsbRenderGroups();
    runtime().drawTravelLayer();
    runtime().updateTravelResult();
    runtime().saveTravel();
    if(!wasEditing){
      runtime().setTravelMode('place');
      runtime().toast('📍 Startmarker auf der Karte setzen');
    }
  }

  function buildEventDetailHtml(type){
    const travelModeOptions = config.travelModes.map(mode => `<option value="${mode.id}">${mode.l}</option>`).join('');
    const templates = {
      none:'',
      stop:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Aufenthalt</span><input class="lev-inp sm" id="evd-stop-h" type="number" min="0" step=".5" value="10"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div></div>`,
      camp:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Lagerdauer</span><input class="lev-inp sm" id="evd-camp-h" type="number" min="0" step=".5" value="7"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div></div>`,
      horse:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Verzögerung</span><input class="lev-inp sm" id="evd-horse-h" type="number" min="0" step=".25" value="1"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div><div class="lev-row"><span class="lev-lbl">Neuer Modus</span><select class="lev-inp" id="evd-horse-tm">${travelModeOptions}</select></div></div>`,
      injury:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Schwere</span><select class="lev-inp" id="evd-inj-sev"><option value="light">Leicht 70%</option><option value="medium" selected>Mittel 50%</option><option value="severe">Schwer 30%</option><option value="heal">✅ Geheilt</option></select></div><div class="lev-row"><span class="lev-lbl">Behandlung</span><input class="lev-inp sm" id="evd-inj-h" type="number" min="0" step=".5" value="0"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div></div>`,
      encounter:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Verzögerung</span><input class="lev-inp sm" id="evd-enc-h" type="number" min="0" step=".25" value="2"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div></div>`,
      obstacle:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Verzögerung</span><input class="lev-inp sm" id="evd-obs-h" type="number" min="0" step=".25" value="2"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div></div>`,
      travelchange:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Neuer Modus</span><select class="lev-inp" id="evd-tc-tm">${travelModeOptions}</select></div></div>`,
      custom:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Zeitverlust</span><input class="lev-inp sm" id="evd-cust-h" type="number" min="0" step=".25" value="0"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div><div class="lev-row"><span class="lev-lbl">Tempo-Faktor</span><input class="lev-inp sm" id="evd-cust-sp" type="number" min=".1" max="2" step=".05" value="1"/></div></div>`,
    };
    return templates[type] || '';
  }

  function openWaypointModal(groupId, index){
    waypointGroupId = groupId;
    waypointIndex = index;
    const group = groupById(groupId);
    if(!group) return;
    const waypoint = group.route[index];
    if(!waypoint) return;
    const event = waypoint.event || {type:'none'};
    document.getElementById('lwp-mo-ttl').textContent = index === 0 ? 'Startpunkt' : index === group.route.length - 1 ? 'Endpunkt' : `Wegpunkt ${index + 1}`;
    document.getElementById('lwp-name').value = event.name || '';
    document.getElementById('lwp-note').value = event.note || '';
    waypointEventType = event.type || 'none';
    document.getElementById('lwp-evt-grid').innerHTML = config.eventTypes.map(item => `<div class="levt${item.type === waypointEventType ? ' on' : ''}" data-action="pick-travel-waypoint-event" data-event-type="${item.type}"><div class="levt-ic">${item.ic}</div><div class="levt-lb">${item.lb}</div></div>`).join('');
    document.getElementById('lwp-evd-wrap').innerHTML = buildEventDetailHtml(waypointEventType);
    setTimeout(() => applyEventFormValues(event, group), 20);
    document.getElementById('lwp-del-btn').style.display = event.type && event.type !== 'none' ? 'block' : 'none';
    document.getElementById('lwp-mo').classList.add('open');
  }

  function applyEventFormValues(event, group){
    if(event.type === 'stop' && document.getElementById('evd-stop-h')) document.getElementById('evd-stop-h').value = event.stopH || 10;
    if(event.type === 'camp' && document.getElementById('evd-camp-h')) document.getElementById('evd-camp-h').value = event.campH || 7;
    if(event.type === 'horse'){
      if(document.getElementById('evd-horse-h')) document.getElementById('evd-horse-h').value = event.horseH || 1;
      if(document.getElementById('evd-horse-tm')) document.getElementById('evd-horse-tm').value = event.horseTM || group.travelMode;
    }
    if(event.type === 'injury'){
      if(document.getElementById('evd-inj-sev')) document.getElementById('evd-inj-sev').value = event.injSev || 'medium';
      if(document.getElementById('evd-inj-h')) document.getElementById('evd-inj-h').value = event.injH || 0;
    }
    if(event.type === 'encounter' && document.getElementById('evd-enc-h')) document.getElementById('evd-enc-h').value = event.encH || 2;
    if(event.type === 'obstacle' && document.getElementById('evd-obs-h')) document.getElementById('evd-obs-h').value = event.obsH || 2;
    if(event.type === 'travelchange' && document.getElementById('evd-tc-tm')) document.getElementById('evd-tc-tm').value = event.tcTM || group.travelMode;
    if(event.type === 'custom'){
      if(document.getElementById('evd-cust-h')) document.getElementById('evd-cust-h').value = event.custH || 0;
      if(document.getElementById('evd-cust-sp')) document.getElementById('evd-cust-sp').value = event.custSp || 1;
    }
  }

  function pickEvent(element, type){
    waypointEventType = type;
    document.querySelectorAll('#lwp-evt-grid .levt').forEach(item => item.classList.remove('on'));
    element.classList.add('on');
    document.getElementById('lwp-evd-wrap').innerHTML = buildEventDetailHtml(type);
  }

  function saveWaypointEvent(){
    const group = groupById(waypointGroupId);
    if(!group) return;
    const waypoint = group.route[waypointIndex];
    if(!waypoint) return;
    const type = waypointEventType;
    const event = {
      type,
      name: document.getElementById('lwp-name').value.trim(),
      note: document.getElementById('lwp-note').value.trim(),
    };
    if(type === 'stop') event.stopH = +(document.getElementById('evd-stop-h')?.value || 10);
    if(type === 'camp') event.campH = +(document.getElementById('evd-camp-h')?.value || 7);
    if(type === 'horse'){
      event.horseH = +(document.getElementById('evd-horse-h')?.value || 1);
      event.horseTM = document.getElementById('evd-horse-tm')?.value;
    }
    if(type === 'injury'){
      event.injSev = document.getElementById('evd-inj-sev')?.value || 'medium';
      event.injH = +(document.getElementById('evd-inj-h')?.value || 0);
    }
    if(type === 'encounter') event.encH = +(document.getElementById('evd-enc-h')?.value || 2);
    if(type === 'obstacle') event.obsH = +(document.getElementById('evd-obs-h')?.value || 2);
    if(type === 'travelchange') event.tcTM = document.getElementById('evd-tc-tm')?.value;
    if(type === 'custom'){
      event.custH = +(document.getElementById('evd-cust-h')?.value || 0);
      event.custSp = +(document.getElementById('evd-cust-sp')?.value || 1);
    }
    waypoint.event = event;
    if(event.name) waypoint.name = event.name;
    runtime().closeModal('lwp-mo');
    window.lsbRenderGroups();
    runtime().drawTravelLayer();
    runtime().updateTravelResult();
    runtime().saveTravel();
    runtime().toast(type === 'none' ? 'Gespeichert' : '✓ Ereignis gespeichert');
  }

  function deleteWaypointEvent(){
    const group = groupById(waypointGroupId);
    if(!group) return;
    const waypoint = group.route[waypointIndex];
    if(!waypoint) return;
    delete waypoint.event;
    delete waypoint.name;
    runtime().closeModal('lwp-mo');
    window.lsbRenderGroups();
    runtime().drawTravelLayer();
    runtime().updateTravelResult();
    runtime().saveTravel();
    runtime().toast('Ereignis gelöscht');
  }

  document.getElementById('lgrp-mo').addEventListener('click', event => {
    if(event.target === document.getElementById('lgrp-mo')) runtime().closeModal('lgrp-mo');
  });
  document.getElementById('lwp-mo').addEventListener('click', event => {
    if(event.target === document.getElementById('lwp-mo')) runtime().closeModal('lwp-mo');
  });

  window.KartoLsbModals = {
    iconTab,
    renderCustomSlots,
    pickCustomSlot,
    addCustomSlot,
    deleteCustomSlot,
    previewGroupOpacity,
    previewIconUrl,
    loadIconFile,
    pickEmoji,
    pickColor,
    openGroupModal,
    saveGroup,
    openWaypointModal,
    pickEvent,
    saveWaypointEvent,
    deleteWaypointEvent,
  };

  window.lsbIconTab = iconTab;
  window.lsbRenderCustomSlots = renderCustomSlots;
  window.lsbPickCustomSlot = pickCustomSlot;
  window.lsbAddCustomSlot = addCustomSlot;
  window.lsbDelCustomSlot = deleteCustomSlot;
  window.lsbPreviewOpacity = previewGroupOpacity;
  window.lsbPreviewIconUrl = previewIconUrl;
  window.lsbLoadIconFile = loadIconFile;
  window.lsbPickEmoji = pickEmoji;
  window.openLGrpModal = openGroupModal;
  window.saveLGrp = saveGroup;
  window.lsbBuildEvdHtml = buildEventDetailHtml;
  window.openLWpModal = openWaypointModal;
  window.lsbPickEvt = pickEvent;
  window.saveLWpEvt = saveWaypointEvent;
  window.deleteLWpEvt = deleteWaypointEvent;
})();
