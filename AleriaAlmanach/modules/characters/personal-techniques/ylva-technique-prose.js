import { reviseWeaponTechniqueSave } from '../../combat-styles/weapon-technique-control.js';
// Character-specific presentation; class catalog mechanics remain shared.
export const YLVA_DUEL_OWNER_ID = 'bSYZYAEOwiRgy44f6OmO';
const prose = {
  'Der fallende Dorn': 'Ylva senkt Dornwacht unter die Deckung und zieht die Spitze in einen zweiten, steileren Stoß.',
  'Erster Jagdpfeil': 'Ylva legt den Pfeil an, findet ihr Ziel und löst mit einer knappen Bewegung der Finger.',
  'Ruhiger Atem': 'Ylva lässt den Atem ruhig ausströmen, bis Bogenhand und Blick auf derselben Linie liegen.',
  'Speer am Wildpfad': 'Aus festem Stand stößt Ylva gerade vor und führt Dornwacht unmittelbar in ihre Deckung zurück.',
  'Sax im Unterholz': 'Ylva schließt die Entfernung und drängt mit der kurzen Schneide gegen den Waffenarm.',
  'Schuss durch die Lichtung': 'Ylva wartet auf die schmale Lücke zwischen den Hindernissen und schickt den Pfeil hindurch.',
  'Grenzwächterschuss': 'Ylva zieht den Bogen bis an die Wange und legt ihr ganzes Gewicht in den gehaltenen Schuss.',
  'Pfeil auf kurze Distanz': 'Kaum liegt der Pfeil auf der Sehne, lässt Ylva ihn aus kurzem Auszug schnellen.',
  'Sax in der Hut': 'Ylva hält die kurze Schneide dicht vor dem Körper und folgt aufmerksam der gegnerischen Waffenhand.',
  'Speer aus dem Knie': 'Ylva sinkt in die Knie und schickt Dornwacht unter der hohen Deckung hindurch.',
  'Ziel zwischen den Zweigen': 'Ylvas Blick folgt der Bewegung hinter dem Geäst, bis sie den nächsten freien Augenblick erkennt.',
  'Schuss auf die Öffnung': 'Ylva hält die Sehne gespannt und löst genau in dem Augenblick, in dem sich die Deckung hebt.',
  'Leiser Standortwechsel': 'Mit einem flachen Schritt verändert Ylva den Winkel ihrer Deckung und lässt den erwarteten Hieb ins Leere zielen.',
  'Speer gegen den Schritt': 'Dornwacht trifft tief an die gegnerische Deckung und bringt Waffenhand und Stand aus dem Takt.',
  'Deckung im Unterholz': 'Ylva macht sich schmal hinter ihrer Waffe und hält die offenen Seiten geschlossen.',
  'Axt am Waffenarm': 'Ylva führt die kurze Schneide gegen den Waffenarm und stört dessen nächsten Ausholschwung.',
  'Voller Jagdauszug': 'Ylva spannt den Bogen mit ruhiger Kraft bis zum vollen Auszug und schickt den Pfeil mit Nachdruck ins Ziel.',
  'Stand hinter dem Speer': 'Ylva schließt beide Hände um Dornwacht und stemmt sich hinter dem quer gehaltenen Schaft gegen den Druck.',
  'Klinge am Wildwechsel': 'Ylva schneidet durch die offene Flanke und zieht die Waffe dicht an sich zurück, um den Gegenschlag abzufangen.',
  'Abstand mit dem Speer': 'Ylva stößt zur Mitte und lässt die Spitze anschließend zwischen sich und dem Gegner stehen.',
  'Versetzter Grenzpfeil': 'Ylva versetzt die Bogenhand, täuscht die Schusslinie an und löst auf die neu entstandene Lücke.',
  'Atem des Fährtenlesers': 'Ylva beruhigt ihren Atem und sammelt die Kraft, den nächsten Anprall abzufangen.',
  'Schafthebel': 'Ylva stößt durch die Deckung, hakt den Speerschaft hinter die geführte Waffe und hebelt sie mit einer kurzen Drehung aus dem Griff.',
  'Aus der Angriffslinie': 'Ylva liest Schulter und Waffenhand des Gegners und nimmt ihren Körper aus der angekündigten Stoßbahn.'
};

export function describeYlvaTechniques(techniques = []) {
  return techniques.map(source => {
    const entry = { ...source, secondarySave: reviseWeaponTechniqueSave(source.secondarySave, source.costs?.some(cost => cost.resourceId === 'special-action')) };
    if (!entry.secondarySave) delete entry.secondarySave;
    const narrative = prose[entry.name];
    if (!narrative) return entry;
    // Keep the authoritative mechanic wording, including future catalog revisions.
    const mechanics = String(entry.effect || entry.description || '').replace(narrative, '').trim().replace(/^\(|\)$/g, '');
    return { ...entry, description: `${narrative} (${mechanics})`, effect: `(${mechanics})` };
  });
}
