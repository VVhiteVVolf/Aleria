import { sceneDiceService } from './dice-service.js';

window.AleriaSceneDice = sceneDiceService;
document.dispatchEvent(new CustomEvent('aleria-dice-ready'));
