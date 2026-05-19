# Gavino's Pizzeria — Website Redesign

Modern, mobile-first rebuild of [gavinospizzeria.com](http://www.gavinospizzeria.com/) that **preserves** the existing Italian red/green identity, logo, and family-owned New York personality.

## Quick start

No `npm install` at the repo root is required if the Sentinel `app/` dependencies are already installed (scripts use `app/node_modules/vite`).

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

If Vite is missing, run `npm install` inside `app/` first.

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

## Deployment

Run `npm run build` and deploy the `dist/` folder to any static host (Netlify, Cloudflare Pages, S3, etc.).
