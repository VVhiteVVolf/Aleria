export function renderBattleAudioControls() {
  return `<div class="battle-audio-controls" aria-label="Klangkulisse">
    <span class="battle-audio-caption">Klangkulisse</span>
    <div class="battle-audio-channel"><label><input type="checkbox" data-battle-sound-toggle> Retro-Effekte</label><label class="battle-volume-control"><span class="battle-sr-only">Lautstärke der Retro-Effekte</span><input type="range" min="0" max="100" value="40" data-battle-sound-volume aria-label="Lautstärke der Retro-Effekte" disabled></label></div>
    <div class="battle-audio-channel"><label><input type="checkbox" data-battle-music-toggle> Kampfmusik</label><label class="battle-volume-control"><span class="battle-sr-only">Lautstärke der Kampfmusik</span><input type="range" min="0" max="100" value="30" data-battle-music-volume aria-label="Lautstärke der Kampfmusik" disabled></label></div>
    <small>Nordische Melodie · 76 BPM</small>
    <span class="battle-sr-only" role="status" data-battle-audio-status>Klangkulisse ausgeschaltet.</span>
  </div>`;
}
