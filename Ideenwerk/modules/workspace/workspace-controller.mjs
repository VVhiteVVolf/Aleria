import {uid,escapeHtml as h,closeButton} from '../ui/html.mjs';
import {icon,mountIcons} from '../ui/icons.mjs';
import {createDialogs} from '../ui/dialogs.mjs';
import {TEMPLATES,createModule} from '../templates/catalog.mjs';
import {mountTemplatePicker} from '../templates/template-picker.mjs';
import {renderBoard} from '../board/board-view.mjs';
import {mountBoardDrag} from '../board/board-drag.mjs';
import {createEditor} from '../editor/editor-controller.mjs';
import {mountGitHubDialog} from '../github/github-dialog.mjs';
import {createProjectTransfer} from './project-transfer.mjs';
import {loadPreferences,savePreferences} from './preferences.mjs';

export function mountWorkspace({store,autosave}) {
  const find=id=>document.getElementById(id),surface=find('board-surface'),preferences=loadPreferences();
  let activeId=preferences.boardId,view=preferences.view,zoom=preferences.zoom,query='',type='all';
  const {ask,toast}=createDialogs({root:find('text-dialog'),toastRoot:find('toast')});
  const active=()=>store.get().boards.find(board=>board.id===activeId)||store.get().boards[0];
  const remember=()=>savePreferences({boardId:active().id,view,zoom});
  function modifyModule(id,mutator,options={}){const boardId=active().id;store.change(workspace=>{const module=workspace.boards.find(board=>board.id===boardId)?.modules.find(item=>item.id===id);if(module)mutator(module);},options);}
  function duplicateModule(id){if(active().modules.length>=500){toast('Maximal 500 Module pro Pinnwand.');return;}const copy=structuredClone(active().modules.find(item=>item.id===id));copy.id=uid();copy.title=`${copy.title} · Kopie`.slice(0,200);copy.x=Math.min(3500,copy.x+35);copy.y=Math.min(2500,copy.y+35);store.change(workspace=>workspace.boards.find(board=>board.id===active().id).modules.push(copy));}
  const editor=createEditor(find('editor-dialog'),{getModule:id=>active().modules.find(module=>module.id===id),updateModule:modifyModule,onDuplicate:duplicateModule,onDelete:id=>store.change(workspace=>{const board=workspace.boards.find(item=>item.id===active().id);board.modules=board.modules.filter(module=>module.id!==id);}),ask,toast});
  function createIdea(template){
    if(active().modules.length>=500){toast('Maximal 500 Module pro Pinnwand.');return;}
    const index=active().modules.length,module=createModule(template,{x:40+(index%3)*330,y:35+Math.floor(index/3)*385});
    module.y=Math.min(2500,module.y);const boardId=active().id;
    store.change(workspace=>workspace.boards.find(board=>board.id===boardId).modules.push(module));
    query='';type='all';find('search').value='';find('type-filter').value='all';render();editor.open(module.id);
  }
  const openTemplates=mountTemplatePicker(find('template-dialog'),createIdea);
  const openGitHub=mountGitHubDialog(find('github-dialog'),{getWorkspace:store.get,toast});
  const transfer=createProjectTransfer({input:find('import-file'),store,ask,toast,onImported:id=>{activeId=id;query='';type='all';find('search').value='';find('type-filter').value='all';render();}});
  mountIcons();
  find('template-nav').innerHTML=TEMPLATES.map(template=>`<button data-action="create-idea" data-template="${template.id}">${icon(template.icon)}${h(template.name)}<span>＋</span></button>`).join('');
  find('type-filter').insertAdjacentHTML('beforeend',TEMPLATES.map(template=>`<option value="${template.id}">${h(template.name)}</option>`).join(''));
  find('help-dialog').innerHTML=`<div class="modal-top"><div><div class="eyebrow">WILLKOMMEN IN DEINER WERKSTATT</div><h2 id="help-title">Von einem Funken zur Geschichte.</h2></div>${closeButton()}</div><div class="help-steps">${[
    ['Gib der Idee eine Form.','Wähle links eine Vorlage oder klicke auf „Neues Modul“. Charaktere, Storys, Orte, Mindmaps, Moodboards und freie Notizen warten auf dich.'],
    ['Mach dir die Pinnwand zu eigen.','Ziehe ein Modul am Punktgriff an seinen Platz. Der kleine Pfeil klappt es zur Miniatur ein. Raster und Liste helfen beim Sortieren. Am Griff kannst du auch die Pfeiltasten verwenden.'],
    ['Gehe in die Tiefe.','Klicke eine Karte an. Ergänze Portraits, Texte und Stichpunkte, erstelle weitere Seiten oder ziehe in einer Mindmap Verbindungen zwischen Gedanken. Die Eingabe „Liste“ verwendet einen Punkt pro Zeile.'],
    ['Nimm deine Ideen mit.','Änderungen werden automatisch in diesem Browser gespeichert. Export sichert alle Pinnwände und Bilder in einer JSON-Datei. Import fügt Pinnwände aus einer Sicherung hinzu. Browserdaten zu löschen entfernt auch lokale Projekte – deshalb regelmäßig exportieren.'],
    ['Ein Backup, wenn du es möchtest.','Über „GitHub“ kannst du das Projekt in deinem eigenen Backup-Repository sichern. Dein Token bleibt nur während des geöffneten Dialogs im Arbeitsspeicher. Die Sicherung enthält keine Anwendung und startet kein Deployment.'],
    ['Ein paar kleine Abkürzungen.','Strg+Z macht die letzte Projektänderung rückgängig, Strg+Umschalt+Z wiederholt sie. In Textfeldern gelten die gewohnten Textabkürzungen. Strg+S exportiert dein Projekt.']
  ].map(([title,text],index)=>`<div class="help-step"><b>${index+1}</b><div><strong>${h(title)}</strong><p>${h(text)}</p></div></div>`).join('')}</div><div class="modal-footer"><button class="button primary" data-action="close">Los geht’s</button></div>`;
  function render(){
    const board=active();activeId=board.id;
    find('boards').innerHTML=store.get().boards.map(item=>`<button data-action="select-board" data-board="${h(item.id)}" class="${item.id===activeId?'active':''}" ${item.id===activeId?'aria-current="page"':''}>${icon('board')}<span class="board-name">${h(item.name)}</span><span class="nav-count">${item.modules.length}</span></button>`).join('');
    find('board-title').innerHTML=`${h(board.name)}<span>.</span>`;find('board-crumb').textContent=board.name;
    document.title=`${board.name} · Ideenwerk`;
    document.querySelectorAll('[data-action="view"]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.view===view));
    const count=renderBoard(surface,board,{view,zoom,query,type});
    find('module-count').textContent=`${count} ${count===1?'Idee':'Ideen'}${count!==board.modules.length?` von ${board.modules.length}`:''}`;
    find('demo-badge').hidden=!board.example;find('zoom-controls').hidden=view!=='board';find('zoom-label').textContent=`${Math.round(zoom*100)} %`;
    document.querySelector('[data-action="undo"]').disabled=!store.canUndo();document.querySelector('[data-action="redo"]').disabled=!store.canRedo();
    remember();
  }
  store.subscribe((state,reason)=>{render();autosave?.queue(state);if(reason==='history')editor.refresh();});
  mountBoardDrag(surface,{getView:()=>view,getZoom:()=>zoom,onMove:(id,x,y)=>modifyModule(id,module=>{module.x=x;module.y=y;},{reason:'move'})});
  async function action(button){
    const name=button.dataset.action,id=button.closest('[data-module]')?.dataset.module;
    if(name==='templates')openTemplates();
    if(name==='create-idea')createIdea(button.dataset.template);
    if(name==='select-board'){activeId=button.dataset.board;render();find('board-viewport').scrollTo(0,0);}
    if(name==='new-board'){
      if(store.get().boards.length>=30){toast('Maximal 30 Pinnwände pro Projekt.');return;}
      const name=await ask({title:'Ein neuer Ideenraum',label:'Name der Pinnwand',value:'Meine neue Pinnwand'});if(!name)return;
      const board={id:uid(),name,example:false,modules:[]};activeId=board.id;store.change(workspace=>workspace.boards.push(board));find('board-viewport').scrollTo(0,0);
    }
    if(name==='rename-board'){const name=await ask({title:'Pinnwand umbenennen',label:'Name',value:active().name});if(name)store.change(workspace=>{workspace.boards.find(board=>board.id===activeId).name=name;});}
    if(name==='delete-board'){
      if(!await ask({title:'Pinnwand entfernen?',description:`„${active().name}“ mit allen Modulen entfernen. Über Rückgängig kannst du sie wiederherstellen.`,input:false,confirm:'Pinnwand entfernen',danger:true}))return;
      const id=activeId;store.change(workspace=>{workspace.boards=workspace.boards.filter(board=>board.id!==id);if(!workspace.boards.length)workspace.boards.push({id:uid(),name:'Mein Ideenraum',example:false,modules:[]});});
    }
    if(name==='view'){view=button.dataset.view;render();find('board-viewport').scrollTo(0,0);}
    if(name==='open-module')editor.open(id);
    if(name==='collapse')modifyModule(id,module=>{module.collapsed=!module.collapsed;});
    if(name==='zoom-in'||name==='zoom-out'||name==='zoom-reset'){zoom=name==='zoom-reset'?1:Math.max(.5,Math.min(1.3,Math.round((zoom+(name==='zoom-in'?.1:-.1))*10)/10));render();}
    if(name==='arrange')store.change(workspace=>workspace.boards.find(board=>board.id===activeId).modules.forEach((module,index)=>{module.x=40+(index%3)*330;module.y=Math.min(2500,35+Math.floor(index/3)*385);}));
    if(name==='clear-filter'){query='';type='all';find('search').value='';find('type-filter').value='all';render();}
    if(name==='undo')store.undo();if(name==='redo')store.redo();
    if(name==='import')transfer.import();if(name==='export')transfer.export();if(name==='github')openGitHub();
    if(name==='help')find('help-dialog').showModal();
  }
  document.getElementById('app').addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(button)action(button).catch(error=>toast(error.message));});
  find('help-dialog').addEventListener('click',event=>{if(event.target.closest('[data-action="close"]'))find('help-dialog').close();});
  find('search').addEventListener('input',event=>{query=event.target.value;render();});
  find('type-filter').addEventListener('change',event=>{type=event.target.value;render();});
  document.addEventListener('keydown',event=>{
    if(!event.ctrlKey&&!event.metaKey)return;
    if(event.key.toLowerCase()==='s'){event.preventDefault();transfer.export();return;}
    if(event.target.matches('input,textarea,select,[contenteditable="true"]'))return;
    if(event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?store.redo():store.undo();}
  });
  render();
  return {toast,render};
}
