import announcementsData from '../../data/announcements.json';
import { assetUrl } from './base.js';

const TYPE_LABELS = {
  special: 'Daily Special',
  hours: 'Hours',
  catering: 'Catering',
  hiring: 'Now Hiring',
  general: 'Announcement',
};

/**
 * @typedef {Object} Announcement
 * @property {string} id
 * @property {string} title
 * @property {string} body
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {boolean} active
 * @property {'special'|'hours'|'catering'|'hiring'|'general'} type
 * @property {string|null} [buttonText]
 * @property {string|null} [buttonLink]
 */

export function getTypeLabel(type) {
  return TYPE_LABELS[type] || TYPE_LABELS.general;
}

/**
 * Returns announcements that are active and within optional date range.
 * @param {Announcement[]} announcements
 * @param {Date} [now]
 */
export function filterActiveAnnouncements(announcements, now = new Date()) {
  const today = now.getTime();

  return announcements.filter((item) => {
    if (!item.active) return false;

    if (item.startDate) {
      const start = new Date(item.startDate).getTime();
      if (Number.isFinite(start) && today < start) return false;
    }

    if (item.endDate) {
      const end = new Date(item.endDate).getTime();
      if (Number.isFinite(end) && today > end) return false;
    }

    return true;
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderAnnouncementItem(item) {
  const typeLabel = getTypeLabel(item.type);
  const button =
    item.buttonText && item.buttonLink
      ? `<a class="chalkboard-item__cta" href="${escapeHtml(item.buttonLink)}"${
          item.buttonLink.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''
        }>${escapeHtml(item.buttonText)}</a>`
      : '';

  return `
    <article class="chalkboard-item chalkboard-item--${escapeHtml(item.type)}" data-announcement-id="${escapeHtml(item.id)}">
      <p class="chalkboard-item__type">${escapeHtml(typeLabel)}</p>
      <h3 class="chalkboard-item__title">${escapeHtml(item.title)}</h3>
      <p class="chalkboard-item__body">${escapeHtml(item.body)}</p>
      ${button}
    </article>
  `;
}

/**
 * Renders the chalkboard section into a mount element.
 * @param {Announcement[]} announcements
 * @param {HTMLElement|null} mount
 */
export function renderChalkboard(announcements, mount) {
  if (!mount) return;

  const active = filterActiveAnnouncements(announcements);
  if (active.length === 0) {
    mount.hidden = true;
    mount.innerHTML = '';
    return;
  }

  mount.hidden = false;
  mount.innerHTML = `
    <section class="chalkboard-section" aria-label="Today's announcements">
      <div class="container">
        <div class="chalkboard">
          <div class="chalkboard__frame">
            <header class="chalkboard__header">
              <p class="chalkboard__eyebrow">From our kitchen</p>
              <h2 class="chalkboard__title">Today's Board</h2>
            </header>
            <div class="chalkboard__items">
              ${active.map(renderAnnouncementItem).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/** Default announcements bundled at build time (public site). */
export function getDefaultAnnouncements() {
  if (Array.isArray(announcementsData)) return announcementsData;
  return announcementsData.announcements || [];
}

/**
 * Loads announcements for admin: localStorage draft overrides bundled JSON.
 * Production should replace this with an authenticated API.
 */
export async function loadAnnouncementsForAdmin() {
  const stored = localStorage.getItem('gavinos-announcements-draft');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed.announcements)) {
        return parsed.announcements;
      }
    } catch {
      /* fall through to bundled JSON */
    }
  }

  try {
    const response = await fetch(assetUrl('data/announcements.json'));
    if (response.ok) {
      const data = await response.json();
      return data.announcements || [];
    }
  } catch {
    /* use bundled fallback */
  }

  return getDefaultAnnouncements();
}

export function saveAnnouncementsDraft(announcements) {
  localStorage.setItem(
    'gavinos-announcements-draft',
    JSON.stringify({ announcements }, null, 2),
  );
}

export function clearAnnouncementsDraft() {
  localStorage.removeItem('gavinos-announcements-draft');
}

export function exportAnnouncementsJson(announcements) {
  const blob = new Blob([JSON.stringify({ announcements }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'announcements.json';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Initializes the homepage chalkboard from bundled JSON.
 */
export function initHomepageChalkboard() {
  const mount = document.getElementById('chalkboard-mount');
  if (!mount) return;
  renderChalkboard(getDefaultAnnouncements(), mount);
}
