# gigi-static (`@gigi/web-static`)

The Gigi Pizzeria **static site**. Follows the FERRY `web-static` pattern: a Vite
build that copies the root assets and **injects the Runtime Module Composition
import map — generated from the shared manifest — into `index.html` at build
time**. Deploys on **Cloudflare Pages**.

## Layout

```
src/
  index.html         # the Vite HTML entry — import map injected here at build
  menu.html          # copied verbatim to dist/
  css/  images/       # site assets (root-absolute refs: /css/…, /images/…)
  favicon.ico
vite.config.mjs      # copySourceTree + includeRuntimeImportMap({ manifest, environment })
```

`vite build` → `dist/`:
- `index.html` with the `<script type="importmap">` inlined from
  `@gigi/runtime-manifest` (`@gigi/…` → assets origin, `@esm.sh/…` → esm.sh).
- the source tree (`css/`, `images/`, `menu.html`, `favicon.ico`) copied to the
  output root.

## Cloudflare Pages settings

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** 22 (`.nvmrc`)
- **Environment:** `CF_PAGES_BRANCH` is injected by Pages — `main` → `production`,
  any other branch → `preview` (selects the manifest environment for the import
  map). Optional overrides: `GIGI_SITE_ORIGIN`, `GIGI_ASSETS_ORIGIN`.

## Manifest dependency (IMPORTANT for Cloudflare)

Cloudflare Pages builds this repo **in isolation**, so it cannot resolve a local
`file:` path to the sibling `gigi-manifest`. Like FERRY's `web-static`, the
manifest must be a **git (or published) dependency**:

```jsonc
// package.json devDependencies — REQUIRED before connecting Cloudflare Pages
"@gigi/runtime-manifest": "git+https://github.com/<org>/gigi-manifest.git#<tag>"
```

> Currently `package.json` uses `file:../gigi-manifest` so the build could be
> verified locally. Switch it to the git dependency above (and push/tag
> `gigi-manifest` on GitHub) before wiring the Cloudflare Pages project.

The lockfile is intentionally not committed (Pages uses `npm install`), matching
the web-static convention.
