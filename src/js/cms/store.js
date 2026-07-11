import { assetUrl } from '../base.js';
import { downloadJson } from '../site-content.js';

const KEYS = {
  announcements: 'gavinos-cms-announcements',
  restaurant: 'gavinos-cms-restaurant',
  hours: 'gavinos-cms-hours',
};

function parseAnnouncements(data) {
  if (Array.isArray(data)) return data;
  return data?.announcements || [];
}

async function fetchJson(path) {
  const response = await fetch(assetUrl(path));
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

function readDraft(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeDraft(key, data) {
  localStorage.setItem(key, JSON.stringify(data, null, 2));
}

export async function loadCmsAnnouncements() {
  const draft = readDraft(KEYS.announcements);
  if (draft) return draft;
  const data = await fetchJson('data/announcements.json');
  return parseAnnouncements(data);
}

export async function loadCmsRestaurant() {
  const draft = readDraft(KEYS.restaurant);
  if (draft) return draft;
  return fetchJson('data/restaurant/restaurant-info.json');
}

export async function loadCmsHours() {
  const draft = readDraft(KEYS.hours);
  if (draft) return draft;
  return fetchJson('data/restaurant/restaurant-hours.json');
}

export function saveCmsAnnouncements(announcements) {
  writeDraft(KEYS.announcements, announcements);
}

export function saveCmsRestaurant(info) {
  writeDraft(KEYS.restaurant, info);
}

export function saveCmsHours(hours) {
  writeDraft(KEYS.hours, hours);
}

export function clearCmsDrafts() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

export async function exportAllCmsFiles(announcements, restaurant, hours) {
  downloadJson('announcements.json', { announcements });
  downloadJson('restaurant-info.json', restaurant);
  downloadJson('restaurant-hours.json', hours);
}
