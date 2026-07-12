import '../css/main.css';
import '../css/italian.css';
import '../css/chalkboard.css';
import '../css/heritage-home.css';
import { renderSiteChrome } from './layout.js';
import { initChalkboard } from './announcements.js';
import { initHeroCarousel } from './hero.js';
import { loadRestaurantInfo, loadHours } from './site-content.js';

function initFadeIn() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('.fade-in').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
}

async function renderHours() {
  const mount = document.getElementById('hours-list');
  if (!mount) return;

  const hoursData = await loadHours();
  mount.innerHTML = hoursData.schedule
    .map(
      ({ days, hours }) => `
        <li>
          <span>${days}</span>
          <span>${hours}</span>
        </li>
      `,
    )
    .join('');

  const note = document.getElementById('hours-note');
  if (note && hoursData.covidDisclaimer) {
    note.textContent = hoursData.covidDisclaimer;
  } else if (note) {
    note.hidden = true;
  }
}

async function hydrateContact() {
  const restaurantInfo = await loadRestaurantInfo();

  document.querySelectorAll('[data-phone]').forEach((el) => {
    const isQuickBar = el.classList.contains('quick-bar__item');
    el.textContent = isQuickBar ? `Call ${restaurantInfo.phone}` : restaurantInfo.phone;
    if (el.tagName === 'A') el.href = `tel:${restaurantInfo.phoneTel}`;
  });

  document.querySelectorAll('[data-address]').forEach((el) => {
    el.textContent = restaurantInfo.address.full;
    if (el.tagName === 'A' && restaurantInfo.mapsUrl) el.href = restaurantInfo.mapsUrl;
  });

  document.querySelectorAll('[data-email]').forEach((el) => {
    const email = restaurantInfo.contactEmail || restaurantInfo.applicationsEmail;
    if (!email) return;
    el.textContent = email;
    if (el.tagName === 'A') el.href = `mailto:${email}`;
  });
}

renderSiteChrome();
initChalkboard();
initHeroCarousel();
renderHours();
hydrateContact();
initFadeIn();
