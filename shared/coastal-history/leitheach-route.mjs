import geometry from './leitheach-route.json' with { type: 'json' };
import { LEITHEACH_CHRONOLOGY as chronology, raidIncidentLabel, raidTime, raidWindow } from './leitheach-chronology.mjs';

// Registration owns geometry only. Recalibrating cannot restore the obsolete one-day timetable.
export const LEITHEACH_ROUTE = {
  ...geometry,
  stages: chronology.stages.map(stage => ({ ...stage, time: raidWindow(stage.start, stage.end) })),
  events: geometry.events.map(event => ({ ...event, time: raidIncidentLabel(event.id), timeSource: 'leitheach-chronology.json' })),
  markers: geometry.markers.map(marker => {
    const slot = Object.values(chronology.incidents).flat().find(item => item.markerId === marker.id);
    const point = marker.id.startsWith('diversion-') ? 'feints' : marker.id === 'river-reinforcement' ? 'dun-relief' : null;
    const paired = marker.eventId && chronology.incidents[marker.eventId].length > 1;
    return { ...marker, title: paired ? `Überfall auf ${slot.place}` : marker.title, time: slot ? raidWindow(slot.start, slot.end) : point ? raidTime(point) : null };
  }),
  routes: geometry.routes.map(route => ({ ...route, time: route.id === 'reinforcement-river' ? raidTime('dun-relief') : route.kind === 'retreat' ? raidWindow('withdrawal', 'end') : null }))
};
