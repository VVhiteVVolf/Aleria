import assert from 'node:assert/strict';
const copy=value=>value==null?value:JSON.parse(JSON.stringify(value));
export function database(initial) {
  const data=new Map(Object.entries(copy(initial)));let id=0,queue=Promise.resolve();
  const doc=path=>({path,id:path.split('/').at(-1)});
  return {data,collection:path=>({doc:key=>doc(`${path}/${key || `comment-${++id}`}`),where:(field,operator,value)=>({collection:path,field,value})}),
    runTransaction(work){const task=queue.catch(()=>{}).then(async()=>{const writes=[];
      const result=await work({async get(ref){assert.equal(writes.length,0,'reads precede writes');
        const snapshot=(path,value)=>({id:path.split('/').at(-1),exists:value!=null,data:()=>copy(value)});
        if(ref.collection)return {docs:[...data].filter(([key,value])=>key.startsWith(ref.collection+'/') && value[ref.field]===ref.value).map(([key,value])=>snapshot(key,value))};
        return snapshot(ref.path,data.get(ref.path));},
        create(ref,value){writes.push(()=>{assert.equal(data.has(ref.path),false);data.set(ref.path,copy(value));});},
        delete(ref){writes.push(()=>data.delete(ref.path));},
        update(ref,value){writes.push(()=>{const current=copy(data.get(ref.path));assert.ok(current);for(const [path,entry]of Object.entries(copy(value))){const parts=path.split('.');let node=current;for(const key of parts.slice(0,-1))node=node[key] ||= {};node[parts.at(-1)]=entry;}data.set(ref.path,current);});}
      });writes.forEach(write=>write());return result;});queue=task;return task;}};
}
