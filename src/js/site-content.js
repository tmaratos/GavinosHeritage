import { assetUrl } from './base.js';
import bundledInfo from '../../data/restaurant/restaurant-info.json';
import bundledHours from '../../data/restaurant/restaurant-hours.json';
import bundledAnnouncements from '../../data/announcements.json';

function parseAnnouncements(data) {
  if (Array.isArray(data)) return data;
  return data?.announcements || [];
}

export async function loadRestaurantInfo() {
  try {
    const response = await fetch(assetUrl('data/restaurant/restaurant-info.json'));
    if (response.ok) return await response.json();
  } catch {
    /* use bundled fallback */
  }
  return { ...bundledInfo };
}

export async function loadHours() {
  try {
    const response = await fetch(assetUrl('data/restaurant/restaurant-hours.json'));
    if (response.ok) return await response.json();
  } catch {
    /* use bundled fallback */
  }
  return { ...bundledHours };
}

export async function loadAnnouncements() {
  try {
    const response = await fetch(assetUrl('data/announcements.json'));
    if (response.ok) {
      return parseAnnouncements(await response.json());
    }
  } catch {
    /* use bundled fallback */
  }
  return parseAnnouncements(bundledAnnouncements);
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
