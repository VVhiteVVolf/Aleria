const paths = {
  plus:'M12 5v14M5 12h14',
  character:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
  story:'M4 4h7a4 4 0 0 1 4 4v13a5 5 0 0 0-4-2H4V4Zm11 4a4 4 0 0 1 4-4h2v15h-2a5 5 0 0 0-4 2M7 8h4M7 12h4',
  mindmap:'M10 10h4v4h-4zM3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4zM7 7l3 3m4 0 3-3M7 17l3-3m4 0 3 3',
  place:'M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  moodboard:'M3 3h7v10H3zM14 3h7v6h-7zM14 13h7v8h-7zM3 17h7v4H3z',
  note:'M5 3h10l4 4v14H5V3Zm10 0v5h4M8 12h8M8 16h6',
  board:'M3 3h7v7H3zM14 3h7v11h-7zM3 14h7v7H3zM14 18h7v3',
  grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  list:'M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1',
  search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-2 4 6 6',
  import:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  export:'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
  github:'M9 19c-5 2-5-3-7-3m14 6v-4a4 4 0 0 0-1-3c4-.5 7-2 7-7a5 5 0 0 0-1-3 5 5 0 0 0 0-4s-2-1-5 2a17 17 0 0 0-8 0C5 0 3 1 3 1a5 5 0 0 0 0 4 5 5 0 0 0-1 3c0 5 3 6.5 7 7a4 4 0 0 0-1 3v4',
  edit:'m15 4 5 5M4 16 16 4a3 3 0 0 1 4 4L8 20H4v-4Z',
  undo:'M9 4 3 10l6 6M3 10h11a7 7 0 0 1 7 7v3',
  redo:'m15 4 6 6-6 6m6-6H10a7 7 0 0 0-7 7v3',
  arrange:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  link:'m10 13 4-4m-6 1L5 13a4 4 0 0 0 6 6l3-3m-4-8 3-3a4 4 0 0 1 6 6l-3 3',
  image:'M3 3h18v18H3zM3 17l6-7 5 5 3-3 4 5M17 7h.01',
  trash:'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
  copy:'M9 9h12v12H9zM15 9V3H3v12h6',
  fold:'m5 8 7 7 7-7',
  expand:'m5 15 7-7 7 7',
  check:'m5 12 4 4L19 6',
  grip:'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01'
};
export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.note}"/></svg>`;
}
export function mountIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
}
