import { renderSiteChrome } from './layout.js';
import { assetUrl } from './base.js';
import dinnerMenu from '../../data/menus/dinner-menu.json';
import lunchMenu from '../../data/menus/lunch-menu.json';
import cateringMenu from '../../data/menus/catering-menu.json';
import menuPdfs from '../../data/menus/menu-pdfs.json';

const MENUS = {
  dinner: dinnerMenu,
  lunch: lunchMenu,
  catering: cateringMenu,
};

let activeMenuId = 'dinner';

function formatPrice(price) {
  if (!price) return '';
  return String(price).replace(/^\$/, '');
}

function itemHasImage(item) {
  return Boolean(item.image);
}

function renderMenuItem(item) {
  const hasImage = itemHasImage(item);
  const imageHtml = hasImage
    ? `<div class="menu-card__image">
      <img src="${item.image}" alt="" loading="lazy" onerror="this.parentElement.remove()" />
    </div>`
    : '';

  return `
    <article class="menu-card${hasImage ? ' menu-card--has-image' : ''}">
      ${imageHtml}
      <div class="menu-card__body">
        <div class="menu-card__head">
          <h3 class="menu-card__name">${item.name}</h3>
          ${item.price ? `<span class="menu-card__price">${formatPrice(item.price)}</span>` : ''}
        </div>
        ${item.description ? `<p class="menu-card__description">${item.description}</p>` : ''}
      </div>
    </article>
  `;
}

function renderSection(section) {
  return `
    <section class="menu-section fade-in" id="${section.id}" aria-labelledby="heading-${section.id}">
      <header class="menu-section__header">
        <h2 id="heading-${section.id}">${section.name}</h2>
        ${section.description ? `<p>${section.description}</p>` : ''}
      </header>
      <div class="menu-grid">
        ${section.items.map(renderMenuItem).join('')}
      </div>
    </section>
  `;
}

function renderMenu(menu) {
  const mount = document.getElementById('menu-sections');
  if (!mount) return;

  document.getElementById('menu-page-title').textContent = menu.title;
  document.getElementById('menu-page-subtitle').textContent =
    menu.subtitle || '';

  mount.innerHTML = menu.sections.map(renderSection).join('');
  renderCategoryNav(menu);
  initFadeIn();
}

function renderCategoryNav(menu) {
  const nav = document.getElementById('menu-category-nav');
  if (!nav) return;

  nav.innerHTML = menu.sections
    .map(
      (section) =>
        `<a href="#${section.id}" data-category="${section.id}">${section.name}</a>`,
    )
    .join('');

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.category);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      nav.querySelectorAll('a').forEach((a) => a.classList.remove('is-active'));
      link.classList.add('is-active');
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          nav.querySelectorAll('a').forEach((a) => {
            a.classList.toggle('is-active', a.dataset.category === id);
          });
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
    );

    menu.sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });
  }
}

function renderPdfLinks() {
  const list = document.getElementById('pdf-links');
  if (!list) return;

  list.innerHTML = (menuPdfs.links || menuPdfs.downloads || [])
    .map((pdf) => {
      const href = pdf.legacyUrl || assetUrl(String(pdf.file).replace(/^\//, ''));
      return `<li><a href="${href}" target="_blank" rel="noopener noreferrer">${pdf.label}</a></li>`;
    })
    .join('');
}

function bindMenuTabs() {
  const tabs = document.querySelectorAll('.menu-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const menuId = tab.dataset.menu;
      if (!MENUS[menuId]) return;

      activeMenuId = menuId;
      tabs.forEach((t) => {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });

      renderMenu(MENUS[menuId]);
    });
  });
}

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
    { threshold: 0.08 },
  );

  document.querySelectorAll('.menu-section.fade-in').forEach((el) => {
    el.classList.remove('is-visible');
    observer.observe(el);
  });
}

renderSiteChrome();
renderPdfLinks();
bindMenuTabs();
renderMenu(MENUS[activeMenuId]);
