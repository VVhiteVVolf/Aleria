import { escapeHtml } from '../book-shell/book-template-utils.mjs';

const VERSION = '20260912-horse-breeding-v2';

const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/-->/g, '--\\u003e');

function renderBreedOptions(breeds) {
  return breeds.map(breed => `<option value="${escapeHtml(breed.id)}">${escapeHtml(breed.name)}</option>`).join('\n');
}

function renderKnownCrossing(crossing, breedsById) {
  const mare = breedsById.get(crossing.mareId);
  const sire = breedsById.get(crossing.sireId);
  const established = crossing.establishedBreed
    ? `<span>Gefestigte Linie: ${escapeHtml(crossing.establishedBreed)}</span>`
    : '';
  return `<article class="breeding-known-card">
    <p class="eyebrow">${escapeHtml(crossing.source)}</p>
    <h3>${escapeHtml(crossing.name)}</h3>
    <p><strong>${escapeHtml(mare.name)}</strong> <span aria-hidden="true">×</span> <strong>${escapeHtml(sire.name)}</strong></p>
    ${established}${crossing.note ? `<small>${escapeHtml(crossing.note)}</small>` : ''}
  </article>`;
}

export function renderHorseBreedingPage(data) {
  const breedsById = new Map(data.breeds.map(breed => [breed.id, breed]));
  const options = renderBreedOptions(data.breeds);
  return `<!doctype html>
<!-- Generated from horse dossiers and Rossmarkt sources by Bestiarium/scripts/build-horse-breeding.mjs. -->
<html lang="de">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce">
  <title>Zuchtbuch & Kreuzungsmatrix · Pferde Alerias</title>
  <meta name="description" content="Das interaktive Zuchtbuch berechnet Nachzuchten aus 27 Pferderassen Alerias, bewahrt eigene Einträge und deutet jedes Fohlen auf immersive Weise.">
  <link rel="icon" href="../../../../IconOrdner/ReiterIcons/Bestiarium-register.webp" type="image/webp">
  <link rel="stylesheet" href="../../../modules/book-shell/book-shell.css?v=${VERSION}">
  <link rel="stylesheet" href="../../../modules/horse-breeding/horse-breeding.css?v=${VERSION}">
  <script type="module" src="../../../modules/horse-breeding/horse-breeding-page.js?v=${VERSION}"></script>
</head>
<body>
  <a class="skip-link" href="#nachzucht">Zum Nachzucht-Rechner</a>
  <div class="bestiary-page horse-breeding" data-horse-breeding>
    <header class="masthead" id="anfang"><a class="almanach-link" href="../../../index.html#tiere"><span aria-hidden="true">←</span> Aleria <span class="masthead-divider">/</span> Bestiarium</a><span class="masthead-edition">Thalenorische Akademie · Hippologisches Archiv</span><span class="masthead-mark" aria-hidden="true">A</span></header>
    <main>
      <nav class="breeding-breadcrumb" aria-label="Brotkrumennavigation"><a href="../../../index.html">Bestiarium</a><span aria-hidden="true">/</span><a href="../index.html">Pferde</a><span aria-hidden="true">/</span><span aria-current="page">Zuchtbuch</span></nav>

      <section class="breeding-hero" aria-labelledby="breeding-title">
        <div class="breeding-hero-copy"><p class="eyebrow">Pferde Alerias · Archivblatt Z-01</p><h1 id="breeding-title">Das große Zuchtbuch</h1><p class="breeding-subtitle">Nachzuchten berechnen, Blutlinien benennen und ihre Anlagen durch Owain Draig deuten lassen.</p><div class="breeding-hero-actions"><a class="ink-button" href="#nachzucht">Kreuzung anlegen <span aria-hidden="true">↓</span></a><a href="#kreuzungsmatrix">Zur Kreuzungsmatrix ↗</a></div></div>
        <div class="breeding-seal"><img src="../../../assets/icons/horse-breeding.png" width="1254" height="1254" alt="Freigestelltes Aquarellsymbol einer Stute mit ihrem Fohlen" fetchpriority="high"><span>Zuchtarchiv</span></div>
      </section>

      <blockquote class="breeding-quote"><span aria-hidden="true">❧</span><p>„Zwei Blutlinien geben das Versprechen. Erst das Fohlen gibt die Antwort.“<cite>Owain Draig</cite></p><span aria-hidden="true">❧</span></blockquote>

      <nav class="breeding-register" aria-label="Kapitel des Zuchtbuchs">
        <a href="#nachzucht"><span>I</span>Manuelle Kreuzung</a>
        <a href="#aufzeichnungen"><span>II</span>Eigene Aufzeichnungen</a>
        <a href="#bekannte-kreuzungen"><span>III</span>Benannte Kreuzungen</a>
        <a href="#kreuzungsmatrix"><span>IV</span>Kreuzungsmatrix</a>
      </nav>

      <section class="breeding-section breeding-calculator" id="nachzucht" aria-labelledby="calculator-title">
        <header class="breeding-section-heading"><span aria-hidden="true">I</span><div><p class="eyebrow">Nachzucht-Rechner</p><h2 id="calculator-title">Eine Kreuzung anlegen</h2><p>Wähle Stute und Hengst. Das Zuchtbuch übernimmt ihre sechs Rossmarktwerte, mittelt Lebensspanne und Marktwert und würfelt die natürliche Streuung des einzelnen Fohlens aus.</p></div></header>
        <form class="breeding-form" data-role="breeding-form">
          <div class="breeding-parent-grid">
            <fieldset class="breeding-parent"><legend>Stute</legend><label for="breeding-mare">Rasse der Mutter</label><select id="breeding-mare" name="mare" required><option value="">— Rasse wählen —</option>${options}</select><div class="breeding-parent-preview" data-role="mare-preview"><p>Noch keine Stute gewählt.</p></div></fieldset>
            <div class="breeding-cross-mark" aria-hidden="true"><span>×</span><small>Paarung</small></div>
            <fieldset class="breeding-parent"><legend>Hengst</legend><label for="breeding-sire">Rasse des Vaters</label><select id="breeding-sire" name="sire" required><option value="">— Rasse wählen —</option>${options}</select><div class="breeding-parent-preview" data-role="sire-preview"><p>Noch kein Hengst gewählt.</p></div></fieldset>
          </div>
          <div class="breeding-names">
            <label>Fohlenname <input name="foalName" maxlength="80" placeholder="Optional"></label>
            <label>Kreuzungsname <input name="crossName" maxlength="80" placeholder="Bekannte Namen werden automatisch eingesetzt"></label>
            <label class="breeding-notes">Notiz für das Zuchtbuch <textarea name="notes" maxlength="500" rows="3" placeholder="Optional: Fell, Abzeichen, Gestüt oder Beobachtungen"></textarea></label>
          </div>
          <p class="breeding-pair-note" data-role="pair-note" aria-live="polite">Wähle zwei verschiedene Rassen.</p>
          <button class="ink-button breeding-calculate" type="submit" disabled data-role="calculate-button">Fohlen berechnen <span aria-hidden="true">⚄</span></button>
        </form>

        <section class="breeding-result" data-role="breeding-result" aria-live="polite" hidden></section>
      </section>

      <section class="breeding-section" id="aufzeichnungen" aria-labelledby="records-title">
        <header class="breeding-section-heading"><span aria-hidden="true">II</span><div><p class="eyebrow">Lokales Gestütsbuch</p><h2 id="records-title">Eigene Aufzeichnungen</h2><p>Gespeicherte Fohlen und eigene Kreuzungsnamen bleiben in diesem Browser erhalten.</p></div></header>
        <div class="breeding-records" data-role="breeding-records"><p class="breeding-empty">Noch wurde kein Fohlen eingetragen.</p></div>
      </section>

      <section class="breeding-section" id="bekannte-kreuzungen" aria-labelledby="known-title">
        <header class="breeding-section-heading"><span aria-hidden="true">III</span><div><p class="eyebrow">Überlieferte und gefestigte Linien</p><h2 id="known-title">Benannte Kreuzungen</h2><p>Die fünf Namen der alten Rossmarkt-Matrix werden durch die zwei eindeutig belegten Zuchtlinien Brycing und Tirashan ergänzt.</p></div></header>
        <div class="breeding-known-grid">${data.crossings.map(crossing => renderKnownCrossing(crossing, breedsById)).join('\n')}</div>
      </section>

      <section class="breeding-section" id="kreuzungsmatrix" aria-labelledby="matrix-title">
        <header class="breeding-section-heading"><span aria-hidden="true">IV</span><div><p class="eyebrow">27 Rassen · 351 mögliche Paare</p><h2 id="matrix-title">Vollständige Kreuzungsmatrix</h2><p>Die Matrix ist symmetrisch: Eine bekannte Kreuzung gilt unabhängig davon, welche Rasse als Stute oder Hengst gewählt wird. Ein Klick auf eine Zelle übernimmt das Paar in den Rechner.</p></div></header>
        <div class="breeding-matrix-controls"><label>Rasse filtern <input type="search" data-role="matrix-search" placeholder="Name eingeben …"></label><label class="breeding-check"><input type="checkbox" data-role="matrix-named-only"> Nur benannte Paare</label></div>
        <div class="breeding-matrix-legend"><span><i class="known"></i> Überliefert</span><span><i class="custom"></i> Eigener Name</span><span><i class="open"></i> Unbenannt</span></div>
        <div class="breeding-matrix-scroll" data-role="matrix-container" tabindex="0" aria-label="Scrollbare Kreuzungsmatrix"></div>
      </section>

      <noscript><p class="breeding-noscript">Der Rechner, lokale Aufzeichnungen und die interaktive Matrix benötigen JavaScript. Die sieben überlieferten Kreuzungen bleiben oben lesbar.</p></noscript>
    </main>
    <footer class="bestiary-footer"><span class="footer-monogram" aria-hidden="true">A</span><p>Aus den Archiven der Thalenorischen Akademie<small>Zuchtbuch · Pferde Alerias</small></p><a href="../index.html">Zurück zu den Pferden ↗</a></footer>
    <script type="application/json" data-role="horse-breeding-data">${safeJson(data)}</script>
  </div>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}
