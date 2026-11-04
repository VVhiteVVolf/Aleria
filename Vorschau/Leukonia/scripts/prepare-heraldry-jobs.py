"""Retain the explicit Roman Campanian designs for Leukonia's requested heraldry."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[3]
REALM = ROOT / 'Vorschau/Leukonia'
PRESETS = json.loads((ROOT / 'AleriaAlmanach/docs/art/image-style-presets.json').read_text(encoding='utf-8'))['presets']
BASE = PRESETS['fantasy-heraldic-emblem']['prompt']
SOURCE = Path('C:/Users/fhg_r/Downloads/Länder/Das Kaiserreich Argentum/Tirnara Provinz')
REFS = [str(SOURCE / name) for name in ['Lex.png','Orania.png','Mede Wappen.png']]

# A selected symbol is a visual proposal, not a newly asserted genealogy or duty.
DESIGNS = [
('Wolf','Ein großer silberner Wolfskopf im klaren Seitenprofil nach links, kurzes geschlossenes Maul und scharfe aufrechte Ohren auf dunkelblauem Feld.','Silber','Dunkelblau','Altgold','EISEN','Schmaler Eisenring mit vier vergoldeten Mäandersegmenten und dazwischen glatten dunklen Flächen.'),
('Widder','Ein goldener Widder in ruhigem Seitenprofil mit deutlich eingerollten Hörnern auf dunkelrotem Feld.','Gold','Dunkelrot','Bronze','GOLD','Flacher antiker Perlstab zwischen zwei feinen Kreisbändern, ohne weitere Blätter.'),
('Keiler','Ein kräftiger schwarzer Keiler im Profil nach rechts, heller kleiner Hauer und geschlossene klare Silhouette auf ockergelbem Feld.','Schwarz','Ocker','Eisen','EISEN','Einfacher geschlossener Eisenring, nur acht kupferrote Rundnieten.'),
('Hirsch','Ein elfenbeinweißer stehender Hirsch mit gut lesbarem sechsendigem Geweih auf olivgrünem Feld.','Elfenbein','Olivgrün','Bronze','HOLZ','Dunkler glatter Holzrahmen mit schmalen bronzenen Palmetten an vier Stellen.'),
('Falke','Ein silberner Falke mit genau zwei ausgebreiteten Flügeln frontal, gerader schmaler Stoß, auf tiefem weinrotem Feld.','Silber','Weinrot','Schwarz','SILBER','Geschlossener Silberring mit zurückhaltendem graviertem Lorbeerband.'),
('Greif','Ein goldener aufgerichteter Greif im Profil nach links mit genau einem sichtbar gefalteten Flügel und einem Löwenschwanz auf dunkelgrünem Feld.','Gold','Dunkelgrün','Silber','SILBER','Silberner Ring mit klassischem römischem Wellenornament, kein keltischer Knoten.'),
('Reiher','Ein bronzefarbener Reiher mit langem Hals und genau zwei schlanken Beinen, ruhig stehend zwischen zwei kleinen elfenbeinfarbenen Schilfhalmen auf petrolfarbenem Feld.','Bronze','Petrol','Elfenbein','HOLZ','Sehr schlichter schwarzer Holzring mit einer dünnen bronzenen Innenkante.'),
('Löwe','Ein einzelner silberner Löwenkopf frontal mit stilisierter breiter Mähne auf fast schwarzem Feld.','Silber','Schwarz','Dunkelrot','EISEN','Geschlossener Eisenring mit vier dunkelroten antiken Palmetten, keine Krone.'),
('Eiche','Ein einzelner dunkelgrüner Eichenbaum mit kurzer kräftiger Wurzel und großer klarer runder Krone auf elfenbeinfarbenem Feld.','Dunkelgrün','Elfenbein','Silber','SILBER','Schmaler glatter Silberring mit sechs kleinen eingravierten Eicheln.'),
('Krabbe','Eine dunkelrote Krabbe von oben mit genau zwei großen Scheren und symmetrisch angeordneten acht dünnen Laufbeinen auf cremeweißem Feld.','Dunkelrot','Cremeweiß','Schwarz','EISEN','Dunkler glatter Eisenring mit feinem umlaufendem Silberwellenband.'),
('Skorpion','Ein goldener Skorpion von oben, zwei deutliche Scheren, gegliederter eingerollter Schwanz, acht Beine, klar stilisiert auf mattschwarzem Feld.','Gold','Schwarz','Kupfer','GOLD','Zurückhaltender Kupferring mit wiederkehrenden griechischen Rauten statt Runen.'),
('Steinbock','Ein silberner aufsteigender Steinbock im Profil nach rechts mit zwei nach hinten gebogenen Hörnern auf rostbraunem Feld.','Silber','Rostbraun','Dunkelbraun','HOLZ','Breiter dunkler Holzring, schmale eiserne Innenfassung und vier kleine silberne Nägel.'),
('Fackel','Eine einzelne goldene antike Fackel mit großer klarer elfenbeinfarbener Flamme auf dunkelblauem Feld; die Flamme bleibt heraldisch flach.','Gold','Dunkelblau','Elfenbein','EISEN','Einfacher Ring aus dunklem Eisen mit acht goldenen kurzen Strichen, keine Schrift.'),
('Amphore','Eine große cremeweiße antike Amphore mit genau zwei Henkelgriffen, dunkelgrüner Zierlinie und rundem Fuß auf terrakottafarbenem Feld.','Cremeweiß','Terrakotta','Dunkelgrün','HOLZ','Schmaler brauner Holzring mit bronzenem klassischem Eierstab.'),
('Lyra','Eine goldene antike Lyra mit sieben geraden sichtbaren Saiten auf dunklem purpurrotem Feld.','Gold','Purpurrot','Silber','SILBER','Geschlossener schmaler Silberring mit vier zurückhaltenden Akanthusblättern.'),
('Olivenzweig','Ein dunkelgrüner einzelner diagonaler Olivenzweig mit wenigen großen Blättern und fünf schwarzen Oliven auf elfenbeinfarbenem Feld.','Dunkelgrün','Elfenbein','Schwarz','EISEN','Rauer aber sauber geschlossener dunkler Eisenring ohne Schmuck außer einer dünnen kupfernen Innenkante.'),
('Granatapfel','Ein einzelner dunkelroter leicht geöffneter Granatapfel mit kleiner goldener Krone und zwei grünen Blättern auf blaugrauem Feld.','Dunkelrot','Blaugrau','Gold','GOLD','Dünner Goldring mit vier antiken geschlossenen Palmettenornamenten.'),
('Fisch','Ein großer silberner Fisch nach rechts in einem einfachen goldenen Wellenbogen auf tiefblauem Feld, nur ein Fisch.','Silber','Tiefblau','Gold','HOLZ','Dunkler Holzrahmen mit zweifacher feiner goldener Kordellinie.'),
('Eule','Eine goldene Eule frontal sitzend, große klare Augen und gefaltete Flügel auf schieferblauem Feld.','Gold','Schieferblau','Silber','SILBER','Silberring mit schlichtem griechischem Mäander in dunkler Einlage.'),
('Rabe','Ein schwarzer Rabe im Profil mit genau einem sichtbar gefalteten Flügel und leicht geöffnetem Schnabel auf elfenbeinfarbenem Feld.','Schwarz','Elfenbein','Bronze','HOLZ','Geschlossener breiter dunkler Holzring mit wenigen bronzenen Rundnieten.'),
('Bär','Ein cremeweißer stehender Bär im Profil nach links mit vier erkennbaren Tatzen auf tiefrotem Feld.','Cremeweiß','Tiefrot','Silber','SILBER','Sehr schmaler Silberring mit acht kleinen dunkelroten runden Emailpunkten.'),
('Windhund','Ein schlanker bronzefarbener Windhund im gestreckten Lauf mit vier deutlich getrennten Beinen auf olivgrünem Feld.','Bronze','Olivgrün','Cremeweiß','EISEN','Glatter dunkler Eisenring mit zurückhaltender römischer Blattgirlande in Bronze.'),
('Hirschkäfer','Ein silberner Hirschkäfer symmetrisch von oben, große geweihartige Kiefer und sechs Beine auf einem gedämpften weinroten Feld.','Silber','Weinrot','Schwarz','EISEN','Geschlossener glatter Eisenring mit vier schmalen silbernen Rauten.'),
('Palme','Eine goldene Palme mit einem Stamm und sieben großen gebogenen Wedeln auf dunkelpetrolfarbenem Feld.','Gold','Dunkelpetrol','Bronze','GOLD','Runder bronzefarbener Rand mit römischem Perlstab und schmaler goldener Innenkante.'),
('Ähren','Drei goldene Getreideähren mit großen klaren Körnern, am Fuß durch eine rote Schnur gebunden, auf cremeweißem Feld.','Gold','Cremeweiß','Rot','HOLZ','Schlichter dunkelbrauner Holzring mit vier goldenen Nägeln, keine überladene Verzierung.'),
('Brücke','Eine einzelne dunkelrote steinerne Brücke mit genau drei Bögen über zwei schiefergrauen Wellen auf elfenbeinfarbenem Feld; die Bögen sind mit Feldfarbe deckend gefüllt.','Dunkelrot','Elfenbein','Schiefergrau','SILBER','Geschlossener Silberring mit schlicht eingravierten quadratischen Mäandern.'),
('Leuchtturm','Ein einzelner silberner antiker Leuchtturm mit breiter Basis und goldener Flammenschale an der Spitze auf nachtblauem Feld.','Silber','Nachtblau','Bronze','EISEN','Dunkler Eisenring mit acht kleinen bronzenen Perlen und einfacher schmaler Silberlinie.'),
('Sonne','Eine klare goldene Sonne mit menschlosem rundem Zentrum und acht breiten Strahlen auf dunkelgrünem Feld.','Gold','Dunkelgrün','Schwarz','HOLZ','Schwarzer Holzring mit feinen goldenen konzentrischen Kreisen, keine anderen Symbole.'),
('Mondsichel','Eine breite silberne nach links geöffnete Mondsichel unter drei kleinen goldenen Sternen auf gedämpftem purpurfarbenem Feld.','Silber','Purpur','Gold','SILBER','Klassisches römisches Rankenband in dunklem Silber auf einem vollständig geschlossenen Ring.'),
('Äxte','Zwei einfache silberne einschneidige antike Kampfäxte mit dunklen Holzstielen diagonal gekreuzt auf rostrot bemaltem Feld.','Silber','Rostrot','Dunkelbraun','EISEN','Schlichter geschlossener dunkler Eisenring mit acht flachen kupferfarbenen Nieten.'),
('Sphinx','Eine goldene sitzende antike Sphinx im ruhigen Seitenprofil nach links mit menschlichem Gesicht, Löwenkörper und einem sichtbar gefalteten Flügel auf dunkelrotem Feld.','Gold','Dunkelrot','Silber','SILBER','Silberner Kreisrahmen mit zurückhaltendem griechischem Mäander und vier goldenen Palmetten.'),
('Leiter','Eine einzelne silberne Leiter mit genau fünf gleichmäßigen Sprossen auf dunkelrotem Feld.','Silber','Dunkelrot','Schwarz','HOLZ','Schwarzer glatter Holzring mit schmalem Silberbeschlag und vier sichtbaren silbernen Nägeln.'),
('Lorbeerkranz','Ein kräftiger dunkelgrüner Lorbeerkranz, vollständig innerhalb des Feldes, um eine einzelne goldene schmucklose Scheibe auf cremeweißem Feld.','Dunkelgrün','Cremeweiß','Gold','EISEN','Schmaler geschlossener Eisenring mit kleinen bronzenen Perlen.'),
('Schlange','Eine weiße Schlange windet sich in drei klar lesbaren Windungen um einen aufrechten dunklen antiken Speer auf olivgrünem Feld.','Weiß','Olivgrün','Eisen','EISEN','Geschlossener schmaler Eisenring mit zurückhaltendem silbernem Wellenband.')
]

def emblem_job(ident, stem, name, motif, colors, frame, ornament, kind):
    prompt = BASE
    for key, value in {'[NAME]':name,'[BESCHREIBUNG DES HAUPTMOTIVS]':motif,'[FARBE 1]':colors[0],'[FARBE 2]':colors[1],'[FARBE 3]':colors[2],'[EISEN / GOLD / SILBER / HOLZ]':frame,'[RUNEN / KELTISCHE KNOTEN / GEOMETRISCHE ORNAMENTE / KEINE VERZIERUNG]':ornament}.items():
        prompt = prompt.replace(key,value)
    prompt += '\n\nAktuelle kulturelle Vorgabe hat Vorrang vor dem allgemeinen nordisch-keltischen Satz: Dieses Wappen gehört zu Leukonia im römisch-lateinisch-kampanischen Kaiserreich Argentum. Antike römische und italisch-kampanische Malerei, Mäander, Perlstab, Palmetten und Akanthus statt keltischer Knoten, Runen oder nordischer Tierflechtungen. Die drei Referenzen geben ausschließlich die handgemalte klassisch-antike Kreiswappen-Darstellung vor. Keine ihrer konkreten Symbole kopieren. Klarer Hauptgegenstand, matte kräftige Pigmente auf bemalten Holzbrettern, exakter kreisrunder vollständig geschlossener Rahmen. Das neue Motiv eigenständig gestalten. Kein Text, keine Namensbanderole, keine Buchstaben oder Zahlen. Kein SPQR und keine reale Landesflagge. Keine äußere Krone, kein Rahmenüberstand, Schatten oder Farbdunst; ausschließlich außerhalb der äußersten Kreislinie echte Alpha-0-Transparenz. Innerhalb des Kreises einschließlich aller Zwischenräume Alpha255. Ein einziges Wappen auf 1:1 mit 7Prozent freiem Rand.'
    return {'id':ident,'assetStem':stem,'category':'emblems','kind':kind,'name':name,'motif':motif,'palette':colors,'frame':frame,'ornament':ornament,'shape':'circle','prompt':prompt,'transparent_background':True,'referenced_image_paths':REFS}

jobs=[emblem_job('province-leukonia','leukonia','Leukonia als Provinz','Ein großer silberweißer Stier ruhig im Profil nach links, mit vier klar getrennten Beinen und zwei Hörnern. Zwei kleine silberne Lorbeerzweige unter seinen Hufen. Dahinter ein tiefes dunkelrotes bemaltes Holzfeld. Sechs winzige goldene Rundsterne im oberen Feldbogen als Bildentwurf für die sechs Archonate, keine Krone.',['Silberweiß','Dunkelrot','Gold'],'SILBER','Breiter silberner Kreisring mit dunklem antikem Mäander und sechs flachen goldenen Rundnieten, alles innerhalb der exakten Kreislinie.','province')]
jobs[0]['active'] = False
jobs[0]['status'] = 'superseded-visual-proposal'
province_v2 = emblem_job('province-leukonia-v2','leukonia-v2','Leukonia als Provinz',
    'Ein silberweißer korinthischer Hoplit in voller klar lesbarer Ganzkörpersilhouette steht ruhig in leichter Dreiviertelansicht. Er trägt einen charakteristischen korinthischen Helm mit Nasenschutz, geschlossenen langen Wangenklappen und kleinem klassischem Helmkamm, antiken Muskelpanzer, kurzen Pterygesrock und Beinschienen. Mit dem erhobenen rechten Arm hält er einen abgeschlagenen Gorgonenkopf an den Schlangenhaaren hoch, wie das klassische Perseusmotiv. Der Gorgonenkopf ist eine ruhig blickende stilisierte silbergraue Maske mit sechs bis acht klaren kleinen Schlangenlocken, ohne Blut, Halswunde oder anatomische Schnittdetails. Der linke Arm hält einen kleinen schmucklosen runden Hoplitenschild seitlich am Körper. Der Kopf der Gorgone, die Hand und der Helm bleiben klar voneinander getrennt. Der ganze Hoplit mit beiden Füßen und dem hochgehaltenen Gorgonenkopf passt innerhalb des dunkelroten Wappenfeldes. Nur diese zentrale Heldengruppe, keine Stierfigur, keine zusätzlichen Sterne.',
    ['Silberweiß','Dunkelrot','Gold'],'SILBER',
    'Den vorhandenen breiten silbernen Kreisring mit dunklem antikem Mäander, goldenen Rundnieten und zurückhaltenden antiken Palmetten erhalten. Alle Verzierungen bleiben innerhalb der exakten Kreislinie.','province')
province_v2['referenced_image_paths'] = [str(REALM/'assets/emblems/production/leukonia.png'), *REFS]
province_v2['prompt'] += '\n\nEDIT TARGET: Das erste Bild ist der vorhandene Stierentwurf Leukonias. Ersetze ausschließlich das gesamte innere Stier-Lorbeer-Sterne-Motiv durch die beschriebene Hopliten-Gorgonen-Gruppe. Äußerer Kreisrahmen, Farbpalette, Materialien und allgemeine römisch-kampanische Malweise bleiben erhalten. Die anderen drei Bilder sind ausschließlich Stilreferenzen. Das neue Hauptmotiv ist heraldisch klar vereinfacht und groß lesbar, keine detaillierte mythologische Szene. Nicht den Körper oder Kopf einer realen Person darstellen.'
province_v2['active'] = True
province_v2['status'] = 'user-selected-visual-proposal'
jobs.append(province_v2)
for i,(label,motif,c1,c2,c3,frame,ornament) in enumerate(DESIGNS,1):
    job = emblem_job(f'pool-{i:02}',f'pool-{i:02}',f'Freies Hauswappen {i:02} {label}',motif,[c1,c2,c3],frame,ornament,'house')
    if i > 32:
        job['active'] = False
        job['status'] = 'archived-after-island-exclusion'
    jobs.append(job)

BANNERS = [
('apinia','Apinia','Schwarz, Silberweiß und Kupferorange','Eine große einzelne silberweiße Feder senkrecht mit goldenem Kiel, kleinere dunkle Flügelfedern nur seitlich als flache Stickerei. Schwarzes Tuch mit kupferorangener unterer Saumzone.','Apinia.png'),
('bolar','Bolar','Dunkelgrün, Elfenbein und Altgold','Ein elfenbeinweißer Oktopus mit genau acht klar voneinander getrennten stilisierten Armen auf dunkelgrünem Tuch.','Bolar.png'),
('lex','Lex','Schwarz, Silber und dunkles Eisen','Ein silberner antiker korinthischer Helm im Profil mit weißem quergezogenem Helmkamm und zwei schmalen silbernen Lorbeerzweigen darunter auf schwarzem Tuch.','Lex.png'),
('orania','Orania','Dunkelviolett, Silberweiß und Bronze','Ein einzelnes silberweißes steigendes Pferd im Profil mit vier deutlich getrennten Beinen und einem natürlich an der Hinterhand entspringenden Schwanz auf dunkelviolettem Tuch.','Orania.png'),
('pelagia','Pelagia','Nachtblau, Gold und Azurblau','Ein goldenes schlangenhaft stilisiertes heraldisches Seepferd wie im gelieferten Hauswappen, mit einem einzigen eingerollten Schwanz, flankiert von zwei azurblauen antiken Wellenranken auf nachtblauem Tuch.','Pelagia.png'),
('tremelia','Tremelia','Petrolgrün, Elfenbein und Gold','Zwei symmetrisch einander zugewandte goldene natürliche Seepferdchen mit jeweils einem eingerollten Schwanz auf petrolgrünem Tuch.','Tremelia.png')
]
for stem,name,palette,motif,ref in BANNERS:
    prompt = '\n\n'.join([
        f'Asset type: Ein einzelnes römisch-kampanisches Legionsbanner als Archonatsbanner des Hauses {name} für Leukonia im Kaiserreich Argentum. 2:3 Hochformat, vollständiger Gegenstand mit viel freiem transparentem Rand.',
        f'Motivvorlage ist das beigefügte originale Wappen des Hauses {name}. Seine Motive und Farben erhalten, aber auf ein rechteckiges textiles Vexillum übertragen: {motif} Farbpalette {palette}.',
        'Eine aufrechte schlanke dunkle Holzstange mit kleiner schlichter silberner Lanzenspitze trägt eine waagerechte bronzene Querstange. Daran hängt über vier kurze sichtbare Schlaufen ein schweres gewebtes rechteckiges Banner. Zwei kleine Endquasten, zurückhaltender antiker Mäander und klassischer Perlstab an den Tuchkanten. Der Stoff hängt ruhig mit wenigen weichen Falten, gerade und frontal. Das ganze Banner samt Stangenspitze, beiden Querstangenenden, beiden Quasten und unterem Stangenende bleibt im Bild. Keine Hand, kein Träger und kein Boden.',
        'Handgemalte historische Fantasy-Inventarillustration mit großen gut lesbaren Formen, klarer feiner dunkler Kontur, matter gedeckter Gouache, geringer gleichmäßiger Pigmentkörnung. Textile und metallische Teile nur sparsam modellieren; keine glänzende 3D-Darstellung, kein Fotorealismus, keine starken Comic-Outlines. Kein kreisrunder Wappenrahmen um das gesamte Bild. Kein Schild. Keine Schrift, Buchstaben, lateinische Zahlen, SPQR oder Namen.',
        'Echter transparenter PNG-Hintergrund einschließlich der offenen Lücken zwischen Aufhängeschlaufen und Querstange. Kein Hintergrund, Farbdunst, weißes Rechteck, Boden, äußerer Schatten, Halo, angehängte Landschaft oder zusätzliche Einrichtungsgegenstände.'
    ])
    jobs.append({'id':'banner-'+stem,'assetStem':stem,'category':'banners','kind':'archonate','houseId':'house-'+stem,'name':'Archonatsbanner '+name,'motif':motif,'palette':[x.strip() for x in palette.replace(' und ', ', ').split(',')],'shape':'banner','prompt':prompt,'transparent_background':True,'referenced_image_paths':[str(SOURCE/ref)],'active':stem!='bolar','status':'archived-after-island-exclusion' if stem=='bolar' else 'proposal'})

manifest={'schemaVersion':1,'date':'2026-11-03','tool':'built-in image_gen.imagegen','basis':{'mapSettlements':26,'additionalHouseEmblems':32,'archonates':5,'provincialEmblems':1,'excludedIslandSettlements':2},'jobs':jobs}
(REALM/'sources/heraldry-generation-jobs.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(jobs,ensure_ascii=False))
