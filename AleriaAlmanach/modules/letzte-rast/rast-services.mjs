import { RAST_ART } from './rast-people.mjs';
const service=(title,icon,description,scope,terms)=>({title,icon,description:`<p>${description}</p>`,clients:'',scope,terms});
export function buildRastServices() {
  return {schemaVersion:1,commentThreadKey:'rast-services',pageTitle:'Dienste · Herberge und Gesellschaft',guildServicesPage:true,
    image:`${RAST_ART}/scenes/luxuszimmer.png`,imageWidth:30,imageTall:true,
    guildServices:{title:'Dienste der Letzten Rast',subtitle:'Gute Ruhe und ein aufmerksames Haus',
      introduction:'<p>Edern betreut die Herberge, Seren die Gesellschaften und Emlyn die Gastpferde. Jeder Preis nennt den enthaltenen Umfang; besondere Wünsche werden vorher vereinbart.</p>',
      services:[
        service('Einzelkammer',`${RAST_ART}/scenes/gaestezimmer.png`,'Eine ruhige eigene Kammer mit frischem Leinen, Waschzeug, Reinigung und einem sorgfältig bereiteten Frühstück.','Eine Person · eine Nacht','12 Kupfertaler'),
        service('Doppelkammer',`${RAST_ART}/scenes/gaestezimmer.png`,'Eine eigene Kammer für zwei Gäste mit frischem Leinen, Waschzeug, Reinigung und Frühstück für beide.','Zwei Personen · eine Nacht','20 Kupfertaler'),
        service('Suite Abendstern',`${RAST_ART}/scenes/luxuszimmer.png`,'Großes Himmelbett, eigener Sitzbereich am Kamin und Frühstück für zwei. Frisches Wasser und abendliches Herrichten sind eingeschlossen.','Bis zu zwei Personen · eine Nacht','48 Kupfertaler'),
        service('Einzelkammer für einen Hausmonat',`${RAST_ART}/scenes/gaestezimmer.png`,'Eine feste Einzelkammer für 36 Nächte einschließlich täglichem Frühstück, Reinigung und regelmäßigem Wäschewechsel.','Eine Person · 36 Nächte','396 Kupfertaler'),
        service('Doppelkammer für einen Hausmonat',`${RAST_ART}/scenes/gaestezimmer.png`,'Eine feste Doppelkammer für 36 Nächte einschließlich Frühstück für zwei, Reinigung und regelmäßigem Wäschewechsel.','Zwei Personen · 36 Nächte','660 Kupfertaler'),
        service('Gastpferd im Stall',`${RAST_ART}/scenes/aussenansicht.png`,'Ein sauberer Stallplatz mit Futter, Wasser, frischer Einstreu und gewöhnlicher Versorgung durch Emlyns Leute.','Ein Pferd · eine Nacht','4 Kupfertaler'),
        service('Kutschenplatz im Hof',`${RAST_ART}/scenes/aussenansicht.png`,'Ein geschützter Platz im bewachten Lieferhof. Zugtiere und aufwendige Reparaturen werden gesondert vereinbart.','Eine Kutsche · eine Nacht','3 Kupfertaler'),
        service('Privatsalon Grüne Laube',`${RAST_ART}/scenes/privatsalon.png`,'Der eigene Salon mit gedeckter Tafel, Kerzen und zugewiesenem Tischdienst. Speisen und Getränke werden nach Auswahl berechnet.','Bis zu sechs Gäste · ein Abend','36 Kupfertaler'),
        service('Bankett des Hauses',`${RAST_ART}/scenes/gedeckte-tafel.png`,'Drei abgestimmte Gänge nach dem Umfang der Tafel des Hauses, samt Geschirr und Tischdienst. Getränke und eine alleinige Salonreservierung sind gesondert.','Ab sechs Gästen · pro Person','78 Kupfertaler'),
        service('Weinbegleitung zur Tafel',`${RAST_ART}/scenes/gedeckte-tafel.png`,'Drei passende Gläser von je 0,10 l aus den geöffneten Weisenfluher Weinen. Die konkrete Auswahl wird vor dem Menü genannt.','Eine Person · drei kleine Gläser','24 Kupfertaler'),
        service('Warmes Bad',`${RAST_ART}/scenes/luxuszimmer.png`,'Frisch bereitetes warmes Wasser, saubere Tücher und ungestörte Zeit im Badezuber. Mit der Herbergsleitung vorab abstimmen.','Eine Person · ein Bad','6 Kupfertaler'),
        service('Gästewäsche',`${RAST_ART}/scenes/gaestebuch.png`,'Gewöhnliche Leinenwäsche wird gereinigt, getrocknet und ordentlich zurückgegeben. Seide, Pelz und besondere Stücke nach Prüfung.','Bis zu fünf einfache Stücke','4 Kupfertaler')
      ],footer:'Celtigerns Letzte Rast · Haus Vann · Ein Hausmonat zählt 36 Nächte.'}};
}
