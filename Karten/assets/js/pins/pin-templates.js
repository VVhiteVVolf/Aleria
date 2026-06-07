(function(){
  const runtime = window.KartoRuntime;
  let pendingPin = null;
  let selectedTemplate = null;

  const PIN_TEMPLATES = [
    {
      id:'siedlung', icon:'🏘', label:'Siedlung / Ort',
      desc:'Stadt, Dorf, Weiler…',
      table:[
        {k:'Name',v:''},{k:'Typ',v:''},{k:'Gewerbe',v:''},{k:'Regierungstyp',v:''},
        {k:'Führung',v:''},{k:'Lehensherr',v:''},{k:'Bevölkerung',v:''},
        {k:'Einwohnerzahl',v:''},{k:'Bekannte Familien',v:''},{k:'Gefahren',v:''},{k:'Ressourcen',v:''}
      ]
    },
    {
      id:'gebaeude', icon:'🏰', label:'Einzelnes Gebäude',
      desc:'Taverne, Turm, Tempel…',
      table:[
        {k:'Name',v:''},{k:'Typ',v:''},{k:'Gewerbe',v:''},{k:'Besitzer',v:''},
        {k:'Zustand',v:''},{k:'Bekannte Bewohner',v:''},{k:'Gerüchte',v:''},{k:'Besonderheiten',v:''}
      ]
    },
    {
      id:'natur', icon:'🌿', label:'Naturgebiet / POI',
      desc:'Wald, Berg, Höhle, Quelle…',
      table:[
        {k:'Name',v:''},{k:'Typ',v:''},{k:'Gefahren',v:''},{k:'Ressourcen',v:''},
        {k:'Bekannte Bewohner',v:''},{k:'Besonderheiten',v:''},{k:'Legenden',v:''}
      ]
    },
    {
      id:'ruine', icon:'🏚', label:'Ruine',
      desc:'Verfallene Burg, altes Heiligtum…',
      table:[
        {k:'Name',v:''},{k:'Ursprung',v:''},{k:'Zustand',v:''},{k:'Ursache des Verfalls',v:''},
        {k:'Aktuelle Bewohner',v:''},{k:'Gefahren',v:''},{k:'Schätze / Reliquien',v:''},{k:'Gerüchte',v:''}
      ]
    },
    {
      id:'monsterhort', icon:'🐉', label:'Monsterhort',
      desc:'Lager, Nest, Revier…',
      table:[
        {k:'Name',v:''},{k:'Kreatur(en)',v:''},{k:'Anzahl',v:''},{k:'Gefährlichkeit',v:''},
        {k:'Territorium',v:''},{k:'Beute / Schatz',v:''},{k:'Schwächen',v:''},{k:'Verbündete',v:''}
      ]
    },
    {
      id:'dungeon', icon:'⚔️', label:'Dungeon',
      desc:'Verlies, Katakomben, Labyrinth…',
      table:[
        {k:'Name',v:''},{k:'Typ',v:''},{k:'Ebenen',v:''},{k:'Hauptgegner',v:''},
        {k:'Ursprung',v:''},{k:'Bekannte Fallen',v:''},{k:'Schätze',v:''},{k:'Schwierigkeitsgrad',v:''},
        {k:'Fraktionen innen',v:''}
      ]
    }
  ];

  function startAdd(){
    if(!runtime.isEditMode()) return;
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
    if(template) pendingPin.table = template.table.map(row => ({...row}));
    runtime.closeModal('pin-tpl-mo');
    runtime.addPin(pendingPin);
    runtime.renderPins();
    runtime.save();
    runtime.openPin(pendingPin.id, 'edit');
    runtime.toast('Pin gesetzt — Eintrag ausfüllen');
    pendingPin = null;
    selectedTemplate = null;
  }

  function cancelAdd(){
    pendingPin = null;
    selectedTemplate = null;
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
    openTplPicker(pin);
  }

  window.PIN_TEMPLATES = PIN_TEMPLATES;
  window.startAdd = startAdd;
  window.openTplPicker = openTplPicker;
  window.selectTpl = selectTpl;
  window.tplApply = tplApply;
  window.cancelAdd = cancelAdd;
  window.placePin = placePin;
})();
