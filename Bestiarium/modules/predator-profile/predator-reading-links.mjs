const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderPredatorReadingLinks(links) {
  if (!links?.length) return '';
  return '<aside class="predator-reading-links" aria-label="Weiterlesen"><h2>Sage, Lied und Bühne</h2><ul>' + links.map(link => '<li><a href="' + escape(link.href) + '">' + escape(link.title) + '</a>' + (link.description ? '<p>' + escape(link.description) + '</p>' : '') + '</li>').join('') + '</ul></aside>';
}
