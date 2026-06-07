// ═══════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════
const TAFEL_CONFIG = window.TAFEL_CONFIG || {};
const PASSWORD = '7777';

const DEFAULT_CATS = [
  {id:'tafl001', label:'Quest / Auftrag',   color:'#1a1200'},
  {id:'tafl002', label:'Steckbrief',        color:'#c06060'},
  {id:'tafl003', label:'Ankündigung',       color:'#60a0c8'},
  {id:'tafl004', label:'Vermisst',          color:'#9060c8'},
  {id:'tafl005', label:'Warnung',           color:'#e07040'},
  {id:'tafl006', label:'Freie Notiz',       color:'#60a060'},
  {id:'tafl007', label:'Geheim',            color:'#806080'},
];

const DEFAULT_MARKER_CATALOG = [
  {id:'mmhy1v2v5vo1',url:'https://i.imgur.com/si6Lzp4.png',name:'Lager, Camp',group:'Lager'},
  {id:'mmhy2ggp7sm2',url:'https://i.imgur.com/Qssb7fy.png',name:'Druidenhain',group:'Druidenhain'},
  {id:'mmhy31uz6u4x',url:'https://i.imgur.com/rTtcgCX.png',name:'Höhle, Spalt',group:'Dungeon'},
  {id:'mmhy3d2p8oi3',url:'https://i.imgur.com/27bSz0a.png',name:'Gruft',group:'Dungeon'},
  {id:'mmhy402r9mbv',url:'https://i.imgur.com/M4EXUZA.png',name:'Düstere Burg',group:'Ort'},
  {id:'mmhy4bozrx2q',url:'https://i.imgur.com/xPjYDr7.png',name:'Hain',group:'Druidenhain'},
  {id:'mmhy6pk7x8tt',url:'https://i.imgur.com/7IPY6U6.png',name:'Turmruine',group:'Ruinen'},
  {id:'mmhy7kiv76or',url:'https://i.imgur.com/qIPp64T.png',name:'Monsterlager',group:'Monster, Kreaturen'},
  {id:'mmhy7v09o9hv',url:'https://i.imgur.com/Cy1m0Yg.png',name:'Piratenversteck',group:'Lager'},
  {id:'mmhy8gukzwrf',url:'https://i.imgur.com/oKYN5Zi.png',name:'Ahnenbaum',group:'Druidenhain'},
  {id:'mmhy8xy8th6r',url:'https://i.imgur.com/W91SDei.png',name:'Hafensiedlung',group:'Siedlungen'},
  {id:'mmhy9guzperf',url:'https://i.imgur.com/ZMBWVT3.png',name:'Wahrzeichen',group:'Ort'},
  {id:'mmhy9qiwr9d3',url:'https://i.imgur.com/owm3FRd.png',name:'Antike Ruine',group:'Ruinen'},
  {id:'mmhya29o2ou0',url:'https://i.imgur.com/oQo2DxQ.png',name:'Bauernsiedlung',group:'Siedlungen'},
  {id:'mmhyapiiwk6c',url:'https://i.imgur.com/zn8PqT9.png',name:'Burgsiedlung',group:'Siedlungen'},
  {id:'mmhyb1j0a7rr',url:'https://i.imgur.com/4gUcfj7.png',name:'Waldsiedlung',group:'Siedlungen'},
  {id:'mmhybamogr5u',url:'https://i.imgur.com/WUjAGC5.png',name:'Bergbausiedlung',group:'Siedlungen'},
  {id:'mmhybk0g5ep5',url:'https://i.imgur.com/XBchNeO.png',name:'Leuchtturm',group:'Siedlungen'},
  {id:'mmhybs1at7gb',url:'https://i.imgur.com/W5reRk3.png',name:'Sonstiges',group:'Ort'},
  {id:'mmhycsrakooq',url:'https://i.imgur.com/gCD7g8z.png',name:'Befestigung, Turm',group:'Siedlungen'},
  {id:'mmhyd9rw13hp',url:'https://i.imgur.com/rkPVj2q.png',name:'Großes Hügelgrab',group:'Dungeon'},
  {id:'mmhydq2qvg60',url:'https://i.imgur.com/3FCGHjn.png',name:'Antikes Grabmal',group:'Dungeon'},
  {id:'mmhye4s8sgib',url:'https://i.imgur.com/oa6fFKZ.png',name:'Schmiede',group:'Einzelne Orte'},
  {id:'mmhyegn0obaj',url:'https://i.imgur.com/P0KVz1C.png',name:'Flusssiedlung',group:'Siedlungen'},
  {id:'mmhyews3t5aw',url:'https://i.imgur.com/QgWTzna.png',name:'Schiffswrack',group:'Ort'},
  {id:'mmhyf9ai4we3',url:'https://i.imgur.com/D5KPZrl.png',name:'Klostersiedlung',group:'Siedlungen'},
  {id:'mmhyfwp6jspa',url:'https://i.imgur.com/UdZpwwT.png',name:'Kleinstadt, Bardensiedlung',group:'Siedlungen'},
  {id:'mmhygeiqc942',url:'https://i.imgur.com/ig4QY5L.png',name:'Große Stadt',group:'Städte'},
  {id:'mmhyh0xyptir',url:'https://i.imgur.com/ZyWnMQI.png',name:'Handelssiedlung, Straßensiedlung',group:'Siedlungen'},
  {id:'mmhyhe9aohw9',url:'https://i.imgur.com/IzgkaZA.png',name:'Stadtruine',group:'Ruinen'},
  {id:'mmhyhpsw5bdv',url:'https://i.imgur.com/a86oa8b.png',name:'Große Burg',group:'Städte'},
  {id:'mmhyi688vt0g',url:'https://i.imgur.com/b3Dis88.png',name:'Ausgrabung',group:'Lager'},
  {id:'mmhyihniof25',url:'https://i.imgur.com/QfEWeNI.png',name:'Taverne',group:'Einzelne Orte'},
  {id:'mmhyiw9w5qme',url:'https://i.imgur.com/7jYp7Ec.png',name:'Siedlungsruine',group:'Ruinen'},
  {id:'mmhyj3uc39d4',url:'https://i.imgur.com/xnDdkTd.png',name:'Magierturm',group:'Einzelne Orte'},
  {id:'mmhyjfea8n2b',url:'https://i.imgur.com/jHSfDfQ.png',name:'Brauersiedlung',group:'Siedlungen'},
  {id:'mmhyjpeo7nr4',url:'https://i.imgur.com/pj1bZ3c.png',name:'Turnierfeld',group:'Lager'},
  {id:'mmhyk0z25v4z',url:'https://i.imgur.com/UhmOtK9.png',name:'Jägerlager',group:'Lager'},
  {id:'mmhyk9omthtu',url:'https://i.imgur.com/TbPgU39.png',name:'Kriegslager',group:'Lager'},
  {id:'mmhyl0rch8om',url:'https://i.imgur.com/h70HD3e.png',name:'Festung',group:'Ort'},
  {id:'mmhylbiaxcz3',url:'https://i.imgur.com/czlsvjk.png',name:'Einzelne Ruine',group:'Ruinen'},
  {id:'mmhyltcc3a1x',url:'https://i.imgur.com/0uPEURl.png',name:'Sumpf- Moorsiedlung',group:'Siedlungen'},
  {id:'mmhym8zo3azt',url:'https://i.imgur.com/ztEu5O7.png',name:'Hauptstadt',group:'Städte'},
  {id:'mmhymmwwir59',url:'https://i.imgur.com/oQuDDCk.png',name:'Pferdesiedlung',group:'Siedlungen'},
  {id:'mmhyn26wfw4s',url:'https://i.imgur.com/pksanNk.png',name:'Kaufmannssiedlung',group:'Siedlungen'},
  {id:'mmhynd7erizf',url:'https://i.imgur.com/OdbjAeR.png',name:'Söldner/Banditen Lager',group:'Lager'},
  {id:'mmhynr1ma41r',url:'https://i.imgur.com/kdjcTYV.png',name:'Diebesgilde',group:'Lager'},
  {id:'mmhyo03k4th4',url:'https://i.imgur.com/4JhJVAe.png',name:'Kultistenversteck',group:'Lager'},
  {id:'mmhyoelgkk9u',url:'https://i.imgur.com/GrUPOsK.png',name:'Hügelgrab, klein',group:'Dungeon'},
  {id:'mmhyorh0f51w',url:'https://i.imgur.com/J2sSgDc.png',name:'Methalle',group:'Einzelne Orte'},
  {id:'mmhyp27egsr6',url:'https://i.imgur.com/BMmLQin.png',name:'Verwunschener Wald',group:'Ort'},
  {id:'mmhypwaasn7f',url:'https://i.imgur.com/cuVBi3a.png',name:'Ritterliches Gut',group:'Einzelne Orte'},
  {id:'mmhyqcq9e9w8',url:'https://i.imgur.com/frFNzJJ.png',name:'Dimensionaler Riss',group:'Ort'},
  {id:'mmhyqo9qnb18',url:'https://i.imgur.com/o2dIFVI.png',name:'Fähre, Furt',group:'Ort'},
  {id:'mmhyr6ggtc37',url:'https://i.imgur.com/BM4XrJ8.png',name:'Gasthof, Herberge',group:'Einzelne Orte'},
  {id:'mmhyrk2dpslf',url:'https://i.imgur.com/JpCv3lu.png',name:'Heiße Quellen',group:'Ort'},
  {id:'mmhys0dzbfte',url:'https://i.imgur.com/l29ikqO.png',name:'Jägerhaus, Jagdhaus, Jäger',group:'Einzelne Orte'},
  {id:'mmhysddvuzoh',url:'https://i.imgur.com/oV4VYuE.png',name:'Monsterhort',group:'Dungeon'},
  {id:'mmhyt6evk15e',url:'https://i.imgur.com/yS1IZVM.png',name:'Ländliches Gut',group:'Einzelne Orte'},
  {id:'mmhytf3rttx3',url:'https://i.imgur.com/vkMw1eo.png',name:'Plantage',group:'Einzelne Orte'},
  {id:'mmhyts4v2042',url:'https://i.imgur.com/NH4abC8.png',name:'Wegesschrein',group:'Ort'},
  {id:'mmhyusqfs3vl',url:'https://i.imgur.com/zudaHxx.png',name:'Zoll, Grenzposten',group:'Einzelne Orte'},
  {id:'mmhyv2vdwluc',url:'https://i.imgur.com/EkzS9nU.png',name:'Totem, Waldschrat',group:'Ort'},
  {id:'mmhyvispb0ju',url:'https://i.imgur.com/N2Pw8Dn.png',name:'Viehzüchter, Weide, Hof',group:'Einzelne Orte'},
  {id:'mmhywaaxhik7',url:'https://i.imgur.com/I40DFfC.png',name:'Weingut, moderat',group:'Einzelne Orte'},
  {id:'mmhywrd12a2a',url:'https://i.imgur.com/LlxOwL3.png',name:'Schiff',group:'Einzelne Orte'},
  {id:'mmhyx1cdo310',url:'https://i.imgur.com/w8ZQqt1.png',name:'Ritterburg',group:'Einzelne Orte'},
  {id:'mmhyxjmf13p3',url:'https://i.imgur.com/0FocBLD.png',name:'Anwesen',group:'Einzelne Orte'},
  {id:'mmhyxza5y2p9',url:'https://i.imgur.com/LHe3Ld1.png',name:'Familienhof',group:'Einzelne Orte'},
  {id:'mmhyynav6vzr',url:'https://i.imgur.com/xRYQ5yq.png',name:'Außenposten',group:'Einzelne Orte'},
  {id:'mmhyz18t7j1c',url:'https://i.imgur.com/UV2ynil.png',name:'Großes Weingut',group:'Einzelne Orte'},
  {id:'mmhyzd3pgkrl',url:'https://i.imgur.com/piwh9ya.png',name:'Jagdklingen Lager',group:'Gilden'},
  {id:'mmhyzo7hxsdr',url:'https://i.imgur.com/w8g32Iv.png',name:'Windreiter Standort',group:'Gilden'},
  {id:'mmhz03mpxj4s',url:'https://i.imgur.com/Cnr33rb.png',name:'Möwensang Standort',group:'Gilden'},
];

// ═══════════════════════════════════════════
// STATE — everything saved to Firebase
// ═══════════════════════════════════════════
let S = {
  pins: [],
  zettel: [],
  cats: JSON.parse(JSON.stringify(TAFEL_CONFIG.defaultCats || DEFAULT_CATS)),
  dotSize: 18,
  lblSize: 13,
  regionIcon: TAFEL_CONFIG.regionIcon || '',
  regionTitle: TAFEL_CONFIG.title || '📋 Anzeigetafel-Vorlage',
  boardImages: {},
  dm: { sessions:[], notes:'', groupStatus:{} },
  markerCatalog: JSON.parse(JSON.stringify(TAFEL_CONFIG.defaultMarkerCatalog || DEFAULT_MARKER_CATALOG)),
};
let editMode=false, addingPin=false;
let imgW=0, imgH=0;
let vx=0, vy=0, vz=1;
// mapReady no longer needed - permanent RAF loop handles canvas sync
let panning=false, panLast={x:0,y:0};
let scrollPinId=null;
let saveTimer=null, ignRemote=false;
let activeFilter='all';

const mapWrap=document.getElementById('map-wrap');
const stage=document.getElementById('map-stage');
const pl=document.getElementById('pl');
const pc=document.getElementById('pc');

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function esc(s){return(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function mediaLink(html, href){
  const url=(href||'').trim();
  return url?`<a class="sv-linked-media" href="${esc(url)}">${html}</a>`:html;
}
function catOf(p){return S.cats.find(c=>c.id===p.cat)||S.cats[S.cats.length-1]||{id:'other',label:'Sonstiges',color:'#7a6040'};}
let _ht;function hint(m){const e=document.getElementById('hint');e.textContent=m;e.classList.toggle('on',!!m);}
let _tt;function toast(m){const e=document.getElementById('toast');e.textContent=m;e.classList.add('on');clearTimeout(_tt);_tt=setTimeout(()=>e.classList.remove('on'),2800);}
function isZettelLayer(){return currentLayer==='normal';}
function isPinLayer(){return currentLayer==='pins';}
function canEditZettel(){return editMode&&isZettelLayer();}
function canEditPins(){return editMode&&isPinLayer();}

function applyTafelConfig(){
  const cfg=TAFEL_CONFIG;
  if(cfg.title && (!S.regionTitle || S.regionTitle==='📋 Anzeigetafel-Vorlage')) S.regionTitle=cfg.title;
  if(cfg.regionIcon && !S.regionIcon) S.regionIcon=cfg.regionIcon;
  applyBoardImages();
  if(cfg.documentTitle) document.title=cfg.documentTitle;
}

function defaultBoardImages(){
  const imgs=TAFEL_CONFIG.images||{};
  return {
    board: imgs.board || '',
    marker: imgs.marker || '',
  };
}

function effectiveBoardImages(){
  return {...defaultBoardImages(), ...(S.boardImages || {})};
}

function placeholderBoardImage(title){
  const safeTitle=String(title||'Anzeigetafel').replace(/[&<>"']/g,'');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1000">
    <rect width="1400" height="1000" fill="#d8c091"/>
    <rect x="70" y="70" width="1260" height="860" fill="#eadab2" stroke="#8a6510" stroke-width="8"/>
    <text x="700" y="455" text-anchor="middle" font-family="serif" font-size="62" fill="#5a3a08">${safeTitle}</text>
    <text x="700" y="535" text-anchor="middle" font-family="serif" font-size="32" fill="#5a3a08">Tafelbild fehlt</text>
    <text x="700" y="590" text-anchor="middle" font-family="serif" font-size="24" fill="#5a3a08">Editormodus -> Bilder -> Imgur-Links eintragen</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function applyBoardImages(){
  const imgs=effectiveBoardImages();
  const fallback=placeholderBoardImage(S.regionTitle||TAFEL_CONFIG.title);
  const board=document.getElementById('ln');
  const regions=document.getElementById('lr');
  const pins=document.getElementById('lm');
  const boardSrc=imgs.board||fallback;
  const markerSrc=imgs.marker||boardSrc;
  if(board) board.src=boardSrc;
  if(regions) regions.src=markerSrc;
  if(pins) pins.src=markerSrc;
}

// ═══════════════════════════════════════════
// BACKUP VERLAUF — localStorage, max 10 Snapshots
// ═══════════════════════════════════════════
const BACKUP_KEY = `tafel-backups-${TAFEL_CONFIG.boardId || 'template-tafel'}`;
const BACKUP_MAX = 10;

function backupGetAll(){
  try{ return JSON.parse(localStorage.getItem(BACKUP_KEY)||'[]'); }
  catch(e){ return []; }
}
function backupSave(label){
  const all = backupGetAll();
  const snap = {
    ts: Date.now(),
    label: label||'Automatisch',
    data: JSON.stringify({pins:S.pins, zettel:S.zettel, cats:S.cats, regionTitle:S.regionTitle, boardImages:S.boardImages, lsb:S.lsb, dm:S.dm})
  };
  all.unshift(snap);
  if(all.length>BACKUP_MAX) all.length=BACKUP_MAX;
  try{ localStorage.setItem(BACKUP_KEY, JSON.stringify(all)); } catch(e){}
}
function backupSaveNow(){
  backupSave('Manuell');
  toast('💾 Snapshot gespeichert');
  renderBackupList();
}
function openBackupMo(){
  renderBackupList();
  document.getElementById('backup-mo').classList.add('open');
}
function renderBackupList(){
  const all=backupGetAll();
  const el=document.getElementById('backup-list');
  if(!all.length){
    el.innerHTML=`<div style="padding:1.5rem;text-align:center;font-family:'EB Garamond',serif;color:#5a3a08;">Noch keine Backups vorhanden.</div>`;
    return;
  }
  el.innerHTML=all.map((b,i)=>{
    const d=new Date(b.ts);
    const dateStr=d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});
    const timeStr=d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
    let pinCount=0; try{ pinCount=JSON.parse(b.data).pins?.length||0; }catch(e){}
    return `<div style="display:flex;align-items:center;gap:.8rem;padding:.65rem 1rem;border-bottom:1px solid var(--border2);${i===0?'background:rgba(180,140,50,.06)':''}">
      <div style="flex:1;min-width:0;">
        <div style="font-family:'Cinzel',serif;font-size:.78rem;color:#1a1200;margin-bottom:.15rem;">
          ${i===0?'<span style="color:var(--gold);margin-right:4px;">●</span>':''}${esc(b.label)}
        </div>
        <div style="font-family:'EB Garamond',serif;font-size:.8rem;color:#5a3a08;">${dateStr} ${timeStr} · ${pinCount} Pins</div>
      </div>
      <button class="s-btn s-cancel" style="padding:2px 10px;font-size:.72rem;flex-shrink:0;" data-action="backup-download" data-backup-index="${i}">⬇ JSON</button>
      <button class="s-btn s-save"   style="padding:2px 10px;font-size:.72rem;flex-shrink:0;" data-action="backup-restore" data-backup-index="${i}">↩ Wiederherstellen</button>
    </div>`;
  }).join('');
}
function backupDownload(i){
  const all=backupGetAll();
  const b=all[i]; if(!b)return;
  const d=new Date(b.ts);
  const fname=`Backup_${d.toISOString().slice(0,10)}_${d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}).replace(':','-')}.json`;
  const blob=new Blob([b.data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=fname; a.click();
  URL.revokeObjectURL(url);
}
function backupRestore(i){
  if(!confirm('Aktuellen Stand mit diesem Backup überschreiben? (Ein neues Backup wird vorher erstellt)')) return;
  backupSave('Vor Wiederherstellung');
  const all=backupGetAll();
  const b=all[i]; if(!b)return;
  try{
    const d=JSON.parse(b.data);
    if(d.pins) S.pins=d.pins;
    if(d.cats) S.cats=d.cats;
    if(d.regionTitle) S.regionTitle=d.regionTitle;
    if(d.boardImages) S.boardImages=d.boardImages;
    if(d.lsb) S.lsb=d.lsb;
    if(d.dm) S.dm=d.dm;
    saveD();
    applyState(S);
    closeLMo('backup-mo');
    toast('✓ Backup wiederhergestellt');
  } catch(e){ toast('⚠ Fehler beim Wiederherstellen'); }
}

function saveD(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>{
    backupSave('Automatisch');
    if(!window._fb){return;}
    ignRemote=true;
    window._fb.saveAll(S).then(()=>setTimeout(()=>ignRemote=false,5000));
  },800);
}

window.TafelRuntime = {
  state: () => S,
  isEditMode: () => editMode,
  uid,
  esc,
  save: saveD,
  backup: backupSave,
  toast,
  renderZettel,
  closeModal(id){ closeLMo(id); },
  closeSidebar(){ closeSidebar(); },
  clearPinSidebar(){ sidebarPinId=null; },
  pinTemplates(){ return PIN_TEMPLATES; },
  applyState,
  renderPins,
  openEditorShell,
  renderEditorPreview,
  isOverwriteMode: () => !!owTemplate,
  applyOverwrite(targetId){ applyOverwrite(targetId); },
  setLayer(layer){ setLayer(layer); },
  currentLayer: () => currentLayer,
  canEditZettel,
  canEditPins,
  isZettelLayer,
  isPinLayer,
  activeCategoryFilter: () => activeFilter,
  setActiveCategoryFilter(filter){ activeFilter = filter; },
  catOf,
  mapWrap: () => mapWrap,
  mapStage: () => stage,
  pinLayer: () => pl,
  imageSize(){
    return {w:imgW, h:imgH};
  },
  mapTransform(){
    return {x:vx, y:vy, z:vz};
  },
  setMapTransform(x, y, z){
    vx=x;vy=y;vz=z;stage.style.transform=`translate(${vx}px,${vy}px) scale(${vz})`;
  },
  mapPointFromClient(clientX, clientY){
    const rect=mapWrap.getBoundingClientRect();
    return {x:(clientX-rect.left-vx)/vz, y:(clientY-rect.top-vy)/vz};
  },
  normalizedMapPointFromClient(clientX, clientY){
    const point=this.mapPointFromClient(clientX, clientY);
    return {x:point.x/imgW, y:point.y/imgH};
  },
};

function applyState(remote){
  if(remote.pins)       S.pins=remote.pins;
  if(remote.zettel)     S.zettel=remote.zettel||[];
  if(!S.zettel)         S.zettel=[];
  if(remote.cats)       S.cats=remote.cats;
  if(remote.dotSize)    S.dotSize=remote.dotSize;
  if(remote.lblSize)    S.lblSize=remote.lblSize;
  if(remote.regionIcon!==undefined) S.regionIcon=remote.regionIcon;
  if(remote.regionTitle) S.regionTitle=remote.regionTitle;
  if(remote.boardImages!==undefined) S.boardImages=remote.boardImages||{};
  if(remote.dm)         {S.dm=remote.dm;S.dm.sessions=S.dm.sessions||[];S.dm.groupStatus=S.dm.groupStatus||{};}
  if(remote.markerCatalog?.length) S.markerCatalog=remote.markerCatalog;
  applyBoardImages();
  applySizes();
  applyRegionMeta();
  renderPins();
  window.renderCatBar?.();
  lsbLoad(remote);
  dmLoad();
}
function applySizes(){
  const _cw=S.cardWidth||1100;
  // --card-w is no longer set globally; each card sets its own width on open
  const sl=document.getElementById('card-w-slider');
  const vl=document.getElementById('card-w-val');
  if(sl) sl.value=_cw;
  if(vl) vl.textContent=_cw;
  const ds=document.getElementById('dot-sl'), ls=document.getElementById('lbl-sl');
  if(ds){ds.value=S.dotSize;document.getElementById('dot-sl-val').textContent=S.dotSize;}
  if(ls){ls.value=S.lblSize;document.getElementById('lbl-sl-val').textContent=S.lblSize;}
  // Update placement cursor size
  pc.style.width=S.dotSize+'px';pc.style.height=S.dotSize+'px';
}
function applyRegionMeta(){
  // Title
  const t=document.getElementById('title');
  if(t) t.textContent=S.regionTitle||'📋 Anzeigetafel-Vorlage';
  document.title=(S.regionTitle||'📋 Anzeigetafel-Vorlage')+' — Anzeigetafel';
  // Icon
  const iw=document.getElementById('region-icon-wrap');
  if(S.regionIcon){
    iw.innerHTML=`<img src="${esc(S.regionIcon)}" alt="Icon" onerror="window.tafelHandleRegionIconError(this)"/>`;
    iw.classList.add('has-img');
  } else {
    iw.innerHTML='🗺';
    iw.classList.remove('has-img');
  }
}

function tafelHandleRegionIconError(img){
  const parent=img?.parentElement;
  if(!parent)return;
  parent.innerHTML='🗺';
  parent.classList.remove('has-img');
}
window.tafelHandleRegionIconError=tafelHandleRegionIconError;

// ═══════════════════════════════════════════
// IMAGE / MAP
// ═══════════════════════════════════════════
function onImgLoad(img){imgW=img.naturalWidth;imgH=img.naturalHeight;stage.style.width=imgW+'px';stage.style.height=imgH+'px';fitView();renderPins();window.renderCatBar?.();}
function onImgErr(){imgW=1400;imgH=1000;stage.style.width=imgW+'px';stage.style.height=imgH+'px';fitView();renderPins();window.renderCatBar?.();toast('⚠ Tafel-Bilder nicht gefunden — Pfade prüfen');}
// Attach handlers after functions are defined to avoid "not defined" errors
(function(){const ln=document.getElementById('ln');if(ln){ln.onload=function(){onImgLoad(ln);};ln.onerror=function(){onImgErr();};if(ln.complete&&ln.naturalWidth){onImgLoad(ln);}else if(ln.complete){onImgErr();}}})();
function fitView(){
  window.TafelBoardViewport?.fitView();
}
function applyT(){stage.style.transform=`translate(${vx}px,${vy}px) scale(${vz})`;}
new ResizeObserver(()=>{if(imgW)fitView();}).observe(mapWrap);

// Permanent RAF loop started in init() after mCv is ready

// ═══════════════════════════════════════════
// LAYERS
// ═══════════════════════════════════════════
let currentLayer='normal';
function syncLayerEditControls(){
  const showZettel=editMode&&isZettelLayer();
  const showPins=editMode&&isPinLayer();
  document.getElementById('btn-add-zettel').style.display=showZettel?'block':'none';
  document.getElementById('btn-add-ort').style.display=showPins?'block':'none';
  document.getElementById('btn-stamp').style.display=showPins?'block':'none';
  document.getElementById('btn-overwrite').style.display=showPins?'block':'none';
}
function _applyLayer(l){
  currentLayer=l;
  window.TafelBoardLayers.apply(l, {editMode});
  syncLayerEditControls();
}
function setLayer(l){
  if(addingOrt||addingZettel||addingPin) cancelAdd();
  if(l!==currentLayer){
    if(stampTemplate) stopStamp();
    if(owTemplate) stopOverwrite();
    closeSidebar();
  }
  _applyLayer(l);
}

// ═══════════════════════════════════════════
// EDIT MODE
// ═══════════════════════════════════════════
function toggleEdit(){editMode?exitEdit():openPw();}
function exitEdit(){
  editMode=false;addingPin=false;addingZettel=false;addingOrt=false;
  document.getElementById('btn-edit').textContent='🔒 Bearbeiten';
  document.getElementById('btn-edit').classList.remove('on');
  document.getElementById('lock-lbl').textContent='gesperrt';
  document.getElementById('btn-add-zettel').style.display='none';
  document.getElementById('btn-add-ort').style.display='none';
  document.getElementById('btn-stamp').style.display='none';
  document.getElementById('btn-overwrite').style.display='none';
  document.getElementById('btn-board-images').style.display='none';
  document.getElementById('btn-export').style.display='none';
  document.getElementById('dm-btn-cats').style.display='none';
  document.getElementById('dm-btn-mcat').style.display='none';
  document.getElementById('dm-btn-backup').style.display='none';
  document.getElementById('dot-sl-wrap').style.display='none';
  document.getElementById('lbl-sl-wrap').style.display='none';
  const t=document.getElementById('title');t.classList.remove('editable');t.title='';
  const iw=document.getElementById('region-icon-wrap');iw.classList.remove('editable');iw.title='';
  mapWrap.style.cursor='grab';hint('');renderPins();
}
function enterEdit(){
  editMode=true;
  document.getElementById('btn-edit').textContent='🔓 Editormodus';
  document.getElementById('btn-edit').classList.add('on');
  document.getElementById('lock-lbl').textContent='aktiv';
  syncLayerEditControls();
  document.getElementById('btn-board-images').style.display='block';
  document.getElementById('btn-export').style.display='block';
  document.getElementById('dm-btn-cats').style.display='block';
  document.getElementById('dm-btn-mcat').style.display='block';
  document.getElementById('dm-btn-backup').style.display='block';
  document.getElementById('dot-sl-wrap').style.display='flex';
  document.getElementById('lbl-sl-wrap').style.display='flex';
  const t=document.getElementById('title');t.classList.add('editable');t.title='Klicken zum Bearbeiten';
  const iw=document.getElementById('region-icon-wrap');iw.classList.add('editable');iw.title='Klicken um Icon zu setzen';
  mapWrap.style.cursor='grab';
  renderPins();toast('✓ Editormodus aktiviert');
}

function openPw(){document.getElementById('pw-mo').classList.add('open');setTimeout(()=>document.getElementById('pw-inp').focus(),70);}
function closePw(){document.getElementById('pw-mo').classList.remove('open');document.getElementById('pw-inp').value='';document.getElementById('pw-err').style.display='none';}
function checkPw(){
  if(document.getElementById('pw-inp').value===PASSWORD){closePw();enterEdit();}
  else{document.getElementById('pw-err').style.display='block';document.getElementById('pw-inp').select();}
}

// ═══════════════════════════════════════════
// TITLE EDIT
// ═══════════════════════════════════════════
let _prevTitle='';
function onTitleClick(){
  if(!editMode)return;
  const t=document.getElementById('title');
  const inp=document.getElementById('title-input');
  _prevTitle=S.regionTitle;
  inp.value=S.regionTitle;
  t.style.display='none';inp.style.display='block';inp.focus();inp.select();
}
function saveTitleEdit(){
  const t=document.getElementById('title');
  const inp=document.getElementById('title-input');
  const v=inp.value.trim()||_prevTitle;
  S.regionTitle=v;t.textContent=v;document.title=v+' — Anzeigetafel';
  t.style.display='';inp.style.display='none';
  saveD();
}
function cancelTitleEdit(){
  const t=document.getElementById('title');
  const inp=document.getElementById('title-input');
  t.style.display='';inp.style.display='none';
}

// ═══════════════════════════════════════════
// REGION ICON
// ═══════════════════════════════════════════
function onIconClick(){
  if(!editMode)return;
  const inp=document.getElementById('icon-url-inp');
  inp.value=S.regionIcon||'';
  // update preview
  const prev=document.getElementById('icon-preview');
  if(S.regionIcon) prev.innerHTML=`<img src="${esc(S.regionIcon)}" style="width:100%;height:100%;object-fit:cover"/>`;
  else prev.innerHTML='🗺';
  document.getElementById('icon-mo').classList.add('open');
  setTimeout(()=>inp.focus(),60);
}
function closeIconModal(){document.getElementById('icon-mo').classList.remove('open');}
function previewIconUrl(){
  const u=document.getElementById('icon-url-inp').value.trim();
  const prev=document.getElementById('icon-preview');
  if(u) prev.innerHTML=`<img src="${u}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='❌'"/>`;
  else prev.innerHTML='🗺';
}
function saveIcon(){
  const u=document.getElementById('icon-url-inp').value.trim();
  S.regionIcon=u;applyRegionMeta();saveD();closeIconModal();toast('✓ Icon gespeichert');
}
function clearIcon(){
  S.regionIcon='';applyRegionMeta();saveD();closeIconModal();toast('Icon entfernt');
}

// ═══════════════════════════════════════════
// BOARD IMAGES
// ═══════════════════════════════════════════
function openBoardImagesModal(){
  if(!editMode)return;
  const imgs=effectiveBoardImages();
  document.getElementById('boardimg-board').value=imgs.board||'';
  document.getElementById('boardimg-marker').value=imgs.marker||'';
  document.getElementById('boardimg-mo').classList.add('open');
  setTimeout(()=>document.getElementById('boardimg-board')?.focus(),60);
}

function saveBoardImages(){
  const board=document.getElementById('boardimg-board').value.trim();
  const marker=document.getElementById('boardimg-marker').value.trim();
  S.boardImages={};
  if(board) S.boardImages.board=board;
  if(marker) S.boardImages.marker=marker;
  applyBoardImages();
  saveD();
  closeLMo('boardimg-mo');
  toast('✓ Tafelbilder gespeichert');
}

function clearBoardImages(){
  S.boardImages={};
  applyBoardImages();
  saveD();
  closeLMo('boardimg-mo');
  toast('Tafelbilder auf Registry/Config zurueckgesetzt');
}

// ═══════════════════════════════════════════
// SLIDERS — persistent
// ═══════════════════════════════════════════
function onDotSl(v){
  S.dotSize=parseInt(v);
  document.getElementById('dot-sl-val').textContent=v;
  pc.style.width=v+'px';pc.style.height=v+'px';
  renderPins();saveD();
}
function onLblSl(v){
  S.lblSize=parseInt(v);
  document.getElementById('lbl-sl-val').textContent=v;
  renderPins();saveD();
}

// ═══════════════════════════════════════════
// RENDER PINS
// ═══════════════════════════════════════════
function renderPins(){
  window.TafelPinBoard?.render();
}

// ═══════════════════════════════════════════
// STAMP MODE
// ═══════════════════════════════════════════
let stampTemplate=null; // the pin being used as template

function openStampPicker(){
  if(!editMode)return;
  if(!canEditPins()){toast('Kopieren und Stempeln ist nur in der Pins-Ansicht moeglich');return;}
  document.getElementById('stamp-search').value='';
  renderStampList('');
  document.getElementById('stamp-mo').classList.add('open');
}

function renderStampList(q){
  const list=document.getElementById('stamp-list');
  const query=(q||'').toLowerCase();
  const pins=S.pins.filter(p=>!query||p.title.toLowerCase().includes(query));
  if(!pins.length){list.innerHTML='<div style="font-family:\'EB Garamond\',serif;font-size:var(--fs-sm);color:#5a3a08;font-style:italic;padding:.5rem;">Keine Marker gefunden.</div>';return;}
  list.innerHTML=pins.map(p=>{
    const cat=catOf(p);
    return`<div class="stamp-item" data-action="start-stamp" data-pin-id="${p.id}">
      <span class="stamp-dot" style="background:${cat.color}"></span>
      <span class="stamp-name">${esc(p.title)}</span>
      <span class="stamp-cat">${esc(cat.label)}</span>
    </div>`;
  }).join('');
}

function startStamp(sourceId){
  if(!canEditPins()){toast('Pins koennen nur in der Pins-Ansicht gestempelt werden');return;}
  const src=S.pins.find(x=>x.id===sourceId);if(!src)return;
  stampTemplate=src;
  closeLMo('stamp-mo');
  mapWrap.style.cursor='none';
  const sc=document.getElementById('stamp-cursor');
  sc.style.display='block';
  const btn=document.getElementById('btn-stamp');
  btn.textContent='🔖 Stempel: '+src.title+' — ESC zum Beenden';
  btn.classList.add('stamp-active');
  hint('Klicken = Kopie setzen  ·  ESC = Stempel beenden');
}

function stopStamp(){
  stampTemplate=null;
  mapWrap.style.cursor='grab';
  document.getElementById('stamp-cursor').style.display='none';
  const btn=document.getElementById('btn-stamp');
  btn.textContent='🔖 Kopieren & stempeln';
  btn.classList.remove('stamp-active');
  hint('');
}

// ═══════════════════════════════════════════
// ÜBERSCHREIB-MODUS
// ═══════════════════════════════════════════
let owTemplate=null; // {table, cat, region, house, img, text, title} — from template or pin
let owFields={};

function openOverwritePicker(){
  if(!canEditPins()){toast('Ueberschreiben ist nur in der Pins-Ansicht moeglich');return;}
  owSwitchTab('tpl');
  document.getElementById('overwrite-mo').classList.add('open');
}

function owSwitchTab(tab){
  document.getElementById('owtab-tpl').classList.toggle('on', tab==='tpl');
  document.getElementById('owtab-pins').classList.toggle('on', tab==='pins');
  document.getElementById('ow-tpl-list').style.display = tab==='tpl'?'block':'none';
  document.getElementById('ow-pins-wrap').style.display = tab==='pins'?'block':'none';
  if(tab==='tpl') renderOwTplList();
  if(tab==='pins'){ document.getElementById('ow-search').value=''; renderOverwritePinList(''); }
}

function renderOwTplList(){
  const el=document.getElementById('ow-tpl-list');
  el.innerHTML=PIN_TEMPLATES.map(t=>{
    // Find any cat whose label matches the template label
    const suggestCat=S.cats.find(c=>c.label.toLowerCase().includes(t.label.toLowerCase().split('/')[0].trim())||t.label.toLowerCase().includes(c.label.toLowerCase()));
    const markerUrl=suggestCat?.marker||'';
    return`
    <div class="ow-tpl-card" data-action="start-overwrite-template" data-template-id="${t.id}">
      ${markerUrl?`<img src="${esc(markerUrl)}" style="width:36px;height:44px;object-fit:contain;flex-shrink:0;" onerror="this.style.display='none'"/>`:
        `<span class="ow-tpl-icon">${t.icon}</span>`}
      <div class="ow-tpl-info">
        <div class="ow-tpl-label">${esc(t.label)}</div>
        <div class="ow-tpl-desc">${esc(t.desc)}</div>
        <div class="ow-tpl-fields">${t.table.map(r=>esc(r.k)).filter(Boolean).join(' · ')}</div>
      </div>
      ${suggestCat?`<span style="font-family:'Cinzel',serif;font-size:.65rem;color:#5a3a08;flex-shrink:0;">${esc(suggestCat.label)}</span>`:''}
    </div>`;
  }).join('');
}

function startOverwriteFromTemplate(tplId){
  if(!canEditPins()){toast('Pins koennen nur in der Pins-Ansicht ueberschrieben werden');return;}
  const tpl=PIN_TEMPLATES.find(t=>t.id===tplId); if(!tpl)return;
  // Build a pseudo-pin from the template
  owTemplate={
    title: tpl.label,
    table: tpl.table.map(r=>({...r})),
    cat: null, region:'', house:'', img:'', text:''
  };
  _activateOverwriteMode(tpl.icon+' '+tpl.label);
}

function renderOverwritePinList(q){
  q=(q||'').toLowerCase();
  const list=document.getElementById('ow-list');
  const pins=S.pins.filter(p=>!q||p.title.toLowerCase().includes(q));
  if(!pins.length){list.innerHTML=`<div style="padding:1rem;text-align:center;font-family:'EB Garamond',serif;color:#5a3a08;">Keine Pins gefunden.</div>`;return;}
  list.innerHTML=pins.map(p=>{
    const cat=S.cats.find(c=>c.id===p.cat)||{color:'#888',label:'?'};
    return`<div class="stamp-item" data-action="start-overwrite-pin" data-pin-id="${p.id}">
      <span class="stamp-dot" style="background:${cat.color}"></span>
      <div style="flex:1;min-width:0;">
        <span class="stamp-name">${esc(p.title)}</span>
        <span class="stamp-cat"> · ${esc(cat.label)}</span>
      </div>
    </div>`;
  }).join('');
}

function startOverwriteFromPin(sourceId){
  if(!canEditPins()){toast('Pins koennen nur in der Pins-Ansicht ueberschrieben werden');return;}
  const src=S.pins.find(x=>x.id===sourceId); if(!src)return;
  owTemplate=src;
  _activateOverwriteMode(src.title);
}

function _activateOverwriteMode(label){
  if(!canEditPins())return;
  owFields={
    table: document.getElementById('owf-table')?.checked,
    cat:   document.getElementById('owf-cat')?.checked,
    region:document.getElementById('owf-region')?.checked,
    house: document.getElementById('owf-house')?.checked,
    img:   document.getElementById('owf-img')?.checked,
    text:  document.getElementById('owf-text')?.checked,
  };
  closeLMo('overwrite-mo');
  mapWrap.style.cursor='crosshair';
  const btn=document.getElementById('btn-overwrite');
  btn.textContent='✏️ '+label+' — ESC zum Beenden';
  btn.classList.add('overwrite-active');
  document.querySelectorAll('.pin-dot').forEach(el=>el.classList.add('pin-ow-target'));
  hint('Pin anklicken = Felder überschreiben  ·  ESC = Beenden');
}

// legacy alias still used by old HTML if any
function startOverwrite(sourceId){ startOverwriteFromPin(sourceId); }
function renderOverwriteList(q){ renderOverwritePinList(q); }

function stopOverwrite(){
  owTemplate=null;
  mapWrap.style.cursor='grab';
  document.getElementById('btn-overwrite').textContent='✏️ Überschreiben';
  document.getElementById('btn-overwrite').classList.remove('overwrite-active');
  document.querySelectorAll('.pin-ow-target').forEach(el=>el.classList.remove('pin-ow-target'));
  hint('');
}

function applyOverwrite(targetId){
  if(!canEditPins()){stopOverwrite();return;}
  if(!owTemplate) return;
  const target=S.pins.find(p=>p.id===targetId); if(!target)return;
  const src=owTemplate;
  if(owFields.table) target.table=JSON.parse(JSON.stringify(src.table||[]));
  if(owFields.cat && src.cat)   target.cat=src.cat;
  if(owFields.region)target.region=src.region||'';
  if(owFields.house) target.house=src.house||'';
  if(owFields.img && src.img){
    target.img=src.img;
    target.imgLink=src.imgLink||'';
    target.crest=src.crest||target.crest||'';
    target.crestLink=src.crestLink||'';
    target.banner=src.banner||target.banner||'';
    target.bannerLink=src.bannerLink||'';
  }
  if(owFields.text && src.text) target.text=src.text;
  saveD(); renderPins();
  // re-add highlight class after re-render
  document.querySelectorAll('.pin-dot').forEach(el=>el.classList.add('pin-ow-target'));
  toast('✏️ "'+target.title+'" überschrieben');
}

function placeStamp(mx,my){
  if(!canEditPins()){stopStamp();return;}
  if(!stampTemplate)return;
  const src=stampTemplate;
  const p={
    id:uid(),
    x:mx/imgW, y:my/imgH,
    title:src.title,
    cat:src.cat,
    img:src.img||'',
    imgLink:src.imgLink||'',
    crest:src.crest||'',
    crestLink:src.crestLink||'',
    banner:src.banner||'',
    bannerLink:src.bannerLink||'',
    region:src.region||'',
    house:src.house||'',
    faction:src.faction||'',
    pinMarker:src.pinMarker||'',
    table:JSON.parse(JSON.stringify(src.table||[])),
    text:src.text||'',
    secret:src.secret||false
  };
  S.pins.push(p);renderPins();saveD();
  toast('📍 Kopie von "'+src.title+'" gesetzt');
}

document.getElementById('stamp-mo').addEventListener('click',e=>{if(e.target===document.getElementById('stamp-mo'))closeLMo('stamp-mo');});

// ═══════════════════════════════════════════
// ORT-VORLAGEN (für Ortsmarker / Minimap-Pins)
// ═══════════════════════════════════════════
const PIN_TEMPLATES = [
  {
    id:'siedlung', icon:'🏘', label:'Siedlung / Ort', desc:'Stadt, Dorf, Weiler…',
    table:[{k:'Typ',v:''},{k:'Gewerbe',v:''},{k:'Führung',v:''},{k:'Bevölkerung',v:''},{k:'Bekannte Familien',v:''},{k:'Gefahren',v:''},{k:'Ressourcen',v:''}]
  },
  {
    id:'gebaeude', icon:'🏰', label:'Einzelnes Gebäude', desc:'Taverne, Turm, Tempel…',
    table:[{k:'Typ',v:''},{k:'Besitzer',v:''},{k:'Zustand',v:''},{k:'Bekannte Bewohner',v:''},{k:'Gerüchte',v:''}]
  },
  {
    id:'natur', icon:'🌿', label:'Naturgebiet / POI', desc:'Wald, Berg, Höhle…',
    table:[{k:'Typ',v:''},{k:'Gefahren',v:''},{k:'Ressourcen',v:''},{k:'Legenden',v:''}]
  },
  {
    id:'ruine', icon:'🏚', label:'Ruine', desc:'Verfallene Burg, altes Heiligtum…',
    table:[{k:'Ursprung',v:''},{k:'Zustand',v:''},{k:'Bewohner',v:''},{k:'Gefahren',v:''},{k:'Gerüchte',v:''}]
  },
  {
    id:'monsterhort', icon:'🐉', label:'Monsterhort', desc:'Lager, Nest, Revier…',
    table:[{k:'Kreatur(en)',v:''},{k:'Anzahl',v:''},{k:'Gefährlichkeit',v:''},{k:'Beute',v:''}]
  },
  {
    id:'dungeon', icon:'⚔️', label:'Dungeon', desc:'Verlies, Katakomben…',
    table:[{k:'Typ',v:''},{k:'Ebenen',v:''},{k:'Hauptgegner',v:''},{k:'Schätze',v:''}]
  }
];

let _tplPendingPin=null, _tplSelected=null, _ortTplSelected=null;
let addingZettel=false, addingOrt=false;
let _suppressMapClick=false;
let _zettelPendingPos=null;

// ─── ORT setzen ───────────────────────────────
function startAddOrt(){
  if(!editMode)return;
  if(!canEditPins()){toast('Pins koennen nur in der Pins-Ansicht bearbeitet werden');return;}
  addingOrt=true; addingZettel=false; addingPin=false;
  mapWrap.style.cursor='none';
  pc.style.display='block';
  hint('📍 Klicken = Ort setzen  ·  ESC = Abbrechen');
}
function startAdd(){ startAddOrt(); } // legacy alias

function openTplPicker(p){
  _tplPendingPin=p; _ortTplSelected=null;
  const grid=document.getElementById('tpl-grid');
  grid.innerHTML=PIN_TEMPLATES.map(t=>`
    <div class="tpl-card" id="tplc-${t.id}" data-action="select-pin-template" data-template-id="${t.id}">
      <span class="tpl-icon">${t.icon}</span>
      <span class="tpl-label">${t.label}</span>
      <span class="tpl-desc">${t.desc}</span>
    </div>`).join('');
  document.getElementById('tpl-apply-btn').disabled=true;
  document.getElementById('pin-tpl-mo').classList.add('open');
}
function selectTpl(id){
  _ortTplSelected=id;
  document.querySelectorAll('#pin-tpl-mo .tpl-card').forEach(c=>c.classList.remove('on'));
  document.getElementById('tplc-'+id)?.classList.add('on');
  document.getElementById('tpl-apply-btn').disabled=false;
}
function tplApply(){
  if(!canEditPins()){toast('Pins koennen nur in der Pins-Ansicht bearbeitet werden');return;}
  if(!_tplPendingPin||!_ortTplSelected)return;
  const tpl=PIN_TEMPLATES.find(t=>t.id===_ortTplSelected);
  if(tpl) _tplPendingPin.table=tpl.table.map(r=>({...r}));
  closeLMo('pin-tpl-mo');
  S.pins.push(_tplPendingPin);
  renderPins();saveD();
  openSidebar(_tplPendingPin.id,'edit');
  toast('Ort gesetzt — Eintrag ausfüllen');
  _tplPendingPin=null;_ortTplSelected=null;
}

function cancelAdd(){
  _tplPendingPin=null;_tplSelected=null;_ortTplSelected=null;
  addingPin=false;addingOrt=false;addingZettel=false;
  mapWrap.style.cursor='grab';pc.style.display='none';
  const sc=document.getElementById('stamp-cursor');if(sc)sc.style.display='none';
  hint('');
}

function placePin(mx,my){
  if(!canEditPins()){cancelAdd();toast('Pins koennen nur in der Pins-Ansicht gesetzt werden');return;}
  addingOrt=false; addingPin=false;
  mapWrap.style.cursor='grab';pc.style.display='none';hint('');
  const p={id:uid(),x:mx/imgW,y:my/imgH,title:'Neuer Ort',cat:S.cats[0]?.id||'other',img:'',imgLink:'',crest:'',crestLink:'',banner:'',bannerLink:'',region:'',house:'',faction:'',table:[],text:'',secret:false};
  openTplPicker(p);
}

// ─── ZETTEL setzen ────────────────────────────
function startAddZettel(){
  if(!editMode)return;
  if(!canEditZettel()){toast('Zettel koennen nur in der Tafel-Ansicht bearbeitet werden');return;}
  addingZettel=true; addingOrt=false; addingPin=false;
  mapWrap.style.cursor='none';
  pc.style.display='block';
  hint('📜 Klicken = Zettel platzieren  ·  ESC = Abbrechen');
}

function openZettelTypePicker(pos){
  _zettelPendingPos=pos; _tplSelected=null;
  const grid=document.getElementById('zettel-type-grid');
  grid.innerHTML=TafelZettelConfig.renderTypeCards(esc);
  document.getElementById('zettel-tpl-apply-btn').disabled=true;
  document.getElementById('zettel-tpl-mo').classList.add('open');
}
function selectZettelType(id){
  _tplSelected=id;
  document.querySelectorAll('#zettel-tpl-mo .tpl-card').forEach(c=>c.classList.remove('on'));
  document.getElementById('ztplc-'+id)?.classList.add('on');
  document.getElementById('zettel-tpl-apply-btn').disabled=false;
}
function zettelTplApply(){
  if(!canEditZettel()){toast('Zettel koennen nur in der Tafel-Ansicht bearbeitet werden');return;}
  if(!_zettelPendingPos||!_tplSelected)return;
  const z=TafelZettelConfig.createDraft(_tplSelected, _zettelPendingPos, uid);
  closeLMo('zettel-tpl-mo');
  S.zettel.push(z);
  renderZettel();saveD();
  window.openZettelSidebar(z.id,'edit');
  toast('Zettel gesetzt — Eintrag ausfüllen');
  _zettelPendingPos=null; _tplSelected=null;
}

function placeZettel(mx,my){
  if(!canEditZettel()){cancelAdd();toast('Zettel koennen nur in der Tafel-Ansicht gesetzt werden');return;}
  addingZettel=false;
  mapWrap.style.cursor='grab';pc.style.display='none';hint('');
  openZettelTypePicker({x:mx/imgW, y:my/imgH});
}

// ═══════════════════════════════════════════
// MAP INTERACTION
// ═══════════════════════════════════════════
mapWrap.addEventListener('mousedown',e=>{
  if(e.button===1||e.button===2){panning=true;panLast={x:e.clientX,y:e.clientY};e.preventDefault();return;}
  if(e.button!==0||(addingPin||addingOrt||addingZettel)||stampTemplate)return;
  // don't start pan if clicking on a waypoint marker
  const _mpr=mapWrap.getBoundingClientRect();
  const _mp=lsbTmxy(e.clientX-_mpr.left,e.clientY-_mpr.top);
  if(lsbMode==='pan'&&lsbHitWp(_mp.x,_mp.y))return;
  panning=true;panLast={x:e.clientX,y:e.clientY};
});
mapWrap.addEventListener('mousemove',e=>{
  if(addingPin||addingOrt||addingZettel){pc.style.left=e.clientX+'px';pc.style.top=e.clientY+'px';}
  if(stampTemplate){
    const sc=document.getElementById('stamp-cursor');
    sc.style.left=e.clientX+'px';sc.style.top=e.clientY+'px';
  }
  if(panning){vx+=e.clientX-panLast.x;vy+=e.clientY-panLast.y;panLast={x:e.clientX,y:e.clientY};applyT();}
});
mapWrap.addEventListener('mouseup',()=>{
  panning=false;
  if(!addingPin&&!addingOrt&&!addingZettel)mapWrap.style.cursor='grab';
});
mapWrap.addEventListener('mouseleave',()=>{if(addingPin||addingOrt||addingZettel){pc.style.display='none';}window.TafelPinBoard?.hideTooltip();});
mapWrap.addEventListener('mouseenter',()=>{if(addingPin||addingOrt||addingZettel){pc.style.display='block';}});
mapWrap.addEventListener('click',e=>{
  if(_suppressMapClick){_suppressMapClick=false;return;}
  const r=mapWrap.getBoundingClientRect();
  const mx=(e.clientX-r.left-vx)/vz, my=(e.clientY-r.top-vy)/vz;
  if(stampTemplate){placeStamp(mx,my);return;}
  if((addingOrt||addingPin)&&canEditPins()){placePin(mx,my);}
  else if(addingZettel&&canEditZettel()){placeZettel(mx,my);}
});
mapWrap.addEventListener('contextmenu',e=>e.preventDefault());
mapWrap.addEventListener('wheel',e=>{
  window.TafelBoardViewport.zoomWheel(e);
},{passive:false});
// Touch
let td=0;
mapWrap.addEventListener('touchstart',e=>{if(e.touches.length===2)td=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(e.touches.length===1){panning=true;panLast={x:e.touches[0].clientX,y:e.touches[0].clientY};}},{passive:true});
mapWrap.addEventListener('touchmove',e=>{
  if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);const f=d/td;const cx=(e.touches[0].clientX+e.touches[1].clientX)/2,cy=(e.touches[0].clientY+e.touches[1].clientY)/2;const r=mapWrap.getBoundingClientRect();const sx=cx-r.left,sy=cy-r.top;vz=Math.max(.05,Math.min(vz*f,15));vx=sx-(sx-vx)*f;vy=sy-(sy-vy)*f;applyT();td=d;}
  else if(panning){vx+=e.touches[0].clientX-panLast.x;vy+=e.touches[0].clientY-panLast.y;panLast={x:e.touches[0].clientX,y:e.touches[0].clientY};applyT();}
},{passive:true});
mapWrap.addEventListener('touchend',()=>panning=false,{passive:true});

// ═══════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════
function onSearch(v){
  const sc=document.getElementById('search-clear'),sr=document.getElementById('search-results');
  sc.style.display=v?'block':'none';
  if(!v){sr.style.display='none';return;}
  const q=v.toLowerCase();
  const mp=S.pins.filter(p=>(!p.secret||editMode)&&p.title.toLowerCase().includes(q));
  const mz=(S.zettel||[]).filter(z=>(!z.secret||editMode)&&(z.title||'').toLowerCase().includes(q));
  const m=[...mp.map(p=>({...p,_src:'pin'})),...mz.map(z=>({...z,_src:'zettel'}))];
  if(!m.length){sr.style.display='none';return;}
  sr.innerHTML=m.map(p=>{const cc=p._src==='pin'?catOf(p):{color:'#1a1200'};return`<div class="sr-item" data-mousedown-action="jump-to-result" data-entry-id="${p.id}"><span class="sr-dot" style="background:${cc.color}"></span>${p._src==='zettel'?'📜 ':''}${esc(p.title)}</div>`;}).join('');
  sr.style.display='block';
}
function hideSearch(){document.getElementById('search-results').style.display='none';}
function clearSearch(){document.getElementById('search-inp').value='';document.getElementById('search-clear').style.display='none';hideSearch();}
function jumpTo(id){
  clearSearch();
  const p=S.pins.find(x=>x.id===id);if(!p||!imgW)return;
  const ww=mapWrap.clientWidth,wh=mapWrap.clientHeight;
  vx=ww/2-p.x*imgW*vz;vy=wh/2-p.y*imgH*vz;applyT();
  // check if it's a zettel or a pin
  const isZettel=S.zettel&&S.zettel.some(z=>z.id===id);
  setLayer(isZettel?'normal':'pins');
  const el=pl.querySelector(`[data-id="${id}"]`)||document.getElementById('zettel-layer')?.querySelector(`[data-id="${id}"]`);
  if(el){el.style.transition='none';el.style.transform='translate(-50%,-50%) scale(2)';setTimeout(()=>{el.style.transition='';el.style.transform='';},300);}
  setTimeout(()=>openSidebar(id,'view'),350);}

// ═══════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════════
// ZETTEL RENDER & SIDEBAR
// ═══════════════════════════════════════════════════════════════════
function renderZettel(){
  window.TafelZettelBoard?.render();
}

// ─── Zettel Scroll Views ────────────────────────────────────
function openZettelScroll(id){
  const z=S.zettel.find(x=>x.id===id);if(!z)return;
  const sc=document.getElementById('scroll-content');
  const sa=document.getElementById('scroll-actions');
  if(z.typ==='quest')sc.innerHTML=TafelZettelViews.renderQuest(z);
  else if(z.typ==='steckbrief'){
    if(!z.personen||!z.personen.length) z.personen=[{portrait:z.portrait||'',title:z.title||'',untertitel:z.untertitel||'',text:z.text||'',table:(z.table||[]).map(r=>({...r}))}];
    sc.innerHTML=TafelZettelViews.renderSteckbrief(z);
  }
  else if(z.typ==='zeitung')sc.innerHTML=TafelZettelViews.renderZeitung(z);
  else if(z.typ==='vermisst')sc.innerHTML=TafelZettelViews.renderVermisst(z);
  else sc.innerHTML=TafelZettelViews.renderGeneric(z);
  sa.innerHTML=canEditZettel()?
    `<button class="s-btn s-edit" data-action="zettel-open-edit" data-zettel-id="${id}">✎ Bearbeiten</button>
    <button class="s-btn s-cancel" data-action="close-scroll">Schließen</button>`
    :`<button class="s-btn s-cancel" data-action="close-scroll">Schließen</button>`;
  const _zw=z.cardWidth||S.cardWidth||1100;
  document.getElementById('scroll-card').style.width='min('+_zw+'px,calc(100vw - 32px))';
  document.getElementById('scroll-mo').classList.add('open');
}

// ═══════════════════════════════════════════
let sidebarPinId=null;
const EDITOR_SPLIT_KEY='tafel-editor-split-width';

function clampEditorWidth(value){
  const max=Math.max(520,window.innerWidth-460);
  return Math.max(460,Math.min(max,Number(value)||660));
}

function applyEditorSplitWidth(value){
  const width=clampEditorWidth(value);
  document.getElementById('sidebar')?.style.setProperty('--editor-col-width',width+'px');
  return width;
}

function restoreEditorSplitWidth(){
  applyEditorSplitWidth(localStorage.getItem(EDITOR_SPLIT_KEY)||660);
}

function startEditorResize(event){
  if(!document.getElementById('sidebar')?.classList.contains('editor-fullscreen'))return;
  event.preventDefault();
  const move=moveEvent=>{
    const width=applyEditorSplitWidth(moveEvent.clientX);
    localStorage.setItem(EDITOR_SPLIT_KEY,String(width));
  };
  const up=()=>{
    document.body.classList.remove('editor-resizing');
    window.removeEventListener('pointermove',move);
    window.removeEventListener('pointerup',up);
  };
  document.body.classList.add('editor-resizing');
  window.addEventListener('pointermove',move);
  window.addEventListener('pointerup',up,{once:true});
}

function bindEditorResizer(){
  const resizer=document.getElementById('sb-resizer');
  if(!resizer||resizer.dataset.bound==='true')return;
  resizer.dataset.bound='true';
  resizer.addEventListener('pointerdown',startEditorResize);
}

function resetSidebarFrame(){
  const sidebar=document.getElementById('sidebar');
  if(!sidebar)return;
  sidebar.innerHTML=`
    <div id="sb-header">
      <span id="sb-title">Ort</span>
      <span id="sb-mode-lbl">Ansicht</span>
      <button id="sb-close" data-action="close-sidebar">x</button>
    </div>
    <div id="sb-main">
      <div id="sb-editor-col">
        <div id="sb-body"></div>
        <div id="sb-footer"></div>
      </div>
      <div id="sb-resizer" role="separator" aria-label="Editorbreite anpassen" title="Editorbreite anpassen"></div>
      <div id="sb-preview">
        <div id="sb-preview-head">Live-Vorschau</div>
        <div id="sb-preview-content"></div>
      </div>
    </div>`;
}

function ensureEditorShellStructure(){
  const sidebar=document.getElementById('sidebar');
  if(!sidebar||document.getElementById('sb-main'))return;
  const body=document.getElementById('sb-body');
  const footer=document.getElementById('sb-footer');
  if(!body||!footer)return;
  const main=document.createElement('div');
  main.id='sb-main';
  const editorCol=document.createElement('div');
  editorCol.id='sb-editor-col';
  const preview=document.createElement('div');
  preview.id='sb-preview';
  preview.innerHTML='<div id="sb-preview-head">Live-Vorschau</div><div id="sb-preview-content"></div>';
  const resizer=document.createElement('div');
  resizer.id='sb-resizer';
  resizer.setAttribute('role','separator');
  resizer.setAttribute('aria-label','Editorbreite anpassen');
  resizer.title='Editorbreite anpassen';
  editorCol.appendChild(body);
  editorCol.appendChild(footer);
  main.appendChild(editorCol);
  main.appendChild(resizer);
  main.appendChild(preview);
  sidebar.appendChild(main);
  bindEditorResizer();
}

function openEditorShell(kind,id){
  ensureEditorShellStructure();
  bindEditorResizer();
  const sidebar=document.getElementById('sidebar');
  restoreEditorSplitWidth();
  sidebar.classList.add('editor-fullscreen');
  sidebar.dataset.editorKind=kind;
  sidebar.dataset.editorId=id;
  renderEditorPreview();
}

function renderEditorPreview(){
  const sidebar=document.getElementById('sidebar');
  const content=document.getElementById('sb-preview-content');
  if(!sidebar||!content||!sidebar.classList.contains('editor-fullscreen'))return;
  const kind=sidebar.dataset.editorKind;
  const id=sidebar.dataset.editorId;
  if(kind==='zettel'){
    const z=S.zettel.find(x=>x.id===id);
    if(!z){content.innerHTML='<div class="editor-preview-empty">Kein Zettel gewaehlt.</div>';return;}
    let html='';
    if(z.typ==='quest')html=TafelZettelViews.renderQuest(z);
    else if(z.typ==='steckbrief'){
      if(!z.personen||!z.personen.length) z.personen=[{portrait:z.portrait||'',title:z.title||'',untertitel:z.untertitel||'',text:z.text||'',table:(z.table||[]).map(r=>({...r}))}];
      html=TafelZettelViews.renderSteckbrief(z);
    }
    else if(z.typ==='zeitung')html=TafelZettelViews.renderZeitung(z);
    else if(z.typ==='vermisst')html=TafelZettelViews.renderVermisst(z);
    else html=TafelZettelViews.renderGeneric(z);
    content.innerHTML=`<div class="editor-preview-card">${html}</div>`;
    return;
  }
  if(kind==='pin'){
    const pin=S.pins.find(x=>x.id===id);
    if(!pin){content.innerHTML='<div class="editor-preview-empty">Kein Pin gewaehlt.</div>';return;}
    const cat=catOf(pin);
    const rows=(pin.table||[]).filter(row=>row.k||row.v);
    content.innerHTML=`
      <div class="editor-preview-card">
        <div class="sv-header">
          <div class="sv-crest-wrap">
            <div class="sv-crest">${pin.crest?mediaLink(`<img src="${esc(pin.crest)}" onerror="this.parentElement.innerHTML='🏰'"/>`, pin.crestLink):'<span style="opacity:.3;font-size:2rem">🏰</span>'}</div>
          </div>
          <div class="sv-header-col">
            <div class="sv-title">${esc(pin.title||'Unbekannter Ort')}</div>
            <div class="sv-subtitle-row">
              <span class="sv-cat-badge" style="color:${cat.color};border-color:${cat.color}88;background:rgba(180,140,50,.15);">${esc(cat.label)}</span>
              ${pin.secret?'<span class="sv-secret-badge">Geheim</span>':''}
            </div>
            <div class="sv-affils">
              ${pin.region?`<span class="sv-affil"><span class="sv-affil-lbl">Region</span> ${esc(pin.region)}</span>`:''}
              ${pin.house?`<span class="sv-affil"><span class="sv-affil-lbl">Herrschaft</span> ${esc(pin.house)}</span>`:''}
              ${pin.faction?`<span class="sv-affil"><span class="sv-affil-lbl">Fraktion</span> ${esc(pin.faction)}</span>`:''}
            </div>
          </div>
          ${pin.banner?`<div class="sv-banner">${mediaLink(`<img src="${esc(pin.banner)}" onerror="this.parentElement.style.display='none'"/>`, pin.bannerLink)}</div>`:''}
        </div>
        ${(pin.img||rows.length)?`<div class="sv-body">
          <div class="sv-img-wrap"><div class="sv-img">${pin.img?mediaLink(`<img src="${esc(pin.img)}" onerror="this.style.display='none';this.nextSibling.style.display='flex'"/><div class="sv-img-ph" style="display:none">Bild</div>`, pin.imgLink):'<div class="sv-img-ph">Bild</div>'}</div></div>
          <div class="sv-col">${rows.length?`<table class="sv-table">${rows.map(row=>`<tr><td>${esc(row.k)}</td><td>${esc(row.v)}</td></tr>`).join('')}</table>`:''}</div>
        </div>`:''}
        ${pin.text?`<div class="sv-lore"><div class="sv-text">${window.TafelPinScrollView.fmtText(pin.text)}</div></div>`:''}
      </div>`;
    return;
  }
  content.innerHTML='<div class="editor-preview-empty">Keine Vorschau verfuegbar.</div>';
}

function openSidebar(id, mode){
  const p=S.pins.find(x=>x.id===id);if(!p)return;
  if(mode==='edit'){
    if(!canEditPins()){toast('Pins koennen nur in der Pins-Ansicht bearbeitet werden');return;}
    // Sidebar for editing
    sidebarPinId=id;
    window.TafelPinEditor.open(id);
  } else {
    // Pergament scroll modal for viewing
    window.TafelPinScrollView.render(p);
    const _scVw=document.getElementById('scroll-card');
    if(_scVw) _scVw.style.width='min('+(p.cardWidth||S.cardWidth||1100)+'px,calc(100vw - 32px))';
    document.getElementById('scroll-mo').classList.add('open');
  }
}
function closeSidebar(){
  const sidebar=document.getElementById('sidebar');
  sidebar.classList.remove('open','editor-fullscreen');
  delete sidebar.dataset.editorKind;
  delete sidebar.dataset.editorId;
  sidebarPinId=null;
  window.TafelPinEditor?.clearActive();
  window.TafelZettelEditor?.clearActive();
  resetSidebarFrame();
}
// ═══════════════════════════════════════════
// CARD WIDTH
// ═══════════════════════════════════════════
function setPinCardWidth(id, val){
  val=Math.max(500,Math.min(1600,+val));
  const p=S.pins.find(x=>x.id===id);
  if(p) p.cardWidth=val;
  const vl=document.getElementById('card-w-val');
  if(vl) vl.textContent=val+'px';
  // Set width directly on the open scroll-card, not globally
  const sc=document.getElementById('scroll-card');
  if(sc) sc.style.width='min('+val+'px,calc(100vw - 32px))';
  saveD();
}
function setZettelCardWidth(id, val){
  val=Math.max(500,Math.min(1600,+val));
  const z=S.zettel.find(x=>x.id===id);
  if(z) z.cardWidth=val;
  const vl=document.getElementById('card-w-val-z');
  if(vl) vl.textContent=val+'px';
  // Set width directly on the open scroll-card, not globally
  const sc=document.getElementById('scroll-card');
  if(sc) sc.style.width='min('+val+'px,calc(100vw - 32px))';
  saveD();
}

function closeScroll(){
  document.getElementById('scroll-mo').classList.remove('open');
}

function toggleCatBar(){
  const bar=document.getElementById('cat-bar');
  const btn=document.getElementById('cat-bar-toggle');
  const collapsed=bar.classList.toggle('collapsed');
  btn.textContent=collapsed ? '▲ Kategorien' : '▼ Kategorien';
  btn.classList.toggle('collapsed', collapsed);
}

// openScroll alias for legacy calls
function openScroll(id,mode){openSidebar(id,mode);}

// ═══════════════════════════════════════════
// TEXT FORMATTING
// ═══════════════════════════════════════════
function askDel(id){
  if(!canEditPins()){toast('Pins koennen nur in der Pins-Ansicht geloescht werden');return;}
  const p=S.pins.find(x=>x.id===id);
  if(!confirm('Pin "'+(p?.title||id)+'" wirklich löschen?'))return;
  S.pins=S.pins.filter(x=>x.id!==id);
  closeScroll();closeSidebar();
  renderPins();saveD();toast('Pin gelöscht');
}

// ═══════════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════════
document.addEventListener('keydown',e=>{
  const inF=['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName);
  if(e.key==='Escape'){
    if(owTemplate){stopOverwrite();return;}
    if(stampTemplate){stopStamp();return;}
    if(addingPin||addingOrt||addingZettel){cancelAdd();return;}
    closeScroll();closeSidebar();closePw();
    document.getElementById('catmgr-mo').classList.remove('open');
    document.getElementById('icon-mo').classList.remove('open');
  }
  if(inF)return;
  if(e.key==='e'&&editMode)startAdd();
  if(e.key==='f')fitView();
  if(e.key==='1')setLayer('normal');
  if(e.key==='2')setLayer('pins');
  if(e.key==='+'||e.key==='='){const c=mapWrap.clientWidth/2,d=mapWrap.clientHeight/2;vz=Math.min(vz*1.12,15);vx=c-(c-vx)*1.12;vy=d-(d-vy)*1.12;applyT();}
  if(e.key==='-'){const c=mapWrap.clientWidth/2,d=mapWrap.clientHeight/2;vz=Math.max(vz*.89,.05);vx=c-(c-vx)*.89;vy=d-(d-vy)*.89;applyT();}
});
document.getElementById('scroll-mo').addEventListener('click',e=>{if(e.target===document.getElementById('scroll-mo'))closeScroll();});
document.getElementById('catmgr-mo').addEventListener('click',e=>{if(e.target===document.getElementById('catmgr-mo'))closeCatMgr();});
document.getElementById('icon-mo').addEventListener('click',e=>{if(e.target===document.getElementById('icon-mo'))closeIconModal();});
document.getElementById('pw-mo').addEventListener('click',e=>{if(e.target===document.getElementById('pw-mo'))closePw();});

// ═══════════════════════════════════════════
// LEFT SIDEBAR — WERKZEUGE
// ═══════════════════════════════════════════
const {
  TRAVEL_MODES: LSB_TM,
  ICONS: LSB_ICONS,
  COLORS: LSB_COLORS,
  EVENT_TYPES: LSB_EV_TYPES,
  EVENT_INFO: LSB_EV_INFO,
  CUSTOM_SLOTS,
  getTravelMode: lsbGetTm
} = window.TafelLsbConfig;

// State
let lsbS={groups:[],calScale:null,iconSize:22};
let lsbIconSize=22;
let lsbCalPts=[],lsbMeaPts=[];
let lsbMode='pan';
let lsbSelGid=null,lsbRouteDrawing=false,lsbLiveMouse=null;
let lsbDragGid=null,lsbDragWpIdx=-1,lsbDragMoved=false,lsbDragReady=false,lsbHoldTimer=null,lsbDragPulse=false;
let lGrpEditId=null,lWpGid=null,lWpIdx=-1,lWpEvtType='none';
let lGrpPCol=LSB_COLORS[0],lGrpPIcon=LSB_ICONS[0],lGrpOpacity=80,lGrpIconIsImg=false;

// Canvas — initialized in init()
var mCv=null,mCtx=null; // var avoids TDZ errors from early lsbDraw calls

function toggleLsb(){
  const open=document.getElementById('lsb').classList.toggle('lopen');
  document.getElementById('lsb-toggle').classList.toggle('lopen',open);
  document.getElementById('lsb-toggle').textContent=open?'◀':'⚖';
}
function closeLMo(id){document.getElementById(id).classList.remove('open');}
function lsbSave(){S.lsb=lsbS;saveD();}
function lsbLoad(remote){
  if(remote&&remote.lsb){lsbS=remote.lsb;lsbS.groups=lsbS.groups||[];lsbIconSize=lsbS.iconSize||22;lsbS.customIcons=lsbS.customIcons||[];}
  const sl=document.getElementById('lsb-icon-size');
  if(sl){sl.value=lsbIconSize;document.getElementById('lsb-icon-size-val').textContent=lsbIconSize;}
  lsbPreloadIcons();lsbUpdCalUI();lsbRenderGroups();lsbUpdResult();
  // No lsbDraw() call needed — permanent RAF loop handles canvas sync
}
function lsbFmtH(h){
  if(h<=0)return'0 Min.';if(h<0.017)return'wenige Min.';
  if(h<1)return Math.round(h*60)+' Min.';
  const days=Math.floor(h/10),rem=h%10,hh=Math.floor(rem),mm=Math.round((rem-hh)*60);
  let s='';if(days)s+=days+'T ';if(hh)s+=hh+'h ';if(mm)s+=mm+'min';return s.trim();
}
function lsbSetIconSize(v){lsbIconSize=+v;lsbS.iconSize=+v;document.getElementById('lsb-icon-size-val').textContent=v;lsbSave();}
function lsbColorWithOpacity(hex,pct){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${(pct/100).toFixed(2)})`;}

// Calibration
function lsbStartCal(){lsbMode='calib';lsbCalPts=[];lsbUpdCalUI();toast('⚖ 2 Punkte auf der Karte klicken');}
function lsbResetCal(){lsbCalPts=[];lsbS.calScale=null;lsbUpdCalUI();lsbSave();}
function lsbUpdCalUI(){
  const el=document.getElementById('lsb-cal-status'),sl=document.getElementById('lsb-scale-lbl');if(!el)return;
  if(lsbS.calScale){el.textContent='✓ Kalibriert: 1 px = '+lsbS.calScale.toFixed(5)+' km';el.className='ok';sl.textContent='1 km ≈ '+(1/lsbS.calScale).toFixed(1)+' px';}
  else if(lsbMode==='calib'){el.textContent='Setze Punkt '+(lsbCalPts.length+1)+' von 2.';el.className='';sl.textContent='';}
  else{el.textContent='Wähle „Kalibrieren" → 2 Punkte setzen.';el.className='';sl.textContent='';}
}
function lsbFinCal(){
  const dx=lsbCalPts[1].x-lsbCalPts[0].x,dy=lsbCalPts[1].y-lsbCalPts[0].y;
  const px=Math.sqrt(dx*dx+dy*dy),km=parseFloat(document.getElementById('lsb-ckm').value)||10;
  lsbS.calScale=km/px;lsbCalPts=[];lsbMode='pan';lsbUpdCalUI();lsbSave();
  toast('✓ Kalibriert');
}

// Measure
function lsbStartMeasure(){lsbMode='measure';lsbMeaPts=[];document.getElementById('lmb-mea').classList.add('on');toast('📏 Klicken = Messpunkt · Doppelklick = fertig');}
function lsbClearMeasure(){lsbMeaPts=[];lsbMode='pan';document.getElementById('lmb-mea').classList.remove('on');lsbUpdMeaResult();}
function lsbPathKm(pts){return window.TafelLsbCalculations.distance(pts, lsbS.calScale);}
function lsbUpdMeaResult(){
  const el=document.getElementById('lsb-mea-result');if(!el)return;
  if(lsbMeaPts.length<2||!lsbS.calScale){el.textContent='— noch keine Messung —';el.style.opacity='.4';return;}
  el.innerHTML='📏 <strong>'+lsbPathKm(lsbMeaPts).toFixed(2)+'</strong> km';el.style.opacity='1';
}

// Canvas coordinate helpers
function lsbTs(mx,my){return{x:mx*vz+vx,y:my*vz+vy};}
function lsbTmxy(sx,sy){return{x:(sx-vx)/vz,y:(sy-vy)/vz};}

// Draw
function lsbDraw(){
  if(!mCv||!mCtx||!imgW)return;
  mCtx.clearRect(0,0,mCv.width,mCv.height);
  // cal points
  lsbCalPts.forEach((p,i)=>{const s=lsbTs(p.x,p.y);mCtx.save();mCtx.beginPath();mCtx.arc(s.x,s.y,7,0,Math.PI*2);mCtx.fillStyle='rgba(60,200,80,.9)';mCtx.fill();mCtx.strokeStyle='#fff';mCtx.lineWidth=1.5;mCtx.stroke();mCtx.font='bold 9px sans-serif';mCtx.fillStyle='#fff';mCtx.textAlign='center';mCtx.textBaseline='middle';mCtx.fillText(i+1,s.x,s.y);mCtx.restore();});
  // measure line
  if(lsbMeaPts.length>1){mCtx.save();mCtx.strokeStyle='rgba(154,117,32,.9)';mCtx.lineWidth=2;mCtx.setLineDash([6,4]);mCtx.beginPath();lsbMeaPts.forEach((p,i)=>{const s=lsbTs(p.x,p.y);i===0?mCtx.moveTo(s.x,s.y):mCtx.lineTo(s.x,s.y);});mCtx.stroke();mCtx.restore();}
  lsbMeaPts.forEach(p=>{const s=lsbTs(p.x,p.y);mCtx.save();mCtx.beginPath();mCtx.arc(s.x,s.y,5,0,Math.PI*2);mCtx.fillStyle='rgba(154,117,32,.9)';mCtx.fill();mCtx.strokeStyle='rgba(255,255,255,.5)';mCtx.lineWidth=1;mCtx.stroke();mCtx.restore();});
  if(lsbMeaPts.length>1&&lsbS.calScale){const last=lsbMeaPts[lsbMeaPts.length-1],ls=lsbTs(last.x,last.y);lsbLbl(ls.x,ls.y-16,lsbPathKm(lsbMeaPts).toFixed(2)+' km','#9a7520');}
  // groups
  lsbS.groups.forEach(g=>lsbDrawGroup(g));
  // live preview
  if(lsbMode==='route'&&lsbRouteDrawing&&lsbLiveMouse){
    const g=lsbS.groups.find(x=>x.id===lsbSelGid);
    if(g?.route?.length){const last=g.route[g.route.length-1],a=lsbTs(last.x,last.y),b=lsbTs(lsbLiveMouse.x,lsbLiveMouse.y);mCtx.save();mCtx.strokeStyle=g.color+'55';mCtx.lineWidth=1.5;mCtx.setLineDash([3,4]);mCtx.beginPath();mCtx.moveTo(a.x,a.y);mCtx.lineTo(b.x,b.y);mCtx.stroke();mCtx.restore();}
  }
}
function lsbLbl(x,y,txt,col){
  mCtx.save();mCtx.font='bold 11px "Cinzel",serif';const tw=mCtx.measureText(txt).width;
  mCtx.fillStyle='rgba(240,228,180,.9)';const rx=x-tw/2-4,ry=y-8,rw=tw+8,rh=16,r=3;
  mCtx.beginPath();mCtx.moveTo(rx+r,ry);mCtx.lineTo(rx+rw-r,ry);mCtx.quadraticCurveTo(rx+rw,ry,rx+rw,ry+r);mCtx.lineTo(rx+rw,ry+rh-r);mCtx.quadraticCurveTo(rx+rw,ry+rh,rx+rw-r,ry+rh);mCtx.lineTo(rx+r,ry+rh);mCtx.quadraticCurveTo(rx,ry+rh,rx,ry+rh-r);mCtx.lineTo(rx,ry+r);mCtx.quadraticCurveTo(rx,ry,rx+r,ry);mCtx.closePath();mCtx.fill();
  mCtx.fillStyle=col||'#9a7520';mCtx.textAlign='center';mCtx.textBaseline='middle';mCtx.fillText(txt,x,y);mCtx.restore();
}
function lsbDrawGroup(g){
  if(!g.route?.length)return;const isSel=lsbSelGid===g.id;
  const isDragging=lsbDragReady&&lsbDragGid===g.id;
  if(g.route.length>1){
    mCtx.save();
    mCtx.strokeStyle=g.color+(isSel?'':'88');
    mCtx.lineWidth=isSel?3.5:2.5;
    mCtx.setLineDash([]);mCtx.lineJoin='round';mCtx.lineCap='round';
    mCtx.beginPath();
    g.route.forEach((p,i)=>{const s=lsbTs(p.x,p.y);i===0?mCtx.moveTo(s.x,s.y):mCtx.lineTo(s.x,s.y);});
    mCtx.stroke();mCtx.restore();
    if(lsbS.calScale){const km=lsbGroupKm(g),mid=lsbRouteMid(g.route),ms=lsbTs(mid.x,mid.y);lsbLbl(ms.x,ms.y,km.toFixed(1)+' km',g.color);}
  }
  const r=Math.max(8,lsbIconSize||22);
  g.route.forEach((p,i)=>{
    const s=lsbTs(p.x,p.y),isFirst=i===0,isLast=i===g.route.length-1&&g.route.length>1;
    const hasEv=p.event&&p.event.type!=='none',evInfo=hasEv?LSB_EV_INFO[p.event.type]:null;
    const beingDragged=isDragging&&lsbDragWpIdx===i;
    if(isFirst){
      const pr=isSel?r*1.2:r;
      mCtx.save();
      // pulse ring on drag-ready
      if(beingDragged){
        const t=Date.now()*.005,pulse=(Math.sin(t)+1)*.5;
        mCtx.beginPath();mCtx.arc(s.x,s.y-pr,pr+6+pulse*5,0,Math.PI*2);
        mCtx.strokeStyle=g.color;mCtx.lineWidth=2.5;mCtx.globalAlpha=.25+pulse*.35;mCtx.stroke();mCtx.globalAlpha=1;
      }
      // pin body
      mCtx.beginPath();mCtx.arc(s.x,s.y-pr,pr,0,Math.PI*2);mCtx.fillStyle=g.color;mCtx.fill();
      mCtx.strokeStyle='rgba(255,255,255,.85)';mCtx.lineWidth=beingDragged?3:2;mCtx.stroke();
      // pin needle
      mCtx.beginPath();mCtx.moveTo(s.x-pr*.42,s.y-pr*.5);mCtx.lineTo(s.x,s.y+3);mCtx.lineTo(s.x+pr*.42,s.y-pr*.5);mCtx.fillStyle=g.color;mCtx.fill();
      // icon
      if(g.iconIsImg&&g._imgEl){
        mCtx.save();mCtx.beginPath();mCtx.arc(s.x,s.y-pr,pr*.75,0,Math.PI*2);mCtx.clip();
        mCtx.drawImage(g._imgEl,s.x-pr*.75,s.y-pr*1.75,pr*1.5,pr*1.5);mCtx.restore();
      } else {
        mCtx.font=`${pr}px serif`;mCtx.textAlign='center';mCtx.textBaseline='middle';mCtx.fillText(g.icon||'📍',s.x,s.y-pr);
      }
      mCtx.restore();
      lsbLbl(s.x,s.y-pr*2-10,p.event?.name||g.name,g.color);
    } else if(isLast){
      mCtx.save();
      mCtx.beginPath();mCtx.arc(s.x,s.y,r*.7,0,Math.PI*2);
      mCtx.fillStyle='rgba(240,228,180,.95)';mCtx.fill();
      mCtx.strokeStyle=beingDragged?'rgba(255,255,255,.9)':g.color;mCtx.lineWidth=beingDragged?3:2;mCtx.stroke();
      mCtx.font=`${r*.9}px serif`;mCtx.textAlign='center';mCtx.textBaseline='middle';mCtx.fillText('🏁',s.x,s.y);
      mCtx.restore();
      lsbLbl(s.x,s.y-r-12,p.event?.name||(g.name+' → Ziel'),g.color);
    } else {
      const hr=hasEv?r*.7:r*.35;
      mCtx.save();
      mCtx.beginPath();mCtx.arc(s.x,s.y,hr,0,Math.PI*2);
      mCtx.fillStyle=hasEv?'rgba(240,228,180,.95)':g.color+'55';mCtx.fill();
      mCtx.strokeStyle=hasEv?evInfo.col:g.color+'88';mCtx.lineWidth=hasEv?2:1.5;mCtx.stroke();
      if(hasEv){
        mCtx.font=`${hr*1.2}px serif`;mCtx.textAlign='center';mCtx.textBaseline='middle';mCtx.fillText(evInfo.ic,s.x,s.y);
        if(p.event.name||evInfo.label)lsbLbl(s.x,s.y-hr-10,p.event.name||evInfo.label,evInfo.col);
      }
      mCtx.restore();
    }
  });
}
// lsbStartRaf() is a no-op now - permanent RAF loop above handles everything
function lsbStartRaf(){}
function lsbGroupKm(g){return window.TafelLsbCalculations.distance(g.route, lsbS.calScale);}
function lsbRouteMid(pts){return window.TafelLsbCalculations.routeMid(pts);}

// Route calculation
function lsbCalcRoute(g){
  return window.TafelLsbCalculations.calcRoute(g, lsbS.calScale, lsbFmtH);
}
function lsbApplyEv(ev,activeTM){
  return window.TafelLsbCalculations.applyEvent(ev, activeTM, lsbFmtH);
}

// Result panel
function lsbUpdResult(){
  lsbUpdMeaResult();
  const de=document.getElementById('lsb-rdist'),te=document.getElementById('lsb-rtime'),bd=document.getElementById('lsb-rbd');if(!de)return;
  if(!lsbS.calScale){de.innerHTML='<span style="font-family:\'Cinzel\',serif;font-size:var(--fs-sm);opacity:.3;">— Karte kalibrieren —</span>';te.textContent='';bd.textContent='';return;}
  const g=lsbS.groups.find(x=>x.id===lsbSelGid);
  if(g?.route?.length>1){
    const calc=lsbCalcRoute(g);if(!calc)return;
    const iconHtml=g.iconIsImg?`<img src="${g.icon}" style="width:1.1em;height:1.1em;vertical-align:middle;object-fit:contain;border-radius:2px;" onerror="this.remove()"/>`:(g.icon||'');
    de.innerHTML=`<span style="color:${g.color}">${iconHtml} ${esc(g.name)}</span>: ${calc.totalKm.toFixed(2)} km`;
    te.innerHTML=`${lsbGetTm(g.travelMode||'foot_e').l}<br><strong>${lsbFmtH(calc.totalH)}</strong> Gesamt`;
    if(calc.travelH!==calc.totalH)te.innerHTML+=` <span style="opacity:.55;font-size:.85em">(${lsbFmtH(calc.travelH)} + ${lsbFmtH(calc.delayH)})</span>`;
    bd.innerHTML=calc.breakdown.length?calc.breakdown.join(' · '):'';return;
  }
  de.innerHTML='<span style="font-family:\'Cinzel\',serif;font-size:var(--fs-sm);opacity:.3;">— Gruppe wählen oder Route zeichnen —</span>';te.textContent='';bd.textContent='';
}

// Icon helpers
function lsbPreloadIcons(){
  lsbS.groups.forEach(g=>{
    if(g.iconIsImg&&g.icon&&!g._imgEl){
      const img=new Image();img.crossOrigin='anonymous';
      img.onload=()=>{g._imgEl=img;if(imgW)lsbDraw();};
      img.src=g.icon;
    }
  });
}
function lsbIconTab(tab){
  document.getElementById('icntab-emoji').classList.toggle('on',tab==='emoji');
  document.getElementById('icntab-custom').classList.toggle('on',tab==='custom');
  document.getElementById('icn-panel-emoji').style.display=tab==='emoji'?'':'none';
  document.getElementById('icn-panel-custom').style.display=tab==='custom'?'':'none';
}
function lsbRenderCustomSlots(){
  const wrap=document.getElementById('lgrp-custom-slots');if(!wrap)return;
  wrap.innerHTML='';
  const slots=lsbS.customIcons||[];
  // filled slots
  slots.forEach((ic,i)=>{
    const d=document.createElement('div');
    const isOn=lGrpIconIsImg&&lGrpPIcon===ic.src;
    d.className='cslot'+(isOn?' on':'');
    d.innerHTML=`<img src="${ic.src}" onerror="if(this.parentElement){this.parentElement.classList.add('empty');}this.remove()"/><div class="cslot-del" data-action="delete-travel-custom-slot" data-slot-index="${i}">✕</div>`;
    d.addEventListener('click',event=>{
      if(event.target.closest('.cslot-del')) return;
      lsbPickCustomSlot(ic.src,d);
    });
    wrap.appendChild(d);
  });
  // empty slots up to CUSTOM_SLOTS
  for(let i=slots.length;i<CUSTOM_SLOTS;i++){
    const d=document.createElement('div');d.className='cslot empty';d.title='Noch leer';
    d.innerHTML=`<span style="font-size:16px;opacity:0.75">＋</span>`;
    wrap.appendChild(d);
  }
}
function lsbPickCustomSlot(src,el){
  lGrpPIcon=src;lGrpIconIsImg=true;
  document.getElementById('lgrp-icon-preview').innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:contain;"/>`;
  document.querySelectorAll('.cslot').forEach(s=>s.classList.remove('on'));
  el.classList.add('on');
}
function lsbAddCustomSlot(){
  const url=document.getElementById('lgrp-icon-url').value.trim();
  if(!url||url==='(Hochgeladen)'&&!lGrpPIcon){toast('Zuerst Bild hochladen oder URL eingeben');return;}
  const src=lGrpPIcon||(lGrpIconIsImg?lGrpPIcon:null);
  if(!src){toast('Kein Bild ausgewählt');return;}
  if(!lsbS.customIcons)lsbS.customIcons=[];
  if(lsbS.customIcons.length>=CUSTOM_SLOTS){toast('Alle Slots belegt — erst einen löschen');return;}
  lsbS.customIcons.push({src});
  lsbRenderCustomSlots();lsbSave();toast('✓ Icon gespeichert');
}
function lsbDelCustomSlot(i){
  if(!lsbS.customIcons)return;
  lsbS.customIcons.splice(i,1);
  lsbRenderCustomSlots();lsbSave();
}
function lsbPreviewOpacity(){
  const v=+document.getElementById('lgrp-opacity').value;lGrpOpacity=v;
  document.getElementById('lgrp-opacity-val').textContent=v+'%';
  document.getElementById('lgrp-color-preview').style.background=lsbColorWithOpacity(lGrpPCol,v);
}
function lsbPreviewIconUrl(){
  const url=document.getElementById('lgrp-icon-url').value.trim();
  const prev=document.getElementById('lgrp-icon-preview');
  if(url){lGrpPIcon=url;lGrpIconIsImg=true;prev.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:contain;" onerror="this.parentElement.textContent='❌'"/>`;document.querySelectorAll('#lgrp-icon-grid .icnl,.cslot').forEach(x=>x.classList.remove('on'));}
  else{lGrpIconIsImg=false;}
}
function lsbLoadIconFile(inp){
  if(!inp.files[0])return;const rd=new FileReader();
  rd.onload=e=>{
    lGrpPIcon=e.target.result;lGrpIconIsImg=true;
    document.getElementById('lgrp-icon-url').value='(Hochgeladen)';
    document.getElementById('lgrp-icon-preview').innerHTML=`<img src="${e.target.result}" style="width:100%;height:100%;object-fit:contain;"/>`;
    document.querySelectorAll('#lgrp-icon-grid .icnl,.cslot').forEach(x=>x.classList.remove('on'));
    // auto-add to slot
    if(!lsbS.customIcons)lsbS.customIcons=[];
    if(lsbS.customIcons.length<CUSTOM_SLOTS){lsbS.customIcons.push({src:e.target.result});lsbRenderCustomSlots();lsbSave();toast('✓ Icon in Slot gespeichert');}
  };
  rd.readAsDataURL(inp.files[0]);
}
function lsbPickEmoji(ic,el){
  lGrpPIcon=ic;lGrpIconIsImg=false;
  if(document.getElementById('lgrp-icon-url'))document.getElementById('lgrp-icon-url').value='';
  document.getElementById('lgrp-icon-preview').textContent=ic;
  document.querySelectorAll('#lgrp-icon-grid .icnl,.cslot').forEach(x=>x.classList.remove('on'));
  el.classList.add('on');
}
function lsbPickColor(color, el){
  lGrpPCol=color;
  document.querySelectorAll('#lgrp-colors .gcsw2').forEach(s=>s.classList.remove('on'));
  el.classList.add('on');
  lsbPreviewOpacity();
}

// Group modal
function openLGrpModal(gid){
  lGrpEditId=gid||null;const ex=gid?lsbS.groups.find(x=>x.id===gid):null;
  document.getElementById('lgrp-mo-ttl').textContent=ex?'Gruppe bearbeiten':'Neue Gruppe';
  lGrpPCol=ex?.colorHex||LSB_COLORS[lsbS.groups.length%LSB_COLORS.length];
  lGrpOpacity=ex?.opacity??80;lGrpPIcon=ex?.icon||LSB_ICONS[0];lGrpIconIsImg=ex?.iconIsImg||false;
  document.getElementById('lgrp-name').value=ex?.name||'';
  const prev=document.getElementById('lgrp-icon-preview');
  if(lGrpIconIsImg){prev.innerHTML=`<img src="${lGrpPIcon}" style="width:100%;height:100%;object-fit:contain;"/>`;document.getElementById('lgrp-icon-url').value=lGrpPIcon.startsWith('data:')?'(Hochgeladen)':lGrpPIcon;}
  else{prev.textContent=lGrpPIcon;document.getElementById('lgrp-icon-url').value='';}
  const ig=document.getElementById('lgrp-icon-grid');ig.innerHTML='';
  LSB_ICONS.forEach(ic=>{
    const d=document.createElement('div');
    d.className='icnl'+(ic===lGrpPIcon&&!lGrpIconIsImg?' on':'');
    d.textContent=ic;
    d.dataset.action='pick-travel-emoji';
    d.dataset.icon=ic;
    ig.appendChild(d);
  });
  lsbIconTab('emoji');
  lsbRenderCustomSlots();
  const cr=document.getElementById('lgrp-colors');cr.innerHTML='';
  LSB_COLORS.forEach(c=>{
    const sw=document.createElement('div');
    sw.className='gcsw2'+(c===lGrpPCol?' on':'');
    sw.style.background=c;
    sw.dataset.action='pick-travel-color';
    sw.dataset.color=c;
    cr.appendChild(sw);
  });
  document.getElementById('lgrp-opacity').value=lGrpOpacity;document.getElementById('lgrp-opacity-val').textContent=lGrpOpacity+'%';
  document.getElementById('lgrp-color-preview').style.background=lsbColorWithOpacity(lGrpPCol,lGrpOpacity);
  const sel=document.getElementById('lgrp-tm');sel.innerHTML=LSB_TM.map(m=>`<option value="${m.id}"${m.id===(ex?.travelMode||'foot_e')?' selected':''}>${m.l} (~${m.kmh}km/h)</option>`).join('');
  document.getElementById('lgrp-mo').classList.add('open');setTimeout(()=>document.getElementById('lgrp-name').focus(),60);
}
function saveLGrp(){
  const name=document.getElementById('lgrp-name').value.trim();if(!name){toast('Namen eingeben');return;}
  const tm=document.getElementById('lgrp-tm').value,col=lsbColorWithOpacity(lGrpPCol,lGrpOpacity);
  if(lGrpEditId){const g=lsbS.groups.find(x=>x.id===lGrpEditId);if(g)Object.assign(g,{name,color:col,colorHex:lGrpPCol,opacity:lGrpOpacity,icon:lGrpPIcon,iconIsImg:lGrpIconIsImg,travelMode:tm});lGrpEditId=null;}
  else lsbS.groups.push({id:uid(),name,color:col,colorHex:lGrpPCol,opacity:lGrpOpacity,icon:lGrpPIcon,iconIsImg:lGrpIconIsImg,travelMode:tm,route:[]});
  if(!lGrpEditId)lsbSelGid=lsbS.groups[lsbS.groups.length-1].id;
  closeLMo('lgrp-mo');lsbPreloadIcons();lsbRenderGroups();lsbDraw();lsbUpdResult();lsbSave();
  if(!lGrpEditId){lsbMode='place';toast('📍 Startmarker auf der Karte setzen');}
}

// Waypoint modal
function lsbBuildEvdHtml(type){
  const tmOpts=LSB_TM.map(m=>`<option value="${m.id}">${m.l}</option>`).join('');
  const tpl={none:'',stop:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Aufenthalt</span><input class="lev-inp sm" id="evd-stop-h" type="number" min="0" step=".5" value="10"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div></div>`,camp:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Lagerdauer</span><input class="lev-inp sm" id="evd-camp-h" type="number" min="0" step=".5" value="7"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div></div>`,horse:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Verzögerung</span><input class="lev-inp sm" id="evd-horse-h" type="number" min="0" step=".25" value="1"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div><div class="lev-row"><span class="lev-lbl">Neuer Modus</span><select class="lev-inp" id="evd-horse-tm">${tmOpts}</select></div></div>`,injury:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Schwere</span><select class="lev-inp" id="evd-inj-sev"><option value="light">Leicht 70%</option><option value="medium" selected>Mittel 50%</option><option value="severe">Schwer 30%</option><option value="heal">✅ Geheilt</option></select></div><div class="lev-row"><span class="lev-lbl">Behandlung</span><input class="lev-inp sm" id="evd-inj-h" type="number" min="0" step=".5" value="0"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div></div>`,encounter:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Verzögerung</span><input class="lev-inp sm" id="evd-enc-h" type="number" min="0" step=".25" value="2"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div></div>`,obstacle:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Verzögerung</span><input class="lev-inp sm" id="evd-obs-h" type="number" min="0" step=".25" value="2"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div></div>`,travelchange:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Neuer Modus</span><select class="lev-inp" id="evd-tc-tm">${tmOpts}</select></div></div>`,custom:`<div class="lev-detail show"><div class="lev-row"><span class="lev-lbl">Zeitverlust</span><input class="lev-inp sm" id="evd-cust-h" type="number" min="0" step=".25" value="0"/><span style="font-size:var(--fs-sm);opacity:.6">Std.</span></div><div class="lev-row"><span class="lev-lbl">Tempo-Faktor</span><input class="lev-inp sm" id="evd-cust-sp" type="number" min=".1" max="2" step=".05" value="1"/></div></div>`};
  return tpl[type]||'';
}
function openLWpModal(gid,idx){
  lWpGid=gid;lWpIdx=idx;const g=lsbS.groups.find(x=>x.id===gid);if(!g)return;
  const wp=g.route[idx];if(!wp)return;const ev=wp.event||{type:'none'};
  document.getElementById('lwp-mo-ttl').textContent=idx===0?'Startpunkt':idx===g.route.length-1?'Endpunkt':`Wegpunkt ${idx+1}`;
  document.getElementById('lwp-name').value=ev.name||'';document.getElementById('lwp-note').value=ev.note||'';
  lWpEvtType=ev.type||'none';
  document.getElementById('lwp-evt-grid').innerHTML=LSB_EV_TYPES.map(e=>`<div class="levt${e.type===lWpEvtType?' on':''}" data-action="pick-travel-waypoint-event" data-event-type="${e.type}"><div class="levt-ic">${e.ic}</div><div class="levt-lb">${e.lb}</div></div>`).join('');
  document.getElementById('lwp-evd-wrap').innerHTML=lsbBuildEvdHtml(lWpEvtType);
  setTimeout(()=>{
    if(ev.type==='stop'&&document.getElementById('evd-stop-h'))document.getElementById('evd-stop-h').value=ev.stopH||10;
    if(ev.type==='camp'&&document.getElementById('evd-camp-h'))document.getElementById('evd-camp-h').value=ev.campH||7;
    if(ev.type==='horse'){if(document.getElementById('evd-horse-h'))document.getElementById('evd-horse-h').value=ev.horseH||1;if(document.getElementById('evd-horse-tm'))document.getElementById('evd-horse-tm').value=ev.horseTM||g.travelMode;}
    if(ev.type==='injury'){if(document.getElementById('evd-inj-sev'))document.getElementById('evd-inj-sev').value=ev.injSev||'medium';if(document.getElementById('evd-inj-h'))document.getElementById('evd-inj-h').value=ev.injH||0;}
    if(ev.type==='encounter'&&document.getElementById('evd-enc-h'))document.getElementById('evd-enc-h').value=ev.encH||2;
    if(ev.type==='obstacle'&&document.getElementById('evd-obs-h'))document.getElementById('evd-obs-h').value=ev.obsH||2;
    if(ev.type==='travelchange'&&document.getElementById('evd-tc-tm'))document.getElementById('evd-tc-tm').value=ev.tcTM||g.travelMode;
    if(ev.type==='custom'){if(document.getElementById('evd-cust-h'))document.getElementById('evd-cust-h').value=ev.custH||0;if(document.getElementById('evd-cust-sp'))document.getElementById('evd-cust-sp').value=ev.custSp||1;}
  },20);
  document.getElementById('lwp-del-btn').style.display=(ev.type&&ev.type!=='none')?'block':'none';
  document.getElementById('lwp-mo').classList.add('open');
}
function lsbPickEvt(el,type){lWpEvtType=type;document.querySelectorAll('#lwp-evt-grid .levt').forEach(e=>e.classList.remove('on'));el.classList.add('on');document.getElementById('lwp-evd-wrap').innerHTML=lsbBuildEvdHtml(type);}
function saveLWpEvt(){
  const g=lsbS.groups.find(x=>x.id===lWpGid);if(!g)return;const wp=g.route[lWpIdx];if(!wp)return;
  const type=lWpEvtType,ev={type,name:document.getElementById('lwp-name').value.trim(),note:document.getElementById('lwp-note').value.trim()};
  if(type==='stop')ev.stopH=+(document.getElementById('evd-stop-h')?.value||10);
  if(type==='camp')ev.campH=+(document.getElementById('evd-camp-h')?.value||7);
  if(type==='horse'){ev.horseH=+(document.getElementById('evd-horse-h')?.value||1);ev.horseTM=document.getElementById('evd-horse-tm')?.value;}
  if(type==='injury'){ev.injSev=document.getElementById('evd-inj-sev')?.value||'medium';ev.injH=+(document.getElementById('evd-inj-h')?.value||0);}
  if(type==='encounter')ev.encH=+(document.getElementById('evd-enc-h')?.value||2);
  if(type==='obstacle')ev.obsH=+(document.getElementById('evd-obs-h')?.value||2);
  if(type==='travelchange')ev.tcTM=document.getElementById('evd-tc-tm')?.value;
  if(type==='custom'){ev.custH=+(document.getElementById('evd-cust-h')?.value||0);ev.custSp=+(document.getElementById('evd-cust-sp')?.value||1);}
  wp.event=ev;if(ev.name)wp.name=ev.name;
  closeLMo('lwp-mo');lsbRenderGroups();lsbDraw();lsbUpdResult();lsbSave();toast(type==='none'?'Gespeichert':'✓ Ereignis gespeichert');
}
function deleteLWpEvt(){
  const g=lsbS.groups.find(x=>x.id===lWpGid);if(!g)return;const wp=g.route[lWpIdx];if(!wp)return;
  delete wp.event;delete wp.name;closeLMo('lwp-mo');lsbRenderGroups();lsbDraw();lsbUpdResult();lsbSave();toast('Ereignis gelöscht');
}

// Group list render
function lsbRenderGroups(){
  const list=document.getElementById('lsb-groups');if(!list)return;list.innerHTML='';
  if(!lsbS.groups.length){list.innerHTML='<div style="font-family:\'Cinzel\',serif;font-size:var(--fs-sm);color:var(--gold);opacity:.55;text-align:center;padding:.55rem;">Noch keine Gruppen — ＋ drücken</div>';return;}
  const sz=Math.max(24,lsbIconSize||22);
  lsbS.groups.forEach(g=>{
    const isSel=lsbSelGid===g.id,calc=lsbS.calScale&&g.route?.length>1?lsbCalcRoute(g):null;
    const evCount=g.route?.filter(p=>p.event&&p.event.type!=='none').length||0;
    const iconHtml=g.iconIsImg&&g.icon?`<img src="${g.icon}" style="width:100%;height:100%;object-fit:contain;" onerror="this.parentElement.textContent='📍'"/>`:(g.icon||'📍');
    const d=document.createElement('div');d.className='lg'+(isSel?' sel':'');
    d.innerHTML=`<div class="lg1">
      <div class="lg-icon" style="width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.65)}px;background:${g.color};border-color:${g.color};" data-action="edit-travel-group" data-group-id="${g.id}">${iconHtml}</div>
      <input class="lg-name" value="${esc(g.name)}" maxlength="40" data-blur-action="rename-travel-group" data-keydown-action="blur-on-enter" data-group-id="${g.id}"/>
      <button class="lg-del" data-action="delete-travel-group" data-group-id="${g.id}">✕</button>
    </div>
    <div class="lg-info">${g.route?.length>1?g.route.length+' Punkte':g.route?.length===1?'1 Marker gesetzt':'⬚ Kein Marker'}${calc?' · '+calc.totalKm.toFixed(1)+' km · '+lsbFmtH(calc.totalH):''}${evCount?' · '+evCount+' Ereignis'+(evCount>1?'se':''):''}</div>
    <select class="lg-tm" data-input-action="set-travel-mode" data-group-id="${g.id}">${LSB_TM.map(m=>`<option value="${m.id}"${m.id===g.travelMode?' selected':''}>${m.l}</option>`).join('')}</select>
    <div class="lg-btns">
      <button class="lgb" data-action="place-travel-group" data-group-id="${g.id}">📍</button>
      <button class="lgb" data-action="start-travel-route" data-group-id="${g.id}">✏ Route</button>
      <button class="lgb" data-action="continue-travel-route" data-group-id="${g.id}">➕</button>
      <button class="lgb red" data-action="clear-travel-route" data-group-id="${g.id}">✕ Route</button>
    </div>
    ${g.route?.length>1?`<div class="wpl2" id="wpl-${g.id}"></div>`:''}`;
    d.addEventListener('click',e=>{if(['BUTTON','SELECT','INPUT'].includes(e.target.tagName))return;lsbSelGid=g.id;lsbRenderGroups();lsbUpdResult();});
    list.appendChild(d);
    if(g.route?.length>1){
      const wpl=document.getElementById('wpl-'+g.id);
      g.route.forEach((p,i)=>{
        const hasEv=p.event&&p.event.type!=='none',evInfo=hasEv?LSB_EV_INFO[p.event.type]:null;
        const wi=document.createElement('div');wi.className='wpi2'+(hasEv?' has-ev':'');
        wi.innerHTML=`<span class="wpi2-ic">${i===0?'🚩':i===g.route.length-1?'🏁':hasEv?evInfo.ic:'·'}</span><span class="wpi2-n">${p.event?.name||(i===0?'Start':i===g.route.length-1?'Ziel':'Punkt '+(i+1))}</span>${hasEv?`<span class="wpi2-ev">${evInfo.label}</span>`:''}<button class="wpi2-del" data-action="delete-travel-waypoint" data-group-id="${g.id}" data-point-index="${i}">✕</button>`;
        wi.addEventListener('click',()=>openLWpModal(g.id,i));wpl.appendChild(wi);
      });
    }
  });
}
function lsbRenGrp(id,v){const g=lsbS.groups.find(x=>x.id===id);if(g&&v.trim()){g.name=v.trim();lsbRenderGroups();lsbSave();}}
function lsbDelGrp(id){if(!confirm('Gruppe löschen?'))return;lsbS.groups=lsbS.groups.filter(x=>x.id!==id);if(lsbSelGid===id){lsbSelGid=null;lsbRouteDrawing=false;}lsbRenderGroups();lsbDraw();lsbUpdResult();lsbSave();}
function lsbSetTM(id,v){const g=lsbS.groups.find(x=>x.id===id);if(g)g.travelMode=v;lsbRenderGroups();lsbUpdResult();lsbSave();}
function lsbDoPlace(id){lsbSelGid=id;lsbMode='place';toast('📍 Startmarker setzen');}
function lsbStartRoute(id){const g=lsbS.groups.find(x=>x.id===id);if(!g)return;if(!g.route?.length){toast('Zuerst Startmarker setzen (📍)');return;}lsbSelGid=id;g.route=[{x:g.route[0].x,y:g.route[0].y}];lsbRouteDrawing=true;lsbMode='route';lsbRenderGroups();lsbStartRaf();toast('✏ Klicken=Wegpunkt · Doppelklick=fertig');}
function lsbContRoute(id){const g=lsbS.groups.find(x=>x.id===id);if(!g)return;if(!g.route?.length){lsbDoPlace(id);return;}lsbSelGid=id;lsbRouteDrawing=true;lsbMode='route';lsbStartRaf();toast('Fortsetzen — Doppelklick zum Beenden');}
function lsbClrRoute(id){const g=lsbS.groups.find(x=>x.id===id);if(g)g.route=[];lsbRouteDrawing=false;lsbLiveMouse=null;lsbRenderGroups();lsbDraw();lsbUpdResult();lsbSave();}
function lsbDelWp(id,i){const g=lsbS.groups.find(x=>x.id===id);if(!g)return;g.route.splice(i,1);lsbRenderGroups();lsbDraw();lsbUpdResult();lsbSave();}
function lsbFinRoute(){
  lsbRouteDrawing=false;lsbLiveMouse=null;
  const g=lsbS.groups.find(x=>x.id===lsbSelGid);
  if(g&&g.route.length<2){g.route=g.route.slice(0,1);toast('Route zu kurz');}else if(g)toast('✓ Route fertig');
  lsbMode='pan';lsbRenderGroups();lsbUpdResult();lsbSave();
}
function lsbHitWp(mx,my){
  const thresh=16/vz;
  for(const g of [...lsbS.groups].reverse())if(g.route?.length)for(let i=0;i<g.route.length;i++){const p=g.route[i],dx=mx-p.x,dy=my-p.y;if(Math.sqrt(dx*dx+dy*dy)<thresh)return{g,i};}
  return null;
}

// Map event listeners for LSB
mapWrap.addEventListener('mousemove',e=>{
  if(lsbMode==='route'&&lsbRouteDrawing){const r=mapWrap.getBoundingClientRect();lsbLiveMouse=lsbTmxy(e.clientX-r.left,e.clientY-r.top);}
  if(lsbDragGid&&lsbDragReady){
    lsbDragMoved=true;const r=mapWrap.getBoundingClientRect();
    const mp=lsbTmxy(e.clientX-r.left,e.clientY-r.top);
    const g=lsbS.groups.find(x=>x.id===lsbDragGid);
    if(g&&lsbDragWpIdx>=0){
      g.route[lsbDragWpIdx]={...g.route[lsbDragWpIdx],x:mp.x,y:mp.y};
      lsbDraw(); // redraw immediately every frame
    }
    mapWrap.style.cursor='grabbing';
  } else if(!lsbDragGid&&lsbMode==='pan'){
    const r=mapWrap.getBoundingClientRect(),mp=lsbTmxy(e.clientX-r.left,e.clientY-r.top);
    mapWrap.style.cursor=lsbHitWp(mp.x,mp.y)?'grab':'';
  }
});
mapWrap.addEventListener('mousedown',e=>{
  if(e.button!==0)return;
  const r=mapWrap.getBoundingClientRect(),sx=e.clientX-r.left,sy=e.clientY-r.top;
  lsbDragMoved=false;lsbDragReady=false;
  if(lsbMode==='pan'){
    const mp=lsbTmxy(sx,sy),hit=lsbHitWp(mp.x,mp.y);
    if(hit){
      lsbDragGid=hit.g.id;lsbDragWpIdx=hit.i;
      // long-press timer: 320ms to activate drag
      lsbHoldTimer=setTimeout(()=>{
        lsbDragReady=true;
        mapWrap.style.cursor='grabbing';
        toast('🖐 Ziehen…');
        lsbDragPulse=true;
        lsbStartRaf();
      },320);
      e.stopImmediatePropagation();
    }
  }
});
mapWrap.addEventListener('mouseup',e=>{
  clearTimeout(lsbHoldTimer);lsbHoldTimer=null;lsbDragPulse=false;
  if(lsbDragGid){
    if(lsbDragMoved&&lsbDragReady){lsbSave();toast('✓ Marker verschoben');}
    else if(!lsbDragReady&&!lsbDragMoved){openLWpModal(lsbDragGid,lsbDragWpIdx);}
    lsbDragGid=null;lsbDragWpIdx=-1;lsbDragReady=false;lsbDragMoved=false;
    mapWrap.style.cursor='grab';
  }
});
// also cancel on mouseleave
mapWrap.addEventListener('mouseleave',()=>{
  if(lsbDragGid&&!lsbDragReady){clearTimeout(lsbHoldTimer);lsbHoldTimer=null;lsbDragGid=null;lsbDragWpIdx=-1;}
});
mapWrap.addEventListener('click',e=>{
  if(lsbDragMoved)return;
  const r=mapWrap.getBoundingClientRect(),mp=lsbTmxy(e.clientX-r.left,e.clientY-r.top);
  if(lsbMode==='calib'){lsbCalPts.push({x:mp.x,y:mp.y});lsbUpdCalUI();if(lsbCalPts.length===2)lsbFinCal();e.stopImmediatePropagation();return;}
  if(lsbMode==='measure'){lsbMeaPts.push({x:mp.x,y:mp.y});lsbUpdMeaResult();e.stopImmediatePropagation();return;}
  if(lsbMode==='place'){
    const gid=lsbSelGid||lsbS.groups[0]?.id;if(!gid){toast('Zuerst eine Gruppe anlegen!');return;}
    const g=lsbS.groups.find(x=>x.id===gid);
    if(g){if(!g.route?.length)g.route=[{x:mp.x,y:mp.y}];else g.route[0]={...g.route[0],x:mp.x,y:mp.y};lsbRenderGroups();lsbMode='pan';lsbSave();toast('✓ Marker gesetzt');}
    e.stopImmediatePropagation();return;
  }
  if(lsbMode==='route'&&lsbRouteDrawing){
    const g=lsbS.groups.find(x=>x.id===lsbSelGid);if(!g)return;
    if(!g.route)g.route=[];g.route.push({x:mp.x,y:mp.y});lsbUpdResult();e.stopImmediatePropagation();return;
  }
});
mapWrap.addEventListener('dblclick',e=>{
  if(lsbMode==='measure'&&lsbMeaPts.length>1){lsbMode='pan';document.getElementById('lmb-mea').classList.remove('on');lsbUpdMeaResult();}
  if(lsbMode==='route'&&lsbRouteDrawing)lsbFinRoute();
});
document.addEventListener('keydown',e=>{
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if(e.key==='Backspace'&&lsbMode==='route'&&lsbRouteDrawing){const g=lsbS.groups.find(x=>x.id===lsbSelGid);if(g?.route?.length>1){g.route.pop();lsbUpdResult();}}
  if(e.key==='Enter'&&lsbMode==='route'&&lsbRouteDrawing)lsbFinRoute();
  if(e.key==='Escape'&&lsbMode!=='pan'){lsbMode='pan';lsbRouteDrawing=false;lsbLiveMouse=null;lsbCalPts=[];document.getElementById('lmb-mea').classList.remove('on');}
});
document.getElementById('lgrp-mo').addEventListener('click',e=>{if(e.target===document.getElementById('lgrp-mo'))closeLMo('lgrp-mo');});
document.getElementById('lwp-mo').addEventListener('click',e=>{if(e.target===document.getElementById('lwp-mo'))closeLMo('lwp-mo');});

// ═══════════════════════════════════════════
// DM TOOLS — Sessions, Status, Tagebuch, Notizen
// ═══════════════════════════════════════════
let dmSessEditId=null;

function dmLoad(){
  if(!S.dm){S.dm={sessions:[],notes:'',groupStatus:{}};}
  S.dm.sessions=S.dm.sessions||[];S.dm.groupStatus=S.dm.groupStatus||{};
  const notes=document.getElementById('dm-notes');
  if(notes) notes.value=S.dm.notes||'';
  dmRenderSessions();
}

function toggleDmMenu(){/* DM menu disabled */}
document.addEventListener('click',e=>{
  const dmWrap=document.getElementById('dm-btn-wrap');
  const dmMenu=document.getElementById('dm-menu');
  if(dmWrap&&dmMenu&&!dmWrap.contains(e.target))
    dmMenu.style.display='none';
});

function toggleDmPanel(){/* DM panel disabled */}

// ── SESSIONS ──
function dmRenderSessions(){
  const el=document.getElementById('dm-sessions');if(!el)return;
  const sessions=S.dm.sessions||[];
  if(!sessions.length){el.innerHTML='<div style="font-family:\'Cinzel\',serif;font-size:var(--fs-sm);opacity:.55;text-align:center;padding:.4rem;">Noch keine Sitzungen — ＋ drücken</div>';return;}
  el.innerHTML='';
  [...sessions].reverse().forEach((s,ri)=>{
    const i=sessions.length-1-ri;
    const groups=lsbS.groups.filter(g=>s.groups?.includes(g.id));
    const d=document.createElement('div');d.className='dm-session';
    d.innerHTML=`<div class="dm-session-hdr">
      <span class="dm-sess-num">S${i+1}</span>
      <span class="dm-sess-ttl">${esc(s.name||'Unbenannte Sitzung')}</span>
      <span class="dm-sess-date">${s.date?new Date(s.date+'T12:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit'}):''}</span>
    </div>
    ${s.igdate?`<div style="font-size:var(--fs-sm);color:var(--gold);opacity:.65;font-style:italic;margin:.08rem 0 .1rem;">⚔ ${esc(s.igdate)}</div>`:''}
    ${s.notes?`<div class="dm-sess-note">${esc(s.notes)}</div>`:''}
    ${groups.length?`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:.25rem;">${groups.map(g=>`<span class="dm-sess-tag" style="color:${g.color};border-color:${g.color}55;">${g.icon&&!g.iconIsImg?g.icon:''} ${esc(g.name)}</span>`).join('')}</div>`:''}`;
    d.addEventListener('click',()=>dmOpenSession(s.id));
    el.appendChild(d);
  });
}

function dmAddSession(){
  dmSessEditId=null;
  const n=S.dm.sessions.length+1;
  document.getElementById('dmsess-mo-ttl').textContent='Neue Sitzung';
  document.getElementById('dmsess-name').value='Session '+n+' — ';
  document.getElementById('dmsess-date').value=new Date().toISOString().slice(0,10);
  document.getElementById('dmsess-igdate').value='';
  document.getElementById('dmsess-notes').value='';
  document.getElementById('dmsess-del-btn').style.display='none';
  dmRenderSessGroups(null);
  document.getElementById('dmsess-mo').classList.add('open');
  setTimeout(()=>{const n=document.getElementById('dmsess-name');n.focus();n.setSelectionRange(n.value.length,n.value.length);},60);
}

function dmOpenSession(id){
  const s=S.dm.sessions.find(x=>x.id===id);if(!s)return;
  dmSessEditId=id;
  document.getElementById('dmsess-mo-ttl').textContent='Sitzung bearbeiten';
  document.getElementById('dmsess-name').value=s.name||'';
  document.getElementById('dmsess-date').value=s.date||'';
  document.getElementById('dmsess-igdate').value=s.igdate||'';
  document.getElementById('dmsess-notes').value=s.notes||'';
  document.getElementById('dmsess-del-btn').style.display='block';
  dmRenderSessGroups(s.groups||[]);
  document.getElementById('dmsess-mo').classList.add('open');
}

function dmRenderSessGroups(selected){
  const wrap=document.getElementById('dmsess-groups');wrap.innerHTML='';
  lsbS.groups.forEach(g=>{
    const on=selected?selected.includes(g.id):false;
    const btn=document.createElement('button');btn.className='sess-grp-toggle'+(on?' on':'');
    btn.innerHTML=(g.iconIsImg?'':g.icon+' ')+esc(g.name);
    btn.addEventListener('click',()=>btn.classList.toggle('on'));
    wrap.appendChild(btn);
  });
}

function dmSaveSession(){
  const name=document.getElementById('dmsess-name').value.trim();
  const date=document.getElementById('dmsess-date').value;
  const igdate=document.getElementById('dmsess-igdate').value.trim();
  const notes=document.getElementById('dmsess-notes').value.trim();
  const groups=[...document.querySelectorAll('#dmsess-groups .sess-grp-toggle.on')].map((_,i)=>lsbS.groups[i]?.id).filter(Boolean);
  if(dmSessEditId){
    const s=S.dm.sessions.find(x=>x.id===dmSessEditId);
    if(s)Object.assign(s,{name,date,igdate,notes,groups});
  } else {
    S.dm.sessions.push({id:uid(),name,date,igdate,notes,groups});
  }
  closeLMo('dmsess-mo');dmRenderSessions();saveD();toast('✓ Sitzung gespeichert');
}

function dmDelSession(){
  if(!dmSessEditId)return;
  if(!confirm('Sitzung wirklich löschen?'))return;
  S.dm.sessions=S.dm.sessions.filter(x=>x.id!==dmSessEditId);
  closeLMo('dmsess-mo');dmRenderSessions();saveD();toast('Sitzung gelöscht');
}

// ── NOTES ──
let dmNotesTimer=null;
function dmSaveNotes(){
  clearTimeout(dmNotesTimer);
  dmNotesTimer=setTimeout(()=>{S.dm.notes=document.getElementById('dm-notes').value;saveD();},1200);
}

// ── GROUP STATUS ──
function openGroupStatus(){
  const body=document.getElementById('dmstat-body');body.innerHTML='';
  lsbS.groups.forEach(g=>{
    const st=S.dm.groupStatus[g.id]||{};
    const sz=Math.max(18,lsbIconSize||22);
    const iconHtml=g.iconIsImg&&g.icon?`<img src="${g.icon}" style="width:${sz}px;height:${sz}px;object-fit:contain;"/>`:`<span style="font-size:${sz}px">${g.icon||'📍'}</span>`;
    const hpPct=st.hp&&st.hpMax?Math.round(st.hp/st.hpMax*100):100;
    const hpCol=hpPct>60?'#3a8a3a':hpPct>30?'#c07820':'#a03030';
    body.innerHTML+=`<div class="stat-card" data-gid="${g.id}">
      <div class="stat-card-hdr">
        <div style="width:${sz}px;height:${sz}px;background:${g.color};border-radius:3px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">${iconHtml}</div>
        <span class="stat-name">${esc(g.name)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-lbl">💙 HP</span>
        <input class="stat-inp" type="number" min="0" placeholder="aktuell" value="${st.hp||''}" data-f="hp"/>
        <span style="opacity:.3;font-size:var(--fs-sm)">/</span>
        <input class="stat-inp" type="number" min="0" placeholder="max" value="${st.hpMax||''}" data-f="hpMax"/>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${hpPct}%;background:${hpCol}"></div></div>
      </div>
      <div class="stat-row">
        <span class="stat-lbl">📍 Aufenthaltsort</span>
        <input class="stat-inp wide" type="text" placeholder="z.B. Gasthaus zum Roten Hirsch…" value="${esc(st.location||'')}" data-f="location"/>
      </div>
      <div class="stat-row">
        <span class="stat-lbl">🎒 Ressourcen</span>
        <input class="stat-inp wide" type="text" placeholder="Gold, Vorräte, Zaubertränke…" value="${esc(st.resources||'')}" data-f="resources"/>
      </div>
      <div class="stat-row">
        <span class="stat-lbl">📝 Status-Notiz</span>
        <input class="stat-inp wide" type="text" placeholder="Erschöpft, verwundet, auf der Flucht…" value="${esc(st.note||'')}" data-f="note"/>
      </div>
    </div>`;
  });
  if(!lsbS.groups.length)body.innerHTML='<div style="font-family:\'Cinzel\',serif;font-size:var(--fs-sm);opacity:.65;text-align:center;padding:1rem;">Keine Gruppen vorhanden</div>';
  document.getElementById('dmstat-mo').classList.add('open');
}

function dmSaveStatus(){
  document.querySelectorAll('#dmstat-body .stat-card').forEach(card=>{
    const gid=card.dataset.gid;if(!gid)return;
    const st={};card.querySelectorAll('[data-f]').forEach(inp=>{st[inp.dataset.f]=inp.value;});
    if(st.hp)st.hp=+st.hp;if(st.hpMax)st.hpMax=+st.hpMax;
    S.dm.groupStatus[gid]=st;
  });
  closeLMo('dmstat-mo');saveD();toast('✓ Status gespeichert');
}

// ── DIARY ──
function openDiary(){
  window.TafelLsbDiary.renderDiary({
    body: document.getElementById('dmdiary-body'),
    sessions: S.dm.sessions || [],
    groups: lsbS.groups,
    groupStatus: S.dm.groupStatus || {},
    scale: lsbS.calScale,
    regionTitle: S.regionTitle,
    formatHours: lsbFmtH,
    calcRoute: lsbCalcRoute
  });
  document.getElementById('dmdiary-mo').classList.add('open');
}

function dmExportDiary(){
  const txt=window.TafelLsbDiary.buildExportText({
    sessions: S.dm.sessions || [],
    groups: lsbS.groups,
    notes: S.dm.notes,
    scale: lsbS.calScale,
    regionTitle: S.regionTitle,
    formatHours: lsbFmtH,
    calcRoute: lsbCalcRoute
  });
  const blob=new Blob([txt],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=(S.regionTitle||'Karte').replace(/\s+/g,'-')+'_Tagebuch_'+new Date().toISOString().slice(0,10)+'.txt';
  a.click();URL.revokeObjectURL(url);toast('✓ Tagebuch exportiert');
}

document.getElementById('dmsess-mo').addEventListener('click',e=>{if(e.target===document.getElementById('dmsess-mo'))closeLMo('dmsess-mo');});
document.getElementById('zettel-tpl-mo').addEventListener('click',e=>{if(e.target===document.getElementById('zettel-tpl-mo'))closeLMo('zettel-tpl-mo');});
document.getElementById('dmstat-mo').addEventListener('click',e=>{if(e.target===document.getElementById('dmstat-mo'))closeLMo('dmstat-mo');});
document.getElementById('dmdiary-mo').addEventListener('click',e=>{if(e.target===document.getElementById('dmdiary-mo'))closeLMo('dmdiary-mo');});

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
function init(){
  applyTafelConfig();
  setLayer('normal');mapWrap.style.cursor='grab';
  const _zl=document.getElementById('zettel-layer');if(_zl)_zl.style.display='block';
  window.TafelPinBoard?.attachDragListeners();
  window.TafelZettelBoard?.attachDragListeners();
  applySizes();applyRegionMeta();window.renderCatBar?.();
  // Init canvas HERE so mCv/mCtx are set before any lsbDraw calls
  mCv=document.getElementById('measure-canvas');
  mCtx=mCv.getContext('2d');
  mCv.width=mapWrap.clientWidth;mCv.height=mapWrap.clientHeight;
  new ResizeObserver(()=>{
    const w=mapWrap.clientWidth,h=mapWrap.clientHeight;
    if(mCv.width!==w||mCv.height!==h){mCv.width=w;mCv.height=h;}
  }).observe(mapWrap);
  // Permanent RAF loop — canvas always in sync, no race conditions possible
  (function _loop(){requestAnimationFrame(_loop);if(imgW)lsbDraw();})();
  lsbRenderGroups();lsbUpdResult();
  const go=()=>window._fb.sub(remote=>{if(ignRemote)return;applyState(remote);});
  window._fb?go():window.addEventListener('fb-ready',go,{once:true});
}
window.TafelInit = init;
