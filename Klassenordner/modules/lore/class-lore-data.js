// Authored cultural background, preserved from the original class page.
export const CLASS_LORE = {
      basis: {
        name: 'Basisklassen',
        subtitle: 'Die Grundpfeiler des Kriegshandwerks',
        wappen: 'https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png',
        warriorhood: 'Die Basisklassen repräsentieren die fundamentalen Wege des Kampfes und der Magie. Jeder Krieger beginnt hier seine Reise...',
        society: 'Diese Klassen sind universell und in allen Ländern zu finden. Sie bilden die Grundlage für spezialisierte Pfade...',
        hierarchy: [
          { rank: 'Meister', desc: 'Legendäre Kämpfer ihrer Zunft' },
          { rank: 'Veteran', desc: 'Erfahrene Krieger' },
          { rank: 'Geselle', desc: 'Ausgebildete Kämpfer' },
          { rank: 'Novize', desc: 'Lehrlinge des Kampfes' }
        ]
      },
      cenyr: {
        name: 'Cenyr',
        subtitle: 'Das Rote Königreich',
        wappen: 'https://i.imgur.com/00DWDQW.png',
        warriorhood: `Das cenyrische Rittertum entstand nicht aus dem Bedürfnis nach Reiterei oder militärischer Überlegenheit, sondern aus einem <strong>moralischen Anspruch</strong>. Als die Avallornier ihre verschleierte Heimat verließen und nach Estryll gelangten, brachten sie mehr mit als Schwerter und Banner – sie brachten eine Vorstellung davon, wie ein Mensch sein sollte.<br><br>

        Auf dem Glauben an die Göttlichen, Verkörperungen der neun absoluten Tugenden, gründete sich eine Idee: Der Ritter sollte nicht nur kämpfen, sondern im Augenblick größter Entscheidung handeln, wie es die Göttlichen selbst täten. In den frühen Tagen war Ritterlichkeit kein Titel, sondern ein <strong>Gelöbnis</strong>.<br><br>

        Mit der Gründung Cenyrs und der Verbindung mit dem albenländischen Feudalsystem wurde dieses Ideal institutionalisiert. Die Schwertleite, die Salbung, der ritterliche Eid – all dies formte aus einem moralischen Streben eine gesellschaftliche Ordnung. <strong>Rittertum wurde zum Fundament des Staates</strong>, zum sichtbaren Maßstab dessen, was Cenyr sein wollte.`,
        society: `Das Rittertum ist sowohl eine soziale Ordnung als auch eine Lebensphilosophie, die tief in den Lehren der Avallornier verwurzelt ist. Anders als frühere feudale Systeme stellte es nicht bloß die Herrschaft des Adels über das Volk in den Vordergrund, sondern verband diese Herrschaft mit den <strong>Idealen der Ritterlichkeit und der Tugendhaftigkeit</strong>.<br><br>

        In Cenyr sind alle Bürgerlichen <strong>frei</strong>. Es gibt zwar einen Adel, der sich vom Bürger abhebt, er tut dies aber in Funktion, nicht in Moral und als Mensch. Leibeigene gibt es nicht. Der Adel schützt, führt und stärkt das Volk im Glauben – diese Art der Herrschaft legt besonderen Wert darauf, dass die Ritter im Dienst eines höheren Gutes stehen.<br><br>

        Ein Ritter verschreibt sich dem Schutz seines Landes und lebt nach einem Kodex von <strong>Ehre, Treue, Integrität und Selbstlosigkeit</strong>. So steht das cenyrische Rittertum bis heute zwischen Anspruch und Wirklichkeit: ein unvollkommenes menschliches Streben nach einem vollkommenen Bild – und gerade darin liegt seine Seele.`,
        hierarchy: [
          { rank: 'König (Cenyr) / König (Vennyr)', desc: '<strong>Cenyr:</strong> Souverän aus dem Geschlecht der Pendrag (avallornisch). <strong>Vennyr:</strong> Priesterliches Geschlecht der Blodyn mit geistlichem Erbe.' },
          { rank: 'Graf / Penron (nur Vennyr)', desc: 'Provinzieller Herrscher einer Grafschaft. <strong>Penron:</strong> Vennyrische Besonderheit – Vorstufe des Grafen, steht über dem Baron.' },
          { rank: 'Baron', desc: 'Regionaler Herr einer Baronie, untersteht dem Grafen (oder Penron in Vennyr).' },
          { rank: 'Ritterfürst', desc: '"Fürst unter Rittern" – kleiner als Baron, größer als Ritterherr. Verwaltet mehrere Siedlungen.' },
          { rank: 'Ritterherr', desc: 'Kopf eines ritterlichen Hauses. Darf Ritter schlagen, hält Burgen, wird oft zum Lehenswart eingesetzt.' },
          { rank: 'Lehenswart / Seewart (Vennyr)', desc: 'Lokaler Statthalter einer Ortschaft, Burg oder Stadt. In Vennyr oft für Häfen und Küstenwachen zuständig.' },
          { rank: 'Feudalritter', desc: 'Lehensritter im Dienst eines Hauses. Zu diesem Stand gehören alle Pfade wie <strong>Teulu, Cantref, Uchelwyr, Helwyr (Cenyr)</strong> und <strong>Rhyfelwyr, Morwyr, Ceidwyn, Rhiddwyr (Vennyr)</strong>.' },
          { rank: 'Fahrender Ritter', desc: 'Ritter mit Erlaubnis durchs Land zu ziehen. Oft junge Ritter oder Prinzen. In Vennyr auch "zur See fahrend".' },
          { rank: 'Paladin', desc: 'Gesalbter Kirchenritter mit spezifischem Eid. Dient Kirche und Glauben, nicht Herr und Land.' },
          { rank: 'Derwyn (Cenyr & Vennyr)', desc: 'Glaubenskrieger der Nimue. Kann ein Paladin sein (mit Eid), aber auch reiner Geistlicher ohne Ritterstand. Vereint spirituelle Mission mit Kampfkunst.' },
          { rank: 'Heckenritter', desc: 'Ritter ohne Herr und Land, heimatlos, verschmäht. Lebt von der Hand in den Mund.' },
          { rank: 'Jungritter', desc: 'Kürzlich geschlagener Ritter, der noch viel zu lernen hat. Seine Zukunft entscheidet sich noch.' },
          { rank: 'Knappe', desc: 'Angehender Ritter (14-18 Jahre), dient einem Rittervater. Kämpft bereits an seiner Seite. In Vennyr lernt er auch Seemannsschaft.' },
          { rank: 'Page / Maid', desc: 'Sehr junger Diener (6-12 Jahre) mit haushaltlichen Pflichten. Schulische Zeit, noch kein Kampf.' },
          { rank: 'Milwr (Bürgerliche)', desc: 'Freie Bürger, aus denen die Miliz eingezogen wird. <strong>Keine Leibeigenschaft</strong> – alle sind frei.' }
        ]
      },
      vennyr: {
        name: 'Vennyr',
        subtitle: 'Die Silberne Flotte',
        wappen: 'https://i.imgur.com/T8e0EqY.png',
        warriorhood: `Obwohl das Rittertum Vennyrs denselben avallornischen Ursprung wie jenes Cenyrs besitzt, entwickelte es unter anderen Bedingungen eine eigene, spürbar <strong>rauere Prägung</strong>. Der cenyrische Ritter steht stärker für Ordnung, Hofkultur und eine klar strukturierte Feudalhierarchie. In Vennyr hingegen wurde das Ideal durch Küstenüberfälle, Grenzkriege und das harte Leben zwischen Fjord und Hochland ständig geprüft und neu geformt.<br><br>

        Der Einfluss der <strong>Muirath</strong> verstärkte die Stammesbindung des vennyrischen Ritters. Ehre war nicht nur höfischer Kodex, sondern <strong>Sippenpflicht</strong> gegenüber Clan, Blutlinie und Land. Gleichzeitig hinterließ das Erbe der <strong>Norrnaigh</strong> deutliche Spuren in Kriegstaktik und Ausrüstung: größere Seetüchtigkeit, funktionalere Rüstung, häufiger Einsatz von Axt und Enterkampf sowie die Verwendung von Runen und Meeressymbolen als Schutzzeichen.<br><br>

        Der Kern des Ritterideals – Treue, Schutzpflicht und Glaubensfestigkeit – blieb bestehen, doch seine Ausprägung wurde rauer und pragmatischer. Während der Ritter Cenyrs die geordnete Herrschaft verkörpert, musste der Ritter Vennyrs seine Tugend <strong>im Sturm und im ständigen Grenzkampf</strong> immer wieder behaupten.`,
        society: `Das Rittertum Vennyrs trägt dieselben avallornischen Wurzeln wie Cenyr, doch die raue Küste und die ständigen Konflikte formten eine andere Gesellschaft. Die <strong>königliche Linie der Blodyn</strong>, ein priesterliches Geschlecht mit geistlichem Erbe, begründete im Norden ein Königreich, das Glaube und Krieg enger miteinander verwebt als im Süden.<br><br>

        Hier ist Rittertum nicht nur höfischer Kodex, sondern <strong>Überlebenspflicht</strong>. Die Stammesbindung der Muirath, die Seetüchtigkeit der Norrnaigh und die ritterlichen Ideale der Avallornier verschmolzen zu einer einzigartigen Kriegerkultur. Ein Ritter Vennyrs schuldet Treue seinem Clan ebenso wie seinem König, seinem Schiff ebenso wie seiner Burg.<br><br>

        Die Gesellschaft ist rauer, direkter – aber nicht weniger ehrenvoll. Das Ideal bleibt bestehen: Schutz der Schwachen, Treue zum Eid, Standhaftigkeit im Glauben. Doch während Cenyr seine Ritter am Hof misst, prüft Vennyr sie an der Küste, im Sturm, im Blut.`,
        hierarchy: [
          { rank: 'König (Cenyr) / König (Vennyr)', desc: '<strong>Cenyr:</strong> Souverän aus dem Geschlecht der Pendrag (avallornisch). <strong>Vennyr:</strong> Priesterliches Geschlecht der Blodyn mit geistlichem Erbe.' },
          { rank: 'Graf / Penron (nur Vennyr)', desc: 'Provinzieller Herrscher einer Grafschaft. <strong>Penron:</strong> Vennyrische Besonderheit – Vorstufe des Grafen, steht über dem Baron.' },
          { rank: 'Baron', desc: 'Regionaler Herr einer Baronie, untersteht dem Grafen (oder Penron in Vennyr).' },
          { rank: 'Ritterfürst', desc: '"Fürst unter Rittern" – kleiner als Baron, größer als Ritterherr. Verwaltet mehrere Siedlungen.' },
          { rank: 'Ritterherr', desc: 'Kopf eines ritterlichen Hauses. Darf Ritter schlagen, hält Burgen, wird oft zum Lehenswart eingesetzt.' },
          { rank: 'Lehenswart / Seewart (Vennyr)', desc: 'Lokaler Statthalter einer Ortschaft, Burg oder Stadt. In Vennyr oft für Häfen und Küstenwachen zuständig.' },
          { rank: 'Feudalritter', desc: 'Lehensritter im Dienst eines Hauses. Zu diesem Stand gehören alle Pfade wie <strong>Teulu, Cantref, Uchelwyr, Helwyr (Cenyr)</strong> und <strong>Rhyfelwyr, Morwyr, Ceidwyn, Rhiddwyr (Vennyr)</strong>.' },
          { rank: 'Fahrender Ritter', desc: 'Ritter mit Erlaubnis durchs Land zu ziehen. Oft junge Ritter oder Prinzen. In Vennyr auch "zur See fahrend".' },
          { rank: 'Paladin', desc: 'Gesalbter Kirchenritter mit spezifischem Eid. Dient Kirche und Glauben, nicht Herr und Land.' },
          { rank: 'Derwyn (Cenyr & Vennyr)', desc: 'Glaubenskrieger der Nimue. Kann ein Paladin sein (mit Eid), aber auch reiner Geistlicher ohne Ritterstand. Vereint spirituelle Mission mit Kampfkunst.' },
          { rank: 'Heckenritter', desc: 'Ritter ohne Herr und Land, heimatlos, verschmäht. Lebt von der Hand in den Mund.' },
          { rank: 'Jungritter', desc: 'Kürzlich geschlagener Ritter, der noch viel zu lernen hat. Seine Zukunft entscheidet sich noch.' },
          { rank: 'Knappe', desc: 'Angehender Ritter (14-18 Jahre), dient einem Rittervater. Kämpft bereits an seiner Seite. In Vennyr lernt er auch Seemannsschaft.' },
          { rank: 'Page / Maid', desc: 'Sehr junger Diener (6-12 Jahre) mit haushaltlichen Pflichten. Schulische Zeit, noch kein Kampf.' },
          { rank: 'Milwr (Bürgerliche)', desc: 'Freie Bürger, aus denen die Miliz eingezogen wird. <strong>Keine Leibeigenschaft</strong> – alle sind frei.' }
        ]
      },
      alben: {
        name: 'Alben',
        subtitle: 'Die Grünen Hügel',
        wappen: 'https://i.imgur.com/WRnLB3t.png',
        warriorhood: '<em>Platzhalter: Kriegertum der Alben...</em>',
        society: '<em>Platzhalter: Gesellschaft...</em>',
        hierarchy: [
          { rank: 'Rí Tiarna', desc: 'Der König der Alben (derzeit vakant)' },
          { rank: 'Fianna', desc: 'Keine Aristokratie, sondern die Führer der Alben. Entscheiden über Gesetz, Sitte, Regeln, Erbfolge und Königstum' },
          { rank: 'Ard Tiarna', desc: 'Herzog' },
          { rank: 'Mor Tiarna', desc: 'Graf' },
          { rank: 'Dún Tiarna', desc: '<em>Platzhalter...</em>' },
          { rank: 'Laird', desc: '<em>Platzhalter...</em>' },
          { rank: 'Triath', desc: 'Wie Lehenswart und Thengr – lokaler Statthalter' },
          { rank: 'Einfacher Tiarna', desc: 'Pendant zum Ritter' },
          { rank: 'Laochan', desc: 'Knappe' },
          { rank: 'Fola', desc: 'Page' },
          { rank: 'Kern', desc: 'Waffenknecht, Miliz' },
          { rank: 'Sept', desc: 'Freier Bürger' }
        ]
      },
      aldrimar: {
        name: 'Aldrimar',
        subtitle: 'Die Eisernen Hallen',
        wappen: 'https://i.imgur.com/OnNslhr.png',
        warriorhood: '<em>Platzhalter: Kriegertum Aldrimars...</em>',
        society: '<em>Platzhalter: Gesellschaft...</em>',
        hierarchy: [
          { rank: 'König', desc: '<em>Platzhalter...</em>' },
          { rank: 'Reik', desc: 'Fürst / Herzog' },
          { rank: 'Jarl', desc: 'Graf' },
          { rank: 'Thane', desc: 'Baron' },
          { rank: 'Hesir', desc: 'Kleiner als Baron, wie Ritterfürst' },
          { rank: 'Huskarlherr', desc: 'Wie Ritterherr' },
          { rank: 'Thengr', desc: 'Lokaler Statthalter, aus den Huskarlen' },
          { rank: 'Huskarl', desc: 'Pendant zum Ritter. Zu diesem Stand gehören alle Pfade wie Skjoldr, Thegnar, Skeidr, Skjaldr, Skytte, Skalde' },
          { rank: 'Drengr / Maer', desc: 'Knappe' },
          { rank: 'Karl (Bürger)', desc: 'In Aldrimar sind sie frei, keine leibeigene Kaste' }
        ]
      },
      nordmaenner: {
        name: 'Nordmänner',
        subtitle: 'Die Wilden des Nordens',
        wappen: 'https://i.imgur.com/2KOkdu5.png',
        warriorhood: '<em>Platzhalter: Kriegertum der Nordmänner...</em>',
        society: '<em>Platzhalter: Gesellschaft...</em>',
        hierarchy: [
          { rank: 'König', desc: '<em>Platzhalter...</em>' },
          { rank: 'Reik', desc: 'Fürst / Herzog' },
          { rank: 'Jarl', desc: 'Graf' },
          { rank: 'Thane', desc: 'Baron' },
          { rank: 'Hesir', desc: 'Wie Ritterfürst' },
          { rank: 'Huskarlherr', desc: 'Wie Ritterherr' },
          { rank: 'Thengr', desc: 'Lokaler Statthalter' },
          { rank: 'Huskarl', desc: 'Pendant zum Ritter. Zu diesem Stand gehören Ravnar, Hestgar, Ulfhednar, Berserkir, Veigir, Tungur' },
          { rank: 'Drengr / Maer', desc: 'Knappe' },
          { rank: 'Karl (Bürger)', desc: 'Freie Bürger' },
          { rank: 'Thralls (Leibeigene)', desc: 'Unfreie, dem Land und Adel gehörig' },
          { rank: 'Sweyn (Sklaven)', desc: 'Leibsklave' }
        ]
      },
      goldmund: {
        name: 'Goldmund & Aldingen',
        subtitle: 'Die Vereinten Fürstentümer',
        wappen: 'https://i.imgur.com/tTjs23K.png',
        warriorhood: '<em>Platzhalter: Kriegertum...</em>',
        society: '<em>Platzhalter: Gesellschaft...</em>',
        hierarchy: [
          { rank: 'Großherzog (Aldingen)', desc: 'Herrscher Aldingens' },
          { rank: 'Fürst (Goldmund)', desc: 'Herrscher Goldmunds' },
          { rank: 'Graf', desc: '<em>Platzhalter...</em>' },
          { rank: 'Baron', desc: '<em>Platzhalter...</em>' },
          { rank: 'Ritterfürst', desc: '<em>Platzhalter...</em>' },
          { rank: 'Ministerialer', desc: 'Wie Ritterherr' },
          { rank: 'Lehensritter', desc: 'Zu diesem Stand gehören Husar, Aldmar, Eldner, Schirmer, Flamberger, Havner, Güldner, Oraner' },
          { rank: 'Fahrender Ritter', desc: '<em>Platzhalter...</em>' },
          { rank: 'Heckenritter', desc: '<em>Platzhalter...</em>' },
          { rank: 'Kirchenritter', desc: '<em>Platzhalter...</em>' },
          { rank: 'Knappe', desc: '<em>Platzhalter...</em>' },
          { rank: 'Page', desc: '<em>Platzhalter...</em>' },
          { rank: 'Freier', desc: 'Freie Bürger' }
        ]
      },
      blutstadt: {
        name: 'Blutstadt',
        subtitle: 'Der Rote Stadtstaat',
        wappen: 'https://i.imgur.com/A8um0JC.png',
        warriorhood: '<em>Platzhalter: Kriegertum...</em>',
        society: '<em>Platzhalter: Gesellschaft...</em>',
        hierarchy: [
          { rank: 'Stadtfürst', desc: '<em>Platzhalter...</em>' },
          { rank: 'Graf', desc: '<em>Platzhalter...</em>' },
          { rank: 'Baron', desc: '<em>Platzhalter...</em>' },
          { rank: 'Ritterfürst', desc: '<em>Platzhalter...</em>' },
          { rank: 'Ministerialer', desc: 'Wie Ritterherr' },
          { rank: 'Lehensritter', desc: 'Gardist, Ritter der Blutstadt' },
          { rank: 'Fahrender Ritter', desc: '<em>Platzhalter...</em>' },
          { rank: 'Heckenritter', desc: '<em>Platzhalter...</em>' },
          { rank: 'Kirchenritter', desc: '<em>Platzhalter...</em>' },
          { rank: 'Knappe', desc: '<em>Platzhalter...</em>' },
          { rank: 'Page', desc: '<em>Platzhalter...</em>' },
          { rank: 'Freier', desc: 'Freie Bürger' }
        ]
      },
      moinneach: {
        name: 'Móinneach',
        subtitle: 'Die Schwarzmarschen',
        wappen: 'https://i.imgur.com/4I3r6n7.png',
        warriorhood: '<em>Platzhalter: Kriegertum...</em>',
        society: '<em>Platzhalter: Gesellschaft...</em>',
        hierarchy: [
          { rank: 'Fianna', desc: 'Wie bei den Alben – Führer ohne Aristokratie' },
          { rank: 'Ard Tiarna', desc: 'Herzog' },
          { rank: 'Mor Tiarna', desc: 'Graf' },
          { rank: 'Dún Tiarna', desc: '<em>Platzhalter...</em>' },
          { rank: 'Laird', desc: '<em>Platzhalter...</em>' },
          { rank: 'Triath', desc: 'Lokaler Statthalter' },
          { rank: 'Einfacher Tiarna', desc: 'Pendant zum Ritter. Zu diesem Stand gehören Rathaire, Coillan, Drúan, Mordán, Cernach' },
          { rank: 'Laochan', desc: 'Knappe' },
          { rank: 'Fola', desc: 'Page' },
          { rank: 'Slógar', desc: 'Miliz, Waffenknecht' },
          { rank: 'Sept', desc: 'Freier Bürger' }
        ]
      },
      weisenfluh: {
        name: 'Weisenfluh',
        subtitle: 'Die Alpenfestung',
        wappen: 'https://i.imgur.com/Fk0d1kf.png',
        warriorhood: '<em>Platzhalter: Kriegertum...</em>',
        society: '<em>Platzhalter: Gesellschaft...</em>',
        hierarchy: [
          { rank: 'Erlenkönig', desc: 'Wie ein Kleinkönig – oberster Herrscher Weisenfluhs' },
          { rank: 'Landgraf', desc: 'Weisenfluh hat keine Landgrafen (Position nicht besetzt)' },
          { rank: 'Freiherr', desc: 'Baron' },
          { rank: 'Landmann', desc: 'Ritterfürst' },
          { rank: 'Landherr', desc: 'Ritterlicher Herr' },
          { rank: 'Landsritter', desc: 'Ritter. Zu diesem Stand gehören Landsknecht, Landsprotektor, Kürassier, Harlekin, Landsmariner, Landsjäger' },
          { rank: 'Knappe', desc: '<em>Platzhalter...</em>' },
          { rank: 'Page', desc: '<em>Platzhalter...</em>' },
          { rank: 'Freier Bürger', desc: 'Freie Bürger' }
        ]
      },
      aeldrunmar: {
        name: 'Aeldrunmar & Talyndor',
        subtitle: 'Die Zwillingskronen',
        wappen: 'https://i.imgur.com/MJhCj7S.png',
        warriorhood: '<em>Platzhalter: Kriegertum...</em>',
        society: '<em>Platzhalter: Gesellschaft...</em>',
        hierarchy: [
          { rank: 'Coel- / König', desc: 'König' },
          { rank: 'Æthel-', desc: 'Königlichen Blutes' },
          { rank: 'Ealdor-', desc: 'Fürst, Herzog' },
          { rank: 'Earl-', desc: 'Graf' },
          { rank: 'Thain', desc: 'Baron' },
          { rank: 'Reeve', desc: 'Ritterfürst' },
          { rank: 'Ritterherr', desc: '<em>Platzhalter...</em>' },
          { rank: 'Hold', desc: 'Wie Lehenswart, Triath, Thengr – lokaler Statthalter' },
          { rank: 'Eored', desc: 'Ritter. Zu diesem Stand gehören Isen, Wigar, Hyld, Scoet, Særinc, Gliwere, Miles, Ceorl' },
          { rank: 'Knappe', desc: '<em>Platzhalter...</em>' },
          { rank: 'Page', desc: '<em>Platzhalter...</em>' },
          { rank: 'Fyrd', desc: 'Bürger, Freier' }
        ]
      }
    };
