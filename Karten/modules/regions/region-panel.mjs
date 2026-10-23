import { orderedRegions } from './region-model.mjs';

export function createRegionPanel(container, esc) {
  const panel = document.createElement('section');
  panel.className = 'region-manager'; panel.hidden = true;
  panel.setAttribute('aria-label', 'Regionswerkzeug');
  container.append(panel);
  const options = (items, value, label) => items.map(item => `<option value="${esc(item.id)}"${item.id === value ? ' selected' : ''}>${esc(label(item))}</option>`).join('');
  return {
    element: panel,
    render({ regions, session, editMode, dominions, maps, parentMapId }) {
      const draft = session?.draft();
      panel.innerHTML = `<header><h2>Gebiete & Grenzen</h2><button type="button" data-region-action="close" aria-label="Regionswerkzeug schließen">✕</button></header>
        <div class="region-manager-body">${parentMapId ? `<p><a href="karte.html?map=${encodeURIComponent(parentMapId)}">← Übergeordnete Karte</a></p>` : ''}<p class="region-help">${editMode ? 'Flächen zeichnen, Grenzpunkte verschieben und Unterregionen zuordnen.' : 'Region auswählen, um ihre Angaben und verknüpfte Karte zu öffnen.'}</p>
        ${!draft ? `<div class="region-manager-actions"${editMode ? '' : ' hidden'}><button type="button" data-region-action="new-area">Neue Fläche</button><button type="button" data-region-action="new-boundary">Neue Grenzlinie</button></div><ul class="region-list">${orderedRegions(regions).map(({region,depth}) => `<li><button type="button" data-region-action="select" data-region-id="${esc(region.id)}">${depth ? '↳ '.repeat(Math.min(depth, 4)) : ''}${esc(region.name)}<small>${region.kind === 'boundary' ? 'Grenzlinie' : 'Fläche'}${region.note ? ' · '+esc(region.note) : ''}</small></button>${region.targetMapId ? `<a href="karte.html?map=${encodeURIComponent(region.targetMapId)}">Detailkarte →</a>` : ''}</li>`).join('') || '<li>Noch keine Regionen eingezeichnet.</li>'}</ul>` : `
        <form data-region-form>
          <label>Regionsname<input name="name" value="${esc(draft.name)}" maxlength="160" required></label>
          <label>Kartenbeschriftung (optional)<input name="shortName" value="${esc(draft.shortName || '')}" maxlength="100"></label>
          <div class="region-field-row"><label>Flächenfarbe<input name="color" type="color" value="${draft.color}"></label><label>Linienfarbe<input name="borderColor" type="color" value="${draft.borderColor || draft.color}"></label></div>
          <label>Deckkraft (%)<input name="opacity" type="number" min="0" max="100" value="${Math.round(draft.opacity*100)}"></label>
          <label>Übergeordnete Region<select name="parentId"><option value="">Keine</option>${options(regions.filter(r=>r.id!==draft.id),draft.parentId,r=>r.name)}</select></label>
          <label>Herrschaft zuordnen<select name="dominionId"><option value="">Offen</option>${options(dominions,draft.dominionId,d=>d.name)}</select></label>
          <label>Verknüpfte Karte<select name="targetMapId"><option value="">Keine</option>${options(maps,draft.targetMapId,m=>m.title)}</select></label>
          <label class="region-checkbox"><input name="showLabel" type="checkbox"${draft.showLabel !== false ? ' checked' : ''}>Regionsname auf der Karte</label>
          ${draft.source?.markerId ? `<p class="region-source">Quellenmarker: ${esc(draft.source.markerId)}</p>` : ''}
        </form>
        <p class="region-help">Linksklick setzt Punkte. Punkte zum Verschieben ziehen. Mit Mausrad zoomen; mittlere oder rechte Maustaste verschiebt die Karte. Enter beendet das Zeichnen.</p>
        <div class="region-manager-actions"><button type="button" data-region-action="finish">Zeichnen beenden</button><button type="button" data-region-action="undo">Punktänderung zurück</button><button type="button" data-region-action="insert">Punkt auf Grenze einfügen</button><button type="button" data-region-action="remove">Gewählten Punkt entfernen</button><button type="button" data-region-action="part">Teilfläche / Abschnitt hinzufügen</button><button type="button" data-region-action="redraw">Grenze neu zeichnen</button></div>
        <p role="status" data-region-status></p><div class="region-manager-actions"><button type="button" data-region-action="save">Übernehmen</button><button type="button" data-region-action="discard">Verwerfen</button>${session.isNew() ? '' : '<button type="button" data-region-action="delete">Region entfernen</button>'}</div>`}
        <p role="alert" data-region-error></p></div>`;
    },
    update(session) {
      const status = panel.querySelector('[data-region-status]');
      if (status && session) status.textContent = `${session.draft().paths.reduce((sum,path)=>sum+path.length,0)} Grenzpunkte · ${session.drawing() ? 'Zeichnen aktiv' : session.inserting() ? 'Auf die gewünschte Grenzstelle klicken' : 'Punkte verschieben'} · ${session.dirty() ? 'Noch nicht übernommen' : 'Keine offenen Änderungen'}`;
    },
    error(message) { const error = panel.querySelector('[data-region-error]'); if (error) error.textContent = message; },
  };
}
