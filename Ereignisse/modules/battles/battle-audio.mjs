import { createBattleMusic } from './battle-music.mjs';
// Retro-Klänge werden lokal synthetisiert. Keine Audiodateien, Downloads oder Autoplay.
const SPECIAL_CUES=Object.freeze([
  {at:0,type:'horn'}, {at:1.06,type:'impact'}, {at:1.93,type:'horn'},
  {at:2.94,type:'boarding'}, {at:3.22,type:'sink'}, {at:3.45,type:'impact'},
  {at:4.49,type:'retreat'}, {at:4.92,type:'victory'}
]);

export function createBattleAudio({AudioContextClass=globalThis.AudioContext||globalThis.webkitAudioContext,setMusicTimer=globalThis.setInterval,clearMusicTimer=globalThis.clearInterval}={}) {
  let context=null,master=null,musicMaster=null,noiseBuffer=null,enabled=false,musicEnabled=false,playing=false,volume=.24,musicVolume=.18,previous=null,lastArrow=-1,lastImpact=-1;
  const active=new Map();
  function prepare(){
    if(context)return;
    if(!AudioContextClass)throw new Error('Dieser Browser unterstützt den Retro-Ton nicht.');
    context=new AudioContextClass();master=context.createGain();master.gain.value=volume;master.connect(context.destination);
    musicMaster=context.createGain();musicMaster.gain.value=musicVolume;musicMaster.connect(context.destination);
    noiseBuffer=context.createBuffer(1,Math.ceil(context.sampleRate*.65),context.sampleRate);
    const data=noiseBuffer.getChannelData(0);let seed=7391;
    for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=(seed/2147483648-1);}
  }
  function track(source,nodes,bus){active.set(source,bus);source.onended=()=>{active.delete(source);source.disconnect();nodes.forEach(node=>node.disconnect());};}
  function tone(frequency,endFrequency,duration,{type='square',level=.12,delay=0,bus='effects',sustain=false}={}){
    if(!context||!(bus==='music'?musicEnabled:enabled))return;
    const start=context.currentTime+delay,osc=context.createOscillator(),gain=context.createGain();
    osc.type=type;osc.frequency.setValueAtTime(frequency,start);osc.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),start+duration);
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(level,start+.006);
    if(sustain)gain.gain.setValueAtTime(level*.75,start+duration*.72);
    gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    osc.connect(gain);gain.connect(bus==='music'?musicMaster:master);track(osc,[gain],bus);osc.start(start);osc.stop(start+duration+.02);
  }
  function noise(duration,{level=.2,frequency=850,delay=0,bus='effects'}={}){
    if(!context||!(bus==='music'?musicEnabled:enabled))return;
    const start=context.currentTime+delay,source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
    source.buffer=noiseBuffer;filter.type='lowpass';filter.frequency.setValueAtTime(frequency,start);filter.frequency.exponentialRampToValueAtTime(75,start+duration);
    gain.gain.setValueAtTime(level,start);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    source.connect(filter);filter.connect(gain);gain.connect(bus==='music'?musicMaster:master);track(source,[filter,gain],bus);source.start(start);source.stop(start+duration+.02);
  }
  function cue(type){
    if(type==='arrow'){tone(1450,250,.11,{level:.07,type:'square'});noise(.07,{level:.12,frequency:3100});}
    if(type==='impact'){noise(.23,{level:.3,frequency:2100});tone(118,32,.26,{level:.18});tone(430,180,.11,{level:.06,delay:.015});}
    if(type==='horn'){tone(130.81,130.81,.25,{level:.1,type:'triangle'});tone(196,196,.34,{level:.08,type:'triangle',delay:.07});}
    if(type==='boarding'){noise(.18,{level:.34,frequency:2700});noise(.23,{level:.25,frequency:1200,delay:.13});tone(190,40,.35,{level:.16});tone(580,215,.14,{level:.08,delay:.04});}
    if(type==='sink'){noise(.64,{level:.34,frequency:1700});tone(146.83,29,.6,{level:.18,type:'triangle'});tone(82.4,24,.55,{level:.1,delay:.1});}
    if(type==='retreat'){[196,164.81,130.81].forEach((note,i)=>tone(note,note,.15,{type:'triangle',delay:i*.13,level:.09}));}
    if(type==='victory'){[130.81,164.81,196,261.63].forEach((note,i)=>tone(note,note,.2,{type:'triangle',delay:i*.12,level:.08}));}
  }
  function stop(bus=null){for(const [source,voiceBus]of active){if(bus&&voiceBus!==bus)continue;try{source.stop();}catch{ /* Bereits ausgeklungene Stimme. */ }active.delete(source);}}
  const music=createBattleMusic({time:()=>context?.currentTime||0,setTimer:setMusicTimer,clearTimer:clearMusicTimer,
    playNote(note,duration,at,voice){
      const frequency=440*2**((note-69)/12),delay=Math.max(0,at-context.currentTime);
      if(voice==='lead'){
        tone(frequency,frequency,duration,{type:'square',level:.085,delay,bus:'music',sustain:true});
        tone(frequency/2,frequency/2,duration,{type:'triangle',level:.045,delay,bus:'music',sustain:true});
      }else tone(frequency,frequency,duration,{type:'triangle',level:voice==='drone'?.16:.055,delay,bus:'music',sustain:true});
    },
    playDrum(type,at,accent){const delay=Math.max(0,at-context.currentTime);
      if(type==='low'){tone(95,34,.3,{type:'triangle',level:.38*accent,delay,bus:'music'});noise(.12,{level:.1*accent,frequency:900,delay,bus:'music'});}
      else{noise(.13,{level:.18*accent,frequency:1500,delay,bus:'music'});tone(185,72,.16,{level:.08*accent,delay,bus:'music'});}
    }
  });
  return Object.freeze({
    available:!!AudioContextClass,
    async setEnabled(value){
      if(!value){enabled=false;stop('effects');return;}
      prepare();await context.resume();
      if(context.state!=='running')throw new Error('Bitte den Retro-Ton durch einen direkten Klick im Browser aktivieren.');
      enabled=true;tone(261.63,329.63,.09,{type:'triangle',level:.06});
    },
    async setMusicEnabled(value){
      if(!value){musicEnabled=false;music.pause();stop('music');return;}
      prepare();await context.resume();
      if(context.state!=='running')throw new Error('Bitte die Kampfmusik durch einen direkten Klick im Browser aktivieren.');
      musicEnabled=true;if(playing)music.start();
    },
    setVolume(value){volume=Math.max(0,Math.min(.6,Number(value)||0));if(master)master.gain.setTargetAtTime(volume,context.currentTime,.025);},
    setMusicVolume(value){musicVolume=Math.max(0,Math.min(.6,Number(value)||0));if(musicMaster)musicMaster.gain.setTargetAtTime(musicVolume,context.currentTime,.025);},
    sync(progress){previous=progress;lastArrow=Math.floor(progress*8);lastImpact=Math.floor(progress*6);music.pause();music.seek(progress);stop();},
    start(progress){playing=true;previous=progress;lastArrow=Math.floor(progress*8);lastImpact=Math.floor(progress*6);if(progress===0){music.seek(0);cue('horn');}if(musicEnabled)music.start();},
    update(progress,isPlaying){
      playing=isPlaying;
      if(!playing||!enabled){previous=progress;return;}
      if(previous===null||progress<previous){previous=progress;lastArrow=-1;lastImpact=-1;return;}
      const crossed=SPECIAL_CUES.filter(item=>item.at>previous&&item.at<=progress);
      // Ein Sprung spielt nur den letzten passenden Moment, keinen Stapel alter Geräusche.
      if(crossed.length)cue(crossed.at(-1).type);
      const arrow=Math.floor(progress*8),impact=Math.floor(progress*6);
      if(progress>.62&&progress<2.74&&arrow!==lastArrow){lastArrow=arrow;cue('arrow');}
      if(progress>1.03&&progress<4.35&&impact!==lastImpact){lastImpact=impact;cue('impact');}
      previous=progress;
    },
    pause(){playing=false;music.pause();stop();},
    destroy(){enabled=false;musicEnabled=false;music.destroy();stop();if(context)void context.close();context=null;}
  });
}
