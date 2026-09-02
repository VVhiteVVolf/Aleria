// ═══════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════
const KARTO_CONFIG = window.KARTO_CONFIG || {};

const DEFAULT_CATS = [
  {id:'mmflrbzxydg7', label:'Hauptstadt',        color:'#ff0000'},
  {id:'mmflrqajby8b', label:'Bauernsiedlung',     color:'#6060b0'},
  {id:'mmflry5furso', label:'Hafensiedlung',      color:'#b03030'},
  {id:'mmfls5afqqpr', label:'Burgsiedlung',       color:'#9050b0'},
  {id:'mmflsfqh3sft', label:'Handelssiedlung',    color:'#3a8a3a'},
  {id:'mmflsrndeiee', label:'Brückensiedlung',    color:'#2a7aaa'},
  {id:'mmflt1x3v22o', label:'Bergbausiedlung',    color:'#7a6040'},
  {id:'mmflt7uj831y', label:'Waldsiedlung',       color:'#c07030'},
  {id:'mmflteurd4n5', label:'Kirchensiedlung',    color:'#508080'},
  {id:'mmfltia1m3s7', label:'Leuchtturmsiedlung', color:'#c49a20'},
  {id:'mmfltullsctk', label:'Festungssiedlung',   color:'#6060b0'},
  {id:'mmflvj37jbh2', label:'Taverne',            color:'#b03030'},
  {id:'mmflvquv2rr3', label:'Siedlungsruine',     color:'#9050b0'},
  {id:'mmflw1z5ko6e', label:'Stadtruine',         color:'#3a8a3a'},
  {id:'mmflw73t2e8v', label:'Bardensiedlung',     color:'#2a7aaa'},
  {id:'mmflwdjfl6ah', label:'Stadt',              color:'#7a6040'},
  {id:'mmflwmdfcyua', label:'Turmruine',          color:'#c07030'},
  {id:'mmflwxad8w1j', label:'Schiffswrack',       color:'#508080'},
  {id:'mmflx4731uj6', label:'Turnierplatz',       color:'#c49a20'},
  {id:'mmflxnnhbh4g', label:'Besondere Orte',     color:'#6060b0'},
];

// DEFAULT_MARKER_CATALOG now lives in assets/js/data/default-marker-catalog.js
// (336 entries: the original 74 Imgur markers + 262 local icons from IconOrdner/,
// loaded as window.KARTO_DEFAULT_MARKER_CATALOG before this script runs).
const DEFAULT_MARKER_CATALOG = window.KARTO_DEFAULT_MARKER_CATALOG || [];

const EMPTY_MAP_IMAGE = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1000" viewBox="0 0 1400 1000"><rect width="1400" height="1000" fill="#e6d7ad"/><text x="700" y="475" text-anchor="middle" font-family="serif" font-size="38" fill="#87621f">Kartenbild fehlt</text><text x="700" y="525" text-anchor="middle" font-family="serif" font-size="22" fill="#87621f">Editormodus -> Bilder -> Imgur-Links eintragen</text></svg>'
);
const EMPTY_LAYER_IMAGE = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1000" viewBox="0 0 1400 1000"><rect width="1400" height="1000" fill="transparent"/></svg>'
);

function cleanMapImages(images){
  return {
    normal: String(images?.normal || '').trim(),
    regions: String(images?.regions || '').trim(),
    pins: String(images?.pins || '').trim(),
  };
}

const DEFAULT_LAYER_NAMES = {normal:'Karte', regions:'Regionen', pins:'Markierungen'};
function cleanLayerNames(names){
  return {
    normal: String(names?.normal || '').trim() || DEFAULT_LAYER_NAMES.normal,
    regions: String(names?.regions || '').trim() || DEFAULT_LAYER_NAMES.regions,
    pins: String(names?.pins || '').trim() || DEFAULT_LAYER_NAMES.pins,
  };
}

// Beyond the 3 fixed layers (Karte/Regionen/Markierungen), maps can define
// any number of additional optional image overlays - each just needs a
// name and an image (URL or local upload, staged the same way as marker
// icons - see karto-storage.js's KartoPublish.stageImage).
function cleanExtraLayers(list){
  if(!Array.isArray(list)) return [];
  return list.map(l => ({
    id: String(l?.id || uid()),
    name: String(l?.name || '').trim() || 'Ebene',
    url: String(l?.url || '').trim(),
  })).filter(l => l.id);
}

// Herrschaften/Baronien dieser Karte (z.B. "Herrschaft der Wyrm",
// "Baronie Gwendolyns Ufer") - Pins verweisen optional per pin.dominionId
// darauf (siehe dominionOf()). Frei erweiterbar, damit auch Karten ohne
// vorbereitete Lore-Seite eigene Herrschaften anlegen koennen.
function cleanDominions(list){
  if(!Array.isArray(list)) return [];
  const cleaned = list.map(d => ({
    id: String(d?.id || uid()),
    name: String(d?.name || '').trim() || 'Unbenannte Herrschaft',
    type: String(d?.type || '').trim(),
    ruler: String(d?.ruler || '').trim(),
    seat: String(d?.seat || '').trim(),
    note: String(d?.note || '').trim(),
    // Feudale Verschachtelung, z.B. eine ritterfürstliche Herrschaft
    // INNERHALB einer Baronie - siehe dominionChain().
    parentId: String(d?.parentId || '').trim(),
  })).filter(d => d.id);
  // Haengende/selbstreferenzierende parentIds kappen (geloeschter Elternteil o.ae.)
  const ids = new Set(cleaned.map(d => d.id));
  cleaned.forEach(d => { if(d.parentId && (d.parentId === d.id || !ids.has(d.parentId))) d.parentId = ''; });
  return cleaned;
}

// ═══════════════════════════════════════════
// STATE — everything saved to Firebase
// ═══════════════════════════════════════════
let S = {
  pins: [],
  cats: JSON.parse(JSON.stringify(KARTO_CONFIG.defaultCats || DEFAULT_CATS)),
  dotSize: 18,
  lblSize: 13,
  regionIcon: KARTO_CONFIG.regionIcon || '',
  regionTitle: KARTO_CONFIG.title || 'Karten-Vorlage',
  mapImages: cleanMapImages(KARTO_CONFIG.images || {}),
  layerNames: cleanLayerNames(KARTO_CONFIG.layerNames || {}),
  extraLayers: cleanExtraLayers(KARTO_CONFIG.extraLayers || []),
  dominions: cleanDominions(KARTO_CONFIG.defaultDominions || []),
  dm: { sessions:[], notes:'', groupStatus:{} },
  markerCatalog: JSON.parse(JSON.stringify(KARTO_CONFIG.defaultMarkerCatalog || DEFAULT_MARKER_CATALOG)),
};
let editMode=false, addingPin=false;
let imgW=0, imgH=0;
let vx=0, vy=0, vz=1;
// mapReady no longer needed - permanent RAF loop handles canvas sync
let scrollPinId=null;
let saveTimer=null, ignRemote=false;

function announceStateChange(reason){
  window.dispatchEvent(new CustomEvent('aleria:karto:state-changed', {
    detail: {
      mapId: KARTO_CONFIG.mapId,
      reason,
    },
  }));
}
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
function dominionOf(p){return S.dominions.find(d=>d.id===p.dominionId)||null;}
// [topmost ancestor, ..., dominion] - e.g. [Baronie Gwendolyns Ufer, Herrschaft der Wyrm].
// Capped at 10 hops as a cheap cycle guard (real nesting never goes beyond 2-3).
function dominionChain(dominion){
  const chain=[];
  let current=dominion;
  let guard=0;
  while(current && guard<10){
    chain.unshift(current);
    current=current.parentId?S.dominions.find(d=>d.id===current.parentId):null;
    guard++;
  }
  return chain;
}
let _ht;function hint(m){const e=document.getElementById('hint');e.textContent=m;e.classList.toggle('on',!!m);}
let _tt;function toast(m){const e=document.getElementById('toast');e.textContent=m;e.classList.add('on');clearTimeout(_tt);_tt=setTimeout(()=>e.classList.remove('on'),2800);}

// ═══════════════════════════════════════════
// UNDO — session-only safety net for the most error-prone edit actions
// (Pin verschieben/löschen/setzen). Single-direction stack, no redo,
// cleared on reload - for anything older than the current session, the
// existing Backup-Verlauf (localStorage-Snapshots) is the fallback.
// ═══════════════════════════════════════════
const UNDO_LIMIT = 30;
let undoStack = [];
function pushUndo(label, undoFn){
  undoStack.push({label, undoFn});
  if(undoStack.length > UNDO_LIMIT) undoStack.shift();
  updateUndoButton();
}
function undoLast(){
  const entry = undoStack.pop();
  if(!entry){ toast('Nichts rückgängig zu machen'); updateUndoButton(); return; }
  entry.undoFn();
  renderPins();
  saveD();
  toast('↩ Rückgängig: ' + entry.label);
  updateUndoButton();
}
function updateUndoButton(){
  const btn = document.getElementById('btn-undo');
  if(btn) btn.style.display = (editMode && undoStack.length) ? 'block' : 'none';
}

function applyMapConfig(){
  const cfg=KARTO_CONFIG;
  if(cfg.title && (!S.regionTitle || S.regionTitle==='Karten-Vorlage')) S.regionTitle=cfg.title;
  if(cfg.regionIcon && !S.regionIcon) S.regionIcon=cfg.regionIcon;
  if(!S.mapImages) S.mapImages=cleanMapImages(cfg.images||{});
  applyMapImages();
  applyExtraLayerImages();
  renderLayerButtons();
  if(cfg.documentTitle) document.title=cfg.documentTitle;
}
function applyMapImages(){
  const saved=cleanMapImages(S.mapImages||{});
  const configured=cleanMapImages(KARTO_CONFIG.images||{});
  const sources=window.KartoMapImageSources;
  const effective={
    normal:sources?.select(saved.normal,configured.normal)||saved.normal||configured.normal,
    regions:sources?.select(saved.regions,configured.regions)||saved.regions||configured.regions,
    pins:sources?.select(saved.pins,configured.pins)||saved.pins||configured.pins,
  };
  // Keep the editable state portable. Missing or machine-local legacy paths
  // are healed from the registry, while valid custom URLs stay untouched.
  S.mapImages={
    normal:sources?.toPublicUrl(saved.normal)?saved.normal:(configured.normal||saved.normal),
    regions:sources?.toPublicUrl(saved.regions)?saved.regions:(configured.regions||saved.regions),
    pins:sources?.toPublicUrl(saved.pins)?saved.pins:(configured.pins||saved.pins),
  };
  const normal=document.getElementById('ln');
  const regions=document.getElementById('lr');
  const pins=document.getElementById('lm');
  setMapImageSource(normal,effective.normal||EMPTY_MAP_IMAGE);
  setMapImageSource(regions,effective.regions||EMPTY_LAYER_IMAGE);
  setMapImageSource(pins,effective.pins||EMPTY_LAYER_IMAGE);
}

function setMapImageSource(img,source){
  if(!img)return;
  delete img.dataset.registryFallback;
  img.src=source;
}

function recoverConfiguredMapImage(layer,img){
  const sources=window.KartoMapImageSources;
  const fallback=sources?.configured(layer);
  const recovery=sources?.recoveryUrl(fallback);
  if(!img||!fallback||!recovery||img.dataset.registryFallback===recovery) return false;
  img.dataset.registryFallback=recovery;
  S.mapImages={...cleanMapImages(S.mapImages||{}),[layer]:KARTO_CONFIG.images?.[layer]||fallback};
  img.src=recovery;
  return true;
}
// Beyond the 3 built-in overlay <img>s (#lr/#lm), custom layers get their
// own <img class="ml" data-overlay="extra-<id>"> created on demand here -
// map-view.js's layer toggle functions already treat any [data-overlay]
// element the same way, so nothing else needs to know these weren't in
// the original HTML.
function applyExtraLayerImages(){
  const stageEl=document.getElementById('map-stage');
  if(!stageEl) return;
  const currentIds=new Set(S.extraLayers.map(l=>l.id));
  stageEl.querySelectorAll('img.ml[data-extra-layer]').forEach(img=>{
    if(!currentIds.has(img.dataset.extraLayer)) img.remove();
  });
  const pinLayerEl=document.getElementById('pl');
  S.extraLayers.forEach(layer=>{
    let img=document.getElementById('le-'+layer.id);
    if(!img){
      img=document.createElement('img');
      img.id='le-'+layer.id;
      img.className='ml';
      img.alt='';
      img.draggable=false;
      img.dataset.overlay='extra-'+layer.id;
      img.dataset.extraLayer=layer.id;
      img.style.opacity='0';
      stageEl.insertBefore(img, pinLayerEl);
    }
    img.src=layer.url||EMPTY_LAYER_IMAGE;
  });
}
function renderLayerButtons(){
  const fixed={normal:S.layerNames.normal, regions:S.layerNames.regions, pins:S.layerNames.pins};
  Object.keys(fixed).forEach(key=>{
    const btn=document.getElementById('lb-'+key);
    if(btn) btn.textContent=fixed[key];
  });
  const container=document.getElementById('layer-btns');
  if(!container) return;
  container.querySelectorAll('.lbtn[data-extra-layer]').forEach(btn=>btn.remove());
  S.extraLayers.forEach(layer=>{
    const btn=document.createElement('button');
    btn.className='lbtn';
    btn.id='lb-extra-'+layer.id;
    btn.dataset.action='set-layer';
    btn.dataset.layer='extra-'+layer.id;
    btn.dataset.extraLayer=layer.id;
    btn.textContent=layer.name;
    container.appendChild(btn);
  });
}

// ═══════════════════════════════════════════
function saveD(){
  announceStateChange('local-change');
  clearTimeout(saveTimer);
  saveTimer=setTimeout(persistDraftNow,800);
}

function persistDraftNow(){
  clearTimeout(saveTimer);
  saveTimer=null;
  if(window.backupSave) window.backupSave('Automatisch');
  ignRemote=true;
  return Promise.resolve(window._fb.saveAll(S)).finally(()=>setTimeout(()=>ignRemote=false,5000));
}

window.KartoRuntime = {
  state: () => S,
  isEditMode: () => editMode,
  isAddingPin: () => addingPin,
  setAddingPin(value){ addingPin = value; },
  setMarkerCatalog(items){ S.markerCatalog = items; },
  setCategories(items){ S.cats = items; },
  firstCategoryId(){ return S.cats[0]?.id || 'other'; },
  addPin(pin){ S.pins.push(pin); },
  activeFilter: () => activeFilter,
  setActiveFilter(id){ activeFilter = id; },
  uid,
  esc,
  formatText: fmtText,
  save: saveD,
  flushSave: persistDraftNow,
  toast,
  pushUndo,
  closeModal: closeLMo,
  applyState,
  renderPins,
  openEditorShell,
  renderEditorPreview,
  closeEditorShell,
  mediaLink,
  pinLayer: () => pl,
  pinDisplayOptions(){
    return {dotSize:S.dotSize, labelSize:S.lblSize};
  },
  visiblePins(){
    return S.pins.filter(p => !p.secret || editMode);
  },
  categoryForPin: catOf,
  dominionForPin: dominionOf,
  dominions(){ return S.dominions; },
  dominionChain,
  orderedDominions,
  setLayer(layer){ window.toggleLayer(layer); },
  jumpToPin(id){
    const p=S.pins.find(x=>x.id===id);if(!p||!imgW)return;
    const ww=mapWrap.clientWidth,wh=mapWrap.clientHeight;
    vx=ww/2-p.x*imgW*vz;vy=wh/2-p.y*imgH*vz;this.applyMapTransform();
    window.activateLayer('pins');
    const el=pl.querySelector(`[data-id="${id}"]`);
    if(el){el.style.transition='none';el.style.transform='translate(-50%,-50%) scale(2)';setTimeout(()=>{el.style.transition='';el.style.transform='';},300);}
  },
  openPin(id, mode='view'){
    openSidebar(id, mode);
  },
  openPinEditor(id){
    openSidebar(id, 'edit');
  },
  setMapImageSize(width, height){
    imgW=width;imgH=height;
    stage.style.width=imgW+'px';stage.style.height=imgH+'px';
  },
  mapImageSize(){
    return {width:imgW, height:imgH};
  },
  recoverConfiguredMapImage,
  mapViewportSize(){
    return {width:mapWrap.clientWidth, height:mapWrap.clientHeight};
  },
  mapTransform(){
    return {x:vx, y:vy, z:vz};
  },
  viewportPointFromClient(clientX, clientY){
    const rect=mapWrap.getBoundingClientRect();
    return {x:clientX-rect.left, y:clientY-rect.top};
  },
  mapPointFromClient(clientX, clientY){
    const point=this.viewportPointFromClient(clientX, clientY);
    return {x:(point.x-vx)/vz, y:(point.y-vy)/vz};
  },
  normalizedMapPointFromClient(clientX, clientY){
    const point=this.mapPointFromClient(clientX, clientY);
    return {x:point.x/imgW, y:point.y/imgH};
  },
  setMapTransform(x, y, z){
    vx=x;vy=y;vz=z;this.applyMapTransform();
  },
  applyMapTransform(){
    stage.style.transform=`translate(${vx}px,${vy}px) scale(${vz})`;
  },
  translateMap(dx, dy){
    vx+=dx;vy+=dy;this.applyMapTransform();
  },
  zoomMapAt(sx, sy, factor){
    const nextZ=Math.max(.05,Math.min(vz*factor,15));
    const actualFactor=nextZ/vz;
    vz=nextZ;vx=sx-(sx-vx)*actualFactor;vy=sy-(sy-vy)*actualFactor;this.applyMapTransform();
  },
  zoomMapAtCenter(factor){
    this.zoomMapAt(mapWrap.clientWidth/2, mapWrap.clientHeight/2, factor);
  },
  fitMapView(){
    window.fitView();
  },
  renderMapContent(){
    renderPins();renderCatBar();window.KartoLsbCanvas.draw();
  },
  travelGroups(){
    return lsbS.groups || [];
  },
  travelIconSize(){
    return lsbIconSize || 22;
  },
  travelScale(){
    return lsbS.calScale;
  },
  travelEventInfo(){
    return LSB_EV_INFO;
  },
  formatTravelHours(hours){
    return lsbFmtH(hours);
  },
  calcTravelRoute(group){
    return lsbCalcRoute(group);
  },
  ensureToolsSidebarOpen(){
    if(!document.getElementById('lsb').classList.contains('lopen')) toggleLsb();
  },
  lsbState(){
    return lsbS;
  },
  selectedTravelGroup(){
    return lsbSelGid;
  },
  travelMode(){
    return lsbMode;
  },
  isRouteDrawing(){
    return lsbRouteDrawing;
  },
  liveTravelMouse(){
    return lsbLiveMouse;
  },
  travelDragState(){
    return window.KartoLsbInteraction?.dragState() || {groupId:null, waypointIndex:-1, ready:false, moved:false};
  },
  setSelectedTravelGroup(id){
    lsbSelGid=id;
  },
  setTravelMode(mode){
    lsbMode=mode;
  },
  setRouteDrawing(value){
    lsbRouteDrawing=value;
  },
  setLiveTravelMouse(point){
    lsbLiveMouse=point;
  },
  drawTravelLayer(){
    window.KartoLsbCanvas.draw();
  },
  updateTravelResult(){
    lsbUpdResult();
  },
  saveTravel(){
    lsbSave();
  },
  startTravelRaf(){
    lsbStartRaf();
  },
  preloadTravelIcons(){
    lsbPreloadIcons();
  },
  openTravelGroupModal(id){
    window.KartoLsbModals.openGroupModal(id);
  },
  openWaypointModal(groupId, waypointIndex){
    window.KartoLsbModals.openWaypointModal(groupId, waypointIndex);
  },
};

function applyState(remote){
  if(remote.pins)       S.pins=remote.pins;
  if(remote.cats)       S.cats=remote.cats;
  if(remote.dotSize)    S.dotSize=remote.dotSize;
  if(remote.lblSize)    S.lblSize=remote.lblSize;
  if(remote.regionIcon!==undefined) S.regionIcon=remote.regionIcon;
  if(remote.regionTitle) S.regionTitle=remote.regionTitle;
  if(remote.mapImages) S.mapImages=cleanMapImages(remote.mapImages);
  if(remote.layerNames) S.layerNames=cleanLayerNames(remote.layerNames);
  if(Array.isArray(remote.extraLayers)) S.extraLayers=cleanExtraLayers(remote.extraLayers);
  if(Array.isArray(remote.dominions)) S.dominions=cleanDominions(remote.dominions);
  if(remote.dm)         {S.dm=remote.dm;S.dm.sessions=S.dm.sessions||[];S.dm.groupStatus=S.dm.groupStatus||{};}
  if(remote.markerCatalog?.length) S.markerCatalog=remote.markerCatalog;
  applyMapImages();
  applyExtraLayerImages();
  renderLayerButtons();
  applySizes();
  applyRegionMeta();
  renderPins();
  renderCatBar();
  lsbLoad(remote);
  window.KartoDmTools?.load();
  window.resetLayers?.();
  announceStateChange('loaded-state');
}
function applySizes(){
  const ds=document.getElementById('dot-sl'), ls=document.getElementById('lbl-sl');
  if(ds){ds.value=S.dotSize;document.getElementById('dot-sl-val').textContent=S.dotSize;}
  if(ls){ls.value=S.lblSize;document.getElementById('lbl-sl-val').textContent=S.lblSize;}
  // Update placement cursor size
  pc.style.width=S.dotSize+'px';pc.style.height=S.dotSize+'px';
}
function applyRegionMeta(){
  // Title
  const t=document.getElementById('title');
  if(t) t.textContent=S.regionTitle||'Karten-Vorlage';
  document.title=(S.regionTitle||'Karten-Vorlage')+' — Kartograph';
  // Icon
  const iw=document.getElementById('region-icon-wrap');
  if(S.regionIcon){
    iw.innerHTML=`<img src="${esc(S.regionIcon)}" alt="Icon" onerror="this.parentElement.innerHTML='🗺';this.parentElement.classList.remove('has-img')"/>`;
    iw.classList.add('has-img');
  } else {
    iw.innerHTML='🗺';
    iw.classList.remove('has-img');
  }
}

// Permanent travel canvas loop is owned by KartoLsbCanvas.

// ═══════════════════════════════════════════
// PRESENTATION MODE — for screen-sharing with players: hides the whole
// DM-only chrome (Toolbar, Kategorie-Leiste, Reise-Werkzeuge-Tab), leaves
// just the map + pins. Secret pins already stay hidden outside edit mode,
// so nothing extra to filter here. Pure UI state, not saved.
// ═══════════════════════════════════════════
let presentationMode = false;
function togglePresentationMode(){
  presentationMode = !presentationMode;
  document.body.classList.toggle('presentation-mode', presentationMode);
  // The map viewport just grew/shrank (topbar appeared/disappeared) - refit
  // so it isn't left cropped or oddly offset.
  window.fitView?.();
}

// ═══════════════════════════════════════════
// EDIT MODE
// ═══════════════════════════════════════════
function toggleEdit(){editMode?exitEdit():enterEdit();}
function exitEdit(){
  editMode=false;addingPin=false;
  document.getElementById('btn-edit').textContent='🔒 Bearbeiten';
  document.getElementById('btn-edit').classList.remove('on');
  document.getElementById('lock-lbl').textContent='gesperrt';
  document.getElementById('btn-add').style.display='none';
  document.getElementById('btn-stamp').style.display='none';
  document.getElementById('btn-overwrite').style.display='none';
  // btn-map-images/btn-publish only exist on the registry-driven karte.html
  // shell, not on the legacy standalone CeltigernsWachtKarte.html/KartenTemplate.html.
  const btnMapImages=document.getElementById('btn-map-images');if(btnMapImages)btnMapImages.style.display='none';
  document.getElementById('btn-export').style.display='none';
  const btnPublish=document.getElementById('btn-publish');if(btnPublish)btnPublish.style.display='none';
  document.getElementById('dm-btn-wrap').style.display='none';
  document.getElementById('dm-panel').style.display='none';
  document.getElementById('dot-sl-wrap').style.display='none';
  document.getElementById('lbl-sl-wrap').style.display='none';
  const t=document.getElementById('title');t.classList.remove('editable');t.title='';
  const iw=document.getElementById('region-icon-wrap');iw.classList.remove('editable');iw.title='';
  mapWrap.style.cursor='grab';hint('');renderPins();
  clearSelection();
  updateUndoButton();
}
function enterEdit(){
  editMode=true;
  document.getElementById('btn-edit').textContent='🔓 Editormodus';
  document.getElementById('btn-edit').classList.add('on');
  document.getElementById('lock-lbl').textContent='aktiv';
  document.getElementById('btn-add').style.display='block';
  document.getElementById('btn-stamp').style.display='block';
  document.getElementById('btn-overwrite').style.display='block';
  const btnMapImages=document.getElementById('btn-map-images');if(btnMapImages)btnMapImages.style.display='block';
  document.getElementById('btn-export').style.display='block';
  const btnPublish=document.getElementById('btn-publish');
  if(btnPublish)btnPublish.style.display=window.KartoPublish?.isConfigured() ? 'block' : 'none';
  document.getElementById('dm-btn-wrap').style.display='block';
  document.getElementById('dot-sl-wrap').style.display='flex';
  document.getElementById('lbl-sl-wrap').style.display='flex';
  const t=document.getElementById('title');t.classList.add('editable');t.title='Klicken zum Bearbeiten';
  const iw=document.getElementById('region-icon-wrap');iw.classList.add('editable');iw.title='Klicken um Icon zu setzen';
  mapWrap.style.cursor='grab';
  renderPins();toast('✓ Editormodus aktiviert');
  updateUndoButton();
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
  S.regionTitle=v;t.textContent=v;document.title=v+' — Kartograph';
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
// MAP IMAGE LINKS
// ═══════════════════════════════════════════
function openMapImagesModal(){
  if(!editMode)return;
  const imgs=cleanMapImages(S.mapImages||{});
  document.getElementById('mapimg-normal').value=imgs.normal;
  document.getElementById('mapimg-regions').value=imgs.regions;
  document.getElementById('mapimg-pins').value=imgs.pins;
  document.getElementById('layername-normal').value=S.layerNames.normal;
  document.getElementById('layername-regions').value=S.layerNames.regions;
  document.getElementById('layername-pins').value=S.layerNames.pins;
  renderExtraLayerRows();
  document.getElementById('mapimg-mo').classList.add('open');
  setTimeout(()=>document.getElementById('mapimg-normal').focus(),60);
}
function saveMapImages(){
  if(!editMode){toast('⚠ Editormodus erforderlich');return;}
  const next=cleanMapImages({
    normal: document.getElementById('mapimg-normal').value,
    regions: document.getElementById('mapimg-regions').value,
    pins: document.getElementById('mapimg-pins').value,
  });
  if(!next.normal){toast('⚠ Kartenbild fehlt');return;}
  S.mapImages=next;
  S.layerNames=cleanLayerNames({
    normal: document.getElementById('layername-normal').value,
    regions: document.getElementById('layername-regions').value,
    pins: document.getElementById('layername-pins').value,
  });
  applyMapImages();
  renderLayerButtons();
  saveD();
  closeLMo('mapimg-mo');
  toast('✓ Kartenbilder gespeichert');
}
function clearMapImages(){
  if(!editMode){toast('⚠ Editormodus erforderlich');return;}
  S.mapImages=cleanMapImages({});
  applyMapImages();
  saveD();
  closeLMo('mapimg-mo');
  toast('Kartenbilder geleert');
}

// ═══════════════════════════════════════════
// EXTRA LAYERS — optional user-defined overlays beyond Karte/Regionen/Markierungen
// ═══════════════════════════════════════════
function renderExtraLayerRows(){
  const wrap=document.getElementById('extra-layers-list');
  if(!wrap) return;
  if(!S.extraLayers.length){
    wrap.innerHTML=`<div style="font-family:'EB Garamond',serif;font-size:.85rem;color:var(--ink3);font-style:italic;">Noch keine weiteren Ebenen.</div>`;
    return;
  }
  wrap.innerHTML=S.extraLayers.map(layer=>`
    <div style="display:flex;gap:.4rem;align-items:flex-end;margin-bottom:.5rem;">
      <div style="flex:1;min-width:90px;">
        <label class="lml" style="margin-bottom:2px;">Name</label>
        <input class="e-inp" data-input-action="rename-extra-layer" data-layer-id="${esc(layer.id)}" value="${esc(layer.name)}" placeholder="z.B. Handelsrouten"/>
      </div>
      <div style="flex:2;min-width:140px;">
        <label class="lml" style="margin-bottom:2px;">Bild-URL <em style="opacity:.7">oder</em> Datei</label>
        <div style="display:flex;gap:.3rem;">
          <input class="e-inp" data-input-action="set-extra-layer-url" data-layer-id="${esc(layer.id)}" value="${esc(layer.url)}" placeholder="https://i.imgur.com/...png" style="width:100%;"/>
          <label class="s-btn s-cancel" style="flex-shrink:0;height:34px;display:flex;align-items:center;cursor:pointer;margin:0;">📁
            <input type="file" accept="image/png,image/jpeg,image/webp" data-file-action="extra-layer-upload" data-layer-id="${esc(layer.id)}" style="display:none;"/>
          </label>
        </div>
      </div>
      <button class="s-btn s-del" style="flex-shrink:0;height:34px;" data-action="delete-extra-layer" data-layer-id="${esc(layer.id)}" title="Ebene löschen">🗑</button>
    </div>`).join('');
}
function addExtraLayer(){
  if(!editMode){toast('⚠ Editormodus erforderlich');return;}
  S.extraLayers.push({id:uid(), name:`Ebene ${S.extraLayers.length+1}`, url:''});
  applyExtraLayerImages();
  renderLayerButtons();
  renderExtraLayerRows();
  saveD();
  toast('✓ Ebene hinzugefügt — benennen & Bild hinterlegen');
}
function renameExtraLayer(layerId, name){
  const layer=S.extraLayers.find(l=>l.id===layerId);
  if(!layer) return;
  layer.name=String(name||'').trim()||'Ebene';
  renderLayerButtons();
  saveD();
}
function setExtraLayerUrl(layerId, url){
  const layer=S.extraLayers.find(l=>l.id===layerId);
  if(!layer) return;
  layer.url=String(url||'').trim();
  applyExtraLayerImages();
  saveD();
}
async function uploadExtraLayerImage(layerId, file){
  const layer=S.extraLayers.find(l=>l.id===layerId);
  if(!layer) return;
  if(!window.KartoPublish?.stageImage){toast('⚠ Upload nicht verfügbar');return;}
  try{
    const dataUrl=await window.KartoPublish.stageImage(file);
    layer.url=dataUrl;
    applyExtraLayerImages();
    renderExtraLayerRows();
    saveD();
    toast('✓ Ebenenbild geladen');
  } catch(error){
    toast('⚠ '+(error?.message||'Datei konnte nicht geladen werden'));
  }
}
function deleteExtraLayer(layerId){
  const layer=S.extraLayers.find(l=>l.id===layerId);
  S.extraLayers=S.extraLayers.filter(l=>l.id!==layerId);
  document.getElementById('le-'+layerId)?.remove();
  window.deactivateLayer('extra-'+layerId);
  renderLayerButtons();
  renderExtraLayerRows();
  saveD();
  toast('🗑 Ebene "'+(layer?.name||'')+'" entfernt');
}

// ═══════════════════════════════════════════
// HERRSCHAFTEN/BARONIEN — welche Pins gehoeren zu welcher Herrschaft
// ═══════════════════════════════════════════
function openDominionManager(){
  renderDominionRows();
  document.getElementById('dominion-mo').classList.add('open');
}
// Top-level dominions first, each immediately followed by its own children
// (recursively) - so a Baronie and its ritterfürstlichen Herrschaften stay
// visually grouped instead of scattered in creation order.
function orderedDominions(){
  const byParent=new Map();
  S.dominions.forEach(d=>{
    const key=d.parentId||'';
    if(!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(d);
  });
  const result=[];
  (function walk(parentId, depth){
    (byParent.get(parentId)||[]).forEach(d=>{
      result.push({dominion:d, depth});
      walk(d.id, depth+1);
    });
  })('', 0);
  return result;
}
function renderDominionRows(){
  const wrap=document.getElementById('dominion-list');
  if(!wrap) return;
  if(!S.dominions.length){
    wrap.innerHTML=`<div style="font-family:'EB Garamond',serif;font-size:.85rem;color:var(--ink3);font-style:italic;padding:.4rem 0;">Noch keine Herrschaften angelegt.</div>`;
    return;
  }
  wrap.innerHTML=orderedDominions().map(({dominion:d, depth})=>`
    <div class="dom-card" style="margin-left:${depth*1.3}rem;${depth?'border-left:2px solid var(--gold);':''}">
      <div style="display:flex;gap:.4rem;">
        <div style="flex:2;min-width:140px;">
          <label class="lml" style="margin-bottom:2px;">Name</label>
          <input class="e-inp" data-input-action="set-dominion-field" data-dominion-id="${esc(d.id)}" data-dominion-field="name" value="${esc(d.name)}" placeholder="z.B. Herrschaft der Wyrm"/>
        </div>
        <div style="flex:1;min-width:90px;">
          <label class="lml" style="margin-bottom:2px;">Typ</label>
          <input class="e-inp" data-input-action="set-dominion-field" data-dominion-id="${esc(d.id)}" data-dominion-field="type" value="${esc(d.type)}" placeholder="Baronie…"/>
        </div>
      </div>
      <div style="margin-top:.35rem;">
        <label class="lml" style="margin-bottom:2px;">Übergeordnete Herrschaft <span style="font-family:'EB Garamond',serif;font-style:italic;opacity:.7;">(optional – z.B. die Baronie, in der diese Herrschaft liegt)</span></label>
        <select class="e-sel" data-input-action="set-dominion-field" data-dominion-id="${esc(d.id)}" data-dominion-field="parentId">
          <option value="">— Keine (oberste Ebene) —</option>
          ${S.dominions.filter(other=>other.id!==d.id).map(other=>`<option value="${esc(other.id)}"${d.parentId===other.id?' selected':''}>${esc(other.name)}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:.4rem;margin-top:.35rem;align-items:flex-end;">
        <div style="flex:1;min-width:90px;">
          <label class="lml" style="margin-bottom:2px;">Sitz</label>
          <input class="e-inp" data-input-action="set-dominion-field" data-dominion-id="${esc(d.id)}" data-dominion-field="seat" value="${esc(d.seat)}"/>
        </div>
        <div style="flex:1;min-width:110px;">
          <label class="lml" style="margin-bottom:2px;">Herrscher/Haus</label>
          <input class="e-inp" data-input-action="set-dominion-field" data-dominion-id="${esc(d.id)}" data-dominion-field="ruler" value="${esc(d.ruler)}"/>
        </div>
        <button class="s-btn s-del" style="flex-shrink:0;height:34px;" data-action="delete-dominion" data-dominion-id="${esc(d.id)}" title="Herrschaft löschen">🗑</button>
      </div>
      <div style="margin-top:.35rem;">
        <label class="lml" style="margin-bottom:2px;">Notiz</label>
        <input class="e-inp" data-input-action="set-dominion-field" data-dominion-id="${esc(d.id)}" data-dominion-field="note" value="${esc(d.note)}" placeholder="optional"/>
      </div>
    </div>`).join('');
}
function addDominion(){
  if(!editMode){toast('⚠ Editormodus erforderlich');return;}
  S.dominions.push({id:uid(), name:'Neue Herrschaft', type:'', ruler:'', seat:'', note:'', parentId:''});
  renderDominionRows();
  saveD();
  toast('✓ Herrschaft hinzugefügt — benennen');
}
function setDominionField(id, field, value){
  if(!['name','type','ruler','seat','note','parentId'].includes(field)) return;
  const dominion=S.dominions.find(x=>x.id===id);
  if(!dominion) return;
  if(field==='parentId' && value===id) return; // no self-parenting
  dominion[field]=String(value||'');
  saveD();
  // Hierarchy/indent + every card's "available parent" list depend on this -
  // a plain text field doesn't need the whole list re-rendered, parentId does.
  if(field==='parentId') renderDominionRows();
}
function deleteDominion(id){
  if(!editMode){toast('⚠ Editormodus erforderlich');return;}
  const dominion=S.dominions.find(x=>x.id===id);
  if(!dominion) return;
  if(!confirm('Herrschaft "'+dominion.name+'" wirklich löschen? Zugewiesene Pins verlieren die Zuordnung.')) return;
  S.dominions=S.dominions.filter(x=>x.id!==id);
  // Untergeordnete Herrschaften nicht mitloeschen - sie ruecken stattdessen
  // eine Ebene hoch, statt in einem toten parentId-Verweis zu verschwinden.
  S.dominions.forEach(d=>{ if(d.parentId===id) d.parentId=''; });
  let cleared=0;
  S.pins.forEach(p=>{ if(p.dominionId===id){ p.dominionId=''; cleared++; } });
  renderDominionRows();
  saveD();
  toast('🗑 Herrschaft "'+dominion.name+'" entfernt'+(cleared?` (${cleared} Pin(s) ohne Zuordnung)`:''));
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
  window.KartoPinRenderer?.renderPins();
}
function clearSelection(){
  window.KartoPinRenderer?.clearSelection();
}

document.getElementById('stamp-mo').addEventListener('click',e=>{if(e.target===document.getElementById('stamp-mo'))closeLMo('stamp-mo');});

// ═══════════════════════════════════════════
// MAP INTERACTION
// ═══════════════════════════════════════════
mapWrap.addEventListener('mousedown',e=>{
  if(window.KartoMapInteraction.isAuxPanButton(e.button)){window.KartoPanning.start(e.clientX,e.clientY);e.preventDefault();return;}
  if(!window.KartoMapInteraction.canPrimaryPan({
    button:e.button,
    addingPin,
    draggingPin:!!window.KartoPinRenderer?.isDragging(),
    stamping:!!window.KartoStampOverwrite?.isStamping()
  }))return;
  // don't start pan if clicking on a waypoint marker
  const _mp=window.KartoRuntime.mapPointFromClient(e.clientX,e.clientY);
  if(lsbMode==='pan'&&window.KartoLsbCanvas.hitWaypoint(_mp.x,_mp.y))return;
  window.KartoPanning.start(e.clientX,e.clientY);
});
mapWrap.addEventListener('mousemove',e=>{
  if(addingPin) window.KartoMapInteraction.movePlacementCursor(e.clientX,e.clientY);
  if(window.KartoStampOverwrite?.isStamping()) window.KartoMapInteraction.moveStampCursor(e.clientX,e.clientY);
  if(window.KartoPinRenderer?.isDragging()){
    window.KartoPinRenderer.moveDrag(e.clientX,e.clientY);
    return;
  }
  if(window.KartoPanning.isActive()) window.KartoPanning.move(e.clientX,e.clientY);
});
mapWrap.addEventListener('mouseup',()=>{
  window.KartoPinRenderer?.stopDrag({save:true, rerender:true});
  window.KartoPanning.stop();
  if(!addingPin)window.KartoMapInteraction.resetCursor();
});
mapWrap.addEventListener('mouseleave',()=>{if(addingPin)window.KartoMapInteraction.hidePlacementCursor();window.KartoPinRenderer?.hideTooltip();});
mapWrap.addEventListener('mouseenter',()=>{if(addingPin)window.KartoMapInteraction.showPlacementCursor();});
mapWrap.addEventListener('click',e=>{
  const mp=window.KartoRuntime.mapPointFromClient(e.clientX,e.clientY);
  const mx=mp.x, my=mp.y;
  if(window.KartoStampOverwrite?.isStamping()){window.placeStamp(mx,my);return;}
  if(addingPin){placePin(mx,my);}
});
mapWrap.addEventListener('contextmenu',e=>e.preventDefault());
// Touch
let td=0;
mapWrap.addEventListener('touchstart',e=>{if(e.touches.length===2)td=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(e.touches.length===1){window.KartoPanning.start(e.touches[0].clientX,e.touches[0].clientY);}},{passive:true});
mapWrap.addEventListener('touchmove',e=>{
  if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);const f=d/td;const cx=(e.touches[0].clientX+e.touches[1].clientX)/2,cy=(e.touches[0].clientY+e.touches[1].clientY)/2;const vp=window.KartoRuntime.viewportPointFromClient(cx,cy);window.KartoRuntime.zoomMapAt(vp.x,vp.y,f);td=d;}
  else if(window.KartoPanning.isActive()) window.KartoPanning.move(e.touches[0].clientX,e.touches[0].clientY);
},{passive:true});
mapWrap.addEventListener('touchend',()=>window.KartoPanning.stop(),{passive:true});

// ═══════════════════════════════════════════
// SIDEBAR / FULLSCREEN EDITOR
// ═══════════════════════════════════════════
const EDITOR_SPLIT_KEY='karto-editor-split-width';

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
      <div class="pin-editor-header-actions" id="sb-header-actions" hidden>
        <span class="pin-editor-status" id="sb-editor-status">Keine offenen Eingaben</span>
        <button class="pin-editor-publish" id="sb-publish" data-action="save-and-publish-pin">Übernehmen &amp; auf GitHub veröffentlichen</button>
      </div>
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
  bindEditorResizer();
}

function openEditorShell(kind,id){
  bindEditorResizer();
  const sidebar=document.getElementById('sidebar');
  restoreEditorSplitWidth();
  sidebar.classList.add('editor-fullscreen');
  sidebar.dataset.editorKind=kind;
  sidebar.dataset.editorId=id;
  renderEditorPreview();
}

function closeEditorShell(){
  const sidebar=document.getElementById('sidebar');
  sidebar.classList.remove('open','editor-fullscreen');
  delete sidebar.dataset.editorKind;
  delete sidebar.dataset.editorId;
  resetSidebarFrame();
}

function renderEditorPreview(pinOverride){
  const sidebar=document.getElementById('sidebar');
  const content=document.getElementById('sb-preview-content');
  if(!sidebar||!content||!sidebar.classList.contains('editor-fullscreen'))return;
  const id=sidebar.dataset.editorId;
  const pin=pinOverride || S.pins.find(item=>item.id===id);
  if(!pin){content.innerHTML='<div class="editor-preview-empty">Kein Pin gewaehlt.</div>';return;}
  const category=catOf(pin);
  const affiliations=[];
  const dominion=dominionOf(pin);
  if(dominion) affiliations.push({label:dominion.type || 'Herrschaft', value:dominionChain(dominion).map(x=>x.name).join(' → ')});
  if(pin.region) affiliations.push({label:'Region', value:pin.region});
  if(pin.house) affiliations.push({label:'Herrschaft/Haus', value:pin.house});
  if(pin.faction) affiliations.push({label:'Fraktion', value:pin.faction});
  const rgb=hexToRgb(category.color||'#8a6510');
  const rows=(pin.table||[]).filter(row=>row.k||row.v);
  const previewImage=window.KartoPinPlaceholders?.resolve(pin) || {
    src:pin.img||'',
    link:pin.imgLink||'',
  };
  content.innerHTML=`
    <div class="editor-preview-card">
      <div class="sv-header">
        <div class="sv-crest-wrap">
          <div class="sv-crest">
            ${pin.crest
              ? mediaLink(`<img src="${esc(pin.crest)}" onerror="this.parentElement.innerHTML='🏰'"/>`, pin.crestLink)
              : `<span style="opacity:.3;font-size:2rem">🏰</span>`}
          </div>
        </div>
        ${category.marker ? `<div class="sv-marker-icon" title="${esc(category.label)}"><img src="${esc(category.marker)}" onerror="this.style.display='none'"/></div>` : ''}
        <div class="sv-header-col">
          <div class="sv-title">${esc(pin.title||'Unbekannter Ort')}</div>
          <div class="sv-subtitle-row">
            <span class="sv-cat-badge" style="color:${category.color};border-color:${category.color}88;background:rgba(${rgb.r},${rgb.g},${rgb.b},.15);">
              ${pin.pinMarker
                ? `<img src="${esc(pin.pinMarker)}" style="width:14px;height:17px;object-fit:contain;flex-shrink:0;" onerror="this.style.display='none'"/>`
                : `<span style="width:7px;height:7px;border-radius:50%;background:${category.color};display:inline-block;flex-shrink:0;"></span>`}
              ${esc(category.label)}
            </span>
            ${pin.secret ? `<span class="sv-secret-badge">Geheim</span>` : ''}
          </div>
          ${affiliations.length ? `<div class="sv-affils">
            ${affiliations.map(item=>`<span class="sv-affil"><span class="sv-affil-lbl">${esc(item.label)}</span> ${esc(item.value)}</span>`).join('')}
          </div>` : ''}
        </div>
        ${pin.banner ? `<div class="sv-banner">${mediaLink(`<img src="${esc(pin.banner)}" onerror="this.parentElement.style.display='none'" title="Regionsbanner"/>`, pin.bannerLink)}</div>` : ''}
      </div>

      ${(previewImage.src||rows.length) ? `
      <div class="sv-body">
        <div class="sv-img-wrap">
          <div class="sv-img">
            ${previewImage.src
              ? mediaLink(`<img src="${esc(previewImage.src)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
                 <div class="sv-img-ph" style="display:none">Bild</div>`, previewImage.link)
              : `<div class="sv-img-ph">Bild</div>`}
          </div>
        </div>
        <div class="sv-col">
          ${rows.length ? `<table class="sv-table">${rows.map(row=>`<tr><td>${esc(row.k)}</td><td>${esc(row.v)}</td></tr>`).join('')}</table>` : ''}
        </div>
      </div>` : ''}

      ${pin.text ? `<div class="sv-lore"><div class="sv-text">${fmtText(pin.text)}</div></div>` : ''}
    </div>`;
}

function hexToRgb(hex){
  const clean=(hex||'#8a6510').replace('#','');
  const normalized=clean.length===3?clean.split('').map(char=>char+char).join(''):clean.padEnd(6,'0').slice(0,6);
  const r=parseInt(normalized.slice(0,2),16);
  const g=parseInt(normalized.slice(2,4),16);
  const b=parseInt(normalized.slice(4,6),16);
  return {
    r:Number.isNaN(r)?138:r,
    g:Number.isNaN(g)?101:g,
    b:Number.isNaN(b)?16:b,
  };
}

function openSidebar(id, mode){
  const p=S.pins.find(x=>x.id===id);if(!p)return;
  if(mode==='edit'){
    window.KartoPinEditor?.open(id);
  } else {
    window.KartoPinDetailView?.open(id);
  }
}
function closeSidebar(){
  if(window.KartoPinEditor?.isOpen?.()) return window.KartoPinEditor.close();
  closeEditorShell();
  return true;
}
function closeScroll(){
  window.KartoPinDetailView?.close();
}

// openScroll alias for legacy calls
function openScroll(id,mode){openSidebar(id,mode);}

// ═══════════════════════════════════════════
// TEXT FORMATTING
// ═══════════════════════════════════════════
function askDel(id){
  if(!editMode){toast('⚠ Editormodus erforderlich');return;}
  const index=S.pins.findIndex(x=>x.id===id);
  if(index===-1)return;
  const p=S.pins[index];
  if(!confirm('Pin "'+(p?.title||id)+'" wirklich löschen?'))return;
  S.pins.splice(index,1);
  pushUndo('Pin gelöscht: '+p.title, () => { S.pins.splice(index,0,p); });
  closeScroll();
  if(window.KartoPinEditor?.isOpen?.()) window.KartoPinEditor.close({force:true});
  else closeSidebar();
  renderPins();saveD();toast('Pin gelöscht');
}

function fmtText(t){
  if(!t)return'';
  let h=esc(t);
  h=h.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  h=h.replace(/\*(.+?)\*/g,'<em>$1</em>');
  h=h.replace(/---/g,'<hr style="border:none;border-top:1px solid rgba(100,70,20,.2);margin:.38rem 0"/>');
  // [URL=https://...]Linktext[/URL]
  h=h.replace(/\[URL=([^\]]+)\]([\s\S]*?)\[\/URL\]/gi,(m,url,txt)=>{
    const safeUrl=url.replace(/"/g,'%22');
    return `<a href="${safeUrl}" target="_blank" rel="noopener" style="color:var(--gold);text-decoration:underline;text-underline-offset:2px;font-style:normal;">${txt}</a>`;
  });
  h=h.split(/\n\n+/).map(p=>`<p>${p.replace(/\n/g,'<br/>')}</p>`).join('');
  return h;
}

// ═══════════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════════
document.addEventListener('keydown',e=>{
  const inF=['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName);
  if(e.key==='Escape'){
    if(presentationMode){togglePresentationMode();return;}
    if(window.KartoStampOverwrite?.isOverwriteActive()){window.stopOverwrite();return;}
    if(window.KartoStampOverwrite?.isStamping()){window.stopStamp();return;}
    if(addingPin){addingPin=false;window.KartoMapInteraction.resetCursor();window.KartoMapInteraction.hidePlacementCursor();hint('');return;}
    clearSelection();
    closeScroll();closeSidebar();
    document.getElementById('catmgr-mo').classList.remove('open');
    document.getElementById('icon-mo').classList.remove('open');
  }
  if(!inF&&(e.key==='z'||e.key==='Z')&&(e.ctrlKey||e.metaKey)&&editMode){e.preventDefault();undoLast();}
  if(inF)return;
  if(e.key==='e'&&editMode)startAdd();
  if(e.key==='1')window.toggleLayer('normal');
  if(e.key==='2')window.toggleLayer('regions');
  if(e.key==='3')window.toggleLayer('pins');
});
document.getElementById('scroll-mo').addEventListener('click',e=>{if(e.target===document.getElementById('scroll-mo'))closeScroll();});
document.getElementById('catmgr-mo').addEventListener('click',e=>{if(e.target===document.getElementById('catmgr-mo'))closeCatMgr();});
document.getElementById('icon-mo').addEventListener('click',e=>{if(e.target===document.getElementById('icon-mo'))closeIconModal();});

// ═══════════════════════════════════════════
// LEFT SIDEBAR — WERKZEUGE
// ═══════════════════════════════════════════
const LSB_TM=window.KartoLsbConfig.travelModes;
const LSB_ICONS=window.KartoLsbConfig.icons;
const LSB_COLORS=window.KartoLsbConfig.colors;
const LSB_EV_TYPES=window.KartoLsbConfig.eventTypes;
const LSB_EV_INFO=window.KartoLsbConfig.eventInfo;
const lsbGetTm=window.KartoLsbCalculations.getTravelMode;

// State
let lsbS={groups:[],calScale:null,iconSize:22};
let lsbIconSize=22;
let lsbMode='pan';
let lsbSelGid=null,lsbRouteDrawing=false,lsbLiveMouse=null;

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
  lsbPreloadIcons();window.KartoLsbTools.updateCalibrationUi();lsbRenderGroups();lsbUpdResult();
  // No explicit draw call needed — KartoLsbCanvas owns the permanent canvas loop.
}
function lsbFmtH(h){return window.KartoLsbCalculations.formatHours(h);}
function lsbSetIconSize(v){lsbIconSize=+v;lsbS.iconSize=+v;document.getElementById('lsb-icon-size-val').textContent=v;lsbSave();}
function lsbColorWithOpacity(hex,pct){return window.KartoLsbCalculations.colorWithOpacity(hex,pct);}

// lsbStartRaf() is a no-op now - permanent RAF loop above handles everything
function lsbStartRaf(){}

// Route calculation
function lsbCalcRoute(g){return window.KartoLsbCalculations.calcRoute(g,lsbS.calScale);}
function lsbApplyEv(ev,activeTM){return window.KartoLsbCalculations.applyEvent(ev,activeTM);}

// Result panel
function lsbUpdResult(){
  window.KartoLsbTools.updateMeasureResult();
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
      img.onload=()=>{g._imgEl=img;if(imgW)window.KartoLsbCanvas.draw();};
      img.src=g.icon;
    }
  });
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
function init(){
  applyMapConfig();
  window.resetLayers();mapWrap.style.cursor='grab';
  applySizes();applyRegionMeta();renderCatBar();
  window.KartoLsbCanvas.init();
  window.KartoLsbInteraction.init();
  lsbRenderGroups();lsbUpdResult();
  const go=()=>window._fb.sub(remote=>{if(ignRemote)return;applyState(remote);});
  window._fb?go():window.addEventListener('fb-ready',go,{once:true});
}
window.KartoInit = init;
