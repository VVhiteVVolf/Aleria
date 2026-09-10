import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { RELIGION_ROOT, readReligionCatalog, validateLocalPath } from '../content/content-repository.mjs';

export const CLERGY_INDEX = 'Religionen/klerus/index.html';
const ROOT = resolve(RELIGION_ROOT, 'klerus');
const WORKSPACE = resolve(RELIGION_ROOT, '..');
const ID = /^[a-z][a-z0-9-]*$/;
export const CLERGY_PRESENCE = Object.freeze({ fest: 'Fester Zweig', klein: 'Kleine Gemeinschaften', selten: 'Seltene Ausnahmen', eingebunden: 'Ohne eigenen Zweig', angebunden: 'Kein eigener Fachbereich' });

function text(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Klerustext fehlt: ${label}`);
}
function list(value, label) {
  if (!Array.isArray(value) || !value.length) throw new Error(`Klerusliste fehlt: ${label}`);
  return value;
}
function readJson(path) {
  return JSON.parse(readFileSync(resolve(ROOT, validateLocalPath(path)), 'utf8'));
}
export function clergyPagePath(godId) {
  if (!ID.test(godId)) throw new Error(`Ungültige Gottheit im Klerus: ${godId}`);
  return `Religionen/klerus/gottheiten/${godId}/index.html`;
}

export function clergyArt(clergy, profile, caste) {
  if (caste.id === 'magister' && profile.castes.magister.presence === 'angebunden') return null;
  const art = profile.imageOverrides?.[caste.id] || caste.art;
  if (!art && caste.id === 'asketen' && ['selten', 'eingebunden'].includes(profile.castes.asketen.presence)) return null;
  if (!art) throw new Error(`Kastenbild fehlt: ${profile.godId}.${caste.id}`);
  const src = art.src || art.pattern.replace('{godId}', profile.godId);
  validateLocalPath(src);
  const size = clergy.imageSizes[src];
  if (!size || ![size.width, size.height].every(value => Number.isInteger(value) && value > 0)) throw new Error(`Bildmaße fehlen: ${src}`);
  return { src, ...size, placeholder: Boolean(art.placeholder) };
}

export function validateClergyCatalog(clergy, religionCatalog) {
  for (const key of ['title', 'subtitle', 'collectionId']) text(clergy[key], key);
  if (!religionCatalog.collections.some(collection => collection.id === clergy.collectionId)) throw new Error(`Klerussammlung fehlt: ${clergy.collectionId}`);
  list(clergy.overview.intro, 'Einleitung').forEach(item => text(item, 'Einleitung'));
  text(clergy.overview.cooperation.title, 'Gemeinschaften');
  list(clergy.overview.cooperation.paragraphs, 'Gemeinschaften').forEach(item => text(item, 'Gemeinschaften'));
  for (const key of ['houses', 'communities', 'clarifications']) {
    for (const item of list(clergy.overview[key], key)) { text(item.title, key); text(item.text, item.title); }
  }
  for (const key of ['title', 'intro', 'collaboration']) text(clergy.faculties[key], `Magisterium.${key}`);
  const profileIds = list(clergy.profiles, 'Götterklerus').map(profile => profile.godId);
  if (new Set(profileIds).size !== profileIds.length || profileIds.length !== clergy.deities.length || clergy.deities.some(id => !profileIds.includes(id))) throw new Error('Abweichung zwischen Klerusregister und Götterprofilen');
  const ids = new Set();
  for (const caste of list(clergy.castes, 'Kasten')) {
    if (!ID.test(caste.id) || ids.has(caste.id)) throw new Error(`Ungültige oder doppelte Kaste: ${caste.id}`);
    ids.add(caste.id);
    for (const key of ['title', 'number', 'motto', 'summary']) text(caste[key], `${caste.id}.${key}`);
    list(caste.paragraphs, caste.id).forEach(item => text(item, caste.id));
    text(caste.hierarchy.title, caste.id);
    text(caste.hierarchy.note, caste.id);
    const rankNames = new Set();
    for (const rank of list(caste.hierarchy.ranks, caste.id)) {
      text(rank.title, caste.id); text(rank.duty, caste.id);
      if (rankNames.has(rank.title)) throw new Error(`Doppelter Rang: ${caste.id}.${rank.title}`);
      rankNames.add(rank.title);
    }
  }
  const facultyIds = new Set();
  for (const field of list(clergy.faculties.fields, 'Magisterium')) {
    if (facultyIds.has(field.godId) || !clergy.deities.includes(field.godId)) throw new Error(`Ungültiger Fachbereich: ${field.godId}`);
    facultyIds.add(field.godId);
    for (const key of ['title','scope','note']) text(field[key], field.godId);
  }
  if (new Set(clergy.deities).size !== clergy.deities.length) throw new Error('Doppelte Gottheit im Klerusregister');
  for (const profile of clergy.profiles) {
    if (!religionCatalog.entries.some(entry => entry.id === profile.godId && entry.collectionId === clergy.collectionId)) throw new Error(`Götterprofil fehlt: ${profile.godId}`);
    for (const key of ['intro','community']) text(profile[key], profile.godId);
    if (Object.keys(profile.castes).length !== ids.size) throw new Error(`Unvollständige Kasten: ${profile.godId}`);
    for (const caste of clergy.castes) {
      const role = profile.castes[caste.id];
      if (!role || !Object.hasOwn(CLERGY_PRESENCE, role.presence)) throw new Error(`Kastenzuordnung fehlt: ${profile.godId}.${caste.id}`);
      text(role.title, profile.godId);
      list(role.paragraphs, role.title).forEach(item => text(item, role.title));
      list(role.tasks, role.title).forEach(item => text(item, role.title));
      if (caste.id !== 'moenche' && role.guilds !== undefined) throw new Error(`Zünfte nur bei Mönchen: ${profile.godId}.${caste.id}`);
      if (caste.id === 'moenche') {
        const guildNames = new Set();
        for (const guild of list(role.guilds, role.title)) {
          text(guild.name, role.title); text(guild.work, guild.name);
          if (guildNames.has(guild.name)) throw new Error(`Doppelte monastische Zunft: ${profile.godId}.${guild.name}`);
          guildNames.add(guild.name);
        }
      }
      if (caste.id === 'magister' && facultyIds.has(profile.godId) === (role.presence === 'angebunden')) throw new Error(`Falsche Zuordnung zum Magisterium: ${profile.godId}`);
      const art = clergyArt(clergy, profile, caste);
      if (art && !existsSync(resolve(WORKSPACE, art.src))) throw new Error(`Klerusbild fehlt: ${art.src}`);
    }
    for (const key of Object.keys(profile.imageOverrides || {})) if (!ids.has(key)) throw new Error(`Unbekannte Bildzuordnung: ${profile.godId}.${key}`);
  }
  return clergy;
}

export function readClergyCatalog(religionCatalog = readReligionCatalog()) {
  const register = readJson('register.json');
  const imageSources = readJson('assets/sources.json');
  const imageSizes = { ...readJson('bildmasse.json') };
  for (const image of imageSources.images) imageSizes[image.src] = { width: image.width, height: image.height };
  const profiles = register.deities.map(godId => {
    clergyPagePath(godId);
    const profile = readJson(`gottheiten/${godId}/eintrag.json`);
    if (profile.godId !== godId) throw new Error(`Abweichende Profil-ID: ${godId}`);
    return profile;
  });
  return validateClergyCatalog({ ...register, castes: register.castes.map(readJson), overview: readJson(register.overviewSource), faculties: readJson(register.facultiesSource), profiles, imageSizes }, religionCatalog);
}

export function getClergyPageInputs() {
  const clergy = readClergyCatalog();
  return Object.fromEntries([
    ['clergy', resolve(WORKSPACE, CLERGY_INDEX)],
    ...clergy.profiles.map(profile => [`clergy-${profile.godId}`, resolve(WORKSPACE, clergyPagePath(profile.godId))])
  ]);
}
