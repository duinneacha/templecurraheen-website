# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website documenting the historical heritage of Templecurraheen Graveyard, built with **Eleventy 3.x** (11ty) and **Tailwind CSS 3.x**. Templating uses **Nunjucks** (.njk). Deployed to GitHub Pages via GitHub Actions on push to `main`.

## Commands

- **`npm start`** - Development server (Tailwind watch + Eleventy serve, concurrent). **Always use this**, not `npm run dev`, which skips CSS compilation.
- **`npm run build`** - Production build (Tailwind minified CSS + Eleventy)
- **`npm run deploy`** - Build and deploy to GitHub Pages via gh-pages

The dev server runs at `http://localhost:8080/`. The `pathPrefix` is `/templecurraheen-website/` (configured in eleventy.config.js), so all URLs use the `| url` filter in templates.

## Architecture

### Data Flow

The burial records are the core data. The primary data source is a CSV file at `assets/list/templecurraheen_stones_and_registers.csv`. This is parsed at build time by `src/_data/burialList.js`, which reads the CSV, maps columns by header name, formats dates, assigns row-code colors, and exports an array of burial objects. Templates access this as `burialList`.

There is also a legacy `src/_data/burials.tsv` file (referenced in README but the active data pipeline uses the CSV).

### Eleventy Configuration (eleventy.config.js)

- **Input**: `src/` | **Output**: `_site/` | **Layouts**: `src/_layouts/` | **Data**: `src/_data/`
- Passthrough copy: `assets/` (images, CSV data)
- Custom filters: `sortAlphabetical`, `sortByDate`, `date`, `truncate`, `stringify`, `slug`
- Custom shortcode: `image` (lazy-loaded img tag)
- Template formats: md, njk, html (all processed through Nunjucks)

### Key Templates

- `src/_layouts/base.njk` - Base HTML shell with nav (Home, Burial List, Gallery, Stories, About) and footer
- `src/_layouts/history.njk` - Layout for story/history pages
- `src/burials/index.njk` - Main burial records page with client-side search, sort, and row filtering
- `src/gallery/index.njk` - Photo gallery with category filtering and lightbox
- `src/stories/*.njk` - Individual history/story pages

### Data Files

- `src/_data/burialList.js` - Parses CSV into burial record objects with fields: graveCode, rowCode, plotCode, firstName, lastName, fullName, deathDate, age, namesOnHeadstone, fileName, stoneInscription, stoneDesign, headstoneShape, etc.
- `src/_data/gallery.json` - Gallery image metadata with categories: general, headstones, historical
- `src/_data/helpers.js` - Utility functions (year, dateToFormat, formatName, calculateAge)

### Static Assets

- `assets/imgs/` - General site images
- `assets/imgs/graves/` - Individual grave photos, named by plot code (e.g., `b6e.jpg`, `k78.jpg`)
- `assets/list/` - CSV data file and duplicate reports

### CSS

Tailwind CSS with custom color palette. Source is `src/css/styles.css` with `@tailwind` directives and `@apply`-based component classes (`.btn`, `.btn-primary`, `.btn-secondary`, `.card`, `.grave-card`, `.gallery-grid`, `.masonry-item`). Compiled output goes to `_site/css/styles.css`. Custom colors defined in `tailwind.config.js`: primary (purple), secondary (slate), accent (fuchsia). Fonts: Georgia serif, Inter sans-serif.

### Scripts

- `scripts/find_duplicates.py` - Python script for finding duplicate burial records
