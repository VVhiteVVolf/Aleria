// Leaflet's default marker icon auto-detects its image path from the
// currently executing <script> tag, which breaks under bundlers (Vite
// rewrites/hashes asset URLs). Geoman's live "place a marker" draw cursor
// uses this default icon before our marker-renderer.js takes over with its
// own divIcon - without this fix, that in-progress-draw marker would 404.
// Standard fix for Leaflet + Vite: import the actual bundled URLs and wire
// them up explicitly, once, at startup.
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });
