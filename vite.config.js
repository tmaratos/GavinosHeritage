import { cpSync, createReadStream, existsSync, statSync, writeFileSync } from 'node:fs';
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
};

const pages = {
  main: resolve(rootDir, 'index.html'),
  menu: resolve(rootDir, 'menu.html'),
  about: resolve(rootDir, 'about.html'),
  location: resolve(rootDir, 'location.html'),
  contact: resolve(rootDir, 'contact.html'),
  employment: resolve(rootDir, 'employment.html'),
  admin: resolve(rootDir, 'admin.html'),
};

function serveDir(route, dirName) {
  const base = resolve(rootDir, dirName);

  return {
    name: `serve-${dirName}`,
    apply: 'serve',
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

function copyStaticToDist() {
  return {
    name: 'copy-static-to-dist',
    closeBundle() {
      const out = resolve(rootDir, 'dist');
      cpSync(resolve(rootDir, 'assets'), join(out, 'assets'), { recursive: true });
      cpSync(resolve(rootDir, 'data'), join(out, 'data'), { recursive: true });
      writeFileSync(join(out, '.nojekyll'), '');
    },
  };
}

export default {
  root: rootDir,
  base: process.env.VITE_BASE || '/',
  publicDir: false,
  plugins: [serveDir('/assets', 'assets'), serveDir('/data', 'data'), copyStaticToDist()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input: pages },
  },
};
