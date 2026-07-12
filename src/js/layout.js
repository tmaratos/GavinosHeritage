import restaurantInfo from '../../data/restaurant/restaurant-info.json';
import hoursData from '../../data/restaurant/restaurant-hours.json';
import { pageUrl } from './base.js';
import { injectFavicon } from './favicon.js';

const NAV_LINKS = [
  { href: pageUrl(), label: 'Home', page: 'home' },
  { href: pageUrl('menu.html'), label: 'Menu', page: 'menu' },
  { href: pageUrl('about.html'), label: 'Our Story', page: 'about' },
  { href: pageUrl('location.html'), label: 'Location', page: 'location' },
  { href: pageUrl('contact.html'), label: 'Contact', page: 'contact' },
  { href: pageUrl('employment.html'), label: 'Careers', page: 'employment' },
];

const UTENSILS_ICON = `<svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2.5v5M9 2.5v5M6 7.2h3M7.5 3v18"/></g><path fill="currentColor" d="M16.4 2.5c-1.5 0-2.6 2.2-2.6 5 0 2.1.9 3.7 2.1 4.2V21.5h1.1V2.5h-.6z"/></svg>`;

const ICON_PIN = `<svg class="footer-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2z"/></svg>`;
const ICON_PHONE = `<svg class="footer-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.3 1.1.4 2.4.6 3.6.6.6 0 1 .5 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z"/></svg>`;
const ICON_CLOCK = `<svg class="footer-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2" stroke-linecap="round"/></svg>`;
const ICON_FACEBOOK = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.12-2.4-.12-2.35 0-3.95 1.43-3.95 4.06v2.26H7.5V13h2.85v8h3.15z"/></svg>`;
const ICON_INSTAGRAM = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17" cy="7" r="1.15" fill="currentColor" stroke="none"/></svg>`;
const ICON_X = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 3h3l-6.55 7.5L21.7 21h-5.9l-4.3-5.65L6.5 21h-3l7-8L2.3 3h6l3.86 5.2L17.5 3zm-1.05 16h1.66L7.62 4.62H5.84L16.45 19z"/></svg>`;

function currentPage() {
  return document.body.dataset.page || 'home';
}

function brandMarkup() {
  return `
    <a href="${pageUrl()}" class="brand" aria-label="${restaurantInfo.name} — Home">
      <span class="brand__olive brand__olive--left" aria-hidden="true"></span>
      <span class="brand__text">
        <span class="brand__name">Gavino's</span>
        <span class="brand__sub">Italian Restaurant</span>
        <span class="brand__tag">A Little Italy Tradition</span>
      </span>
      <span class="brand__olive brand__olive--right" aria-hidden="true"></span>
    </a>
  `;
}

function navLinks(active) {
  return NAV_LINKS.map(
    ({ href, label, page }) => `
      <li>
        <a href="${href}"${page === active ? ' aria-current="page"' : ''}>${label}</a>
      </li>
    `,
  ).join('');
}

function buildHeader(active) {
  const orderBtn = (extra = '') =>
    `<a class="btn btn--order${extra}" href="${restaurantInfo.orderOnlineUrl}" target="_blank" rel="noopener noreferrer">${UTENSILS_ICON}<span>Order Online</span></a>`;

  return `
    <header class="site-header">
      <div class="site-header__brandrow">
        <div class="container">${brandMarkup()}</div>
      </div>
      <div class="site-header__bar">
        <div class="container site-header__bar-inner">
          <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
          <nav class="site-nav" aria-label="Main navigation">
            <ul>${navLinks(active)}</ul>
          </nav>
          ${orderBtn()}
        </div>
      </div>
      <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden>
        <div class="mobile-nav__panel container">
          <ul>${navLinks(active)}</ul>
          ${orderBtn(' mobile-nav__order')}
        </div>
      </nav>
    </header>
  `;
}

function buildFooter() {
  const year = new Date().getFullYear();
  const hoursRows = hoursData.schedule
    .map(({ days, hours }) => `<li><span>${days}</span><span>${hours}</span></li>`)
    .join('');

  return `
    <footer class="site-footer">
      <div class="site-footer__crest">
        <div class="container">
          <div class="footer-wordmark">
            <span class="footer-olive footer-olive--left" aria-hidden="true"></span>
            <span class="footer-wordmark__name">Gavino's</span>
            <span class="footer-olive footer-olive--right" aria-hidden="true"></span>
          </div>
          <p class="footer-wordmark__sub">Restaurant · Pizzeria</p>
          <p class="footer-wordmark__tag">Family owned. New York tradition. Since 1982.</p>
        </div>
      </div>

      <div class="site-footer__info">
        <div class="container footer-info__grid">
          <div class="footer-col">
            <p class="footer-line">${ICON_PIN}<a href="${restaurantInfo.mapsUrl}" target="_blank" rel="noopener noreferrer">${restaurantInfo.address.full}</a></p>
            <p class="footer-line">${ICON_PHONE}<a href="tel:${restaurantInfo.phoneTel}">${restaurantInfo.phone}</a></p>
            <div class="footer-line footer-line--hours">${ICON_CLOCK}<ul class="footer-hours">${hoursRows}</ul></div>
          </div>

          <nav class="footer-col footer-col--nav" aria-label="Footer navigation">
            <ul>${NAV_LINKS.map(({ href, label }) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul>
          </nav>

          <div class="footer-col footer-col--connect">
            <p class="footer-connect__label">Follow along</p>
            <div class="social-links">
              <a href="${restaurantInfo.social.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">${ICON_FACEBOOK}</a>
              <a href="${restaurantInfo.social.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${ICON_INSTAGRAM}</a>
              <a href="${restaurantInfo.social.twitter}" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">${ICON_X}</a>
            </div>
          </div>
        </div>

        <div class="container footer-bottom">
          <p class="footer-tagline">Buon appetito</p>
          <p class="copyright">© ${year} ${restaurantInfo.name}. All rights reserved.</p>
          <p class="site-credit">built by <a href="https://tristanmaratos.com/" target="_blank" rel="noopener noreferrer">Tristan Maratos</a></p>
        </div>
      </div>
    </footer>
  `;
}

export function renderSiteChrome() {
  injectFavicon();
  const active = currentPage();

  const headerMount = document.getElementById('site-header');
  if (headerMount) {
    headerMount.outerHTML = buildHeader(active);
    bindMobileNav();
  }

  const footerMount = document.getElementById('site-footer');
  if (footerMount) {
    footerMount.outerHTML = buildFooter();
  }
}

function bindMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.hidden = !open;
    mobileNav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}
