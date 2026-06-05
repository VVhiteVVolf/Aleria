(function(){
  const runtime = window.KartoRuntime;
  const BACKUP_KEY = 'karto-backups-v1';
  const BACKUP_MAX = 10;

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

  let importParsed = null;
  let dmgrParsed = null;

  function state(){
    return runtime.state();
  }

  function downloadJson(filename, data){
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function normalizePin(p){
    if(p.table){
      p.table = p.table
        .filter(r => r.k || r.v)
        .map(r => ({ k: FIELD_NORM[r.k] || r.k, v: r.v || '' }));
    }
    p.crest = p.crest || '';
    p.region = p.region || '';
    p.house = p.house || '';
    p.faction = p.faction || '';
    p.secret = p.secret || false;
    p.text = p.text || '';
    p.pinMarker = p.pinMarker || '';
    p.banner = p.banner || '';
    p.crestLink = p.crestLink || '';
    p.bannerLink = p.bannerLink || '';
    return p;
  }

  function backupGetAll(){
    try{ return JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]'); }
    catch(e){ return []; }
  }

  function backupSave(label){
    const s = state();
    const all = backupGetAll();
    const snap = {
      ts: Date.now(),
      label: label || 'Automatisch',
      data: JSON.stringify({pins:s.pins, cats:s.cats, regionTitle:s.regionTitle, lsb:s.lsb, dm:s.dm})
    };
    all.unshift(snap);
    if(all.length > BACKUP_MAX) all.length = BACKUP_MAX;
    try{ localStorage.setItem(BACKUP_KEY, JSON.stringify(all)); } catch(e){}
  }

  function backupSaveNow(){
    backupSave('Manuell');
    runtime.toast('💾 Snapshot gespeichert');
    renderBackupList();
  }

  function openBackupMo(){
    renderBackupList();
    document.getElementById('backup-mo').classList.add('open');
  }

  function renderBackupList(){
    const all = backupGetAll();
    const el = document.getElementById('backup-list');
    const esc = runtime.esc;
    if(!all.length){
      el.innerHTML = `<div style="padding:1.5rem;text-align:center;font-family:'EB Garamond',serif;color:var(--ink3);">Noch keine Backups vorhanden.</div>`;
      return;
    }
    el.innerHTML = all.map((b, i) => {
      const d = new Date(b.ts);
      const dateStr = d.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'});
      const timeStr = d.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
      let pinCount = 0;
      try{ pinCount = JSON.parse(b.data).pins?.length || 0; }catch(e){}
      return `<div style="display:flex;align-items:center;gap:.8rem;padding:.65rem 1rem;border-bottom:1px solid var(--border2);${i===0?'background:rgba(180,140,50,.06)':''}">
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Cinzel',serif;font-size:.78rem;color:var(--ink);margin-bottom:.15rem;">
            ${i===0?'<span style="color:var(--gold);margin-right:4px;">●</span>':''}${esc(b.label)}
          </div>
          <div style="font-family:'EB Garamond',serif;font-size:.8rem;color:var(--ink3);">${dateStr} ${timeStr} · ${pinCount} Pins</div>
        </div>
        <button class="s-btn s-cancel" style="padding:2px 10px;font-size:.72rem;flex-shrink:0;" data-action="download-backup" data-backup-index="${i}">⬇ JSON</button>
        <button class="s-btn s-save" style="padding:2px 10px;font-size:.72rem;flex-shrink:0;" data-action="restore-backup" data-backup-index="${i}">↩ Wiederherstellen</button>
      </div>`;
    }).join('');
  }

  function backupDownload(i){
    const all = backupGetAll();
    const b = all[i];
    if(!b) return;
    const d = new Date(b.ts);
    const fname = `Backup_${d.toISOString().slice(0,10)}_${d.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'}).replace(':','-')}.json`;
    downloadJson(fname, b.data);
  }

  function backupRestore(i){
    if(!confirm('Aktuellen Stand mit diesem Backup überschreiben? (Ein neues Backup wird vorher erstellt)')) return;
    backupSave('Vor Wiederherstellung');
    const all = backupGetAll();
    const b = all[i];
    if(!b) return;
    try{
      const s = state();
      const d = JSON.parse(b.data);
      if(d.pins) s.pins = d.pins;
      if(d.cats) s.cats = d.cats;
      if(d.regionTitle) s.regionTitle = d.regionTitle;
      if(d.lsb) s.lsb = d.lsb;
      if(d.dm) s.dm = d.dm;
      runtime.save();
      runtime.applyState(s);
      runtime.closeModal('backup-mo');
      runtime.toast('✓ Backup wiederhergestellt');
    } catch(e){
      runtime.toast('⚠ Fehler beim Wiederherstellen');
    }
  }

  function openImportMo(){
    importParsed = null;
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
    const f = event.dataTransfer.files[0];
    if(f) importHandleFile(f);
  }

  function importHandleFile(f){
    if(!f || !f.name.endsWith('.json')){ importShowWarn('Bitte eine .json Datei wählen.'); return; }
    const reader = new FileReader();
    reader.onload = event => {
      try{
        const d = JSON.parse(event.target.result);
        if(!d.pins || !Array.isArray(d.pins)) throw new Error('Kein gültiges Pin-Format');
        importParsed = d;
        const prev = document.getElementById('import-preview');
        prev.style.display = 'block';
        prev.innerHTML = `<strong>${d.pins.length} Pins</strong> · ${d.cats?.length||0} Kategorien · exportiert: ${d.exportedAt?new Date(d.exportedAt).toLocaleString('de-DE'):'unbekannt'}`;
        document.getElementById('import-warn').style.display = 'none';
        document.getElementById('import-apply-btn').disabled = false;
      } catch(err){
        importShowWarn('Ungültige JSON-Datei: ' + err.message);
      }
    };
    reader.readAsText(f);
  }

  function importShowWarn(msg){
    const w = document.getElementById('import-warn');
    w.style.display = 'block';
    w.textContent = '⚠ ' + msg;
    document.getElementById('import-apply-btn').disabled = true;
    importParsed = null;
  }

  function importApply(){
    if(!importParsed) return;
    backupSave('Vor Import');
    const s = state();
    const d = importParsed;
    if(d.pins) s.pins = d.pins.map(normalizePin);
    if(d.cats) s.cats = d.cats;
    if(d.regionTitle) s.regionTitle = d.regionTitle;
    runtime.save();
    runtime.applyState(s);
    runtime.closeModal('import-mo');
    runtime.toast(`✓ ${s.pins.length} Pins importiert & normalisiert`);
    importParsed = null;
  }

  function openDataMgr(){
    const s = state();
    document.getElementById('exp-pins-cnt').textContent = `(${(s.pins||[]).length})`;
    document.getElementById('exp-cats-cnt').textContent = `(${(s.cats||[]).length})`;
    document.getElementById('exp-mcat-cnt').textContent = `(${(s.markerCatalog||[]).length})`;
    dmgrParsed = null;
    document.getElementById('dmgr-imp-panel').style.display = 'none';
    document.getElementById('dmgr-dz-inner').innerHTML = `
      <div style="font-size:1.6rem;margin-bottom:.3rem;">📄</div>
      <div style="font-family:'Cinzel',serif;font-size:.78rem;color:var(--ink2);">Datei hierher ziehen oder klicken</div>`;
    document.getElementById('dmgr-file').value = '';
    document.getElementById('datamgr-mo').classList.add('open');
  }

  function dmgrSelectAll(prefix, val){
    document.querySelectorAll(`#${prefix}-checks input[type=checkbox]`).forEach(cb => cb.checked = val);
  }

  function dmgrExport(){
    const s = state();
    const out = { exportedAt: new Date().toISOString(), version: 1 };
    if(document.getElementById('exp-pins').checked) out.pins = s.pins;
    if(document.getElementById('exp-cats').checked) out.cats = s.cats;
    if(document.getElementById('exp-mcat').checked) out.markerCatalog = s.markerCatalog || [];
    if(document.getElementById('exp-lsb').checked) out.lsb = s.lsb;
    if(document.getElementById('exp-dm').checked) out.dm = s.dm;
    if(document.getElementById('exp-meta').checked){ out.regionTitle = s.regionTitle; out.regionIcon = s.regionIcon; }

    const sections = Object.keys(out).filter(k => !['exportedAt','version'].includes(k));
    if(!sections.length){ runtime.toast('⚠ Nichts ausgewählt'); return; }

    const fname = (s.regionTitle || 'Karte').replace(/\s+/g, '-')
      + '_Export_' + new Date().toISOString().slice(0,10) + '.json';
    downloadJson(fname, JSON.stringify(out, null, 2));
    runtime.toast(`✓ Exportiert: ${sections.join(', ')}`);
  }

  function dmgrHandleDrop(event){
    event.preventDefault();
    document.getElementById('dmgr-dropzone').style.background = '';
    const f = event.dataTransfer.files[0];
    if(f) dmgrHandleFile(f);
  }

  function dmgrHandleFile(f){
    if(!f || !f.name.endsWith('.json')){
      document.getElementById('dmgr-imp-warn').style.display = 'block';
      document.getElementById('dmgr-imp-warn').textContent = '⚠ Bitte eine .json Datei wählen';
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const d = JSON.parse(event.target.result);
        dmgrParsed = d;
        const secs = {
          pins:  {el:'imp-chk-pins',  cnt:'imp-pins-cnt',  val: d.pins?.length},
          cats:  {el:'imp-chk-cats',  cnt:'imp-cats-cnt',  val: d.cats?.length},
          mcat:  {el:'imp-chk-mcat',  cnt:'imp-mcat-cnt',  val: d.markerCatalog?.length},
          lsb:   {el:'imp-chk-lsb',   cnt:null,            val: d.lsb},
          dm:    {el:'imp-chk-dm',    cnt:null,            val: d.dm},
          frame: {el:'imp-chk-frame', cnt:null,            val: d.frame},
          meta:  {el:'imp-chk-meta',  cnt:null,            val: d.regionTitle || d.regionIcon},
        };
        let found = 0;
        Object.values(secs).forEach(s => {
          const el = document.getElementById(s.el);
          const show = s.val !== undefined && s.val !== null && s.val !== false;
          el.style.display = show ? 'flex' : 'none';
          if(show){
            found++;
            if(s.cnt) document.getElementById(s.cnt).textContent = `(${s.val})`;
          }
        });
        document.getElementById('dmgr-imp-meta').textContent =
          `Datei: ${f.name} · exportiert: ${d.exportedAt ? new Date(d.exportedAt).toLocaleString('de-DE') : 'unbekannt'} · ${found} Bereiche gefunden`;
        document.getElementById('dmgr-imp-warn').style.display = 'none';
        document.getElementById('dmgr-imp-panel').style.display = 'block';
        document.getElementById('dmgr-dz-inner').innerHTML =
          `<div style="font-size:1.4rem;">✓</div><div style="font-family:'Cinzel',serif;font-size:.75rem;color:var(--gold);">${f.name} geladen</div>`;
      } catch(err){
        document.getElementById('dmgr-imp-warn').style.display = 'block';
        document.getElementById('dmgr-imp-warn').textContent = '⚠ Ungültige Datei: ' + err.message;
      }
    };
    reader.readAsText(f);
  }

  function dmgrImportApply(){
    if(!dmgrParsed){ runtime.toast('⚠ Keine Datei geladen'); return; }
    const s = state();
    const d = dmgrParsed;
    backupSave('Vor Daten-Import');
    const applied = [];

    if(document.getElementById('imp-pins')?.checked && d.pins){ s.pins = d.pins.map(normalizePin); applied.push('Pins'); }
    if(document.getElementById('imp-cats')?.checked && d.cats){ s.cats = d.cats; applied.push('Kategorien'); }
    if(document.getElementById('imp-mcat')?.checked && d.markerCatalog){
      const mode = document.getElementById('imp-mcat-mode')?.value || 'replace';
      if(mode === 'merge'){
        const existing = new Set((s.markerCatalog || []).map(m => m.url));
        const toAdd = d.markerCatalog.filter(m => !existing.has(m.url));
        s.markerCatalog = [...(s.markerCatalog || []), ...toAdd];
      } else {
        s.markerCatalog = d.markerCatalog;
      }
      applied.push('Marker-Katalog');
    }
    if(document.getElementById('imp-lsb')?.checked && d.lsb){ s.lsb = d.lsb; applied.push('Sidebar'); }
    if(document.getElementById('imp-dm')?.checked && d.dm){ s.dm = d.dm; applied.push('DM-Daten'); }
    if(document.getElementById('imp-meta')?.checked){
      if(d.regionTitle) s.regionTitle = d.regionTitle;
      if(d.regionIcon !== undefined) s.regionIcon = d.regionIcon;
      applied.push('Meta');
    }

    if(!applied.length){ runtime.toast('⚠ Nichts ausgewählt'); return; }
    runtime.save();
    runtime.applyState(s);
    runtime.closeModal('datamgr-mo');
    runtime.toast(`✓ Importiert: ${applied.join(', ')}`);
    dmgrParsed = null;
  }

  function exportData(){
    openDataMgr();
  }

  window.backupGetAll = backupGetAll;
  window.backupSave = backupSave;
  window.backupSaveNow = backupSaveNow;
  window.openBackupMo = openBackupMo;
  window.renderBackupList = renderBackupList;
  window.backupDownload = backupDownload;
  window.backupRestore = backupRestore;
  window.normalizePin = normalizePin;
  window.openImportMo = openImportMo;
  window.importHandleDrop = importHandleDrop;
  window.importHandleFile = importHandleFile;
  window.importApply = importApply;
  window.exportData = exportData;
  window.openDataMgr = openDataMgr;
  window.dmgrSelectAll = dmgrSelectAll;
  window.dmgrExport = dmgrExport;
  window.dmgrHandleDrop = dmgrHandleDrop;
  window.dmgrHandleFile = dmgrHandleFile;
  window.dmgrImportApply = dmgrImportApply;
})();
