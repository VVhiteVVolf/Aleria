const DATABASE='patrick-ideenwerk-v1';
export async function openWorkspaceStorage() {
  const database=await new Promise((resolve,reject)=>{
    const request=indexedDB.open(DATABASE,1);
    request.onupgradeneeded=()=>request.result.createObjectStore('documents');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(new Error('Der lokale Browserspeicher ist nicht verfügbar. Import und Export bleiben nutzbar.'));
  });
  return {
    load:()=>new Promise((resolve,reject)=>{
      const transaction=database.transaction('documents','readonly');
      const request=transaction.objectStore('documents').get('workspace');
      request.onsuccess=()=>resolve(request.result || null);
      request.onerror=()=>reject(request.error);
    }),
    save:workspace=>new Promise((resolve,reject)=>{
      const transaction=database.transaction('documents','readwrite');
      transaction.objectStore('documents').put(workspace,'workspace');
      transaction.oncomplete=()=>resolve();
      transaction.onabort=transaction.onerror=()=>reject(new Error('Lokal speichern fehlgeschlagen. Bitte jetzt als Datei exportieren. Möglicherweise ist der Browserspeicher voll.'));
    })
  };
}

export function createAutosave(storage,onStatus) {
  let pending=null,running=null,timer=null,failed=false;
  async function flush() {
    clearTimeout(timer);
    if(running) {await running;if(pending)return flush();return;}
    if(!pending)return;
    const document=pending;pending=null;
    running=storage.save(document).then(()=>{failed=false;onStatus('saved');}).catch(error=>{failed=true;onStatus('error',error.message);}).finally(()=>{running=null;});
    await running;
    if(pending)return flush();
  }
  return {
    queue(workspace) {pending=structuredClone(workspace);onStatus('saving');clearTimeout(timer);timer=setTimeout(flush,250);},
    flush,
    isPending:()=>Boolean(pending||running||failed)
  };
}
