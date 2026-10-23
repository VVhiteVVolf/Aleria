// Eigene kurze Komposition: D-dorische Melodie, tiefer Bordun, schwere Trommelschläge.
// Das Tempo folgt der Audio-Uhr, nicht dem Tempo der Schlachtanimation.
export const BATTLE_MUSIC_BPM=76;
export const BATTLE_MUSIC_STEPS=64;
const melody=new Map([
  [0,[62,2]],[2,[69,1]],[3,[67,1]],[4,[65,2]],[6,[64,2]],
  [8,[62,3]],[11,[60,1]],[12,[57,4]],
  [16,[62,2]],[18,[65,2]],[20,[67,3]],[23,[69,1]],
  [24,[67,2]],[26,[65,1]],[27,[64,1]],[28,[62,4]],
  [32,[69,3]],[35,[72,1]],[36,[71,2]],[38,[69,2]],
  [40,[67,2]],[42,[69,1]],[43,[67,1]],[44,[65,4]],
  [48,[64,2]],[50,[65,2]],[52,[67,2]],[54,[64,2]],
  [56,[62,3]],[59,[57,1]],[60,[62,4]]
]);

export function createBattleMusic({time,playNote,playDrum,setTimer=globalThis.setInterval,clearTimer=globalThis.clearInterval}) {
  const eighth=60/BATTLE_MUSIC_BPM/2;
  let timer=null,step=0,nextAt=0;
  function schedule(){
    while(nextAt<time()+.14){
      const index=step%BATTLE_MUSIC_STEPS,bar=Math.floor(index/8),beat=index%8;
      if(beat===0){
        const root=[38,38,36,38,43,41,36,38][bar];
        playNote(root,eighth*7.8,nextAt,'drone');
        playNote(root+7,eighth*7.8,nextAt,'fifth');
      }
      const note=melody.get(index);
      if(note)playNote(note[0],eighth*note[1]*.9,nextAt,'lead');
      if(beat===0||beat===4)playDrum('low',nextAt,beat===0?1:.75);
      if(beat===6||(bar%2===1&&beat===3))playDrum('wood',nextAt,.6);
      nextAt+=eighth;step++;
    }
  }
  return Object.freeze({
    start(){if(timer!==null)return;nextAt=time()+.04;schedule();timer=setTimer(schedule,50);},
    pause(){if(timer!==null)clearTimer(timer);timer=null;},
    seek(progress){step=Math.floor(Math.max(0,Math.min(5,progress))/5*BATTLE_MUSIC_STEPS);},
    destroy(){if(timer!==null)clearTimer(timer);timer=null;}
  });
}
