(function(){
  const rt = () => window.TafelRuntime;
  const state = () => rt().state();
  const esc = value => rt().esc(value);
  const toast = message => rt().toast(message);
  const save = () => rt().save();
  const backup = label => rt().backup(label);
  const closeModal = id => rt().closeModal(id);
  const applyState = nextState => rt().applyState(nextState);

  const FIELD_NORM = {
    'type':'Typ', 'Type':'Typ',
    'einwohner':'Bevölkerung', 'Einwohner':'Bevölkerung',
    'einwohnerzahl':'Einwohnerzahl',
    'prominente familien':'Bekannte Familien', 'Prominente Familien':'Bekannte Familien',
    'bekannteFamilien':'Bekannte Familien',
    'führung':'Führung', 'Fuehrung':'Führung',
    'lehensherr':'Lehensherr',
    'regierungstyp':'Regierungstyp',
    'gewerbe':'Gewerbe',
    'gefahren':'Gefahren',
    'ressourcen':'Ressourcen',
    'name':'Name',
  };

  function normalizePin(pin){
    if(pin.table){
      pin.table = pin.table
        .filter(row => row.k || row.v)
        .map(row => ({k: FIELD_NORM[row.k] || row.k, v: row.v || ''}));
    }
    pin.crest = pin.crest || '';
    pin.region = pin.region || '';
    pin.house = pin.house || '';
    pin.faction = pin.faction || '';
    pin.secret = pin.secret || false;
    pin.text = pin.text || '';
    pin.pinMarker = pin.pinMarker || '';
    pin.banner = pin.banner || '';
    return pin;
  }

  let legacyImportParsed = null;
  let dataManagerParsed = null;

  function openImportMo(){
    legacyImportParsed = null;
    document.getElementById('import-preview').style.display = 'none';
    document.getElementById('import-warn').style.display = 'none';
    document.getElementById('import-apply-btn').disabled = true;
    document.getElementById('import-dropzone').style.background = '';
    document.getElementById('import-file').value = '';
    document.getElementById('import-mo').classList.add('open');
  }

  function importHandleDrop(event){
    event.preventDefault();
    document.getElementById('import-dropzone').style.background = '';
    const file = event.dataTransfer.files[0];
    if(file) importHandleFile(file);
  }

  function importHandleFile(file){
    if(!file || !file.name.endsWith('.json')){
      importShowWarn('Bitte eine .json Datei wählen.');
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      try{
        const data = JSON.parse(event.target.result);
        if(!data.pins || !Array.isArray(data.pins)) throw new Error('Kein gültiges Pin-Format');
        legacyImportParsed = data;
        const preview = document.getElementById('import-preview');
        preview.style.display = 'block';
        preview.innerHTML = `<strong>${data.pins.length} Pins</strong> · ${data.cats?.length || 0} Kategorien · exportiert: ${data.exportedAt ? new Date(data.exportedAt).toLocaleString('de-DE') : 'unbekannt'}`;
        document.getElementById('import-warn').style.display = 'none';
        document.getElementById('import-apply-btn').disabled = false;
      } catch(error){
        importShowWarn('Ungültige JSON-Datei: ' + error.message);
      }
    };
    reader.readAsText(file);
  }

  function importShowWarn(message){
    const warning = document.getElementById('import-warn');
    warning.style.display = 'block';
    warning.textContent = '⚠ ' + message;
    document.getElementById('import-apply-btn').disabled = true;
    legacyImportParsed = null;
  }

  function importApply(){
    if(!legacyImportParsed) return;
    backup('Vor Import');
    const current = state();
    const data = legacyImportParsed;
    if(data.pins) current.pins = data.pins.map(normalizePin);
    if(data.cats) current.cats = data.cats;
    if(data.regionTitle) current.regionTitle = data.regionTitle;
    save();
    applyState(current);
    closeModal('import-mo');
    toast(`✓ ${current.pins.length} Pins importiert & normalisiert`);
    legacyImportParsed = null;
  }

  function openDataMgr(){
    const current = state();
    document.getElementById('exp-pins-cnt').textContent = `(${(current.pins || []).length})`;
    document.getElementById('exp-cats-cnt').textContent = `(${(current.cats || []).length})`;
    document.getElementById('exp-mcat-cnt').textContent = `(${(current.markerCatalog || []).length})`;

    dataManagerParsed = null;
    document.getElementById('dmgr-imp-panel').style.display = 'none';
    document.getElementById('dmgr-dz-inner').innerHTML = `
      <div style="font-size:1.6rem;margin-bottom:.3rem;">📄</div>
      <div style="font-family:'Cinzel',serif;font-size:.78rem;color:#5a3a08;">Datei hierher ziehen oder klicken</div>`;
    document.getElementById('dmgr-file').value = '';
    document.getElementById('datamgr-mo').classList.add('open');
  }

  function dmgrSelectAll(prefix, value){
    document.querySelectorAll(`#${prefix}-checks input[type=checkbox]`).forEach(checkbox => {
      checkbox.checked = value;
    });
  }

  function dmgrExport(){
    const current = state();
    const out = {exportedAt: new Date().toISOString(), version: 1};
    if(document.getElementById('exp-pins').checked) out.pins = current.pins;
    if(document.getElementById('exp-pins').checked) out.zettel = current.zettel || [];
    if(document.getElementById('exp-cats').checked) out.cats = current.cats;
    if(document.getElementById('exp-mcat').checked) out.markerCatalog = current.markerCatalog || [];
    if(document.getElementById('exp-lsb').checked) out.lsb = current.lsb;
    if(document.getElementById('exp-dm').checked) out.dm = current.dm;
    if(document.getElementById('exp-meta').checked){
      out.regionTitle = current.regionTitle;
      out.regionIcon = current.regionIcon;
    }

    const sections = Object.keys(out).filter(key => !['exportedAt', 'version'].includes(key));
    if(!sections.length){
      toast('⚠ Nichts ausgewählt');
      return;
    }

    const filename = (current.regionTitle || 'Karte').replace(/\s+/g, '-')
      + '_Export_' + new Date().toISOString().slice(0, 10) + '.json';
    const blob = new Blob([JSON.stringify(out, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast(`✓ Exportiert: ${sections.join(', ')}`);
  }

  function dmgrHandleDrop(event){
    event.preventDefault();
    document.getElementById('dmgr-dropzone').style.background = '';
    const file = event.dataTransfer.files[0];
    if(file) dmgrHandleFile(file);
  }

  function dmgrHandleFile(file){
    if(!file || !file.name.endsWith('.json')){
      document.getElementById('dmgr-imp-warn').style.display = 'block';
      document.getElementById('dmgr-imp-warn').textContent = '⚠ Bitte eine .json Datei wählen';
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      try{
        const data = JSON.parse(event.target.result);
        dataManagerParsed = data;
        const sections = {
          pins:  {el:'imp-chk-pins',  cnt:'imp-pins-cnt',  val: data.pins?.length},
          cats:  {el:'imp-chk-cats',  cnt:'imp-cats-cnt',  val: data.cats?.length},
          mcat:  {el:'imp-chk-mcat',  cnt:'imp-mcat-cnt',  val: data.markerCatalog?.length},
          lsb:   {el:'imp-chk-lsb',   cnt:null,            val: data.lsb},
          dm:    {el:'imp-chk-dm',    cnt:null,            val: data.dm},
          frame: {el:'imp-chk-frame', cnt:null,            val: data.frame},
          meta:  {el:'imp-chk-meta',  cnt:null,            val: data.regionTitle || data.regionIcon},
        };
        let found = 0;
        Object.values(sections).forEach(section => {
          const element = document.getElementById(section.el);
          if(!element) return;
          const show = section.val !== undefined && section.val !== null && section.val !== false;
          element.style.display = show ? 'flex' : 'none';
          if(show){
            found++;
            if(section.cnt) document.getElementById(section.cnt).textContent = `(${section.val})`;
          }
        });
        const meta = document.getElementById('dmgr-imp-meta');
        meta.textContent = `Datei: ${file.name} · exportiert: ${data.exportedAt ? new Date(data.exportedAt).toLocaleString('de-DE') : 'unbekannt'} · ${found} Bereiche gefunden`;
        document.getElementById('dmgr-imp-warn').style.display = 'none';
        document.getElementById('dmgr-imp-panel').style.display = 'block';
        document.getElementById('dmgr-dz-inner').innerHTML = `<div style="font-size:1.4rem;">✓</div><div style="font-family:'Cinzel',serif;font-size:.75rem;color:var(--gold);">${esc(file.name)} geladen</div>`;
      } catch(error){
        document.getElementById('dmgr-imp-warn').style.display = 'block';
        document.getElementById('dmgr-imp-warn').textContent = '⚠ Ungültige Datei: ' + error.message;
      }
    };
    reader.readAsText(file);
  }

  function dmgrImportApply(){
    if(!dataManagerParsed){
      toast('⚠ Keine Datei geladen');
      return;
    }
    const current = state();
    const data = dataManagerParsed;
    backup('Vor Daten-Import');
    const applied = [];

    if(document.getElementById('imp-pins')?.checked && data.pins){
      current.pins = data.pins.map(normalizePin);
      if(data.zettel) current.zettel = data.zettel;
      applied.push('Pins & Zettel');
    }
    if(document.getElementById('imp-cats')?.checked && data.cats){
      current.cats = data.cats;
      applied.push('Kategorien');
    }
    if(document.getElementById('imp-mcat')?.checked && data.markerCatalog){
      const mode = document.getElementById('imp-mcat-mode')?.value || 'replace';
      if(mode === 'merge'){
        const existing = new Set((current.markerCatalog || []).map(marker => marker.url));
        const toAdd = data.markerCatalog.filter(marker => !existing.has(marker.url));
        current.markerCatalog = [...(current.markerCatalog || []), ...toAdd];
      } else {
        current.markerCatalog = data.markerCatalog;
      }
      applied.push('Marker-Katalog');
    }
    if(document.getElementById('imp-lsb')?.checked && data.lsb){
      current.lsb = data.lsb;
      applied.push('Sidebar');
    }
    if(document.getElementById('imp-dm')?.checked && data.dm){
      current.dm = data.dm;
      applied.push('DM-Daten');
    }
    if(document.getElementById('imp-meta')?.checked){
      if(data.regionTitle) current.regionTitle = data.regionTitle;
      if(data.regionIcon !== undefined) current.regionIcon = data.regionIcon;
      applied.push('Meta');
    }

    if(!applied.length){
      toast('⚠ Nichts ausgewählt');
      return;
    }
    save();
    applyState(current);
    closeModal('datamgr-mo');
    toast(`✓ Importiert: ${applied.join(', ')}`);
    dataManagerParsed = null;
  }

  window.openImportMo = openImportMo;
  window.importHandleDrop = importHandleDrop;
  window.importHandleFile = importHandleFile;
  window.importApply = importApply;
  window.openDataMgr = openDataMgr;
  window.dmgrSelectAll = dmgrSelectAll;
  window.dmgrExport = dmgrExport;
  window.dmgrHandleDrop = dmgrHandleDrop;
  window.dmgrHandleFile = dmgrHandleFile;
  window.dmgrImportApply = dmgrImportApply;
  window.exportData = openDataMgr;
})();
