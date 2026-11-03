import { runPatrickBiographyPublication } from './patrick-biography-publication.mjs';

// Applying is an explicit separate operation. The preparing agent never calls it.
const args = process.argv.slice(2), modes = ['prepare','apply','check','verify-published'].filter(mode => args.includes('--'+mode));
if(modes.length!==1) throw Error('Genau --prepare, --apply, --check oder --verify-published angeben.');
const value = key => { const index=args.indexOf(key); return index<0?undefined:args[index+1]; };
const allowed = new Set(['--prepare','--apply','--check','--verify-published','--plan','--now','--public']);
for(let index=0;index<args.length;index++) {
  if(!allowed.has(args[index])) throw Error('Unbekanntes CLI-Argument.');
  if(['--plan','--now'].includes(args[index])) { if(!args[index+1]||args[index+1].startsWith('--')) throw Error('Argumentwert fehlt.'); index++; }
}
if(!value('--plan')) throw Error('--plan mit privatem Planpfad ist erforderlich.');
console.log(JSON.stringify(await runPatrickBiographyPublication({mode:modes[0],planPath:value('--plan'),now:value('--now'),publicOnly:args.includes('--public')})));
