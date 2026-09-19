import { OFFICE_GROUPS, HOUSEHOLD_SERVICE } from './offices-data.mjs';
import { courtPage, escapeHtml, paragraphs } from './court-template.mjs';

function officeCard(office) {
  return `<article class="court-office" id="${office.id}" data-court-office>
    ${office.category ? `<p class="court-label">${escapeHtml(office.category)}</p>` : ''}
    <h3><a href="#${office.id}">${escapeHtml(office.title)}</a></h3>
    ${paragraphs(office.description)}
  </article>`;
}

export function renderOfficesPage() {
  const count = OFFICE_GROUPS.reduce((total, group) => total + group.offices.length, 0);
  return courtPage({
    title: 'Ämter & Rollen in Cenyr', subtitle: 'Rat, Hof & Ritterstand', page: 'offices', icon: 'aemter', script: 'offices-filter.js',
    description: 'Wer das Reich lenkt, den Hof bewahrt und den Eid der Ritter trägt. Ein Verzeichnis der Ämter, Titel und Dienste Cenyrs.',
    navigation: [['uebersicht', 'Übersicht'], ...OFFICE_GROUPS.map(group => [group.id, group.title]), ['hofdienst', 'Knechte, Dienstmädchen & Zofen']],
    body: `
      <section id="uebersicht" class="court-intro">
        <blockquote>„Ein König ist nur so gut wie sein Rat und sein Hof. Du bist der lebende Beweis, mein Freund.“<cite>Tristan zu Mordred</cite></blockquote>
        <h2>Reich und Haus in guten Händen</h2>
        <p>In Cenyr unterscheidet man zwischen <strong>Ratsämtern</strong>, die die Geschicke des Reiches oder einer Region lenken, und <strong>Hofämtern</strong>, die dem jeweiligen Haus dienen. Adelstitel und ritterliche Stände ergänzen diese Ordnung.</p>
        <dl class="court-insignia" aria-label="Material der Ratsabzeichen">
          <div><dt>König</dt><dd><span class="court-metal court-metal-gold" aria-hidden="true"></span>Gold</dd></div>
          <div><dt>Graf</dt><dd><span class="court-metal court-metal-silver" aria-hidden="true"></span>Silber</dd></div>
          <div><dt>Baron</dt><dd><span class="court-metal court-metal-bronze" aria-hidden="true"></span>Bronze</dd></div>
          <div><dt>Ritterfürst</dt><dd><span class="court-metal court-metal-iron" aria-hidden="true"></span>Eisen</dd></div>
        </dl>
      </section>
      <div class="court-search" data-court-search hidden>
        <label for="aemter-suche">Im Ämterverzeichnis suchen</label>
        <div class="court-search-field"><input type="search" id="aemter-suche" placeholder="Zum Beispiel Marschall, Knappen oder Vogt …" aria-controls="aemter-verzeichnis" autocomplete="off"><button type="button" data-action="clear-search" hidden>Zurücksetzen</button></div>
        <p role="status" aria-live="polite" aria-atomic="true" data-role="search-status">${count} Ämter, Titel und Stände</p>
      </div>
      <div id="aemter-verzeichnis" data-court-directory>
      ${OFFICE_GROUPS.map(group => `<section class="court-section" id="${group.id}" data-court-group>
        <header class="court-section-heading"><span class="court-section-number" aria-hidden="true">${group.number}</span><div><p class="court-eyebrow">${escapeHtml(group.subtitle)}</p><h2>${escapeHtml(group.title)}</h2></div></header>
        <div class="court-section-intro">${paragraphs(group.introduction)}</div>
        <div class="court-office-grid">${group.offices.map(officeCard).join('\n')}</div>
      </section>`).join('\n')}
      </div>
      <p class="court-empty" data-role="search-empty" hidden>Keine passenden Einträge gefunden. Versuche einen anderen Begriff oder setze die Suche zurück.</p>
      <section class="court-section court-service" id="hofdienst" data-court-service>
        <header class="court-section-heading"><span class="court-section-number" aria-hidden="true">05</span><div><p class="court-eyebrow">Ehrbarer Dienst</p><h2>Knechte, Dienstmädchen & Zofen</h2></div></header>
        ${paragraphs(HOUSEHOLD_SERVICE)}
      </section>`
  });
}
