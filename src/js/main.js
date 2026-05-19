import { renderSiteChrome } from './layout.js';
import { initHomepageChalkboard } from './announcements.js';
import restaurantInfo from '../../data/restaurant/restaurant-info.json';
import hoursData from '../../data/restaurant/restaurant-hours.json';

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

function renderHours() {
  const mount = document.getElementById('hours-list');
  if (!mount) return;

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
  }
}

function hydrateContact() {
  document.querySelectorAll('[data-phone]').forEach((el) => {
    el.textContent = restaurantInfo.phone;
    if (el.tagName === 'A') el.href = `tel:${restaurantInfo.phoneTel}`;
  });

  document.querySelectorAll('[data-address]').forEach((el) => {
    el.textContent = restaurantInfo.address.full;
  });
}

renderSiteChrome();
initHomepageChalkboard();
renderHours();
hydrateContact();
initFadeIn();
