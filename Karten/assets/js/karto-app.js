// ═══════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════
const KARTO_CONFIG = window.KARTO_CONFIG || {};
const PASSWORD = '7777';

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
  dm: { sessions:[], notes:'', groupStatus:{} },
  markerCatalog: JSON.parse(JSON.stringify(KARTO_CONFIG.defaultMarkerCatalog || DEFAULT_MARKER_CATALOG)),
};
let editMode=false, addingPin=false;
let imgW=0, imgH=0;
let vx=0, vy=0, vz=1;
// mapReady no longer needed - permanent RAF loop handles canvas sync
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

function applyMapConfig(){
  const cfg=KARTO_CONFIG;
  if(cfg.title && (!S.regionTitle || S.regionTitle==='Karten-Vorlage')) S.regionTitle=cfg.title;
  if(cfg.regionIcon && !S.regionIcon) S.regionIcon=cfg.regionIcon;
  if(!S.mapImages) S.mapImages=cleanMapImages(cfg.images||{});
  applyMapImages();
  if(cfg.documentTitle) document.title=cfg.documentTitle;
}
function applyMapImages(){
  const imgs=cleanMapImages(S.mapImages||KARTO_CONFIG.images||{});
  S.mapImages=imgs;
  const normal=document.getElementById('ln');
  const regions=document.getElementById('lr');
  const pins=document.getElementById('lm');
  if(normal) normal.src=imgs.normal||EMPTY_MAP_IMAGE;
  if(regions) regions.src=imgs.regions||EMPTY_LAYER_IMAGE;
  if(pins) pins.src=imgs.pins||EMPTY_LAYER_IMAGE;
}

// ═══════════════════════════════════════════
function saveD(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>{
    if(window.backupSave) window.backupSave('Automatisch');
    ignRemote=true;
    window._fb.saveAll(S).then(()=>setTimeout(()=>ignRemote=false,5000));
  },800);
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
  toast,
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
  setLayer(layer){ window.setLayer(layer); },
  jumpToPin(id){
    const p=S.pins.find(x=>x.id===id);if(!p||!imgW)return;
    const ww=mapWrap.clientWidth,wh=mapWrap.clientHeight;
    vx=ww/2-p.x*imgW*vz;vy=wh/2-p.y*imgH*vz;this.applyMapTransform();
    window.setLayer('pins');
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
  if(remote.dm)         {S.dm=remote.dm;S.dm.sessions=S.dm.sessions||[];S.dm.groupStatus=S.dm.groupStatus||{};}
  if(remote.markerCatalog?.length) S.markerCatalog=remote.markerCatalog;
  applyMapImages();
  applySizes();
  applyRegionMeta();
  renderPins();
  renderCatBar();
  lsbLoad(remote);
  window.KartoDmTools?.load();
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
// EDIT MODE
// ═══════════════════════════════════════════
function toggleEdit(){editMode?exitEdit():openPw();}
function exitEdit(){
  editMode=false;addingPin=false;
  document.getElementById('btn-edit').textContent='🔒 Bearbeiten';
  document.getElementById('btn-edit').classList.remove('on');
  document.getElementById('lock-lbl').textContent='gesperrt';
  document.getElementById('btn-add').style.display='none';
  document.getElementById('btn-stamp').style.display='none';
  document.getElementById('btn-overwrite').style.display='none';
  document.getElementById('btn-map-images').style.display='none';
  document.getElementById('btn-export').style.display='none';
  document.getElementById('dm-btn-wrap').style.display='none';
  document.getElementById('dm-panel').style.display='none';
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
  document.getElementById('btn-add').style.display='block';
  document.getElementById('btn-stamp').style.display='block';
  document.getElementById('btn-overwrite').style.display='block';
  document.getElementById('btn-map-images').style.display='block';
  document.getElementById('btn-export').style.display='block';
  document.getElementById('dm-btn-wrap').style.display='block';
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
  applyMapImages();
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

function renderEditorPreview(){
  const sidebar=document.getElementById('sidebar');
  const content=document.getElementById('sb-preview-content');
  if(!sidebar||!content||!sidebar.classList.contains('editor-fullscreen'))return;
  const id=sidebar.dataset.editorId;
  const pin=S.pins.find(item=>item.id===id);
  if(!pin){content.innerHTML='<div class="editor-preview-empty">Kein Pin gewaehlt.</div>';return;}
  const category=catOf(pin);
  const affiliations=[];
  if(pin.region) affiliations.push({label:'Region', value:pin.region});
  if(pin.house) affiliations.push({label:'Herrschaft', value:pin.house});
  if(pin.faction) affiliations.push({label:'Fraktion', value:pin.faction});
  const rgb=hexToRgb(category.color||'#8a6510');
  const rows=(pin.table||[]).filter(row=>row.k||row.v);
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

      ${(pin.img||rows.length) ? `
      <div class="sv-body">
        <div class="sv-img-wrap">
          <div class="sv-img">
            ${pin.img
              ? mediaLink(`<img src="${esc(pin.img)}" onerror="this.style.display='none';this.nextSibling.style.display='flex'"/>
                 <div class="sv-img-ph" style="display:none">Bild</div>`, pin.imgLink)
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
  window.KartoPinEditor?.close();
  closeEditorShell();
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
  const p=S.pins.find(x=>x.id===id);
  if(!confirm('Pin "'+(p?.title||id)+'" wirklich löschen?'))return;
  S.pins=S.pins.filter(x=>x.id!==id);
  closeScroll();closeSidebar();
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
    if(window.KartoStampOverwrite?.isOverwriteActive()){window.stopOverwrite();return;}
    if(window.KartoStampOverwrite?.isStamping()){window.stopStamp();return;}
    if(addingPin){addingPin=false;window.KartoMapInteraction.resetCursor();window.KartoMapInteraction.hidePlacementCursor();hint('');return;}
    closeScroll();closeSidebar();closePw();
    document.getElementById('catmgr-mo').classList.remove('open');
    document.getElementById('icon-mo').classList.remove('open');
  }
  if(inF)return;
  if(e.key==='e'&&editMode)startAdd();
  if(e.key==='1')window.setLayer('normal');
  if(e.key==='2')window.setLayer('regions');
  if(e.key==='3')window.setLayer('pins');
});
document.getElementById('scroll-mo').addEventListener('click',e=>{if(e.target===document.getElementById('scroll-mo'))closeScroll();});
document.getElementById('catmgr-mo').addEventListener('click',e=>{if(e.target===document.getElementById('catmgr-mo'))closeCatMgr();});
document.getElementById('icon-mo').addEventListener('click',e=>{if(e.target===document.getElementById('icon-mo'))closeIconModal();});
document.getElementById('pw-mo').addEventListener('click',e=>{if(e.target===document.getElementById('pw-mo'))closePw();});

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
  window.setLayer('normal');mapWrap.style.cursor='grab';
  applySizes();applyRegionMeta();renderCatBar();
  window.KartoLsbCanvas.init();
  window.KartoLsbInteraction.init();
  lsbRenderGroups();lsbUpdResult();
  const go=()=>window._fb.sub(remote=>{if(ignRemote)return;applyState(remote);});
  window._fb?go():window.addEventListener('fb-ready',go,{once:true});
}
window.KartoInit = init;
