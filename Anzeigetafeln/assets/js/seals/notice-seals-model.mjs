const art = 'assets/images/seals/defaults/';

export const NOTICE_SEALS = Object.freeze([
  { id: 'baeurlich', name: 'Bäuerlich · einfache Leute', motif: 'Ähre in ockerfarbenem Wachs', src: `${art}baeurlich-v1.png` },
  { id: 'buergerlich', name: 'Bürgerlich · mittlere Stände', motif: 'Knotenzeichen in rotem Wachs', src: `${art}buergerlich-v1.png` },
  { id: 'federkiel', name: 'Gilde Federkiel', motif: 'Feder in grünem Wachs', src: `${art}federkiel-v1.png` },
  { id: 'wolken-der-daemmerung', name: 'Wolken der Dämmerung', motif: 'Sonnenzeichen in dunkelrotem Wachs', src: `${art}wolken-der-daemmerung-v1.png` },
].map(Object.freeze));

export function isSealPreset(value) {
  return ['auto', 'none'].includes(value) || NOTICE_SEALS.some(seal => seal.id === value);
}

export function normalizeSealPreset(value) {
  return isSealPreset(value) ? value : 'auto';
}

export function defaultSealFor(notice = {}) {
  let id = normalizeSealPreset(notice.sealPreset);
  if (id === 'none') return null;
  if (id === 'auto') {
    if (notice.issuerGuildId === 'wolken-der-daemmerung') id = 'wolken-der-daemmerung';
    else if (notice.issuerGuildId === 'federkiel' || notice.writerGuildId === 'federkiel') id = 'federkiel';
    // An unknown official issuer must not acquire an unrelated guild's authority.
    else if (['erlass', 'steckbrief'].includes(notice.typ)) return null;
    else id = notice.typ === 'hilfsgesuch' ? 'baeurlich' : 'buergerlich';
  }
  return NOTICE_SEALS.find(seal => seal.id === id) || null;
}

export function selectSealPreset(notice, value) {
  if (!notice || !isSealPreset(value)) return false;
  if (notice.sealPreset === value && !notice.siegel && !notice.media?.siegel) return false;
  notice.sealPreset = value;
  notice.siegel = '';
  if (notice.media?.siegel) {
    notice.media = { ...notice.media };
    delete notice.media.siegel;
  }
  return true;
}
