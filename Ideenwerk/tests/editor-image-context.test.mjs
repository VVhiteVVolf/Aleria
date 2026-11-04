import test from 'node:test';
import assert from 'node:assert/strict';
import {createEditor} from '../modules/editor/editor-controller.mjs';
import {createModule} from '../modules/templates/catalog.mjs';

test('an image finishes on its original board after the editor closes and another board opens',async()=>{
  const listeners=new Map(),messages=[],writes=[];
  const root={open:false,innerHTML:'',addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(fn);},showModal(){this.open=true;},close(){this.open=false;for(const fn of listeners.get('close')||[])fn();}};
  const original=createModule('avatar-request'),other=createModule('avatar-request');
  const boards={first:original,second:other};let active='first',resolveBitmap;
  const originalDocument=globalThis.document,originalDecoder=globalThis.createImageBitmap;
  globalThis.document={createElement:()=>({getContext:()=>({drawImage(){}}),toDataURL:()=> 'data:image/webp;base64,UklGRgAAAABXRUJQ'})};
  globalThis.createImageBitmap=()=>new Promise(resolve=>{resolveBitmap=resolve;});
  try{
    const editor=createEditor(root,{getModule:()=>boards[active],captureContext:()=>active,
      updateModule(id,mutator,options){writes.push({id,options});mutator(boards[options.boardId]);},toast:message=>messages.push(message)});
    editor.open(original.id);
    const block=original.pages[0].blocks.find(block=>block.kind==='image');
    const operation=listeners.get('change')[0]({target:{dataset:{},matches:()=>true,files:[{type:'image/png',size:20}],closest:()=>({dataset:{block:block.id}})}});
    root.close();active='second';
    resolveBitmap({width:800,height:600,close(){}});
    await operation;
    assert.equal(writes[0].options.boardId,'first');
    assert.match(block.value,/^data:image\/webp/);
    assert.ok(other.pages.flatMap(page=>page.blocks).every(block=>block.value===''));
    assert.match(messages.at(-1),/lokal eingefügt/);
  }finally{globalThis.document=originalDocument;globalThis.createImageBitmap=originalDecoder;}
});

test('a removed image target is not reported as successfully saved',async()=>{
  const listeners={},messages=[],module=createModule('avatar-request');
  const root={open:false,addEventListener(name,fn){(listeners[name]??=[]).push(fn);},showModal(){this.open=true;}};
  const originalDocument=globalThis.document,originalDecoder=globalThis.createImageBitmap;
  globalThis.document={createElement:()=>({getContext:()=>({drawImage(){}}),toDataURL:()=> 'data:image/webp;base64,UklGRgAAAABXRUJQ'})};
  globalThis.createImageBitmap=async()=>({width:10,height:10,close(){}});
  try{
    const editor=createEditor(root,{getModule:()=>module,updateModule:(_id,mutator)=>mutator(module),toast:message=>messages.push(message)});
    editor.open(module.id);
    await listeners.change[0]({target:{dataset:{},matches:()=>true,files:[{type:'image/png',size:20}],closest:()=>({dataset:{block:'removed-block'}})}});
    assert.match(messages.at(-1),/inzwischen entfernt/);
    assert.ok(!messages.some(message=>message.includes('lokal eingefügt')));
  }finally{globalThis.document=originalDocument;globalThis.createImageBitmap=originalDecoder;}
});
