import test from 'node:test';
import assert from 'node:assert/strict';
import { mountHousePlacement } from '../house-placement.mjs';
import { createHousePlacementState } from '../placement-state.mjs';
import { createCountryPlacement } from '../../shared/country-placement.mjs';
import { createArtDialogSession } from '../../shared/country-workbench/art-dialog-session.mjs';
import { REGIONS, SETTLEMENTS, createMapProposal } from '../map-data.mjs';

// A DOM boundary that models modal inertness and the separate native close
// event task. It exercises the actual placement controller and dialog session.
function fixture(t, { sharedDefault = false } = {}) {
  const pendingCloseEvents = [], modals = [], blockedFocus = [];
  const document = { activeElement:null };
  function element(parent = null) {
    const listeners = new Map(), selectors = new Map(), classes = new Set();
    const node = {
      parent, ownerDocument:document, isConnected:true, dataset:{}, style:{}, children:[],
      classList:{ add:name => classes.add(name), remove:name => classes.delete(name),
        toggle:(name,on) => on ? classes.add(name) : classes.delete(name) },
      addEventListener(type,handler) {
        const handlers = listeners.get(type) || [];
        handlers.push(handler); listeners.set(type,handlers);
      },
      removeEventListener(type,handler) {
        listeners.set(type,(listeners.get(type) || []).filter(item => item !== handler));
      },
      emit(type,target = node) {
        for (const handler of listeners.get(type) || []) handler({ target });
      },
      querySelector:selector => selectors.get(selector) || null,
      querySelectorAll(selector) {
        if (selector === '.placement-targets') return node.children.filter(child => child.className === 'placement-targets');
        return selectors.get(selector) || [];
      },
      register(selector,child) { selectors.set(selector,child); return child; },
      contains(target) { for (let next = target; next; next = next.parent) if (next === node) return true; return false; },
      append(child) { child.parent = node; node.children.push(child); },
      remove() { node.parent.children = node.parent.children.filter(child => child !== node); node.isConnected = false; },
      closest:selector => selector === 'button[data-action]' || selector === '[data-action]' ? node : null,
      setAttribute() {},
      focus() {
        if (modals.length && !modals.at(-1).contains(node)) { blockedFocus.push(node); return; }
        if (node.isConnected) document.activeElement = node;
      },
      scrollIntoView() { node.scrolled = true; },
    };
    let html = '';
    Object.defineProperty(node,'innerHTML',{
      get:() => html,
      set(value) {
        html = value;
        for (const child of node.children) {
          child.isConnected = false;
          if (document.activeElement === child) document.activeElement = document.body;
        }
        node.children = [];
      },
    });
    Object.defineProperty(node,'options',{ get:() => [...html.matchAll(/<option value="([^"]*)"[^>]*>([^<]*)/g)]
      .map(([,value,textContent]) => ({ value,textContent })) });
    return node;
  }
  function dialog(parent) {
    const node = element(parent);
    node.open = false;
    node.showModal = () => {
      node.nativeTrigger = document.activeElement;
      node.open = true; modals.push(node); node.focus();
    };
    node.close = () => {
      node.open = false; modals.splice(modals.indexOf(node),1);
      node.nativeTrigger?.focus();
      pendingCloseEvents.push(() => node.emit('close'));
    };
    return node;
  }
  const body = document.body = element(), scope = element(body), page = element(body);
  document.activeElement = body;
  document.createElement = () => element();
  const savedGlobals = new Map(['window','document','localStorage'].map(key => [key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  Object.assign(globalThis,{ document,window:{ innerWidth:1200,innerHeight:900,addEventListener() {} },
    localStorage:{ getItem:() => null,setItem() {} } });
  t.after(() => { for (const [key,descriptor] of savedGlobals) {
    if (descriptor) Object.defineProperty(globalThis,key,descriptor); else delete globalThis[key];
  } });

  page.register('[data-role="placement-root"]',scope);
  const mapSection = scope.register('[data-role="map-section"]',element(scope));
  scope.register('#karte',mapSection);
  const mapDialog = scope.register('#map-dialog',dialog(scope));
  const viewport = mapDialog.register('.map-viewport',element(mapDialog));
  const overviewSurface = element(mapSection), largeSurface = element(viewport);
  mapSection.register('[data-role="map-surface"]',[overviewSurface]);
  mapDialog.register('[data-role="map-surface"]',largeSurface);
  scope.register('[data-role="map-surface"]',[overviewSurface,largeSurface]);
  for (const selector of ['[data-role="zoom-label"]','[data-role="map-title"]']) mapDialog.register(selector,element(mapDialog));
  for (const selector of ['#map-caption','[data-action="toggle-names"]']) mapSection.register(selector,element(mapSection));
  for (const selector of ['#clan-tooltip','[data-role="house-select"]','[data-role="seat-select"]',
    '[data-role="unassigned-houses"]','[data-role="unassigned-count"]','[data-role="settlements"]',
    '[data-role="selection-hint"]','[data-action="move-selected"]','[data-action="cancel-selection"]',
    '[data-action="undo"]','[data-role="import-file"]']) scope.register(selector,element(scope));
  const house = { id:'focus-house',name:'Focus House',sourceSeat:SETTLEMENTS[0].id,ready:true,crest:'assets/crest.png' };
  const placement = sharedDefault
    ? createCountryPlacement({ root:scope,onHouse() {},notice() {} },{
      houses:[house],settlements:SETTLEMENTS,storageKey:null,escapeHtml:String,
      createPlacementState:() => createHousePlacementState({ houses:[house],settlements:SETTLEMENTS }),
      createMapProposal:placements => createMapProposal({ houses:[house],placements }),
      houseCard:() => '',renderSeats:() => '',rankLabel:() => '',caption:() => '',
    })
    : mountHousePlacement({ root:page,onHouse() {},notice() {} },{ houses:[house],settlements:SETTLEMENTS,regions:REGIONS });
  const artDialog = dialog(body), content = artDialog.register('[data-role="art-details"]',element(artDialog));
  const session = createArtDialogSession({ dialog:artDialog,onSelect:placement.choose });
  t.after(session.destroy);
  const houseSelect = scope.querySelector('[data-role="house-select"]');
  const button = (parent,action) => Object.assign(element(parent),{ dataset:{ action,house:house.id } });
  return { document,mapDialog,viewport,mapSection,houseSelect,blockedFocus,artDialog,content,session,
    openMap() { const trigger = button(scope,'open-map'); trigger.focus(); scope.emit('click',trigger); },
    mapPin() { const pin = element(largeSurface); largeSurface.append(pin); pin.focus(); return pin; },
    galleryTrigger() { const trigger = element(body); trigger.focus(); return trigger; },
    select() { artDialog.emit('click',button(artDialog,'select-from-dialog')); },
    close() { artDialog.emit('click',button(artDialog,'close-art')); },
    flushCloseEvents() { while (pendingCloseEvents.length) pendingCloseEvents.shift()(); },
  };
}

test('selecting a house from the enlarged map keeps focus inside its modal after the queued art close event', t => {
  const f = fixture(t);
  f.openMap();
  const pin = f.mapPin();
  f.session.open('<h2>House</h2>');
  f.select();
  assert.equal(f.mapDialog.open,true);
  assert.equal(f.artDialog.open,false);
  assert.equal(pin.isConnected,false,'selection renders a new map, removing the original focus trigger');
  assert.equal(f.houseSelect.value,'focus-house');
  assert.equal(f.document.activeElement,f.viewport);
  f.flushCloseEvents();
  assert.equal(f.document.activeElement,f.viewport,'the delayed art close listener must not reclaim focus');
  assert.equal(f.mapSection.scrolled,undefined,'the inert page behind the modal must not scroll');
  assert.deepEqual(f.blockedFocus,[]);
});

test('selecting a house outside the map modal retains the main select and map scroll path after close', t => {
  const f = fixture(t);
  f.galleryTrigger(); f.session.open('<h2>House</h2>'); f.select();
  f.flushCloseEvents();
  assert.equal(f.houseSelect.value,'focus-house');
  assert.equal(f.document.activeElement,f.houseSelect);
  assert.equal(f.mapSection.scrolled,true);
  assert.deepEqual(f.blockedFocus,[]);
});

test('ordinary artwork closing still restores the connected map trigger after a previous selection', t => {
  const f = fixture(t);
  f.openMap(); f.mapPin(); f.session.open('<h2>House</h2>'); f.select(); f.flushCloseEvents();
  const nextPin = f.mapPin();
  f.session.open('<h2>Another house</h2>'); f.close(); f.flushCloseEvents();
  assert.equal(f.mapDialog.open,true);
  assert.equal(f.document.activeElement,nextPin);
  assert.deepEqual(f.blockedFocus,[]);
});

test('the shared controller keeps its existing select focus when no focus callback is configured', t => {
  const f = fixture(t,{ sharedDefault:true });
  f.galleryTrigger(); f.session.open('<h2>House</h2>'); f.select(); f.flushCloseEvents();
  assert.equal(f.houseSelect.value,'focus-house');
  assert.equal(f.document.activeElement,f.houseSelect);
  assert.equal(f.mapSection.scrolled,true);
  assert.deepEqual(f.blockedFocus,[]);
});
