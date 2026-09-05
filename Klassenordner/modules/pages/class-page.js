function initializeClassDocument(root) {
  const printButton = root.querySelector('[data-action="print-class"]');
  printButton.hidden = false;
  root.addEventListener('click', event => {
    const control = event.target.closest('[data-action="print-class"]');
    if (control) window.print();
  });

  function handleImageError(image) {
    if (image.dataset.role === 'class-illustration') {
      image.hidden = true;
      image.closest('figure').querySelector('[data-role="art-fallback"]').hidden = false;
    } else if (image.dataset.fallbackSrc && !image.dataset.fallback) {
      image.dataset.fallback = 'true';
      image.src = image.dataset.fallbackSrc;
    }
  }
  root.addEventListener('error', event => {
    if (event.target.tagName === 'IMG') handleImageError(event.target);
  }, true);
  root.querySelectorAll('img').forEach(image => {
    if (image.complete && !image.naturalWidth) handleImageError(image);
  });

  const chapterLinks = root.querySelectorAll('.class-chapter-nav a');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(changes => {
      const heading = changes.find(change => change.isIntersecting)?.target;
      if (!heading) return;
      const id = heading.closest('.class-chapter').id;
      chapterLinks.forEach(link => {
        if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '0px 0px -65% 0px' });
    root.querySelectorAll('.class-chapter-heading').forEach(heading => observer.observe(heading));
  }

  function revealPendingChapter() {
    const pending = root.querySelector('.class-pending');
    const target = [...root.querySelectorAll('.class-pending [id]')].find(element => `#${element.id}` === window.location.hash);
    if (target && pending) {
      pending.open = true;
      target.scrollIntoView();
    }
  }
  window.addEventListener('hashchange', revealPendingChapter);
  revealPendingChapter();
}

const root = document.querySelector('[data-class-document]');
if (root) initializeClassDocument(root);
