const regions=[
 {id:'nordwest',colour:'#5f8e38',locator:'I · Grün · Nordwesten',motif:'Zwei silberne gekreuzte Stadtschlüssel über einer kleinen goldenen Rosette auf Dunkelgrün; breiter elfenbeinfarbener Saum.',palette:['Dunkelgrün','Silber','Elfenbein']},
 {id:'west',colour:'#3e9b9c',locator:'II · Türkis · Westinsel',motif:'Ein silberner einzelner Brückenbogen unter einem roten kaiserlichen Siegelkreis auf Petrol; kupferfarbener Kantenbesatz.',palette:['Petrol','Silber','Ziegelrot']},
 {id:'sued',colour:'#b09a33',locator:'III · Gelb · Südliche Inseln',motif:'Drei rote rechteckige Gildenmarken fächerförmig über einer schwarzen Wellenlinie auf Altocker; dunkelroter schmaler Zinnensaum.',palette:['Altocker','Dunkelrot','Schwarz']},
 {id:'ost',colour:'#7064a8',locator:'IV · Violett · Ostufer',motif:'Ein offenes elfenbeinfarbenes Urkundenbuch unter einer kleinen goldenen Rosette auf Violett; silberne schmale Bogenborte.',palette:['Violett','Elfenbein','Altgold']},
 {id:'suedost',colour:'#ad6394',locator:'V · Rosa · Südöstliche Inselkette',motif:'Ein silberner Zinnenturm über drei kleinen roten runden Siegeln auf gedecktem Altrosa; dunkler Saum mit kleinen hellen Rauten.',palette:['Altrosa','Silber','Dunkelrot']}
];
const places=[
 ['nordwest-burg','Blutdorf','nordwest','Stadt',true,[17.2,14.0],[17.0,7.5],'Die Stadt auf der nördlichen Insel liegt oberhalb der inneren Inselbrücke. Blutdorf ist der Hauptort des grünen Herrschaftsgebiets.'],
 ['nordwest-ost','Dahlen','nordwest','Ortschaft',false,[20.7,21.7],[23.0,23.5],'Östliche Ortschaft derselben grünen Insel, abseits der großen Brückenachse.'],
 ['nordwest-steg','Erlenbach','nordwest','Ortschaft',false,[16.7,28.5],[16.4,31.5],'Kleine Ortschaft am Übergang zwischen grüner Nord- und türkisfarbener Westinsel.'],
 ['nordwest-ufer','Felsbrunn','nordwest','Ortschaft',false,[31.5,21.5],[29.0,17.5],'Der grüne Uferstreifen westlich der Blutstadt gehört nach deiner Farbaufteilung zum selben Bereich wie die Nordinsel.'],
 ['nordwest-bergwerk','Kappel','nordwest','Bergbausiedlung',false,[31.2,30.5],[28.6,34.9],'Die Bergbausiedlung liegt unmittelbar südlich von Felsbrunn im grünen Uferstreifen westlich der Blutstadt. Auf der gelieferten Karte sind die Gebäude und der Stolleneingang erkennbar.'],
 ['west-burg','Burg Rastenberg','west','Burg',true,[15.0,38.8],[15.0,37.0],'Großer befestigter Hauptort der Westinsel. Drei äußere Brückenanschlüsse treffen in diesem Inselbereich zusammen.'],
 ['west-nord','Buchen','west','Ortschaft',false,[8.8,34.2],[7.8,29.7],'Ortschaft am nordwestlichen Brückenkopf der Westinsel.'],
 ['west-sued','Kesten','west','Ortschaft',false,[12.3,47.1],[11.4,51.7],'Südwestlicher Brückenkopf der türkisfarbenen Insel.'],
 ['west-ost','Oberried','west','Ortschaft',false,[20.0,43.0],[23.0,41.0],'Östlicher Brückenkopf der Westinsel, auf dem Weg zur gelben Inselgruppe.'],
 ['sued-burg','Burg Blutstein','sued','Burg',true,[43.9,49.0],[44.0,45.3],'Burg unmittelbar südlich des großen Stadttores. Die Brücken führen westwärts weiter und ostwärts in den violetten Bereich.'],
 ['sued-west','Lahr','sued','Ortschaft',false,[30.0,55.3],[28.2,51.5],'Westlicher Ort auf der langen gelben Brückeninsel.'],
 ['sued-ost','Niederwerth','sued','Ortschaft',false,[37.4,59.7],[37.8,64.4],'Östlicher Ort derselben gelben Insel, an der Brücke zur Hauptburg.'],
 ['sued-ferne','Birkenau','sued','Ortschaft',false,[25.3,75.1],[25.3,81.0],'Kleine abgesetzte gelbe Insel im südwestlichen See.'],
 ['ost-stadt','Kronberg','ost','Stadt',true,[61.9,42.8],[62.2,47.0],'Befestigter Stadtort am Fuß des Berglandes östlich der Blutstadt.'],
 ['ost-west','Friedberg','ost','Ortschaft',false,[56.5,41.4],[56.7,37.0],'Kleine Ortschaft am westlichen Rand des violetten Uferbereichs.'],
 ['ost-nord','Steinrode','ost','Ortschaft',false,[67.3,39.2],[68.1,35.3],'Östliche, teilweise von Wolken verdeckte Ortschaft unter den Bergen.'],
 ['ost-bruecke','Rethen','ost','Ortschaft',false,[55.4,50.7],[54.5,55.5],'Violetter Brückenort zwischen südlicher Burginsel und rosa Inselkette.'],
 ['suedost-burg','Burg Ewigwacht','suedost','Burg',true,[64.7,59.8],[66.0,65.6],'Große Burg auf der mittleren rosa Insel, an einer Verzweigung der Brücken.'],
 ['suedost-steg','Hollern','suedost','Ortschaft',false,[76.4,72.1],[76.0,67.0],'Ortschaft am ersten südöstlichen Brückenabschnitt.'],
 ['suedost-ende','Altwiek','suedost','Ortschaft',false,[85.9,82.3],[85.2,88.6],'Äußerer Ort der südöstlichen Brückenkette.'],
 ['suedost-innen','Ewigblick','suedost','Ortschaft',false,[51.9,71.5],[51.5,76.6],'Kleine unverbundene rosa Insel südlich der Stadtausfahrt.'],
 ['suedost-aussen','Stegen','suedost','Ortschaft',false,[93.7,71.1],[92.6,76.4],'Äußere rosa Insel im östlichen See, ohne eingezeichnete Brücke.']
];
export const settlements=Object.freeze([
 {id:'blutstadt',name:'Blutstadt',regionName:'Freie Stadtgemeinde',county:null,administrationLabel:'Bürgermeister und Rat',kind:'Stadt der Gilden · ehemalige Kaiserstadt',point:[49,23],pin:[47,12],label:[49,30],art:'blutstadt',geography:'Das politische Zentrum wird durch Bürgermeister und Rat regiert. Alle fünf Aristokratenhäuser besitzen hier eine vorgeschlagene Stadtresidenz; diese Stadthäuser vergeben keine Inselgebiete und kein Ratsamt.'},
 ...places.map(([id,name,county,kind,principal,point,label,geography])=>({id,name,county,kind,principal,seatType:kind==='Burg'?'castle':kind==='Stadt'?'town':'settlement',point,pin:[point[0],point[1]-6],label,art:county,regionName:regions.find(r=>r.id===county).locator,geography}))
].map(Object.freeze));
export const counties=Object.freeze(regions.map((r,i)=>Object.freeze({...r,name:`Aristokratisches Herrschaftsgebiet ${i+1}`,title:'Aristokratisches Herrschaftsgebiet',art:r.id,seats:places.filter(p=>p[2]===r.id).map(p=>p[0])})));
export const territoryArt=Object.freeze([
 ...counties.map(c=>({id:c.id,name:`${c.name} · ${c.locator}`,kind:'Freies Gebietszeichen · keinem Haus zugeteilt',shape:'banner',motif:c.motif,palette:c.palette,image:`assets/territories/${c.id}.webp`,fullsize:`assets/production/${c.id}.png`,geography:'Das Banner bezeichnet ausschließlich diesen Kartenbereich. Es überträgt weder Herrschaftsrechte noch ein Hauswappen.'})),
 {id:'blutstadt',name:'Blutstadt',kind:'Geliefertes Stadtwappen',shape:'circle',motif:'Gekreuzte silberne Schlüssel mit senkrechtem Stab auf tiefrotem Feld und schwarzem Außenring.',palette:['Tiefrot','Silber','Schwarz'],image:'assets/crests/blutstadt.webp',fullsize:'assets/originals/blutstadt.png',geography:'Das Stadtzeichen steht über den einzelnen Hausinteressen.'}
].map(Object.freeze));
