import { sceneDiceService } from './dice-service.js?v=20260802-dice-audio-v2';

window.AleriaSceneDice = sceneDiceService;
document.dispatchEvent(new CustomEvent('aleria-dice-ready'));
