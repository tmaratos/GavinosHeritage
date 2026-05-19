# Gavino's Pizzeria — Website Redesign

Modern, mobile-first rebuild of [gavinospizzeria.com](http://www.gavinospizzeria.com/) that **preserves** the existing Italian red/green identity, logo, and family-owned New York personality.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

On Windows, if `npm install` fails with an SSL error, try:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm install
```

```bash
npm run build   # output in dist/
npm run preview # preview production build
```

## Project structure

```
assets/                 # Static files (images, PDFs, fonts, icons)
  images/
    food/               # Dish photography
    hero/               # Hero backgrounds
    logo/               # logo.png (add official logo here)
    interior/ gallery/  # Restaurant & atmosphere
  pdfs/
    menus/ catering/ employment/

data/
  menus/                # JSON menu content (edit here, not in HTML)
  restaurant/           # Hours, contact, social, order URL
  announcements.json    # Homepage chalkboard announcements

src/
  css/                  # Design system + menu styles
  js/                   # Layout, menu renderer, shared behavior

index.html              # Home
menu.html               # Interactive menu
about.html location.html contact.html
admin/index.html        # Announcements admin (stub auth)
```

## Updating content

| What | Where |
|------|--------|
| Menu items & prices | `data/menus/dinner-menu.json`, `lunch-menu.json`, `catering-menu.json` |
| Homepage announcements (chalkboard) | `data/announcements.json` — or use the admin UI (see below) |
| Hours | `data/restaurant/restaurant-hours.json` |
| Phone, address, order link | `data/restaurant/restaurant-info.json` |
| PDF downloads | Add files under `assets/pdfs/…` and update `data/menus/menu-pdfs.json` |
| Logo | `assets/images/logo/logo.png` |
| Food photos | `assets/images/food/` — set `"image"` on menu items |

## Announcements admin

Manage the homepage chalkboard at **`/admin/`** (dev: `http://localhost:5173/admin/`).

The admin UI supports creating, editing, deleting, previewing, and publishing announcements. For now:

- **Login is a stub** — any sign-in works locally; production needs real auth.
- **Edits persist in browser localStorage** as a draft (`gavinos-announcements-draft`).
- **Export JSON** downloads the current list — replace `data/announcements.json` in the repo and redeploy to publish.
- **Reset draft** reloads from the bundled JSON file.

The public homepage reads `data/announcements.json` at build time and shows only **active** items within optional `startDate` / `endDate` ranges. Future production setup: authenticated API + database instead of manual JSON deploy.

Menu JSON uses **placeholder** items and prices marked with `TODO` — replace with official data from the current PDFs.

## Design notes

- Brand colors from the live site: green `#03822a`, red `#ba1912`, dark green `#045c1f`
- Typography: Playfair Display (headings) + Source Sans 3 (body)
- Mobile: sticky header, hamburger nav, bottom **Order Online** CTA
- Menu: tabbed Dinner / Lunch / Catering, category jump nav, card layout, PDF fallback links

## GitHub Pages preview

Preview URL: **https://tmaratos.github.io/Gavinos/**

This project does **not** use a file named `stylings.css`. Styles live in source here:

```
src/css/main.css          — layout, header, hero, footer, mobile
src/css/menu.css          — menu page
src/css/employment.css    — job application form
src/css/chalkboard.css    — homepage announcements board
```

GitHub’s file list only shows **source** files. When the site is built, Vite bundles those into `docs/assets/*.css` (generated on each deploy — you will see a `docs/` folder appear after the workflow runs).

### Pages settings (required)

In **Settings → Pages → Build and deployment**:

1. **Source:** Deploy from a branch  
2. **Branch:** `main`  
3. **Folder:** `/docs`

The **Deploy GitHub Pages** workflow builds the site and updates the `docs/` folder automatically on each push.

If the site looks unstyled (plain black text), Pages is pointing at the repo root instead of `/docs`, or the workflow has not finished yet. Check the **Actions** tab for a green checkmark.

## Deployment

Run `npm run build` and deploy the `dist/` folder to any static host (Netlify, Cloudflare Pages, S3, etc.).
