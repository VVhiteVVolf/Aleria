import { readFileSync, writeFileSync } from 'node:fs';
const file = 'AleriaAlmanach/docs/art/image-style-presets.json';
const data = JSON.parse(readFileSync(file, 'utf8'));
const preset = data.presets['fantasy-rpg-character'];
preset.styleRevision = '2026-10-24-matte-painted-reference-figures';
preset.userCorrection = '24. Oktober 2026: Der Nutzer verwirft sowohl die realistische Erstfassung als auch die spätere Comic-/Color-Bleed-/Ölfassung. Maßgeblich sind seine drei anschließend gelieferten freigestellten Ritterreferenzen: ruhige Ganzkörperposen, einfache Formen, matte gedeckte Farben, feine gleichmäßige Maltextur. Keine dramatischen Posen, kräftigen Comic-Outlines oder Farbspritzer.';
preset.transparentBackground = true;
preset.name = 'Freigestellte matte Fantasy-Hausfiguren';
preset.status = 'approved';
preset.approvedAt = '2026-10-24';
preset.approvalQuote = 'Genau so! Bitte überschreibe den stil, den wir vorher hatten auf diesen!';
preset.previousReferenceDirectory = preset.previousReferenceDirectory || preset.referenceDirectory;
preset.referenceDirectory = 'AleriaAlmanach/docs/art/character-style';
preset.approvedReferenceImage = 'AleriaAlmanach/docs/art/character-style/2026-10-24-approved-house-knight.png';
preset.approvedTestPromptManifest = 'AleriaAlmanach/docs/art/character-style/approved-style.json';
preset.referenceUsage = 'Vor jeder Generierung die freigegebene Hausritter-Referenz tatsächlich ansehen und als tatsächliche Bildreferenz mitgeben. Sie ersetzt die bisherigen Oblivion-Classes- und Comic-/Aquarell-/Ölvarianten. Motiv, Hausfarben, Wappen und Beruf wechseln; matte Malweise, ruhige Pose, vereinfachte Formen, feine Körnung und echte Freistellung bleiben erhalten.';
preset.designUsage = 'Nutzerklarstellung vom 24. Oktober 2026: Die Freigabe betrifft den künstlerischen Stil. Rüstungsdesign, Helm, Waffen, Kleidung und kulturelle Formensprache werden eigenständig passend zu Hausgeschichte, Herkunft und Beruf gewählt. Die westliche Plattenrüstung des Stilreferenzritters ist keine allgemeine Designvorlage. Venalysisch geprägte Häuser wie Cymrath kombinieren Ritter-, Legionärs- und byzantinische Lamellenrüstung mit geschlossenen legionärsartigen Helmen.';
preset.useFor = ['Kriegergalerie und Hausabbildungen', 'Ritter- und Klassenillustrationen', 'Beruflich passende bürgerliche Hausfiguren', 'Vollständige freigestellte Fantasy-Ganzkörperfiguren'];
preset.prompt = 'Stilrichtung: Freigestellte handgemalte Fantasy-Ganzkörperfigur im 2:3-Hochformat, eng an den drei vom Nutzer am 24. Oktober 2026 gelieferten Ritterreferenzen orientiert. Ruhige aufrechte Dreiviertelpose, klare vollständige Silhouette bis zu den Füßen, leicht stilisierte und vereinfachte Proportionen. Große gut lesbare Rüstungs-, Stoff- und Werkzeugformen; weiche dünne gemalte Konturen und behutsame dunklere Formtrennungen. Matte gedeckte erdige Farben, weiche sparsame Schattierung und dezente gleichmäßige körnige Gouache-/Pigmenttextur. Metall und Stoff sind zurückhaltend gemalt, ohne Glanz oder realistische Materialdetails. Das Bild wirkt wie eine schlichte liebevoll gemalte historische Fantasy-Spielfigur. Ritter tragen zur Hausgeschichte passende Rüstung und Waffen, Bürgerliche belegte Berufs- oder schlichte Alltagskleidung. Hausfarben und Wappensymbole erhalten, in die gedeckte Palette übertragen. Echter transparenter PNG-Hintergrund, keine Umgebung, Bodenfläche, äußeren Schatten oder Papierfläche. Keine kräftigen schwarzen Comic-Outlines, keine realistische Haut, kein CGI, keine dramatische Beleuchtung, keine dicken Ölfarbstriche, keine Farbspritzer und keine auslaufenden Farbwolken außerhalb der Figur.';
data.applicationRules = data.applicationRules.map(rule => rule.startsWith('Die fünf Stilrichtungen nach Verwendungszweck getrennt verwenden:')
  ? 'Die fünf Stilrichtungen nach Verwendungszweck getrennt verwenden: freigestellte matte Fantasy-Hausfiguren nach der am 24. Oktober 2026 freigegebenen Referenz (2:3, ruhige Pose, einfache Formen, feine Pigmentkörnung, echte Transparenz), Anime-Szenen und -Porträts mit Lineart und Cel-Shading (2:3), freigestellte Fantasy-Inventaritems im belegten Item-Stil (1:1 mit echtem Alphakanal), verspielte Tusche-/Aquarell-Worldmap-Stamps (echter Alphakanal, keine äußeren Schatten), kreisrunde nordisch-keltische Wappen (innen deckend, nur außen transparent).'
  : rule);
writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log(preset.prompt);
