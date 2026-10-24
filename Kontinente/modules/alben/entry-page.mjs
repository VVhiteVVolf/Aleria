import source from './principalities.source.json' with { type: 'json' };
import { principalityHref } from './principality-links.mjs';

const root=document.querySelector('[data-alben-entries]');
if(root){
  const id=new URL(location.href).searchParams.get('id');
  const selected=source.principalities.find(p=>p.id===id);
  if(id){
    for(const entry of root.querySelectorAll('[data-principality]'))entry.hidden=entry.dataset.principality!==id;
    const missing=document.querySelector('[data-role="unknown-principality"]');
    missing.hidden=Boolean(selected);
    if(selected){
      const page=(window.KONTINENTE_REGISTRY || []).find(entry=>entry.id===selected.pageId && entry.page);
      if(page)location.replace(principalityHref(selected,window.KONTINENTE_REGISTRY));
      document.querySelector('h1').textContent=`${selected.type} ${selected.name}`;
      document.title=`${selected.name} · Schild von Ailith`;
    }
  }
  for(const link of document.querySelectorAll('.court-sidebar a')){
    const principality=source.principalities.find(p=>link.hash==='#'+p.id);
    if(principality){
      link.href=principalityHref(principality,window.KONTINENTE_REGISTRY || []);
      if(selected?.id===principality.id)link.setAttribute('aria-current','page');
    }
  }
}
