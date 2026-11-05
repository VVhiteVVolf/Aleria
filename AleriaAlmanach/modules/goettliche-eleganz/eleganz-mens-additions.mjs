// Additional house models, authored 2026-11-04. Prices are integer Kupfertaler.
import { eleganzGarment as model } from './eleganz-garment.mjs';

export const ELEGANZ_MENS_ADDITIONS = Object.freeze([
  model('hirseleinen','Hirseleinen',35,'Naturleinen · Ockerfarbenes Wolltuch','Schlichtes ärmelloses Wams mit Hemd und Hose',
    'Ein ockerfarbenes, hüftlanges Wams liegt über einem naturhellen Leinenhemd. Der offene V-Ausschnitt, vier einfache Holzknöpfe und eine schmale braune Einfassung geben der alltagstauglichen Garnitur eine klare argentische Linie; die lockeren Ärmel bleiben cenyrisch bequem.',
    'Eine kastanienbraune Leinenhose ergänzt das ungefütterte Wams. Verstärkte Seitennähte und ein kleiner Stoffeinsatz im Rücken lassen beim Arbeiten Bewegung zu. Einfache Anpassungen gehören zur Garnitur.',
    ['Ungefüttertes Wollwams','Leinenhemd und kastanienbraune Hose','Holzknöpfe und verstärkte Seitennähte'],'Guter Alltag'),
  model('tabakkontor','Tabakkontor',285,'Tabakbraunes Wolltuch · Leinen · Hornknöpfe','Langes Kontorwams mit schmalem Umschlagkragen',
    'Tabakbraunes Wolltuch und ein sandfarbenes Hemd bilden eine ruhige Stadtgarnitur. Das lange Wams hat einen schmalen umgelegten Kragen und eine seitlich versetzte Reihe dunkler Hornknöpfe. Kleine cremefarbene Flechtborten an den Manschetten verbinden den südlichen Schnitt mit Gwynthorer Handwerk.',
    'Das Wams ist mit Leinen gefüttert und besitzt eine flache innere Brieftasche. Eine dunkelbraune Hose und ein schmaler Stoffgürtel gehören dazu; die weich geformten Schultern eignen sich auch für längere Tage im Kontor.',
    ['Leinengefüttertes Kontorwams','Innenliegende Brieftasche','Hemd, Hose und Stoffgürtel enthalten'],'Kontor & Stadtbesuch'),
  model('lavendelabend','Lavendelabend',1160,'Lavendelfarbenes Wolltuch · Silbergraue Seide','Saalwams mit flachem Kragen und geschlitzten Oberärmeln',
    'Mattes lavendelfarbenes Tuch steht über einem silbergrauen Hemd. Die kurzen Schlitze der weich gerafften Oberärmel lassen helle Seide sehen; der flache runde Kragen und die glatte Knopffront halten die Silhouette ruhig. Schmale graue Flechtborten laufen an den Ärmelenden aus.',
    'Die Garnitur wird an Schulter und Taille angepasst. Das Leineninnenfutter stützt die Seideneinsätze, ohne die Ärmel zu versteifen. Eine perlgraue Hose und ein passend bezogener Gürtel vervollständigen das Saalgewand.',
    ['Echte silbergraue Seideneinsätze','Angepasste Schulter- und Taillenlinie','Perlgraue Hose und passender Gürtel'],'Abendgesellschaft'),
  model('kupfersaum','Kupfersaum',4650,'Kupferfarbener Seidenbrokat · Elfenbeinseide · Silber','Brokatwams mit kurzer offener Schaube',
    'Warm kupferfarbener Brokat trägt ein kleinflächiges Muster aus Granatapfelblättern. Eine kurze elfenbeinfarbene Schaube rahmt das glatt geschlossene Wams; ihre schmalen umgelegten Revers und die gefalteten Schulteransätze greifen argentische Festmode auf. Cenyrische Flechtlinien sitzen zurückhaltend an Kragen und Manschetten.',
    'Zwei flache Silberschließen halten die Schaube. Hemd und walnussbraune Hose sind auf die warmen Stoffe abgestimmt. Die Brokatbahnen werden bei der Anprobe einzeln ausgerichtet, damit das Blattmuster über der Knopfleiste zusammenpasst.',
    ['Gemusterter kupferfarbener Seidenbrokat','Zwei angepasste Silberschließen','Offene Schaube und abgestimmte Unterkleidung'],'Festmahl & gehobener Empfang'),
  model('rauchgold','Rauchgold',11800,'Rauchgrauer Seidensamt · Champagnerbrokat · Goldfaden','Maßgarnitur mit asymmetrischem Schulterüberwurf',
    'Rauchgrauer Seidensamt bildet ein langes, glatt gearbeitetes Wams mit hohem geteiltem Kragen. Ein champagnerfarbener Schulterüberwurf liegt nur über einer Schulter; feine echte Goldfäden zeichnen schmale Lorbeer- und Flechtlinien entlang seiner Kante. Die helle Unterlage erscheint als ruhiger Streifen zwischen den Samtbahnen.',
    'Eine kleine vergoldete Silberschließe befestigt den abnehmbaren Überwurf. Mehrere Anproben stimmen Kragen und Schulterfall ab. Das helle Seidenhemd und die rauchgraue Hose gehören zur festgelegten Ausführung, zusätzlicher Schmuck wird gesondert gewählt.',
    ['Echte Goldfadenstickerei','Abnehmbarer einseitiger Schulterüberwurf','Mehrere Anproben und vollständige Unterkleidung'],'Großer Empfang')
]);

export const ELEGANZ_MENS_WEDDING_ADDITIONS = Object.freeze([
  model('braeutigam-sandband','Sandband',175,'Sandfarbenes Wolltuch · Naturleinen','Hochzeitswams mit schmalem Stehkragen',
    'Sandfarbenes Wolltuch und ein naturhelles Leinenhemd bilden eine schlichte Hochzeitsgarnitur. Das hüftlange Wams schließt mit kleinen stoffbezogenen Knöpfen; eine elfenbeinfarbene Flechtborte zeichnet den niedrigen Stehkragen und die schmalen Manschetten nach. Dunklere taupefarbene Seiteneinsätze betonen den sauberen Sitz.',
    'Das leichte Leinenfutter hält die Form und bleibt auch beim Tanz angenehm. Eine taupefarbene Hose und ein schmaler sandfarbener Stoffgürtel gehören dazu. Nach dem Fest lässt sich das Wams ebenso für andere Einladungen tragen.',
    ['Leinengefüttertes Hochzeitswams','Stoffbezogene Knöpfe und helle Flechtborte','Hemd, taupefarbene Hose und Stoffgürtel'],'Hochzeit · schlicht & festlich'),
  model('braeutigam-fliederschwur','Fliederschwur',940,'Fliederfarbenes Wolltuch · Elfenbeinseide','Hochzeitswams mit offenem Schulterkragen',
    'Ein fliederfarbenes Wams mit glatter geschlossener Brust liegt unter einem kurzen offenen Schulterkragen aus elfenbeinfarbener Seide. Kleine helle Seidenknöpfe sitzen paarweise auf der Front; schmale cenyrische Flechtlinien fassen den Kragen. Die Ärmel bleiben lang und schmal, an den Schultern nur leicht gefaltet.',
    'Der Schulterkragen lässt sich nach der Trauung abnehmen. Ein helles Hemd, eine perlgraue Hose und ein schmaler fliederfarbener Gürtel ergänzen die Garnitur. Kragenweite und Ärmellänge werden bei einer persönlichen Anprobe abgestimmt.',
    ['Abnehmbarer Seidenschulterkragen','Paarweise gesetzte Seidenknöpfe','Hemd, perlgraue Hose und Gürtel'],'Hochzeit · sanfte Farben'),
  model('braeutigam-bernsteinstunde','Bernsteinstunde',2350,'Bernsteinfarbener Seidenbrokat · Cremefarbene Seide · Messing','Festwams mit kurzer ärmelloser Überrobe',
    'Bernsteinfarbener Brokat mit kleinen Ährenmotiven bildet eine kurze offene Überrobe. Darunter liegt ein cremefarbenes Seidenwams mit eckigem Kragen und schmalen stoffbezogenen Knöpfen. Warme braune Flechtborten gliedern die breiten Revers und die gefalteten Oberärmel; ihre Linien bleiben bewusst frei von schweren Metallbesätzen.',
    'Eine fein gearbeitete Messingschließe hält die Überrobe. Das Futter wird an den Schultern verstärkt, damit der Brokat beim Tanzen ruhig liegt. Hemd, honigbraune Hose und passender Stoffgürtel gehören zur beschriebenen Garnitur.',
    ['Seidenbrokat mit eingewebten Ähren','Angepasste Messingschließe','Cremefarbenes Wams mit abgestimmter Unterkleidung'],'Hochzeit · festliches Hausmodell'),
  model('braeutigam-perlenversprechen','Perlenversprechen',7300,'Perlgraue Seide · Silberfaden · Kleine Süßwasserperlen','Hochzeitsgarnitur mit kurzem silbergrauem Mantel',
    'Perlgraue Seide und ein kreidehelles Wams geben dieser Garnitur eine kühle, lichte Wirkung. Der flach gefaltete Kragen und die schmalen Ärmel tragen feine silbergestickte Myrtenzweige. Ein kurzer silbergrauer Mantel ruht auf beiden Schultern; zwei kleine Süßwasserperlen sitzen an seiner flachen Silberschließe.',
    'Der Mantel wird zum Tanz abgenommen, während die gestickte Wamsfront vollständig bleibt. Hemd und hellgraue Hose sind in die Anprobe einbezogen. Die Perlenfassungen werden glatt unterlegt, damit Metall und Stickerei den Stoff nicht aufreiben.',
    ['Echte Silberstickerei mit Myrtenzweigen','Silberschließe mit zwei kleinen Süßwasserperlen','Abnehmbarer Mantel und vollständige Unterkleidung'],'Hochzeit · feine Gesellschaft'),
  model('braeutigam-ebenholzgeluebde','Ebenholzgelübde',19000,'Schwarzer Seidensamt · Champagnerbrokat · Goldfaden · Rauchquarz','Persönliche Hochzeitsgarnitur mit geteilter Überrobe',
    'Ein schwarzes Seidensamtwams mit hohem umgelegtem Kragen steht zwischen champagnerfarbenen Brokatbahnen. Die offene Überrobe fällt in zwei klaren Flächen; feine Goldfadenstickerei verbindet argentisches Lorbeerlaub mit cenyrischen Flechtlinien. Ein einzelner kleiner Rauchquarz sitzt in der vergoldeten Silberschließe des kompakten schwarzen Mantels.',
    'Hemd, Hose, Wams, Überrobe und abnehmbarer Mantel entstehen gemeinsam nach Maß. Die breiten Brokatflächen bleiben frei, damit die aufwendigen Nähte und die schmalen Goldlinien wirken können. Mehrere Anproben und die beschriebene Rauchquarzfassung sind enthalten.',
    ['Fünfteilige Maßgarnitur','Echte Goldstickerei und gefasster Rauchquarz','Mehrere persönliche Anproben'],'Hochzeit · besonderer Einzelentwurf')
]);
