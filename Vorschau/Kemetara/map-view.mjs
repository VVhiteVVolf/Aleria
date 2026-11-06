import {renderPlacementSection} from '../shared/country-workbench/placement-section.mjs';
export function renderPlacementArea(){
 return renderPlacementSection({
  realm:'Kemetara',slug:'kemetara',mapEyebrow:'Dreizehn vollständig benannte Stadtsitze',
  mapIntro:'Ein Wappen mit Maus oder Stift ziehen oder Haus und Ziel über die Auswahl bestimmen. Der angeschnittene östliche Ort sowie die unbenannten Randorte sind auf Nutzeranweisung keine Ziele des Entwurfs.',
  sourceMap:'assets/originals/kemetara-map.png',seatsEyebrow:'Nesut und zwölf Tjaty-Familien',
  seatsIntro:'Die pharaonische Familie sitzt im Hauptstadtvorschlag Saqqarekhet. Jede der zwölf weiteren benannten Städte erhält ein hohes Landadelshaus. Ein freier Sitzwechsel verändert den Hausstand nicht.'
 });
}
