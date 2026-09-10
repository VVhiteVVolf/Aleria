import { escapeHtml as h } from '../content/content-html.mjs';

export function renderCasteRanks(caste) {
  return `<details class="clergy-ranks"><summary>${h(caste.hierarchy.title)} · ${caste.hierarchy.ranks.length} Stufen und Ämter</summary><p>${h(caste.hierarchy.note)}</p><ol>${caste.hierarchy.ranks.map(rank => `<li><strong>${h(rank.title)}</strong><p>${h(rank.duty)}</p></li>`).join('')}</ol></details>`;
}

export function renderHierarchy(clergy) {
  const count = Math.max(...clergy.castes.map(caste => caste.hierarchy.ranks.length));
  return `<section class="clergy-section" id="hierarchie" aria-labelledby="hierarchy-title"><p class="eyebrow">Ämter, Ausbildung und Verantwortung</p><h2 id="hierarchy-title">Die Ordnungen der sechs Kasten</h2><p class="clergy-section-intro">Jede Spalte wird von oben nach unten gelesen. Die Zeilen stellen keine Ranggleichheit zwischen den Kasten her. Fach- und Leitungsämter sind keine Pflichtstationen einer automatischen Laufbahn.</p><p class="clergy-section-intro">Weitere Ränge erreicht ihr durch Scrollen innerhalb der Tabelle; auf schmalen Bildschirmen auch seitlich.</p>
    <div class="hierarchy-scroll" tabindex="0" role="region" aria-label="Hierarchietabelle, seitlich und nach unten scrollbar"><table class="hierarchy-table"><caption>Von den ersten Schritten zur höchsten Verantwortung im jeweiligen Zweig</caption><thead><tr>${clergy.castes.map(caste => `<th scope="col"><span>${h(caste.number)}</span>${h(caste.title)}</th>`).join('')}</tr></thead><tbody>${Array.from({length:count},(_,index) => `<tr>${clergy.castes.map(caste => { const rank = caste.hierarchy.ranks[index]; return rank ? `<td><strong>${h(rank.title)}</strong><p>${h(rank.duty)}</p></td>` : '<td class="rank-blank"><span aria-label="Keine weitere Stufe">—</span></td>'; }).join('')}</tr>`).join('')}</tbody></table></div>
    <div class="hierarchy-notes">${clergy.castes.map(caste => `<details><summary>${h(caste.title)}: Besonderheiten</summary><p>${h(caste.hierarchy.note)}</p></details>`).join('')}</div></section>`;
}
