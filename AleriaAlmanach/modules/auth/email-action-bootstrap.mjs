import('./email-action-page.js').catch(() => {
  document.querySelector('[data-role="mail-status"]').textContent = 'Myrddin erreicht den Postzauber gerade nicht. Bitte lade diese Seite später noch einmal; dein Link bleibt dabei unbenutzt.';
});
