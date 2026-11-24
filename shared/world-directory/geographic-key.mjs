export const geographicKey = value => String(value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .replace(/Æ/g, 'Ae').replace(/æ/g, 'ae').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z0-9]/g, '');
