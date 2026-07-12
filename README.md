# Gavino's Pizzeria — Website

Mobile-first redesign of [gavinospizzeria.com](http://www.gavinospizzeria.com/). Brand colors, logo, menu PDFs, and photos are preserved.

## Local preview

```bash
npm install
npm run dev
```

Open **http://localhost:5173/**

CMS admin: **http://localhost:5173/admin.html** (password: `gavinos-admin`)

Preview exactly how GitHub Pages will look:

```bash
npm run preview:pages
```

Open **http://localhost:4173/GavinosHeritage/**

## Styles (where the CSS lives)

There is no `stylings.css`. Styles are in:

- `src/css/main.css` — design tokens (heritage theme), header, footer, buttons, shared layout
- `src/css/heritage-home.css` — homepage sections (hero, menu highlights, timeline, family, reviews)
- `src/css/menu.css` — menu page
- `src/css/employment.css` — job application
- `src/css/chalkboard.css` — "Today's Board" specials chalkboard on all pages (mobile + desktop)
- `src/css/admin.css` — CMS admin panel

Vite bundles these into `dist/assets/*.css` when you build. **Do not deploy the repo root to the web** — only the built `dist/` folder.

## GitHub Pages (preview URL)

**Live preview:** https://tmaratos.github.io/GavinosHeritage/

### One-time setup in GitHub

1. Open **Settings → Pages**
2. Under **Build and deployment → Source**, select **GitHub Actions** (not “Deploy from a branch”)
3. Push to `main` — the **Publish site** workflow builds and deploys automatically

If the site looks like plain black text, Pages is still serving source files from the repo root. Switch the source to **GitHub Actions** and re-run the workflow from the **Actions** tab.

### Production domain

When ready to replace the live site, point **gavinospizzeria.com** DNS at your host and deploy the `dist/` folder (or connect the custom domain in GitHub Pages settings).

## Content management (CMS)

Open **`/admin.html`** on the site to manage:

| Tab | What you can edit |
|-----|-------------------|
| **Chalkboard** | Announcements shown on every page (mobile + desktop chalkboard design) |
| **Restaurant** | Phone, address, social, **job application email** |
| **Hours** | Weekly schedule and footer note |
| **Publish** | Download updated JSON files to commit and deploy |

**Default password:** `gavinos-admin` — change the hash in `data/admin/config.json` for production.

**Publishing workflow:** Save in each tab → **Download all content files** → replace files in `data/` → commit and push to `main`.

## Content files (manual edit)

| What | File |
|------|------|
| Hours | `data/restaurant/restaurant-hours.json` |
| Phone, address, social, emails | `data/restaurant/restaurant-info.json` |
| Chalkboard | `data/announcements.json` |
| Menu PDF links | `data/menus/menu-pdfs.json` |
| PDF files | `assets/pdfs/menus/` |
| Logo & images | `assets/images/` |

## Job applications

Applications submit to the **applications email** in `data/restaurant/restaurant-info.json` via [FormSubmit.co](https://formsubmit.co). The first submission triggers a confirmation email to that address — click the link to activate.

## Build for production

```bash
npm run build          # local / custom host (base /)
npm run build:pages    # GitHub Pages (base /GavinosHeritage/)
```

Output is in `dist/`.
