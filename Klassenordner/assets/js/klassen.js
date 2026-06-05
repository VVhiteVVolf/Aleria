// BACK TO TOP
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    // NAV ACTIVE STATE
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const anchors  = Array.from(navLinks).map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    const secObs   = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-35% 0px -58% 0px' });
    anchors.forEach(a => secObs.observe(a));

    // STAGGERED CARD FADE-IN
    const cards   = document.querySelectorAll('.class-card:not(.placeholder-card)');
    const cardObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx   = Array.from(cards).indexOf(entry.target);
          const delay = (idx % 8) * 55;
          setTimeout(() => entry.target.classList.add('visible'), delay);
          cardObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    cards.forEach(c => cardObs.observe(c));
    document.querySelectorAll('.placeholder-card').forEach(c => c.classList.add('visible'));

    // WAPPEN PRO KARTE: wrap icons + set CSS var per land section
    const landWappen = {
      'cenyr':       'https://i.imgur.com/00DWDQW.png',
      'vennyr':      'https://i.imgur.com/T8e0EqY.png',
      'alben':       'https://i.imgur.com/WRnLB3t.png',
      'aldrimar':    'https://i.imgur.com/OnNslhr.png',
      'nordmaenner': 'https://i.imgur.com/2KOkdu5.png',
      'goldmund':    'https://i.imgur.com/tTjs23K.png', // Default für Sektion
      'blutstadt':   'https://i.imgur.com/A8um0JC.png',
      'moinneach':   'https://i.imgur.com/4I3r6n7.png',
      'weisenfluh':  'https://i.imgur.com/Fk0d1kf.png',
      'aeldrunmar':  'https://i.imgur.com/MJhCj7S.png',
    };

    Object.entries(landWappen).forEach(([sectionId, wappenUrl]) => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      // Set CSS variable for the ::before pseudo-element
      section.style.setProperty('--card-wappen', `url('${wappenUrl}')`);
      // Wrap every non-placeholder card's img in .card-icon-wrap
      section.querySelectorAll('.class-card:not(.placeholder-card) img').forEach(img => {
        const card = img.closest('.class-card');
        const wrap = document.createElement('div');
        wrap.className = 'card-icon-wrap';
        
        // Für Goldmund & Aldingen: individuelle Wappen pro Karte
        if (sectionId === 'goldmund' && card.dataset.wappen) {
          wrap.style.setProperty('--card-wappen', `url('${card.dataset.wappen}')`);
        }
        
        img.parentNode.insertBefore(wrap, img);
        wrap.appendChild(img);
      });
    });

    // TOOLTIP – JS-driven to avoid ::after conflict with shimmer
    const tooltip = document.createElement('div');
    tooltip.className = 'rpg-tooltip';
    document.body.appendChild(tooltip);

    document.querySelectorAll('.class-card[data-tooltip]').forEach(card => {
      card.addEventListener('mouseenter', e => {
        tooltip.textContent = card.dataset.tooltip;
        tooltip.classList.add('visible');
        positionTooltip(e);
      });
      card.addEventListener('mousemove', positionTooltip);
      card.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
      });
    });

    function positionTooltip(e) {
      const margin = 14;
      const tw = tooltip.offsetWidth;
      const th = tooltip.offsetHeight;
      let x = e.clientX - tw / 2;
      let y = e.clientY - th - margin;
      // Keep within viewport
      x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
      if (y < 8) y = e.clientY + margin;
      tooltip.style.left = x + 'px';
      tooltip.style.top  = y + 'px';
    }

    // SEARCH
    const searchInput = document.getElementById('classSearch');
    const noResults   = document.getElementById('noResults');
    const allCards    = document.querySelectorAll('.class-card');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      let count = 0;
      allCards.forEach(card => {
        if (card.classList.contains('placeholder-card')) return;
        const match = !q
          || (card.dataset.name    || '').toLowerCase().includes(q)
          || (card.dataset.tooltip || '').toLowerCase().includes(q)
          || (card.querySelector('.class-name')?.textContent   || '').toLowerCase().includes(q)
          || (card.querySelector('.class-flavor')?.textContent || '').toLowerCase().includes(q);
        card.classList.toggle('hidden', !match);
        if (match) count++;
      });
      noResults.style.display = (q && count === 0) ? 'block' : 'none';
    });
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') { searchInput.value = ''; searchInput.dispatchEvent(new Event('input')); searchInput.blur(); }
    });

    // =========================================================
    // SIDEBAR FUNCTIONALITY
    // =========================================================
    
    // Left Sidebar - Toggle Collapse
    const sidebarLeft = document.getElementById('sidebarLeft');
    const sidebarToggleLeft = document.getElementById('sidebarToggleLeft');
    const toggleIconLeft = document.getElementById('toggleIconLeft');
    
    sidebarToggleLeft.addEventListener('click', () => {
      sidebarLeft.classList.toggle('collapsed');
      document.body.classList.toggle('left-collapsed');
      toggleIconLeft.textContent = sidebarLeft.classList.contains('collapsed') ? '▶' : '◀';
      playSound('toggle');
    });
    
    // Right Sidebar - Toggle Collapse
    const sidebarRight = document.getElementById('sidebarRight');
    const sidebarToggleRight = document.getElementById('sidebarToggleRight');
    const toggleIconRight = document.getElementById('toggleIconRight');
    
    sidebarToggleRight.addEventListener('click', () => {
      sidebarRight.classList.toggle('collapsed');
      document.body.classList.toggle('right-collapsed');
      toggleIconRight.textContent = sidebarRight.classList.contains('collapsed') ? '◀' : '▶';
      playSound('toggle');
    });
    
    // Calculate Statistics
    function updateStats() {
      const allClassCards = document.querySelectorAll('.class-card:not(.placeholder-card)');
      const totalClasses = allClassCards.length;
      
      const landSections = document.querySelectorAll('.land-section[id]');
      const totalLands = landSections.length;
      
      document.getElementById('totalClasses').textContent = totalClasses;
      document.getElementById('totalLands').textContent = totalLands;
    }
    
    // Build Navigation List
    function buildNavigation() {
      const navList = document.getElementById('navLandList');
      const landSections = [
        { id: 'basis', name: 'Basisklassen', icon: 'https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png' },
        { id: 'cenyr', name: 'Cenyr', icon: 'https://i.imgur.com/00DWDQW.png' },
        { id: 'vennyr', name: 'Vennyr', icon: 'https://i.imgur.com/T8e0EqY.png' },
        { id: 'alben', name: 'Alben', icon: 'https://i.imgur.com/WRnLB3t.png' },
        { id: 'aldrimar', name: 'Aldrimar', icon: 'https://i.imgur.com/OnNslhr.png' },
        { id: 'nordmaenner', name: 'Nordmänner', icon: 'https://i.imgur.com/2KOkdu5.png' },
        { id: 'goldmund', name: 'Goldmund & Aldingen', icon: 'https://i.imgur.com/tTjs23K.png' },
        { id: 'blutstadt', name: 'Blutstadt', icon: 'https://i.imgur.com/A8um0JC.png' },
        { id: 'moinneach', name: 'Móinneach', icon: 'https://i.imgur.com/4I3r6n7.png' },
        { id: 'weisenfluh', name: 'Weisenfluh', icon: 'https://i.imgur.com/Fk0d1kf.png' },
        { id: 'aeldrunmar', name: 'Aeldrunmar & Talyndor', icon: 'https://i.imgur.com/MJhCj7S.png' }
      ];
      
      landSections.forEach(land => {
        const section = document.getElementById(land.id);
        if (!section) return;
        
        const classCount = section.querySelectorAll('.class-card:not(.placeholder-card)').length;
        
        const li = document.createElement('li');
        li.className = 'nav-land-item';
        li.innerHTML = `
          <a href="#${land.id}" class="nav-land-link" data-land="${land.id}">
            <img src="${land.icon}" alt="${land.name}" class="nav-land-icon">
            <span>${land.name}</span>
            <span class="nav-land-count">${classCount}</span>
          </a>
        `;
        navList.appendChild(li);
      });
      
      // Add click handlers
      document.querySelectorAll('.nav-land-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.dataset.land;
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }
    
    // Right Sidebar - ScrollSpy & Dynamic Lore
    const loreData = {
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
    
    function updateLore(landId) {
      const data = loreData[landId];
      if (!data) return;
      
      const container = document.getElementById('loreContainer');
      container.classList.remove('active');
      
      setTimeout(() => {
        document.getElementById('loreWappenImg').src = data.wappen;
        document.getElementById('loreLandName').textContent = data.name;
        document.getElementById('loreLandSubtitle').textContent = data.subtitle;
        document.getElementById('loreWarriorhood').innerHTML = data.warriorhood;
        document.getElementById('loreSociety').innerHTML = data.society;
        
        const hierarchyList = document.getElementById('loreHierarchy');
        hierarchyList.innerHTML = data.hierarchy.map(h => 
          `<li><span class="lore-rank">${h.rank}:</span> ${h.desc}</li>`
        ).join('');
        
        container.classList.add('active');
      }, 200);
    }
    
    // ScrollSpy - Update lore based on visible section
    const loreObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          const landId = entry.target.id;
          updateLore(landId);
          
          // Update active nav link
          document.querySelectorAll('.nav-land-link').forEach(link => {
            link.classList.toggle('active', link.dataset.land === landId);
          });
        }
      });
    }, { threshold: [0.3, 0.5], rootMargin: '-100px 0px -60% 0px' });
    
    // Observe all sections
    document.querySelectorAll('.land-section[id], #basis').forEach(section => {
      loreObserver.observe(section);
    });
    
    // Initialize
    updateStats();
    buildNavigation();

    // =========================================================
    // RARITY SYSTEM - Auto-assign rarity classes
    // =========================================================
    const rarityMap = {
      // Cenyr
      'milwr': 'common',
      'arthwyr': 'special',
      'barddwyr': 'special',
      // Vennyr
      'derwyn': 'holy',
      // Alben
      'kern': 'common',
      'silvaner': 'special',
      'fathach': 'special',
      'galloghlaigh': 'special',
      // Aldrimar
      'hird': 'common',
      'maid': 'common',
      // Nordmänner
      'kona': 'common',
      'ulfhednar': 'holy',
      // Goldmund & Aldingen
      'aldknecht': 'common',
      'flamberger': 'aldingen',
      'havner': 'aldingen',
      'güldner': 'goldmund',
      'oraner': 'goldmund',
      // Blutstadt
      'gardist': 'common',
      // Móinneach
      'slógar': 'common',
      // Weisenfluh
      'landsknecht': 'common',
      // Aeldrunmar & Talyndor
      'fyrd': 'common'
    };

    document.querySelectorAll('.class-card:not(.placeholder-card)').forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const rarity = rarityMap[name] || 'elite';
      card.classList.add(`rarity-${rarity}`);
    });

    // =========================================================
    // RANDOM CLASS FEATURE
    // =========================================================
    const lands = [
      { id: 'cenyr', name: 'Cenyr' },
      { id: 'vennyr', name: 'Vennyr' },
      { id: 'alben', name: 'Alben' },
      { id: 'aldrimar', name: 'Aldrimar' },
      { id: 'nordmaenner', name: 'Nordmänner' },
      { id: 'goldmund', name: 'Goldmund & Aldingen' },
      { id: 'blutstadt', name: 'Blutstadt' },
      { id: 'moinneach', name: 'Móinneach' },
      { id: 'weisenfluh', name: 'Weisenfluh' },
      { id: 'aeldrunmar', name: 'Aeldrunmar & Talyndor' }
    ];

    const randomModal = document.getElementById('randomModal');
    const landCheckboxes = document.getElementById('landCheckboxes');
    const randomClassBtn = document.getElementById('randomClassBtn');
    const cancelRandomBtn = document.getElementById('cancelRandomBtn');
    const rollRandomBtn = document.getElementById('rollRandomBtn');

    // Create checkboxes
    lands.forEach(land => {
      const div = document.createElement('div');
      div.className = 'land-checkbox';
      div.innerHTML = `
        <input type="checkbox" id="land-${land.id}" value="${land.id}" checked>
        <label for="land-${land.id}">${land.name}</label>
      `;
      div.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          const checkbox = div.querySelector('input');
          checkbox.checked = !checkbox.checked;
        }
      });
      landCheckboxes.appendChild(div);
    });

    randomClassBtn.addEventListener('click', () => {
      randomModal.classList.add('active');
      playSound('open');
    });

    cancelRandomBtn.addEventListener('click', () => {
      randomModal.classList.remove('active');
      playSound('close');
    });

    randomModal.addEventListener('click', (e) => {
      if (e.target === randomModal) {
        randomModal.classList.remove('active');
        playSound('close');
      }
    });

    rollRandomBtn.addEventListener('click', () => {
      const selectedLands = Array.from(document.querySelectorAll('#landCheckboxes input:checked')).map(cb => cb.value);
      
      if (selectedLands.length === 0) {
        alert('Bitte wähle mindestens ein Land aus!');
        return;
      }

      // Get all non-common, non-placeholder cards from selected lands
      const eligibleCards = [];
      selectedLands.forEach(landId => {
        const section = document.getElementById(landId);
        if (section) {
          section.querySelectorAll('.class-card:not(.placeholder-card):not(.rarity-common)').forEach(card => {
            eligibleCards.push(card);
          });
        }
      });

      if (eligibleCards.length === 0) {
        alert('Keine Klassen in den gewählten Ländern gefunden (Milizen ausgeschlossen)!');
        return;
      }

      // Roll random
      const randomCard = eligibleCards[Math.floor(Math.random() * eligibleCards.length)];
      
      randomModal.classList.remove('active');
      playSound('roll');
      
      // Show epic reveal
      showEpicReveal(randomCard);
    });

    // Epic Reveal System
    function showEpicReveal(card) {
      const overlay = document.getElementById('revealOverlay');
      const revealCard = document.getElementById('revealCard');
      const revealFront = document.getElementById('revealCardFront');
      const revealCloseBtn = document.getElementById('revealCloseBtn');
      const sparklesContainer = document.getElementById('revealSparkles');
      
      // Get card data
      const cardIcon = card.querySelector('img');
      const cardName = card.querySelector('.class-name');
      const cardFlavor = card.querySelector('.class-flavor');
      const landSection = card.closest('.land-section');
      const landName = landSection ? landSection.querySelector('.land-info h2')?.textContent : 'Unbekannt';
      
      // Build reveal card content
      revealFront.innerHTML = `
        <div class="reveal-sparkles" id="revealSparkles"></div>
        <img class="reveal-card-icon" src="${cardIcon.src}" alt="${cardName.textContent}">
        <div class="reveal-card-name">${cardName.textContent}</div>
        ${cardFlavor ? `<div class="reveal-card-flavor">${cardFlavor.textContent}</div>` : ''}
        <div class="reveal-card-land">${landName}</div>
      `;
      
      // Reset animations
      revealCard.classList.remove('flipped');
      revealCloseBtn.classList.remove('visible');
      
      // Show overlay
      overlay.classList.add('active');
      
      // Play reveal sound sequence
      playSound('roll');
      
      // Flip card after roll-in
      setTimeout(() => {
        revealCard.classList.add('flipped');
        playSound('open');
        
        // Create sparkles
        createSparkles();
        
        // Show close button
        setTimeout(() => {
          revealCloseBtn.classList.add('visible');
        }, 800);
      }, 1200);
      
      // Close button handler
      revealCloseBtn.onclick = () => {
        closeReveal();
      };
      
      // Click overlay to close
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          closeReveal();
        }
      };
      
      // ESC to close
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          closeReveal();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
      
      function closeReveal() {
        playSound('close');
        overlay.classList.remove('active');
        revealCard.classList.remove('flipped');
        revealCloseBtn.classList.remove('visible');
        
        // Scroll to actual card after closing
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Brief highlight on actual card
          card.style.animation = 'none';
          setTimeout(() => {
            card.style.animation = 'highlight 1.5s ease';
          }, 100);
          
          setTimeout(() => {
            card.style.animation = '';
          }, 1600);
        }, 300);
      }
      
      function createSparkles() {
        const sparklesContainer = revealFront.querySelector('.reveal-sparkles');
        sparklesContainer.innerHTML = '';
        
        for (let i = 0; i < 30; i++) {
          setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            sparkle.style.setProperty('--tx', `${tx}px`);
            sparkle.style.setProperty('--ty', `${ty}px`);
            sparkle.style.left = '50%';
            sparkle.style.top = '50%';
            
            sparklesContainer.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1500);
          }, i * 50);
        }
      }
    }

    // Add highlight animation (keep existing)
    const style = document.createElement('style');
    style.textContent = `
      @keyframes highlight {
        0%, 100% { transform: translateY(0) scale(1); box-shadow: var(--shadow-sm); }
        50% { transform: translateY(-15px) scale(1.1); box-shadow: 0 20px 50px rgba(0,0,0,.3), 0 0 40px var(--gold-bright); }
      }
    `;
    document.head.appendChild(style);

    // =========================================================
    // SOUND EFFECTS SYSTEM
    // =========================================================
    let soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const soundIcon = document.getElementById('soundIcon');

    // Update UI
    function updateSoundUI() {
      if (soundEnabled) {
        soundToggleBtn.classList.add('active');
        soundIcon.textContent = '🔊';
      } else {
        soundToggleBtn.classList.remove('active');
        soundIcon.textContent = '🔇';
      }
    }
    updateSoundUI();

    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('soundEnabled', soundEnabled);
      updateSoundUI();
      if (soundEnabled) playSound('toggle');
    });

    // Create audio context for sounds
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    function playSound(type) {
      if (!soundEnabled) return;

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      switch(type) {
        case 'hover': // Subtle metal clink
          oscillator.frequency.value = 880;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 0.1);
          break;
        
        case 'scroll': // Parchment rustle
          oscillator.frequency.value = 200;
          oscillator.type = 'triangle';
          gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 0.15);
          break;
        
        case 'open': // Modal open
          oscillator.frequency.value = 440;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 0.2);
          break;
        
        case 'close': // Modal close
          oscillator.frequency.value = 330;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 0.15);
          break;
        
        case 'roll': // Dice roll
          oscillator.frequency.value = 600;
          oscillator.type = 'square';
          gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 0.3);
          break;
        
        case 'toggle': // Toggle sound
          oscillator.frequency.value = 550;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 0.12);
          break;
      }
    }

    // Add sound to card hovers
    document.querySelectorAll('.class-card:not(.placeholder-card)').forEach(card => {
      card.addEventListener('mouseenter', () => playSound('hover'));
    });

    // Add sound to scrolling between lands
    let lastScrollTop = 0;
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const st = window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(st - lastScrollTop) > 200) {
          playSound('scroll');
          lastScrollTop = st;
        }
      }, 100);
    }, { passive: true });
