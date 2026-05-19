export const baseUrl = import.meta.env.BASE_URL;

export function assetUrl(path) {
  const clean = String(path).replace(/^\//, '');
  return `${baseUrl}${clean}`;
}

export function pageUrl(path = '') {
  if (!path || path === '/') return baseUrl;
  const clean = String(path).replace(/^\//, '');
  return `${baseUrl}${clean}`;
}
