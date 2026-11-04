"""Retain the user's explicitly requested imperial Mede figure revision."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[3]
REALM=ROOT/'Vorschau/Leukonia'
preset=json.loads((ROOT/'AleriaAlmanach/docs/art/image-style-presets.json').read_text(encoding='utf-8'))['presets']['fantasy-rpg-character']['prompt']
design='''Den Krieger aus Bild1 vollständig zu einem überaus edlen kaiserlichen Prätorianerritter steigern: römischer Prätorianer trifft schwer gepanzerten höfischen Ritter. Seine Haltung bleibt ruhig, stolz, aufrecht und majestätisch. Ein junger erwachsener athletischer menschlicher Hauskrieger, keine konkrete Kaiserin und kein benannter Amtsträger.

Aufwendig gearbeiteter vollständiger silberelfenbeinfarbener Plattenharnisch mit reichen goldenen Einfassungen und plastisch flach getriebenen Olivenzweigen. Hoher gepanzerter Halskragen, große mehrlagige vergoldete Schulterplatten mit prätorianischem Pteryges-Unterbau, ganze gegliederte Panzerarme, geschlossene Plattenhandschuhe, schwere edle Knie- und Beinpanzer. Am Torso verbindet sich der klassische römische Muskelpanzer mit ritterlichen beweglichen Bauch- und Hüftplatten. Antike Pteryges aus dunkelpetrolfarbenem Samt und goldgefassten Panzerzungen über einem weißen kurzen Untergewand. Sehr luxuriöser breiter Gürtel mit rundem goldenen Olivenzweigsiegel. Das Hausmotiv aus Bild2 bleibt klar erhalten und erscheint an Brust, Schild und Mantelsaum; keine anderen Familienwappen.

Ein wirklich geschlossener kaiserlicher Prätorianer-Ritterhelm: hohe römisch-byzantinische Kalotte, goldener Lorbeerreif um die Stirn, reich gravierte Schläfen und ein nobles vollständiges silbernes Visier mit schmalen Augenschlitzen. Antik-menschliches glattes Gesichtsschema und gegliederter ritterlicher Halsabschluss. Sichtbar hochwertiger und aufwendiger als der alte glatte einfache Helm. Ein großer geschwungener elfenbeinweißer Längsbusch mit kleiner petrolfarbener Basis, vollständig im Bild; keine Krone mit Zacken und keine Tiermaske.

Ein üppiger knöchellanger Doppelmantel aus tiefem dunkelpetrolfarbenem Samt mit elfenbeinfarbener Innenseite, breiten gestickten goldenen Olivenranken und klassischer Mäanderkante. Zwei große goldene Schulterfibeln mit kurzer schwerer goldener Kette schließen den Mantel über dem Harnisch. Reich, pompös und eindeutig kaiserlich, ohne körperlich überbreite Fantasieschultern. Der Mantel gibt den Blick auf die edle komplette Panzerung und beide Füße frei.

Die rechte gepanzerte Hand hält ein langes prunkvolles Spatha-Ritterschwert mit goldener antiker Parierstange und verziertem Griff ruhig nach unten. Die linke gepanzerte Hand ruht auf einem großen ovalen dunkelpetrolfarbenen Prunkschild mit breitem silbernem Rand, Goldbeschlägen und dem großen goldenen Olivenzweig des Mede-Wappens. Ein klarer einzelner Schild, ein einzelnes Schwert, plausible Griffe. Keine bloße Farbänderung: Helm, Rüstungsaufbau, Stofffülle und Goldarbeit grundlegend deutlich reicher machen.'''
prompt='\n\n'.join([
    'EDIT TARGET: Bild1 ist der bisherige Mede-Hauskrieger. Bild2 ist ausschließlich das unveränderliche Mede-Wappenmotiv und seine Farbpalette. Bild3 ist ausschließlich die verbindliche matte Malstilreferenz. Die westliche Standardrüstung und blauen Farben der Stilreferenz nicht kopieren.',
    preset,
    'Neue direkte Nutzeranweisung: "viel mehr Prätorianer meets Gepanzerter Ritter ... richtig pompös, edel, Kaiserlich".',
    design,
    'Exakt1024x1536, 2:3 Ganzkörper. Höchster Helmbusch und ganze Schwertspitze bis beide vollständigen gepanzerten Füße sichtbar, mindestens fünf Prozent freier Rand. Gegenstände und Schmuck bleiben plausibel und klar lesbar. Großer Luxusgrad in Formen und Ornamenten, aber dieselbe vereinfachte matte handgemalte Pigmentdarstellung, keine realistische glänzende Metallrüstung, kein CGI und keine übertriebene fotorealistische Textur. Echter transparenter PNG-Hintergrund einschließlich offener Zwischenräume, kein Boden, Farbdunst, äußerer Schatten, Papier oder Schrift.'
])
job={
    'id':'warrior-house-mede-v2','houseId':'house-mede','assetStem':'house-mede-v2','category':'warriors',
    'prototypeId':'prototype-01','role':'Schwerer Infanterist',
    'description':'Kaiserlicher Prätorianerritter mit reich gearbeitetem Plattenharnisch, geschlossenem Lorbeerhelm und aufwendigem petrolfarbenem Prunkmantel.',
    'equipment':['Verziertes Spatha-Ritterschwert','ovaler Prunkschild','vollständiger Plattenharnisch','geschlossener Lorbeerhelm'],
    'palette':['Petrol','Elfenbein','Gold','Silber'],'mount':None,'supersedesAssetStem':'house-mede',
    'prompt':prompt,'transparent_background':True,
    'referenced_image_paths':[str(REALM/'assets/warriors/production/house-mede.png'),str(REALM/'assets/originals/mede.png'),str(ROOT/'AleriaAlmanach/docs/art/character-style/2026-10-24-approved-house-knight.png')]
}
manifest={'schemaVersion':1,'date':'2026-11-03','source':'Direkte Nutzerkorrektur im laufenden Auftrag','sourceRequest':'Schau dir nochmal das der Mede an, das muss viel mehr Prätorianer meets Gepanzerter Ritter sprechen, richtig pompös, edel, Kaiserlich','preservation':'V1 and supplied emblem remain unchanged; stable house identity and seat remain unchanged.','jobs':[job]}
(REALM/'sources/house-warrior-revisions.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(job,ensure_ascii=False))
