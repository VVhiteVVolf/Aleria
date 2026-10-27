import {uid} from '../ui/html.mjs';
import {renderEditor} from './editor-view.mjs';
import {importLocalImage} from './image-import.mjs';
import {createMindmapController} from '../mindmap/mindmap-controller.mjs';
export function createEditor(root,{getModule,updateModule,onDuplicate,onDelete,ask,toast}) {
  let moduleId=null,pageId=null;
  const current=()=>getModule(moduleId);
  const update=(mutator,options={})=>updateModule(moduleId,mutator,{reason:'editor-input',...options});
  function render() {const module=current();if(!module){root.close();return;}if(!module.pages.some(page=>page.id===pageId))pageId=module.pages[0].id;root.innerHTML=renderEditor(module,{pageId,mapState:map.state});}
  const map=createMindmapController(root,{getModule:current,updateMap:(mutator,options)=>update(module=>mutator(module.mindmap),options),render,toast});
  function page(module){return module.pages.find(item=>item.id===pageId);}
  root.addEventListener('click',async event=>{
    const button=event.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
    if(action==='close'){root.close();return;}
    try{
      if(map.action(action))return;
      if(action==='select-page'){pageId=button.dataset.page;map.reset();render();}
      if(action==='add-page'){
        if(current().pages.length>=50){toast('Maximal 50 Seiten pro Modul.');return;}
        const title=await ask({title:'Mehr Platz für Ideen',label:'Seitenname',value:'Neue Seite',maxLength:200});if(!title)return;
        pageId=uid();update(module=>module.pages.push({id:pageId,title,blocks:[{id:uid(),kind:'text',label:'Gedanken',value:''}]}));render();
      }
      if(action==='rename-page'){const title=await ask({title:'Seite umbenennen',label:'Seitenname',value:page(current()).title,maxLength:200});if(title){update(module=>{page(module).title=title;});render();}}
      if(action==='delete-page'&&current().pages.length>1){if(!await ask({title:'Seite entfernen?',description:'Diese Seite mit ihren Inhalten entfernen. Du kannst die Änderung über Rückgängig wiederherstellen.',input:false,confirm:'Seite entfernen',danger:true}))return;update(module=>{module.pages=module.pages.filter(item=>item.id!==pageId);});pageId=current().pages[0].id;map.reset();render();}
      if(action==='module-color'){update(module=>{module.color=button.dataset.color;});render();}
      if(action==='add-block'){
        if(page(current()).blocks.length>=100){toast('Maximal 100 Inhalte pro Seite.');return;}
        const kind=button.dataset.kind;update(module=>page(module).blocks.push({id:uid(),kind,label:{text:'Ein neuer Gedanke',bullets:'Eine neue Liste',image:'Eine neue Inspiration'}[kind],value:''}));render();
      }
      const blockId=button.closest('[data-block]')?.dataset.block;
      if(action==='remove-block'){update(module=>{page(module).blocks=page(module).blocks.filter(block=>block.id!==blockId);});render();}
      if(action==='remove-image'){update(module=>{page(module).blocks.find(block=>block.id===blockId).value='';});render();}
      if(action==='duplicate-module'){onDuplicate(moduleId);toast('Eine Kopie liegt auf deiner Pinnwand.');}
      if(action==='delete-module'){if(await ask({title:'Modul entfernen?',description:'Das Modul mit allen Seiten entfernen. Du kannst es über Rückgängig wiederherstellen.',input:false,confirm:'Modul entfernen',danger:true})){const id=moduleId;root.close();onDelete(id);}}
    }catch(error){toast(error.message);}
  });
  root.addEventListener('input',event=>{
    const moduleField=event.target.dataset.moduleField,blockField=event.target.dataset.blockField;
    if(moduleField){update(module=>{module[moduleField]=event.target.value;},{groupKey:`${moduleId}-${moduleField}`});if(moduleField==='title')root.querySelector('.editor-module-name').textContent=event.target.value;}
    if(blockField){const blockId=event.target.closest('[data-block]').dataset.block;update(module=>{page(module).blocks.find(block=>block.id===blockId)[blockField]=event.target.value;},{groupKey:`${blockId}-${blockField}`});}
  });
  root.addEventListener('change',async event=>{
    if(!event.target.matches('[data-image-upload]')||!event.target.files[0])return;
    const id=moduleId,selectedPage=pageId,blockId=event.target.closest('[data-block]').dataset.block,file=event.target.files[0];
    try{const value=await importLocalImage(file);updateModule(id,module=>{const block=module.pages.find(item=>item.id===selectedPage)?.blocks.find(item=>item.id===blockId);if(block)block.value=value;},{reason:'editor-input'});if(moduleId===id)render();toast('Bild lokal eingefügt. Es wird beim Export mitgesichert.');}catch(error){toast(error.message);}
  });
  root.addEventListener('close',()=>{moduleId=null;map.reset();});
  return {open(id){moduleId=id;pageId=current().pages[0].id;map.reset();render();root.showModal();},refresh(){if(root.open)render();}};
}
