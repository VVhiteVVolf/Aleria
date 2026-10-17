const shield=(key,title,price,material,description,features,subject)=>({key,title,type:'Schild',price,material,description,features,subject,kind:'shield',category:'eigene-schilde',makerMark:false});
export const GOFRANN_SHIELDS=Object.freeze([
  shield('kite-schild','Gofrann-Kite-Schild',210,'Verleimtes Holz · Leinwand · Stahlrand · Leder',
    ['Der lange Schild läuft von gerundeten Schultern zu einer sauberen Spitze. Sorgfältig verleimte Holzlagen und eine feste Bespannung bilden den Körper; ein schmaler Stahlrand schützt die gefährdeten Kanten.',
      'Die Vorderseite bleibt einfarbig und ohne Zeichen. Auf der Rückseite werden die Riemen auf die Armhaltung des Trägers abgestimmt. Dieser Schild ist eine fertige Gebrauchsarbeit und zugleich eine gute Grundlage für eine spätere Bemalung.'],
    ['Sorgfältig verleimter, leicht gewölbter Schildkörper','Schmaler fester Stahlrand','Angepasste Lederriemen auf der Rückseite'],
    'ONE plain medieval kite shield, long teardrop shape with rounded shoulders and pointed bottom, gently convex laminated wood body faced with smooth unpainted warm cream linen, narrow blank brushed steel rim and a few functional rivets. Subtle three-quarter frontal view, entire shield visible. NO emblem, engraving, maker mark, painted pattern, quartering, sunburst, text or straps floating in front.'),
  shield('rundschild','Gofrann-Rundschild',85,'Holz · Rohhautrand · Stahlbuckel · Leder',
    ['Ein sorgfältig gefügter Holzkörper, ein fester Rohhautrand und ein glatter Stahlbuckel geben diesem Rundschild seine schlichte Form. Die Planken werden sauber angelegt, der Rand ohne Lücken gefasst.',
      'Der Griff sitzt sicher hinter dem Buckel. Sichtbar bleiben das warme Holz, wenige nötige Befestigungen und die ruhige Fläche des blanken Stahls.'],
    ['Sauber gefügter runder Holzkörper','Geschlossener Rohhautrand','Gut gefasster Griff hinter dem Stahlbuckel'],
    'ONE blank superior medieval ROUND wooden shield, natural medium brown clean wooden planks, a smooth plain silver steel central boss, restrained dark rawhide edge and a few necessary evenly placed rivets. Complete circular silhouette, slightly angled three-quarter front view. NO paint, color division, motifs, maker mark, runes, carving or decorative metal bands.'),
  shield('pavese','Gofrann-Pavese',240,'Verleimtes Holz · Leinen · Rohhaut · Beschläge',
    ['Der hohe Schild besitzt einen deutlichen Mittelrücken und leicht zurückgebogene Seiten. Seine feste Leinenhaut schützt das gut verleimte Holz; der untere Rand ist für häufiges Absetzen verstärkt.',
      'Auf der Rückseite sitzen Trageriemen und eine einfache Stütze. Die helle Vorderfläche bleibt frei von Bild und Schrift, damit der Käufer sie nach eigenem Wunsch bemalen lassen kann.'],
    ['Hoher Körper mit ausgeprägtem Mittelrücken','Verstärkter unterer Rand','Rückseitige Stütze und feste Trageriemen'],
    'ONE plain medieval PAVISE shield, tall broad rectangular body with a rounded arch top and pronounced central vertical ridge, slightly recurved sides, smooth unpainted warm ivory linen facing on wood, simple dark rawhide border and discreet steel bottom reinforcement. A small glimpse of its attached rear support is acceptable at the side. Entire shield isolated, frontal gentle three-quarter view. NO emblem, painting, inscription, engraving, symbols or scenery.'),
  shield('buckler','Gofrann-Buckler',45,'Blanker Stahl · Holzgriff · Leder',
    ['Der kleine Faustschild besteht aus sauber getriebenem Stahl. Sein gewölbter Buckel geht in eine flache Randzone über; die Kante ist sorgfältig umgelegt und geglättet.',
      'Hinter dem Buckel liegt ein fester, mit Leder gefasster Griff. Auf Zierrippen und Abzeichen wird verzichtet. Hier soll vor allem die Hand einen verlässlichen kleinen Schild finden.'],
    ['Sauber getriebener Stahlkörper','Glatt umgelegter Rand','Fester belederter Faustgriff'],
    'ONE small plain medieval steel BUCKLER, fully circular silver-grey metal disk with a smoothly domed central boss, broad shallow dished outer ring and a clean rolled edge. Simple functional rivets only. Slight three-quarter view to show metal thickness, complete circular silhouette. NO spokes, fluting, embossed decoration, engraving, symbol, color paint, maker mark or text.')
]);
