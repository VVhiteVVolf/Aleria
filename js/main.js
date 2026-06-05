/* Aleria – SPA Router & UI
   Vanilla JS, keine Frameworks.
*/
(function () {
  const content = document.getElementById('content');
  const primaryNav = document.getElementById('primaryNav');
  const navToggle = document.getElementById('navToggle');
  const sidebarLeft = document.getElementById('sidebarLeft');
  const sidebarRight = document.getElementById('sidebarRight');
  const filterInput = document.getElementById('filterLinks');
  const linkIndex = document.getElementById('linkIndex');

  // ---- ROUTES: "Kontinente" ist die Startseite und zeigt auf /HomeSeiteKontinente.html
  const ROUTES = {
    'kontinente': '/HomeSeiteKontinente.html',
    'home': '/content/home.html',
    'bestiarium': '/content/bestiarium.html',
    'gilden': '/content/gilden.html',
    'orte': '/content/orte.html',
    'ereignisse': '/content/ereignisse.html'
  };

  // --- Utilities ---
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const isInternalLink = (a) => a.matches('[data-page]') || (a.getAttribute('href') || '').startsWith('#/');

  // --- Live-Filter in der linken Sidebar ---
  function initLiveFilter() {
    if (!filterInput || !linkIndex) return;
    filterInput.addEventListener('input', () => {
      const q = filterInput.value.trim().toLowerCase();
      qsa('li', linkIndex).forEach(li => {
        const txt = li.textContent.toLowerCase();
        li.style.display = txt.includes(q) ? '' : 'none';
      });
    });
  }

  // --- Sidebars toggeln (Mobile) ---
  function initSidebars() {
    // Taste ESC schließt Offcanvas
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        sidebarLeft?.classList.remove('open');
        sidebarRight?.classList.remove('open');
      }
    });

    // Menü-Button öffnet linke Sidebar (mobil)
    navToggle?.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      sidebarLeft?.classList.toggle('open');
    });
  }

  // --- Routing Helpers ---
  function pathFromHash() {
    const hash = window.location.hash || '#/kontinente'; // Default: Kontinente
    const slug = hash.replace(/^#\//, '');
    return ROUTES[slug] || `/content/${slug}.html`;
  }

  function navigateTo(url) {
    if (!url) return;
    if (url.startsWith('/content/')) {
      const slug = url.replace('/content/', '').replace('.html', '');
      window.location.hash = `#/${slug}`;
    } else if (url.startsWith('/')) {
      // Reverse Lookup über ROUTES
      const slug = Object.keys(ROUTES).find(k => ROUTES[k] === url);
      if (slug) window.location.hash = `#/${slug}`;
    } else if (url.startsWith('#/')) {
      window.location.hash = url;
    }
  }

  function highlightActive() {
    const current = pathFromHash();
    qsa('a[data-page]').forEach(a => {
      const page = a.getAttribute('data-page');
      a.setAttribute('aria-current', page === current ? 'page' : 'false');
    });
  }

  async function fetchContent(url) {
    content.setAttribute('aria-busy', 'true');
    try {
      const res = await fetch(url, { headers: { 'Accept': 'text/html' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      content.innerHTML = html;

      // Dokumenttitel aus erstem h1 oder data-title am Root
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const h1 = tmp.querySelector('h1');
      const dataTitle = tmp.firstElementChild?.getAttribute?.('data-title');
      const title = dataTitle || (h1 ? h1.textContent.trim() : 'Aleria');
      document.title = `${title} – Aleria`;

      // Aktives Nav-Item kennzeichnen
      highlightActive();

      // Fokus nachladen
      content.focus();
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      console.error(err);
      content.innerHTML = `
        <section class="infobox callout" role="status">
          <div class="titlebar">Fehler beim Laden</div>
          <p>Der Inhalt konnte nicht geladen werden. Bitte versuche es erneut oder öffne die statische Seite direkt.</p>
          <p><code>${url}</code></p>
        </section>`;
    } finally {
      content.setAttribute('aria-busy', 'false');
    }
  }

  function interceptLinks() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      if (isInternalLink(a)) {
        e.preventDefault();
        const page = a.getAttribute('data-page');
        if (page) {
          navigateTo(page);
        } else {
          navigateTo(a.getAttribute('href'));
        }
      }
    });
  }

  // Hash-basierter Router
  window.addEventListener('hashchange', () => {
    const page = pathFromHash();
    fetchContent(page);
  });

  // --- Init ---
  function init() {
    initLiveFilter();
    initSidebars();
    interceptLinks();

    // Initialen Inhalt laden (Kontinente, wenn kein Hash)
    const initial = pathFromHash();
    fetchContent(initial);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
