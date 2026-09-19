/** Old inline exports can replace heading nodes after the territory renderer ran. */
export function markTerritoryHeadings(page) {
  if (!page.classList.contains('kingdom-page')) return;
  const normalize = value => value.replace(/^\s*\d+\s*[.)]+\s*/, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('de');
  const paragraphs = [...page.querySelectorAll('p')];
  for (const link of page.querySelectorAll('.kingdom-toc a[href^="#"]')) {
    const id = decodeURIComponent(link.hash.slice(1));
    const existing = document.getElementById(id);
    const heading = existing || paragraphs.find(paragraph =>
      /^\s*\d+\s*[.)]/.test(paragraph.textContent) && normalize(paragraph.textContent) === normalize(link.textContent));
    if (!heading || !page.contains(heading) || !heading.matches('p, h2')) continue;
    if (!heading.id) heading.id = id;
    heading.classList.add('codex-section-heading');
    if (heading.matches('p')) {
      heading.setAttribute('role', 'heading');
      heading.setAttribute('aria-level', '2');
    }
  }
}
