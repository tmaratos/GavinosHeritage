import { loadAnnouncements } from './site-content.js';
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

function renderAnnouncementItem(item, index) {
  const typeScribble =
    item.type && item.type !== 'general'
      ? `<span class="chalkboard-note__scribble">${escapeHtml(getTypeLabel(item.type))}</span>`
      : '';

  const button =
    item.buttonText && item.buttonLink
      ? `<a class="chalkboard-note__link" href="${escapeHtml(item.buttonLink)}"${
          item.buttonLink.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''
        }>→ ${escapeHtml(item.buttonText)}</a>`
      : '';

  return `
    <article
      class="chalkboard-note chalkboard-note--${escapeHtml(item.type)}"
      data-announcement-id="${escapeHtml(item.id)}"
      style="--note-tilt: ${index % 3 === 0 ? '-0.6deg' : index % 3 === 1 ? '0.45deg' : '-0.15deg'}"
    >
      ${typeScribble}
      <h3 class="chalkboard-note__headline">${escapeHtml(item.title)}</h3>
      <p class="chalkboard-note__lines">${escapeHtml(item.body)}</p>
      ${button}
    </article>
  `;
}

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
      <div class="chalkboard">
        <div class="chalkboard__frame">
          <div class="chalkboard__inner">
            <header class="chalkboard__header">
              <h2 class="chalkboard__title">Today's Board</h2>
              <div class="chalkboard__title-line" aria-hidden="true"></div>
            </header>
            <div class="chalkboard__board">
              ${active.map(renderAnnouncementItem).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export async function initChalkboard() {
  const mount = document.getElementById('chalkboard-mount');
  if (!mount) return;
  const announcements = await loadAnnouncements();
  renderChalkboard(announcements, mount);
}

/** @deprecated use initChalkboard */
export async function initHomepageChalkboard() {
  return initChalkboard();
}

export async function loadAnnouncementsForAdmin() {
  try {
    const response = await fetch(assetUrl('data/announcements.json'));
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : data.announcements || [];
    }
  } catch {
    /* fall through */
  }
  return loadAnnouncements();
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
