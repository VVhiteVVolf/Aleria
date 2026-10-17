registerRowSchema('theatreProgram.items', {
  itemsKey:'items', dataNamespace:'theatreProgram', sanitizeFn:sanitizeTheatreProgramData,
  rowClass:'theatre-program-editor-row', rowSelectorClass:'module-theatre-production', listWrapClass:'module-theatre-productions',
  emptyMessage:'Noch keine Stücke oder freien Plätze angelegt.', newItem:()=>({}), keepRow:()=>true,
  fields:[
    {key:'title',kind:'text',placeholder:'Titel · leer lassen für einen freien Platz',modalClass:'me-theatre-title'},
    {key:'genre',kind:'text',placeholder:'Gattung',modalClass:'me-theatre-genre'},
    {key:'image',kind:'icon',placeholder:'Szenenbild',modalClass:'me-theatre-image'},
    {key:'setting',kind:'text',placeholder:'Zeit und Hintergrund',modalClass:'me-theatre-setting'},
    {key:'synopsis',kind:'textarea',placeholder:'Worum es geht',modalClass:'me-theatre-synopsis'},
    {key:'cast',kind:'textarea',placeholder:'Besetzung und Rollen',modalClass:'me-theatre-cast'},
    {key:'staging',kind:'textarea',placeholder:'Die Inszenierung',modalClass:'me-theatre-staging'}
  ]
});

const THEATRE_PROGRAM_EDITOR_FIELDS=Object.freeze([['title','Überschrift'],['introduction','Einleitung'],['footer','Fußzeile']]);
function buildTheatreProgramEditor(page,mode) {
  const data=sanitizeTheatreProgramData(page.theatreProgram),inline=mode==='inline';
  const action=inline?'data-inline-action':'data-module-editor-action';
  return `<div class="${inline?'inline-edit-section':'module-editor-grid'}">
    ${THEATRE_PROGRAM_EDITOR_FIELDS.map(([key,label])=>`<label class="${inline?'inline-edit-field':'module-editor-field'} wide"><span>${label}</span><textarea class="inline-edit-textarea me-theatre-header-${key}" data-theatre-program-field="${key}" ${inline?'':'data-module-editor-action="sync-json-preview"'}>${escapeHtml(data[key])}</textarea></label>`).join('')}
    <div class="${inline?'inline-edit-field':'module-editor-field'} wide"><div class="module-editor-inline"><strong>Stücke & freie Plätze</strong><button type="button" class="module-editor-mini-btn" ${action}="schema-add-row" data-schema-key="theatreProgram.items">+ Stück oder freier Platz</button></div><div class="module-theatre-productions">${buildSchemaList('theatreProgram.items',data.items,mode)}</div></div></div>`;
}
function buildTheatreProgramModuleEditorFields(page) {
  return `<div class="module-page-type-block${page.theatreProgramPage?' visible':''}" data-page-type="theatre-program">${buildTheatreProgramEditor(page,'module')}</div>`;
}
function buildInlineTheatreProgramEditor(page) {return buildTheatreProgramEditor(page,'inline');}
function collectTheatreProgramModuleEditorPage(card,page) {
  const block=card.querySelector('[data-page-type="theatre-program"]')||card;
  page.theatreProgramPage=true;
  page.theatreProgram=sanitizeTheatreProgramData({...Object.fromEntries(THEATRE_PROGRAM_EDITOR_FIELDS.map(([key])=>[key,getTrimmedFormValue(block,`.me-theatre-header-${key}`)])),items:collectSchemaRows(block,'theatreProgram.items')});
  return page;
}
document.addEventListener('input',event=>{
  const field=event.target,key=field?.dataset?.theatreProgramField;
  if(!field?.closest?.('.inline-module-edit-pane')||!THEATRE_PROGRAM_EDITOR_FIELDS.some(([name])=>name===key))return;
  const page=getInlineDraftPageForSource(field);if(!page?.theatreProgramPage)return;
  page.theatreProgram=sanitizeTheatreProgramData({...page.theatreProgram,[key]:field.value});scheduleInlineModuleLivePreviewRefresh();
});
