import military from '../../Kontinente/modules/administration/data/celtigerns-militaer.mjs';
import clergy from '../../Kontinente/modules/administration/data/celtigerns-klerus.mjs';
import justice from '../../Kontinente/modules/administration/data/celtigerns-gerichtsbarkeit.mjs';
import finance from '../../Kontinente/modules/administration/data/celtigerns-finanzen.mjs';
import intelligence from '../../Kontinente/modules/administration/data/celtigerns-spionage.mjs';
import diplomacy from '../../Kontinente/modules/administration/data/celtigerns-diplomatie.mjs';
import magic from '../../Kontinente/modules/administration/data/celtigerns-magie.mjs';
import culture from '../../Kontinente/modules/administration/data/celtigerns-unterhaltung.mjs';

export const countyAreas = Object.fromEntries(
  [military, clergy, justice, finance, intelligence, diplomacy, magic, culture].map(area => [area.id, area]),
);

export const countyVikars = clergy.groups.find(group => group.kind === 'vassals').roles;
export const countyLeadershipRole = area => area.groups[0].roles[0];
