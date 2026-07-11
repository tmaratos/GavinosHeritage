import adminConfig from '../../../data/admin/config.json';

const SESSION_KEY = 'gavinos-admin-session';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function isAdminAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function setAdminAuthenticated() {
  sessionStorage.setItem(SESSION_KEY, '1');
}

export function clearAdminSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function verifyAdminPassword(password) {
  const hash = await sha256(password);
  return hash === adminConfig.passwordHash;
}
