import { BATTLE_PHASES } from './wellenruh-data.mjs';
import { BATTLE_SHIPS } from './battle-fleets.mjs';
import { advanceBattle,clampProgress,phaseAt,LAST_PHASE,shipAt } from './battle-simulation.mjs';
import { beatAt } from './battle-effects.mjs';
import { createBattleMap } from './battle-map.mjs';
import { createBattleAudio } from './battle-audio.mjs';

export function createBattlePlayer(root) {
  const $=selector=>root.querySelector(selector), map=createBattleMap(root),audio=createBattleAudio();
  const ui={slider:$('[data-battle-progress]'),play:$('[data-action="play"]'),percent:$('[data-battle-percent]'),speed:$('[data-battle-speed]'),
    cinematic:$('[data-battle-cinematic]'),effects:$('[data-battle-effects-toggle]'),previous:$('[data-action="previous"]'),next:$('[data-action="next"]'),
    moment:$('[data-battle-moment]'),title:$('[data-battle-phase-title]'),text:$('[data-battle-phase-text]'),focus:$('[data-battle-phase-focus]'),
    phaseNumber:$('[data-battle-phase-number]'),step:$('[data-battle-step]'),beat:$('[data-battle-beat]'),place:$('[data-battle-beat-place]'),
    green:$('[data-battle-green-standing]'),red:$('[data-battle-red-standing]')};
  const phaseButtons=[...root.querySelectorAll('[data-phase]')],groupButtons=[...root.querySelectorAll('[data-battle-group]')];
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)'), cleanup=new AbortController();
  const soundToggle=$('[data-battle-sound-toggle]'),soundVolume=$('[data-battle-sound-volume]'),soundStatus=$('[data-battle-audio-status]');
  const musicToggle=$('[data-battle-music-toggle]'),musicVolume=$('[data-battle-music-volume]');
  soundToggle.disabled=!audio.available;musicToggle.disabled=!audio.available;soundVolume.disabled=true;musicVolume.disabled=true;
  if(!audio.available)soundStatus.textContent='Dieser Browser unterstützt die Klangkulisse nicht.';
  ui.cinematic.checked=!reducedMotion.matches;
  let progress=clampProgress(new URL(location.href).searchParams.get('phase'));
  let playing=false, frame=0,previousTime=null,displayedPhase=-1,displayedBeat=null,focusedGroup=null;

  function render() {
    map.update(progress,{cinematic:ui.cinematic.checked,detail:ui.effects.checked});
    audio.update(progress,playing);
    const phase=phaseAt(progress),detail=BATTLE_PHASES[phase],beat=beatAt(progress);
    ui.slider.value=progress; ui.percent.value=`${Math.round(progress/LAST_PHASE*100)} %`;
    ui.slider.setAttribute('aria-valuetext',`${detail.label}, ${Math.round(progress/LAST_PHASE*100)} Prozent`);
    ui.play.setAttribute('aria-label',playing?'Schlachtverlauf pausieren':'Schlachtverlauf abspielen');
    ui.play.firstChild.textContent=playing?'Ⅱ ':'▶ ';
    ui.play.querySelector('span').textContent=playing?'Gefecht pausieren':progress===LAST_PHASE?'Noch einmal ansehen':progress===0?'Die Segel setzen':'Weitersegeln';
    root.dataset.playing=String(playing);
    ui.previous.disabled=progress<=0;ui.next.disabled=progress>=LAST_PHASE;
    const remaining={green:30,red:27};
    for(const ship of BATTLE_SHIPS)if(ship.lost&&shipAt(ship,progress).loss>.95)remaining[ship.side]--;
    ui.green.textContent=remaining.green;ui.red.textContent=remaining.red;
    if(beat!==displayedBeat){displayedBeat=beat;ui.beat.textContent=beat.text;ui.place.textContent=beat.place;}
    if(phase===displayedPhase)return;
    displayedPhase=phase;
    ui.moment.textContent=detail.moment;ui.title.textContent=detail.title;ui.text.textContent=detail.text;ui.focus.textContent=detail.focus;
    ui.step.textContent=`${phase+1} / ${BATTLE_PHASES.length}`;ui.phaseNumber.textContent=String(phase+1).padStart(2,'0');
    phaseButtons.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.phase)===phase)));
  }
  function pause(){playing=false;cancelAnimationFrame(frame);frame=0;previousTime=null;audio.pause();}
  function tick(time){
    if(!playing)return;
    if(previousTime!==null)progress=advanceBattle(progress,Math.min(.25,(time-previousTime)/1000),Number(ui.speed.value));
    previousTime=time;
    if(progress>=LAST_PHASE)pause();
    render();if(playing)frame=requestAnimationFrame(tick);
  }
  function seek(value){pause();progress=clampProgress(value);audio.sync(progress);render();const url=new URL(location.href);url.searchParams.set('phase',progress.toFixed(3));history.replaceState(null,'',url);}
  root.addEventListener('click',async event=>{
    const button=event.target.closest('button');if(!button||!root.contains(button))return;
    const action=button.dataset.action;
    if(action==='play'){
      if(playing)pause();else{if(progress>=LAST_PHASE)progress=0;audio.start(progress);playing=true;previousTime=null;frame=requestAnimationFrame(tick);}render();
    }
    if(action==='restart')seek(0);
    if(action==='phase')seek(Number(button.dataset.phase));
    if(action==='previous')seek(Math.max(0,Math.ceil(progress)-1));
    if(action==='next')seek(Math.floor(progress)+1);
    if(action==='fullscreen'){
      try{if(document.fullscreenElement===root)await document.exitFullscreen();else await root.requestFullscreen();}
      catch{ui.place.textContent='Vollbild ist in diesem Browser nicht verfügbar.';}
    }
    if(button.hasAttribute('data-battle-group')){
      focusedGroup=focusedGroup===button.dataset.battleGroup?null:button.dataset.battleGroup;
      map.highlight(focusedGroup);groupButtons.forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.battleGroup===focusedGroup)));
    }
  },{signal:cleanup.signal});
  ui.slider.addEventListener('input',()=>seek(ui.slider.value),{signal:cleanup.signal});
  $('[data-battle-routes-toggle]').addEventListener('change',event=>map.showRoutes(event.target.checked),{signal:cleanup.signal});
  [ui.cinematic,ui.effects].forEach(input=>input.addEventListener('change',render,{signal:cleanup.signal}));
  soundToggle.addEventListener('change',async()=>{
    soundStatus.textContent=soundToggle.checked?'Retro-Effekte werden aktiviert.':'Retro-Effekte ausgeschaltet.';
    try{await audio.setEnabled(soundToggle.checked);soundVolume.disabled=!soundToggle.checked;soundStatus.textContent=soundToggle.checked?'Retro-Effekte eingeschaltet.':'Retro-Effekte ausgeschaltet.';}
    catch(error){soundToggle.checked=false;soundVolume.disabled=true;soundStatus.textContent=error.message;}
  },{signal:cleanup.signal});
  soundVolume.addEventListener('input',()=>audio.setVolume(Number(soundVolume.value)*.006),{signal:cleanup.signal});
  musicToggle.addEventListener('change',async()=>{
    soundStatus.textContent=musicToggle.checked?'Kampfmusik wird aktiviert.':'Kampfmusik ausgeschaltet.';
    try{await audio.setMusicEnabled(musicToggle.checked);musicVolume.disabled=!musicToggle.checked;soundStatus.textContent=musicToggle.checked?'Kampfmusik eingeschaltet; sie begleitet die laufende Schlacht.':'Kampfmusik ausgeschaltet.';}
    catch(error){musicToggle.checked=false;musicVolume.disabled=true;soundStatus.textContent=error.message;}
  },{signal:cleanup.signal});
  musicVolume.addEventListener('input',()=>audio.setMusicVolume(Number(musicVolume.value)*.006),{signal:cleanup.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();render();}},{signal:cleanup.signal});
  document.addEventListener('fullscreenchange',()=>{
    const fullscreen=document.fullscreenElement===root;
    root.dataset.fullscreen=String(fullscreen);
    $('[data-action="fullscreen"]').setAttribute('aria-label',fullscreen?'Vollbild verlassen':'Schlachtkarte im Vollbild');
  },{signal:cleanup.signal});
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){ui.cinematic.checked=false;pause();render();}},{signal:cleanup.signal});
  render();
  return Object.freeze({destroy(){pause();audio.destroy();cleanup.abort();}});
}
const root=document.querySelector('[data-battle-player]');
if(root)createBattlePlayer(root);
