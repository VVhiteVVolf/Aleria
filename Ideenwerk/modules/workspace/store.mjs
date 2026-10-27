import {MAX_FILE_BYTES} from './schema.mjs';
export function createWorkspaceStore(initial) {
  let state=structuredClone(initial);
  const past=[],future=[],listeners=new Set();
  let group=null;
  function publish(reason) { listeners.forEach(listener=>listener(state,reason)); }
  return {
    get:()=>state,
    subscribe(listener) { listeners.add(listener); return ()=>listeners.delete(listener); },
    change(mutator,{reason='change',groupKey=null}={}) {
      const next=structuredClone(state);
      mutator(next);
      const serialized=JSON.stringify(next);
      if (serialized===JSON.stringify(state)) return;
      if(new TextEncoder().encode(serialized).length>MAX_FILE_BYTES-1024)throw new Error('Das Projekt erreicht die portable Dateigrenze von 32 MB. Bitte Bilder entfernen oder verkleinern.');
      if (!groupKey || group?.key!==groupKey || Date.now()-group.time>900) {
        past.push(state);if(past.length>30)past.shift();
      }
      group=groupKey?{key:groupKey,time:Date.now()}:null;
      next.updatedAt=new Date().toISOString();state=next;future.length=0;publish(reason);
    },
    undo() { if(!past.length)return;future.push(state);state=past.pop();group=null;publish('history'); },
    redo() { if(!future.length)return;past.push(state);state=future.pop();group=null;publish('history'); },
    canUndo:()=>past.length>0,
    canRedo:()=>future.length>0
  };
}
