import {runPatrickStaticAssets} from './patrick-biography-static-assets.mjs';
const args=process.argv.slice(2);
const modes=['prepare','check','apply','verify-published','check-assets'].filter(mode=>args.includes('--'+mode));
if(modes.length!==1)throw Error('Genau einen Static-Asset-Modus angeben.');
const options=new Set(['--prepare','--check','--apply','--verify-published','--check-assets','--plan','--now']);
for(let index=0;index<args.length;index++){
  if(!options.has(args[index]))throw Error('Unbekanntes CLI-Argument.');
  if(['--plan','--now'].includes(args[index])){if(!args[index+1]||args[index+1].startsWith('--'))throw Error('Argumentwert fehlt.');index++;}
}
const value=key=>{const index=args.indexOf(key);return index<0?undefined:args[index+1];};
if(!value('--plan'))throw Error('Privater --plan-Pfad erforderlich.');
console.log(JSON.stringify(await runPatrickStaticAssets({mode:modes[0],planPath:value('--plan'),now:value('--now')})));
