// Secondary views keep their normal stylesheet URLs and cascade order.
// Inactive media gives the archive shell priority on its first render.
document.addEventListener('load', event => {
  const link = event.target;
  if (link.tagName !== 'LINK' || !link.hasAttribute('data-almanach-late-style')) return;
  link.media = 'all';
  link.removeAttribute('data-almanach-late-style');
}, true);
