import {renderPlacementSection} from '../shared/country-workbench/placement-section.mjs';
export function renderPlacementArea(){
 return renderPlacementSection({
  realm:'Mathringen',slug:'mathringen',mapEyebrow:'Vierundvierzig Kartensitze',
  mapIntro:'Die Originalkarte besitzt leere Namensschilder. Die eingeblendeten Städtenamen und Hauszuordnungen sind Vorschläge. Wappen lassen sich mit Maus oder Stift ziehen; für Touch und Tastatur stehen dieselben Ziele über die Auswahl bereit.',
  sourceMap:'assets/originals/mathringen-map.png',seatsEyebrow:'Land und Sitze',
  seatsTitle:'Vierundvierzig Orte und ihre Häuser.',
  seatsIntro:'Kronenwerth ist der Namensvorschlag für die größte Burg und damit der vorläufige Kaisersitz. Weitere Ränge oder innere Herrschaftsgrenzen werden aus den Kartensymbolen nicht abgeleitet.'
 });
}
