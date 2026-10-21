(function () {
  'use strict';

  function markup(html, label = 'Aushangtext') {
    return `<div class="notice-text-window"><div class="notice-scroll-copy" data-notice-scroll tabindex="0" role="region" aria-label="${window.TafelRuntime.esc(label)}">${html}</div><small class="notice-text-scroll-hint" aria-hidden="true">Im Textfeld weiterlesen ↓</small></div>`;
  }

  function observe(root) {
    if (!root) return () => {};
    let frame = 0;
    let stopped = false;
    const resize = new ResizeObserver(schedule);
    const layouts = [...root.querySelectorAll('[data-notice-layout]')];

    function measure() {
      frame = 0;
      for (const layout of layouts) {
        const reference = layout.querySelector('[data-notice-reference]');
        const referenceHeight = reference?.getBoundingClientRect().height || 0;
        const narrow = layout.getBoundingClientRect().width < 580;
        const viewportLimit = Math.max(240, Math.min(600, window.innerHeight * .62));
        for (const region of layout.querySelectorAll('[data-notice-scroll]')) {
          const column = region.closest('.quest-copy');
          const outsideText = column && !narrow ? column.getBoundingClientRect().height - region.getBoundingClientRect().height : 0;
          const height = Math.round(Math.min(viewportLimit, narrow || !referenceHeight ? 420 : Math.max(220, referenceHeight + 64 - outsideText)));
          region.style.setProperty('--notice-text-height', `${height}px`);
          region.parentElement.classList.toggle('is-overflowing', region.scrollHeight > region.clientHeight + 2);
        }
      }
    }

    function schedule() {
      if (!stopped && !frame) frame = requestAnimationFrame(measure);
    }

    for (const layout of layouts) {
      resize.observe(layout);
      const reference = layout.querySelector('[data-notice-reference]');
      if (reference) resize.observe(reference);
    }
    root.addEventListener('load', schedule, true);
    window.addEventListener('resize', schedule);
    document.fonts?.ready.then(schedule);
    schedule();
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      root.removeEventListener('load', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  }

  window.TafelNoticeTextLayout = Object.freeze({ markup, observe });
})();
