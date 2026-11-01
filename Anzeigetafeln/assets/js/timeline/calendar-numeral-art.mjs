const directory = 'assets/images/board-calendar';

// Images carry the visible ink; the hidden plain number keeps dates accessible.
export function calendarNumerals(value) {
  if (!Number.isInteger(value) || value < 0 || value > 100000) throw Error('Ungültige Kalenderzahl.');
  return `<span class="calendar-number-text">${value}</span><span class="calendar-number-ink" aria-hidden="true">${String(value).split('').map(digit =>
    `<img src="${directory}/numeral-${digit}-v1.webp" alt="" draggable="false">`).join('')}</span>`;
}
