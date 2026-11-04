"""Build explicit source-retained image jobs without performing API calls."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[3]
COUNTRY = ROOT / 'Vorschau/Leukonia'
PRESETS = json.loads((ROOT / 'AleriaAlmanach/docs/art/image-style-presets.json').read_text(encoding='utf-8'))['presets']
STYLE = PRESETS['fantasy-class-icon']['prompt']
REF = ROOT / 'AleriaAlmanach/docs/art/class-icon-style/morgorn-varor.png'
jobs = []
DESIGNS = [
    ('illustris','Illustris','Eine junge erwachsene kaiserliche Frau, anonyme Vertreterin der kaiserlichen Linie, keine bestimmte Kaiserin. Cremefarbene lange römische Stola, großer purpurner Mantel, silberner Lorbeerreif und silbernes Zepter. Ein charmant übertrieben stolzer Gesichtsausdruck, die andere Hand hebt den etwas zu langen Mantelsaum hoch. Die Komik kommt aus der selbstbewussten Pose und dem üppigen Stoff, ohne Übergewicht. Keine zusätzliche Dienerfigur.'),
    ('patrizier','Patrizier','Ein junger erwachsener Archon und sesshafter hoher Landadeliger mit kurz geschnittenem dunklem Haar. Weiße römische Toga mit breitem dunkelrotem Besatz über schlichtem Brustharnisch, ein goldener Siegelring, Sandalen. Er hält ein lustig großes Bündel aufgerollter Landurkunden mit beiden Armen und schaut selbstzufrieden über die Rollen hinweg. Keine Schrift auf den Urkunden.'),
    ('magnarier','Magnarier','Eine junge erwachsene Angehörige eines ritterfürstenähnlichen Hauses. Römisch-kampanischer silberner Schuppenpanzer, dunkelblauer kurzer Mantel, lederne Pteryges, schlichte Beinschienen, niedriger italischer Helm unter einem Arm. An der Hüfte ein kurzer gegürteter Spatha. Sie zeigt mit gespielt wichtigtuerischem Gesicht einen übergroßen bronzenen Hausschlüssel in der anderen Hand. Klar eigene Silhouette, kein Wiederholen des Toga-Entwurfs.'),
    ('mercantrier','Mercantrier','Ein junger erwachsener wohlsituierter Bürger aus einem guten ritterherrenähnlichen Bürgerhaus. Saubere salbeigrüne römische Tunika, helles Schultertuch, ordentliche Sandalen, gepflegtes kurzes Haar. Eine Hand hält ein kleines geschlossenes Haushaltsbuch, die andere einen wohlgefüllten aber nicht riesigen Geldbeutel. Er zählt mit nachdenklich hochgezogener Augenbraue an seinen Fingern und wirkt verschmitzt. Keine modernen Münzzeichen, keine Schrift.'),
    ('plebejer','Plebejer','Eine junge erwachsene Angehörige des gemeinen Volkes als freundliche römische Handwerkerin. Kurze terrakottafarbene Tunika, helle Schürze, einfaches Kopftuch und Sandalen. Sie balanciert einen Korb mit drei viel zu großen runden Broten auf der Hüfte, hebt vergnügt die andere Hand und schaut keck. Die Komik liegt in Proportion und Mimik; selbstbewusst, würdevoll und nicht verelendet.'),
    ('servi','Servi','Ein junger erwachsener leibeigener Landarbeiter in einfacher naturfarbener Tunika mit einem sichtbaren grünen Flickstück, Schnurgürtel, schlichten Sandalen und kleinem Strohhut. Er hält eine komisch große Rübe mit beiden Händen vor dem Bauch und schaut freundlich verblüfft auf seine Ernte. Seine Stellung wird über einfache Arbeitskleidung gezeigt. Keine Ketten, keine Fesseln, keine Demütigung, keine Gewalt und kein Unterwürfigkeitsgestus.')
]
for ident,name,design in DESIGNS:
    prompt = '\n\n'.join([
        'Asset type: Eine einzelne ulkige Comicillustration für die Gesellschaftsschicht ' + name + ' des Fantasy-Kaiserreichs Argentum. Kein Klassenicon und keine konkrete historische Person; die Referenz liefert ausschließlich den Zeichenstil.',
        STYLE,
        'Motiv und kulturelle Gestaltung: ' + design,
        'Alle Figuren sind Menschen mit menschlichen Ohren und römisch-lateinisch-kampanischer Kleidung. Charmante große ausdrucksvolle Köpfe und kurze Comicproportionen, deutliche zweidimensionale Farbflächen. Die Figur allein im 2:3-Hochformat, höchster Kopfschmuck bis beide Füße sichtbar, mindestens 6 Prozent freier Rand. Keine Schrift, Beschriftung, Sprechblasen, Wappenrahmen oder Umgebung. Echter transparenter Hintergrund ohne den Farbdunst, Boden oder Schatten der Referenz. Nur eine Figur.'
    ])
    jobs.append({'id':'caste-'+ident,'category':'castes','name':name,'prompt':prompt,'transparent_background':True,'referenced_image_paths':[str(REF)],'assetStem':ident})
manifest = {'schemaVersion':1,'date':'2026-11-03','tool':'built-in image_gen.imagegen','purpose':'Six explicitly requested social-stratum comics; not portraits of named office holders.','jobs':jobs}
target = COUNTRY / 'sources/caste-generation-jobs.json'
target.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(jobs,ensure_ascii=False))
