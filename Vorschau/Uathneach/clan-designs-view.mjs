import {previewAsset} from './preview-assets.mjs';

export function createClanDesignGallery({root,dialog,designs}){
 let trigger;
 const cards=designs.map(design=>{
  const title=design.name||design.label;
  const figure=document.createElement('figure');
  const button=document.createElement('button');
  button.type='button';button.dataset.action='show-clan-design';button.dataset.design=design.id;
  button.setAttribute('aria-label',title+' – Wappen öffnen');
  const img=document.createElement('img');
  img.src=previewAsset(design.crest);img.alt='Wappen '+title;img.width=1254;img.height=1254;
  button.append(img);
  const caption=document.createElement('figcaption');caption.textContent=title;
  if(!design.name){const status=document.createElement('small');status.textContent='Clanname offen';caption.append(status);}
  figure.append(button,caption);return figure;
 });
 root.replaceChildren(...cards);
 root.addEventListener('click',event=>{
  const button=event.target.closest('[data-action="show-clan-design"]');if(!button)return;
  const design=designs.find(item=>item.id===button.dataset.design);if(!design)return;
  trigger=button;
  const title=design.name||design.label;
  dialog.querySelector('[data-role="design-title"]').textContent=title;
  const img=dialog.querySelector('img');img.src=previewAsset(design.crest);img.alt='Wappen '+title;
  dialog.showModal();
 });
 dialog.addEventListener('click',event=>{if(event.target.closest('[data-action="close-clan-design"]'))dialog.close();});
 dialog.addEventListener('close',()=>trigger?.focus({preventScroll:true}));
}
