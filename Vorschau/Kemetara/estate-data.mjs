const estate=(id,name,commonTitle,description)=>Object.freeze({id,name,commonTitle,description,present:true,image:'assets/estates/previews/'+id+'.webp',fullsize:'assets/estates/production/'+id+'.png'});
export const ESTATES=Object.freeze([
 estate('nesut','Nesut','Königlicher Stand','Die pharaonische Familie bildet den königlichen Stand. Sie steht an der Spitze der Monarchie und erhält ein eigenes Familienwappen neben dem Landeszeichen.'),
 estate('tjaty','Tjaty','Hoher Landadel','Die hohen Landadelsfamilien führen die Stadtherrschaften. Im Ausgangsentwurf besitzt jede der übrigen vollständig benannten Städte eine Tjaty-Familie.'),
 estate('sesh','Sesh','Niederer Adel','Kleinere Adelsfamilien besitzen einzelne Orte, kleine Städte, Siedlungen oder Burgen. Eigene Sesh-Nebensitze sind noch nicht benannt.'),
 estate('hemnet','Hemnet','Gehobene freie Bürgerschicht','Hemnet umfasst die gehobene Bürgerschicht und schließt Krieger, Priester und weitere freie Bürger ein. Dieser Stand ist vom erblichen Landadel und von konkreten Tempelämtern zu unterscheiden.'),
 estate('remet','Remet','Freier Bürger','Remet bezeichnet die freien Bürger des Landes. Sie führen ihren Alltag als Bürger, Handwerker oder Händler; persönliche Familien und Vermögen sind noch nicht festgelegt.'),
 estate('baku','Baku','Leibeigener','Baku sind Leibeigene in einer der Sklaverei nahen Abhängigkeit. Sie verrichten die ihnen auferlegte Arbeit; ein ausführliches Abgaben- oder Freilassungsrecht ist noch nicht ausgearbeitet.')
]);
export const ESTATE_CONTEXT=Object.freeze({eyebrow:'Sechs gesellschaftliche Stände',title:'Pharaonenhaus, Landadel und Bürger.',
 introduction:'Die Bezeichnungen werden in der Einzahl angezeigt. Hemnet umfasst nach der ergänzten Nutzerfestlegung auch die gehobene Bürgerschicht.',
 addresses:[{title:'Stand und Tempelamt',text:'Die religiöse Hierarchie der Hohen Drei besitzt eigene Bezeichnungen. Nesut, Tjaty und Sesh beschreiben hier die weltliche Gesellschaftsordnung.'}]});
