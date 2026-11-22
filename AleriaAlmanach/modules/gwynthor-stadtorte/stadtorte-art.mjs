import { readFileSync } from 'node:fs';
import { GWYNTHOR_CITY_PLACES, cityPlaceSceneVersion } from './stadtorte-scenes.mjs';

const style = readFileSync(new URL('../../docs/art/portrait-scene-approved-20261109.txt', import.meta.url), 'utf8').trim();
export const CITY_PLACES_STYLE_REFERENCE = 'AleriaAlmanach/docs/art/portrait-experiments/2026-11-09/kyrwyn-experimental-v3.png';
export const CITY_PLACES_MAP_REFERENCE = 'Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/display/gwynthor-normal-2048-q90.webp';
export const CITY_PLACES_GUARD_REFERENCE = 'Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/assets/cochllamwyr-v1.png';
const direction = 'Use case: stylized-concept. Erzeuge EIN eigenständiges hochformatiges 2:3-Szenenbild für Aleria. Bildreferenz 1 definiert ausschließlich die matte feine Animezeichnung, NICHT die porträtierte Figur, Kleidung oder Innenraum. Bildreferenz 2 definiert ausschließlich Gwynthors räumliche Grundsprache: große wasserumflossene Stadt, steinerne Torbrücken, runde Mauertürme mit gedeckten roten Kegeldächern, dichte Dachstaffeln, südlicher Hafen und gotische Kathedrale im Kern. KEINE Karte zeichnen. Gälisch-mittelalterliche Metropole. Aktuelle Nutzerregie: Weniger ist mehr. Eher abstrakt und vereinfacht statt detailgetreue Rekonstruktion; genau ein Hauptmotiv, wenige große Formen, großzügige ruhige Flächen. Monumentaler städtischer Maßstab und ferne Dachstaffeln vermitteln die Metropole, nicht tausend kleine Details. Drei bis fünf klar getrennte räumliche Ebenen, wenige kleine anonyme Stadtmenschen, keine benannten Figuren. Keine Fototexturen, kein Wimmelbild, keine scharfen Einzelziegel, keine moderne Ausstattung, keine lesbare Schrift, keine UI, keine Karte, kein Rahmen, kein Wasserzeichen. Deckende vollständige Umgebung.';

const gateCorrection = 'AKTUELLE AUSDRÜCKLICHE NUTZERKORREKTUR, hat Vorrang vor allen älteren Motivangaben: Das gezeigte Stadttor IMMER VOLLSTÄNDIG GESCHLOSSEN halten. Zwei schwere zusammenstoßende hölzerne eisenbeschlagene Torflügel verschließen den ganzen Torbogen bis zum Boden, kein Spalt, keine offene Nebenpforte, kein Blick durch den Torbogen, keine hindurchgehenden Menschen. DAVOR stehen ZWEI COCHLLAMWYR-STADTWACHEN. Aus Referenz 2 exakt deren Ausrüstung übernehmen: edle stählerne Rüstung mit dezenten Messingkanten, geschlossene Wangenstücke am Helm und kleiner roter Helmkamm, rote Mäntel, Speere und rote/schwarze Stadtschilde mit goldenem Wyvern über goldener Burg und Wellen. Die Schilde dem Bildmaßstab entsprechend vereinfacht, aber eindeutig. Keine einfachen ungerüsteten Dorfwachen. Menschen stehen still oder warten, niemand läuft durch das Tor. Eine eventuelle offene STALLHOF-Tür ist nicht das Stadttor; das STADTTOR bleibt geschlossen. Stadtlandschaft oberhalb der Mauer nur als wenige weiche Dachstaffeln: KEINE überdimensionale Kathedrale auf neuem Berg. Weniger Oberflächendetails: Wände überwiegend ruhige Flächen, keine einzeln betonten Steinblöcke oder Dachziegel. Bild bleibt im matten Anime-Szenenstil.';
const cityGateRule = 'Alle sichtbaren Stadttore bleiben vollständig geschlossen. Dieses Motiv benötigt keine zusätzliche Toransicht: keine offenen Torbögen hinzufügen. Stadtmaßstab nur mit wenigen weichen Dachstaffeln, keine überdimensionale Kathedrale auf einem erfundenen Berg. Wände, Boden und Dachflächen überwiegend ruhig und flächig, nicht jeden Stein oder Dachziegel einzeln zeichnen.';

const districtSceneReferences = {
  'altstadt-alte-kathedrale': 'zentrum-kathedralbrunnen-v1',
  'altstadt-burgplatz': 'zentrum-plaza-v1',
  'altstadt-kleiner-hain': 'zentrum-park-v2',
  'nordtor-bruecke': 'westtor-torbruecke-v2',
  'nordtor-vorort': 'westtor-vorort-v2',
  'vorstadt-gassen': 'westtor-vorort-v2',
  'vorstadt-gwyllach-wagenplatz': 'westtor-ankunftsplatz-v2',
  'vorstadt-zirkuswiese': 'westtor-vorort-v2'
};
const districtGateRule = 'Das Stadttor ist vollständig geschlossen. Zwei eisenbeschlagene hölzerne Flügel treffen ohne Spalt zusammen, ohne offene Nebenpforte. Davor stehen zwei Cochllamwyr nach Referenz 4 mit stählerner Rüstung, kleinem rotem Helmkamm, roten Mänteln und den rot-schwarzen Stadtschilden mit goldenem Wyvern über Burg und Wellen. Niemand passiert das Tor.';

export const CITY_PLACES_ART_BRIEFS = Object.freeze(GWYNTHOR_CITY_PLACES.flatMap(place => place.scenes.map(scene => {
  const version = cityPlaceSceneVersion(place, scene), gate = /^(osttor|westtor)-/.test(scene.id);
  const parkEdit = scene.id === 'zentrum-park';
  const brief = {
    id: scene.id, moduleId: place.id, preset: 'anime-scene-portrait', version,
    destination: `AleriaAlmanach/public/assets/gwynthor-stadtorte/${scene.id}-v${version}.webp`,
    original: `AleriaAlmanach/assets/gwynthor-stadtorte/generated/${scene.id}-v${version}.png`
  };
  const districtReference = districtSceneReferences[scene.id];
  if (scene.id === 'altstadt-burgplatz' && version === 2) {
    return {
      ...brief,
      references: ['AleriaAlmanach/assets/gwynthor-stadtorte/generated/altstadt-burgplatz-v1.png', CITY_PLACES_STYLE_REFERENCE],
      prompt: `Use case: precise-object-edit. Bearbeite nur das erste Bild. Referenz 2 ist ausschließlich Zeichenstil. Behalte das hochformatige 2:3-Bild mit demselben Blickwinkel, dem offenen Festplatz, den sichtbaren niedrigen Fundamentmauern und der Spur im Pflaster. Behalte die Marktstände, wenigen Personen, Stoffwimpel, Bäume, das Sonnenlicht und die Altstadthäuser im Vordergrund. Ändere ausschließlich den oberen Hintergrund HINTER den vorderen Häusern. Entferne die ganze große Kathedrale auf dem Hügel und den Hügel selbst. Ergänze dort stattdessen nur eine niedrige, nah anschließende Staffel schlichter älterer Altstadtdächer auf ungefähr der Höhe der bestehenden Dächer, mit etwas blauem Himmel darüber. Kein hoher Turm, keine Ersatzkirche, kein Palast, keine Burgsilhouette, kein Berg. Dadurch bleiben Festplatz und Burgfundamente das einzige Hauptmotiv. Halte fein gezeichnete matte Anime-Flächen und sparsames Oberflächendetail wie im ursprünglichen Bild. Keine lesbare Schrift.\n\nVerbindlicher Projektstil:\n${style}`
    };
  }
  if (districtReference) {
    return {
      ...brief,
      references: [CITY_PLACES_STYLE_REFERENCE, CITY_PLACES_MAP_REFERENCE,
        `AleriaAlmanach/assets/gwynthor-stadtorte/generated/${districtReference}.png`,
        ...(scene.guardedGate ? [CITY_PLACES_GUARD_REFERENCE] : [])],
      prompt: `Use case: stylized-concept. Ein eigenständiges hochformatiges Szenenbild für Aleria im Format 2:3. Referenz 1 bestimmt die matte feine Animezeichnung, Referenz 2 nur die Geografie; das Ergebnis ist keine Karte. Referenz 3 zeigt Linienführung, räumlichen Maßstab und reduzierte Flächen einer bereits freigegebenen Gwynthor-Szene; erstelle entsprechend der folgenden Motivbeschreibung einen anderen Schauplatz, keine Kopie. ${scene.guardedGate ? 'Referenz 4 bestimmt die Ausrüstung der Stadtwachen.' : ''}\n\nVerbindlicher Projektstil:\n${style}\n\nKonkretes Motiv:\n${scene.subject}\n\nEin Hauptmotiv und wenige große Raumformen. Platziere die für die Szene wichtigsten Dinge in der unteren Bildmitte, damit sie auch im schmalen mobilen Ausschnitt lesbar bleiben. Warme bis natürliche matte Farbflächen mit klaren feinen Konturen, sparsame Texturen. Keine Schrift, keine Karte, keine modernen Details, kein Rahmen oder Wasserzeichen. ${scene.guardedGate ? districtGateRule : ''}`
    };
  }
  return {
  ...brief,
  references: gate ? [`AleriaAlmanach/assets/gwynthor-stadtorte/generated/${scene.id}-v1.png`, CITY_PLACES_GUARD_REFERENCE, CITY_PLACES_STYLE_REFERENCE, CITY_PLACES_MAP_REFERENCE]
    : parkEdit ? ['AleriaAlmanach/assets/gwynthor-stadtorte/generated/zentrum-park-v1.png', CITY_PLACES_STYLE_REFERENCE] : [CITY_PLACES_STYLE_REFERENCE, CITY_PLACES_MAP_REFERENCE],
  prompt: gate
    ? `Use case: precise-object-edit. Bild 1 ist das zu korrigierende Szenenbild. Erhalte Ort, Hochformat 2:3, Hauptmotiv und ruhigen Anime-Zeichenstil. Bild 2 ist ausschließlich die verbindliche Ausrüstungsreferenz der Cochllamwyr. Bild 3 ist ausschließlich die matte Anime-Stilreferenz. Bild 4 ist ausschließlich die Geografiereferenz.\n\n${gateCorrection}\n\nVerbindlicher Projektstil:\n${style}\n\nDas Hauptmotiv bleibt: ${scene.title}. Erhalte Brunnen, Stall und Pferd bei der inneren Osttoransicht, Brunnen und Wagenhof bei der inneren Westtoransicht, Häuser vor der Mauer bei den Vororten, Brücke bei den direkten Toransichten. Kein neuer Bildinhalt außerhalb dieser gezielten Korrektur.`
    : parkEdit ? `Use case: precise-object-edit. Bild 1 ist das zu korrigierende Parkbild, Bild 2 ausschließlich die matte Anime-Stilreferenz. Behalte exakt die drei großen Bäume, den geschwungenen breiten Parkweg, die offenen Rasenflächen, die Bank, die kleinen Spaziergänger, das Hochformat 2:3 und den ruhigen Zeichenstil. Ändere NUR den Hintergrund hinter dem Park. Der Park liegt MITTEN IM STADTZENTRUM INNERHALB GWYNTHORS. Entferne vollständig den Fluss, die Uferzone, die Zinnenmauer und die runden äußeren Stadtmauertürme. An deren Stelle direkt jenseits des Parkrasens eine Straße und eine nahe zusammenhängende Reihe hoher drei- bis viergeschossiger mittelalterlicher Stadthausfassaden mit Schiefer- und roten Dächern, vereinfacht in wenigen ruhigen matten Flächen. Dahinter nur wenige weitergestaffelte Dachformen der Metropole. Kein Blick auf eine ganze Stadt von außen, keine Burg, keine Kathedrale auf einem Berg, kein See oder Kanal. Der Park ist von innenstädtischen Häusern umgeben, die Stadt bleibt Umgebung und wird kein zweites Hauptmotiv. Keine feinen Einzelziegel, kein zusätzlicher Schmuck, keine neuen Personen oder Requisiten.\n\nVerbindlicher Projektstil:\n${style}`
    : `${direction}\n\nVerbindlicher Projektstil:\n${style}\n\nKonkretes Motiv:\n${scene.subject}\n\n${cityGateRule}`
};
})));
