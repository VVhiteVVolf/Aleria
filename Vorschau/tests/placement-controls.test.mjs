import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlacementControls} from '../shared/placement-controls.mjs';

// Minimal DOM boundary for delegated event tests; visual map QA runs in-browser.
function fixture(selected='lanette') {
 const listeners=new Map(),classes=new Set(),moves=[];
 const document={createElement:()=>({style:{},replaceChildren(){}}),elementFromPoint:()=>document.hit};
 const root={
  ownerDocument:document,
  append(){},
  contains:element=>element.inside!==false,
  querySelectorAll:()=>[],
  classList:{add:value=>classes.add(value),remove:value=>classes.delete(value),toggle:(value,on)=>on?classes.add(value):classes.delete(value)},
  addEventListener(type,handler,options){
   const handlers=listeners.get(type)??[];
   const listener={handler,capture:options?.capture};
   if(listener.capture)handlers.unshift(listener);else handlers.push(listener);
   listeners.set(type,handlers);
  }
 };
 const controls=createPlacementControls({root,getSelected:()=>selected,onMove:(...args)=>moves.push(args),escape:String,canMove:id=>id!=='roden'});
 function emit(type,target,values={}) {
  const event={target,pointerId:1,pointerType:'mouse',button:0,clientX:10,clientY:10,
   preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...values};
  for(const {handler} of listeners.get(type)??[]){handler(event);if(event.stopped)break;}
  return event;
 }
 function house(id) {
  const element={dataset:{dragHouse:id},querySelector:()=>null,
   closest:selector=>selector==='[data-drag-house]'?element:null,
   setPointerCapture(){element.captured=true;},hasPointerCapture:()=>Boolean(element.captured),
   releasePointerCapture(){element.captured=false;}};
  return element;
 }
 function seat(id,inside=true) {
  const element={dataset:{dropSeat:id},inside,classList:{add(){},remove(){}},
   closest:selector=>selector==='[data-drop-seat]'||selector==='button[data-action="place-at-seat"]'?element:null};
  return element;
 }
 return {root,controls,emit,house,seat,moves,classes,document};
}

test('target activation supports the selection path used by keyboard and touch, with locked houses excluded',()=>{
 const normal=fixture();
 normal.emit('click',normal.seat('weinau'));
 normal.emit('click',normal.seat('unassigned'));
 assert.deepEqual(normal.moves,[['lanette','weinau'],['lanette',null]]);
 const locked=fixture('roden');
 locked.emit('click',locked.seat('weinau'));
 assert.deepEqual(locked.moves,[]);
 locked.controls.render({settlements:[]});
 assert.equal(locked.classes.has('has-selection'),false);
});

test('pointer dragging waits for movement and ignores unrelated pointers before committing once',()=>{
 const f=fixture(),house=f.house('lanette');
 f.document.hit=f.seat('weinau');
 f.emit('pointerdown',house);
 f.emit('pointermove',house,{clientX:13});
 assert.equal(f.classes.has('is-dragging'),false);
 f.emit('pointermove',house,{clientX:30});
 assert.equal(f.classes.has('is-dragging'),true);
 f.emit('pointerup',house,{pointerId:2});
 assert.deepEqual(f.moves,[]);
 f.emit('pointerup',house);
 assert.deepEqual(f.moves,[['lanette','weinau']]);
 assert.equal(f.classes.has('is-dragging'),false);
 assert.equal(house.captured,false);
 const click=f.emit('click',f.seat('weinau'));
 assert.equal(click.prevented,true);
 assert.deepEqual(f.moves,[['lanette','weinau']]);
});

test('cancelled or external drops and locked drags cannot change placements',()=>{
 for(const scenario of ['cancel','outside','locked']){
  const f=fixture(),house=f.house(scenario==='locked'?'roden':'lanette');
  f.document.hit=f.seat('weinau',scenario!=='outside');
  f.emit('pointerdown',house);
  f.emit('pointermove',house,{clientX:30});
  f.emit(scenario==='cancel'?'pointercancel':'pointerup',house);
  assert.deepEqual(f.moves,[],scenario);
  assert.equal(f.classes.has('is-dragging'),false,scenario);
 }
});

test('touch panning does not start a mouse-style drag',()=>{
 const f=fixture(),house=f.house('lanette');
 f.document.hit=f.seat('weinau');
 f.emit('pointerdown',house,{pointerType:'touch'});
 f.emit('pointermove',house,{pointerType:'touch',clientX:30});
 f.emit('pointerup',house,{pointerType:'touch'});
 assert.equal(f.classes.has('is-dragging'),false);
 assert.deepEqual(f.moves,[]);
 f.emit('click',f.seat('weinau'));
 assert.deepEqual(f.moves,[['lanette','weinau']]);
});

test('map refresh keeps one target layer and excludes fixed map pins from dragging',()=>{
 const f=fixture(),pins=[{dataset:{clan:'lanette'}},{dataset:{clan:'roden',dragHouse:'roden'}}];
 const surface={children:[],
  querySelectorAll:selector=>selector==='.clan-pin'?pins:surface.children,
  append(element){
   surface.children.push(element);
   element.remove=()=>{surface.children=surface.children.filter(child=>child!==element);};
  }
 };
 f.root.querySelectorAll=()=>[surface];
 f.controls.render({settlements:[{id:'weinau',name:'Weinau',point:[30,40]}]});
 f.controls.render({settlements:[{id:'weinau',name:'Weinau',point:[30,40]}]});
 assert.equal(surface.children.length,1);
 assert.equal(pins[0].dataset.dragHouse,'lanette');
 assert.equal(pins[1].dataset.dragHouse,undefined);
 assert.ok(pins.every(pin=>pin.draggable===false));
 assert.equal(f.classes.has('has-selection'),true);
});
