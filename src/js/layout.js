import restaurantInfo from '../../data/restaurant/restaurant-info.json';
import { assetUrl, pageUrl } from './base.js';

const NAV_LINKS = [
  { href: pageUrl(), label: 'Home', page: 'home' },
  { href: pageUrl('about.html'), label: 'About', page: 'about' },
  { href: pageUrl('menu.html'), label: 'Menus', page: 'menu' },
  { href: pageUrl('employment.html'), label: 'Apply', page: 'employment' },
  { href: pageUrl('location.html'), label: 'Location', page: 'location' },
  { href: pageUrl('contact.html'), label: 'Contact', page: 'contact' },
];

function currentPage() {
  return document.body.dataset.page || 'home';
}

function logoMarkup() {
  return `
    <a href="${pageUrl()}" class="logo-link" aria-label="${restaurantInfo.name} — Home">
      <img
        src="${assetUrl('assets/images/logo/logo.png')}"
        alt="Gavino's Restaurant Pizzeria"
        width="200"
        height="80"
        onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='${assetUrl('assets/images/logo/logo.svg')}'}else{this.hidden=true;this.nextElementSibling.hidden=false}"
      />
      <span class="logo-fallback" hidden>
        <span class="logo-g">GAV</span><span class="logo-r">I</span><span class="logo-g">NO</span><span class="logo-r">'</span><span class="logo-g">S</span>
        <small>RESTAURANT · PIZZERIA</small>
      </span>
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
  return `
    <header class="site-header">
      <div class="container site-header__inner">
        ${logoMarkup()}
        <nav class="site-nav" aria-label="Main navigation">
          <ul>${navLinks(active)}</ul>
        </nav>
        <div class="header-actions">
          <a class="btn btn--primary btn--primary-desktop" href="${restaurantInfo.orderOnlineUrl}" target="_blank" rel="noopener noreferrer">Order Online</a>
          <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <nav id="mobile-nav" class="mobile-nav container" aria-label="Mobile navigation" hidden>
        <ul>${navLinks(active)}</ul>
      </nav>
    </header>
  `;
}

function buildFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <h4>${restaurantInfo.name}</h4>
            <p>
              <a href="${restaurantInfo.mapsUrl}" target="_blank" rel="noopener noreferrer">${restaurantInfo.address.full}</a>
            </p>
            <p>
              <a href="tel:${restaurantInfo.phoneTel}">${restaurantInfo.phone}</a>
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul class="footer-nav">
              ${NAV_LINKS.map(({ href, label }) => `<li><a href="${href}">${label}</a></li>`).join('')}
            </ul>
          </div>
          <div>
            <h4>Connect</h4>
            <div class="social-links">
              <a href="${restaurantInfo.social.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="${restaurantInfo.social.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="${restaurantInfo.social.twitter}" target="_blank" rel="noopener noreferrer">Twitter</a>
            </div>
          </div>
        </div>
        <p class="copyright">© ${year} ${restaurantInfo.name}. All rights reserved.</p>
      </div>
    </footer>
  `;
}

function buildStickyCta() {
  return `
    <div class="sticky-order-cta" id="sticky-order-cta">
      <a class="btn btn--primary" href="${restaurantInfo.orderOnlineUrl}" target="_blank" rel="noopener noreferrer">Order Online</a>
    </div>
  `;
}

export function renderSiteChrome() {
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

  let sticky = document.getElementById('sticky-order-cta');
  if (!sticky) {
    sticky = document.createElement('div');
    sticky.id = 'sticky-order-cta';
    document.body.appendChild(sticky);
  }
  sticky.outerHTML = buildStickyCta();

  const mq = window.matchMedia('(max-width: 767px)');
  const updateSticky = () => {
    document.body.classList.toggle('has-sticky-cta', mq.matches);
  };
  updateSticky();
  mq.addEventListener('change', updateSticky);
}

function bindMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    mobileNav.hidden = open;
    mobileNav.classList.toggle('is-open', !open);
  });
}
