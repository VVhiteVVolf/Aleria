import { createLandingPage } from '/AleriaAlmanach/modules/landing/landing-model.js';
import { landingQuestJournalShell } from '/AleriaAlmanach/modules/landing/landing-quest-model.js';
import { mountLandingQuestJournal } from '/AleriaAlmanach/modules/landing/landing-quest-journal.js';
const result = await (await fetch('/diagnostics/quest-system-2026-11-01/adventure-result.json')).json();
const root=document.querySelector('[data-landing-test]'), page=createLandingPage('Neue Abenteurergruppe');
page.landing.questJournal.runIds=[result.run.id];
root.querySelector('[data-widget-host]').innerHTML=landingQuestJournalShell('test-mill-delivery');
mountLandingQuestJournal({root,page,entry:{id:'test-mill-delivery'}},{client:async()=>({context(request,next){next({quests:[],runs:[result.run]});return()=>{};}}),catalog:async()=>({quests:[]})});
