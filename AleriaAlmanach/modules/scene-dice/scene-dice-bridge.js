import { sceneDiceService } from './dice-service.js?v=20261013-performance-v1';

window.AleriaSceneDice = sceneDiceService;
document.dispatchEvent(new CustomEvent('aleria-dice-ready'));
