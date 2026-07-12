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

function renderBoardItem(item) {
  if (item.price) {
    const desc = item.body
      ? `<span class="special__desc">${escapeHtml(item.body)}</span>`
      : '';
    return `
      <li class="special" data-announcement-id="${escapeHtml(item.id)}">
        <span class="special__name">${escapeHtml(item.title)}${desc}</span>
        <span class="special__dots" aria-hidden="true"></span>
        <span class="special__price">${escapeHtml(item.price)}</span>
      </li>
    `;
  }

  const scribble =
    item.type && item.type !== 'general' && item.type !== 'special'
      ? `<span class="chalkboard-note__scribble">${escapeHtml(getTypeLabel(item.type))}</span>`
      : '';

  return `
    <li class="chalkboard-note" data-announcement-id="${escapeHtml(item.id)}">
      ${scribble}
      <span class="chalkboard-note__title">${escapeHtml(item.title)}</span>
      ${item.body ? `<span class="chalkboard-note__body">${escapeHtml(item.body)}</span>` : ''}
    </li>
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
    <section class="chalkboard-section" aria-label="Today's specials board">
      <div class="chalkboard">
        <div class="chalkboard__frame">
          <span class="chalkboard__flag" aria-hidden="true"></span>
          <div class="chalkboard__inner">
            <p class="chalkboard__eyebrow">Wednesday &ndash; Friday Specials</p>
            <h2 class="chalkboard__title">Today's Board</h2>
            <span class="chalkboard__underline" aria-hidden="true"></span>
            <ul class="chalkboard__specials">
              ${active.map(renderBoardItem).join('')}
            </ul>
            <p class="chalkboard__buon">Buon Appetito!</p>
            <span class="chalkboard__ribbon">Since 1982</span>
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
