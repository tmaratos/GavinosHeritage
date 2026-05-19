import { cpSync, createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const rootDir = fileURLToPath(new URL('.', import.meta.url));

const MIME = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.css': 'text/css',
  '.js': 'text/javascript',
};

function serveStatic(route, dirName) {
  const base = resolve(rootDir, dirName);

  return {
    name: `serve-${dirName}`,
    configureServer(server) {
      server.middlewares.use(route, (req, res, next) => {
        const raw = decodeURIComponent((req.url || '/').split('?')[0]);
        const rel = raw.replace(/^\/+/, '');
        const file = resolve(base, rel);

        if (!file.startsWith(base) || !existsSync(file) || !statSync(file).isFile()) {
          return next();
        }

        const ext = extname(file).toLowerCase();
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },
  };
}

function copyStaticDirs() {
  return {
    name: 'copy-static-dirs',
    closeBundle() {
      const out = resolve(rootDir, 'dist');
      cpSync(resolve(rootDir, 'assets'), join(out, 'assets'), { recursive: true });
      cpSync(resolve(rootDir, 'data'), join(out, 'data'), { recursive: true });
    },
  };
}

const pageInputs = {
  main: resolve(rootDir, 'index.html'),
  menu: resolve(rootDir, 'menu.html'),
  about: resolve(rootDir, 'about.html'),
  location: resolve(rootDir, 'location.html'),
  contact: resolve(rootDir, 'contact.html'),
  employment: resolve(rootDir, 'employment.html'),
};

if (existsSync(resolve(rootDir, 'admin/index.html'))) {
  pageInputs.admin = resolve(rootDir, 'admin/index.html');
}

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

export default {
  root: rootDir,
  base: isGitHubPages ? '/Gavinos/' : '/',
  publicDir: false,
  plugins: [serveStatic('/assets', 'assets'), serveStatic('/data', 'data'), copyStaticDirs()],
  build: {
    rollupOptions: {
      input: pageInputs,
    },
  },
  server: {
    fs: { allow: [rootDir] },
  },
};
