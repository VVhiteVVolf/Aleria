// ========= STATE =========
    let currentGodIndex = 0;
    let currentMode = "priest"; // priest | paladin | monk | gelauterte

    // ========= ELEMENTS =========
    const godListEl = document.getElementById("godList");
    const contentArea = document.getElementById("contentArea");

    const elGodName = document.getElementById("godName");
    const elGodTitle = document.getElementById("godTitle");
    const elGearTitle = document.getElementById("gearTitle");
    const elGearDesc = document.getElementById("gearDesc");
    const elPalette = document.getElementById("paletteBox");
    const elTagRow = document.getElementById("tagRow");
    const elImage = document.getElementById("charImage");
    const elImgCaption = document.getElementById("imgCaption");
    const elModeLabel = document.getElementById("modeLabel");

    const infoGod = document.getElementById("infoGod");
    const infoTitle = document.getElementById("infoTitle");
    const infoSymbol = document.getElementById("infoSymbol");
    const infoTraits = document.getElementById("infoTraits");
    const infoVirtues = document.getElementById("infoVirtues");
    const infoAudience = document.getElementById("infoAudience");
    const infoPatron = document.getElementById("infoPatron");
    const infoGuilds = document.getElementById("infoGuilds");
    const panelTitle = document.getElementById("panelTitle");
    const panelInfo = document.getElementById("panelInfo");
    const panelHierarchy = document.getElementById("panelHierarchy");
    const hierarchyTitle = document.getElementById("hierarchyTitle");
    const hierarchyList = document.getElementById("hierarchyList");
    const panelTabs = Array.from(document.querySelectorAll(".panel-tab"));

    let rightPanelView = "info"; // "info" | "hierarchy"
    const imageCache = new Map();
    const failedImageSources = new Set();
    const queuedImageSources = new Set();
    const preloadQueue = [];
    const PRELOAD_CONCURRENCY = 2;
    let activePreloads = 0;
    let currentImageFallback = "";

    function scheduleIdleWork(callback){
      if("requestIdleCallback" in window){
        window.requestIdleCallback(callback, { timeout: 1200 });
      } else {
        window.setTimeout(callback, 120);
      }
    }

    function preloadImage(src, priority = "auto"){
      if(!src || failedImageSources.has(src)) return Promise.resolve(false);
      if(imageCache.has(src)) return imageCache.get(src);

      const img = new Image();
      img.decoding = "async";
      img.loading = priority === "high" ? "eager" : "lazy";
      img.fetchPriority = priority;

      const promise = new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => {
          failedImageSources.add(src);
          resolve(false);
        };
      });

      imageCache.set(src, promise);
      img.src = src;
      return promise;
    }

    function pumpPreloadQueue(){
      while(activePreloads < PRELOAD_CONCURRENCY && preloadQueue.length){
        const src = preloadQueue.shift();
        queuedImageSources.delete(src);
        if(!src || imageCache.has(src) || failedImageSources.has(src)) continue;

        activePreloads++;
        preloadImage(src, "low").finally(() => {
          activePreloads--;
          window.setTimeout(pumpPreloadQueue, 180);
        });
      }
    }

    function queuePreload(src){
      if(!src || imageCache.has(src) || failedImageSources.has(src) || queuedImageSources.has(src)) return;
      queuedImageSources.add(src);
      preloadQueue.push(src);
      scheduleIdleWork(pumpPreloadQueue);
    }

    function preloadSources(sources, priority = "auto"){
      for(const src of sources){
        if(priority === "high"){
          preloadImage(src, priority);
        } else {
          queuePreload(src);
        }
      }
    }

    function getPrimaryImageSources(){
      const sources = [];
      for(const god of godsData){
        for(const mode of ["priest", "paladin", "monk"]){
          const src = god?.[mode]?.img;
          if(src) sources.push(src);
        }
      }
      if(gelaeuterteData?.img) sources.push(gelaeuterteData.img);
      return Array.from(new Set(sources));
    }

    function warmNearbyImages(){
      const god = godsData[currentGodIndex];
      const nearby = [];

      if(currentMode === "gelauterte"){
        nearby.push(gelaeuterteData?.img);
      } else {
        nearby.push(god?.[currentMode]?.img);
        for(const mode of ["priest", "paladin", "monk"]){
          nearby.push(god?.[mode]?.img);
        }
      }

      for(const offset of [-1, 1]){
        const neighbor = godsData[currentGodIndex + offset];
        if(neighbor && currentMode !== "gelauterte"){
          nearby.push(neighbor?.[currentMode]?.img);
        }
      }

      const [active, ...rest] = Array.from(new Set(nearby.filter(Boolean)));
      preloadImage(active, "high");
      preloadSources(rest, "auto");
    }

    function imageForSelection(godIndex, mode){
      if(mode === "gelauterte") return gelaeuterteData?.img;
      return godsData[godIndex]?.[mode]?.img;
    }


    // ========= BUILD SIDEBAR =========
    function renderSidebar(){
      // Clear completely (also removes section headers/dividers)
      godListEl.innerHTML = "";

      // Section header: Die Neun
      const divTop = document.createElement("div");
      divTop.className = "sidebar-divider";
      godListEl.appendChild(divTop);

      const headTop = document.createElement("div");
      headTop.className = "sidebar-section";
      headTop.textContent = "Die Neun";
      godListEl.appendChild(headTop);

      const splitIndexNeun = 9;   // Die Neun -> danach: Die Souveränen
const splitIndexUnter = 14; // Die Souveränen -> danach: Untergötter (nach 5 Souveränen)

godsData.forEach((god, index) => {
  if(index === splitIndexNeun){
    const div = document.createElement("div");
    div.className = "sidebar-divider";
    godListEl.appendChild(div);

    const head = document.createElement("div");
    head.className = "sidebar-section";
    head.textContent = "Die Souveränen";
    godListEl.appendChild(head);
  }

  if(index === splitIndexUnter){
    const div = document.createElement("div");
    div.className = "sidebar-divider";
    godListEl.appendChild(div);

    const head = document.createElement("div");
    head.className = "sidebar-section";
    head.textContent = "Untergötter";
    godListEl.appendChild(head);
  }
const btn = document.createElement("button");
        btn.className = `god-btn ${index === currentGodIndex ? "active" : ""}`;
        btn.type = "button";
        btn.innerHTML = `
          <div class="sigil">
            <img src="${iconPath(god.id)}" alt="${god.name} Icon"
                 onerror="this.remove(); this.parentElement.textContent='✦';">
          </div>
          <div class="god-meta">
            <div class="god-name">${god.name}</div>
            <div class="god-title">${god.title}</div>
          </div>
        `;
        btn.addEventListener("click", () => {
          if (index === currentGodIndex) return;
          currentGodIndex = index;
          renderSidebar();
          updateContent(true);
        });
        btn.addEventListener("pointerenter", () => preloadImage(imageForSelection(index, currentMode), "high"));
        btn.addEventListener("focus", () => preloadImage(imageForSelection(index, currentMode), "high"));
        godListEl.appendChild(btn);
      });
    }

    // ========= MODE SWITCH =========
    document.getElementById("modeSwitch").addEventListener("click", (e) => {
      const btn = e.target.closest(".mode-btn");
      if(!btn) return;

      const mode = btn.dataset.mode;
      if(mode === currentMode) return;

      currentMode = mode;
      setModeExplainer(currentMode);

      document.querySelectorAll(".mode-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === currentMode));
      setModeExplainer(currentMode);
    updateContent();
    });

    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("pointerenter", () => preloadImage(imageForSelection(currentGodIndex, btn.dataset.mode), "high"));
      btn.addEventListener("focus", () => preloadImage(imageForSelection(currentGodIndex, btn.dataset.mode), "high"));
    });


    // ========= MODE-ERKLÄRUNGEN (unter den Tabs) =========
    const modeExplain = {
  priest: `
<b>Priester</b> sind geweihte Geistliche der Alerischen Kirche.
Durch ein <b>Sakrament</b> treten sie in den priesterlichen Dienst ein und stehen zu den Göttlichen
wie ein <i>Kind zu seinem Vater</i>.

Priester dürfen <b>heiraten</b>, <b>Kinder zeugen</b>, <b>Lehen erben</b> und
<b>über Ortschaften herrschen</b>.
Sie wirken sakramental, verwalten kirchliche Ämter und können höchste weltliche Autorität legitimieren.

<b>Kleriker</b> sind kämpfende Priester.
Sie stehen zwischen Geistlichkeit und Rittertum, tragen Waffen und führen den Glauben aktiv ins Feld.
Erst durch einen <b>Eid</b> und eine <b>weitere Weihe</b> werden sie zu Paladinen erhoben.
  `,

  monk: `
<b>Mönche und Nonnen</b> sind Geistliche, die ein <b>Gelübde</b> abgelegt haben,
um sich einem lokalen Kloster, Orden oder Heiligtum zu verschreiben.

Sie sagen sich von weltlichen Bindungen los:
keine Ehe, keine Kinder, kein Landbesitz.
Ihr Leben ist geprägt von <b>Regel</b>, <b>Disziplin</b> und <b>Dienst</b>.

Sie wirken meist fern politischer Macht – durch Arbeit, Fürsorge,
Studium oder Schweigen.
  `,

  paladin: `
<b>Paladine</b> sind gesalbte Ritter der Kirche.
Durch ein <b>Sakrament</b> und eine <b>Schwertleite</b> werden sie zugleich
zu Rittern <i>und</i> Priestern erhoben.

Ihr Eid bindet sie an ihren Gott
<b>so unumstößlich wie ein Lehnsvertrag</b>.
Ein Paladin dient nicht nur mit Stahl,
sondern auch mit geistlicher Autorität.

Nicht jeder Kleriker ist ein Paladin –
doch jeder Paladin war einst ein Kleriker oder Priester.
  `,

  gelauterte: `
<b>Geläuterte</b> sind Verurteilte im kirchlichen Bußdienst.
Unter Aufsicht leisten sie schweigend Arbeit für die Kirche,
häufig mit Mundbinden oder Masken.

Erst nach erfüllter Buße wird ihr Eid gelöst
und sie erhalten ihre Freiheit zurück.
  `
};
    const elModeExplainer = document.getElementById('modeExplainer');
    const elModeExplainerMode = document.getElementById('modeExplainerMode');
    const elModeExplainerText = document.getElementById('modeExplainerText');

    function setModeExplainer(mode){
      if(!elModeExplainer) return;
      elModeExplainerMode.textContent = (
        mode === 'priest' ? 'Priester & Klerus' :
        mode === 'paladin' ? 'Paladine & Orden' :
        mode === 'monk' ? 'Mönche & Nonnen' :
        'Geläuterte'
      );
      elModeExplainerText.innerHTML = modeExplain[mode] || '—';
      // Slide-Reset für Wechsel: kurz schließen und wieder öffnen
      elModeExplainer.classList.remove('open');
      requestAnimationFrame(() => elModeExplainer.classList.add('open'));
    }

    // ========= RIGHT PANEL TABS =========
    function setRightPanelView(view){
      rightPanelView = view === "hierarchy" ? "hierarchy" : "info";
      panelTabs.forEach(b => b.classList.toggle("active", b.dataset.panel === rightPanelView));
      const showInfo = rightPanelView === "info";
      if(panelInfo) panelInfo.style.display = showInfo ? "" : "none";
      if(panelHierarchy) panelHierarchy.style.display = showInfo ? "none" : "";
      if(panelTitle) panelTitle.textContent = showInfo ? "Wissenswertes" : "Hierarchie";
    }

    panelTabs.forEach(btn => {
      btn.addEventListener("click", () => setRightPanelView(btn.dataset.panel));
    });

    // ========= HIERARCHY RENDER =========
    function modeLabel(mode){
      return mode === "priest" ? "Priester & Klerus"
        : mode === "paladin" ? "Paladine & Orden"
        : mode === "monk" ? "Mönche & Nonnen"
        : "Geläuterte";
    }

    function renderHierarchy(mode, god){
      if(!hierarchyList || !hierarchyTitle) return;

      const override = god?.hierarchy && god.hierarchy[mode];
      const ranks = Array.isArray(override) ? override : (hierarchyData[mode] || []);
      const sectionTitle = (
        mode === "priest" ? "Priesterliche Hierarchie" :
        mode === "monk" ? "Monastische Hierarchie" :
        mode === "paladin" ? "Militante Hierarchie" :
        "Bußdienst – Ränge"
      );
      hierarchyTitle.textContent = sectionTitle;

      hierarchyList.innerHTML = "";
      if(!ranks.length){
        hierarchyList.innerHTML = '<div style="color:rgba(224,224,224,.7);font-family:Lato,sans-serif;font-size:12px;">Keine Ränge definiert.</div>';
        return;
      }

      for(const r of ranks){
        const item = document.createElement("div");
        item.className = "hierarchy-item";

        const icon = document.createElement("div");
        icon.className = "hierarchy-icon";

        const img = document.createElement("img");
        img.alt = r.name || r.key || "Icon";
        img.decoding = "async";
        img.loading = "lazy";
        const rankSrc = rankIconPath(r.key);

        const fb = document.createElement("span");
        fb.className = "sigil-fallback";
        fb.textContent = "✦";

        if(failedImageSources.has(rankSrc)){
          img.style.display = "none";
        } else {
          img.src = rankSrc;
          img.onerror = () => {
            failedImageSources.add(rankSrc);
            img.style.display = "none";
            fb.style.display = "";
          };
          img.onload = () => { fb.style.display = "none"; };
        }

        icon.appendChild(img);
        icon.appendChild(fb);

        const body = document.createElement("div");
        const name = document.createElement("div");
        name.className = "hierarchy-name";
        name.textContent = r.name || r.key;

        const desc = document.createElement("div");
        desc.className = "hierarchy-desc";
        desc.textContent = r.desc || "—";

        body.appendChild(name);

        if(Array.isArray(r.alts) && r.alts.length){
          const alts = document.createElement("div");
          alts.className = "hierarchy-alts";
          alts.textContent = r.alts.filter(Boolean).join(" · ");
          body.appendChild(alts);
        }

        body.appendChild(desc);

        item.appendChild(icon);
        item.appendChild(body);

        hierarchyList.appendChild(item);
      }
    }
    function modeLabel(mode){
      if(mode === "priest") return "Priestertum";
      if(mode === "paladin") return "Stahl & Schild";
      if(mode === "monk") return "Mönch & Orden";
      return "Bußdienst";
    }

    // ========= IMAGE FALLBACK =========
    function makeImageFallback(godName, mode){
      // Offline-sicherer Placeholder (kein externer Request)
      const label = `${godName} – ${mode === "priest" ? "Priester" : mode === "paladin" ? "Paladin" : mode === "monk" ? "Mönch" : "Geläuterte"}`;
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#0d0d0d"/>
              <stop offset="1" stop-color="#141414"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
          <rect x="18" y="18" width="364" height="564" rx="18" ry="18" fill="none" stroke="#c5a059" stroke-opacity=".55"/>
          <text x="200" y="300" fill="#c5a059" font-family="Cinzel, serif" font-size="20" text-anchor="middle">Bild fehlt</text>
          <text x="200" y="336" fill="#a0a0a0" font-family="Lato, sans-serif" font-size="14" text-anchor="middle">${label.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</text>
        </svg>`;
      return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
    }

    function setImageWithFallback(src, godName, mode){
      const fallback = makeImageFallback(godName, mode);
      currentImageFallback = fallback;
      elImage.onerror = () => {
        if(src) failedImageSources.add(src);
        if(elImage.src !== currentImageFallback) elImage.src = currentImageFallback;
      };

      if(!src || failedImageSources.has(src)){
        if(elImage.src !== fallback) elImage.src = fallback;
        return;
      }

      elImage.fetchPriority = "high";
      preloadImage(src, "high");
      if(elImage.getAttribute("src") !== src) elImage.src = src;
    }

    // ========= UPDATE VIEW =========
    function updateContent(){
      const god = godsData[currentGodIndex];
      let data;

      if(currentMode === "gelauterte"){
        data = gelaeuterteData;
      } else {
        if(!god[currentMode]) currentMode = "priest";
        data = god[currentMode];
      }

      preloadImage(data?.img, "high");
      warmNearbyImages();

      // Slide out
      contentArea.classList.remove("visible");

      setTimeout(() => {
        elGodName.textContent = god.name;
        elGodTitle.textContent = god.title;

        elGearTitle.textContent = data.title || "—";
        elGearDesc.innerHTML = data.desc || "—";
        elModeLabel.textContent = modeLabel(currentMode);

        // palette dots
        elPalette.innerHTML = "";
        (god.colors || []).forEach(c => {
          const dot = document.createElement("div");
          dot.className = "color-dot";
          dot.style.backgroundColor = c;
          elPalette.appendChild(dot);
        });

        // tags -> werden ins Wissenswertes-Panel verschoben
        elTagRow.classList.add("hidden");
        elTagRow.innerHTML = "";

        const traits = Array.isArray(data.tags) ? data.tags.filter(Boolean) : [];
        infoTraits.textContent = traits.length ? traits.join(", ") : "—";
// image + caption
        setImageWithFallback(data.img, god.name, currentMode);
        elImgCaption.textContent = "400×600";

        // right panel info
        infoGod.textContent = god.name;

        if(currentMode === "gelauterte"){
          infoTitle.textContent = gelaeuterteData.title;
          infoSymbol.textContent = gelaeuterteData.symbol || "—";

          const virtues = Array.isArray(gelaeuterteData.virtues) ? gelaeuterteData.virtues.filter(Boolean) : [];
          infoVirtues.textContent = virtues.length ? virtues.join(", ") : "—";

          const audience = Array.isArray(gelaeuterteData.audience) ? gelaeuterteData.audience.filter(Boolean) : [];
          infoAudience.textContent = audience.length ? audience.join(", ") : (gelaeuterteData.audience || "—");

          const patron = Array.isArray(gelaeuterteData.patron) ? gelaeuterteData.patron.filter(Boolean) : [];
          infoPatron.textContent = patron.length ? patron.join(", ") : (gelaeuterteData.patron || "—");

          const guilds = Array.isArray(gelaeuterteData.guilds) ? gelaeuterteData.guilds.filter(Boolean) : [];
          infoGuilds.textContent = guilds.length ? guilds.join(", ") : (gelaeuterteData.guilds || "—");
        } else {
          infoTitle.textContent = god.title;
          infoSymbol.textContent = god.symbol || "—";

          const virtues = Array.isArray(god.virtues) ? god.virtues.filter(Boolean) : [];
          infoVirtues.textContent = virtues.length ? virtues.join(", ") : "—";

          const audience = Array.isArray(god.audience) ? god.audience.filter(Boolean) : [];
          infoAudience.textContent = audience.length ? audience.join(", ") : (god.audience || "—");

          const patron = Array.isArray(god.patron) ? god.patron.filter(Boolean) : [];
          infoPatron.textContent = patron.length ? patron.join(", ") : (god.patron || "—");

          const guilds = Array.isArray(god.guilds) ? god.guilds.filter(Boolean) : [];
          infoGuilds.textContent = guilds.length ? guilds.join(", ") : (god.guilds || "—");
        }

        // Slide in
        contentArea.classList.add("visible");
      }, 220);
    
        // hierarchy panel (always prepare; view toggle decides visibility)
        renderHierarchy(currentMode, god);
        setRightPanelView(rightPanelView);
}

    // ========= OPTIONAL: prüft doppelte Bildpfade =========
    (function verifyUniqueImagePaths(){
      const seen = new Map();
      for(const g of godsData){
        for(const mode of ["priest","paladin","monk"]){
          const path = g?.[mode]?.img;
          if(!path) continue;
          if(seen.has(path)){
            console.warn("Doppelter Bildpfad:", path, "bei", g.id, mode, "und", seen.get(path));
          } else {
            seen.set(path, `${g.id}.${mode}`);
          }
        }
      }

      // global mode asset (optional)
      if(gelaeuterteData?.img){
        if(seen.has(gelaeuterteData.img)){
          console.warn("Doppelter Bildpfad:", gelaeuterteData.img, "bei gelauterte und", seen.get(gelaeuterteData.img));
        }
      }
    })();

    // ========= INIT =========
    setModeExplainer(currentMode);
    warmNearbyImages();
    scheduleIdleWork(() => preloadSources(getPrimaryImageSources()));
    renderSidebar();
    updateContent();


