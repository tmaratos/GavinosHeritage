import { assetUrl } from './base.js';

const FAVICON_PATHS = {
  svg: 'assets/images/logo/favicon.svg',
  png: 'assets/images/logo/favicon.png',
  apple: 'assets/images/logo/apple-touch-icon.png',
};

export function injectFavicon() {
  if (document.querySelector('link[rel="icon"][data-gavinos-favicon]')) return;

  const head = document.head;
  const links = [
    { rel: 'icon', type: 'image/svg+xml', href: FAVICON_PATHS.svg },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: FAVICON_PATHS.png },
    { rel: 'apple-touch-icon', sizes: '180x180', href: FAVICON_PATHS.apple },
  ];

  links.forEach(({ rel, type, sizes, href }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = assetUrl(href);
    link.dataset.gavinosFavicon = 'true';
    if (type) link.type = type;
    if (sizes) link.sizes = sizes;
    head.appendChild(link);
  });
}
