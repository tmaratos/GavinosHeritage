import '../css/main.css';
import '../css/italian.css';
import '../css/chalkboard.css';
import '../css/admin.css';
import { injectFavicon } from './favicon.js';
import {
  isAdminAuthenticated,
  setAdminAuthenticated,
  clearAdminSession,
  verifyAdminPassword,
} from './cms/auth.js';
import {
  loadCmsAnnouncements,
  loadCmsRestaurant,
  loadCmsHours,
  saveCmsAnnouncements,
  saveCmsRestaurant,
  saveCmsHours,
  clearCmsDrafts,
  exportAllCmsFiles,
} from './cms/store.js';
import { renderChalkboard } from './announcements.js';

const ANNOUNCEMENT_TYPES = ['general', 'special', 'hours', 'catering', 'hiring'];
let activeTab = 'chalkboard';
let statusMessage = '';
let statusType = 'success';
let loginError = '';

let announcements = [];
let restaurant = null;
let hours = null;

const app = document.getElementById('admin-app');
document.body.classList.add('admin-body');
injectFavicon();

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setStatus(message, type = 'success') {
  statusMessage = message;
  statusType = type;
  render();
}

function newAnnouncementId() {
  return `ann-${Date.now()}`;
}

function renderLogin() {
  const error = loginError
    ? `<div class="admin-status admin-status--error" role="alert">${escapeHtml(loginError)}</div>`
    : '';

  app.innerHTML = `
    <div class="admin-login">
      <div class="admin-login__card">
        <h1>Gavino's CMS</h1>
        <p>Sign in to manage the chalkboard, hours, and restaurant info.</p>
        ${error}
        <form id="admin-login-form">
          <div class="admin-field">
            <label for="admin-password">Password</label>
            <input id="admin-password" type="password" autocomplete="current-password" required />
          </div>
          <button class="btn btn--primary" type="submit">Sign in</button>
        </form>
        <p class="admin-help">Default password: <strong>gavinos-admin</strong> — change it in <code>data/admin/config.json</code> after first login.</p>
      </div>
    </div>
  `;

  document.getElementById('admin-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = document.getElementById('admin-password').value;
    const ok = await verifyAdminPassword(password);
    if (!ok) {
      loginError = 'Incorrect password.';
      renderLogin();
      return;
    }
    loginError = '';
    setAdminAuthenticated();
    await bootAdmin();
  });
}

function renderAnnouncementEditor(item, index) {
  return `
    <article class="admin-card" data-index="${index}">
      <div class="admin-card__head">
        <h3>${escapeHtml(item.title || 'New announcement')}</h3>
        <button type="button" class="btn btn--ghost" data-remove="${index}">Remove</button>
      </div>
      <div class="admin-field">
        <label>Title</label>
        <input data-field="title" data-index="${index}" value="${escapeHtml(item.title || '')}" />
      </div>
      <div class="admin-field">
        <label>Message</label>
        <textarea data-field="body" data-index="${index}">${escapeHtml(item.body || '')}</textarea>
      </div>
      <div class="admin-field">
        <label>Type</label>
        <select data-field="type" data-index="${index}">
          ${ANNOUNCEMENT_TYPES.map(
            (type) =>
              `<option value="${type}"${item.type === type ? ' selected' : ''}>${type}</option>`,
          ).join('')}
        </select>
      </div>
      <div class="admin-field admin-field--inline">
        <input type="checkbox" data-field="active" data-index="${index}" id="active-${index}"${
          item.active ? ' checked' : ''
        } />
        <label for="active-${index}">Show on chalkboard</label>
      </div>
      <div class="admin-field">
        <label>Start date (optional)</label>
        <input type="date" data-field="startDate" data-index="${index}" value="${escapeHtml(item.startDate || '')}" />
      </div>
      <div class="admin-field">
        <label>End date (optional)</label>
        <input type="date" data-field="endDate" data-index="${index}" value="${escapeHtml(item.endDate || '')}" />
      </div>
      <div class="admin-field">
        <label>Button text (optional)</label>
        <input data-field="buttonText" data-index="${index}" value="${escapeHtml(item.buttonText || '')}" />
      </div>
      <div class="admin-field">
        <label>Button link (optional)</label>
        <input data-field="buttonLink" data-index="${index}" value="${escapeHtml(item.buttonLink || '')}" />
      </div>
    </article>
  `;
}

function renderChalkboardTab() {
  return `
    <div class="admin-panel">
      <p class="admin-panel__lead">Edit what guests see on the chalkboard across the site — mobile and desktop.</p>
      <div class="admin-list" id="announcement-list">
        ${announcements.map(renderAnnouncementEditor).join('')}
      </div>
      <div class="admin-actions">
        <button type="button" class="btn btn--secondary" id="add-announcement">Add announcement</button>
        <button type="button" class="btn btn--primary" id="save-announcements">Save chalkboard</button>
      </div>
      <div class="admin-preview" id="chalkboard-preview" aria-label="Chalkboard preview"></div>
    </div>
  `;
}

function renderRestaurantTab() {
  return `
    <div class="admin-panel">
      <p class="admin-panel__lead">Phone, address, social links, and where job applications are emailed.</p>
      <div class="admin-field">
        <label>Restaurant name</label>
        <input id="restaurant-name" value="${escapeHtml(restaurant.name || '')}" />
      </div>
      <div class="admin-field">
        <label>Phone</label>
        <input id="restaurant-phone" value="${escapeHtml(restaurant.phone || '')}" />
      </div>
      <div class="admin-field">
        <label>Phone (tel link)</label>
        <input id="restaurant-phone-tel" value="${escapeHtml(restaurant.phoneTel || '')}" />
      </div>
      <div class="admin-field">
        <label>Street</label>
        <input id="restaurant-street" value="${escapeHtml(restaurant.address?.street || '')}" />
      </div>
      <div class="admin-field">
        <label>City</label>
        <input id="restaurant-city" value="${escapeHtml(restaurant.address?.city || '')}" />
      </div>
      <div class="admin-field">
        <label>State</label>
        <input id="restaurant-state" value="${escapeHtml(restaurant.address?.state || '')}" />
      </div>
      <div class="admin-field">
        <label>ZIP</label>
        <input id="restaurant-zip" value="${escapeHtml(restaurant.address?.zip || '')}" />
      </div>
      <div class="admin-field">
        <label>Job applications email</label>
        <input id="restaurant-applications-email" type="email" value="${escapeHtml(restaurant.applicationsEmail || '')}" />
      </div>
      <div class="admin-field">
        <label>Contact email</label>
        <input id="restaurant-contact-email" type="email" value="${escapeHtml(restaurant.contactEmail || '')}" />
      </div>
      <div class="admin-field">
        <label>Order online URL</label>
        <input id="restaurant-order-url" value="${escapeHtml(restaurant.orderOnlineUrl || '')}" />
      </div>
      <div class="admin-actions">
        <button type="button" class="btn btn--primary" id="save-restaurant">Save restaurant info</button>
      </div>
    </div>
  `;
}

function renderHoursTab() {
  const rows = hours.schedule
    .map(
      (row, index) => `
        <div class="admin-hours-row" data-hours-index="${index}">
          <div class="admin-field">
            <label>Days</label>
            <input data-hours-field="days" data-hours-index="${index}" value="${escapeHtml(row.days)}" />
          </div>
          <div class="admin-field">
            <label>Hours</label>
            <input data-hours-field="hours" data-hours-index="${index}" value="${escapeHtml(row.hours)}" />
          </div>
          <button type="button" class="btn btn--ghost" data-remove-hours="${index}">Remove</button>
        </div>
      `,
    )
    .join('');

  return `
    <div class="admin-panel">
      <p class="admin-panel__lead">Hours shown on the homepage and location page.</p>
      <div id="hours-rows">${rows}</div>
      <div class="admin-field">
        <label>Footer note (optional)</label>
        <input id="hours-disclaimer" value="${escapeHtml(hours.covidDisclaimer || '')}" />
      </div>
      <div class="admin-actions">
        <button type="button" class="btn btn--outline" id="add-hours-row">Add row</button>
        <button type="button" class="btn btn--primary" id="save-hours">Save hours</button>
      </div>
    </div>
  `;
}

function renderPublishTab() {
  return `
    <div class="admin-panel">
      <p class="admin-panel__lead">Download updated JSON files, then replace the matching files in the <code>data/</code> folder and push to GitHub to publish live.</p>
      <div class="admin-actions">
        <button type="button" class="btn btn--primary" id="export-all">Download all content files</button>
        <button type="button" class="btn btn--outline" id="clear-drafts">Clear local drafts</button>
      </div>
      <p class="admin-help">
        <strong>How to publish:</strong><br />
        1. Save your changes in each tab.<br />
        2. Click <strong>Download all content files</strong>.<br />
        3. Replace <code>data/announcements.json</code>, <code>data/restaurant/restaurant-info.json</code>, and <code>data/restaurant/restaurant-hours.json</code> in the project.<br />
        4. Commit and push — GitHub Pages redeploys automatically.<br /><br />
        Job applications email to <strong>${escapeHtml(restaurant.applicationsEmail || restaurant.contactEmail || 'not set')}</strong> via FormSubmit once live.
      </p>
    </div>
  `;
}

function renderShell() {
  const status = statusMessage
    ? `<div class="admin-status admin-status--${statusType}" role="status">${escapeHtml(statusMessage)}</div>`
    : '';

  app.innerHTML = `
    <div class="admin-shell">
      <div class="admin-header">
        <div>
          <h1>Content Management</h1>
          <p class="admin-panel__lead">Gavino's Pizzeria website</p>
        </div>
        <div class="admin-actions">
          <a class="btn btn--outline" href="index.html">View site</a>
          <button type="button" class="btn btn--ghost" id="admin-logout">Sign out</button>
        </div>
      </div>
      ${status}
      <nav class="admin-tabs" aria-label="CMS sections">
        <button type="button" class="admin-tab${activeTab === 'chalkboard' ? ' is-active' : ''}" data-tab="chalkboard">Chalkboard</button>
        <button type="button" class="admin-tab${activeTab === 'restaurant' ? ' is-active' : ''}" data-tab="restaurant">Restaurant</button>
        <button type="button" class="admin-tab${activeTab === 'hours' ? ' is-active' : ''}" data-tab="hours">Hours</button>
        <button type="button" class="admin-tab${activeTab === 'publish' ? ' is-active' : ''}" data-tab="publish">Publish</button>
      </nav>
      <div id="admin-tab-panel">
        ${
          activeTab === 'chalkboard'
            ? renderChalkboardTab()
            : activeTab === 'restaurant'
              ? renderRestaurantTab()
              : activeTab === 'hours'
                ? renderHoursTab()
                : renderPublishTab()
        }
      </div>
    </div>
  `;

  bindShellEvents();
  if (activeTab === 'chalkboard') {
    renderChalkboard(announcements, document.getElementById('chalkboard-preview'));
  }
}

function readRestaurantFromForm() {
  const full = [
    document.getElementById('restaurant-street')?.value,
    document.getElementById('restaurant-city')?.value,
    `${document.getElementById('restaurant-state')?.value} ${document.getElementById('restaurant-zip')?.value}`.trim(),
  ]
    .filter(Boolean)
    .join(', ');

  return {
    ...restaurant,
    name: document.getElementById('restaurant-name').value.trim(),
    phone: document.getElementById('restaurant-phone').value.trim(),
    phoneTel: document.getElementById('restaurant-phone-tel').value.trim(),
    address: {
      street: document.getElementById('restaurant-street').value.trim(),
      city: document.getElementById('restaurant-city').value.trim(),
      state: document.getElementById('restaurant-state').value.trim(),
      zip: document.getElementById('restaurant-zip').value.trim(),
      full,
    },
    applicationsEmail: document.getElementById('restaurant-applications-email').value.trim(),
    contactEmail: document.getElementById('restaurant-contact-email').value.trim(),
    orderOnlineUrl: document.getElementById('restaurant-order-url').value.trim(),
    social: restaurant.social,
    mapsUrl: restaurant.mapsUrl,
  };
}

function bindShellEvents() {
  document.getElementById('admin-logout')?.addEventListener('click', () => {
    clearAdminSession();
    statusMessage = '';
    renderLogin();
  });

  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      activeTab = button.dataset.tab;
      statusMessage = '';
      render();
    });
  });

  document.getElementById('add-announcement')?.addEventListener('click', () => {
    announcements.push({
      id: newAnnouncementId(),
      title: '',
      body: '',
      active: true,
      type: 'general',
    });
    render();
  });

  document.getElementById('save-announcements')?.addEventListener('click', () => {
    syncAnnouncementsFromForm();
    saveCmsAnnouncements(announcements);
    setStatus('Chalkboard saved locally. Use Publish tab to download files for the live site.');
  });

  document.getElementById('save-restaurant')?.addEventListener('click', () => {
    restaurant = readRestaurantFromForm();
    saveCmsRestaurant(restaurant);
    setStatus('Restaurant info saved locally.');
  });

  document.getElementById('save-hours')?.addEventListener('click', () => {
    syncHoursFromForm();
    saveCmsHours(hours);
    setStatus('Hours saved locally.');
  });

  document.getElementById('add-hours-row')?.addEventListener('click', () => {
    syncHoursFromForm();
    hours.schedule.push({ days: '', hours: '' });
    render();
  });

  document.getElementById('export-all')?.addEventListener('click', async () => {
    if (document.getElementById('announcement-list')) syncAnnouncementsFromForm();
    if (document.getElementById('restaurant-name')) restaurant = readRestaurantFromForm();
    if (document.getElementById('hours-rows')) syncHoursFromForm();
    await exportAllCmsFiles(announcements, restaurant, hours);
    setStatus('Downloaded content files. Replace the files in data/ and push to GitHub.');
  });

  document.getElementById('clear-drafts')?.addEventListener('click', () => {
    clearCmsDrafts();
    setStatus('Local drafts cleared. Reloading from live files…', 'success');
    bootAdmin();
  });

  document.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => {
      syncAnnouncementsFromForm();
      announcements.splice(Number(button.dataset.remove), 1);
      render();
    });
  });

  document.querySelectorAll('[data-remove-hours]').forEach((button) => {
    button.addEventListener('click', () => {
      syncHoursFromForm();
      hours.schedule.splice(Number(button.dataset.removeHours), 1);
      render();
    });
  });

  document.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('change', () => syncAnnouncementsFromForm());
    input.addEventListener('input', () => {
      if (input.dataset.field === 'title' || input.dataset.field === 'body') {
        syncAnnouncementsFromForm();
        renderChalkboard(announcements, document.getElementById('chalkboard-preview'));
      }
    });
  });
}

function syncAnnouncementsFromForm() {
  document.querySelectorAll('.admin-card[data-index]').forEach((card) => {
    const index = Number(card.dataset.index);
    const item = announcements[index];
    if (!item) return;

    card.querySelectorAll('[data-field]').forEach((field) => {
      const key = field.dataset.field;
      if (field.type === 'checkbox') {
        item[key] = field.checked;
      } else {
        item[key] = field.value;
      }
    });
  });
}

function syncHoursFromForm() {
  if (!hours) return;
  hours.covidDisclaimer = document.getElementById('hours-disclaimer')?.value || '';
  hours.schedule = [...document.querySelectorAll('.admin-hours-row')].map((row) => ({
    days: row.querySelector('[data-hours-field="days"]')?.value || '',
    hours: row.querySelector('[data-hours-field="hours"]')?.value || '',
  }));
}

function render() {
  if (!isAdminAuthenticated()) {
    renderLogin();
    return;
  }
  renderShell();
}

async function bootAdmin() {
  [announcements, restaurant, hours] = await Promise.all([
    loadCmsAnnouncements(),
    loadCmsRestaurant(),
    loadCmsHours(),
  ]);
  statusMessage = '';
  render();
}

render();
