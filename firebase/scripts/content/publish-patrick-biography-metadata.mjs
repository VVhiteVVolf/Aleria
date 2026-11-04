import { runPatrickMetadataFollowup } from './patrick-biography-metadata-followup.mjs';

const args=process.argv.slice(2),modes=['prepare','apply'].filter(mode=>args.includes('--'+mode));
if(modes.length!==1)throw Error('Genau --prepare oder --apply angeben.');
for(let index=0;index<args.length;index++){
  if(!['--prepare','--apply','--plan'].includes(args[index]))throw Error('Unbekanntes CLI-Argument.');
  if(args[index]==='--plan'){if(!args[index+1]||args[index+1].startsWith('--'))throw Error('Privater Planpfad fehlt.');index++;}
}
const at=args.indexOf('--plan');if(at<0)throw Error('--plan ist erforderlich.');
console.log(JSON.stringify(await runPatrickMetadataFollowup({mode:modes[0],planPath:args[at+1]})));
