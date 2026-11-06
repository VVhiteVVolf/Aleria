const prototype=(id,name,description,equipment,helmet,extra={})=>Object.freeze({id,name,role:name,description,equipment,helmet,...extra,image:'assets/warriors/previews/'+id+'.webp',fullsize:'assets/warriors/production/'+id+'.png'});
export const CLASS_PROTOTYPES=Object.freeze([
 prototype('nakhtu','Nakhtu','Der schlichte Waffenknecht führt Speer und Langschild. Seine einfache Ausrüstung eignet sich für den gewöhnlichen Wachdienst und den Kampf in der Fußtruppe.','Speer, Langschild','Schlichte kemetarische Kopfbedeckung'),
 prototype('medjay','Medjay','Ein gut gerüsteter Kämpfer mit dem Khopesh. Der Köcher auf seinem Rücken gehört zur festgelegten Ausrüstung.','Khopesh, Rückenköcher','Ägyptisch geprägter Helm oder gepolstertes Kopftuch'),
 prototype('seneni','Seneni','Der Mariner kämpft mit einer Harpune. Seine bewegliche Ausstattung ist auf Fluss-, Küsten- und Schiffsdienst abgestimmt.','Harpune','Leichte kemetarische Kopfbedeckung'),
 prototype('maryannu','Maryannu','Ein berittener Khopesh-Kämpfer auf einem Nebtu. Der schlanke, gestreifte Nebtu steht für schnelle, wendige Einsätze; seine geringe Tragkraft begrenzt die schwere Ausrüstung.','Khopesh, Reitausrüstung','Ägyptisch geprägter Reiterhelm',{mounted:true,mount:{name:'Nebtu',href:'../../Bestiarium/tiere/pferde/nebtu/'}}),
 prototype('ahau','Ahau','Ein schwer gepanzerter Axtkämpfer mit eindrucksvoller zeremonieller Rüstung. Die Gestaltung verbindet starken Schutz mit kemetarischer Pracht.','Streitaxt, schwere zeremonielle Rüstung','Prächtiger kemetarischer Zeremonialhelm'),
 prototype('neferu','Neferu','Die Darstellung zeigt eine kämpfende Klerikerin mit Streitkolben und Schild. Ihr geistlicher Bezug gilt der Religion der Hohen Drei.','Streitkolben, Schild','Klerikale kemetarische Kopfbedeckung')
]);
