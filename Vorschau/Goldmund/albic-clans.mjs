const proposals = [
 {id:'mac-ruan',name:'Ruan',theme:'Albischer Clan · Hase und Moosgrün',description:'Ein kleiner albischer Clan in Goldmund, dessen Sitz im Entwurf noch offen ist. Ein naturweißer Hase auf moosgrün bemalten Brettern, eingefasst von einem schmalen dunklen Holzring. Ein ruhiges, schmuckloses Familienzeichen.'},
 {id:'mac-callan',name:'Callan',theme:'Albischer Clan · Krähe und Eisen',description:'Ein weniger wohlhabender albischer Clan in Goldmund. Eine schwarze Krähe auf einem ocker-grau geteilten Feld mit schrägen Brettern. Ein dunkler Eisenring mit Nieten und wenigen Kerbzeichen gibt dem Wappen einen eigenen, handfesten Charakter.'},
 {id:'an-brenn',name:'Brenn',theme:'Albischer Clan · Gerste und Birkenholz',description:'Ein bescheidener albischer Clan in Goldmund. Eine helle Gerstenähre liegt über einem schwarzen Querbalken auf rostroten waagerechten Brettern. Der helle Birkenholzrahmen trägt vier kleine geometrische Clanrunen und einfache Holzstifte.'},
 {id:'na-fenn',name:'Fenn',theme:'Albischer Clan · Fisch und Tauwerk',description:'Ein kleiner albischer Clan in Goldmund. Ein hellgrauer Flussfisch auf schieferblauen und graugrünen Wasserbändern. Ein schmaler Hanfseilring mit dunklen Bindungen fasst das Wappen ohne Edelmetall oder aufwendigen Zierrat.'}
];

export const albicClans = Object.freeze(proposals.map(clan=>Object.freeze({
 ...clan,clan:true,culture:'albic',crest:`crests/${clan.id}.webp`,
 fullsize:`assets/production/${clan.id}.png`,original:null,sourceOriginal:null,
 rank:'laird',sourceSeat:null,source:'Albischer Clanvorschlag',proposed:true,isNew:true
})));
